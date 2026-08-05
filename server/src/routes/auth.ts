import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { eq } from 'drizzle-orm';

const router = Router();

// ============================================================
// Zod Schemas
// ============================================================
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  secondName: z.string().min(1, 'Second name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  interests: z.array(z.string()).optional().default([]),
  region: z.string().optional().default('Africa'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
});

// ============================================================
// POST /api/auth/signup — Register with email + password
// ============================================================
router.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
  try {
    const { firstName, secondName, email, password, interests, region } = req.body;

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        secondName,
        email,
        passwordHash,
        interests,
        region,
        emailVerified: false,
      })
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

    // Generate JWT
    const token = generateToken({ userId: newUser.id, email: newUser.email });

    return res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: 'Account created successfully. Please check your email for verification code.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/verify-code — Verify email with code (placeholder: 4582)
// ============================================================
router.post('/verify-code', validate(verifyCodeSchema), async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Placeholder verification — replace with real emailed code delivery in production
    if (code !== '4582') {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    // Mark email as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.email, email));

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/login — Sign in with email + password
// ============================================================
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check password
    if (!user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
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
          interests: user.interests,
          region: user.region,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/auth/me — Get current user from token
// ============================================================
router.get('/me', authenticate, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      id: req.user!.id,
      firstName: req.user!.firstName,
      secondName: req.user!.secondName,
      email: req.user!.email,
      interests: req.user!.interests,
      region: req.user!.region,
      avatarUrl: req.user!.avatarUrl,
    },
  });
});

// ============================================================
// POST /api/auth/forgot-password — Request password reset
// ============================================================
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists — return success either way
      return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
    }

    // In production: send email with reset code via SendGrid / Resend etc.
    console.log(`Password reset requested for ${email}`);

    return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/reset-password — Set new password
// ============================================================
const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    // Placeholder: accept fixed code until real reset emails are wired up
    if (code !== '4582') {
      return res.status(400).json({ success: false, error: 'Invalid reset code' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email));

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
