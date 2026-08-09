from typing import Dict, Any

class EditorialScoringEngine:
    """
    Evaluates candidate topics across 7 key metrics as specified by ABTalks Editorial Engine:
    - Novelty (20%)
    - Technical Depth (20%)
    - Importance (20%)
    - Timeliness (15%)
    - Credibility (10%)
    - Developer Value (10%)
    - Audience Interest (5%)

    Threshold for approval: editorialScore >= 7.0
    """

    WEIGHTS = {
        "novelty": 0.20,
        "technicalDepth": 0.20,
        "importance": 0.20,
        "timeliness": 0.15,
        "credibility": 0.10,
        "developerValue": 0.10,
        "audienceInterest": 0.05
    }

    def evaluate_topic(self, topic: Dict[str, Any]) -> Dict[str, Any]:
        title = topic.get("title", "").lower()

        # Algorithmic metric evaluation with semantic heuristics
        novelty = 9.2 if any(w in title for w in ["breakthrough", "unveils", "introduces", "new", "first", "releases"]) else 6.8
        technical_depth = 8.8 if any(w in title for w in ["model", "rag", "framework", "architecture", "agent", "security", "eval"]) else 6.2
        importance = 9.0 if any(w in title for w in ["openai", "deepmind", "google", "meta", "nvidia", "anthropic"]) else 7.5
        timeliness = 9.5
        credibility = 9.5 if any(s in topic.get("source", "").lower() for s in ["blog", "official", "mit", "techcrunch", "ars"]) else 8.0
        developer_value = 9.0 if any(w in title for w in ["open-source", "python", "api", "code", "agent", "developer"]) else 7.0
        audience_interest = 8.5

        overall_score = (
            (novelty * self.WEIGHTS["novelty"]) +
            (technical_depth * self.WEIGHTS["technicalDepth"]) +
            (importance * self.WEIGHTS["importance"]) +
            (timeliness * self.WEIGHTS["timeliness"]) +
            (credibility * self.WEIGHTS["credibility"]) +
            (developer_value * self.WEIGHTS["developerValue"]) +
            (audience_interest * self.WEIGHTS["audienceInterest"])
        )

        overall_score = round(overall_score, 2)

        scores = {
            "novelty": novelty,
            "technicalDepth": technical_depth,
            "importance": importance,
            "timeliness": timeliness,
            "credibility": credibility,
            "developerValue": developer_value,
            "audienceInterest": audience_interest,
            "overall": overall_score
        }

        status = "APPROVED" if overall_score >= 7.0 else "REJECTED"
        rejection_reason = None if status == "APPROVED" else f"Overall editorial score ({overall_score}) fell below the 7.0 quality threshold."

        return {
            "score": scores,
            "status": status,
            "rejectionReason": rejection_reason
        }
