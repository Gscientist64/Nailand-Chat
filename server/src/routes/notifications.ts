import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { notifications } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// ============================================================
// GET /api/notifications — List current user's notifications
// ============================================================
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return res.json({ success: true, data: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/notifications/unread-count — Unread notification count
// ============================================================
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, req.user!.id),
        eq(notifications.isRead, false)
      ));

    return res.json({ success: true, data: { count: rows.length } });
  } catch (error) {
    console.error('Unread count error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/notifications/:id/read — Mark a notification as read
// ============================================================
router.post('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, req.params.id),
        eq(notifications.userId, req.user!.id)
      ));

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/notifications/read-all — Mark all as read
// ============================================================
router.post('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, req.user!.id));

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Read all error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
