# backend/app/api/v1/community.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.dependencies import get_current_user, get_optional_user
from app.schemas.community import (
    CommunityResponse,
    CommunityPostResponse,
    CreateCommunityRequest,
    CreateCommunityPostRequest,
    ActionResponse,
)
from app.services.community_service import (
    get_community_by_id,
    search_communities,
    get_community_posts,
    create_community_post,
    leave_community,
    join_community,
    create_community,
    get_user_communities,      
    get_trending_communities,  
)
from app.models.user import User

router = APIRouter(prefix="/communities", tags=["communities"])


# ── API 1 (MimieDev) ────────────────────────────────────────────────
# GET /communities/my
# Returns all communities the logged-in user has joined
# Requires: JWT token (must be logged in)
# Used by: Community page → "Your Community" left panel
@router.get("/my", response_model=List[CommunityResponse])
async def get_my_communities(
    current_user: User = Depends(get_current_user),  # requires login
    db: Session = Depends(get_db)
):
    """Get all communities the current user has joined."""
    return get_user_communities(db, current_user)


# ── API 2 (MimieDev) ────────────────────────────────────────────────
# GET /communities/trending
# Returns popular communities sorted by member count
# No login required (public endpoint)
# Used by: Community page → "Find Community" right panel
@router.get("/trending", response_model=List[CommunityResponse])
async def get_trending_communities_route(
    limit: int = Query(20, ge=1, le=100),
    region: Optional[str] = None,           # filter by region e.g. "Tech"
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get trending/popular communities, optionally filtered by region."""
    return get_trending_communities(db, current_user, limit, region)


# ── API 6 (Dave Atoroyo) ─────────────────────────────────────────────
# GET /communities/search?q=xxx
@router.get("/search", response_model=List[CommunityResponse])
async def search_community_list(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Search for communities by name or description."""
    return search_communities(db, q, current_user, limit)


# ── API 3 (MimieDev) ────────────────────────────────────────────────
# GET /communities/{community_id}
# Returns full details of one community by its ID
# No login required (public endpoint)
# Used by: Clicking "Explore" on a community card
@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community_detail(
    community_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get details of a single community by ID."""
    community = get_community_by_id(db, community_id)
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    return community


# ── API 7 (Dave Atoroyo) ─────────────────────────────────────────────
# GET /communities/{community_id}/posts
# Returns all posts inside a community
@router.get("/{community_id}/posts", response_model=List[CommunityPostResponse])
async def get_community_posts_route(
    community_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Return a list of posts for a community."""
    community = get_community_by_id(db, community_id)
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    return get_community_posts(db, community, current_user)


# ── API 8 (Dave Atoroyo) ─────────────────────────────────────────────
# POST /communities/{community_id}/posts
# Creates a new post inside a community
# Requires: JWT token (must be logged in)
@router.post(
    "/{community_id}/posts",
    response_model=CommunityPostResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_community_post_route(
    community_id: str,
    request: CreateCommunityPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post inside a community."""
    community = get_community_by_id(db, community_id)
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    return create_community_post(
        db, community, current_user,
        request.content, request.media_urls
    )


# ── API 5 (Dave Atoroyo) ─────────────────────────────────────────────
# POST /communities/{community_id}/leave
# User leaves a community they joined
# Requires: JWT token
@router.post("/{community_id}/leave", response_model=ActionResponse)
async def leave_community_route(
    community_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a community and remove membership."""
    community = get_community_by_id(db, community_id)
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    leave_community(db, community, current_user)
    return ActionResponse(success=True, message="Successfully left the community")


# ── API 4 (Dave Atoroyo) ─────────────────────────────────────────────
# POST /communities/{community_id}/join
# User joins a community
# Requires: JWT token
# Private communities are blocked with 403
@router.post("/{community_id}/join", response_model=ActionResponse)
async def join_community_route(
    community_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a public community or request to join a private community."""
    community = get_community_by_id(db, community_id)
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    if community.is_private:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Private communities require a membership invitation"
        )
    join_community(db, community, current_user)
    return ActionResponse(success=True, message="Successfully joined the community")


# ── CREATE COMMUNITY ───────────────────────────────────────────
# POST /communities/
# Creates a brand new community
# Requires: JWT token
@router.post(
    "/",
    response_model=CommunityResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_community_route(
    request: CreateCommunityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new community."""
    return create_community(
        db,
        current_user,
        name=request.name,
        description=request.description,
        is_private=request.is_private,
        cover_image_url=request.cover_image_url,
    )