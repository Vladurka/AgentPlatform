from uuid import UUID
from pydantic import BaseModel


class MessageHistory(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    agent_id: UUID
    session_id: str
    message: str
    history: list[MessageHistory] = []
    instructions: str = ""
    llm_provider: str = "OpenAi"
    llm_model: str = "Gpt4oMini"
    api_key: str = ""


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    tokens_used: int = 0


class IngestRequest(BaseModel):
    agent_id: UUID
    source_id: UUID
    source_type: str  # text, url, pdf
    content: str


class IngestResponse(BaseModel):
    source_id: str
    status: str


class AgentStatusResponse(BaseModel):
    sources_count: int
    vectors_count: int
    status: str
