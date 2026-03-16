import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, ingest, agents
from app.core.config import settings
from app.workers.ingestion_worker import start_worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)


def _worker_done_callback(task: asyncio.Task) -> None:
    try:
        exc = task.exception()
        if exc:
            logger.error("Ingestion worker crashed: %s", exc, exc_info=exc)
    except asyncio.CancelledError:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_worker())
    task.add_done_callback(_worker_done_callback)
    logger.info("Ingestion worker task created")
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="AgentPlatform AI Service",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(agents.router, prefix="/agent", tags=["Agents"])


@app.get("/health")
async def health():
    return {"status": "ok"}
