import math
from typing import List, Dict, Any

class PersonaMemoryManager:
    """
    Manages long-term vector memory and semantic similarity deduplication.
    Prevents repetitive posts by calculating cosine distance against previous embeddings.
    """

    def generate_dummy_embedding(self, text: str) -> List[float]:
        """Generates a normalized 1536-dimensional mock embedding vector derived from text hash."""
        seed = sum(ord(c) for c in text)
        vec = [(math.sin(seed + i) + 1.0) / 2.0 for i in range(1536)]
        magnitude = math.sqrt(sum(x*x for x in vec))
        return [x / magnitude for x in vec]

    def calculate_cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Calculates cosine similarity between two 1536-d vectors."""
        if len(vec_a) != len(vec_b):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)

    def is_duplicate(self, candidate_text: str, previous_memories: List[Dict[str, Any]], threshold: float = 0.82) -> bool:
        """Checks if candidate topic embedding is > threshold cosine similarity or exact title match to past memory entries."""
        cand_lower = candidate_text.strip().lower()
        cand_embedding = self.generate_dummy_embedding(candidate_text)
        
        for mem in previous_memories:
            summary_lower = mem.get("summary", "").strip().lower()
            if summary_lower and (cand_lower == summary_lower or cand_lower in summary_lower or summary_lower in cand_lower):
                return True
                
            past_vec = mem.get("embeddings", [])
            if past_vec and len(past_vec) == 1536:
                sim = self.calculate_cosine_similarity(cand_embedding, past_vec)
                if sim >= threshold:
                    return True
        return False
