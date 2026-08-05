import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { chatThreads, chatMessages, threadParticipants, users } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

const router = Router();

// ============================================================
// GET /api/messages/threads — Get all threads for current user (with unread counts)
// ============================================================
router.get('/threads', authenticate, async (req: Request, res: Response) => {
  try {
    // Get threads where user is a participant
    const participantThreads = await db
      .select({ threadId: threadParticipants.threadId })
      .from(threadParticipants)
      .where(eq(threadParticipants.userId, req.user!.id));

    const threadIds = participantThreads.map((p) => p.threadId);

    if (threadIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const threads = await db
      .select()
      .from(chatThreads)
      .orderBy(desc(chatThreads.createdAt));

    // Filter to only user's threads
    const userThreads = threads.filter((t) => threadIds.includes(t.id));

    // Compute unread counts per thread (messages not sent by me and not read)
    const unreadCounts: Record<string, number> = {};
    for (const t of userThreads) {
      const unread = await db
        .select({ id: chatMessages.id })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.threadId, t.id),
          eq(chatMessages.isRead, false),
          sql`${chatMessages.senderId} != ${req.user!.id}`
        ));
      unreadCounts[t.id] = unread.length;
    }

    return res.json({
      success: true,
      data: userThreads.map((t) => ({ ...t, unreadCount: unreadCounts[t.id] || 0 })),
    });
  } catch (error) {
    console.error('Get threads error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/messages/threads/:id/read — Mark all messages in a thread as read
// ============================================================
router.post('/threads/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.threadId, req.params.id),
        sql`${chatMessages.senderId} != ${req.user!.id}`
      ));

    return res.json({ success: true, message: 'Thread marked as read' });
  } catch (error) {
    console.error('Mark thread read error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/messages/unread-count — Total unread messages across threads
// ============================================================
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.isRead, false),
        sql`${chatMessages.senderId} != ${req.user!.id}`
      ));

    return res.json({ success: true, data: { count: rows.length } });
  } catch (error) {
    console.error('Unread messages error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/messages/threads/:id/messages — Get messages for a thread
// ============================================================
router.get('/threads/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const messages = await db
      .select({
        id: chatMessages.id,
        threadId: chatMessages.threadId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        sender: users.firstName,
        avatar: users.avatarUrl,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.threadId, req.params.id))
      .orderBy(asc(chatMessages.createdAt))
      .limit(200);

    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/messages/threads — Create a new thread
// ============================================================
const createThreadSchema = z.object({
  name: z.string().min(1).max(200),
  avatar: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1),
  category: z.enum(['chat', 'community']).optional().default('chat'),
});

router.post('/threads', authenticate, validate(createThreadSchema), async (req: Request, res: Response) => {
  try {
    const { name, avatar, participantIds, category } = req.body;

    const [thread] = await db
      .insert(chatThreads)
      .values({
        name,
        avatar: avatar || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80',
        category,
        createdBy: req.user!.id,
      })
      .returning();

    // Add creator + participants
    const allParticipants = [req.user!.id, ...participantIds.filter((id: string) => id !== req.user!.id)];
    await db.insert(threadParticipants).values(
      allParticipants.map((userId: string) => ({
        threadId: thread.id,
        userId,
      }))
    );

    return res.status(201).json({ success: true, data: thread });
  } catch (error) {
    console.error('Create thread error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/messages/threads/:id/messages — Send a message
// ============================================================
const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

router.post('/threads/:id/messages', authenticate, validate(sendMessageSchema), async (req: Request, res: Response) => {
  try {
    const [message] = await db
      .insert(chatMessages)
      .values({
        threadId: req.params.id,
        senderId: req.user!.id,
        content: req.body.content,
      })
      .returning();

    // Update thread's last message
    await db
      .update(chatThreads)
      .set({
        lastMessage: req.body.content,
        timeString: 'Just now',
      })
      .where(eq(chatThreads.id, req.params.id));

    // Fetch the full message with sender info
    const [fullMessage] = await db
      .select({
        id: chatMessages.id,
        threadId: chatMessages.threadId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        sender: users.firstName,
        avatar: users.avatarUrl,
        senderId: users.id,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.id, message.id))
      .limit(1);

    return res.status(201).json({ success: true, data: fullMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
