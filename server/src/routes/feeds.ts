import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { feedPosts, collabOffers, skillRequests, communities } from '../db/schema.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq, desc, asc } from 'drizzle-orm';

const router = Router();

// ============================================================
// FEED POSTS
// ============================================================

// GET /api/feeds/:communityId — Get feed posts for a community
router.get('/:communityId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const posts = await db
      .select()
      .from(feedPosts)
      .where(eq(feedPosts.communityId, req.params.communityId))
      .orderBy(desc(feedPosts.createdAt))
      .limit(50);

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get feeds error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/feeds/:communityId — Create a feed post
const createFeedSchema = z.object({
  content: z.string().min(1),
  images: z.array(z.string().url()).optional().default([]),
  videoUrl: z.string().url().optional(),
});

router.post('/:communityId', authenticate, validate(createFeedSchema), async (req: Request, res: Response) => {
  try {
    const [post] = await db
      .insert(feedPosts)
      .values({
        communityId: req.params.communityId,
        authorId: req.user!.id,
        content: req.body.content,
        images: req.body.images,
        videoUrl: req.body.videoUrl,
        attachmentTypes: req.body.images.length > 0 ? ['image'] : [],
      })
      .returning();

    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create feed post error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/feeds/:postId/like — Toggle like on a post
router.post('/:postId/like', authenticate, async (req: Request, res: Response) => {
  try {
    const [post] = await db
      .select({ likes: feedPosts.likes })
      .from(feedPosts)
      .where(eq(feedPosts.id, req.params.postId))
      .limit(1);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // In production: track per-user likes to prevent double-liking
    await db
      .update(feedPosts)
      .set({ likes: (post.likes || 0) + 1 })
      .where(eq(feedPosts.id, req.params.postId));

    return res.json({ success: true, data: { likes: (post.likes || 0) + 1 } });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// COLLAB OFFERS
// ============================================================

// GET /api/offers — List all collab offers
router.get('/offers/all', async (_req: Request, res: Response) => {
  try {
    const offers = await db
      .select()
      .from(collabOffers)
      .orderBy(desc(collabOffers.createdAt))
      .limit(50);

    return res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Get offers error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/offers — Create a collab offer
const createOfferSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  objectives: z.array(z.string()).optional().default([]),
  roles: z.array(z.string()).optional().default([]),
  collaboratorsCount: z.number().optional().default(1),
  projectLength: z.string().optional().default(''),
  commitment: z.string().optional().default(''),
  monetary: z.string().optional().default(''),
  skillExchange: z.string().optional().default(''),
});

router.post('/offers', authenticate, validate(createOfferSchema), async (req: Request, res: Response) => {
  try {
    const [offer] = await db
      .insert(collabOffers)
      .values({ ...req.body, creatorId: req.user!.id })
      .returning();

    return res.status(201).json({ success: true, data: offer });
  } catch (error) {
    console.error('Create offer error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// SKILL REQUESTS
// ============================================================

// GET /api/skill-requests — List all skill requests
router.get('/skill-requests/all', async (_req: Request, res: Response) => {
  try {
    const requests = await db
      .select()
      .from(skillRequests)
      .orderBy(desc(skillRequests.createdAt))
      .limit(50);

    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get skill requests error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/skill-requests — Create a skill request
const createSkillRequestSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  roles: z.array(z.string()).optional().default([]),
  projectLength: z.string().optional().default(''),
  monetary: z.string().optional().default(''),
});

router.post('/skill-requests', authenticate, validate(createSkillRequestSchema), async (req: Request, res: Response) => {
  try {
    const [request] = await db
      .insert(skillRequests)
      .values({ ...req.body, creatorId: req.user!.id })
      .returning();

    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Create skill request error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
