'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, Share2, Star, ChevronLeft, ChevronRight, Tag, Zap, ChevronRight as ChevronRightIcon, Search } from 'lucide-react'

export default function ProductSection() {
  const router = useRouter()
  // Array de imagens do produto - ordem invertida (7 ao 1)
  const productImages = [
    '/images/product-7.png', // Placa crisper
    '/images/product-6.png', // Vegetais
    '/images/product-5.png', // Asas de frango
    '/images/product-4.png', // Cesta vazia
    '/images/product-3.png', // Air fryer frontal direita
    '/images/product-2.png', // Air fryer frontal esquerda
    '/images/product-1.png', // Primeira imagem (principal) - muffins
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null)
  const [imageError, setImageError] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [nextImageTransform, setNextImageTransform] = useState('translateX(100%)')
  const imageRef = useRef<HTMLDivElement>(null)
  const nextImageRef = useRef<HTMLDivElement>(null)
  const totalImages = productImages.length

  const handleImageChange = (index: number) => {
    if (isTransitioning) return
    if (index === currentImageIndex) return
    
    setIsTransitioning(true)
    setSlideDirection(index > currentImageIndex ? 'left' : 'right')
    setNextImageIndex(index)
    // Aguardar a animação terminar antes de atualizar o índice atual
    setTimeout(() => {
      setCurrentImageIndex(index)
      setNextImageIndex(null)
      setIsTransitioning(false)
      setSlideDirection(null)
      setImageError(false)
    }, 500)
  }

  const nextImage = () => {
    if (isTransitioning) return
    const next = (currentImageIndex + 1) % totalImages
    setIsTransitioning(true)
    setSlideDirection('left')
    setNextImageIndex(next)
    // Aguardar a animação terminar antes de atualizar o índice atual
    setTimeout(() => {
      setCurrentImageIndex(next)
      setNextImageIndex(null)
      setIsTransitioning(false)
      setSlideDirection(null)
      setImageError(false)
    }, 500)
  }

  const prevImage = () => {
    if (isTransitioning) return
    const prev = (currentImageIndex - 1 + totalImages) % totalImages
    setIsTransitioning(true)
    setSlideDirection('right')
    setNextImageIndex(prev)
    // Aguardar a animação terminar antes de atualizar o índice atual
    setTimeout(() => {
      setCurrentImageIndex(prev)
      setNextImageIndex(null)
      setIsTransitioning(false)
      setSlideDirection(null)
      setImageError(false)
    }, 500)
  }

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      // Swipe para a esquerda - próxima imagem
      nextImage()
    }
    if (distance < -minSwipeDistance) {
      // Swipe para a direita - imagem anterior
      prevImage()
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }

  // Verificar se a imagem existe ao mudar
  useEffect(() => {
    setImageError(false)
  }, [currentImageIndex])

  // Controlar animação da próxima imagem
  useEffect(() => {
    if (nextImageIndex !== null && slideDirection) {
      // Primeiro: posicionar a próxima imagem fora da tela
      setNextImageTransform(
        slideDirection === 'left' ? 'translateX(100%)' : 'translateX(-100%)'
      )
      // Aguardar o próximo frame para garantir que o DOM foi atualizado
      const timeoutId = setTimeout(() => {
        // Agora animar para dentro
        setNextImageTransform('translateX(0)')
      }, 10)
      
      return () => clearTimeout(timeoutId)
    } else {
      // Reset quando não há transição
      setNextImageTransform('translateX(100%)')
    }
  }, [nextImageIndex, slideDirection])
  return (
    <div className="w-full bg-white">
      {/* Top Section - Product Info */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Status e Vendas */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[13px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Novo</span>
          <span className="text-[13px] text-[rgba(0,0,0,0.25)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>|</span>
          <span className="text-[13px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>+10mil vendidos</span>
        </div>

        {/* Rating e Badge */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-normal text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>4.9</span>
            <div className="flex items-center ml-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-[#3483fa] text-[#3483fa]"
                />
              ))}
            </div>
            <span className="text-[13px] text-[rgba(0,0,0,0.55)] ml-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>(14339)</span>
          </div>
          
          <div className="px-2 py-0.5 rounded" style={{ backgroundColor: '#ff6d00' }}>
            <span className="text-white text-[11px] font-semibold uppercase" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>MAIS VENDIDO</span>
          </div>
          
          <span className="text-[13px] text-[#3483fa]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>5° em Fritadeiras</span>
        </div>

        {/* Título do Produto */}
        <h1 className="text-[20px] leading-[1.25] font-normal text-[rgba(0,0,0,0.9)] mb-5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          Fritadeira Air Fryer Forno Oven 12L, Mondial, 2000W - AFON-12L-BI
        </h1>
      </div>

      {/* Product Image Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-4">
        <div className="relative bg-white rounded-lg overflow-hidden">
          {/* Image Counter */}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
            {totalImages - currentImageIndex}/{totalImages}
          </div>

          {/* Favorite and Share Icons */}
          <button className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm z-10 transition-colors">
            <Heart className="w-5 h-5 text-[#3483fa]" />
          </button>
          
          <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm z-10 transition-colors">
            <Share2 className="w-5 h-5 text-[#3483fa]" />
          </button>

          {/* Product Image */}
          <div 
            ref={imageRef}
            className="relative w-full aspect-square bg-white overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!imageError ? (
              <>
                {/* Imagem atual - desliza para fora */}
                <div 
                  key={`current-${currentImageIndex}`}
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
                    slideDirection === 'left' ? '-translate-x-full' : 
                    slideDirection === 'right' ? 'translate-x-full' : 
                    'translate-x-0'
                  }`}
                >
                  <Image
                    src={productImages[currentImageIndex]}
                    alt="Fritadeira Air Fryer Forno Oven 12L, Mondial, 2000W"
                    fill
                    className="object-cover"
                    priority={currentImageIndex === totalImages - 1}
                    onError={() => setImageError(true)}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>
                
                {/* Próxima imagem - desliza para dentro */}
                {nextImageIndex !== null && (
                  <div 
                    ref={nextImageRef}
                    key={`next-${nextImageIndex}`}
                    className="absolute inset-0 w-full h-full"
                    style={{
                      transform: nextImageTransform,
                      transition: 'transform 500ms ease-in-out',
                    }}
                  >
                    <Image
                      src={productImages[nextImageIndex]}
                      alt="Fritadeira Air Fryer Forno Oven 12L, Mondial, 2000W"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">📷</span>
                  </div>
                  <span className="text-gray-500 text-sm block">Imagem {totalImages - currentImageIndex} de {totalImages}</span>
                  <span className="text-gray-400 text-xs block mt-1">Adicione as imagens em /public/images/</span>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm z-10 transition-colors"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-5 h-5 text-[#3483fa]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm z-10 transition-colors"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-5 h-5 text-[#3483fa]" />
            </button>
            
            {/* Badge sobre a imagem do produto */}
            <div className="absolute top-4 right-4 bg-white rounded px-2 py-1 shadow-sm flex items-center gap-1.5 z-10">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-800">MINID 5X TOP MIND</span>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 mt-3 pb-2">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-[#3483fa]' : 'bg-gray-300'
                }`}
                aria-label={`Ver imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Color */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-3">
        <div className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          <span style={{ fontWeight: 400 }}>Cor: </span><span className="font-semibold" style={{ fontWeight: 600 }}>Preto/Inox</span>
        </div>
      </div>

      {/* Price and Delivery Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-4">
        {/* Black Friday Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-black border border-white px-2.5 py-1.5 rounded flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[11px] font-semibold uppercase tracking-wide" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>BLACK FRIDAY</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-5">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[36px] font-light text-[rgba(0,0,0,0.9)] leading-none" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 300 }}>R$ 149</span>
            <span className="text-[20px] font-light text-[rgba(0,0,0,0.9)] leading-none" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 300 }}>90</span>
          </div>
          <div className="text-[16px] text-[rgba(0,0,0,0.9)] mb-2" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            <span>12x R$ 12,49</span>
          </div>
          <a href="#" className="text-[14px] text-[#3483fa] hover:underline" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            Ver os meios de pagamento
          </a>
        </div>

        {/* Free Shipping Banner */}
        <div className="inline-block px-3 py-2 rounded mb-5" style={{ backgroundColor: '#00a650' }}>
          <span className="text-white text-[13px] font-semibold uppercase tracking-wide" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>FRETE GRÁTIS ACIMA DE R$ 19</span>
        </div>

        {/* Delivery Options */}
        <div className="space-y-5 mb-6">
          {/* Delivery Option 1 */}
          <div>
            <div className="text-[16px] text-[#00a650] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Receba grátis amanhã
            </div>
            <div className="text-[14px] text-[rgba(0,0,0,0.55)] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Comprando dentro das próximas <span style={{ fontWeight: 600 }}>6 h 23 min</span>
            </div>
            <a href="#" className="text-[14px] text-[#3483fa] hover:underline" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Mais detalhes e formas de entrega
            </a>
          </div>

          {/* Delivery Option 2 */}
          <div>
            <div className="text-[16px] text-[rgba(0,0,0,0.9)] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              <span className="text-[#00a650]">Retire grátis</span> a partir de amanhã em uma agência Mercado Livre
            </div>
            <div className="text-[14px] text-[rgba(0,0,0,0.55)] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Comprando dentro das próximas <span style={{ fontWeight: 600 }}>5 h 23 min</span>
            </div>
            <a href="#" className="text-[14px] text-[#3483fa] hover:underline" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Ver no mapa
            </a>
          </div>
        </div>

        {/* Stock Information */}
        <div className="mb-5">
          <div className="text-[14px] text-[rgba(0,0,0,0.9)] mb-2" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
            Estoque disponível
          </div>
          <div className="text-[13px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            Armazenado e enviado pelo{' '}
            <span className="inline-flex items-center gap-0.5 text-[#00a650]">
              <Zap className="w-3.5 h-3.5 fill-[#00a650]" />
              <span className="font-semibold" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>FULL</span>
            </span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="rounded px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[rgba(0,0,0,0.04)] transition-colors mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Quantidade: </span>
            <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>1 </span>
            <span className="text-[13px] text-[rgba(0,0,0,0.45)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>(+25 disponíveis)</span>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-[rgba(0,0,0,0.45)]" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Comprar Agora Button */}
          <button 
            onClick={() => router.push('/seguro')}
            className="w-full rounded py-3 text-white text-[16px] font-semibold transition-colors hover:bg-[#2968c8]" 
            style={{ backgroundColor: '#3483fa', fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}
          >
            Comprar agora
          </button>

          {/* Adicionar ao Carrinho Button */}
          <button className="w-full rounded py-3 text-[#3483fa] text-[16px] font-semibold transition-colors hover:bg-[rgba(65,137,230,0.08)]" style={{ backgroundColor: 'rgba(65,137,230,0.06)', fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
            Adicionar ao carrinho
          </button>
        </div>

        {/* Seller Information */}
        <div className="mb-6">
          <div className="text-[14px] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            <span className="text-[rgba(0,0,0,0.55)]">Vendido por </span>
            <a href="#" className="text-[#3483fa] hover:underline" style={{ fontWeight: 400 }}>SUCESSOTOTAL</a>
          </div>
          <div className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            <span style={{ fontWeight: 600 }}>MercadoLíder</span> | +10mil vendas
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-6">
          {/* Devolução Grátis */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[rgba(0,0,0,0.55)]">
                <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 14L4 16L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                <a href="#" className="text-[#3483fa] hover:underline" style={{ fontWeight: 400 }}>Devolução grátis.</a>
                <span className="text-[rgba(0,0,0,0.55)]"> Você tem 30 dias a partir da data de recebimento.</span>
              </span>
            </div>
          </div>

          {/* Compra Garantida */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[rgba(0,0,0,0.55)]">
                <path d="M10 2L3 5V9C3 13.5 6 17 10 18C14 17 17 13.5 17 9V5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                <a href="#" className="text-[#3483fa] hover:underline" style={{ fontWeight: 400 }}>Compra Garantida.</a>
                <span className="text-[rgba(0,0,0,0.55)]"> Receba o produto que está esperando ou devolvemos o dinheiro.</span>
              </span>
            </div>
          </div>

          {/* Garantia de Fábrica */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[rgba(0,0,0,0.55)]">
                <circle cx="10" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 13L6 18H14L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                90 dias de garantia de fábrica.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-[rgba(0,0,0,0.1)]">
          <button className="flex items-center gap-2 text-[#3483fa] hover:underline transition-colors">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Adicionar aos favoritos</span>
          </button>
          <button className="flex items-center gap-2 text-[#3483fa] hover:underline transition-colors">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Product Information Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(0,0,0,0.1)]">
        <h2 className="text-[18px] text-[rgba(0,0,0,0.9)] mb-5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          O que você precisa saber sobre este produto
        </h2>

        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-[rgba(0,0,0,0.9)] text-[16px] mt-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>•</span>
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Possui temperatura ajustável entre 0 °c e 200 °c.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[rgba(0,0,0,0.9)] text-[16px] mt-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>•</span>
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Superfície antiaderente.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[rgba(0,0,0,0.9)] text-[16px] mt-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>•</span>
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Pesa 7.6kg.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[rgba(0,0,0,0.9)] text-[16px] mt-1.5" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>•</span>
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Dimensões: 32cm de largura, 39cm de altura e 36,1cm de comprimento.
            </span>
          </li>
        </ul>
      </div>

      {/* Seller Information Card */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(0,0,0,0.1)]">
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.1)] p-6">
          {/* Seller Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Seller Avatar */}
              <div className="w-[72px] h-[72px] rounded-lg bg-[#f5f5f5] flex items-center justify-center border border-[rgba(0,0,0,0.1)]">
                <span className="text-[32px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>S</span>
              </div>
              
              {/* Seller Info */}
              <div>
                <h3 className="text-[18px] text-[rgba(0,0,0,0.9)] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
                  SUCESSOTOTAL
                </h3>
                <div className="flex items-center gap-3 text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  <span><span style={{ fontWeight: 600 }}>+100</span> Seguidores</span>
                  <span><span style={{ fontWeight: 600 }}>+100</span> Produtos</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button className="px-6 py-2 rounded text-[#3483fa] text-[14px] font-semibold hover:bg-[rgba(65,137,230,0.08)] transition-colors" style={{ backgroundColor: 'rgba(65,137,230,0.06)', fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
              Seguir
            </button>
          </div>

          {/* MercadoLíder Badge */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#00a650]">
                <path d="M9 2L3 5V8C3 11.5 5.5 14.5 9 15.5C12.5 14.5 15 11.5 15 8V5L9 2Z" fill="currentColor"/>
              </svg>
              <span className="text-[16px] text-[#00a650]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
                MercadoLíder Platinum
              </span>
            </div>
            <p className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              É um dos melhores do site!
            </p>
          </div>

          {/* Reputation Bar */}
          <div className="flex gap-0.5 mb-6 h-2">
            <div className="flex-1 bg-[#ffe1e6] rounded-l"></div>
            <div className="flex-1 bg-[#f5f5f5]"></div>
            <div className="flex-1 bg-[#fff9e6]"></div>
            <div className="flex-1 bg-[#e6f7ed]"></div>
            <div className="flex-1 bg-[#00a650] rounded-r"></div>
          </div>

          {/* Seller Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-[20px] text-[rgba(0,0,0,0.9)] mb-1" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
                +10mil
              </div>
              <div className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                Vendas
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00a650]">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                Bom atendimento
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00a650]">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                Entrega no prazo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(0,0,0,0.1)]">
        <h2 className="text-[24px] text-[rgba(0,0,0,0.9)] mb-6" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          Características do produto
        </h2>

        {/* Características principais */}
        <h3 className="text-[16px] text-[rgba(0,0,0,0.9)] mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
          Características principais
        </h3>

        <div className="space-y-0 mb-8">
          {/* Marca */}
          <div className="flex py-3 border-b border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Marca</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Mondial</span>
            </div>
          </div>

          {/* Linha */}
          <div className="flex py-3 border-b border-[rgba(0,0,0,0.1)]">
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Linha</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Oven</span>
            </div>
          </div>

          {/* Modelo */}
          <div className="flex py-3 border-b border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Modelo</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>AFON-12L-BI</span>
            </div>
          </div>

          {/* Cor */}
          <div className="flex py-3">
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Cor</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>Preto/Inox</span>
            </div>
          </div>
        </div>

        {/* Peso e dimensões */}
        <h3 className="text-[16px] text-[rgba(0,0,0,0.9)] mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>
          Peso e dimensões
        </h3>

        <div className="space-y-0">
          {/* Altura */}
          <div className="flex py-3 border-b border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Altura</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>39 cm</span>
            </div>
          </div>

          {/* Largura */}
          <div className="flex py-3">
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Largura</span>
            </div>
            <div className="w-1/2 px-4">
              <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>32 cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(0,0,0,0.1)]">
        <h2 className="text-[24px] text-[rgba(0,0,0,0.9)] mb-6" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          Detalhes do produto
        </h2>

        <div className="space-y-4">
          {/* Imagem 1 */}
          <div className="relative w-full rounded-lg overflow-hidden">
            <Image
              src="/images/detalhes-1.png"
              alt="Detalhes do produto - Air Fryer Forno"
              width={1200}
              height={600}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>

          {/* Imagem 2 */}
          <div className="relative w-full rounded-lg overflow-hidden">
            <Image
              src="/images/detalhes-2.png"
              alt="Detalhes do produto - Capacidade 12 Litros"
              width={1200}
              height={600}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(0,0,0,0.1)]">
        <h2 className="text-[24px] text-[rgba(0,0,0,0.9)] mb-6" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          Opiniões do produto
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Overall Rating */}
          <div>
            {/* Rating Number */}
            <div className="text-[64px] leading-none text-[#3483fa] mb-2" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 300 }}>
              4.9
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-[#3483fa] text-[#3483fa]"
                />
              ))}
            </div>

            {/* Review Count */}
            <div className="text-[14px] text-[rgba(0,0,0,0.55)] mb-8" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              14.330 avaliações
            </div>

            {/* Rating Attributes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Custo-benefício
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-[#3483fa] text-[#3483fa]' : 'fill-[#3483fa] text-[#3483fa] opacity-50'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Capacidade
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-[#3483fa] text-[#3483fa]' : 'fill-[#3483fa] text-[#3483fa] opacity-50'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Facilidade de uso
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-[#3483fa] text-[#3483fa]' : 'fill-[#3483fa] text-[#3483fa] opacity-50'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                  Fácil de limpar
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-[#3483fa] text-[#3483fa]' : 'fill-[#3483fa] text-[#3483fa] opacity-50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Rating Distribution */}
          <div>
            <div className="space-y-2">
              {/* 5 Stars */}
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[rgba(0,0,0,0.55)] w-3" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>5</span>
                <Star className="w-4 h-4 fill-[rgba(0,0,0,0.25)] text-[rgba(0,0,0,0.25)]" />
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#666666]" style={{ width: '90%' }}></div>
                </div>
              </div>

              {/* 4 Stars */}
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[rgba(0,0,0,0.55)] w-3" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>4</span>
                <Star className="w-4 h-4 fill-[rgba(0,0,0,0.25)] text-[rgba(0,0,0,0.25)]" />
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#cccccc]" style={{ width: '5%' }}></div>
                </div>
              </div>

              {/* 3 Stars */}
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[rgba(0,0,0,0.55)] w-3" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>3</span>
                <Star className="w-4 h-4 fill-[rgba(0,0,0,0.25)] text-[rgba(0,0,0,0.25)]" />
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#e0e0e0]" style={{ width: '2%' }}></div>
                </div>
              </div>

              {/* 2 Stars */}
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[rgba(0,0,0,0.55)] w-3" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>2</span>
                <Star className="w-4 h-4 fill-[rgba(0,0,0,0.25)] text-[rgba(0,0,0,0.25)]" />
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#e8e8e8]" style={{ width: '1%' }}></div>
                </div>
              </div>

              {/* 1 Star */}
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[rgba(0,0,0,0.55)] w-3" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>1</span>
                <Star className="w-4 h-4 fill-[rgba(0,0,0,0.25)] text-[rgba(0,0,0,0.25)]" />
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#f0f0f0]" style={{ width: '2%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opiniões com fotos */}
        <div className="mt-8">
          <h3 className="text-[18px] text-[rgba(0,0,0,0.9)] mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            Opiniões com fotos
          </h3>

          {/* Photos Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f5f5] cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={`/images/feedback-${num}.png`}
                  alt={`Opinião com foto ${num}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 400px"
                />
                {/* Rating Badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded flex items-center gap-1">
                  <span className="text-[12px] font-semibold" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>5</span>
                  <Star className="w-3 h-3 fill-white text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opiniões em destaque */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Opiniões em destaque
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded border border-[rgba(0,0,0,0.1)] text-[#3483fa] hover:bg-[rgba(0,0,0,0.02)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#3483fa]">
                <path d="M2 8H10M10 8L7 5M10 8L7 11M16 2V16H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 600 }}>Filtrar</span>
            </button>
          </div>

          <p className="text-[14px] text-[rgba(0,0,0,0.55)] mb-6" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            5.880 comentários
          </p>

          {/* AI Summary */}
          <div className="bg-[#f5f5f5] rounded-lg p-5 mb-6">
            <p className="text-[16px] text-[rgba(0,0,0,0.9)] leading-relaxed" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              É elogiada por seu excelente custobenefício, praticidade e capacidade de preparar uma variedade de alimentos rapidamente. O design é considerado bonito e funcional, com um painel fácil de usar e espaço interno adequado para grandes porções. Além disso, a facilidade de limpeza e a eficiência energética são aspectos positivos frequentemente mencionados.
            </p>
          </div>

          {/* Review Card */}
          <div className="border-t border-[rgba(0,0,0,0.1)] pt-6">
            {/* Review Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#3483fa] text-[#3483fa]"
                  />
                ))}
              </div>
              <span className="text-[14px] text-[rgba(0,0,0,0.55)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                16 fev. 2025
              </span>
            </div>

            {/* Review Photos */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#f5f5f5] cursor-pointer hover:opacity-90 transition-opacity">
                  <Image
                    src={`/images/feedbackcommentario-${num <= 3 ? num : num - 3}.png`}
                    alt={`Foto da review ${num}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[16px] text-[rgba(0,0,0,0.9)] leading-relaxed" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              A air fryer mondial surpreendeu! preço justo! além de linda e elegante, é bem maior que o modelo padrão, ideal para preparar refeições para toda a família. As três prateleiras internas ajudam a distribuir melhor os alimentos, deixando tudo muito crocante e saboroso. O cesto é versátil e fácil de manusear, e a mini luva que acompanha facilita demais na hora de retirar as prateleiras quentes — um detalhe que faz toda a diferença! o grande destaque é a versatilidade: dá pra ajustar o timer e a temperatura mesmo enquanto ela está em funcionamento, o que é super prático. A limpeza, ao contrário do que li em outros comentários, não achei complicada. Só recomendo usar um papel toalha ao abrir a tampa para evitar que qualquer resíduo pingue nela. No mais, só elogios! comida muito bem preparada, e o preço vale cada centavo. Super recomendo!
            </p>
          </div>
        </div>
      </div>

      {/* Related Searches Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 bg-[#f5f5f5]">
        <h3 className="text-[14px] text-[rgba(0,0,0,0.55)] mb-4" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          Você também pode estar interessado:
        </h3>

        <div className="bg-white rounded-lg divide-y divide-[rgba(0,0,0,0.1)]">
          {/* microondas */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              microondas
            </span>
          </a>

          {/* geladeira inox */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              geladeira inox
            </span>
          </a>

          {/* air fryer com forno */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              air fryer com forno
            </span>
          </a>

          {/* batedeira mondial */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              batedeira mondial
            </span>
          </a>

          {/* fritadeira mondial */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              fritadeira mondial
            </span>
          </a>

          {/* air fryer mondial */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              air fryer mondial
            </span>
          </a>

          {/* mix */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors">
            <Search className="w-5 h-5 text-[rgba(0,0,0,0.25)]" strokeWidth={1.5} />
            <span className="text-[16px] text-[#3483fa]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              mix
            </span>
          </a>
        </div>
      </div>

      {/* Breadcrumb Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 bg-[#f5f5f5]">
        <nav className="flex items-center gap-2 flex-wrap text-[14px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
          <a href="#" className="text-[#3483fa] hover:underline">
            Eletrodomésticos
          </a>
          <span className="text-[rgba(0,0,0,0.55)]">›</span>
          <span className="text-[rgba(0,0,0,0.55)]">...</span>
          <span className="text-[rgba(0,0,0,0.55)]">›</span>
          <a href="#" className="text-[#3483fa] hover:underline">
            Preparação de Alimentos
          </a>
          <span className="text-[rgba(0,0,0,0.55)]">›</span>
          <a href="#" className="text-[#3483fa] hover:underline">
            Fritadeiras
          </a>
          <span className="text-[rgba(0,0,0,0.55)]">›</span>
          <a href="#" className="text-[#3483fa] hover:underline">
            De Ar
          </a>
          <span className="text-[rgba(0,0,0,0.55)]">›</span>
          <a href="#" className="text-[#3483fa] hover:underline">
            Fritadeira
          </a>
        </nav>
      </div>

      {/* App Banner */}
      <div className="w-full py-6" style={{ backgroundColor: '#fff159' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-3">
              <div className="relative w-full h-full">
                <Image
                  src="/images/mercadologo.jpeg"
                  alt="Mercado Livre"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            </div>
          </div>
          <h2 className="text-[20px] text-[rgba(0,0,0,0.9)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            Compre e venda com o app!
          </h2>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[rgba(0,0,0,0.1)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Minha conta
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Histórico
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Favoritos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Categorias
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Programa de Afiliados
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Compras
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Ofertas
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Lojas oficiais
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Meli+
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Vender
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] transition-colors" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
                    Lista de presentes
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Login Links */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[rgba(0,0,0,0.1)]">
            <a href="#" className="text-[14px] text-[#3483fa] hover:underline" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Entre
            </a>
            <span className="text-[rgba(0,0,0,0.25)]">|</span>
            <a href="#" className="text-[14px] text-[#3483fa] hover:underline" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              Crie a sua conta
            </a>
          </div>

          {/* Footer Bottom Links */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 flex-wrap text-[12px]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Termos e condições</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Promoções</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Como cuidamos da sua privacidade</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa] flex items-center gap-1">
                Acessibilidade
              </a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Informações sobre seguros</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Blog</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Afiliados</a>
              <a href="#" className="text-[rgba(0,0,0,0.55)] hover:text-[#3483fa]">Tendências</a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-[12px] text-[rgba(0,0,0,0.45)]" style={{ fontFamily: 'Proxima Nova, -apple-system, Roboto, Arial, sans-serif', fontWeight: 400 }}>
            <p className="mb-1">© 1999-2025 Ebazar.com.br LTDA.</p>
            <p>CNPJ n.º 03.007.331/0001-41 / Av. das Nações Unidas, nº 3.003, Bonfim, Osasco/SP - CEP 06233-903 - empresa do grupo Mercado Livre.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

