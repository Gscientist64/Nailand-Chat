from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
import re

from app.models.community import Community, CommunityMember, CommunityPost
from app.models.user import User

def _normalize_slug(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9-]+", "-", value.strip().lower())
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    return cleaned[:180] if cleaned else "community"

def _ensure_unique_slug(db: Session, base_slug: str) -> str:
    slug = base_slug
    suffix = 1
    while db.query(Community).filter(Community.slug == slug).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1
    return slug

def get_community_by_id(db: Session, community_id: str) -> Optional[Community]:
    return db.query(Community).filter(Community.id == community_id).first()

def is_community_member(db: Session, community_id: str, user_id: Optional[str]) -> bool:
    if not user_id:
        return False
    return db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == user_id
    ).count() > 0

def search_communities(
    db: Session,
    query_text: str,
    current_user: Optional[User] = None,
    limit: int = 20
) -> List[Community]:
    query = db.query(Community)
    public_filter = Community.is_private == False

    if current_user:
        member_ids = db.query(CommunityMember.community_id).filter(
            CommunityMember.user_id == current_user.id
        ).subquery()
        query = query.filter(
            or_(
                public_filter,
                Community.id.in_(member_ids)
            )
        )
    else:
        query = query.filter(public_filter)

    query = query.filter(
        or_(
            Community.name.ilike(f"%{query_text}%"),
            Community.description.ilike(f"%{query_text}%")
        )
    )

    return query.order_by(Community.member_count.desc(), Community.created_at.desc()).limit(limit).all()

def get_community_posts(db: Session, community: Community, current_user: Optional[User] = None) -> List[CommunityPost]:
    if community.is_private and not is_community_member(db, community.id, current_user.id if current_user else None):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Community posts are only available to members"
        )

    return db.query(CommunityPost).filter(
        CommunityPost.community_id == community.id
    ).order_by(CommunityPost.created_at.desc()).all()

def create_community_post(db: Session, community: Community, user: User, content: str, media_urls: Optional[List[str]] = None) -> CommunityPost:
    if community.is_private and not is_community_member(db, community.id, user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member to post in this community"
        )

    new_post = CommunityPost(
        community_id=community.id,
        user_id=user.id,
        content=content.strip(),
        media_urls=media_urls or []
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

def leave_community(db: Session, community: Community, user: User) -> None:
    membership = db.query(CommunityMember).filter(
        CommunityMember.community_id == community.id,
        CommunityMember.user_id == user.id
    ).first()

    if membership:
        db.delete(membership)
        if community.member_count is None:
            community.member_count = 0
        else:
            community.member_count = max(0, community.member_count - 1)
        db.commit()

def join_community(db: Session, community: Community, user: User) -> CommunityMember:
    existing = db.query(CommunityMember).filter(
        CommunityMember.community_id == community.id,
        CommunityMember.user_id == user.id
    ).first()
    if existing:
        return existing

    membership = CommunityMember(
        community_id=community.id,
        user_id=user.id,
        role="member"
    )
    community.member_count = (community.member_count or 0) + 1
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

def create_community(db: Session, user: User, name: str, description: Optional[str], is_private: bool, cover_image_url: Optional[str] = None) -> Community:
    existing = db.query(Community).filter(func.lower(Community.name) == name.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A community with this name already exists"
        )

    base_slug = _normalize_slug(name)
    slug = _ensure_unique_slug(db, base_slug)

    new_community = Community(
        name=name.strip(),
        slug=slug,
        description=description.strip() if description else None,
        is_private=is_private,
        cover_image_url=cover_image_url,
        created_by=user.id,
        member_count=1
    )
    db.add(new_community)
    db.commit()
    db.refresh(new_community)

    membership = CommunityMember(
        community_id=new_community.id,
        user_id=user.id,
        role="moderator"
    )
    db.add(membership)
    db.commit()
    return new_community

#(MimieDev)  I added  the 2 new service functions to community_service.py:


from app.models.community import Community, CommunityMember
from sqlalchemy import desc

def get_user_communities(db: Session, current_user: User):
    """
    Returns all communities the user has joined.
    Joins the CommunityMember table to find communities
    where the user_id matches the logged-in user.
    """
    communities = (
        db.query(Community)
        .join(CommunityMember, CommunityMember.community_id == Community.id)
        .filter(CommunityMember.user_id == current_user.id)
        .all()
    )
    return communities


def get_trending_communities(
    db: Session,
    current_user,
    limit: int = 20,
    region: str = None
):
    """
    Returns communities sorted by member_count descending.
    Optionally filtered by region if provided.
    """
    query = db.query(Community).filter(Community.is_private == False)

    if region:
        query = query.filter(Community.region == region)

    communities = (
        query
        .order_by(desc(Community.member_count))
        .limit(limit)
        .all()
    )
    return communities
