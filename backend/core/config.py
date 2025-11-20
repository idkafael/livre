"""
Configurações do projeto
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Mercado Pago (obrigatório via variável de ambiente)
    MERCADOPAGO_ACCESS_TOKEN: str
    
    # Webhook URL (opcional)
    WEBHOOK_URL: Optional[str] = None
    
    # Database (se necessário)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global de settings
settings = Settings()

