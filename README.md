# Mercado Livre - Next.js

## ⚠️ IMPORTANTE: Como usar este projeto

**NÃO abra o arquivo HTML diretamente no navegador!**

Este projeto deve ser executado através do servidor Next.js.

### Para executar localmente:

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse no navegador:
```
http://localhost:3000
```

### Para fazer deploy:

O projeto está configurado para Vercel. Basta fazer push para o repositório GitHub conectado.

## Por que não abrir o HTML diretamente?

- ❌ Erros de CORS (arquivos não carregam)
- ❌ Scripts do React conflitam
- ❌ Requisições bloqueadas
- ✅ Funciona perfeitamente através do servidor Next.js

## Estrutura do Projeto

- `app/page.tsx` - Página inicial (carrega o HTML original)
- `app/index-content.tsx` - Componente que processa e renderiza o HTML
- `public/index-original.html` - HTML original do Mercado Livre
- `public/` - Assets estáticos (CSS, imagens, fonts, etc.)

## Funcionalidades

- ✅ Design original preservado 100%
- ✅ Header da página seguro aplicado
- ✅ Scripts do React bloqueados automaticamente
- ✅ Funciona em localhost e produção (Vercel)
