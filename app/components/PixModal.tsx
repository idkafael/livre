'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

interface PixModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  payerEmail: string
  payerName: string
  payerAddress?: any
  payerPhone?: string
  onSuccess: (paymentData: any) => void
}

export default function PixModal({ isOpen, onClose, amount, payerEmail, payerName, payerAddress, payerPhone, onSuccess }: PixModalProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('')
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>('')
  const [copyCode, setCopyCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')

  const createPixPayment = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Log para debug
      console.log('Dados enviados para PIX:', {
        payerName,
        amount
      })

      // Gerar external_reference único (OBRIGATÓRIO - 14 pontos)
      const externalReference = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          payment_method: 'PIX',
          payer_email: payerEmail, // OBRIGATÓRIO - 3 pontos
          payer_name: payerName,
          // BOA PRÁTICA - endereço do comprador
          payer_address: payerAddress ? {
            street_name: payerAddress.rua || '',
            street_number: payerAddress.numero ? parseInt(payerAddress.numero) : undefined,
            zip_code: payerAddress.cep?.replace(/\D/g, '') || '',
            neighborhood: payerAddress.bairro || '',
            city: payerAddress.cidade || '',
            federal_unit: payerAddress.uf || '',
          } : undefined,
          // BOA PRÁTICA - telefone do comprador
          payer_phone: payerPhone,
          // OBRIGATÓRIO - external_reference (14 pontos)
          external_reference: externalReference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento PIX')
      }

      console.log('Dados recebidos da API:', data)

      // Extrair código PIX e QR Code
      const pixCode = data.qr_code || data.point_of_interaction?.transaction_data?.qr_code || ''
      const base64Image = data.qr_code_base64 || data.point_of_interaction?.transaction_data?.qr_code_base64 || ''

      setQrCode(pixCode)
      setQrCodeBase64(base64Image)
      setCopyCode(pixCode)
      setPaymentId(data.id || data.mercado_pago_id || '')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento PIX')
      console.error('Erro ao criar pagamento PIX:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && amount > 0) {
      // Resetar estados ao abrir
      setQrCode('')
      setQrCodeBase64('')
      setQrCodeImageUrl('')
      setCopyCode('')
      setError('')
      createPixPayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, amount, payerEmail, payerName])

  // Gerar QR Code a partir do código PIX se necessário
  useEffect(() => {
    const generateQRCode = async () => {
      if (copyCode && !qrCodeBase64 && !qrCodeImageUrl) {
        try {
          const dataUrl = await QRCode.toDataURL(copyCode, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          setQrCodeImageUrl(dataUrl)
        } catch (err) {
          console.error('Erro ao gerar QR Code:', err)
        }
      }
    }

    generateQRCode()
  }, [copyCode, qrCodeBase64, qrCodeImageUrl])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Pagamento PIX</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-600">Gerando QR Code...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={createPixPayment}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code ou copie o código PIX</p>
                <p className="text-2xl font-bold text-gray-800 mb-4">{formatPrice(amount)}</p>
              </div>

              {/* QR Code */}
              {(qrCodeBase64 || qrCodeImageUrl) && (
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    {qrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Erro ao carregar QR Code base64')
                          // Tentar gerar a partir do código se a imagem falhar
                          if (copyCode && !qrCodeImageUrl) {
                            QRCode.toDataURL(copyCode, { width: 256 })
                              .then(url => setQrCodeImageUrl(url))
                              .catch(err => console.error('Erro ao gerar QR Code:', err))
                          }
                        }}
                      />
                    ) : qrCodeImageUrl ? (
                      <img
                        src={qrCodeImageUrl}
                        alt="QR Code PIX"
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {!qrCodeBase64 && !qrCodeImageUrl && copyCode && (
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64 border-2 border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}

              {copyCode && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Código PIX (Copiar e Colar)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={copyCode}
                      readOnly
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-gray-50 text-gray-800"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                        copied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-xs">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Importante:</strong> O pagamento PIX é processado imediatamente. Após o pagamento, 
                  você receberá a confirmação automaticamente.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    onSuccess({
                      id: paymentId,
                      payment_method: 'PIX',
                      amount,
                      status: 'pending',
                      qr_code: qrCode
                    })
                    onClose()
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

