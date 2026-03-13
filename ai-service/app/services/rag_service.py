"""RAG (Retrieval-Augmented Generation) service."""

import logging
from uuid import UUID

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.core.config import settings
from app.models.schemas import MessageHistory
from app.services.vector_store import get_vector_store, get_vectors_count

logger = logging.getLogger(__name__)

SYSTEM_TEMPLATE = """You are an AI assistant. Use the following context to answer the user's question.
If you cannot find the answer in the context, say so honestly.

{agent_instructions}

Context from knowledge base:
{context}"""


class RagService:
    def __init__(self):
        self._llm: ChatOpenAI | None = None

    @property
    def llm(self) -> ChatOpenAI:
        if self._llm is None:
            self._llm = ChatOpenAI(
                model=settings.llm_model,
                openai_api_key=settings.openai_api_key,
                temperature=0.7,
            )
        return self._llm

    async def query(
        self,
        agent_id: UUID,
        question: str,
        history: list[MessageHistory],
        instructions: str = "",
    ) -> dict:
        try:
            # Retrieve relevant documents
            context = ""
            sources: list[str] = []
            vectors_count = get_vectors_count(agent_id)

            if vectors_count > 0:
                vector_store = get_vector_store(agent_id)
                docs = await vector_store.asimilarity_search(question, k=4)
                context = "\n\n".join(doc.page_content for doc in docs)
                sources = list({
                    doc.metadata.get("source", "knowledge base")
                    for doc in docs
                })

            # Build messages
            system_content = SYSTEM_TEMPLATE.format(
                agent_instructions=instructions or "Be helpful and concise.",
                context=context or "No knowledge base documents available.",
            )

            messages: list = [SystemMessage(content=system_content)]

            for msg in history[-10:]:  # last 10 messages for context window
                if msg.role == "user":
                    messages.append(HumanMessage(content=msg.content))
                else:
                    messages.append(AIMessage(content=msg.content))

            messages.append(HumanMessage(content=question))

            # Call LLM
            response = await self.llm.ainvoke(messages)

            tokens_used = 0
            if response.usage_metadata:
                tokens_used = response.usage_metadata.get("total_tokens", 0)

            return {
                "answer": response.content,
                "sources": sources,
                "tokens_used": tokens_used,
            }

        except Exception as e:
            logger.error(f"RAG query failed for agent {agent_id}: {e}")
            return {
                "answer": "Sorry, I encountered an error processing your request.",
                "sources": [],
                "tokens_used": 0,
            }
