import { Router, Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, communities, communityMembers, chatMessages, collabOffers, skillRequests } from '../db/schema.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// ============================================================
// GET /api/stats — Dashboard stats
// ============================================================
router.get('/stats', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const [[userCount], [communityCount], [memberCount], [collabCount], [messageCount]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(communities),
      db.select({ count: sql<number>`count(*)` }).from(communityMembers),
      db.select({ count: sql<number>`count(*)` }).from(collabOffers),
      db.select({ count: sql<number>`count(*)` }).from(chatMessages),
    ]);

    const [skillRequestCount] = await db.select({ count: sql<number>`count(*)` }).from(skillRequests);

    return res.json({
      success: true,
      data: {
        totalUsers: userCount?.count || 0,
        totalCommunities: communityCount?.count || 0,
        totalMemberships: memberCount?.count || 0,
        totalCollabs: collabCount?.count || 0,
        totalMessages: messageCount?.count || 0,
        totalSkillRequests: skillRequestCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/search/users?q= — Search users by name/interest/skill
// ============================================================
router.get('/search/users', optionalAuth, async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    // Search by first/last name or interests
    const results = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        secondName: users.secondName,
        email: users.email,
        avatarUrl: users.avatarUrl,
        region: users.region,
        interests: users.interests,
      })
      .from(users)
      .where(sql`
        (${users.firstName} ILIKE ${`%${q}%`} OR
         ${users.secondName} ILIKE ${`%${q}%`} OR
         ${users.email} ILIKE ${`%${q}%`})
      `)
      .limit(20);

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
