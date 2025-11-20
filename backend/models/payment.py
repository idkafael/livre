"""
Modelo de Pagamento
"""
from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class PaymentStatus(str, Enum):
    """Status do pagamento"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    """Método de pagamento"""
    PIX = "pix"
    CREDIT_CARD = "credit_card"


class Payment(Base):
    """Modelo de pagamento"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, nullable=True)
    plan_id = Column(Integer, nullable=True)
    amount = Column(Float)
    fee = Column(Float, default=0.0)
    net_amount = Column(Float)
    payment_method = Column(SQLEnum(PaymentMethod))
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    payer_email = Column(String)
    payer_name = Column(String)
    external_id = Column(String, nullable=True)  # ID do Mercado Pago
    payment_details = Column(JSON, nullable=True)  # Detalhes do pagamento
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

