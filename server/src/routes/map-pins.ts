import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { mapPins } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { desc } from 'drizzle-orm';

const router = Router();

// ============================================================
// GET /api/map-pins — List all map pins
// ============================================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const pins = await db
      .select()
      .from(mapPins)
      .orderBy(desc(mapPins.createdAt))
      .limit(100);

    return res.json({ success: true, data: pins });
  } catch (error) {
    console.error('Get map pins error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/map-pins — Create a map pin
// ============================================================
const createPinSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  top: z.string().optional().default('50%'),
  left: z.string().optional().default('50%'),
  totalThreads: z.number().optional().default(0),
  isLocked: z.boolean().optional().default(false),
  communityId: z.string().uuid().optional(),
});

router.post('/', authenticate, validate(createPinSchema), async (req: Request, res: Response) => {
  try {
    const [pin] = await db
      .insert(mapPins)
      .values({
        ...req.body,
        createdBy: req.user!.id,
      })
      .returning();

    return res.status(201).json({ success: true, data: pin });
  } catch (error) {
    console.error('Create map pin error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
