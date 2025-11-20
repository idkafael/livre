'use client'

import { useEffect, useState } from 'react'

interface IndexContentProps {
  htmlContent: string
}

export default function IndexContent({ htmlContent }: IndexContentProps) {
  const [bodyContent, setBodyContent] = useState<string>('')
  const [headContent, setHeadContent] = useState<string>('')
  const [isFileProtocol, setIsFileProtocol] = useState(false)
  const [error, setError] = useState<string>('')

  // Detectar se está sendo executado via file://
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      setIsFileProtocol(true)
    }
  }, [])

  useEffect(() => {
    if (!htmlContent || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    // AVISO: Este código só funciona quando executado através do servidor Next.js
    // Se você está vendo erros, certifique-se de estar acessando via http://localhost:3000
    // e não abrindo o arquivo HTML diretamente no navegador
    
    // Interceptar fetch para bloquear requisições para localhost:3003
    const originalFetch = window.fetch
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url && url.includes('localhost:3003')) {
        console.warn('Blocked fetch to localhost:3003:', url)
        return Promise.reject(new Error('Request blocked: localhost:3003'))
      }
      return originalFetch(input, init)
    }
    
    // Interceptar XMLHttpRequest para bloquear requisições para localhost:3003
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlString = typeof url === 'string' ? url : url.toString()
      if (urlString.includes('localhost:3003')) {
        console.warn('Blocked XMLHttpRequest to localhost:3003:', urlString)
        return
      }
      return originalXHROpen.apply(this, [method, url, ...args] as any)
    }
    
    // Salvar referência ao createElement original
    const originalCreateElement = document.createElement.bind(document)
    
    // Interceptar criação dinâmica de scripts para bloquear React
    const scriptInterceptor = function(tagName: string) {
      if (tagName.toLowerCase() === 'script') {
        const script = originalCreateElement('script')
        const originalSetAttribute = script.setAttribute.bind(script)
        const originalAppendChild = script.appendChild.bind(script)
        
        // Interceptar setAttribute para bloquear src do React
        script.setAttribute = function(name: string, value: string) {
          if (name === 'src' && (
            value.includes('react') || 
            value.includes('react-dom') ||
            value.includes('main.ts') ||
            value.includes('index.production') ||
            value.includes('scheduler.production')
          )) {
            console.log('Blocked React script:', value)
            return // Não definir o src
          }
          return originalSetAttribute(name, value)
        }
        
        // Interceptar appendChild para bloquear scripts inline do React
        script.appendChild = function<T extends Node>(node: T): T {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const content = node.textContent
            if (content.includes('React') || content.includes('react-dom')) {
              console.log('Blocked React inline script')
              return node // Não adicionar
            }
          }
          return originalAppendChild(node) as T
        }
        
        return script
      }
      return originalCreateElement(tagName)
    }
    
    // Substituir temporariamente createElement
    document.createElement = scriptInterceptor as any
    
    // Observer para bloquear scripts adicionados dinamicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement
            const src = script.src || ''
            const content = script.innerHTML || ''
            
            // Bloquear scripts do React
            if (
              src.includes('react') ||
              src.includes('react-dom') ||
              src.includes('main.ts') ||
              src.includes('index.production') ||
              src.includes('scheduler.production') ||
              content.includes('React') ||
              content.includes('react-dom')
            ) {
              console.log('Blocked dynamically added React script:', src || 'inline')
              script.remove()
            }
          }
        })
      })
    })
    
    // Observar mudanças no head e body
    observer.observe(document.head, { childList: true, subtree: true })
    observer.observe(document.body, { childList: true, subtree: true })

    try {
      // Extrair apenas o conteúdo do body, removendo as tags html/head/body
      if (!htmlContent || htmlContent.length === 0) {
        console.warn('HTML content is empty')
        return
      }

      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      
      // Verificar se há erros de parsing
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        console.error('HTML parsing error:', parserError.textContent)
        setError('Erro ao processar HTML. Verifique o console para mais detalhes.')
        return
      }
      
      // Remover scripts do React do body usando DOMParser antes de processar
      const bodyElement = doc.body
      if (bodyElement) {
        // Encontrar e remover todos os scripts do React
        const scripts = bodyElement.querySelectorAll('script')
        scripts.forEach((script) => {
          const src = script.getAttribute('src') || ''
          const content = script.innerHTML || ''
          const id = script.getAttribute('id') || ''
          
          // Verificar se é um script do React
          if (
            src.includes('react') ||
            src.includes('react-dom') ||
            src.includes('main.ts') ||
            src.includes('index.production') ||
            src.includes('scheduler.production') ||
            content.includes('React') ||
            content.includes('react-dom') ||
            id.includes('react') ||
            script.hasAttribute('data-head-react')
          ) {
            script.remove()
          }
        })
      }
      
      // Pegar todo o conteúdo do body e corrigir caminhos relativos
      let body = doc.body?.innerHTML || ''
      
      // NÃO substituir o header - manter o header original do HTML
      // O header original já está no body e será preservado
      
      // Corrigir texto "MercadoLibre" para "MercadoLivre" (apenas texto visível)
      // Substituir em texto entre tags HTML, mas não em atributos ou URLs
      body = body.replace(/(>)([^<]*?)MercadoLivre([^<]*?)(<)/g, '$1$2MercadoLivre$3$4')
      body = body.replace(/(>)([^<]*?)mercado livre([^<]*?)(<)/gi, '$1$2Mercado Livre$3$4')
      // Substituir "mercadolibre" (tudo junto, minúsculo) por "MercadoLivre"
      body = body.replace(/(>)([^<]*?)mercadolivre([^<]*?)(<)/gi, '$1$2MercadoLivre$3$4')
      
      // Substituir todos os preços por 149
      // Substituir padrões como R$ 421,21, R$421,21, R$ 699,90, etc.
      body = body.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+,\d{2})/g, 'R$ 149')
      body = body.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:\.\d{2})?|\d+\.\d{2})/g, 'R$ 149')
      // Substituir formato com superscript: R$ 421²¹ ou R$ 421<sup>21</sup> por R$ 149⁹⁰
      body = body.replace(/R\$\s*(\d{3,})([²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]|<\/?sup>[\d]+<\/?sup>)/g, 'R$ 149⁹⁰')
      body = body.replace(/R\$\s*(\d{3,})<sup>(\d{2})<\/sup>/g, 'R$ 149<sup>90</sup>')
      // Substituir valores numéricos em JSON (421.21, 79.55, etc.) por 149
      body = body.replace(/"price":\s*(\d+\.\d+)/g, '"price":149')
      body = body.replace(/"localItemPrice":\s*(\d+\.\d+)/g, '"localItemPrice":149')
      body = body.replace(/"itemPrice":\s*(\d+\.\d+)/g, '"itemPrice":149')
      // Substituir preços em formato numérico puro (421,21 ou 421.21) quando seguidos de contexto de preço
      body = body.replace(/(\d{3,}(?:[.,]\d{2})?)(\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+))/gi, '149$2')
      // Substituir valores grandes que parecem preços (421.21, 699.90, etc.) em contextos específicos
      body = body.replace(/(\d{3,}\.\d{2})(?=\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+))/gi, '149')
      // Substituir formato específico "421²¹" ou "421<sup>21</sup>" por "149⁹⁰"
      body = body.replace(/(\d{3,})([²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]|<\/?sup>[\d]+<\/?sup>)/g, '149⁹⁰')
      body = body.replace(/(\d{3,})<sup>(\d{2})<\/sup>/g, '149<sup>90</sup>')
      // Corrigir duplicações
      body = body.replace(/149,90,90/g, '149')
      body = body.replace(/149\s+90\s+90/g, '149')
      body = body.replace(/R\$\s*149,90,90/g, 'R$ 149')
      // Substituir especificamente o número 421 quando aparecer sozinho ou em contexto de preço
      body = body.replace(/>\s*421\s*</g, '>149<')
      body = body.replace(/>\s*421²¹\s*</g, '>149⁹⁰<')
      body = body.replace(/>\s*421<sup>21<\/sup>\s*</g, '>149<sup>90</sup><')
      // Substituir "421" quando seguido de contexto de preço ou moeda
      body = body.replace(/\b421\b(?=\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+|²|sup))/gi, '149')
      
      // Substituir superscript "²¹" por "⁹⁰" - aplicar após todas as substituições
      // Substituir qualquer caractere superscript Unicode "²¹" por "⁹⁰" após números de preço
      body = body.replace(/(\d{3,})[²¹]/g, '$1⁹⁰')
      body = body.replace(/(R\$\s*\d{3,})[²¹]/g, '$1⁹⁰')
      // Substituir tags <sup>21</sup> por <sup>90</sup> após preços
      body = body.replace(/(\d{3,})<sup>21<\/sup>/g, '$1<sup>90</sup>')
      body = body.replace(/(R\$\s*\d{3,})<sup>21<\/sup>/g, '$1<sup>90</sup>')
      // Substituir especificamente "²¹" após qualquer número por "⁹⁰"
      body = body.replace(/(\d+)²¹/g, '$1⁹⁰')
      body = body.replace(/(R\$\s*\d+)²¹/g, '$1⁹⁰')
      // Substituir COMPLETAMENTE qualquer "21" em superscript após "149" por "90" - TODAS AS VARIAÇÕES POSSÍVEIS
      body = body.replace(/149[²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]+/g, '149⁹⁰')
      body = body.replace(/149<sup>[\d]+<\/sup>/g, '149<sup>90</sup>')
      body = body.replace(/R\$\s*149[²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]+/g, 'R$ 149⁹⁰')
      body = body.replace(/R\$\s*149<sup>[\d]+<\/sup>/g, 'R$ 149<sup>90</sup>')
      // Substituir "21" em qualquer formato após preços por "90"
      body = body.replace(/149\s*²¹/g, '149⁹⁰')
      body = body.replace(/149\s*<sup>21<\/sup>/g, '149<sup>90</sup>')
      body = body.replace(/R\$\s*149\s*²¹/g, 'R$ 149⁹⁰')
      body = body.replace(/R\$\s*149\s*<sup>21<\/sup>/g, 'R$ 149<sup>90</sup>')
      // Substituir qualquer sequência de caracteres que pareça "21" em superscript por "90"
      body = body.replace(/149[²][¹]/g, '149⁹⁰')
      body = body.replace(/R\$\s*149[²][¹]/g, 'R$ 149⁹⁰')
      // Substituir qualquer número em superscript "21" por "90"
      body = body.replace(/(\d+)[²][¹]/g, '$1⁹⁰')
      body = body.replace(/(R\$\s*\d+)[²][¹]/g, '$1⁹⁰')
      // Substituir especificamente o caractere "²" seguido de "¹" por "⁹⁰"
      body = body.replace(/149²[¹]/g, '149⁹⁰')
      body = body.replace(/R\$\s*149²[¹]/g, 'R$ 149⁹⁰')
      // Substituir qualquer tag <sup> que contenha "21" por "90" após preços
      body = body.replace(/149<sup>[^<]*21[^<]*<\/sup>/gi, '149<sup>90</sup>')
      body = body.replace(/R\$\s*149<sup>[^<]*21[^<]*<\/sup>/gi, 'R$ 149<sup>90</sup>')
      
      // Remover scripts problemáticos do body (React, etc.)
      // Remover TODOS os scripts que carregam React ou causam conflitos
      // Usar regex mais agressivo para pegar scripts com src ou inline
      body = body.replace(/<script[^>]*src=["'][^"']*react[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*react-dom[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*main\.ts[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*index\.production[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*scheduler\.production[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      
      // Remover scripts sem fechamento (self-closing ou sem tag de fechamento)
      body = body.replace(/<script[^>]*src=["'][^"']*react[^"']*["'][^>]*\/?>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*react-dom[^"']*["'][^>]*\/?>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*main\.ts[^"']*["'][^>]*\/?>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*index\.production[^"']*["'][^>]*\/?>/gi, '')
      body = body.replace(/<script[^>]*src=["'][^"']*scheduler\.production[^"']*["'][^>]*\/?>/gi, '')
      
      // Remover scripts inline que contêm React (mais agressivo)
      body = body.replace(/<script[^>]*>[\s\S]*?React[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*>[\s\S]*?react-dom[\s\S]*?<\/script>/gi, '')
      body = body.replace(/<script[^>]*>[\s\S]*?react-dom\.production[\s\S]*?<\/script>/gi, '')
      
      // Remover também scripts que são carregados dinamicamente via JavaScript
      // Bloquear chamadas que criam scripts do React
      body = body.replace(/loadScripts\([^)]*react[^)]*\)/gi, '')
      body = body.replace(/createElement\(['"]script['"][^)]*react[^)]*\)/gi, '')
      
      // Corrigir URLs de localhost com porta incorreta (substituir por caminhos relativos)
      // Isso evita erros de CORS e requisições para portas incorretas
      // Remover completamente URLs com localhost:3003
      body = body.replace(/http:\/\/localhost:3003\/?/g, '')
      body = body.replace(/http:\/\/localhost:\d+\//g, '/')
      body = body.replace(/localhost:3003\/?/g, '')
      // Remover atributos src/href vazios que podem causar problemas
      body = body.replace(/src=["']\s*["']/g, 'src=""')
      body = body.replace(/href=["']\s*["']/g, 'href=""')
      
      // Corrigir caminhos de imagens e outros recursos no body
      body = body.replace(/src=["']images\//g, 'src="/images/')
      body = body.replace(/src=["']fonts\//g, 'src="/fonts/')
      body = body.replace(/src=["']css\//g, 'src="/css/')
      body = body.replace(/href=["']images\//g, 'href="/images/')
      body = body.replace(/href=["']fonts\//g, 'href="/fonts/')
      body = body.replace(/href=["']css\//g, 'href="/css/')
      body = body.replace(/url\(images\//g, 'url(/images/')
      body = body.replace(/url\(fonts\//g, 'url(/fonts/')
      body = body.replace(/url\(css\//g, 'url(/css/')
      
      // Corrigir atributos data-src e data-srcset para imagens lazy loading
      body = body.replace(/data-src=["']images\//g, 'data-src="/images/')
      body = body.replace(/data-src=["']http/g, 'data-src="http') // Manter URLs externas
      body = body.replace(/data-srcset=["']images\//g, 'data-srcset="/images/')
      body = body.replace(/data-srcset=["']http/g, 'data-srcset="http') // Manter URLs externas
      
      // Adicionar link para /seguro nos botões de compra
      // Substituir botões de compra por links para /seguro
      body = body.replace(/<button([^>]*class="[^"]*ui-pdp-action--primary[^"]*"[^>]*)>/gi, '<a$1 href="/seguro">')
      body = body.replace(/<button([^>]*class="[^"]*action--primary[^"]*"[^>]*)>/gi, '<a$1 href="/seguro">')
      // Substituir fechamento de button por fechamento de link quando for botão de compra
      body = body.replace(/(<a[^>]*href="\/seguro"[^>]*>[\s\S]*?)<\/button>/gi, '$1</a>')
      
      setBodyContent(body)
      
      // Extrair todo o conteúdo do head (CSS, links, meta tags, etc.)
      const headElements = Array.from(doc.head.children)
      let headHTML = headElements.map(el => el.outerHTML).join('\n')
      
      // Corrigir texto "MercadoLibre" para "MercadoLivre" no head também (apenas texto visível)
      headHTML = headHTML.replace(/(>)([^<]*?)MercadoLivre([^<]*?)(<)/g, '$1$2MercadoLivre$3$4')
      headHTML = headHTML.replace(/(>)([^<]*?)mercado livre([^<]*?)(<)/gi, '$1$2Mercado Livre$3$4')
      // Substituir "mercadolibre" (tudo junto, minúsculo) por "MercadoLivre" no head também
      headHTML = headHTML.replace(/(>)([^<]*?)mercadolivre([^<]*?)(<)/gi, '$1$2MercadoLivre$3$4')
      
      // Substituir todos os preços por R$ 149 no head também
      headHTML = headHTML.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+,\d{2})/g, 'R$ 149')
      headHTML = headHTML.replace(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:\.\d{2})?|\d+\.\d{2})/g, 'R$ 149')
      // Substituir formato com superscript no head também
      headHTML = headHTML.replace(/R\$\s*(\d{3,})([²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]|<\/?sup>[\d]+<\/?sup>)/g, 'R$ 149⁹⁰')
      headHTML = headHTML.replace(/R\$\s*(\d{3,})<sup>(\d{2})<\/sup>/g, 'R$ 149<sup>90</sup>')
      headHTML = headHTML.replace(/"price":\s*(\d+\.\d+)/g, '"price":149')
      headHTML = headHTML.replace(/"localItemPrice":\s*(\d+\.\d+)/g, '"localItemPrice":149')
      headHTML = headHTML.replace(/"itemPrice":\s*(\d+\.\d+)/g, '"itemPrice":149')
      // Substituir preços em formato numérico puro no head também
      headHTML = headHTML.replace(/(\d{3,}(?:[.,]\d{2})?)(\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+))/gi, '149$2')
      headHTML = headHTML.replace(/(\d{3,}\.\d{2})(?=\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+))/gi, '149')
      // Substituir formato específico com superscript no head
      headHTML = headHTML.replace(/(\d{3,})([²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]|<\/?sup>[\d]+<\/?sup>)/g, '149⁹⁰')
      headHTML = headHTML.replace(/(\d{3,})<sup>(\d{2})<\/sup>/g, '149<sup>90</sup>')
      // Corrigir duplicações no head também
      headHTML = headHTML.replace(/149,90,90/g, '149')
      headHTML = headHTML.replace(/149\s+90\s+90/g, '149')
      headHTML = headHTML.replace(/R\$\s*149,90,90/g, 'R$ 149')
      // Substituir especificamente o número 421 no head também
      headHTML = headHTML.replace(/>\s*421\s*</g, '>149<')
      headHTML = headHTML.replace(/>\s*421²¹\s*</g, '>149⁹⁰<')
      headHTML = headHTML.replace(/>\s*421<sup>21<\/sup>\s*</g, '>149<sup>90</sup><')
      headHTML = headHTML.replace(/\b421\b(?=\s*(?:reais|R\$|RS|R\$|em|por|de|até|desde|a partir de|com|sem|juros|parcelas?|x\s*\d+|²|sup))/gi, '149')
      
      // Substituir superscript "²¹" por "⁹⁰" no head também
      headHTML = headHTML.replace(/(\d{3,})[²¹]/g, '$1⁹⁰')
      headHTML = headHTML.replace(/(R\$\s*\d{3,})[²¹]/g, '$1⁹⁰')
      // Substituir tags <sup>21</sup> por <sup>90</sup> no head também
      headHTML = headHTML.replace(/(\d{3,})<sup>21<\/sup>/g, '$1<sup>90</sup>')
      headHTML = headHTML.replace(/(R\$\s*\d{3,})<sup>21<\/sup>/g, '$1<sup>90</sup>')
      // Substituir especificamente "²¹" após qualquer número por "⁹⁰" no head
      headHTML = headHTML.replace(/(\d+)²¹/g, '$1⁹⁰')
      headHTML = headHTML.replace(/(R\$\s*\d+)²¹/g, '$1⁹⁰')
      // Substituir COMPLETAMENTE qualquer "21" em superscript após "149" por "90" no head - TODAS AS VARIAÇÕES POSSÍVEIS
      headHTML = headHTML.replace(/149[²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]+/g, '149⁹⁰')
      headHTML = headHTML.replace(/149<sup>[\d]+<\/sup>/g, '149<sup>90</sup>')
      headHTML = headHTML.replace(/R\$\s*149[²¹²²²³²⁴²⁵²⁶²⁷²⁸²⁹³⁰]+/g, 'R$ 149⁹⁰')
      headHTML = headHTML.replace(/R\$\s*149<sup>[\d]+<\/sup>/g, 'R$ 149<sup>90</sup>')
      // Substituir "21" em qualquer formato após preços por "90" no head
      headHTML = headHTML.replace(/149\s*²¹/g, '149⁹⁰')
      headHTML = headHTML.replace(/149\s*<sup>21<\/sup>/g, '149<sup>90</sup>')
      headHTML = headHTML.replace(/R\$\s*149\s*²¹/g, 'R$ 149⁹⁰')
      headHTML = headHTML.replace(/R\$\s*149\s*<sup>21<\/sup>/g, 'R$ 149<sup>90</sup>')
      // Substituir qualquer sequência de caracteres que pareça "21" em superscript por "90" no head
      headHTML = headHTML.replace(/149[²][¹]/g, '149⁹⁰')
      headHTML = headHTML.replace(/R\$\s*149[²][¹]/g, 'R$ 149⁹⁰')
      // Substituir qualquer número em superscript "21" por "90" no head
      headHTML = headHTML.replace(/(\d+)[²][¹]/g, '$1⁹⁰')
      headHTML = headHTML.replace(/(R\$\s*\d+)[²][¹]/g, '$1⁹⁰')
      // Substituir especificamente o caractere "²" seguido de "¹" por "⁹⁰" no head
      headHTML = headHTML.replace(/149²[¹]/g, '149⁹⁰')
      headHTML = headHTML.replace(/R\$\s*149²[¹]/g, 'R$ 149⁹⁰')
      // Substituir qualquer tag <sup> que contenha "21" por "90" após preços no head
      headHTML = headHTML.replace(/149<sup>[^<]*21[^<]*<\/sup>/gi, '149<sup>90</sup>')
      headHTML = headHTML.replace(/R\$\s*149<sup>[^<]*21[^<]*<\/sup>/gi, 'R$ 149<sup>90</sup>')
      
      setHeadContent(headHTML)
      
      // Aplicar elementos do head dinamicamente
      headElements.forEach(element => {
        const tagName = element.tagName.toLowerCase()
        
        // Ignorar elementos que já existem
        if (tagName === 'title') return // Next.js já tem title
        
        try {
          if (tagName === 'style') {
            // Adicionar estilos inline
            const style = document.createElement('style')
            // Corrigir caminhos relativos dentro do CSS (fonts/, images/)
            let cssContent = element.innerHTML
            cssContent = cssContent.replace(/url\(fonts\//g, 'url(/fonts/')
            cssContent = cssContent.replace(/url\(images\//g, 'url(/images/')
            cssContent = cssContent.replace(/url\(css\//g, 'url(/css/')
            cssContent = cssContent.replace(/url\(['"]fonts\//g, 'url("/fonts/')
            cssContent = cssContent.replace(/url\(['"]images\//g, 'url("/images/')
            cssContent = cssContent.replace(/url\(['"]css\//g, 'url("/css/')
            style.innerHTML = cssContent
            if (!document.head.querySelector(`style[data-injected="true"]`)) {
              style.setAttribute('data-injected', 'true')
              document.head.appendChild(style)
            }
          } else if (tagName === 'link') {
            // Adicionar links (CSS, fonts, etc.)
            const link = document.createElement('link')
            const rel = element.getAttribute('rel')
            let href = element.getAttribute('href')
            const as = element.getAttribute('as')
            const type = element.getAttribute('type')
            const crossorigin = element.getAttribute('crossorigin')
            
            // Corrigir caminhos relativos para apontar para /public
            if (href) {
              const originalHref = href
              if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('/')) {
                // Caminho relativo sem barra inicial (ex: "css/file.css")
                href = '/' + href
              } else if (href.startsWith('./')) {
                // Caminho relativo com ./ (ex: "./css/file.css")
                href = href.replace('./', '/')
              }
              // Garantir que caminhos como "css/..." virem "/css/..."
              if (href.match(/^(css|images|fonts|js)\//) && !href.startsWith('/')) {
                href = '/' + href
              }
              // Debug: log se o caminho foi alterado
              if (originalHref !== href) {
                console.log(`Path corrected: ${originalHref} -> ${href}`)
              }
            }
            
            if (rel) link.rel = rel
            if (href) link.href = href
            if (as) link.setAttribute('as', as)
            if (type) link.type = type
            if (crossorigin) link.setAttribute('crossorigin', crossorigin)
            
            // Verificar se já existe usando o href corrigido ANTES de adicionar
            if (href) {
              const existingLink = document.head.querySelector(`link[href="${href}"]`)
              if (!existingLink) {
                document.head.appendChild(link)
              }
            }
          } else if (tagName === 'script') {
            // Filtrar scripts que podem causar conflito com Next.js/React
            const scriptSrc = element.getAttribute('src') || ''
            const scriptContent = element.innerHTML || ''
            const scriptId = element.getAttribute('id') || ''
            const scriptType = element.getAttribute('type') || ''
            
            // Ignorar scripts do React que podem causar conflito
            // Também ignorar scripts JSON (type="application/json") que podem causar erros
            const isReactScript = 
              scriptSrc.includes('react') || 
              scriptSrc.includes('react-dom') || 
              scriptSrc.includes('main.ts') ||
              scriptSrc.includes('index.production') ||
              scriptSrc.includes('scheduler.production') ||
              scriptContent.includes('React') || 
              scriptContent.includes('react-dom') ||
              scriptContent.includes('react-dom.production') ||
              scriptId === '__PRELOADED_STATE__' || 
              scriptId.includes('react') ||
              element.hasAttribute('data-head-react') ||
              scriptType === 'application/json' // Bloquear scripts JSON
            
            if (isReactScript) {
              console.log('Skipping React script to avoid conflicts:', scriptSrc || scriptId || scriptType)
              return // Pular este script
            }
            
            // Adicionar scripts (apenas se não for React)
            let src = scriptSrc
            if (src) {
              // Corrigir caminhos relativos nos scripts
              if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('/')) {
                src = '/' + src
              } else if (src.startsWith('./')) {
                src = src.replace('./', '/')
              }
              // Garantir que caminhos como "js/..." virem "/js/..."
              if (src.match(/^(css|images|fonts|js)\//) && !src.startsWith('/')) {
                src = '/' + src
              }
              
              const script = document.createElement('script')
              script.src = src
              script.async = element.hasAttribute('async')
              script.defer = element.hasAttribute('defer')
              const nonce = element.getAttribute('nonce')
              if (nonce) script.setAttribute('nonce', nonce)
              
              // Verificar se já existe antes de adicionar
              const existingScript = document.head.querySelector(`script[src="${src}"]`)
              if (!existingScript) {
                document.head.appendChild(script)
              }
            } else if (scriptContent && !scriptContent.includes('React') && !scriptContent.includes('react-dom')) {
              // Adicionar scripts inline, mas evitar React e JSON
              try {
                // Verificar se o conteúdo parece ser JSON (começa com { ou [)
                const trimmedContent = scriptContent.trim()
                const looksLikeJson = trimmedContent.startsWith('{') || trimmedContent.startsWith('[')
                
                if (looksLikeJson) {
                  console.log('Skipping JSON script content')
                  return // Não adicionar scripts JSON
                }
                
                const script = document.createElement('script')
                // Validar conteúdo antes de adicionar
                if (trimmedContent) {
                  script.innerHTML = scriptContent
                  const nonce = element.getAttribute('nonce')
                  if (nonce) script.setAttribute('nonce', nonce)
                  document.head.appendChild(script)
                }
              } catch (error) {
                console.error('Error adding inline script:', error)
              }
            }
          } else if (tagName === 'meta') {
            // Adicionar meta tags
            const meta = document.createElement('meta')
            Array.from(element.attributes).forEach(attr => {
              meta.setAttribute(attr.name, attr.value)
            })
            
            const name = element.getAttribute('name') || element.getAttribute('property')
            const existingMeta = name 
              ? document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
              : null
            
            if (!existingMeta) {
              document.head.appendChild(meta)
            }
          }
        } catch (error) {
          console.error(`Error adding ${tagName}:`, error)
        }
      })
      
      // Restaurar createElement original após processar
      document.createElement = originalCreateElement
      
      // Ativar lazy loading de imagens após o conteúdo ser renderizado
      setTimeout(() => {
        // Carregar imagens com data-src (lazy loading)
        const lazyImages = document.querySelectorAll('img[data-src]')
        lazyImages.forEach((img: Element) => {
          const imgElement = img as HTMLImageElement
          if (imgElement.dataset.src) {
            imgElement.src = imgElement.dataset.src
            imgElement.removeAttribute('data-src')
          }
          if (imgElement.dataset.srcset) {
            imgElement.srcset = imgElement.dataset.srcset
            imgElement.removeAttribute('data-srcset')
          }
        })
        
        // Carregar imagens de fundo com data-src
        const lazyBackgrounds = document.querySelectorAll('[data-src]')
        lazyBackgrounds.forEach((element: Element) => {
          const el = element as HTMLElement
          if (el.dataset.src && el.tagName !== 'IMG') {
            el.style.backgroundImage = `url(${el.dataset.src})`
            el.removeAttribute('data-src')
          }
        })
      }, 100)
      
      // Manter o observer ativo para continuar bloqueando scripts dinâmicos
      // Não desconectar aqui, pois scripts podem ser adicionados depois
    } catch (error: any) {
      console.error('Error processing HTML:', error)
      setError(error?.message || 'Erro ao processar HTML')
      // Restaurar createElement original em caso de erro
      if (typeof document !== 'undefined') {
        document.createElement = originalCreateElement
      }
    }
    
    // Cleanup: desconectar observer quando componente desmontar
    return () => {
      if (typeof document !== 'undefined') {
        observer.disconnect()
        document.createElement = originalCreateElement
      }
    }
  }, [htmlContent])

  // Efeito separado para substituir superscript "21" por "90" após renderização
  useEffect(() => {
    if (!bodyContent || typeof document === 'undefined') return

    const replaceSuperscript = () => {
      try {
        // Método 1: Substituir todas as tags <sup> que contenham "21" por "90" após preços
        const allSupTags = document.querySelectorAll('sup')
        allSupTags.forEach((sup) => {
          const text = sup.textContent || ''
          const parent = sup.parentElement
          if (parent && (parent.textContent?.includes('149') || parent.textContent?.includes('R$ 149'))) {
            if (text.includes('21')) {
              sup.textContent = '90'
            }
          }
        })

        // Método 2: Procurar e substituir qualquer elemento que contenha "149" seguido de superscript "21" por "90"
        const allElements = document.querySelectorAll('*')
        allElements.forEach((el) => {
          const html = el.innerHTML || ''
          const text = el.textContent || ''
          
          // Se contém "149" e tem algum superscript "21"
          if (text.includes('149') && (html.includes('²¹') || html.includes('<sup>21</sup>'))) {
            // Substituir todos os caracteres superscript Unicode "²¹" por "⁹⁰"
            let newHtml = html
              .replace(/149[²¹]/g, '149⁹⁰')
              .replace(/R\$\s*149[²¹]/g, 'R$ 149⁹⁰')
              .replace(/149\s*²¹/g, '149⁹⁰')
              .replace(/R\$\s*149\s*²¹/g, 'R$ 149⁹⁰')
              .replace(/149²[¹]/g, '149⁹⁰')
              .replace(/R\$\s*149²[¹]/g, 'R$ 149⁹⁰')
            
            // Substituir todas as tags <sup>21</sup> por <sup>90</sup> após "149"
            newHtml = newHtml.replace(/149\s*<sup>21<\/sup>/g, '149<sup>90</sup>')
            newHtml = newHtml.replace(/R\$\s*149\s*<sup>21<\/sup>/g, 'R$ 149<sup>90</sup>')
            newHtml = newHtml.replace(/149<sup>[^<]*21[^<]*<\/sup>/gi, '149<sup>90</sup>')
            newHtml = newHtml.replace(/R\$\s*149<sup>[^<]*21[^<]*<\/sup>/gi, 'R$ 149<sup>90</sup>')
            
            // Substituir qualquer <sup>21</sup> por <sup>90</sup> após números
            newHtml = newHtml.replace(/(\d+)<sup>21<\/sup>/g, '$1<sup>90</sup>')
            newHtml = newHtml.replace(/(R\$\s*\d+)<sup>21<\/sup>/g, '$1<sup>90</sup>')
            
            if (newHtml !== html) {
              el.innerHTML = newHtml
            }
          }
        })

        // Método 3: Substituir caracteres superscript "²¹" diretamente do texto por "⁹⁰"
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        )
        
        const textNodes: Text[] = []
        let node
        while (node = walker.nextNode()) {
          if (node.nodeValue && (node.nodeValue.includes('149') || node.nodeValue.includes('²¹'))) {
            textNodes.push(node as Text)
          }
        }
        
        textNodes.forEach((textNode) => {
          if (textNode.nodeValue) {
            const newValue = textNode.nodeValue
              .replace(/149[²¹]/g, '149⁹⁰')
              .replace(/R\$\s*149[²¹]/g, 'R$ 149⁹⁰')
            if (newValue !== textNode.nodeValue) {
              textNode.nodeValue = newValue
            }
          }
        })
      } catch (error) {
        console.error('Error replacing superscript:', error)
      }
    }

    // Executar múltiplas vezes com intervalos diferentes
    const intervals = [50, 100, 200, 500, 1000, 2000]
    intervals.forEach((delay) => {
      setTimeout(replaceSuperscript, delay)
    })

    // Usar MutationObserver para detectar mudanças e substituir imediatamente
    const superscriptObserver = new MutationObserver((mutations) => {
      replaceSuperscript()
    })

    if (document.body) {
      superscriptObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false
      })
    }

    // Executar continuamente a cada 500ms por 5 segundos
    const intervalId = setInterval(replaceSuperscript, 500)
    setTimeout(() => clearInterval(intervalId), 5000)

    return () => {
      superscriptObserver.disconnect()
      clearInterval(intervalId)
    }
  }, [bodyContent])

  // Efeito separado para carregar imagens após o bodyContent ser renderizado
  useEffect(() => {
    if (!bodyContent) return

    // Usar MutationObserver para detectar quando imagens são adicionadas ao DOM
    const imageObserver = new MutationObserver(() => {
      // Carregar imagens com data-src (lazy loading)
      const lazyImages = document.querySelectorAll('img[data-src]')
      lazyImages.forEach((img: Element) => {
        const imgElement = img as HTMLImageElement
        if (imgElement.dataset.src) {
          imgElement.src = imgElement.dataset.src
          imgElement.removeAttribute('data-src')
        }
        if (imgElement.dataset.srcset) {
          imgElement.srcset = imgElement.dataset.srcset
          imgElement.removeAttribute('data-srcset')
        }
      })
    })

    // Observar mudanças no body
    if (typeof document !== 'undefined' && document.body) {
      imageObserver.observe(document.body, {
        childList: true,
        subtree: true
      })

      // Executar imediatamente também
      setTimeout(() => {
        const lazyImages = document.querySelectorAll('img[data-src]')
        lazyImages.forEach((img: Element) => {
          const imgElement = img as HTMLImageElement
          if (imgElement.dataset.src) {
            imgElement.src = imgElement.dataset.src
            imgElement.removeAttribute('data-src')
          }
          if (imgElement.dataset.srcset) {
            imgElement.srcset = imgElement.dataset.srcset
            imgElement.removeAttribute('data-srcset')
          }
        })
      }, 200)
    }

    return () => {
      imageObserver.disconnect()
    }
  }, [bodyContent])

  // Efeito para adicionar link para /seguro no botão "Comprar agora"
  useEffect(() => {
    if (!bodyContent || typeof document === 'undefined') return

    const addSeguroLink = () => {
      try {
        // Procurar por botões de compra de várias formas
        // 1. Botões com classe ui-pdp-action--primary
        const primaryButtons = document.querySelectorAll('.ui-pdp-action--primary, button[class*="action"], button[class*="buy"], button[class*="comprar"]')
        
        // 2. Procurar por botões que contenham texto relacionado a compra
        const allButtons = document.querySelectorAll('button, a[role="button"]')
        
        // 3. Procurar por links que pareçam botões de compra
        const allLinks = document.querySelectorAll('a[class*="action"], a[class*="buy"], a[class*="comprar"]')

        // Função para verificar se é um botão de compra
        const isBuyButton = (element: Element): boolean => {
          const text = element.textContent?.toLowerCase() || ''
          const className = element.className?.toLowerCase() || ''
          const id = element.id?.toLowerCase() || ''
          
          return (
            text.includes('comprar') ||
            text.includes('buy') ||
            className.includes('action--primary') ||
            className.includes('buy-button') ||
            className.includes('comprar') ||
            id.includes('buy') ||
            id.includes('comprar')
          )
        }

        // Processar botões primários
        primaryButtons.forEach((button) => {
          if (isBuyButton(button)) {
            if (button.tagName === 'BUTTON') {
              // Converter button para link
              const link = document.createElement('a')
              link.href = '/seguro'
              link.className = button.className
              link.innerHTML = button.innerHTML
              // Copiar todos os atributos
              Array.from(button.attributes).forEach(attr => {
                if (attr.name !== 'type' && attr.name !== 'onclick') {
                  link.setAttribute(attr.name, attr.value)
                }
              })
              link.style.cssText = (button as HTMLElement).style.cssText
              // Adicionar event listener para salvar preço do produto
              link.addEventListener('click', (e) => {
                // Salvar preço padrão do produto (R$ 149,90)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('productPrice', '149.90')
                }
              })
              button.parentNode?.replaceChild(link, button)
            } else if (button.tagName === 'A') {
              const anchor = button as HTMLAnchorElement
              anchor.href = '/seguro'
              // Adicionar event listener para salvar preço do produto
              anchor.addEventListener('click', (e) => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('productPrice', '149.90')
                }
              })
            }
          }
        })

        // Processar todos os botões
        allButtons.forEach((button) => {
          if (isBuyButton(button) && button.tagName === 'BUTTON') {
            // Verificar se já foi processado
            if (!button.closest('a')) {
              const link = document.createElement('a')
              link.href = '/seguro'
              link.className = button.className
              link.innerHTML = button.innerHTML
              Array.from(button.attributes).forEach(attr => {
                if (attr.name !== 'type' && attr.name !== 'onclick') {
                  link.setAttribute(attr.name, attr.value)
                }
              })
              link.style.cssText = (button as HTMLElement).style.cssText
              // Adicionar event listener para salvar preço do produto
              link.addEventListener('click', (e) => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('productPrice', '149.90')
                }
              })
              button.parentNode?.replaceChild(link, button)
            }
          }
        })

        // Processar links
        allLinks.forEach((link) => {
          if (isBuyButton(link) && link.tagName === 'A') {
            const anchor = link as HTMLAnchorElement
            anchor.href = '/seguro'
            // Adicionar event listener para salvar preço do produto
            anchor.addEventListener('click', (e) => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('productPrice', '149.90')
              }
            })
          }
        })
      } catch (error) {
        console.error('Error adding seguro link:', error)
      }
    }

    // Executar múltiplas vezes com intervalos diferentes para garantir que encontre o botão
    const intervals = [100, 300, 500, 1000, 2000]
    intervals.forEach((delay) => {
      setTimeout(addSeguroLink, delay)
    })

    // Usar MutationObserver para detectar quando botões são adicionados dinamicamente
    const buttonObserver = new MutationObserver(() => {
      addSeguroLink()
    })

    if (document.body) {
      buttonObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      })
    }

    return () => {
      buttonObserver.disconnect()
    }
  }, [bodyContent])

  // Função completa para substituir "MercadoLibre" por "MercadoLivre" em todas as variações
  const replaceMercadoLibreText = (element: Element | Document = document) => {
    try {
      // 1. Substituir em nós de texto
      const rootElement = element === document ? document.body : element
      const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      const textNodes: Text[] = []
      let node
      while (node = walker.nextNode()) {
        if (node.nodeValue && (
          node.nodeValue.includes('mercadolibre') || 
          node.nodeValue.includes('MercadoLibre') ||
          node.nodeValue.includes('mercado libre') ||
          node.nodeValue.includes('Mercado Libre')
        )) {
          textNodes.push(node as Text)
        }
      }
      
      textNodes.forEach((textNode) => {
        if (textNode.nodeValue) {
          let newValue = textNode.nodeValue
            .replace(/mercadolibre/gi, 'MercadoLivre')
            .replace(/mercado libre/gi, 'Mercado Livre')
            .replace(/MercadoLibre/g, 'MercadoLivre')
            .replace(/Mercado Libre/g, 'Mercado Livre')
          
          if (newValue !== textNode.nodeValue) {
            textNode.nodeValue = newValue
          }
        }
      })

      // 2. Substituir em atributos (alt, title, aria-label)
      const allElements = (element === document ? document.body : element).querySelectorAll('*')
      allElements.forEach((el) => {
        // Atributo alt
        if (el.hasAttribute('alt')) {
          const alt = el.getAttribute('alt')
          if (alt && (alt.includes('mercadolibre') || alt.includes('MercadoLibre') || alt.includes('mercado libre'))) {
            const newAlt = alt
              .replace(/mercadolibre/gi, 'MercadoLivre')
              .replace(/mercado libre/gi, 'Mercado Livre')
              .replace(/MercadoLibre/g, 'MercadoLivre')
              .replace(/Mercado Libre/g, 'Mercado Livre')
            el.setAttribute('alt', newAlt)
          }
        }

        // Atributo title
        if (el.hasAttribute('title')) {
          const title = el.getAttribute('title')
          if (title && (title.includes('mercadolibre') || title.includes('MercadoLibre') || title.includes('mercado libre'))) {
            const newTitle = title
              .replace(/mercadolibre/gi, 'MercadoLivre')
              .replace(/mercado libre/gi, 'Mercado Livre')
              .replace(/MercadoLibre/g, 'MercadoLivre')
              .replace(/Mercado Libre/g, 'Mercado Livre')
            el.setAttribute('title', newTitle)
          }
        }

        // Atributo aria-label
        if (el.hasAttribute('aria-label')) {
          const ariaLabel = el.getAttribute('aria-label')
          if (ariaLabel && (ariaLabel.includes('mercadolibre') || ariaLabel.includes('MercadoLibre') || ariaLabel.includes('mercado libre'))) {
            const newAriaLabel = ariaLabel
              .replace(/mercadolibre/gi, 'MercadoLivre')
              .replace(/mercado libre/gi, 'Mercado Livre')
              .replace(/MercadoLibre/g, 'MercadoLivre')
              .replace(/Mercado Libre/g, 'Mercado Livre')
            el.setAttribute('aria-label', newAriaLabel)
          }
        }

        // Atributo placeholder
        if (el.hasAttribute('placeholder')) {
          const placeholder = el.getAttribute('placeholder')
          if (placeholder && (placeholder.includes('mercadolibre') || placeholder.includes('MercadoLibre') || placeholder.includes('mercado libre'))) {
            const newPlaceholder = placeholder
              .replace(/mercadolibre/gi, 'MercadoLivre')
              .replace(/mercado libre/gi, 'Mercado Livre')
              .replace(/MercadoLibre/g, 'MercadoLivre')
              .replace(/Mercado Libre/g, 'Mercado Livre')
            el.setAttribute('placeholder', newPlaceholder)
          }
        }
      })
    } catch (error) {
      console.error('Error replacing MercadoLibre:', error)
    }
  }

  // Efeito específico para substituir no header e elementos relacionados
  useEffect(() => {
    if (!bodyContent || typeof document === 'undefined') return

    const replaceInHeader = () => {
      try {
        // Encontrar todos os elementos do header
        const headerElements: (Element | null)[] = [
          document.querySelector('header'),
          document.querySelector('nav'),
          ...Array.from(document.querySelectorAll('[class*="header"]')),
          ...Array.from(document.querySelectorAll('[class*="Header"]')),
          ...Array.from(document.querySelectorAll('[class*="nav"]')),
          ...Array.from(document.querySelectorAll('[class*="Nav"]')),
          ...Array.from(document.querySelectorAll('[id*="header"]')),
          ...Array.from(document.querySelectorAll('[id*="Header"]')),
          ...Array.from(document.querySelectorAll('[id*="nav"]')),
          ...Array.from(document.querySelectorAll('[id*="Nav"]')),
        ]

        // Remover duplicatas e nulls
        const uniqueElements = Array.from(new Set(headerElements.filter(el => el !== null))) as Element[]

        // Aplicar substituição em cada elemento do header
        uniqueElements.forEach((element) => {
          replaceMercadoLibreText(element)
        })

        // Também aplicar no body inteiro para garantir
        replaceMercadoLibreText(document)
      } catch (error) {
        console.error('Error replacing MercadoLibre in header:', error)
      }
    }

    // Executar múltiplas vezes com intervalos diferentes (0ms, 100ms, 300ms, 500ms, 1s, 2s)
    const intervals = [0, 100, 300, 500, 1000, 2000]
    intervals.forEach((delay) => {
      setTimeout(replaceInHeader, delay)
    })

    // Usar MutationObserver para detectar quando conteúdo é adicionado dinamicamente
    const headerObserver = new MutationObserver(() => {
      replaceInHeader()
    })

    // Observar mudanças no documento inteiro para pegar headers dinâmicos
    if (document.body) {
      headerObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['alt', 'title', 'aria-label', 'placeholder']
      })
    }

    return () => {
      headerObserver.disconnect()
    }
  }, [bodyContent])

  // Efeito para substituir "mercadolibre" por "MercadoLivre" dinamicamente em todo o body
  useEffect(() => {
    if (!bodyContent || typeof document === 'undefined') return

    const replaceMercadoLibre = () => {
      replaceMercadoLibreText(document)
    }

    // Executar múltiplas vezes com intervalos diferentes
    const intervals = [100, 300, 500, 1000, 2000]
    intervals.forEach((delay) => {
      setTimeout(replaceMercadoLibre, delay)
    })

    // Usar MutationObserver para detectar quando texto é adicionado dinamicamente
    const textObserver = new MutationObserver(() => {
      replaceMercadoLibre()
    })

    if (document.body) {
      textObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }

    return () => {
      textObserver.disconnect()
    }
  }, [bodyContent])

  // Efeito para substituir o logo do MercadoLibre pelo logo do Mercado Livre no header
  useEffect(() => {
    if (!bodyContent || typeof document === 'undefined') return

    const replaceLogoInHeader = () => {
      try {
        // Logo do Mercado Livre (mesmo usado na página /seguro)
        const mercadoLivreLogo = '/images/pt_logo_large_plus@2x.webp'
        
        // Estratégia: procurar e substituir logos do MercadoLibre
        // 1. Substituir imagens que sejam logos do MercadoLibre
        const allImages = document.querySelectorAll('img')
        allImages.forEach((img) => {
          const imgEl = img as HTMLImageElement
          const src = (imgEl.src || imgEl.getAttribute('src') || '').toLowerCase()
          const alt = (imgEl.alt || imgEl.getAttribute('alt') || '').toLowerCase()
          const className = (imgEl.className || '').toLowerCase()
          
          // Verificar se é logo do MercadoLibre
          if (
            src.includes('mercadolibre') ||
            src.includes('mercadolivre') ||
            (src.includes('logo') && (src.includes('libre') || src.includes('livre') || src.includes('mercado'))) ||
            alt.includes('mercadolibre') ||
            alt.includes('mercadolivre') ||
            alt.includes('mercado libre') ||
            alt.includes('mercado livre') ||
            (className.includes('logo') && (className.includes('libre') || className.includes('livre') || className.includes('mercado')))
          ) {
            // Verificar se está no header amarelo
            const parent = imgEl.closest('header') || imgEl.closest('[class*="header"]') || imgEl.closest('[id*="header"]')
            if (parent) {
              const parentStyle = window.getComputedStyle(parent as Element)
              const bgColor = parentStyle.backgroundColor
              if (
                bgColor.includes('255, 230, 0') ||
                bgColor.includes('rgb(255, 230, 0)') ||
                bgColor.includes('#ffe600') ||
                bgColor.includes('#FFE600') ||
                (parent as Element).classList.toString().toLowerCase().includes('yellow')
              ) {
                console.log('Substituindo logo do MercadoLibre pelo logo do Mercado Livre:', src || alt)
                imgEl.src = mercadoLivreLogo
                imgEl.setAttribute('src', mercadoLivreLogo)
                imgEl.alt = 'Mercado Livre'
                imgEl.setAttribute('alt', 'Mercado Livre')
              }
            }
          }
        })

        // 2. Substituir elementos com background-image que contenham logo do MercadoLibre
        const allElementsWithBg = document.querySelectorAll('[style*="background"], [style*="background-image"]')
        allElementsWithBg.forEach((el) => {
          const style = el.getAttribute('style') || ''
          const computedStyle = window.getComputedStyle(el)
          const bgImage = computedStyle.backgroundImage || ''
          
          if (
            style.toLowerCase().includes('mercadolibre') ||
            style.toLowerCase().includes('mercadolivre') ||
            (style.toLowerCase().includes('logo') && (style.toLowerCase().includes('libre') || style.toLowerCase().includes('livre') || style.toLowerCase().includes('mercado'))) ||
            bgImage.includes('mercadolibre') ||
            bgImage.includes('MercadoLibre') ||
            bgImage.includes('mercadolivre') ||
            bgImage.includes('MercadoLivre')
          ) {
            // Verificar se está no header amarelo
            const parent = el.closest('header') || el.closest('[class*="header"]') || el.closest('[id*="header"]')
            if (parent) {
              const parentStyle = window.getComputedStyle(parent as Element)
              const bgColor = parentStyle.backgroundColor
              if (
                bgColor.includes('255, 230, 0') ||
                bgColor.includes('rgb(255, 230, 0)') ||
                bgColor.includes('#ffe600') ||
                bgColor.includes('#FFE600') ||
                (parent as Element).classList.toString().toLowerCase().includes('yellow')
              ) {
                console.log('Substituindo background-image do logo')
                if (el instanceof HTMLElement) {
                  el.style.backgroundImage = `url('${mercadoLivreLogo}')`
                  el.style.backgroundRepeat = 'no-repeat'
                  el.style.backgroundSize = 'contain'
                  el.style.backgroundPosition = 'center'
                }
                // Atualizar também o atributo style
                const newStyle = style.replace(
                  /url\([^)]*mercadolibre[^)]*\)/gi,
                  `url('${mercadoLivreLogo}')`
                ).replace(
                  /url\([^)]*MercadoLibre[^)]*\)/g,
                  `url('${mercadoLivreLogo}')`
                ).replace(
                  /url\([^)]*mercadolivre[^)]*\)/gi,
                  `url('${mercadoLivreLogo}')`
                )
                if (newStyle !== style) {
                  el.setAttribute('style', newStyle)
                }
              }
            }
          }
        })

        // 3. Substituir links que contenham logo do MercadoLibre
        const allLinks = document.querySelectorAll('a')
        allLinks.forEach((link) => {
          const linkEl = link as HTMLAnchorElement
          const linkText = (linkEl.textContent || '').toLowerCase()
          const linkClass = (linkEl.className || '').toLowerCase()
          const linkStyle = (linkEl.getAttribute('style') || '').toLowerCase()
          const hasLogoImg = linkEl.querySelector('img[src*="logo"], img[alt*="mercadolibre"], img[alt*="mercadolivre"], img[alt*="mercado libre"], img[alt*="mercado livre"]')
          
          if (
            linkText.includes('mercadolibre') ||
            linkText.includes('mercadolivre') ||
            linkText.includes('mercado libre') ||
            linkText.includes('mercado livre') ||
            linkClass.includes('logo') ||
            linkStyle.includes('background-image') ||
            hasLogoImg
          ) {
            // Verificar se está no header amarelo
            const parent = linkEl.closest('header') || linkEl.closest('[class*="header"]') || linkEl.closest('[id*="header"]')
            if (parent) {
              const parentStyle = window.getComputedStyle(parent as Element)
              const bgColor = parentStyle.backgroundColor
              if (
                bgColor.includes('255, 230, 0') ||
                bgColor.includes('rgb(255, 230, 0)') ||
                bgColor.includes('#ffe600') ||
                bgColor.includes('#FFE600') ||
                (parent as Element).classList.toString().toLowerCase().includes('yellow')
              ) {
                console.log('Substituindo link com logo do MercadoLibre')
                // Garantir que o link aponte para home
                linkEl.href = '/'
                
                // Se tem imagem dentro, substituir a imagem
                const img = linkEl.querySelector('img')
                if (img) {
                  img.src = mercadoLivreLogo
                  img.setAttribute('src', mercadoLivreLogo)
                  img.alt = 'Mercado Livre'
                  img.setAttribute('alt', 'Mercado Livre')
                } else {
                  // Se não tem imagem, adicionar o logo como background-image (igual à página /seguro)
                  linkEl.style.backgroundImage = `url('${mercadoLivreLogo}')`
                  linkEl.style.backgroundRepeat = 'no-repeat'
                  linkEl.style.backgroundSize = 'contain'
                  linkEl.style.backgroundPosition = 'center'
                  linkEl.style.height = '34px'
                  linkEl.style.width = '134px'
                  linkEl.style.display = 'block'
                  linkEl.style.textIndent = '-9999px'
                  linkEl.textContent = 'Mercado Livre'
                }
              }
            }
          }
        })

        // 4. Busca específica no header amarelo
        const headers = [
          document.querySelector('header'),
          ...Array.from(document.querySelectorAll('[class*="header"]')),
          ...Array.from(document.querySelectorAll('[id*="header"]')),
        ]

        headers.forEach((header) => {
          if (!header) return

          const computedStyle = window.getComputedStyle(header)
          const bgColor = computedStyle.backgroundColor
          const isYellowHeader = 
            bgColor.includes('255, 230, 0') || 
            bgColor.includes('rgb(255, 230, 0)') ||
            bgColor.includes('#ffe600') ||
            bgColor.includes('#FFE600') ||
            header.classList.toString().toLowerCase().includes('yellow') ||
            header.getAttribute('style')?.includes('yellow') ||
            header.getAttribute('style')?.includes('#ffe600') ||
            header.getAttribute('style')?.includes('#FFE600')

          if (isYellowHeader) {
            // Substituir TODOS os elementos que possam ser logos dentro do header
            const allChildren = header.querySelectorAll('*')
            allChildren.forEach((child) => {
              const childEl = child as HTMLElement
              const childText = (childEl.textContent || '').toLowerCase()
              const childClass = (childEl.className || '').toLowerCase()
              const childStyle = (childEl.getAttribute('style') || '').toLowerCase()
              const childSrc = (childEl.getAttribute('src') || '').toLowerCase()
              const childAlt = (childEl.getAttribute('alt') || '').toLowerCase()
              
              // Se parece ser um logo, substituir
              if (
                childText.includes('mercadolibre') ||
                childText.includes('mercadolivre') ||
                childText.includes('mercado libre') ||
                childText.includes('mercado livre') ||
                childClass.includes('logo') ||
                childStyle.includes('background-image') ||
                childSrc.includes('logo') ||
                childSrc.includes('mercadolibre') ||
                childSrc.includes('mercadolivre') ||
                childAlt.includes('mercadolibre') ||
                childAlt.includes('mercadolivre') ||
                childAlt.includes('mercado libre') ||
                childAlt.includes('mercado livre')
              ) {
                // Verificar se é realmente um logo (não outro elemento importante)
                if (childEl.tagName === 'IMG') {
                  console.log('Substituindo imagem do logo no header amarelo')
                  const img = childEl as HTMLImageElement
                  img.src = mercadoLivreLogo
                  img.setAttribute('src', mercadoLivreLogo)
                  img.alt = 'Mercado Livre'
                  img.setAttribute('alt', 'Mercado Livre')
                } else if (childEl.tagName === 'A') {
                  console.log('Substituindo link do logo no header amarelo')
                  const link = childEl as HTMLAnchorElement
                  link.href = '/'
                  link.style.backgroundImage = `url('${mercadoLivreLogo}')`
                  link.style.backgroundRepeat = 'no-repeat'
                  link.style.backgroundSize = 'contain'
                  link.style.backgroundPosition = 'center'
                  link.style.height = '34px'
                  link.style.width = '134px'
                  link.style.display = 'block'
                  link.style.textIndent = '-9999px'
                  link.textContent = 'Mercado Livre'
                } else if (childStyle.includes('background')) {
                  console.log('Substituindo background-image do logo no header amarelo')
                  if (childEl instanceof HTMLElement) {
                    childEl.style.backgroundImage = `url('${mercadoLivreLogo}')`
                    childEl.style.backgroundRepeat = 'no-repeat'
                    childEl.style.backgroundSize = 'contain'
                    childEl.style.backgroundPosition = 'center'
                  }
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('Error replacing logo in header:', error)
      }
    }

    // Executar múltiplas vezes com intervalos diferentes (0ms, 100ms, 300ms, 500ms, 1s, 2s, 3s, 5s)
    const intervals = [0, 100, 300, 500, 1000, 2000, 3000, 5000]
    intervals.forEach((delay) => {
      setTimeout(replaceLogoInHeader, delay)
    })

    // Usar MutationObserver para detectar quando o header é adicionado dinamicamente
    const logoObserver = new MutationObserver(() => {
      replaceLogoInHeader()
    })

    if (document.body) {
      logoObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'alt', 'style', 'href', 'class']
      })
    }

    // Executar continuamente a cada 1 segundo por 10 segundos
    const intervalId = setInterval(replaceLogoInHeader, 1000)
    setTimeout(() => clearInterval(intervalId), 10000)

    return () => {
      logoObserver.disconnect()
      clearInterval(intervalId)
    }
  }, [bodyContent])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#fff',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '24px', color: '#d32f2f', marginBottom: '16px' }}>
          Erro ao carregar página
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3483fa',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Recarregar Página
        </button>
      </div>
    )
  }

  if (!htmlContent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#fff'
      }}>
        <p style={{
          fontSize: '20px',
          color: 'rgba(0,0,0,.9)',
          marginBottom: '24px',
          fontWeight: 400
        }}>
          Carregando...
        </p>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e6e6e6',
          borderTop: '4px solid #3483fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Mostrar aviso se estiver sendo executado via file://
  if (isFileProtocol) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#fff',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '30px'
        }}>
          <h1 style={{
            fontSize: '24px',
            color: '#856404',
            marginBottom: '20px',
            fontWeight: 600
          }}>
            ⚠️ Erro: Arquivo aberto diretamente
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#856404',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            Você está abrindo o arquivo HTML diretamente no navegador. Isso causa erros de CORS e conflitos com React.
          </p>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '4px',
            marginTop: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#333',
              marginBottom: '10px',
              fontWeight: 600
            }}>
              Para usar este projeto corretamente:
            </p>
            <ol style={{
              textAlign: 'left',
              color: '#333',
              fontSize: '14px',
              lineHeight: '1.8'
            }}>
              <li>Abra o terminal na pasta do projeto</li>
              <li>Execute: <code style={{background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>npm run dev</code></li>
              <li>Acesse: <code style={{background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>http://localhost:3000</code></li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Não adicionar estilos customizados - usar apenas os estilos do HTML original */}
      {/* Injetar conteúdo do head */}
      {headContent && (
        <div dangerouslySetInnerHTML={{ __html: headContent }} style={{ display: 'none' }} />
      )}
      {/* Renderizar conteúdo do body */}
      {bodyContent && (
        <div 
          dangerouslySetInnerHTML={{ __html: bodyContent }}
          suppressHydrationWarning
        />
      )}
      {/* Script inline para substituir superscript "21" por "90" - executar após renderização */}
      {bodyContent && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function replaceAllSuperscript() {
                  try {
                    // Substituir todas as tags <sup> que contenham "21" por "90" após preços
                    var allSup = document.querySelectorAll('sup');
                    for (var i = 0; i < allSup.length; i++) {
                      var sup = allSup[i];
                      var parent = sup.parentElement;
                      if (parent && parent.textContent && (parent.textContent.indexOf('149') !== -1)) {
                        if (sup.textContent && sup.textContent.indexOf('21') !== -1) {
                          sup.textContent = '90';
                        }
                      }
                    }
                    
                    // Procurar e substituir qualquer elemento com superscript "21" por "90" após preços
                    var allElements = document.querySelectorAll('*');
                    for (var j = 0; j < allElements.length; j++) {
                      var el = allElements[j];
                      var html = el.innerHTML || '';
                      var text = el.textContent || '';
                      if (text.indexOf('149') !== -1 && (html.indexOf('²¹') !== -1 || html.indexOf('<sup>21</sup>') !== -1)) {
                        var newHtml = html
                          .replace(/149[²¹]/g, '149⁹⁰')
                          .replace(/R\\$\\s*149[²¹]/g, 'R$ 149⁹⁰')
                          .replace(/149\\s*²¹/g, '149⁹⁰')
                          .replace(/R\\$\\s*149\\s*²¹/g, 'R$ 149⁹⁰')
                          .replace(/149²[¹]/g, '149⁹⁰')
                          .replace(/R\\$\\s*149²[¹]/g, 'R$ 149⁹⁰')
                          .replace(/149\\s*<sup>21<\\/sup>/g, '149<sup>90</sup>')
                          .replace(/R\\$\\s*149\\s*<sup>21<\\/sup>/g, 'R$ 149<sup>90</sup>')
                          .replace(/149<sup>[^<]*21[^<]*<\\/sup>/gi, '149<sup>90</sup>')
                          .replace(/R\\$\\s*149<sup>[^<]*21[^<]*<\\/sup>/gi, 'R$ 149<sup>90</sup>')
                          .replace(/(\\d+)<sup>21<\\/sup>/g, '$1<sup>90</sup>')
                          .replace(/(R\\$\\s*\\d+)<sup>21<\\/sup>/g, '$1<sup>90</sup>');
                        if (newHtml !== html) {
                          el.innerHTML = newHtml;
                        }
                      }
                    }
                  } catch(e) {
                    console.error('Error replacing superscript:', e);
                  }
                }
                
                // Executar após DOM estar pronto
                if (document.body) {
                  replaceAllSuperscript();
                  setTimeout(replaceAllSuperscript, 100);
                  setTimeout(replaceAllSuperscript, 500);
                  setTimeout(replaceAllSuperscript, 1000);
                  
                  var observer = new MutationObserver(function() {
                    replaceAllSuperscript();
                  });
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                  });
                  
                  var interval = setInterval(replaceAllSuperscript, 500);
                  setTimeout(function() {
                    clearInterval(interval);
                  }, 10000);
                }
              })();
            `
          }}
        />
      )}
    </>
  )
}

