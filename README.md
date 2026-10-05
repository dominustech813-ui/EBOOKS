# H ebooks

Loja digital responsiva para venda de eBooks com **Pix dinâmico**, confirmação automática e liberação segura do arquivo após o pagamento.

## Produto inicial

**Atividades Físicas: Guia Definitivo para Escolher a Melhor para Você**

O valor está configurado provisoriamente em **R$ 29,90** porque o preço final ainda não foi informado.

## Estrutura

- `index.html` — página da loja e checkout
- `styles.css` — identidade visual e responsividade
- `config.js` — preço e URL da API
- `app.js` — geração do Pix, consulta do pagamento e liberação do download
- `supabase/functions/h-ebooks/index.ts` — backend seguro para Asaas + link temporário do eBook
- `.github/workflows/pages.yml` — publicação automática no GitHub Pages

## Como funciona a compra

1. O cliente informa nome, e-mail e CPF/CNPJ.
2. O backend cria uma cobrança Pix no Asaas.
3. É retornado um **QR Code Pix dinâmico e de uso único**, além do Pix Copia e Cola.
4. O navegador acompanha o status da cobrança.
5. Quando o pagamento é confirmado, o backend gera um link temporário do PDF armazenado em um bucket privado.
6. O botão de download é liberado automaticamente.

> Importante: não é correto criar uma nova chave Pix EVP para cada venda. Chaves aleatórias têm limite por conta. O fluxo ideal é manter uma chave Pix cadastrada na conta e gerar um **QR Code dinâmico exclusivo para cada cobrança**.

## 1. Configurar o Asaas

Crie ou use uma conta Asaas aprovada, cadastre uma chave Pix na conta e gere uma API Key.

Use Sandbox durante os testes. Em produção, o backend usa por padrão:

```
https://api.asaas.com/v3
```

Para Sandbox, configure a variável:

```
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

Nunca coloque a API Key no `config.js`, no `app.js` ou em qualquer arquivo público do GitHub.

## 2. Configurar o Supabase

Crie um projeto Supabase e um bucket **privado** chamado:

```
ebooks
```

Envie o PDF com este nome:

```
atividades-fisicas-guia.pdf
```

A função gera links assinados de 15 minutos somente após confirmar o pagamento.

## 3. Variáveis secretas da Edge Function

Configure no Supabase:

```
ASAAS_API_KEY=sua_chave_secreta
PRODUCT_PRICE=29.90
EBOOK_BUCKET=ebooks
EBOOK_FILE=atividades-fisicas-guia.pdf
ALLOWED_ORIGIN=https://dominustech813-ui.github.io
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` devem estar disponíveis no ambiente da função.

A função precisa ser pública para o checkout do site conseguir chamá-la; a segurança está no backend, que mantém a API Key privada, fixa o produto e valida o pagamento antes de liberar o arquivo.

## 4. Publicar a Edge Function

Publique a função `h-ebooks` no seu projeto Supabase e copie a URL final, por exemplo:

```
https://SEU-PROJETO.supabase.co/functions/v1/h-ebooks
```

Depois abra `config.js` e preencha:

```js
apiUrl: "https://SEU-PROJETO.supabase.co/functions/v1/h-ebooks"
```

Se alterar o preço, altere também `price` em `config.js` e `PRODUCT_PRICE` no backend.

## 5. Publicar no GitHub Pages

O workflow já está no repositório. Se o GitHub Pages ainda não estiver habilitado, abra:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

Depois de habilitado, novos commits na branch `main` serão publicados automaticamente.

URL esperada:

```
https://dominustech813-ui.github.io/EBOOKS/
```

## Pagamento indo para sua conta

Neste modelo, o pagamento Pix é processado pela conta Asaas conectada à API. O saldo entra na conta Asaas e pode ser transferido para sua conta bancária conforme sua configuração no provedor. Se a exigência for crédito diretamente em uma conta de outro banco, sem passar por uma conta de pagamento, será necessário usar a API Pix do próprio banco/PSP.

## Antes de vender de verdade

- Definir o preço final.
- Conectar a conta Asaas de produção.
- Subir o PDF no bucket privado.
- Testar uma compra no Sandbox.
- Revisar dados legais, contato, política de privacidade e política de reembolso.
