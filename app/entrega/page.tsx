'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function EntregaPage() {
  const router = useRouter()
  const [selectedDelivery, setSelectedDelivery] = useState('rapido')

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
      <main className="flex-1 flex justify-center items-center py-4 sm:py-10 px-4 sm:px-5">
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-10 max-w-[600px] w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-normal text-black/90 mb-6 sm:mb-8" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Escolha quando sua compra chegará</h1>
          
          <div className="mb-6">

            {/* Rápido Amanhã Option */}
            <label
              className={`border rounded p-3 sm:p-5 mb-3 sm:mb-4 cursor-pointer transition-colors relative block w-full box-border ${
                selectedDelivery === 'rapido'
                  ? 'border-[#3483fa]'
                  : 'border-ml-border hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('rapido')}
            >
              <div className="flex items-start cursor-pointer w-full">
                <input
                  type="radio"
                  name="shipping"
                  value="rapido"
                  checked={selectedDelivery === 'rapido'}
                  onChange={() => setSelectedDelivery('rapido')}
                  className="mr-2 sm:mr-3 w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm sm:text-base font-semibold text-black/90 mb-1 sm:mb-2 leading-[1.4]">
                    Rápido <span className="text-ml-green">Amanhã</span>
                  </div>
                  <div className="text-lg sm:text-xl font-normal text-ml-green mb-0.5 sm:mb-1">Grátis</div>
                </div>
              </div>
            </label>

            {/* Quinta-feira Option */}
            <label
              className={`border rounded p-3 sm:p-5 mb-3 sm:mb-4 cursor-pointer transition-colors relative block w-full box-border ${
                selectedDelivery === 'quinta'
                  ? 'border-[#3483fa]'
                  : 'border-ml-border hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('quinta')}
            >
              <div className="flex items-start cursor-pointer w-full">
                <input
                  type="radio"
                  name="shipping"
                  value="quinta"
                  checked={selectedDelivery === 'quinta'}
                  onChange={() => setSelectedDelivery('quinta')}
                  className="mr-2 sm:mr-3 w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm sm:text-base font-normal text-black/90 mb-1 sm:mb-2 leading-[1.4]">
                    Quinta-feira
                  </div>
                  <div className="text-lg sm:text-xl font-normal text-ml-green mb-0.5 sm:mb-1">Grátis</div>
                </div>
              </div>
            </label>

            {/* Seu dia de entregas Option */}
            <label
              className={`border rounded p-3 sm:p-5 mb-3 sm:mb-4 cursor-pointer transition-colors relative block w-full box-border ${
                selectedDelivery === 'escolher'
                  ? 'border-[#3483fa]'
                  : 'border-ml-border hover:border-[#3483fa]'
              }`}
              onClick={() => setSelectedDelivery('escolher')}
            >
              <div className="flex items-start cursor-pointer w-full">
                <input
                  type="radio"
                  name="shipping"
                  value="escolher"
                  checked={selectedDelivery === 'escolher'}
                  onChange={() => setSelectedDelivery('escolher')}
                  className="mr-2 sm:mr-3 w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-normal text-black/90 mb-1 leading-[1.4]">
                    Seu dia de entregas
                  </div>
                  <button 
                    className="text-[#3483fa] text-xs sm:text-sm font-normal hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Aqui você pode adicionar lógica para escolher o dia
                    }}
                  >
                    Escolher dia
                  </button>
                  <div className="text-lg sm:text-xl font-normal text-ml-green mt-1">Grátis</div>
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-ml-border text-black/90 hover:bg-[#d4d4d4]" 
              onClick={() => router.back()}
            >
              Voltar
            </button>
            <button 
              className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-[#3483fa] text-white hover:bg-[#2968c8]"
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
