import math
import re
from typing import List, Dict, Any

class PersonaMemoryManager:
    """
    Manages long-term vector memory and semantic similarity deduplication.
    Prevents repetitive posts by calculating cosine distance, title fingerprinting, and URL matching against previous memories.
    """

    def normalize_text(self, text: str) -> str:
        """Normalizes text by lowercasing and stripping punctuation and stop words."""
        cleaned = re.sub(r'[^\w\s]', '', text.lower())
        stop_words = {'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of'}
        words = [w for w in cleaned.split() if w not in stop_words]
        return ' '.join(words)

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

    def is_duplicate(self, candidate_title: str, previous_memories: List[Dict[str, Any]], candidate_url: str = "", threshold: float = 0.82) -> bool:
        """Checks if candidate topic is a duplicate by URL, normalized title fingerprint, or vector embedding similarity."""
        cand_lower = candidate_title.strip().lower()
        cand_fp = self.normalize_text(candidate_title)
        cand_url = candidate_url.strip().lower()
        cand_embedding = self.generate_dummy_embedding(candidate_title)
        
        for mem in previous_memories:
            # 1. Exact Source URL Match
            mem_url = mem.get("url", "").strip().lower()
            if cand_url and mem_url and cand_url == mem_url:
                return True

            # 2. Exact Title Match
            summary_lower = mem.get("summary", "").strip().lower()
            if summary_lower and cand_lower == summary_lower:
                return True

            # 3. Normalized Title Fingerprint Match
            mem_fp = self.normalize_text(summary_lower)
            if cand_fp and mem_fp and cand_fp == mem_fp:
                return True

            # 4. Vector Cosine Similarity Check
            past_vec = mem.get("embeddings", [])
            if past_vec and len(past_vec) == 1536:
                sim = self.calculate_cosine_similarity(cand_embedding, past_vec)
                if sim >= threshold:
                    return True
        return False

