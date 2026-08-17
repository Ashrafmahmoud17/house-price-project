from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "House Price Prediction API"
    model_path: str = "models/house_price.pkl"
    locations_path: str = "../frontend/src/locations.json"
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "INFO"


settings = Settings()
