'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CreditCard } from 'lucide-react'
import Image from 'next/image'
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
  const [deliveryAddressData, setDeliveryAddressData] = useState<any>(null)
  const [productPrice, setProductPrice] = useState(149.90)
  const [insurancePrice, setInsurancePrice] = useState(0)
  const [total, setTotal] = useState(149.90)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const addressData = JSON.parse(localStorage.getItem('deliveryAddress') || '{}')
      if (addressData && Object.keys(addressData).length > 0) {
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

      const savedProductPrice = localStorage.getItem('productPrice')
      if (savedProductPrice) {
        const price = parseFloat(savedProductPrice)
        if (!isNaN(price)) {
          setProductPrice(price)
        }
      }

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
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (selectedPayment === 'pix') {
      setShowPixModal(true)
    } else if (selectedPayment === 'credit') {
      setShowCreditModal(true)
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutData', JSON.stringify({
        ...formData,
        paymentMethod: selectedPayment,
        deliveryAddress: deliveryAddress,
        productPrice: productPrice,
        insurancePrice: insurancePrice,
        total: total
      }))

      localStorage.setItem('lastPayment', JSON.stringify({
        transaction_id: paymentData.id || `TXN-${Date.now()}`,
        amount: total,
        payment_method: paymentData.payment_method || (selectedPayment === 'pix' ? 'PIX' : 'CREDIT_CARD'),
        status: paymentData.status || 'approved',
        mercado_pago_id: paymentData.mercado_pago_id || paymentData.id
      }))
    }

    router.push('/success')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <header className="min-h-[60px] sm:h-[100px] flex items-center px-4 sm:px-5 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#fff159' }}>
        <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center">
          <a href="/" className="bg-[url('/images/pt_logo_large_plus@2x.webp')] bg-no-repeat bg-contain h-[28px] w-[110px] sm:h-[34px] sm:w-[134px] block" style={{textIndent: '-9999px'}}>Mercado Livre</a>
          <div className="hidden sm:flex items-center gap-5 text-sm text-black/90">
            <span>Contato</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start py-4 sm:py-10 px-4 sm:px-5">
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-10 max-w-[600px] w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-normal text-black/90 mb-6 sm:mb-8" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Finalizar Compra</h1>

          {/* Product Info */}
          <div className="border-b border-ml-border pb-5 mb-6">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-[#f5f5f5]">
                <Image 
                  src="/images/product-7.png"
                  alt="Fritadeira Elétrica Air Fryer 4L"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm text-black/90 mb-2" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Fritadeira Elétrica Air Fryer 4L
                </h2>
                <p className="text-lg font-normal text-black/90" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 300 }}>{formatPrice(productPrice)}</p>
                <p className="text-xs text-black/55 mt-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Quantidade: 1</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-b border-ml-border pb-5 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="text-ml-green flex-shrink-0 mt-0.5 w-5 h-5" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-black/90 mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
                  Endereço de Entrega
                </h3>
                <p className="text-sm text-black/55 leading-relaxed" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  {deliveryAddress}
                </p>
              </div>
            </div>
          </div>

          {/* User Data Form */}
          <div className="border-b border-ml-border pb-6 mb-6">
            <h3 className="text-base font-semibold text-black/90 mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Seus Dados</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Nome Completo
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </div>
              
              <div>
                <label className="block text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  E-mail
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </div>
              
              <div>
                <label className="block text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Telefone
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000" 
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-black/90 mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Forma de Pagamento</h3>
            
            <div className="space-y-3">
              {/* PIX Option */}
              <label
                className={`border rounded p-4 cursor-pointer transition-colors block w-full box-border ${
                  selectedPayment === 'pix'
                    ? 'border-[#3483fa]'
                    : 'border-ml-border hover:border-[#3483fa]'
                }`}
                onClick={() => setSelectedPayment('pix')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={selectedPayment === 'pix'}
                      onChange={() => setSelectedPayment('pix')}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm sm:text-base font-semibold text-black/90 mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>PIX</div>
                      <div className="text-xs sm:text-sm text-black/55" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Aprovação imediata</div>
                    </div>
                  </div>
                </div>
              </label>

              {/* Credit Card Option */}
              <label
                className={`border rounded p-4 cursor-pointer transition-colors block w-full box-border ${
                  selectedPayment === 'credit'
                    ? 'border-[#3483fa]'
                    : 'border-ml-border hover:border-[#3483fa]'
                }`}
                onClick={() => setSelectedPayment('credit')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input 
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={selectedPayment === 'credit'}
                      onChange={() => setSelectedPayment('credit')}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm sm:text-base font-semibold text-black/90 mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Cartão de Crédito</div>
                      <div className="text-xs sm:text-sm text-black/55" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Em até 12x sem juros</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-ml-border pt-5 mb-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                <span className="text-black/55">Produto</span>
                <span className="text-black/90">{formatPrice(productPrice)}</span>
              </div>
              {insurancePrice > 0 && (
                <div className="flex justify-between text-sm" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  <span className="text-black/55">Seguro</span>
                  <span className="text-black/90">{formatPrice(insurancePrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                <span className="text-black/55">Frete</span>
                <span className="text-ml-green font-semibold" style={{ fontWeight: 600 }}>Grátis</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-normal pt-3 border-t border-ml-border" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
              <span className="text-black/90">Total</span>
              <span className="text-black/90">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              type="button"
              className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-ml-border text-black/90 hover:bg-[#d4d4d4]" 
              onClick={() => router.back()}
            >
              Voltar
            </button>
            <button 
              type="button"
              className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-[#3483fa] text-white hover:bg-[#2968c8]"
              onClick={handleSubmit}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="bg-white border-t border-ml-border py-3 sm:py-4 px-4 sm:px-5 mt-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-2">
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Trabalhe conosco</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Termos e condições</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Promoções</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Como cuidamos da sua privacidade</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Acessibilidade</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Contato</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Informações sobre seguros</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Programa de Afiliados</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Lista de presentes</a>
          </div>
          <div className="text-xs text-black/55 mt-2">
            Copyright © 1999-2025 Ebazar.com.br LTDA.<br />
            CNPJ n.º 03.007.331/0001-41 / Av. das Nações Unidas, nº 3.003, Bonfim, Osasco/SP - CEP 06233-903 - empresa do grupo Mercado Livre.
          </div>
        </div>
      </footer>

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
