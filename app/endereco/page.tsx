'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EnderecoPage() {
  const router = useRouter()

  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('SP')

  const estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ]

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    const part1 = raw.slice(0, 5)
    const part2 = raw.slice(5, 8)
    setCep(part2 ? `${part1}-${part2}` : part1)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!rua || !numero || !bairro || !cidade || !uf) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const address = {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('deliveryAddress', JSON.stringify(address))
    }

    router.push('/finalizar')
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
      <main className="flex-1 flex justify-center items-center py-4 sm:py-10 px-4 sm:px-5">
        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-10 max-w-[600px] w-full shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-normal text-black/90 mb-6 sm:mb-8" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Endereço de entrega</h1>

          <form onSubmit={handleSubmit}>
            {/* CEP */}
            <label className="flex flex-col mb-4">
              <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>CEP</span>
              <input
                inputMode="numeric"
                pattern="\d{5}-\d{3}"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
              />
            </label>

            {/* Rua */}
            <label className="flex flex-col mb-4">
              <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Rua</span>
              <input
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                placeholder="Nome da rua"
                className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
              />
            </label>

            {/* Número e Complemento */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
              <label className="flex-1 flex flex-col">
                <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Número</span>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                  className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </label>

              <label className="flex-1 flex flex-col">
                <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Complemento</span>
                <input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto 45"
                  className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </label>
            </div>

            {/* Bairro */}
            <label className="flex flex-col mb-4">
              <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Bairro</span>
              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Centro"
                className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
              />
            </label>

            {/* Cidade e UF */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <label className="flex-[2] flex flex-col">
                <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Cidade</span>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Nome da cidade"
                  className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all placeholder:text-[rgba(0,0,0,0.25)] focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)]"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                />
              </label>

              <label className="flex-1 flex flex-col">
                <span className="text-xs sm:text-sm text-black/55 mb-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Estado</span>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="h-11 sm:h-12 px-3 sm:px-4 py-2.5 rounded border border-ml-border bg-white outline-none text-sm sm:text-base text-black/90 transition-all focus:border-[#3483fa] focus:shadow-[0_0_0_2px_rgba(52,131,250,0.1)] cursor-pointer"
                  style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
                >
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.sigla}
                    </option>
                  ))}
                </select>
              </label>
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
                type="submit"
                className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-md text-sm sm:text-base font-semibold cursor-pointer border-none transition-colors bg-[#3483fa] text-white hover:bg-[#2968c8]"
              >
                Continuar
              </button>
            </div>
          </form>
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
