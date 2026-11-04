# Auditoria H eBooks — 04/11/2026

## Escopo e preservação

Domínio oficial: https://lojahebooks.com.br/ . Base analisada: a07a29f4767a7b85e1694b2ad21fc885ce3bdef6.
Correção: efbdcf4e833989a65aae37b8b1a549a5a67a7dc8.
Não foram apagadas contas, compras ou arquivos, alteradas senhas de clientes, modificados preços ou executados pagamentos. Nenhuma conta de teste foi criada em produção.

## Causas e alterações

- A página tinha handlers inline e listeners do app para os mesmos controles, além de criar dois clientes Supabase para a mesma sessão. `auth.js` agora é o único controlador do formulário de acesso e compartilha o cliente com `app.js`.
- O login exigia oito caracteres no HTML e no JavaScript. Essa regra de criação de senha impedia submeter senhas antigas mais curtas. Agora o login exige senha preenchida e deixa o Supabase validar as credenciais; cadastro e nova senha mantêm oito caracteres.
- Validação explícita e mensagens visíveis para campos vazios, credenciais rejeitadas, conta existente, falha de rede e falha de envio de e-mail. Bloqueio de submissões simultâneas e restauração do botão após erros.
- HTML continha `</script>/head>`; corrigido para `</head>`. A tela de acesso agora permite rolagem vertical.
- Recuperação usava `window.prompt` e competia com a inicialização da loja. Agora há formulário com confirmação, evento PASSWORD_RECOVERY registrado junto ao cliente e bloqueio da abertura do catálogo durante a redefinição.
- SDK frontend fixado em 2.118.0, versão resolvida do CDN durante a auditoria. Assets receberam nova versão no HTML.
- `mercadopago-card-pro` v4 bloqueava a origem nova e gerava retorno para GitHub Pages. Publicada v5 com origem nova, www e compatibilidade com a antiga; retorno em lojahebooks.com.br. Valores e lógica de compra preservados.
- `support-api` não permitia a origem nova. Publicada v2 com os dois hosts oficiais. O código integral não foi adicionado ao repositório público porque a versão existente contém uma credencial administrativa embutida.
- `ebook-access` antigo retornava 410 também ao OPTIONS e só permitia GitHub Pages. Publicada v4 com preflight 200 e CORS atualizado; o 410 foi mantido para não reabrir downloads legados sem autenticação. Downloads atuais usam `account-api`.
- Código versionado de `reader-experience` estava desatualizado em relação à produção. Sincronizado com a v2 existente, que já permite o domínio novo; não foi necessário redeploy.
- Atualizados redirecionamento legado de `account.js` e documentação. `account.html`/`account.js` foram incluídos no artefato Pages; nome do eBook adaptado ao contrato atual da API.

## Bloqueio confirmado: recuperação por e-mail

Os logs Auth em 04/11/2026 registram falhas em `/recover`: HTTP 500, erro SMTP Gmail **535 / 5.7.8 Username and Password not accepted**. Isso impede enviar o e-mail de recuperação e não se resolve alterando eventos de clique.

É necessário corrigir a configuração SMTP autenticada no painel Supabase. Não foi inventada, extraída ou substituída uma senha SMTP. O conector disponível não oferece configuração Auth/SMTP e o navegador do painel não estava autenticado. Site URL e Redirect URLs **não foram verificados nem alterados**. Referências a `http://localhost:3000` nos logs tornam essa conferência prioritária, mas não provam sozinhas o valor configurado.

Verificar Site URL `https://lojahebooks.com.br` e destinos permitidos para a raiz e `account.html`. Preservar destinos antigos úteis à compatibilidade.

## Validação executada

- 9 testes de autenticação com mocks: cliente único; controles independentes do catálogo; campos vazios; senha antiga curta; erro de credenciais; cadastro existente; cadastro bem-sucedido; erro SMTP; confirmação de nova senha; integridade do HTML/deploy.
- 7 testes existentes de reader-experience passaram: autenticação, sessão expirada, limite de páginas da amostra, permissão de avaliações e identidade autenticada.
- `node --check` em auth.js e app.js; `git diff --check`.
- Preflight HTTP real, com Origin `https://lojahebooks.com.br`: account-api, catalog-api, mercadopago-checkout, mercadopago-card-pro, discord-role-api, reader-experience, ebook-access e support-api retornaram 200 e a origem correta.
- GET real de catalog-api: HTTP 200, 240 produtos e CORS correto.
- Consulta agregada: 240 produtos ativos e 240 arquivos correspondentes no bucket ebooks; não foi necessário abrir os PDFs privados.
- Configuração pública de pagamento: `automaticPayments: true`.
- Requisições sem autenticação para biblioteca, avaliações e Discord: 401 com CORS correto. Consulta de cartão com token inválido: 400 com CORS correto, sem criar pagamento.

## Verificação da publicação e navegador

GitHub Pages: workflow 41819395484. Os bytes publicados de index.html, auth.js e app.js foram comparados com os arquivos locais corrigidos e são idênticos.

No navegador Work, em https://lojahebooks.com.br/: a aba Entrar abriu; o envio vazio mostrou “Informe um e-mail válido.”; a aba Criar conta abriu e seu envio vazio mostrou a mesma validação; Esqueci minha senha respondeu com validação do e-mail. O texto `/head>` indevido desapareceu. O console capturado mostrou erros da extensão do ambiente, sem erro da aplicação nesses passos. Esses testes não são prova de login válido ou de envio de e-mail.

## Limites e pendências

- Login com credenciais reais válidas, cadastro real, recebimento de e-mail, atualização efetiva de senha, biblioteca de comprador, download autorizado e vínculo Discord não foram concluídos sem uma conta de teste fornecida pelo proprietário.
- Pagamento Pix/cartão e concessão de cargos não foram executados. CORS e URLs corretos não equivalem a validação financeira de ponta a ponta.
- Validação responsiva em dispositivo móvel real permanece pendente; a correção de rolagem foi feita no CSS.
- Advisories Supabase: `ebook_visual_redesign_jobs` sem RLS e proteção contra senhas vazadas desativada. Há 16 tabelas com RLS sem políticas, muitas usadas por funções de backend; isso não foi tratado como motivo para abrir permissões públicas. Nenhuma política foi relaxada.
- O cadastro existente usa criação administrativa com e-mail confirmado automaticamente e associação de compras pelo e-mail. Esse desenho merece revisão de verificação de propriedade de e-mail; foi preservado para não migrar contas nem alterar unilateralmente o fluxo de cadastro nesta correção.

A entrega de e-mail continua bloqueada por SMTP. Não considerar a autenticação integralmente validada até corrigir o SMTP e executar o teste autenticado.
