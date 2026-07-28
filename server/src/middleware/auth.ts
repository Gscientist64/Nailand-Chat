import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'nailand-super-secret-jwt-key';

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        secondName: string;
        avatarUrl: string;
        region: string;
        interests: string[];
      };
    }
  }
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Authentication middleware — requires valid token
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        secondName: users.secondName,
        avatarUrl: users.avatarUrl,
        region: users.region,
        interests: users.interests,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      secondName: user.secondName,
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      region: user.region || 'Africa',
      interests: user.interests || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Optional auth — attaches user if token present, but doesn't block
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          secondName: users.secondName,
          avatarUrl: users.avatarUrl,
          region: users.region,
          interests: users.interests,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          secondName: user.secondName,
          avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
          region: user.region || 'Africa',
          interests: user.interests || [],
        };
      }
    }
  } catch {
    // Token invalid — just continue without user
  }
  next();
}
