import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';

export const createApp = (): express.Application => {
  const app = express();

  // Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Body Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  // Root & Health API endpoints
  app.use('/api/v1', routes);
  app.use('/api', routes);
  app.use('/', routes);
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  return app;
};
