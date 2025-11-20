'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertCircle } from 'lucide-react'

export default function EntregaPage() {
  const router = useRouter()
  const [selectedDelivery, setSelectedDelivery] = useState('rapido')

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <header className="bg-white min-h-[60px] sm:h-[100px] flex items-center px-4 sm:px-5 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] border-b border-ml-border">
        <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button 
              className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center flex-shrink-0 text-gray-600 hover:text-gray-800" 
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-sm sm:text-xl font-normal text-black/90 truncate">
              Escolha quando sua compra chegará
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-sm text-black/90">
            <span>Contato</span>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-[#fff59d] py-2 sm:py-3 px-4 sm:px-5 flex items-center gap-2 sm:gap-2.5 max-w-[1200px] w-full mx-auto">
        <AlertCircle className="text-yellow-600 flex-shrink-0 w-[18px] h-[18px] sm:w-5 sm:h-5" />
        <p className="text-xs sm:text-sm text-black/90 leading-[1.4]">
          Informe seu endereço na próxima etapa
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start py-4 sm:py-10 px-4 sm:px-5 pb-24 sm:pb-[200px]">
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-10 max-w-[600px] w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
          {/* Envio 1 Label */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-normal text-black/90">Envio 1</h2>
            <span className="bg-ml-green text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded uppercase">
              FULL
            </span>
          </div>

          {/* Shipping Options */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Rápido Amanhã Option */}
            <label
              className={`flex items-center justify-between p-3 sm:p-5 rounded border-2 cursor-pointer transition-all ${
                selectedDelivery === 'rapido'
                  ? 'border-[#3483fa] bg-blue-50'
                  : 'border-ml-border bg-white hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('rapido')}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <input
                    type="radio"
                    name="shipping"
                    value="rapido"
                    checked={selectedDelivery === 'rapido'}
                    onChange={() => setSelectedDelivery('rapido')}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#3483fa] border-ml-border focus:ring-[#3483fa] cursor-pointer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-black/90 font-semibold text-sm sm:text-base">
                      Rápido
                    </span>
                    <span className="text-ml-green font-semibold text-sm sm:text-base">
                      Amanhã
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-ml-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">
                Grátis
              </span>
            </label>

            {/* Quinta-feira Option */}
            <label
              className={`flex items-center justify-between p-3 sm:p-5 rounded border-2 cursor-pointer transition-all ${
                selectedDelivery === 'quinta'
                  ? 'border-[#3483fa] bg-blue-50'
                  : 'border-ml-border bg-white hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('quinta')}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <input
                    type="radio"
                    name="shipping"
                    value="quinta"
                    checked={selectedDelivery === 'quinta'}
                    onChange={() => setSelectedDelivery('quinta')}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#3483fa] border-ml-border focus:ring-[#3483fa] cursor-pointer"
                  />
                </div>
                <span className="text-black/90 font-normal text-sm sm:text-base">
                  Quinta-feira
                </span>
              </div>
              <span className="text-ml-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">
                Grátis
              </span>
            </label>

            {/* Seu dia de entregas Option */}
            <label
              className={`flex items-center justify-between p-3 sm:p-5 rounded border-2 cursor-pointer transition-all ${
                selectedDelivery === 'escolher'
                  ? 'border-[#3483fa] bg-blue-50'
                  : 'border-ml-border bg-white hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('escolher')}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <input
                    type="radio"
                    name="shipping"
                    value="escolher"
                    checked={selectedDelivery === 'escolher'}
                    onChange={() => setSelectedDelivery('escolher')}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#3483fa] border-ml-border focus:ring-[#3483fa] cursor-pointer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-black/90 font-normal text-sm sm:text-base">
                    Seu dia de entregas
                  </div>
                  <button 
                    className="text-[#3483fa] text-xs sm:text-sm font-normal hover:underline mt-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Aqui você pode adicionar lógica para escolher o dia
                    }}
                  >
                    Escolher dia
                  </button>
                </div>
              </div>
              <span className="text-ml-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">
                Grátis
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="border-t border-ml-border pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <span className="text-black/90 text-sm sm:text-base">Frete</span>
              <span className="text-ml-green font-semibold text-sm sm:text-base">
                Grátis
              </span>
            </div>
            <button 
              className="w-full bg-[#3483fa] hover:bg-[#2968c8] text-white font-semibold text-sm sm:text-base py-3 sm:py-3.5 px-4 sm:px-6 rounded-md transition-colors cursor-pointer"
              onClick={() => {
                // Salvar método de entrega escolhido
                if (typeof window !== 'undefined') {
                  localStorage.setItem('deliveryMethod', selectedDelivery)
                }
                router.push('/endereco')
              }}
            >
              Continuar
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
    </div>
  )
}
