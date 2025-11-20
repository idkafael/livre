'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SeguroPage() {
  const router = useRouter()
  const [selectedInsurance, setSelectedInsurance] = useState('12')

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-ml-yellow min-h-[60px] sm:h-[100px] flex items-center px-4 sm:px-5 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
        <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center">
          <a href="/" className="bg-[url('/images/pt_logo_large_plus@2x.webp')] bg-no-repeat bg-contain h-[28px] w-[110px] sm:h-[34px] sm:w-[134px] block" style={{textIndent: '-9999px'}}>Mercado Livre</a>
          <div className="hidden sm:flex items-center gap-5 text-sm text-black/90">
            <span>Contato</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex justify-center items-center py-4 sm:py-10 px-4 sm:px-5">
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-10 max-w-[600px] w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-normal text-black/90 mb-6 sm:mb-8">Adicione um seguro</h1>
          
          <div className="mb-6">
            <label 
              className={`border rounded p-3 sm:p-5 pr-20 sm:pr-[120px] mb-3 sm:mb-4 cursor-pointer transition-colors relative block w-full box-border ${selectedInsurance === '12' ? 'border-[#3483fa]' : 'border-ml-border hover:border-[#3483fa]'}`}
              htmlFor="insurance-12"
              onClick={() => setSelectedInsurance('12')}
            >
              <div className="flex items-start cursor-pointer w-full">
                <input 
                  type="radio" 
                  id="insurance-12" 
                  name="insurance" 
                  value="12" 
                  checked={selectedInsurance === '12'}
                  onChange={() => setSelectedInsurance('12')}
                  className="mr-2 sm:mr-3 w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm sm:text-base font-semibold text-black/90 mb-1 sm:mb-2 leading-[1.4]">12 meses de Garantia estendida</div>
                  <div className="text-lg sm:text-xl font-normal text-black/90 mb-0.5 sm:mb-1">R$ 42</div>
                  <div className="text-xs sm:text-sm text-black/55">Pague parcelado</div>
                </div>
              </div>
              <span className="absolute top-2 right-2 sm:top-5 sm:right-5 bg-[#3483fa] text-white text-[9px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase whitespace-nowrap">RECOMENDADO</span>
            </label>
            
            <label 
              className={`border rounded p-3 sm:p-5 mb-3 sm:mb-4 cursor-pointer transition-colors relative block w-full box-border ${selectedInsurance === '18' ? 'border-[#3483fa]' : 'border-ml-border hover:border-[#3483fa]'}`}
              htmlFor="insurance-18"
              onClick={() => setSelectedInsurance('18')}
            >
              <div className="flex items-start cursor-pointer w-full">
                <input 
                  type="radio" 
                  id="insurance-18" 
                  name="insurance" 
                  value="18"
                  checked={selectedInsurance === '18'}
                  onChange={() => setSelectedInsurance('18')}
                  className="mr-2 sm:mr-3 w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-black/90 mb-1 sm:mb-2 leading-[1.4]">18 meses de Garantia estendida</div>
                  <div className="text-lg sm:text-xl font-normal text-black/90 mb-0.5 sm:mb-1">R$ 66</div>
                  <div className="text-xs sm:text-sm text-black/55">Pague parcelado</div>
                </div>
              </div>
            </label>
          </div>
          
          <a href="#" className="text-[#3483fa] text-xs sm:text-sm no-underline mb-3 sm:mb-4 inline-block hover:underline">Saiba como funciona</a>
          
          <p className="text-[10px] sm:text-xs text-black/55 mb-6 sm:mb-8 leading-[1.5]">
            Ao adicionar, você aceita as <a href="#" className="text-[#3483fa] no-underline hover:underline">Condições gerais</a> e os <a href="#" className="text-[#3483fa] no-underline hover:underline">Termos de cobrança do Prêmio do seguro</a>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <button className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-ml-border text-black/90 hover:bg-[#d4d4d4]" onClick={() => router.push('/')}>Agora não</button>
            <button className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-[#3483fa] text-white hover:bg-[#2968c8]" onClick={() => {
              // Salvar seguro escolhido no localStorage
              const insurancePrice = selectedInsurance === '12' ? 42 : 66
              if (typeof window !== 'undefined') {
                localStorage.setItem('selectedInsurance', JSON.stringify({
                  months: selectedInsurance,
                  price: insurancePrice
                }))
              }
              router.push('/entrega')
            }}>Adicionar</button>
          </div>

          {/* Continuar sem garantia */}
          <div className="text-center">
            <button 
              onClick={() => {
                // Limpar qualquer seguro salvo
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('selectedInsurance')
                }
                router.push('/entrega')
              }}
              className="text-[#3483fa] text-sm font-semibold hover:underline transition-colors" 
              style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}
            >
              Continuar sem garantia
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-ml-border py-3 sm:py-4 px-4 sm:px-5 mt-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-2">
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Trabalhe conosco</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Termos e condições</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Promoções</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">Como cuidamos da sua privacidade</a>
            <a href="#" className="text-black/90 no-underline text-[13px] hover:underline">
              <span className="inline-block w-4 h-4 bg-contain mr-1 align-middle" style={{backgroundImage: 'url(/images/accessibility.png)'}}></span>Acessibilidade
            </a>
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
