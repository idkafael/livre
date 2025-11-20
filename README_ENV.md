# Configuração de Variáveis de Ambiente

Para usar o Mercado Pago em produção, configure as seguintes variáveis de ambiente:

## Variáveis Obrigatórias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Access Token do Mercado Pago (usado no backend para processar pagamentos)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-6061834737027144-100216-686a6893aafd59eccf38db11db199080-577440377

# Public Key do Mercado Pago (usada no frontend para tokenização de cartões)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-cd7983a0-97cb-4ac0-a3e5-737865dad04d

# URL base da aplicação (obrigatória para webhooks - 11 pontos)
# Em produção, use seu domínio: https://seu-dominio.com
# No Vercel, use: https://seu-app.vercel.app
# Em desenvolvimento local, use: http://localhost:3000 (não funcionará webhook, mas não quebra)
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
```

## Como Configurar

1. Crie o arquivo `.env.local` na raiz do projeto
2. Adicione as variáveis acima com suas credenciais do Mercado Pago
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

## Importante

- O arquivo `.env.local` está no `.gitignore` e não será commitado
- **NUNCA** commite suas credenciais reais no repositório
- Em produção (Vercel, etc.), configure as variáveis de ambiente no painel da plataforma

## Obtendo Credenciais

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Selecione suas credenciais de **Produção**
3. Copie o **Access Token** e a **Public Key**
4. Configure nas variáveis de ambiente

