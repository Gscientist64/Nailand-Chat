import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

// ============================================================
// Passport Google OAuth Strategy
// ============================================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || '';
          const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || '';
          const secondName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
          const avatarUrl = profile.photos?.[0]?.value || undefined;

          // Check if user exists by googleId or email
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId))
            .limit(1);

          if (existingUser) {
            return done(null, { ...existingUser, isNew: false });
          }

          // Check if user exists by email (link accounts)
          const [emailUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (emailUser) {
            // Link Google account to existing user
            const [updated] = await db
              .update(users)
              .set({ googleId, avatarUrl: avatarUrl || emailUser.avatarUrl, updatedAt: new Date() })
              .where(eq(users.id, emailUser.id))
              .returning();

            return done(null, { ...updated, isNew: false });
          }

          // Create new user via Google
          const [newUser] = await db
            .insert(users)
            .values({
              googleId,
              email,
              firstName,
              secondName,
              avatarUrl: avatarUrl || users.avatarUrl.default,
              emailVerified: true,
            })
            .returning();

          return done(null, { ...newUser, isNew: true });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// ============================================================
// GET /api/auth/google — Start Google OAuth flow
// ============================================================
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

// ============================================================
// GET /api/auth/google/callback — Google OAuth callback
// ============================================================
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?auth_error=google_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken({ userId: user.id, email: user.email });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Redirect back to frontend with token in URL fragment
    res.redirect(`${frontendUrl}/auth/callback#token=${token}`);
  }
);

export default router;
