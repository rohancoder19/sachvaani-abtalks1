from typing import Dict, Any
from app.discovery.feed_parser import TopicDiscoveryService
from app.editorial.scoring_matrix import EditorialScoringEngine
from app.memory.memory_manager import PersonaMemoryManager
from app.llm.gemini_client import gemini_client

class AutonomousAIPipeline:
    def __init__(self):
        self.discovery_service = TopicDiscoveryService()
        self.editorial_engine = EditorialScoringEngine()
        self.memory_manager = PersonaMemoryManager()

    def run_autonomous_cycle(self, persona_context: Dict[str, Any], past_memories: list) -> Dict[str, Any]:
        # 1. Discover Topics
        raw_topics = self.discovery_service.fetch_live_topics()
        
        evaluated_topics = []
        approved_topics = []

        for t in raw_topics:
            eval_result = self.editorial_engine.evaluate_topic(t)
            t.update(eval_result)
            evaluated_topics.append(t)
            
            if eval_result["status"] == "APPROVED":
                # 2. Check Vector Memory for Semantic Duplicate
                is_dup = self.memory_manager.is_duplicate(t["title"], past_memories)
                if not is_dup:
                    approved_topics.append(t)
                else:
                    t["status"] = "REJECTED"
                    t["rejectionReason"] = "Semantic duplicate found in long-term persona memory (Cosine Similarity > 0.82)"

        # Sort approved topics by overall score descending
        approved_topics.sort(key=lambda x: x["score"]["overall"], reverse=True)

        if not approved_topics:
            top_topic = evaluated_topics[0] if evaluated_topics else {
                "title": "Autonomous AI Multi-Agent Architectures",
                "summary": "Exploring production patterns for self-directing AI creators.",
                "source": "AI Research Digest",
                "url": "https://ai-research.org/multi-agent",
                "urlHash": "default_hash",
                "score": {"overall": 8.5}
            }
        else:
            top_topic = approved_topics[0]

        # 3. Generate Post Content with Google Gemini LLM API
        post_data = gemini_client.generate_post(top_topic, persona_context)

        embedding = self.memory_manager.generate_dummy_embedding(top_topic["title"] + " " + post_data["text"])

        return {
            "topic": top_topic,
            "evaluatedTopics": evaluated_topics,
            "post": {
                "text": post_data["text"],
                "rationale": post_data["rationale"],
                "sources": [{"title": top_topic["source"], "url": top_topic["url"]}],
                "tags": ["AI", "Gemini", "TechNews", "AutonomousAgents"]
            },
            "embedding": embedding
        }

pipeline = AutonomousAIPipeline()
