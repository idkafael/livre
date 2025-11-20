import { NextResponse } from 'next/server'

// Public Key do Mercado Pago (obrigatória via variável de ambiente)
const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

export async function GET() {
  if (!MERCADOPAGO_PUBLIC_KEY) {
    return NextResponse.json({ 
      error: 'Public Key do Mercado Pago não configurada. Configure NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.' 
    }, { status: 500 })
  }

  return NextResponse.json({ 
    public_key: MERCADOPAGO_PUBLIC_KEY 
  })
}

