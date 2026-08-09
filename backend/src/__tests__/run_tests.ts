import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before test run
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDatabase } from '../config/database';
import { runEvaluatorContractTests } from './evaluator_contract.test';

async function main() {
  try {
    // Attempt database connection if URI present, or run offline mocks
    if (process.env.MONGODB_URI) {
      await connectDatabase();
    }
    await runEvaluatorContractTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

main();
