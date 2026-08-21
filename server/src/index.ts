import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// DB
import { db } from './db/index.js';

// Routes
import authRoutes from './routes/auth.js';
import authGoogleRoutes from './routes/auth-google.js';
import userRoutes from './routes/users.js';
import communityRoutes from './routes/communities.js';
import messageRoutes from './routes/messages.js';
import feedRoutes from './routes/feeds.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';
import mapPinRoutes from './routes/map-pins.js';
import dashboardRoutes from './routes/dashboard.js';

// WebSocket
import { setupWebSocket } from './ws/chat.js';

const app = express();
const httpServer = createServer(app);

// ============================================================
// Middleware
// ============================================================
// Normalize allowed origins: add https:// if missing, strip trailing slashes,
// and support comma-separated values (e.g. local + production).
function normalizeOrigin(origin: string): string {
  let o = origin.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//.test(o)) {
    o = `https://${o}`;
  }
  return o;
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, health checks, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Firebase
import { getFirebaseAuth, isFirebaseAdminConfigured, lastInitError } from './lib/firebase.js';

// Health Check
app.get('/api/health', (_req, res) => {
  const authInstance = getFirebaseAuth();
  res.json({
    success: true,
    message: 'NaiLand API is running',
    version: '1.0.6',
    firebaseConfigured: isFirebaseAdminConfigured,
    firebaseAuthReady: !!authInstance,
    firebaseError: lastInitError,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/auth', authGoogleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/map-pins', mapPinRoutes);
app.use('/api', dashboardRoutes);

// ============================================================
// 404 Handler
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ============================================================
// WebSocket
// ============================================================
const io = setupWebSocket(httpServer);

// ============================================================
// Start Server
// ============================================================
const PORT = parseInt(process.env.PORT || '3001', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🏝️  NaiLand API Server`);
  console.log(`  ─────────────────────`);
  console.log(`  ➜  Local:   http://localhost:${PORT}`);
  console.log(`  ➜  Health:  http://localhost:${PORT}/api/health`);
  console.log(`  ➜  WS:      ws://localhost:${PORT}`);
  console.log(`  ➜  Env:     ${process.env.NODE_ENV || 'development'}\n`);
});

export { app, httpServer, io };
