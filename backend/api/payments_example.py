"""
🌀 CaosBot - API de Pagamentos com Integração Mercado Pago
EXEMPLO DE IMPLEMENTAÇÃO
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
import uuid

from backend.core.database import get_db
from backend.models.payment import Payment, PaymentStatus, PaymentMethod
from backend.models.plan import Plan
from backend.services.mercado_pago_service import MercadoPagoService

router = APIRouter()


class PaymentCreate(BaseModel):
    """Schema para criar pagamento"""
    # Dados do pedido
    amount: float
    description: str
    payment_method: str  # 'PIX' ou 'CREDIT_CARD'
    # Dados do pagador
    payer_email: str
    payer_name: str
    payer_phone: str = None  # Opcional
    # Para cartão de crédito
    card_token: str = None  # Token gerado pelo frontend
    installments: int = 1
    # Campos opcionais para compatibilidade com sistema existente
    plan_id: int = None  # Opcional, pode ser usado se houver sistema de planos
    user_id: int = None  # Opcional, pode ser usado se houver sistema de usuários


class PaymentResponse(BaseModel):
    """Schema de resposta de pagamento"""
    id: int
    transaction_id: str
    amount: float
    status: PaymentStatus
    payment_method: PaymentMethod
    created_at: datetime
    # Dados do Mercado Pago
    mercado_pago_id: str = None
    qr_code: str = None
    qr_code_base64: str = None
    ticket_url: str = None
    
    class Config:
        from_attributes = True


@router.post("/create", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(data: PaymentCreate, db: AsyncSession = Depends(get_db)):
    """
    Criar novo pagamento com integração Mercado Pago
    """
    # Converter payment_method string para enum
    from backend.models.payment import PaymentMethod as PM
    if data.payment_method.upper() == 'PIX':
        payment_method_enum = PM.PIX
    elif data.payment_method.upper() == 'CREDIT_CARD':
        payment_method_enum = PM.CREDIT_CARD
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Método de pagamento inválido. Use 'PIX' ou 'CREDIT_CARD'"
        )
    
    # Se plan_id foi fornecido, buscar plano (opcional)
    plan = None
    if data.plan_id:
        result = await db.execute(select(Plan).where(Plan.id == data.plan_id))
        plan = result.scalar_one_or_none()
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plano não encontrado"
            )
        # Usar valor do plano se fornecido
        amount = plan.price
        description = f"Pagamento - {plan.name}"
    else:
        # Usar valores fornecidos diretamente
        amount = data.amount
        description = data.description
    
    # Calcular taxas (se houver configuração)
    from backend.core.config import settings
    fee = getattr(settings, 'TRANSACTION_FEE_FIXED', 0.0)
    net_amount = amount - fee
    
    # Criar transaction_id único
    transaction_id = str(uuid.uuid4())
    
    # Criar pagamento no banco
    payment = Payment(
        transaction_id=transaction_id,
        user_id=data.user_id or 0,  # Default se não fornecido
        plan_id=plan.id if plan else None,
        amount=amount,
        fee=fee,
        net_amount=net_amount,
        payment_method=payment_method_enum,
        status=PaymentStatus.PENDING,
        payer_email=data.payer_email,
        payer_name=data.payer_name,
        created_at=datetime.utcnow()
    )
    
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    # Integrar com Mercado Pago
    try:
        mp_service = MercadoPagoService()
        
        if payment_method_enum == PM.PIX:
            # Criar pagamento PIX
            mp_result = mp_service.create_pix_payment(
                amount=amount,
                description=description,
                payer_email=data.payer_email,
                payer_name=data.payer_name,
                external_reference=transaction_id
            )
            
            if mp_result["success"]:
                # Atualizar pagamento com dados do Mercado Pago
                payment.external_id = str(mp_result["payment_id"])
                payment.payment_details = {
                    "mercado_pago_id": mp_result["payment_id"],
                    "status": mp_result["status"],
                    "status_detail": mp_result["status_detail"],
                    "qr_code": mp_result.get("qr_code"),
                    "qr_code_base64": mp_result.get("qr_code_base64"),
                    "ticket_url": mp_result.get("ticket_url"),
                }
                
                # Atualizar status baseado no retorno do Mercado Pago
                if mp_result["status"] == "approved":
                    payment.status = PaymentStatus.APPROVED
                    payment.approved_at = datetime.utcnow()
                elif mp_result["status"] == "pending":
                    payment.status = PaymentStatus.PENDING
                elif mp_result["status"] == "rejected":
                    payment.status = PaymentStatus.REJECTED
                
                await db.commit()
                await db.refresh(payment)
            else:
                # Erro ao criar pagamento no Mercado Pago
                payment.status = PaymentStatus.REJECTED
                payment.payment_details = {"error": mp_result.get("error")}
                await db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Erro ao criar pagamento: {mp_result.get('error')}"
                )
        
        elif payment_method_enum == PM.CREDIT_CARD:
            # Validar token do cartão
            if not data.card_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Token do cartão é obrigatório para pagamento com cartão de crédito"
                )
            
            # Criar pagamento com cartão
            mp_result = mp_service.create_credit_card_payment(
                amount=amount,
                description=description,
                payer_email=data.payer_email,
                payer_name=data.payer_name,
                token=data.card_token,
                installments=data.installments,
                external_reference=transaction_id
            )
            
            if mp_result["success"]:
                # Atualizar pagamento com dados do Mercado Pago
                payment.external_id = str(mp_result["payment_id"])
                payment.payment_details = {
                    "mercado_pago_id": mp_result["payment_id"],
                    "status": mp_result["status"],
                    "status_detail": mp_result["status_detail"],
                    "installments": data.installments,
                }
                
                # Atualizar status baseado no retorno do Mercado Pago
                if mp_result["status"] == "approved":
                    payment.status = PaymentStatus.APPROVED
                    payment.approved_at = datetime.utcnow()
                elif mp_result["status"] == "pending":
                    payment.status = PaymentStatus.PENDING
                elif mp_result["status"] == "rejected":
                    payment.status = PaymentStatus.REJECTED
                
                await db.commit()
                await db.refresh(payment)
            else:
                # Erro ao criar pagamento no Mercado Pago
                payment.status = PaymentStatus.REJECTED
                payment.payment_details = {"error": mp_result.get("error")}
                await db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Erro ao criar pagamento: {mp_result.get('error')}"
                )
    
    except ValueError as e:
        # Erro de configuração (ex: token não configurado)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro de configuração: {str(e)}"
        )
    except Exception as e:
        # Outros erros
        payment.status = PaymentStatus.REJECTED
        payment.payment_details = {"error": str(e)}
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar pagamento: {str(e)}"
        )
    
    # Preparar resposta
    response_data = {
        "id": payment.id,
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "status": payment.status,
        "payment_method": payment.payment_method,
        "created_at": payment.created_at,
    }
    
    # Adicionar dados do Mercado Pago se disponíveis
    if payment.payment_details:
        response_data["mercado_pago_id"] = payment.payment_details.get("mercado_pago_id")
        response_data["qr_code"] = payment.payment_details.get("qr_code")
        response_data["qr_code_base64"] = payment.payment_details.get("qr_code_base64")
        response_data["ticket_url"] = payment.payment_details.get("ticket_url")
    
    return response_data


@router.post("/webhook")
async def payment_webhook(webhook_data: dict, db: AsyncSession = Depends(get_db)):
    """
    Webhook para receber notificações do Mercado Pago
    """
    try:
        # O Mercado Pago envia notificações com o campo "data"
        if "data" in webhook_data and "id" in webhook_data["data"]:
            payment_id = webhook_data["data"]["id"]
            
            # Buscar pagamento no Mercado Pago
            mp_service = MercadoPagoService()
            mp_payment = mp_service.get_payment(payment_id)
            
            if mp_payment:
                # Buscar pagamento no banco pelo external_id
                result = await db.execute(
                    select(Payment).where(Payment.external_id == str(payment_id))
                )
                payment = result.scalar_one_or_none()
                
                if payment:
                    # Atualizar status do pagamento
                    mp_status = mp_payment.get("status")
                    
                    if mp_status == "approved":
                        payment.status = PaymentStatus.APPROVED
                        if not payment.approved_at:
                            payment.approved_at = datetime.utcnow()
                    elif mp_status == "rejected":
                        payment.status = PaymentStatus.REJECTED
                    elif mp_status == "cancelled":
                        payment.status = PaymentStatus.CANCELLED
                    elif mp_status == "refunded":
                        payment.status = PaymentStatus.REFUNDED
                    
                    # Atualizar detalhes
                    payment.payment_details = {
                        **payment.payment_details,
                        "mercado_pago_status": mp_status,
                        "mercado_pago_status_detail": mp_payment.get("status_detail"),
                    }
                    
                    await db.commit()
                    
                    # TODO: Liberar acesso ao usuário se pagamento aprovado
                    # if payment.status == PaymentStatus.APPROVED:
                    #     await grant_user_access(payment.user_id, payment.plan_id)
        
        return {"message": "Webhook processado com sucesso"}
    
    except Exception as e:
        # Log do erro
        print(f"Erro ao processar webhook: {str(e)}")
        return {"message": "Erro ao processar webhook", "error": str(e)}


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Obter pagamento por ID
    """
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    # Preparar resposta
    response_data = {
        "id": payment.id,
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "status": payment.status,
        "payment_method": payment.payment_method,
        "created_at": payment.created_at,
    }
    
    # Adicionar dados do Mercado Pago se disponíveis
    if payment.payment_details:
        response_data["mercado_pago_id"] = payment.payment_details.get("mercado_pago_id")
        response_data["qr_code"] = payment.payment_details.get("qr_code")
        response_data["qr_code_base64"] = payment.payment_details.get("qr_code_base64")
        response_data["ticket_url"] = payment.payment_details.get("ticket_url")
    
    return response_data


