import { logger } from '../config/logger';

// Safe no-op Queue stub to prevent duplicate scheduling & eliminate Redis deployment requirement
export const agentQueue = {
  add: async (jobName: string, data: any, opts?: any) => {
    logger.info(`ℹ️ BullMQ add called for job [${jobName}] (Bypassed in favor of persistent MongoDB Node.js scheduler)`);
    return { id: `stub-${Date.now()}` };
  },
  on: (event: string, callback: Function) => {}
};

export const initAgentWorker = (ioInstance?: any) => {
  logger.info('ℹ️ BullMQ Agent Worker disabled (using persistent MongoDB Node.js scheduler)');
  return null;
};

