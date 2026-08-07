import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { initAgentWorker } from './queue/agent.queue';

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDatabase();

    // 2. Initialize Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 3. Initialize Socket.IO Server
    const io = new SocketIOServer(server, {
      cors: {
        origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      logger.info(`🔌 Socket Client Connected: ${socket.id}`);
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket Client Disconnected: ${socket.id}`);
      });
    });

    // 4. Initialize BullMQ Queue Worker
    initAgentWorker(io);

    // 5. Start Server Listen
    const PORT = Number(env.PORT) || 5000;
    server.listen(PORT, () => {
      logger.info(`🚀 Backend API Gateway Server running on http://localhost:${PORT}`);
      logger.info(`📡 Real-Time Socket.IO Server active on ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
