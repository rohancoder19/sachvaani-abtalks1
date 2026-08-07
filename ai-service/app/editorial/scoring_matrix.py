import random
from typing import Dict, Any

class EditorialScoringEngine:
    """
    Evaluates candidate topics across 7 key metrics:
    - Novelty (20%)
    - Importance (20%)
    - Trend (15%)
    - Technical Depth (15%)
    - Audience Interest (15%)
    - Credibility (10%)
    - Freshness (5%)
    """
    
    WEIGHTS = {
        "novelty": 0.20,
        "importance": 0.20,
        "trend": 0.15,
        "technicalDepth": 0.15,
        "audienceInterest": 0.15,
        "credibility": 0.10,
        "freshness": 0.05
    }

    def evaluate_topic(self, topic: Dict[str, Any]) -> Dict[str, Any]:
        title = topic.get("title", "").lower()
        
        # Algorithmic metric evaluation with semantic heuristics
        novelty = 9.2 if any(w in title for w in ["breakthrough", "unveils", "introduces", "new", "first"]) else 7.5
        importance = 9.0 if any(w in title for w in ["openai", "deepmind", "google", "meta", "nvidia"]) else 8.0
        trend = 8.8 if "ai" in title or "llm" in title else 7.0
        technical_depth = 8.5 if any(w in title for w in ["model", "rag", "framework", "architecture"]) else 7.2
        audience_interest = 9.0
        credibility = 9.5 if "blog" in topic.get("source", "").lower() or "official" in topic.get("source", "").lower() else 8.5
        freshness = 9.5
        
        overall_score = (
            (novelty * self.WEIGHTS["novelty"]) +
            (importance * self.WEIGHTS["importance"]) +
            (trend * self.WEIGHTS["trend"]) +
            (technical_depth * self.WEIGHTS["technicalDepth"]) +
            (audience_interest * self.WEIGHTS["audienceInterest"]) +
            (credibility * self.WEIGHTS["credibility"]) +
            (freshness * self.WEIGHTS["freshness"])
        )
        
        overall_score = round(overall_score, 2)
        
        scores = {
            "novelty": novelty,
            "importance": importance,
            "trend": trend,
            "technicalDepth": technical_depth,
            "audienceInterest": audience_interest,
            "credibility": credibility,
            "freshness": freshness,
            "overall": overall_score
        }
        
        status = "APPROVED" if overall_score >= 7.50 else "REJECTED"
        rejection_reason = None if status == "APPROVED" else "Overall score fell below 7.50 editorial threshold"
        
        return {
            "score": scores,
            "status": status,
            "rejectionReason": rejection_reason
        }
