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
    )
    return ChatResponse(**result)
