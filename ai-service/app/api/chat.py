from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import RagService

router = APIRouter()
rag_service = RagService()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await rag_service.query(
        agent_id=request.agent_id,
        question=request.message,
        history=request.history,
        instructions=request.instructions,
        llm_provider=request.llm_provider,
        llm_model=request.llm_model,
        api_key=request.api_key,
    )
    return ChatResponse(**result)
