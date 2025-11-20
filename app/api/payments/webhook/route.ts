import { NextRequest, NextResponse } from 'next/server'

// Token de acesso do Mercado Pago para validar webhooks
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

/**
 * Webhook do Mercado Pago para receber notificações de pagamento
 * OBRIGATÓRIO - 11 pontos
 * 
 * O Mercado Pago envia notificações quando:
 * - Um pagamento é criado
 * - Um pagamento é aprovado
 * - Um pagamento é rejeitado
 * - Um pagamento é cancelado
 * - Um pagamento é reembolsado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // O Mercado Pago envia diferentes tipos de notificações
    const { type, data } = body

    console.log('Webhook recebido do Mercado Pago:', { type, data })

    // Se for uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data?.id

      if (!paymentId) {
        return NextResponse.json({ error: 'Payment ID não encontrado' }, { status: 400 })
      }

      // Consultar o pagamento no Mercado Pago para obter informações atualizadas
      // BOA PRÁTICA - Consultar o pagamento notificado
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      })

      if (!paymentResponse.ok) {
        console.error('Erro ao consultar pagamento:', await paymentResponse.text())
        return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 500 })
      }

      const paymentData = await paymentResponse.json()

      console.log('Dados do pagamento consultado:', {
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference,
        transaction_amount: paymentData.transaction_amount,
      })

      // Aqui você deve atualizar o status do pagamento no seu banco de dados
      // usando o external_reference para encontrar o pedido correspondente
      // Exemplo:
      // await updateOrderStatus(paymentData.external_reference, paymentData.status)

      // Retornar 200 OK para confirmar que recebemos a notificação
      return NextResponse.json({ 
        received: true,
        payment_id: paymentId,
        status: paymentData.status 
      })
    }

    // Outros tipos de notificações podem ser tratados aqui
    // Por exemplo: merchant_order, subscription, etc.

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    // Retornar 200 mesmo em caso de erro para evitar retentativas excessivas
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}

// GET para validação do webhook (opcional)
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint ativo',
    endpoint: '/api/payments/webhook'
  })
}

