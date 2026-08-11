import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, verificationCodes } from '../db/schema.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { generateCode, sendVerificationCode, sendPasswordResetCode } from '../lib/email.js';

const router = Router();

const CODE_TTL_MINUTES = 15;

// ============================================================
// Helpers
// ============================================================
// Create + persist a code, then send it via email
async function createAndSendCode(email: string, type: 'verify_email' | 'reset_password') {
  const code = generateCode(4);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  // Invalidate any previous unused codes for this email+type
  await db
    .update(verificationCodes)
    .set({ used: true })
    .where(and(
      eq(verificationCodes.email, email),
      eq(verificationCodes.type, type),
      eq(verificationCodes.used, false)
    ));

  await db.insert(verificationCodes).values({ email, code, type, expiresAt });

  if (type === 'verify_email') {
    return sendVerificationCode(email, code);
  }
  return sendPasswordResetCode(email, code);
}

// Validate a code for an email + type (checks existence, unused, not expired)
async function isValidCode(email: string, code: string, type: 'verify_email' | 'reset_password') {
  const [record] = await db
    .select()
    .from(verificationCodes)
    .where(and(
      eq(verificationCodes.email, email),
      eq(verificationCodes.code, code),
      eq(verificationCodes.type, type),
      eq(verificationCodes.used, false),
      sql`${verificationCodes.expiresAt} > now()`
    ))
    .limit(1);

  if (!record) return false;

  // Mark as used so it can't be reused
  await db
    .update(verificationCodes)
    .set({ used: true })
    .where(eq(verificationCodes.id, record.id));

  return true;
}

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

    // Generate + email a verification code
    await createAndSendCode(email, 'verify_email');

    // Generate JWT
    const token = generateToken({ userId: newUser.id, email: newUser.email });

    return res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: 'Account created successfully. Check your email for the 4-digit verification code.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/verify-code — Verify email with emailed code
// ============================================================
router.post('/verify-code', validate(verifyCodeSchema), async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const valid = await isValidCode(email, code, 'verify_email');
    if (!valid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
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
// POST /api/auth/resend-code — Resend a verification code
// ============================================================
const resendCodeSchema = z.object({
  email: z.string().email(),
});

router.post('/resend-code', validate(resendCodeSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    await createAndSendCode(email, 'verify_email');
    return res.json({ success: true, message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend code error:', error);
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
      createdAt: req.user!.createdAt,
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

    // Send a real password reset code via email
    await createAndSendCode(email, 'reset_password');

    return res.json({ success: true, message: 'A password reset code has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/reset-password — Set new password with emailed code
// ============================================================
const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    const valid = await isValidCode(email, code, 'reset_password');
    if (!valid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code' });
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
