import { NextRequest, NextResponse } from 'next/server'

// Access Token do Mercado Pago (obrigatório via variável de ambiente)
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.error('ERRO: MERCADOPAGO_ACCESS_TOKEN não configurado. Configure a variável de ambiente.')
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Access Token está configurado
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'Configuração do Mercado Pago não encontrada. Verifique as variáveis de ambiente.' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { card_number, cardholder_name, expiration_month, expiration_year, security_code } = body

    // Tokenizar o cartão usando a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        card_number,
        cardholder: {
          name: cardholder_name,
        },
        expiration_month,
        expiration_year,
        security_code,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao tokenizar cartão',
        details: data 
      }, { status: response.status })
    }

    return NextResponse.json({ 
      token: data.id,
      card_id: data.card_id 
    })
  } catch (error: any) {
    console.error('Erro ao tokenizar cartão:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro ao processar tokenização' 
    }, { status: 500 })
  }
}

