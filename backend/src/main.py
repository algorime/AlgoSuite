from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from .agent import agent
from .agent.payload_suggestor import payload_suggestor_agent
from .agent.payload_suggestor_v2 import PayloadSuggestorV2
from .config import settings

app = FastAPI(
    title="AI Pentester Assistant",
    version="1.0",
    description="An AI-powered assistant for penetration testing.",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the langserve routes to the FastAPI app,
# including a playground for debugging
add_routes(
    app,
    agent,
    path="/agent",
    playground_type="default",
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
)

# Add the payload suggestor agent routes
add_routes(
    app,
    payload_suggestor_agent,
    path="/payload-suggestor",
    playground_type="default",
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
)

payload_suggestor_v2_agent = PayloadSuggestorV2()

@app.get("/")
async def health_check():
    return {"status": "ok"}
@app.post("/payload-suggestor/invoke/v2")
async def payload_suggestor_invoke_v2(request: dict):
    return await payload_suggestor_v2_agent.ainvoke({
        "request": request.get("request"),
        "user_message": request.get("user_message"),
        "db_type": request.get("db_type"),
    })

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)