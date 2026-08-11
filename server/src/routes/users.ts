import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq } from 'drizzle-orm';

const router = Router();

// ============================================================
// PUT /api/users/profile — Update own profile
// ============================================================
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  secondName: z.string().min(1).max(100).optional(),
  interests: z.array(z.string()).optional(),
  region: z.string().max(100).optional(),
  // Accept https URLs AND data: URLs (from the in-app profile picture upload)
  avatarUrl: z
    .string()
    .max(2_000_000)
    .refine((v) => v === '' || /^(https?:\/\/|data:image\/)/.test(v), { message: 'Invalid avatar' })
    .optional(),
});

router.put('/profile', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.user!.id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        secondName: users.secondName,
        email: users.email,
        interests: users.interests,
        region: users.region,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/users/:id — Get user by ID
// ============================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        secondName: users.secondName,
        email: users.email,
        interests: users.interests,
        region: users.region,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.params.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/users — List all users (for community directory)
// ============================================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allUsers = await db
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
      .limit(100);

    return res.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
