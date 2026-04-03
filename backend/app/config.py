"""Application settings loaded from environment / .env file."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_debug: bool = False

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # External APIs (empty → use simulation)
    yandex_traffic_api_key: str = ""
    twogis_api_key: str = ""

    # OpenAI (empty → fall back to rule-based engine)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_timeout: int = 15

    # Simulation
    simulation_enabled: bool = True
    simulation_seed: int = 42

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def use_real_traffic_api(self) -> bool:
        return bool(self.yandex_traffic_api_key or self.twogis_api_key)

    @property
    def use_openai(self) -> bool:
        return bool(self.openai_api_key)


settings = Settings()
