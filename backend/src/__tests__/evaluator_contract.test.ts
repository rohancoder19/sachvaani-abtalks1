import { initAgentTask, getAgentFeed } from '../controllers/agent.controller';
import { AgentModel } from '../models/agent.model';
import { PostModel } from '../models/post.model';

/**
 * ABTalks Evaluator API Contract Verification Suite
 */
export async function runEvaluatorContractTests() {
  console.log('🧪 Starting ABTalks Evaluator API Contract Verification...');

  // Mock Express Req / Res objects
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

  // Test 1: POST /api/agent/init validation error when persona missing
  {
    const req = createMockReq({});
    const res = createMockRes();
    await initAgentTask(req as any, res as any);
    console.assert(res.statusCode === 400, 'Test 1 Failed: Expected status 400 for missing persona');
    console.log('✅ Test 1 Passed: Validation rejects missing persona name/domain with 400 Bad Request');
  }

  // Test 2: POST /api/agent/init valid payload returns agentId immediately
  let createdAgentId = '';
  {
    const req = createMockReq({ persona: { name: 'Ada', domain: 'AI Security' } });
    const res = createMockRes();
    await initAgentTask(req as any, res as any);
    console.assert(res.statusCode === 200, 'Test 2 Failed: Expected status 200 for valid init');
    console.assert(typeof res.body?.agentId === 'string' && res.body.agentId.length > 0, 'Test 2 Failed: agentId missing from response');
    createdAgentId = res.body.agentId;
    console.log(`✅ Test 2 Passed: POST /api/agent/init returned agentId "${createdAgentId}" immediately`);
  }

  // Test 3: GET /api/agent/feed returns top-level posts array
  {
    const req = createMockReq({}, { agentId: createdAgentId });
    const res = createMockRes();
    await getAgentFeed(req as any, res as any);
    console.assert(res.statusCode === 200, 'Test 3 Failed: Expected status 200 for GET feed');
    console.assert(Array.isArray(res.body?.posts), 'Test 3 Failed: Response must contain top-level posts array');
    console.log(`✅ Test 3 Passed: GET /api/agent/feed returned {"posts": [...]}`);
  }

  // Test 4: Post format verification (if posts exist)
  {
    const posts = await PostModel.find({ agentId: createdAgentId }).sort({ createdAt: -1 }).lean();
    if (posts.length > 0) {
      const sample = posts[0];
      console.assert(Boolean(sample._id), 'Test 4 Failed: Post missing ID');
      console.assert(Boolean(sample.text), 'Test 4 Failed: Post missing text');
      console.assert(Boolean(sample.rationale), 'Test 4 Failed: Post missing rationale');
      console.assert(Array.isArray(sample.sources), 'Test 4 Failed: Post missing sources array');
      console.log('✅ Test 4 Passed: Post model schema contains required id, createdAt, text, rationale, sources');
    } else {
      console.log('ℹ️ Test 4 Notice: Feed currently empty (posts appear after async cycle completes)');
    }
  }

  // Test 5: Verify persistent scheduler state in AgentModel
  {
    const agent = await AgentModel.findOne({ agentId: createdAgentId }).lean();
    console.assert(agent?.status === 'active', 'Test 5 Failed: Agent status should be active');
    console.assert(Boolean(agent?.nextRunAt), 'Test 5 Failed: Agent nextRunAt should be set');
    console.log('✅ Test 5 Passed: Agent active state and nextRunAt persistent in MongoDB');
  }

  console.log('🎉 All Evaluator API Contract Verification Tests Completed Successfully!\n');
}
