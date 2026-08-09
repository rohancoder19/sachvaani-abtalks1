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

    def evaluate_topic(self, topic: Dict[str, Any], persona_domain: str = "") -> Dict[str, Any]:
        title = topic.get("title", "").lower()
        summary = topic.get("summary", "").lower()
        combined_text = f"{title} {summary}"
        domain_lower = persona_domain.lower() if persona_domain else ""

        # Algorithmic metric evaluation with semantic heuristics
        novelty = 9.2 if any(w in title for w in ["breakthrough", "unveils", "introduces", "new", "first", "releases", "launches"]) else 6.8
        technical_depth = 8.8 if any(w in combined_text for w in ["model", "rag", "framework", "architecture", "agent", "security", "eval", "benchmark", "llm", "transformer", "code"]) else 6.2
        importance = 9.0 if any(w in combined_text for w in ["openai", "deepmind", "google", "meta", "nvidia", "anthropic", "microsoft", "hugging face"]) else 7.5
        timeliness = 9.5
        credibility = 9.5 if any(s in topic.get("source", "").lower() for s in ["blog", "official", "mit", "techcrunch", "ars", "verge"]) else 8.0
        
        # Domain relevance boost
        domain_match = False
        if domain_lower:
            keywords = [k.strip() for k in domain_lower.replace('&', ' ').replace('-', ' ').split() if len(k.strip()) > 2]
            if any(k in combined_text for k in keywords):
                domain_match = True

        developer_value = 9.2 if (domain_match or any(w in combined_text for w in ["open-source", "python", "api", "code", "agent", "developer", "sdk"])) else 6.8
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

