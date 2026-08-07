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

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python FastAPI AI Service"}

@app.post(f"{settings.API_V1_STR}/agent/execute")
def execute_autonomous_agent(request: ExecuteAgentRequest):
    try:
        persona_context = {
            "name": "Autonomous AI Creator",
            "domain": "Artificial Intelligence & Technology",
            "voiceStyle": "Authoritative & Insightful"
        }
        
        # Execute autonomous discovery, evaluation, deduplication, & synthesis pipeline
        result = pipeline.run_autonomous_cycle(persona_context, [])
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
