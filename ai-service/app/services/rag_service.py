"""RAG (Retrieval-Augmented Generation) service."""

import logging
from uuid import UUID

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.language_models import BaseChatModel

from app.models.schemas import MessageHistory
from app.services.vector_store import get_vector_store, get_vectors_count

logger = logging.getLogger(__name__)

SYSTEM_TEMPLATE = """You are an AI assistant. Use the following context to answer the user's question.
If you cannot find the answer in the context, say so honestly.

{agent_instructions}

Context from knowledge base:
{context}"""

MODEL_MAP = {
    "Gpt4o": "gpt-4o",
    "Gpt4oMini": "gpt-4o-mini",
    "Claude35Sonnet": "claude-3-5-sonnet-20241022",
    "Claude3Haiku": "claude-3-haiku-20240307",
    "Gemini15Pro": "gemini-1.5-pro",
    "Gemini15Flash": "gemini-1.5-flash",
}


def build_llm(provider: str, model: str, api_key: str) -> BaseChatModel:
    model_name = MODEL_MAP.get(model, model)
    if provider == "Anthropic":
        return ChatAnthropic(model=model_name, api_key=api_key, temperature=0.7)
    if provider == "Gemini":
        return ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key, temperature=0.7)
    return ChatOpenAI(model=model_name, api_key=api_key, temperature=0.7)


class RagService:
    async def query(
        self,
        agent_id: UUID,
        question: str,
        history: list[MessageHistory],
        instructions: str = "",
        llm_provider: str = "OpenAi",
        llm_model: str = "Gpt4oMini",
        api_key: str = "",
    ) -> dict:
        try:
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

            system_content = SYSTEM_TEMPLATE.format(
                agent_instructions=instructions or "Be helpful and concise.",
                context=context or "No knowledge base documents available.",
            )

            messages: list = [SystemMessage(content=system_content)]

            for msg in history[-10:]:
                if msg.role == "user":
                    messages.append(HumanMessage(content=msg.content))
                else:
                    messages.append(AIMessage(content=msg.content))

            messages.append(HumanMessage(content=question))

            llm = build_llm(llm_provider, llm_model, api_key)
            response = await llm.ainvoke(messages)

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
