"""Vector store service — manages Qdrant collections per agent."""

import logging
from uuid import UUID

from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, Filter, FieldCondition, MatchValue

from app.core.config import settings

logger = logging.getLogger(__name__)


def _collection_name(agent_id: UUID | str) -> str:
    return f"agent_{str(agent_id).replace('-', '')}"


def _get_client() -> QdrantClient:
    return QdrantClient(url=settings.qdrant_url)


def _get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        openai_api_key=settings.openai_api_key,
    )


def ensure_collection(agent_id: UUID | str) -> None:
    """Create Qdrant collection if it doesn't exist."""
    client = _get_client()
    name = _collection_name(agent_id)
    collections = [c.name for c in client.get_collections().collections]
    if name not in collections:
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(
                size=settings.embedding_dimensions,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"Created collection: {name}")


def get_vector_store(agent_id: UUID | str) -> QdrantVectorStore:
    """Get a LangChain vector store for the given agent."""
    ensure_collection(agent_id)
    return QdrantVectorStore(
        client=_get_client(),
        collection_name=_collection_name(agent_id),
        embedding=_get_embeddings(),
    )


def get_vectors_count(agent_id: UUID | str) -> int:
    """Get the number of vectors in the agent's collection."""
    client = _get_client()
    name = _collection_name(agent_id)
    try:
        info = client.get_collection(name)
        return info.points_count or 0
    except Exception:
        return 0


def delete_collection(agent_id: UUID | str) -> bool:
    """Delete the agent's vector collection."""
    client = _get_client()
    name = _collection_name(agent_id)
    try:
        client.delete_collection(name)
        logger.info(f"Deleted collection: {name}")
        return True
    except Exception:
        return False
