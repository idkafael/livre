'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState({
    transactionId: '-',
    amount: 'R$ 0,00',
    method: '-',
    status: 'Aprovado'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPayment = localStorage.getItem('lastPayment')
      
      if (storedPayment) {
        try {
          const payment = JSON.parse(storedPayment)
          
          const methodNames: Record<string, string> = {
            'PIX': 'PIX',
            'CREDIT_CARD': 'Cartão de Crédito',
            'credit_card': 'Cartão de Crédito',
            'pix': 'PIX'
          }
          
          const statusNames: Record<string, string> = {
            'approved': 'Aprovado',
            'APPROVED': 'Aprovado',
            'pending': 'Pendente',
            'PENDING': 'Pendente'
          }
          
          setPaymentData({
            transactionId: payment.transaction_id || '-',
            amount: payment.amount 
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(payment.amount)
              : 'R$ 0,00',
            method: methodNames[payment.payment_method] || payment.payment_method || '-',
            status: statusNames[payment.status] || payment.status || 'Aprovado'
          })
        } catch (e) {
          console.error('Erro ao carregar dados do pagamento:', e)
        }
      } else {
        // Tentar obter da URL
        const transactionId = searchParams.get('transaction_id') || searchParams.get('id')
        const amount = searchParams.get('amount')
        const method = searchParams.get('method')
        const status = searchParams.get('status')
        
        if (transactionId || amount || method || status) {
          setPaymentData({
            transactionId: transactionId || '-',
            amount: amount 
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(parseFloat(amount))
              : 'R$ 0,00',
            method: method || '-',
            status: status || 'Aprovado'
          })
        }
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-5">
      <div className="bg-white rounded-lg p-10 max-w-[500px] w-full text-center shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="w-20 h-20 mx-auto mb-6 bg-ml-green rounded-full flex items-center justify-center relative">
          <span className="text-white text-5xl font-bold">✓</span>
        </div>
        
        <h1 className="text-2xl font-semibold text-black/90 mb-3">Pagamento Aprovado!</h1>
        
        <p className="text-base text-black/70 mb-8 leading-[1.5]">
          Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
        </p>
        
        <div className="bg-[#f5f5f5] rounded-md p-5 mb-8 text-left">
          <div className="flex justify-between mb-3 text-sm last:mb-0">
            <span className="text-black/60">Status:</span>
            <span className="text-black/90 font-medium">{paymentData.status}</span>
          </div>
          <div className="flex justify-between mb-3 text-sm last:mb-0">
            <span className="text-black/60">Valor:</span>
            <span className="text-black/90 font-medium">{paymentData.amount}</span>
          </div>
          <div className="flex justify-between mb-3 text-sm last:mb-0">
            <span className="text-black/60">Método:</span>
            <span className="text-black/90 font-medium">{paymentData.method}</span>
          </div>
          <div className="flex justify-between mb-0 text-sm">
            <span className="text-black/60">ID da Transação:</span>
            <span className="text-black/90 font-medium text-xs break-all">{paymentData.transactionId}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <a href="/" className="py-3.5 px-6 rounded-md text-base font-semibold cursor-pointer border-none transition-all no-underline inline-block bg-[#3483fa] text-white hover:bg-[#2968c8]">Continuar Comprando</a>
          <button className="py-3.5 px-6 rounded-md text-base font-semibold cursor-pointer border-none transition-all bg-white text-[#3483fa] border border-[#3483fa] hover:bg-[#f5f5f5]" onClick={() => window.print()}>Imprimir Comprovante</button>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
