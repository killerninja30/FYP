# Environment configuration for IoT Energy Management System

import os
from typing import Any, Dict, Optional

class Settings:
    # API Configuration
    API_TITLE: str = "IoT Energy Management API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Backend API for IoT-based Smart Energy Management System"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    RELOAD: bool = True
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./iot_energy.db"
    DATABASE_ECHO: bool = False  # Set to True for SQL query logging
    
    # CORS Configuration
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # WebSocket Configuration
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_MAX_CONNECTIONS: int = 100
    
    # Mock Data Configuration
    MOCK_DATA_ENABLED: bool = True
    MOCK_ROOMS_COUNT: int = 4
    MOCK_ZONES_PER_ROOM: int = 3
    
    # Energy Analytics Configuration
    DEFAULT_ENERGY_RATE: float = 4.0  # ₹4 per kWh
    EFFICIENCY_THRESHOLD: float = 85.0  # Minimum efficiency percentage
    
    # Device Configuration
    DEVICE_TIMEOUT: int = 300  # 5 minutes timeout for device responses
    MAX_DEVICE_RETRIES: int = 3
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: list = [".json", ".csv", ".xlsx"]
    
    # Cache Configuration
    CACHE_TTL: int = 300  # 5 minutes cache TTL
    
    # Notification Configuration
    EMAIL_ENABLED: bool = False
    SMS_ENABLED: bool = False
    PUSH_NOTIFICATIONS_ENABLED: bool = True
    
    @classmethod
    def get_database_url(cls) -> str:
        """Get database URL with proper formatting"""
        return cls.DATABASE_URL
    
    @classmethod
    def get_cors_config(cls) -> Dict[str, Any]:
        """Get CORS configuration"""
        return {
            "allow_origins": cls.CORS_ORIGINS,
            "allow_credentials": cls.CORS_CREDENTIALS,
            "allow_methods": cls.CORS_METHODS,
            "allow_headers": cls.CORS_HEADERS,
        }
    
    @classmethod
    def is_development(cls) -> bool:
        """Check if running in development mode"""
        return cls.DEBUG

# Global settings instance
settings = Settings()