import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getFirebaseAuth } from '../lib/firebase.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';
import { findSojournersCamp, autoJoinCommunity } from '../db/defaults.js';

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

    const auth = getFirebaseAuth();
    if (!auth) {
      return res.status(503).json({
        success: false,
        error: 'Google authentication is not configured on the server. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server/.env.',
      });
    }

    const { idToken } = parsed.data;

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Failed to verify Google ID token:', error);
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

    // Check if user exists by email
    let user = null;
    let isNewUser = false;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      user = existingUser;
      const updates: Record<string, any> = {};
      if (!existingUser.googleId && firebaseUid) updates.googleId = firebaseUid;
      if (!existingUser.avatarUrl && picture) updates.avatarUrl = picture;
      if (!existingUser.emailVerified) updates.emailVerified = true;

      if (Object.keys(updates).length > 0) {
        await db
          .update(users)
          .set(updates)
          .where(eq(users.id, existingUser.id));
        user = { ...existingUser, ...updates };
      }
    } else {
      isNewUser = true;
      // Create a new user from the Google profile
      const [created] = await db
        .insert(users)
        .values({
          email,
          googleId: firebaseUid,
          firstName,
          secondName,
          avatarUrl: picture || undefined,
          emailVerified: true,
          region: 'Africa',
          interests: [],
        })
        .returning();
      user = created;

      // Welcome every new Google user into Sojourners' Camp (universal starting community)
      try {
        const campId = await findSojournersCamp();
        if (campId) {
          await autoJoinCommunity(user.id, campId);
        }
      } catch (joinError) {
        console.error('Auto-join Sojourners Camp failed (non-fatal):', joinError);
      }
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
      message: isNewUser ? 'Account created with Google' : 'Signed in with Google',
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
