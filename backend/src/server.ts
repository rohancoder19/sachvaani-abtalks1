import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';

import { schedulerService } from './services/scheduler.service';



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

    app.set('io', io);

    io.on('connection', (socket) => {
      logger.info(`🔌 Socket Client Connected: ${socket.id}`);
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket Client Disconnected: ${socket.id}`);
      });
    });

    // 4. Initialize Autonomous Background Scheduler (MongoDB-backed persistent Node.js scheduler)
    await schedulerService.initOnStartup(io);


    // 5. Start Server Listen with EADDRINUSE fallback handling
    const PORT = Number(env.PORT) || 5000;
    
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`⚠️ Port ${PORT} is in use, retrying in 2 seconds...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT, '0.0.0.0');
        }, 2000);
      } else {
        logger.error('❌ Server Listen Error:', err);
      }
    });

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Backend API Gateway Server running on http://0.0.0.0:${PORT}`);
      logger.info(`📡 Real-Time Socket.IO Server active on ws://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
