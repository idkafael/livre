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
  const cidade = 'São Paulo'
  const uf = 'SP'

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

    if (!rua || !numero || !bairro) {
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
    <div className="min-h-screen bg-ml-bg flex flex-col">
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-transparent">
        <button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] border-none bg-black/30 flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-black/60 transition-colors"
          onClick={() => router.back()}
          aria-label="Voltar"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-sm sm:text-base m-0 text-[#222] font-normal truncate">Endereço de Entrega</h1>
      </header>

      <main className="py-2 px-3 sm:px-4 flex-1">
        <form className="max-w-[640px] my-2 mx-auto flex flex-col" onSubmit={handleSubmit}>
          <p className="font-semibold my-2 mb-3 ml-1 text-[#222] flex items-center gap-2 text-sm sm:text-base">
            <span className="text-base sm:text-lg">📍</span> Onde deseja receber?
          </p>

          <label className="flex flex-col mb-3">
            <div className="text-xs text-ml-muted mb-1.5">CEP</div>
            <input
              inputMode="numeric"
              pattern="\d{5}-\d{3}"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-white outline-none text-[15px] text-[#111] shadow-none transition-all duration-75 font-sans placeholder:text-[#cfcfcf] focus:border-ml-blue/70 focus:shadow-[0_6px_18px_rgba(30,108,247,0.08)]"
            />
          </label>

          <label className="flex flex-col mb-3">
            <div className="text-xs text-ml-muted mb-1.5">Rua</div>
            <input
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Nome da rua"
              className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-white outline-none text-[15px] text-[#111] shadow-none transition-all duration-75 font-sans placeholder:text-[#cfcfcf] focus:border-ml-blue/70 focus:shadow-[0_6px_18px_rgba(30,108,247,0.08)]"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5 items-start">
            <label className="label flex-1 flex flex-col mb-3 w-full sm:w-auto">
              <div className="text-xs text-ml-muted mb-1.5">Número</div>
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123"
                className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-white outline-none text-[15px] text-[#111] shadow-none transition-all duration-75 font-sans placeholder:text-[#cfcfcf] focus:border-ml-blue/70 focus:shadow-[0_6px_18px_rgba(30,108,247,0.08)]"
              />
            </label>

            <label className="label flex-1 flex flex-col mb-3 w-full sm:w-auto">
              <div className="text-xs text-ml-muted mb-1.5">Complemento</div>
              <input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto 45"
                className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-white outline-none text-[15px] text-[#111] shadow-none transition-all duration-75 font-sans placeholder:text-[#cfcfcf] focus:border-ml-blue/70 focus:shadow-[0_6px_18px_rgba(30,108,247,0.08)]"
              />
            </label>
          </div>

          <label className="flex flex-col mb-3">
            <div className="text-xs text-ml-muted mb-1.5">Bairro</div>
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Centro"
              className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-white outline-none text-[15px] text-[#111] shadow-none transition-all duration-75 font-sans placeholder:text-[#cfcfcf] focus:border-ml-blue/70 focus:shadow-[0_6px_18px_rgba(30,108,247,0.08)]"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5 items-start">
            <label className="label flex-[2] flex flex-col mb-3 w-full sm:w-auto">
              <div className="text-xs text-ml-muted mb-1.5">Cidade</div>
              <input
                value={cidade}
                disabled
                className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-[#f4f4f4] text-[#666] cursor-not-allowed outline-none text-[15px] shadow-none transition-all duration-75 font-sans"
                aria-disabled="true"
              />
            </label>

            <label className="label flex-1 flex flex-col mb-3 w-full sm:w-auto">
              <div className="text-xs text-ml-muted mb-1.5">UF</div>
              <input
                value={uf}
                disabled
                className="h-11 px-3 py-2.5 rounded-[10px] border border-ml-border bg-[#f4f4f4] text-[#666] cursor-not-allowed outline-none text-[15px] shadow-none transition-all duration-75 font-sans"
                aria-disabled="true"
              />
            </label>
          </div>

          <div className="h-[84px]" />
        </form>
      </main>

      <footer className="sticky bottom-0 py-3 px-3 sm:px-4 bg-gradient-to-t from-ml-bg to-transparent flex justify-center shadow-[0_-6px_18px_rgba(0,0,0,0.03)]">
        <button
          className="w-full max-w-[640px] h-[48px] sm:h-[52px] bg-ml-blue text-white border-none rounded-xl text-sm sm:text-base font-semibold cursor-pointer shadow-[0_6px_12px_rgba(30,108,247,0.18)] transition-transform duration-100 hover:bg-ml-blue-hover active:translate-y-px"
          onClick={handleSubmit}
        >
          Continuar
        </button>
      </footer>
    </div>
  )
}
