"""Document ingestion service — chunks, embeds, and stores documents."""

import logging
from uuid import UUID

import httpx
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.core.config import settings
from app.services.vector_store import get_vector_store, ensure_collection

logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    async def ingest_text(
        self, agent_id: UUID | str, content: str, source_id: str = ""
    ) -> int:
        """Chunk text, embed, and store in Qdrant. Returns number of chunks."""
        ensure_collection(agent_id)
        docs = self.splitter.create_documents(
            texts=[content],
            metadatas=[{"source": "text", "source_id": source_id}],
        )
        vector_store = get_vector_store(agent_id)
        await vector_store.aadd_documents(docs)
        logger.info(f"Ingested {len(docs)} chunks for agent {agent_id}")
        return len(docs)

    async def ingest_url(
        self, agent_id: UUID | str, url: str, source_id: str = ""
    ) -> int:
        """Scrape URL, chunk, embed, and store. Returns number of chunks."""
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to fetch URL {url}: {e}")
            raise ValueError(f"Failed to fetch URL: {e}")

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove script and style elements
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        if not text.strip():
            raise ValueError("No text content found at URL")

        ensure_collection(agent_id)
        docs = self.splitter.create_documents(
            texts=[text],
            metadatas=[{"source": url, "source_id": source_id}],
        )
        vector_store = get_vector_store(agent_id)
        await vector_store.aadd_documents(docs)
        logger.info(f"Ingested {len(docs)} chunks from URL {url} for agent {agent_id}")
        return len(docs)

    async def ingest_pdf(
        self, agent_id: UUID | str, content: bytes, source_id: str = ""
    ) -> int:
        """Parse PDF, chunk, embed, and store. Returns number of chunks."""
        from pypdf import PdfReader
        from io import BytesIO

        try:
            reader = PdfReader(BytesIO(content))
            text = "\n\n".join(
                page.extract_text() or "" for page in reader.pages
            )
        except Exception as e:
            logger.error(f"Failed to parse PDF: {e}")
            raise ValueError(f"Failed to parse PDF: {e}")

        if not text.strip():
            raise ValueError("No text content found in PDF")

        ensure_collection(agent_id)
        docs = self.splitter.create_documents(
            texts=[text],
            metadatas=[{"source": "pdf", "source_id": source_id}],
        )
        vector_store = get_vector_store(agent_id)
        await vector_store.aadd_documents(docs)
        logger.info(f"Ingested {len(docs)} chunks from PDF for agent {agent_id}")
        return len(docs)
