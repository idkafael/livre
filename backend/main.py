"""
Aplicação principal FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.payments_example import router as payments_router

app = FastAPI(
    title="API de Pagamentos - Mercado Pago",
    description="API para integração com Mercado Pago",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rotas
app.include_router(payments_router, prefix="/api/payments", tags=["payments"])


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "API de Pagamentos - Mercado Pago",
        "version": "1.0.0",
        "endpoints": {
            "create_payment": "/api/payments/create",
            "get_payment": "/api/payments/{payment_id}",
            "payment_status": "/api/payments/status/{mercado_pago_id}",
            "webhook": "/api/payments/webhook"
        }
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

