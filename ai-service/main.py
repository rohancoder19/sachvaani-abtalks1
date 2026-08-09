from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.agents.graph_builder import pipeline

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

class ExecuteAgentRequest(BaseModel):
    personaId: str
    pastMemories: Optional[list] = []
    persona: Optional[Dict[str, Any]] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI AI Service"}

@app.post(f"{settings.API_V1_STR}/agent/execute")
def execute_autonomous_agent(request: ExecuteAgentRequest):
    try:
        req_persona = request.persona or {}
        persona_context = {
            "name": req_persona.get("name", "Ada"),
            "domain": req_persona.get("domain", "AI Systems & Technology Intelligence"),
            "voiceStyle": req_persona.get("voiceStyle", "Technically curious, skeptical of hype, evidence-driven, developer-focused, analytical, concise")
        }
        
        # Execute autonomous discovery, evaluation, deduplication, & synthesis pipeline
        result = pipeline.run_autonomous_cycle(persona_context, request.pastMemories or [])
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
