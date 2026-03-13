from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool = True
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    qdrant_url: str = "http://localhost:6333"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/agentplatform"
    redis_url: str = "redis://localhost:6379"
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"

    # LLM settings
    llm_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # Chunking settings
    chunk_size: int = 1000
    chunk_overlap: int = 200

    class Config:
        env_file = ".env"


settings = Settings()
