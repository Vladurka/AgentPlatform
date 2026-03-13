from uuid import UUID
from fastapi import APIRouter
from app.models.schemas import AgentStatusResponse
from app.services.vector_store import get_vectors_count, delete_collection

router = APIRouter()


@router.get("/{agent_id}/status", response_model=AgentStatusResponse)
async def get_agent_status(agent_id: UUID):
    count = get_vectors_count(agent_id)
    return AgentStatusResponse(
        sources_count=0,  # would need DB query for actual count
        vectors_count=count,
        status="active" if count > 0 else "empty",
    )


@router.delete("/{agent_id}")
async def delete_agent(agent_id: UUID):
    success = delete_collection(agent_id)
    return {"success": success}
