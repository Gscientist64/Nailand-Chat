import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// ============================================================
// GET /api/tasks/:threadId — Get tasks for a thread
// ============================================================
router.get('/:threadId', authenticate, async (req: Request, res: Response) => {
  try {
    const threadTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.threadId, req.params.threadId))
      .orderBy(desc(tasks.createdAt))
      .limit(100);

    return res.json({ success: true, data: threadTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/tasks/:threadId — Create a task
// ============================================================
const createTaskSchema = z.object({
  text: z.string().min(1, 'Task text is required').max(500),
});

router.post('/:threadId', authenticate, validate(createTaskSchema), async (req: Request, res: Response) => {
  try {
    const [task] = await db
      .insert(tasks)
      .values({
        threadId: req.params.threadId,
        text: req.body.text,
        createdBy: req.user!.id,
      })
      .returning();

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// PATCH /api/tasks/:id/toggle — Toggle task checked state
// ============================================================
router.patch('/:id/toggle', authenticate, async (req: Request, res: Response) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, req.params.id))
      .limit(1);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const [updated] = await db
      .update(tasks)
      .set({ checked: !task.checked })
      .where(eq(tasks.id, req.params.id))
      .returning();

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle task error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// DELETE /api/tasks/:id — Delete a task
// ============================================================
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await db.delete(tasks).where(eq(tasks.id, req.params.id));
    return res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