@router.get("/status/{mercado_pago_id}")
async def get_payment_status(mercado_pago_id: str, db: AsyncSession = Depends(get_db)):
    """
    Obter status do pagamento pelo ID do Mercado Pago
    """
    # Buscar pagamento pelo external_id (mercado_pago_id)
    result = await db.execute(select(Payment).where(Payment.external_id == str(mercado_pago_id)))
    payment = result.scalar_one_or_none()
    
    if not payment:
        # Tentar buscar pelo payment_details
        from sqlalchemy import or_
        result = await db.execute(
            select(Payment).where(
                Payment.payment_details['mercado_pago_id'].astext == str(mercado_pago_id)
            )
        )
        payment = result.scalar_one_or_none()
    
    if not payment:
        # Se não encontrou no banco, buscar diretamente no Mercado Pago
        try:
            mp_service = MercadoPagoService()
            mp_payment = mp_service.get_payment(mercado_pago_id)
            
            if mp_payment:
                return {
                    "status": mp_payment.get("status"),
                    "mercado_pago_id": mercado_pago_id,
                    "status_detail": mp_payment.get("status_detail")
                }
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    # Retornar status do pagamento
    return {
        "id": payment.id,
        "transaction_id": payment.transaction_id,
        "status": payment.status.value if hasattr(payment.status, 'value') else str(payment.status),
        "mercado_pago_id": mercado_pago_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method.value if hasattr(payment.payment_method, 'value') else str(payment.payment_method),
    }

