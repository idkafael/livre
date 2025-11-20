"""
🌀 CaosBot - Serviço de Integração com Mercado Pago
"""

import mercadopago
from typing import Dict, Optional
from backend.core.config import settings
from backend.models.payment import PaymentMethod


class MercadoPagoService:
    """Serviço para integração com Mercado Pago"""
    
    def __init__(self):
        """Inicializa o SDK do Mercado Pago"""
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            raise ValueError("MERCADOPAGO_ACCESS_TOKEN não configurado")
        
        self.sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
    
    def create_pix_payment(
        self,
        amount: float,
        description: str,
        payer_email: str,
        payer_name: str,
        external_reference: str
    ) -> Dict:
        """
        Cria um pagamento PIX
        
        Args:
            amount: Valor do pagamento
            description: Descrição do pagamento
            payer_email: Email do pagador
            payer_name: Nome do pagador
            external_reference: Referência externa (transaction_id)
        
        Returns:
            Dict com os dados do pagamento criado
        """
        payment_data = {
            "transaction_amount": float(amount),
            "description": description,
            "payment_method_id": "pix",
            "payer": {
                "email": payer_email,
                "first_name": payer_name.split()[0] if payer_name else "",
                "last_name": " ".join(payer_name.split()[1:]) if payer_name and len(payer_name.split()) > 1 else "",
            },
            "external_reference": external_reference,
            "notification_url": f"{settings.WEBHOOK_URL}/api/payments/webhook" if hasattr(settings, 'WEBHOOK_URL') else None,
        }
        
        # Remover notification_url se não estiver configurado
        if not payment_data.get("notification_url"):
            payment_data.pop("notification_url", None)
        
        result = self.sdk.payment().create(payment_data)
        
        if result["status"] == 201:
            payment = result["response"]
            return {
                "success": True,
                "payment_id": payment["id"],
                "status": payment["status"],
                "status_detail": payment["status_detail"],
                "point_of_interaction": payment.get("point_of_interaction", {}),
                "qr_code": payment.get("point_of_interaction", {}).get("transaction_data", {}).get("qr_code"),
                "qr_code_base64": payment.get("point_of_interaction", {}).get("transaction_data", {}).get("qr_code_base64"),
                "ticket_url": payment.get("point_of_interaction", {}).get("transaction_data", {}).get("ticket_url"),
            }
        else:
            return {
                "success": False,
                "error": result.get("response", {}).get("message", "Erro ao criar pagamento"),
                "status": result.get("status"),
            }
    
    def create_credit_card_payment(
        self,
        amount: float,
        description: str,
        payer_email: str,
        payer_name: str,
        token: str,  # Token do cartão gerado pelo frontend
        installments: int = 1,
        external_reference: str = None
    ) -> Dict:
        """
        Cria um pagamento com cartão de crédito
        
        Args:
            amount: Valor do pagamento
            description: Descrição do pagamento
            payer_email: Email do pagador
            payer_name: Nome do pagador
            token: Token do cartão gerado pelo Mercado Pago
            installments: Número de parcelas
            external_reference: Referência externa (transaction_id)
        
        Returns:
            Dict com os dados do pagamento criado
        """
        payment_data = {
            "transaction_amount": float(amount),
            "description": description,
            "payment_method_id": "credit_card",
            "token": token,
            "installments": installments,
            "payer": {
                "email": payer_email,
                "first_name": payer_name.split()[0] if payer_name else "",
                "last_name": " ".join(payer_name.split()[1:]) if payer_name and len(payer_name.split()) > 1 else "",
            },
            "external_reference": external_reference,
            "notification_url": f"{settings.WEBHOOK_URL}/api/payments/webhook" if hasattr(settings, 'WEBHOOK_URL') else None,
        }
        
        # Remover notification_url se não estiver configurado
        if not payment_data.get("notification_url"):
            payment_data.pop("notification_url", None)
        
        result = self.sdk.payment().create(payment_data)
        
        if result["status"] == 201:
            payment = result["response"]
            return {
                "success": True,
                "payment_id": payment["id"],
                "status": payment["status"],
                "status_detail": payment["status_detail"],
            }
        else:
            return {
                "success": False,
                "error": result.get("response", {}).get("message", "Erro ao criar pagamento"),
                "status": result.get("status"),
            }
    
    def get_payment(self, payment_id: str) -> Optional[Dict]:
        """
        Busca um pagamento pelo ID do Mercado Pago
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
        
        Returns:
            Dict com os dados do pagamento ou None se não encontrado
        """
        result = self.sdk.payment().get(payment_id)
        
        if result["status"] == 200:
            return result["response"]
        return None
    
    def cancel_payment(self, payment_id: str) -> Dict:
        """
        Cancela um pagamento
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
        
        Returns:
            Dict com o resultado da operação
        """
        result = self.sdk.payment().cancel(payment_id)
        
        if result["status"] == 200:
            return {
                "success": True,
                "payment": result["response"]
            }
        else:
            return {
                "success": False,
                "error": result.get("response", {}).get("message", "Erro ao cancelar pagamento"),
            }
    
    def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict:
        """
        Estorna um pagamento (parcial ou total)
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
            amount: Valor a estornar (None para estorno total)
        
        Returns:
            Dict com o resultado da operação
        """
        refund_data = {}
        if amount:
            refund_data["amount"] = float(amount)
        
        result = self.sdk.refund().create(payment_id, refund_data)
        
        if result["status"] == 201:
            return {
                "success": True,
                "refund": result["response"]
            }
        else:
            return {
                "success": False,
                "error": result.get("response", {}).get("message", "Erro ao estornar pagamento"),
            }




