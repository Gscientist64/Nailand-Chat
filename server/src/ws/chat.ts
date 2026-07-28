import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { chatMessages, chatThreads, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token as string);
      (socket as any).userId = decoded.userId;
      (socket as any).email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId, online: true });

    // Join all threads for this user
    socket.on('threads:join', async (threadIds: string[]) => {
      for (const threadId of threadIds) {
        socket.join(`thread:${threadId}`);
      }
    });

    // Join a specific thread room
    socket.on('thread:join', (threadId: string) => {
      socket.join(`thread:${threadId}`);
    });

    // Leave a thread room
    socket.on('thread:leave', (threadId: string) => {
      socket.leave(`thread:${threadId}`);
    });

    // Handle incoming chat message
    socket.on('message:send', async (data: { threadId: string; content: string }) => {
      try {
        const { threadId, content } = data;

        // Save to database
        const [message] = await db
          .insert(chatMessages)
          .values({
            threadId,
            senderId: userId,
            content,
          })
          .returning();

        // Update thread's last message
        await db
          .update(chatThreads)
          .set({
            lastMessage: content,
            timeString: 'Just now',
          })
          .where(eq(chatThreads.id, threadId));

        // Fetch sender info
        const [sender] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        // Broadcast to all clients in the thread room
        io.to(`thread:${threadId}`).emit('message:new', {
          id: message.id,
          threadId: message.threadId,
          sender: sender?.firstName || 'Unknown',
          senderId: userId,
          avatar: sender?.avatarUrl || '',
          content: message.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: message.createdAt,
          isMe: false, // each client determines isMe locally
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', (data: { threadId: string }) => {
      socket.to(`thread:${data.threadId}`).emit('typing:update', {
        threadId: data.threadId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { threadId: string }) => {
      socket.to(`thread:${data.threadId}`).emit('typing:update', {
        threadId: data.threadId,
        userId,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('user:online', { userId, online: false });
    });
  });

  return io;
}

// Helper to get online user count
export function getOnlineUsersCount(): number {
  return onlineUsers.size;
}
