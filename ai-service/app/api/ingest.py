import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import IngestRequest, IngestResponse
from app.services.ingestion_service import IngestionService

router = APIRouter()
logger = logging.getLogger(__name__)
ingestion_service = IngestionService()


@router.post("", response_model=IngestResponse)
async def ingest(request: IngestRequest):
    try:
        source_id = str(request.source_id)

        match request.source_type:
            case "text":
                await ingestion_service.ingest_text(
                    request.agent_id, request.content, source_id
                )
            case "url":
                await ingestion_service.ingest_url(
                    request.agent_id, request.content, source_id
                )
            case "pdf":
                import base64
                pdf_bytes = base64.b64decode(request.content)
                await ingestion_service.ingest_pdf(
                    request.agent_id, pdf_bytes, source_id
                )
            case _:
                raise HTTPException(400, f"Unknown source type: {request.source_type}")

        return IngestResponse(source_id=source_id, status="completed")

    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        return IngestResponse(source_id=str(request.source_id), status="failed")
