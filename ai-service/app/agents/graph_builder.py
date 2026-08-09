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
        p_domain = persona_context.get("domain", "")
        
        evaluated_topics = []
        non_duplicate_approved = []
        
        for t in raw_topics:
            eval_result = self.editorial_engine.evaluate_topic(t, persona_domain=p_domain)
            t.update(eval_result)
            evaluated_topics.append(t)
            
            is_dup = self.memory_manager.is_duplicate(
                candidate_title=t.get("title", ""),
                previous_memories=past_memories,
                candidate_url=t.get("url", "")
            )
            if is_dup:
                t["status"] = "REJECTED"
                t["rejectionReason"] = "Duplicate found in long-term memory (exact URL, title match, or Cosine Similarity > 0.82)"
            elif eval_result["status"] == "APPROVED":
                non_duplicate_approved.append(t)

        # Sort non-duplicate approved topics by overall score descending
        non_duplicate_approved.sort(key=lambda x: x.get("score", {}).get("overall", 0.0), reverse=True)

        if not non_duplicate_approved:
            # If no candidate passes quality threshold or all are duplicates, return cycle status without creating a post
            return {
                "topic": None,
                "evaluatedTopics": evaluated_topics,
                "post": None,
                "embedding": None,
                "status": "NO_QUALIFYING_TOPIC",
                "message": "No non-duplicate candidate topic passed the 7.0 editorial quality threshold."
            }

        top_topic = non_duplicate_approved[0]

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
                "tags": ["AI", "TechNews", "AutonomousAgents"]
            },
            "embedding": embedding,
            "status": "SUCCESS"
        }


pipeline = AutonomousAIPipeline()
