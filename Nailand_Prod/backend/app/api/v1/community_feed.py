# backend/app/api/v1/community_feed.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.community import Community, CommunityPost, CommunityPostLike, CommunityMember
from app.models.dashboard import Collaboration, SkillRequest
from app.schemas.community_feed import (
    CommunityPostResponse, CreateCommunityPostRequest, 
    LikeResponse, FeedItemResponse, FeedType
)

router = APIRouter(prefix="/communities", tags=["community-feed"])

# ─────────────────────────────────────────────────────────────────
# POSTS CRUD
# ─────────────────────────────────────────────────────────────────

@router.get("/{community_id}/posts", response_model=List[CommunityPostResponse])
async def get_community_posts(
    community_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all posts in a community"""
    
    # Check if user is a member (for private communities)
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    if community.is_private:
        is_member = db.query(CommunityMember).filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Private community - must be a member")
    
    posts = db.query(CommunityPost).filter(
        CommunityPost.community_id == community_id
    ).order_by(desc(CommunityPost.created_at)).offset(offset).limit(limit).all()
    
    # Add is_liked flag
    result = []
    for post in posts:
        is_liked = db.query(CommunityPostLike).filter(
            CommunityPostLike.post_id == post.id,
            CommunityPostLike.user_id == current_user.id
        ).first() is not None
        result.append({
            **post.__dict__,
            "is_liked": is_liked,
            "author_name": f"{post.author.first_name} {post.author.last_name}" if post.author else "Unknown",
            "author_rating": post.author.profile.rating if post.author and post.author.profile else 0
        })
    
    return result


@router.post("/{community_id}/posts", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
async def create_community_post(
    community_id: uuid.UUID,
    post_data: CreateCommunityPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post in a community"""
    
    # Check if user is a member
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    if community.is_private:
        is_member = db.query(CommunityMember).filter(
            CommunityMember.community_id == community_id,
            CommunityMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Must be a member to post")
    
    new_post = CommunityPost(
        community_id=community_id,
        user_id=current_user.id,
        content=post_data.content,
        media_urls=post_data.media_urls or []
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        **new_post.__dict__,
        "is_liked": False,
        "author_name": f"{current_user.first_name} {current_user.last_name}",
        "author_rating": current_user.profile.rating if current_user.profile else 0
    }


@router.post("/posts/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post"""
    
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing_like = db.query(CommunityPostLike).filter(
        CommunityPostLike.post_id == post_id,
        CommunityPostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": post.likes_count}
    else:
        # Like
        new_like = CommunityPostLike(
            post_id=post_id,
            user_id=current_user.id
        )
        db.add(new_like)
        post.likes_count = (post.likes_count or 0) + 1
        db.commit()
        return {"liked": True, "likes_count": post.likes_count}


@router.get("/{community_id}/feed", response_model=List[FeedItemResponse])
async def get_community_feed(
    community_id: uuid.UUID,
    feed_type: FeedType = Query("posts", description="posts, collaborations, skills, or all"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unified feed for a community (posts + collabs + skill requests)"""
    
    items = []
    
    # Get posts
    if feed_type in ["posts", "all"]:
        posts = db.query(CommunityPost).filter(
            CommunityPost.community_id == community_id
        ).order_by(desc(CommunityPost.created_at)).offset(offset).limit(limit).all()
        
        for post in posts:
            is_liked = db.query(CommunityPostLike).filter(
                CommunityPostLike.post_id == post.id,
                CommunityPostLike.user_id == current_user.id
            ).first() is not None
            items.append({
                "type": "post",
                "id": str(post.id),
                "content": post.content,
                "media_urls": post.media_urls,
                "author_name": f"{post.author.first_name} {post.author.last_name}",
                "author_rating": post.author.profile.rating if post.author and post.author.profile else 0,
                "likes_count": post.likes_count,
                "comments_count": post.comments_count,
                "created_at": post.created_at,
                "is_liked": is_liked
            })
    
    # Get collaborations
    if feed_type in ["collaborations", "all"]:
        collabs = db.query(Collaboration).filter(
            Collaboration.status == "open"
        ).order_by(desc(Collaboration.created_at)).limit(limit).all()
        
        for collab in collabs:
            items.append({
                "type": "collaboration",
                "id": str(collab.id),
                "title": collab.title,
                "description": collab.description,
                "required_skills": collab.required_skills,
                "budget_min": collab.budget_min,
                "budget_max": collab.budget_max,
                "duration_days": collab.duration_days,
                "author_name": f"{collab.user.first_name} {collab.user.last_name}",
                "created_at": collab.created_at
            })
    
    # Get skill requests
    if feed_type in ["skills", "all"]:
        skills = db.query(SkillRequest).filter(
            SkillRequest.status == "open"
        ).order_by(desc(SkillRequest.created_at)).limit(limit).all()
        
        for skill in skills:
            items.append({
                "type": "skill_request",
                "id": str(skill.id),
                "skill_name": skill.skill_name,
                "description": skill.description,
                "payment_min": skill.payment_min,
                "payment_max": skill.payment_max,
                "author_name": f"{skill.user.first_name} {skill.user.last_name}",
                "created_at": skill.created_at
            })
    
    # Sort by date
    items.sort(key=lambda x: x.get("created_at", x.get("created_at")), reverse=True)
    
    return items[offset:offset + limit]