import { Router, Request, Response } from 'express';
import { z } from 'zod';
import getAuth from '../lib/firebase.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

// ============================================================
// POST /api/auth/google — Verify Firebase Google ID token
// ============================================================
const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

router.post('/google', async (req: Request, res: Response) => {
  try {
    const parsed = googleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    const { idToken } = parsed.data;

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid or expired Google token' });
    }

    const {
      email,
      name,
      picture,
      uid: firebaseUid,
    } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google account has no email' });
    }

    const nameParts = (name || '').split(' ').filter(Boolean);
    const firstName = nameParts[0] || 'Google';
    const secondName = nameParts.slice(1).join(' ') || 'User';

    // Check if user exists by firebase uid
    let user = null;

    // The users table doesn't have a firebase_uid column yet — check by email first
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      user = existingUser;
      // Ensure the user has a Google-linked avatar if they don't have one
      if (!existingUser.avatarUrl && picture) {
        await db
          .update(users)
          .set({ avatarUrl: picture })
          .where(eq(users.id, existingUser.id));
        user = { ...existingUser, avatarUrl: picture };
      }
    } else {
      // Create a new user from the Google profile
      const [created] = await db
        .insert(users)
        .values({
          email,
          firstName,
          secondName,
          avatarUrl: picture || undefined,
          emailVerified: true,
          region: 'Africa',
          interests: [],
        })
        .returning();
      user = created;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          secondName: user.secondName,
          email: user.email,
          interests: user.interests || [],
          region: user.region || 'Africa',
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Signed in with Google',
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
