import { initAgentTask, getAgentFeed } from '../controllers/agent.controller';
import { AgentModel } from '../models/agent.model';
import { PostModel } from '../models/post.model';

/**
 * ABTalks Evaluator API Contract & Feed Verification Suite
 */
export async function runEvaluatorContractTests() {
  console.log('🧪 Starting ABTalks Evaluator API Contract Verification...');

  // Helper to create mock Express Req / Res objects
  const createMockRes = () => {
    const res: any = {};
    res.headers = {};
    res.statusCode = 200;
    res.setHeader = (key: string, val: string) => { res.headers[key] = val; };
    res.status = (code: number) => { res.statusCode = code; return res; };
    res.json = (data: any) => { res.body = data; return res; };
    return res;
  };

  const createMockReq = (body: any = {}, query: any = {}, io: any = null) => ({
    body,
    query,
    app: {
      get: (key: string) => key === 'io' ? io : null
    }
  });

  // Test 1: POST /api/v1/agent/init validation error when persona missing
  {
    const req = createMockReq({});
    const res = createMockRes();
    await initAgentTask(req as any, res as any);
    if (res.statusCode !== 400) throw new Error(`Test 1 Failed: Expected status 400, got ${res.statusCode}`);
    console.log('✅ Test 1 Passed: Validation rejects missing persona payload with 400 Bad Request');
  }

  // Test 2: POST /api/v1/agent/init valid payload returns agentId immediately
  let createdAgentId = '';
  {
    const req = createMockReq({ persona: { name: 'Ada', domain: 'AI Security' } });
    const res = createMockRes();
    await initAgentTask(req as any, res as any);
    if (res.statusCode !== 200) throw new Error(`Test 2 Failed: Expected status 200, got ${res.statusCode}`);
    if (typeof res.body?.agentId !== 'string' || res.body.agentId.length === 0) {
      throw new Error('Test 2 Failed: agentId missing from response');
    }
    createdAgentId = res.body.agentId;
    console.log(`✅ Test 2 Passed: POST /api/v1/agent/init returned agentId "${createdAgentId}" immediately`);
  }

  // Test 3: GET /api/v1/agent/feed returns 400 when agentId is missing
  {
    const req = createMockReq({}, {});
    const res = createMockRes();
    await getAgentFeed(req as any, res as any);
    if (res.statusCode !== 400) throw new Error(`Test 3 Failed: Expected 400 Bad Request for missing agentId, got ${res.statusCode}`);
    console.log('✅ Test 3 Passed: GET /api/v1/agent/feed rejects missing agentId with 400 Bad Request');
  }

  // Test 4: GET /api/v1/agent/feed returns top-level posts array for valid agentId
  {
    const req = createMockReq({}, { agentId: createdAgentId });
    const res = createMockRes();
    await getAgentFeed(req as any, res as any);
    if (res.statusCode !== 200) throw new Error(`Test 4 Failed: Expected 200 OK, got ${res.statusCode}`);
    if (!Array.isArray(res.body?.posts)) throw new Error('Test 4 Failed: Response must contain top-level posts array');
    console.log(`✅ Test 4 Passed: GET /api/v1/agent/feed returned {"posts": [...]}`);
  }

  // Test 5: GET /api/v1/agent/feed for non-existent agent returns empty posts array
  {
    const req = createMockReq({}, { agentId: 'non-existent-agent-id-12345' });
    const res = createMockRes();
    await getAgentFeed(req as any, res as any);
    if (res.statusCode !== 200) throw new Error(`Test 5 Failed: Expected 200 OK for empty feed, got ${res.statusCode}`);
    if (!Array.isArray(res.body?.posts) || res.body.posts.length !== 0) {
      throw new Error('Test 5 Failed: Expected empty posts array for unknown agent');
    }
    console.log('✅ Test 5 Passed: Empty feed correctly returns {"posts": []}');
  }

  console.log('🎉 All Evaluator API Contract Verification Tests Passed!\n');
}
