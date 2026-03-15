"""RabbitMQ consumer for async ingestion jobs."""

import asyncio
import json
import logging
import base64
import uuid
from datetime import datetime, timezone

import aio_pika

from app.core.config import settings
from app.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)


async def publish_status(
    publish_channel: aio_pika.abc.AbstractChannel,
    source_id: str,
    status: str,
) -> None:
    """Publish ingestion status update back to .NET in MassTransit envelope format."""
    try:
        # MassTransit expects its JSON envelope; plain JSON causes R-FAULT
        envelope = {
            "messageId": str(uuid.uuid4()),
            "messageType": [
                "urn:message:AgentPlatform.Agents.Application.Messages:IngestionStatusUpdatedEvent"
            ],
            "message": {
                "sourceId": source_id,
                "status": status,
            },
            "sentTime": datetime.now(timezone.utc).isoformat(),
        }
        await publish_channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(envelope).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            ),
            routing_key="ingestion.status",
        )
        logger.info(f"Published status '{status}' for source {source_id}")
    except Exception as exc:
        logger.error(f"Failed to publish status for source {source_id}: {exc}")


async def start_worker():
    logger.info("Starting ingestion worker...")
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)

    consume_channel = await connection.channel()
    await consume_channel.set_qos(prefetch_count=1)

    # Declare exchange (MassTransit creates it as direct)
    exchange = await consume_channel.declare_exchange(
        "ingestion.requests", aio_pika.ExchangeType.DIRECT, durable=True
    )
    queue = await consume_channel.declare_queue("ingestion.requests", durable=True)
    # Bind queue to exchange (MassTransit publishes with empty routing key for direct)
    await queue.bind(exchange, routing_key="")

    publish_channel = await connection.channel()
    await publish_channel.declare_queue("ingestion.status", durable=True)

    ingestion_service = IngestionService()

    async def on_message(message: aio_pika.abc.AbstractIncomingMessage):
        async with message.process():
            body = json.loads(message.body.decode())
            logger.debug(f"Raw message keys: {list(body.keys())}")

            # MassTransit wraps payload in {"message": {...}} envelope with camelCase
            payload = body.get("message", body)
            agent_id = payload.get("agentId") or payload.get("agent_id", "")
            source_id = payload.get("sourceId") or payload.get("source_id", "")
            source_type = payload.get("sourceType") or payload.get("source_type", "")
            content = payload.get("content", "")

            logger.info(
                f"Processing ingestion: agent={agent_id}, "
                f"source={source_id}, type={source_type}"
            )

            try:
                await publish_status(publish_channel, source_id, "processing")

                match source_type:
                    case "text":
                        await ingestion_service.ingest_text(
                            agent_id, content, source_id
                        )
                    case "url":
                        await ingestion_service.ingest_url(
                            agent_id, content, source_id
                        )
                    case "pdf":
                        pdf_bytes = base64.b64decode(content)
                        await ingestion_service.ingest_pdf(
                            agent_id, pdf_bytes, source_id
                        )
                    case _:
                        logger.error(f"Unknown source type: {source_type}")
                        await publish_status(publish_channel, source_id, "failed")
                        return

                await publish_status(publish_channel, source_id, "ready")
                logger.info(f"Ingestion completed for source {source_id}")

            except Exception as e:
                logger.error(f"Ingestion failed for source {source_id}: {e}")
                await publish_status(publish_channel, source_id, "failed")

    await queue.consume(on_message)
    logger.info("Ingestion worker started, waiting for messages...")

    # Keep the worker running
    await asyncio.Future()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(start_worker())
