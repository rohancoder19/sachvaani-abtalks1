import feedparser
import hashlib
import time
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

LIVE_SOURCES = [
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/"},
    {"name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/feed/"},
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/feed/"},
    {"name": "HackerNews AI", "url": "https://hnrss.org/newest?q=AI"},
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index"},
    {"name": "The Verge AI", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"},
    {"name": "Google News AI", "url": "https://news.google.com/rss/search?q=Artificial+Intelligence&hl=en-US&gl=US&ceid=US:en"},
    {"name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/"},
    {"name": "Hugging Face Blog", "url": "https://huggingface.co/blog/feed.xml"}
]

def fetch_single_source(source: Dict[str, str]) -> List[Dict[str, Any]]:
    items = []
    try:
        parsed = feedparser.parse(
            source["url"],
            request_headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        for entry in parsed.entries[:5]:
            url = entry.get("link", "").strip()
            title = entry.get("title", "").strip()
            summary = entry.get("summary", entry.get("description", title)).strip()
            
            # Reject candidates without valid HTTP/HTTPS URL or title
            if not url or not (url.startswith("http://") or url.startswith("https://")) or not title:
                continue

            url_hash = hashlib.sha256(url.encode('utf-8')).hexdigest()
            published_at = entry.get("published", entry.get("updated", ""))
            
            items.append({
                "title": title,
                "summary": summary[:400],
                "source": source["name"],
                "url": url,
                "urlHash": url_hash,
                "publishedAt": published_at
            })
    except Exception as e:
        print(f"Error fetching source {source['name']}: {e}")
    return items

class TopicDiscoveryService:
    def fetch_live_topics(self) -> List[Dict[str, Any]]:
        topics = []
        with ThreadPoolExecutor(max_workers=len(LIVE_SOURCES)) as executor:
            futures = [executor.submit(fetch_single_source, source) for source in LIVE_SOURCES]
            for future in as_completed(futures):
                try:
                    res = future.result(timeout=5.0)
                    topics.extend(res)
                except Exception as e:
                    print(f"Parallel feed error/timeout: {e}")

        return topics

