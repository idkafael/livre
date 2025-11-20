import { NextRequest, NextResponse } from 'next/server'

// Token de acesso do Mercado Pago (obrigatório via variável de ambiente)
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
    const { 
      amount, 
      payment_method, 
      payer_email, 
      payer_name, 
      payer_address,
      payer_phone,
      card_token, 
      installments, 
      card_number, 
      card_holder_name, 
      card_expiration_month, 
      card_expiration_year, 
      card_cvv,
      items,
      statement_descriptor,
      external_reference
    } = body

    // Gerar external_reference único se não fornecido (OBRIGATÓRIO - 14 pontos)
    const uniqueExternalRef = external_reference || `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // URL base para webhooks (OBRIGATÓRIO - 11 pontos)
    // NOTA: O Mercado Pago não aceita localhost como URL válida para webhooks
    // Em desenvolvimento local, não enviaremos notification_url (opcional)
    let notificationUrl: string | undefined = undefined
    
    if (process.env.VERCEL_URL) {
      // Em produção no Vercel
      notificationUrl = `https://${process.env.VERCEL_URL}/api/payments/webhook`
    } else if (process.env.NEXT_PUBLIC_BASE_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      // Verificar se é uma URL válida (não localhost)
      if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
          notificationUrl = `${baseUrl}/api/payments/webhook`
        }
      } else if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        notificationUrl = `https://${baseUrl}/api/payments/webhook`
      }
    }

    if (payment_method === 'PIX') {
      // Criar objeto de pagamento base
      // NOTA: Para PIX, a API do Mercado Pago NÃO aceita o campo 'items'
      // Apenas description e transaction_amount são necessários
      const paymentData: any = {
        transaction_amount: parseFloat(amount),
        description: 'Fritadeira Elétrica Air Fryer 4L',
        payment_method_id: 'pix',
        // OBRIGATÓRIO - external_reference (14 pontos)
        external_reference: uniqueExternalRef,
        payer: {
          email: payer_email, // OBRIGATÓRIO - 3 pontos
        },
      }

      // Adicionar notification_url apenas se for uma URL válida (não localhost)
      // O Mercado Pago não aceita localhost como URL válida para webhooks
      if (notificationUrl) {
        paymentData.notification_url = notificationUrl
      }

      // Dividir o nome em first_name e last_name
      paymentData.payer.first_name = payer_name?.split(' ')[0] || '' // RECOMENDADO - 2 pontos
      paymentData.payer.last_name = payer_name?.split(' ').slice(1).join(' ') || '' // RECOMENDADO - 2 pontos

      // BOA PRÁTICA - Adicionar endereço do comprador se fornecido
      if (payer_address && typeof payer_address === 'object') {
        paymentData.payer.address = {
          street_name: payer_address.street_name || '',
          street_number: payer_address.street_number || undefined,
          zip_code: payer_address.zip_code || '',
          neighborhood: payer_address.neighborhood || '',
          city: payer_address.city || '',
          federal_unit: payer_address.federal_unit || '',
        }
      }

      // BOA PRÁTICA - Adicionar telefone se fornecido
      if (payer_phone) {
        paymentData.payer.phone = {
          number: payer_phone.replace(/\D/g, '')
        }
      }

      // Gerar uma chave de idempotência única para esta requisição
      // Usa timestamp + email do pagador + valor para garantir unicidade
      const idempotencyKey = `pix_${Date.now()}_${payer_email}_${amount}_${Math.random().toString(36).substring(2, 15)}`

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro Mercado Pago:', data)
        return NextResponse.json({ 
          error: data.message || 'Erro ao criar pagamento PIX no Mercado Pago',
          details: data 
        }, { status: response.status })
      }

      // Extrair dados do pagamento PIX
      const pixData = data.point_of_interaction?.transaction_data || {}
      const pixQrCode = pixData.qr_code || ''
      const pixQrCodeBase64 = pixData.qr_code_base64 || ''

      console.log('Dados PIX recebidos:', {
        id: data.id,
        status: data.status,
        has_qr_code: !!pixQrCode,
        has_qr_code_base64: !!pixQrCodeBase64,
        point_of_interaction: data.point_of_interaction
      })

      return NextResponse.json({
        id: data.id?.toString() || `mp_${Date.now()}`,
        mercado_pago_id: data.id?.toString() || '',
        transaction_id: data.external_reference || `txn_${Date.now()}`,
        qr_code: pixQrCode,
        qr_code_base64: pixQrCodeBase64,
        status: data.status || 'pending'
      })

    } else if (payment_method === 'CREDIT_CARD') {
      // Para cartão de crédito, primeiro precisamos criar um token do cartão
      // Em produção, isso deve ser feito no frontend usando o SDK do Mercado Pago
      // Por enquanto, vamos simular ou usar o token fornecido
      
      // Preparar items array para cartão também
      const itemsArray = items || [{
        id: 'PROD_001',
        title: 'Fritadeira Elétrica Air Fryer 4L',
        description: 'Fritadeira Elétrica Air Fryer 4L',
        category_id: 'home_appliances',
        quantity: 1,
        unit_price: parseFloat(amount)
      }]

      const paymentData: any = {
        transaction_amount: parseFloat(amount),
        description: itemsArray[0]?.title || 'Compra no Mercado Livre',
        payment_method_id: 'credit_card',
        token: card_token || `card_token_${Date.now()}`,
        installments: installments ? parseInt(installments) : 1,
        // OBRIGATÓRIO - external_reference (14 pontos)
        external_reference: uniqueExternalRef,
        // RECOMENDADO - items array (múltiplos pontos)
        items: itemsArray,
        // RECOMENDADO - statement_descriptor (10 pontos) - Limite de 13 caracteres
        statement_descriptor: statement_descriptor || 'MERCADOLIVRE',
        payer: {
          email: payer_email, // OBRIGATÓRIO - 3 pontos
          first_name: payer_name?.split(' ')[0] || '', // RECOMENDADO - 2 pontos
          last_name: payer_name?.split(' ').slice(1).join(' ') || '', // RECOMENDADO - 2 pontos
        },
        // Dados do cartão (se não usar token)
        ...(card_number && {
          card: {
            card_number: card_number,
            cardholder: {
              name: card_holder_name,
            },
            expiration_month: card_expiration_month,
            expiration_year: card_expiration_year,
            security_code: card_cvv,
          }
        })
      }

      // Adicionar notification_url apenas se for uma URL válida (não localhost)
      if (notificationUrl) {
        paymentData.notification_url = notificationUrl
      }

      // BOA PRÁTICA - Adicionar endereço do comprador se fornecido
      if (payer_address && typeof payer_address === 'object') {
        paymentData.payer.address = {
          street_name: payer_address.street_name || '',
          street_number: payer_address.street_number || undefined,
          zip_code: payer_address.zip_code || '',
          neighborhood: payer_address.neighborhood || '',
          city: payer_address.city || '',
          federal_unit: payer_address.federal_unit || '',
        }
      }

      // BOA PRÁTICA - Adicionar telefone se fornecido
      if (payer_phone) {
        paymentData.payer.phone = {
          number: payer_phone.replace(/\D/g, '')
        }
      }

      // Gerar uma chave de idempotência única para esta requisição
      const idempotencyKey = `cc_${Date.now()}_${payer_email}_${amount}_${Math.random().toString(36).substring(2, 15)}`

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro Mercado Pago:', data)
        return NextResponse.json({ 
          error: data.message || 'Erro ao processar pagamento com cartão no Mercado Pago',
          details: data 
        }, { status: response.status })
      }

      return NextResponse.json({
        id: data.id?.toString() || `mp_${Date.now()}`,
        mercado_pago_id: data.id?.toString() || '',
        transaction_id: data.external_reference || `txn_${Date.now()}`,
        status: data.status || 'APPROVED',
        amount: data.transaction_amount || amount
      })
    }

    return NextResponse.json({ error: 'Método de pagamento não suportado' }, { status: 400 })
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar pagamento' }, { status: 500 })
  }
}

