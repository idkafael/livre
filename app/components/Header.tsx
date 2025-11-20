'use client'

import { Search, Menu, ShoppingCart, MapPin, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function Header() {
  return (
    <div className="w-full">
      {/* Header Principal - Mobile First */}
      <header className="w-full h-[60px] flex items-center px-3 sm:px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#ffd100' }}>
        <div className="w-full mx-auto flex items-center gap-2 sm:gap-3 max-w-[1200px]">
          {/* Logo Circular */}
          <div className="flex-shrink-0">
            <a href="/" className="block">
              <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                <Image
                  src="/images/180x180.png"
                  alt="Mercado Livre"
                  fill
                  className="object-contain rounded-full"
                  priority
                  sizes="(max-width: 640px) 36px, 40px"
                />
              </div>
            </a>
          </div>

          {/* Barra de Busca */}
          <div className="flex-1 min-w-0 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos, marcas e muito mais…"
                className="w-full h-10 pl-12 pr-4 rounded border-0 bg-white text-[rgba(0,0,0,0.9)] placeholder-[rgba(0,0,0,0.45)] text-[14px] focus:outline-none focus:shadow-[0_0_0_2px_rgba(52,131,250,0.2)]"
                style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[rgba(0,0,0,0.25)] pointer-events-none">
                <Search size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Ícones Direita */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <button className="text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.75)] transition-colors p-1">
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <button className="text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.75)] transition-colors p-1 relative">
              <ShoppingCart size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Barra Secundária CEP */}
      <div className="w-full h-[40px] flex items-center px-3 sm:px-4" style={{ backgroundColor: '#ededed' }}>
        <div className="w-full mx-auto flex items-center justify-between max-w-[1200px]">
          <button className="flex items-center gap-2 text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.75)] transition-colors">
            <MapPin size={17} strokeWidth={2} />
            <span className="text-[13px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Enviar para São Paulo 05211-120</span>
          </button>
          <ChevronRight size={16} className="text-[rgba(0,0,0,0.25)]" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

