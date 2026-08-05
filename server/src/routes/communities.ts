import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { communities, communityMembers, chatThreads, threadParticipants, users } from '../db/schema.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';

const router = Router();

// ============================================================
// GET /api/communities — List all communities
// ============================================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allCommunities = await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount))
      .limit(50);

    return res.json({ success: true, data: allCommunities });
  } catch (error) {
    console.error('List communities error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/communities/search?q= — Search communities by name/tags
// ============================================================
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const results = await db
      .select()
      .from(communities)
      .where(ilike(communities.name, `%${q}%`))
      .orderBy(desc(communities.memberCount))
      .limit(20);

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('Search communities error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/communities/my — Communities the current user belongs to
// ============================================================
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const myRows = await db
      .select({
        communityId: communityMembers.communityId,
        role: communityMembers.role,
        joinedAt: communityMembers.joinedAt,
      })
      .from(communityMembers)
      .where(eq(communityMembers.userId, req.user!.id));

    if (myRows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const ids = myRows.map((r) => r.communityId);
    const myCommunities = await db
      .select()
      .from(communities)
      .where(sql`${communities.id} = ANY(${ids})`)
      .orderBy(desc(communities.memberCount));

    return res.json({
      success: true,
      data: myCommunities.map((c) => {
        const membership = myRows.find((r) => r.communityId === c.id);
        return { ...c, role: membership?.role, joinedAt: membership?.joinedAt, isMember: true };
      }),
    });
  } catch (error) {
    console.error('My communities error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/communities/trending — Trending communities (optionally by region)
// ============================================================
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const region = (req.query.region as string) || undefined;
    const limit = parseInt((req.query.limit as string) || '20', 10);

    let query = db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount))
      .limit(limit);

    const trending = await query;
    return res.json({ success: true, data: trending });
  } catch (error) {
    console.error('Trending communities error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/communities/:id — Get community details
// ============================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, req.params.id))
      .limit(1);

    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }

    // Get members
    const members = await db
      .select()
      .from(communityMembers)
      .where(eq(communityMembers.communityId, community.id))
      .limit(50);

    return res.json({ success: true, data: { ...community, members } });
  } catch (error) {
    console.error('Get community error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/communities — Create community
// ============================================================
const createCommunitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  avatar: z.string().url(),
  tags: z.array(z.string()).optional().default([]),
});

router.post('/', authenticate, validate(createCommunitySchema), async (req: Request, res: Response) => {
  try {
    const [community] = await db
      .insert(communities)
      .values({
        ...req.body,
        createdBy: req.user!.id,
      })
      .returning();

    // Add creator as admin member
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: req.user!.id,
      role: 'admin',
    });

    // Create a community chat thread
    const [thread] = await db
      .insert(chatThreads)
      .values({
        name: community.name,
        avatar: community.avatar,
        category: 'community',
        isCommunity: true,
        communityId: community.id,
        createdBy: req.user!.id,
      })
      .returning();

    // Add creator to thread
    await db.insert(threadParticipants).values({
      threadId: thread.id,
      userId: req.user!.id,
    });

    return res.status(201).json({ success: true, data: community });
  } catch (error) {
    console.error('Create community error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/communities/:id/join — Join a community
// ============================================================
router.post('/:id/join', authenticate, async (req: Request, res: Response) => {
  try {
    const communityId = req.params.id;

    // Check if already a member
    const [existing] = await db
      .select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.userId, req.user!.id)
      ))
      .limit(1);

    if (existing) {
      return res.status(409).json({ success: false, error: 'Already a member' });
    }

    await db.insert(communityMembers).values({
      communityId,
      userId: req.user!.id,
      role: 'member',
    });

    // Increment member count
    await db
      .update(communities)
      .set({ memberCount: sql`member_count + 1` })
      .where(eq(communities.id, communityId));

    // Add to community chat thread
    const [thread] = await db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.communityId, communityId))
      .limit(1);

    if (thread) {
      const [alreadyInThread] = await db
        .select()
        .from(threadParticipants)
        .where(and(
          eq(threadParticipants.threadId, thread.id),
          eq(threadParticipants.userId, req.user!.id)
        ))
        .limit(1);

      if (!alreadyInThread) {
        await db.insert(threadParticipants).values({
          threadId: thread.id,
          userId: req.user!.id,
        });
      }
    }

    return res.json({ success: true, message: 'Joined community successfully' });
  } catch (error) {
    console.error('Join community error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
