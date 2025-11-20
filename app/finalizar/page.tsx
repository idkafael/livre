'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, CreditCard } from 'lucide-react'
import PixModal from '../components/PixModal'
import CreditCardModal from '../components/CreditCardModal'

export default function FinalizarPage() {
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState('pix')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [deliveryAddress, setDeliveryAddress] = useState('Carregando endereço...')
  const [deliveryAddressData, setDeliveryAddressData] = useState<any>(null) // Dados completos do endereço
  const [productPrice, setProductPrice] = useState(149.90) // Preço padrão do produto (R$ 149,90)
  const [insurancePrice, setInsurancePrice] = useState(0) // Preço do seguro
  const [total, setTotal] = useState(149.90)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)

  useEffect(() => {
    // Carregar endereço do localStorage
    if (typeof window !== 'undefined') {
      const addressData = JSON.parse(localStorage.getItem('deliveryAddress') || '{}')
      if (addressData && Object.keys(addressData).length > 0) {
        // Salvar dados completos do endereço para enviar na API
        setDeliveryAddressData(addressData)
        
        let addressParts = []
        if (addressData.rua) {
          let ruaPart = addressData.rua
          if (addressData.numero) ruaPart += ', ' + addressData.numero
          if (addressData.complemento) ruaPart += ' - ' + addressData.complemento
          addressParts.push(ruaPart)
        }
        if (addressData.bairro) addressParts.push(addressData.bairro)
        if (addressData.cidade && addressData.uf) {
          addressParts.push(addressData.cidade + '/' + addressData.uf)
        } else if (addressData.cidade) {
          addressParts.push(addressData.cidade)
        }
        if (addressData.cep) addressParts.push('CEP ' + addressData.cep)
        setDeliveryAddress(addressParts.join(' - '))
      } else {
        setDeliveryAddress('Endereço não informado')
        setDeliveryAddressData(null)
      }

      // Carregar preço do produto do localStorage (se existir)
      const savedProductPrice = localStorage.getItem('productPrice')
      if (savedProductPrice) {
        const price = parseFloat(savedProductPrice)
        if (!isNaN(price)) {
          setProductPrice(price)
        }
      }

      // Carregar seguro escolhido do localStorage
      const savedInsurance = localStorage.getItem('selectedInsurance')
      if (savedInsurance) {
        try {
          const insurance = JSON.parse(savedInsurance)
          if (insurance.price) {
            setInsurancePrice(insurance.price)
          }
        } catch (e) {
          console.error('Erro ao carregar seguro:', e)
        }
      }
    }
  }, [])

  // Calcular total quando os preços mudarem
  useEffect(() => {
    const newTotal = productPrice + insurancePrice
    setTotal(newTotal)
  }, [productPrice, insurancePrice])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name
    const value = e.target.value
    
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = () => {
    // Validar dados antes de finalizar
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Abrir modal de pagamento baseado no método selecionado
    if (selectedPayment === 'pix') {
      setShowPixModal(true)
    } else if (selectedPayment === 'credit') {
      setShowCreditModal(true)
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    // Salvar dados no localStorage
        if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutData', JSON.stringify({
        ...formData,
        paymentMethod: selectedPayment,
        deliveryAddress: deliveryAddress,
        productPrice: productPrice,
        insurancePrice: insurancePrice,
        total: total
      }))

      // Salvar dados do pagamento para a página de sucesso
            localStorage.setItem('lastPayment', JSON.stringify({
        transaction_id: paymentData.id || `TXN-${Date.now()}`,
        amount: total,
        payment_method: paymentData.payment_method || (selectedPayment === 'pix' ? 'PIX' : 'CREDIT_CARD'),
        status: paymentData.status || 'approved',
        mercado_pago_id: paymentData.mercado_pago_id || paymentData.id
      }))
    }

    // Navegar para página de sucesso
          router.push('/success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button 
            className="text-gray-600 hover:text-gray-800 flex-shrink-0"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-base sm:text-lg font-normal text-gray-800 truncate">
            Finalizar Compra
          </h1>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex gap-3 sm:gap-4">
          <img 
            src="/images/D_NQ_NP_676154-MLA96100028031_102025-O.webp"
            alt="Fritadeira Elétrica Air Fryer 4L"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm text-gray-800 mb-1 truncate">
              Fritadeira Elétrica Air Fryer 4L
            </h2>
            <p className="text-base sm:text-lg font-normal text-gray-800">{formatPrice(productPrice)}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Quantidade: 1</p>
            </div>
          </div>
          
        {/* Delivery Address */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <MapPin className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-1">
                Endereço de Entrega
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                {deliveryAddress}
              </p>
            </div>
          </div>
        </div>
        
        {/* User Data Form */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Seus Dados</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Nome Completo
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                E-mail
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Telefone
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000" 
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
        </div>
            </div>
            </div>
        
        {/* Payment Method */}
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Forma de Pagamento</h3>
          
          <div className="space-y-3">
            {/* PIX Option */}
            <label
              className={`block p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPayment === 'pix'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedPayment('pix')}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex-shrink-0">
                    <CreditCard className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-medium text-gray-800">PIX</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Aprovação imediata</div>
              </div>
                    </div>
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={selectedPayment === 'pix'}
                  onChange={() => setSelectedPayment('pix')}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 border-gray-300 focus:ring-blue-500 flex-shrink-0 mt-0.5 sm:mt-1"
                />
                </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-0 sm:pl-13">
                Pagamento rápido e seguro. Você receberá o QR Code para pagar após confirmar o pedido.
              </p>
            </label>

            {/* Credit Card Option */}
            <label
              className={`block p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPayment === 'credit'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedPayment('credit')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex-shrink-0">
                    <CreditCard className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-medium text-gray-800">Cartão de Crédito</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Em até 12x sem juros</div>
            </div>
          </div>
                  <input 
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={selectedPayment === 'credit'}
                  onChange={() => setSelectedPayment('credit')}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                  />
                </div>
            </label>
                </div>
                  </div>

        {/* Summary */}
        <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-700">Produto</span>
            <span className="text-gray-800">{formatPrice(productPrice)}</span>
                  </div>
          {insurancePrice > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-700">Seguro</span>
              <span className="text-gray-800">{formatPrice(insurancePrice)}</span>
                </div>
                  )}
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-700">Frete</span>
            <span className="text-green-600 font-medium">Grátis</span>
                </div>
          <div className="flex justify-between text-base sm:text-lg font-medium pt-2 border-t border-gray-200">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-800">{formatPrice(total)}</span>
                </div>
            </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 sticky bottom-0">
              <button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm sm:text-base py-2.5 sm:py-3 rounded-md transition-colors"
            onClick={handleSubmit}
          >
            Finalizar Compra
              </button>
            </div>
          </div>

      {/* Modais de Pagamento */}
      {showPixModal && (
        <PixModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          amount={total}
          payerEmail={formData.email}
          payerName={formData.name}
          payerAddress={deliveryAddressData}
          payerPhone={formData.phone}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <CreditCardModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        amount={total}
        payerEmail={formData.email}
        payerName={formData.name}
        onSuccess={handlePaymentSuccess}
      />
        </div>
  )
}
