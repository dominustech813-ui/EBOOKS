(() => {
  const config = window.HEBOOKS_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: config.currency || "BRL"
  });

  const sb = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const modal = document.getElementById("checkout-modal");
  const checkoutView = document.getElementById("checkout-view");
  const successView = document.getElementById("success-view");
  const ebookGrid = document.getElementById("ebook-grid");
  const catalogCount = document.getElementById("catalog-count");

  const checkoutCover = document.getElementById("checkout-cover");
  const checkoutCoverTitle = document.getElementById("checkout-cover-title");
  const checkoutProductName = document.getElementById("checkout-product-name");
  const checkoutPrice = document.getElementById("checkout-price");

  const methodPix = document.getElementById("method-pix");
  const methodCard = document.getElementById("method-card");
  const pixPanel = document.getElementById("pix-method-panel");
  const cardPanel = document.getElementById("card-method-panel");

  const pixForm = document.getElementById("pix-checkout-form");
  const pixName = document.getElementById("pix-buyer-name");
  const pixEmail = document.getElementById("pix-buyer-email");
  const pixButton = document.getElementById("generate-pix");
  const pixArea = document.getElementById("pix-area");
  const pixImage = document.getElementById("pix-image");
  const pixCode = document.getElementById("pix-code");
  const copyPix = document.getElementById("copy-pix");
  const paymentStatus = document.getElementById("payment-status");
  const checkStatus = document.getElementById("check-status");

  const cardForm = document.getElementById("card-checkout-form");
  const cardName = document.getElementById("card-buyer-name");
  const cardEmail = document.getElementById("card-buyer-email");
  const cardButton = document.getElementById("card-checkout-button");
  const cardStatus = document.getElementById("card-payment-status");

  const supportButton = document.getElementById("support-button");
  const downloadButton = document.getElementById("download-button");
  const successProductName = document.getElementById("success-product-name");
  const authView = document.getElementById("auth-view");
  const accountView = document.getElementById("account-view");
  const accountButton = document.getElementById("account-button");
  const authTitle = document.getElementById("auth-title");
  const authContext = document.getElementById("auth-context");
  const authMessage = document.getElementById("auth-message");
  const authTabRegister = document.getElementById("auth-tab-register");
  const authTabLogin = document.getElementById("auth-tab-login");
  const registerForm = document.getElementById("register-form");
  const registerEmail = document.getElementById("register-email");
  const registerPassword = document.getElementById("register-password");
  const registerButton = document.getElementById("register-button");
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const loginButton = document.getElementById("login-button");
  const githubButton = document.getElementById("github-login-button");
  const githubNote = document.getElementById("github-note");
  const accountEmail = document.getElementById("account-email");
  const accountLibrary = document.getElementById("account-library");
  const logoutButton = document.getElementById("logout-button");

  const globalAuthGate = document.getElementById("global-auth-gate");
  const gateTitle = document.getElementById("gate-title");
  const gateSubtitle = document.getElementById("gate-subtitle");
  const gateMessage = document.getElementById("gate-message");
  const gateTabRegister = document.getElementById("gate-tab-register");
  const gateTabLogin = document.getElementById("gate-tab-login");
  const gateRegisterForm = document.getElementById("gate-register-form");
  const gateRegisterEmail = document.getElementById("gate-register-email");
  const gateRegisterPassword = document.getElementById("gate-register-password");
  const gateRegisterButton = document.getElementById("gate-register-button");
  const gateLoginForm = document.getElementById("gate-login-form");
  const gateLoginEmail = document.getElementById("gate-login-email");
  const gateLoginPassword = document.getElementById("gate-login-password");
  const gateLoginButton = document.getElementById("gate-login-button");
  const gateGithubButton = document.getElementById("gate-github-button");
  const gateGithubNote = document.getElementById("gate-github-note");

  let products = [];
  let selectedProduct = null;
  let automaticPayments = false;
  let checkoutToken = "";
  let pollTimer = null;
  let pollCount = 0;
  let pendingClaimToken = "";
  let pendingClaimMethod = "";
  let pendingBuyerEmail = "";
  let appInitialized = false;

  const categoryIcons = {
    "Saúde": "🏃",
    "Produtividade": "🎯",
    "Desenvolvimento pessoal": "🧠",
    "IA e trabalho": "✨",
    "Finanças": "📈",
    "Negócios": "🚀",
    "Alimentação": "🥗",
    "Bem-estar": "☀️",
    "Organização": "🧹",
    "Inteligência artificial": "🤖",
    "Comunicação": "🎤",
    "Marketing": "✍️",
    "Ficção": "🌙",
    "Suspense": "🔎",
    "Idiomas": "🗣️",
    "Tecnologia básica": "💻",
    "Programação": "⌨️",
    "Design": "🎨",
    "Fotografia e vídeo": "📷",
    "Música": "🎵",
    "Artesanato": "🧵",
    "Casa e decoração": "🏠",
    "Jardinagem": "🌱",
    "Viagem": "✈️",
    "Educação e estudos": "📚",
    "História": "🏛️",
    "Geografia": "🌍",
    "Ciências": "🔬",
    "Matemática prática": "➗",
    "Carreira": "💼",
    "Pets": "🐾",
    "Sustentabilidade": "♻️",
    "Cultura e lazer": "🎭",
    "Culinária": "🍳",
    "Anime e cultura pop": "🍥",
    "Bob Esponja - personagens": "🧽"
  };

  const themeClasses = ["violet","blue","teal","orange","rose","indigo","green","gold"];

  document.getElementById("year").textContent = new Date().getFullYear();

  function switchGateTab(mode) {
    const register = mode === "register";
    gateTabRegister.classList.toggle("active", register);
    gateTabLogin.classList.toggle("active", !register);
    gateRegisterForm.classList.toggle("hidden", !register);
    gateLoginForm.classList.toggle("hidden", register);
    gateTitle.textContent = register ? "Crie sua conta" : "Entre na sua conta";
    gateSubtitle.textContent = register
      ? "Você precisa criar uma conta para acessar o catálogo do H ebooks."
      : "Entre para acessar o catálogo e sua biblioteca.";
    gateMessage.textContent = "";
    gateMessage.classList.remove("error");
  }

  async function lockSite() {
    document.body.classList.add("auth-locked");
    closeModal();
    accountButton.textContent = "Entrar";
    switchGateTab("register");
  }

  async function unlockSite(session) {
    document.body.classList.remove("auth-locked");
    accountButton.textContent = "Minha biblioteca";

    const email = String(session?.user?.email || "").trim().toLowerCase();
    if (email) {
      pixEmail.value = email;
      cardEmail.value = email;
      pixEmail.readOnly = false;
      cardEmail.readOnly = false;
    }

    if (!appInitialized) {
      appInitialized = true;
      await Promise.all([loadCatalog(), refreshPaymentConfig()]);
      await handleCardReturn();
    }
  }

  async function completeGateLogin(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data?.session) throw new Error("E-mail ou senha inválidos.");
    await unlockSite(data.session);
  }

  function purchaseKey(productId) {
    return "hebooks:purchase:" + productId;
  }

  function pendingKey(productId) {
    return "hebooks:pending:" + productId;
  }

  function readStorage(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch {}
  }

  function savePending(productId, token, method) {
    if (!productId || !token) return;
    writeStorage(pendingKey(productId), { checkoutToken: token, method, savedAt: Date.now() });
  }

  function savePurchase(productId, token, method) {
    if (!productId || !token) return;
    writeStorage(purchaseKey(productId), { checkoutToken: token, method, savedAt: Date.now() });
    removeStorage(pendingKey(productId));
    updateProductButton(productId, true);
  }

  function clearPurchase(productId) {
    removeStorage(purchaseKey(productId));
    updateProductButton(productId, false);
  }

  function updateProductButton(productId, purchased) {
    const button = document.querySelector('[data-buy-product="' + CSS.escape(productId) + '"]');
    if (!button) return;
    button.textContent = purchased ? "Baixar meu eBook" : "Comprar por " + money.format(
      Number(button.dataset.price || 0)
    );
    button.classList.toggle("owned", purchased);
  }

  function setView(view) {
    [checkoutView, authView, accountView, successView].forEach(el => el && el.classList.add("hidden"));
    if (view) view.classList.remove("hidden");
  }

  function openModal() {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    clearTimeout(pollTimer);
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  function applyProductToCheckout(product) {
    selectedProduct = product;
    checkoutProductName.textContent = product.title + " — " + product.subtitle;
    checkoutPrice.textContent = money.format(Number(product.price));
    checkoutCoverTitle.textContent = product.title;
    checkoutCover.className = "checkout-cover theme-" + themeClasses[(product.sort_order - 1) % themeClasses.length];
    pixButton.textContent = "Gerar Pix de " + money.format(Number(product.price));
    cardButton.textContent = "Continuar com cartão • " + money.format(Number(product.price));
  }

  function selectMethod(method) {
    const card = method === "card";
    methodPix.classList.toggle("active", !card);
    methodCard.classList.toggle("active", card);
    pixPanel.classList.toggle("hidden", card);
    cardPanel.classList.toggle("hidden", !card);
    if (card) {
      if (!cardName.value && pixName.value) cardName.value = pixName.value;
      if (!cardEmail.value && pixEmail.value) cardEmail.value = pixEmail.value;
    }
  }

  methodPix.addEventListener("click", () => selectMethod("pix"));
  methodCard.addEventListener("click", () => selectMethod("card"));

  async function api(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Não foi possível concluir esta operação.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function catalogApi() {
    const response = await fetch(config.catalogApiUrl, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || "Não foi possível carregar o catálogo.");
    return data.products || [];
  }

  async function checkoutApi(payload) {
    return api(config.checkoutApiUrl, payload);
  }

  async function cardApi(payload) {
    return api(config.cardProApiUrl, payload);
  }

  async function accountApi(action, extra = {}, requireAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (requireAuth) {
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) {
        const error = new Error("Entre na sua conta para continuar.");
        error.status = 401;
        throw error;
      }
      headers.Authorization = "Bearer " + session.access_token;
      headers.apikey = config.supabasePublishableKey;
    }

    const response = await fetch(config.accountApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ action, ...extra })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Não foi possível acessar sua conta.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function switchAuthTab(mode) {
    const register = mode === "register";
    authTabRegister.classList.toggle("active", register);
    authTabLogin.classList.toggle("active", !register);
    registerForm.classList.toggle("hidden", !register);
    loginForm.classList.toggle("hidden", register);
    authMessage.textContent = "";
  }

  async function refreshAccountButton() {
    const { data: { session } } = await sb.auth.getSession();
    accountButton.textContent = session ? "Minha biblioteca" : "Entrar";
  }

  async function showAuthGate(product, token, buyerEmail = "", method = "") {
    selectedProduct = product || selectedProduct;
    pendingClaimToken = token || "";
    pendingClaimMethod = method || "";
    pendingBuyerEmail = String(buyerEmail || "").trim().toLowerCase();

    const pending = {
      checkoutToken: pendingClaimToken,
      productId: selectedProduct?.id || "",
      method: pendingClaimMethod,
      buyerEmail: pendingBuyerEmail
    };
    writeStorage("hebooks:pending-claim", pending);

    if (pendingBuyerEmail) {
      registerEmail.value = pendingBuyerEmail;
      loginEmail.value = pendingBuyerEmail;
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session && pendingClaimToken) {
      try {
        await claimAndRelease();
        return;
      } catch (error) {
        if (error.status !== 401) {
          authMessage.textContent = error.message || "Não foi possível vincular a compra à sua conta.";
          authMessage.classList.add("error");
        }
      }
    }

    authTitle.textContent = pendingClaimToken ? "Crie sua conta para liberar o eBook" : "Entre na sua conta H ebooks";
    authContext.textContent = pendingClaimToken
      ? "Seu pagamento foi confirmado. Use o mesmo e-mail informado na compra para guardar este eBook na sua biblioteca."
      : "Entre para acessar os eBooks que você já comprou.";
    switchAuthTab(pendingClaimToken ? "register" : "login");
    setView(authView);
    openModal();
  }

  async function claimAndRelease() {
    if (!pendingClaimToken) throw new Error("Compra não encontrada para vincular.");
    const data = await accountApi("claim", { checkoutToken: pendingClaimToken });
    const productId = data.productId || selectedProduct?.id;
    if (productId) savePurchase(productId, pendingClaimToken, pendingClaimMethod || "account");
    removeStorage("hebooks:pending-claim");
    removeStorage("hebooks:last-card-pending");
    downloadButton.href = data.downloadUrl;
    successProductName.textContent = data.productName || selectedProduct?.title || "Seu eBook";
    setView(successView);
    await refreshAccountButton();
  }

  async function loadLibrary() {
    const data = await accountApi("me");
    accountEmail.textContent = data.user.email;
    accountLibrary.innerHTML = "";

    if (!data.purchases?.length) {
      accountLibrary.innerHTML = '<div class="empty-library">Você ainda não tem eBooks liberados nesta conta.</div>';
    } else {
      data.purchases.forEach(purchase => {
        const item = document.createElement("div");
        item.className = "account-book-item";
        const title = purchase.product?.title || "eBook H ebooks";
        const info = document.createElement("div");
        info.innerHTML = '<strong>' + escapeHtml(title) + '</strong><span>Compra aprovada</span>';
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-small";
        button.textContent = "Baixar";
        button.addEventListener("click", async () => {
          button.disabled = true;
          button.textContent = "Gerando...";
          try {
            const data = await accountApi("download", { purchaseId: purchase.id });
            window.open(data.downloadUrl, "_blank", "noopener");
          } catch (error) {
            alert(error.message || "Não foi possível gerar o download.");
          } finally {
            button.disabled = false;
            button.textContent = "Baixar";
          }
        });
        item.append(info, button);
        accountLibrary.appendChild(item);

        if (purchase.product_id && purchase.checkout_token) {
          savePurchase(purchase.product_id, purchase.checkout_token, "account");
        }
      });
    }
    setView(accountView);
    openModal();
  }

  function renderCatalog() {
    ebookGrid.innerHTML = "";
    catalogCount.textContent = products.length + " eBooks disponíveis";

    products.forEach((product, index) => {
      const theme = themeClasses[index % themeClasses.length];
      const icon = categoryIcons[product.category] || "📘";
      const owned = !!readStorage(purchaseKey(product.id));

      const card = document.createElement("article");
      card.className = "ebook-card";

      const cover = document.createElement("div");
      cover.className = "ebook-cover theme-" + theme;
      cover.innerHTML =
        '<div class="ebook-cover-brand"><span class="mini-h">H</span><span>ebooks</span></div>' +
        '<div class="ebook-cover-icon">' + icon + '</div>' +
        '<strong>' + escapeHtml(product.title) + '</strong>' +
        '<small>' + escapeHtml(product.subtitle) + '</small>';

      const body = document.createElement("div");
      body.className = "ebook-card-body";
      body.innerHTML =
        '<span class="category-chip">' + escapeHtml(product.category) + '</span>' +
        '<h3>' + escapeHtml(product.title) + '</h3>' +
        '<p class="ebook-subtitle">' + escapeHtml(product.subtitle) + '</p>' +
        '<p class="ebook-description">' + escapeHtml(product.description) + '</p>' +
        '<div class="ebook-buy-row">' +
          '<div class="ebook-price"><small>Acesso digital</small><strong>' + money.format(Number(product.price)) + '</strong></div>' +
          '<div class="card-pay-badges"><span class="pix">◆ PIX</span><span class="card">▣ CARTÃO</span></div>' +
        '</div>';

      const button = document.createElement("button");
      button.className = "btn full ebook-buy-button" + (owned ? " owned" : "");
      button.type = "button";
      button.dataset.buyProduct = product.id;
      button.dataset.price = product.price;
      button.textContent = owned ? "Baixar meu eBook" : "Comprar por " + money.format(Number(product.price));
      button.addEventListener("click", () => handleProductClick(product));

      body.appendChild(button);
      card.append(cover, body);
      ebookGrid.appendChild(card);
    });
  }


  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  async function handleProductClick(product) {
    const owned = readStorage(purchaseKey(product.id));
    if (owned?.checkoutToken) {
      applyProductToCheckout(product);
      await showAuthGate(product, owned.checkoutToken, "", owned.method || "account");
      return;
    }

    if (!automaticPayments) {
      alert("O pagamento está temporariamente indisponível. Tente novamente em alguns instantes.");
      return;
    }

    checkoutToken = "";
    pollCount = 0;
    clearTimeout(pollTimer);
    pixForm.reset();
    cardForm.reset();

    const { data: { session } } = await sb.auth.getSession();
    const accountEmailForCheckout = String(session?.user?.email || "").trim().toLowerCase();
    if (accountEmailForCheckout) {
      pixEmail.value = accountEmailForCheckout;
      cardEmail.value = accountEmailForCheckout;
    }
    pixEmail.readOnly = false;
    cardEmail.readOnly = false;

    pixArea.classList.add("hidden");
    paymentStatus.textContent = "Aguardando pagamento...";
    cardStatus.textContent = "";
    applyProductToCheckout(product);
    selectMethod("pix");
    setView(checkoutView);
    openModal();
  }

  pixForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedProduct) return;

    pixButton.disabled = true;
    pixButton.textContent = "Gerando Pix...";
    paymentStatus.textContent = "";

    try {
      const data = await checkoutApi({
        action: "create",
        productId: selectedProduct.id,
        name: pixName.value.trim(),
        email: pixEmail.value.trim()
      });

      checkoutToken = data.checkoutToken || "";
      savePending(selectedProduct.id, checkoutToken, "pix");

      pixCode.value = data.qrCode || "";
      pixImage.src = data.qrCodeBase64 ? "data:image/png;base64," + data.qrCodeBase64 : "";
      pixArea.classList.remove("hidden");
      paymentStatus.textContent = "Pix gerado. Aguardando o pagamento...";
      startPolling();
    } catch (error) {
      paymentStatus.textContent = error.message || "Não foi possível gerar o Pix.";
      paymentStatus.classList.add("error");
    } finally {
      pixButton.disabled = false;
      pixButton.textContent = "Gerar Pix de " + money.format(Number(selectedProduct.price));
    }
  });

  copyPix.addEventListener("click", async () => {
    if (!pixCode.value) return;
    try {
      await navigator.clipboard.writeText(pixCode.value);
      copyPix.textContent = "Código copiado ✓";
      setTimeout(() => copyPix.textContent = "Copiar código Pix", 1600);
    } catch {
      pixCode.select();
      document.execCommand("copy");
    }
  });

  checkStatus.addEventListener("click", () => checkPixStatus(true));

  function startPolling() {
    clearTimeout(pollTimer);
    pollCount = 0;
    pollTimer = setTimeout(() => checkPixStatus(false), 3500);
  }

  async function checkPixStatus(manual) {
    if (!checkoutToken || !selectedProduct) return;

    if (manual) {
      checkStatus.disabled = true;
      checkStatus.textContent = "Verificando...";
    }

    try {
      const data = await checkoutApi({ action: "status", checkoutToken });
      if (data.approved) {
        clearTimeout(pollTimer);
        await showAuthGate(
          products.find(p => p.id === data.productId) || selectedProduct,
          checkoutToken,
          data.buyerEmail || pixEmail.value.trim(),
          "pix"
        );
        return;
      }

      paymentStatus.textContent = "Pagamento ainda não confirmado. Assim que o Mercado Pago aprovar, o eBook será liberado.";
      if (!manual && pollCount < 225) {
        pollCount++;
        pollTimer = setTimeout(() => checkPixStatus(false), 4000);
      }
    } catch (error) {
      paymentStatus.textContent = error.message || "Não foi possível consultar o pagamento agora.";
      if (!manual && pollCount < 225) {
        pollCount++;
        pollTimer = setTimeout(() => checkPixStatus(false), 5000);
      }
    } finally {
      checkStatus.disabled = false;
      checkStatus.textContent = "Já paguei • verificar agora";
    }
  }

  cardForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedProduct) return;

    cardButton.disabled = true;
    cardButton.textContent = "Abrindo Mercado Pago...";
    cardStatus.textContent = "";

    try {
      const data = await cardApi({
        action: "create",
        productId: selectedProduct.id,
        name: cardName.value.trim(),
        email: cardEmail.value.trim()
      });

      if (!data.checkoutUrl) throw new Error("O Mercado Pago não retornou a página de pagamento.");
      savePending(selectedProduct.id, data.checkoutToken, "card");
      writeStorage("hebooks:last-card-pending", {
        checkoutToken: data.checkoutToken,
        productId: selectedProduct.id,
        savedAt: Date.now()
      });
      cardStatus.textContent = "Redirecionando para o ambiente seguro do Mercado Pago...";
      window.location.href = data.checkoutUrl;
    } catch (error) {
      cardStatus.textContent = error.message || "Não foi possível iniciar o pagamento com cartão.";
      cardStatus.classList.add("error");
      cardButton.disabled = false;
      cardButton.textContent = "Continuar com cartão • " + money.format(Number(selectedProduct.price));
    }
  });

  async function handleCardReturn() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("card_return");
    if (!token) return;

    openModal();
    setView(checkoutView);
    selectMethod("card");
    cardPanel.classList.remove("hidden");
    cardStatus.textContent = "Confirmando o pagamento com o Mercado Pago...";

    history.replaceState({}, document.title, window.location.pathname + window.location.hash);

    for (let i = 0; i < 14; i++) {
      try {
        const data = await cardApi({ action: "status", checkoutToken: token });
        const product = products.find(p => p.id === data.productId) || selectedProduct;
        if (product) applyProductToCheckout(product);

        if (data.approved) {
          await showAuthGate(
            product,
            token,
            data.buyerEmail || "",
            "card"
          );
          return;
        }

        if (data.status === "rejected" || data.status === "cancelled") {
          cardStatus.textContent = "O pagamento não foi aprovado. Você pode tentar novamente.";
          return;
        }
      } catch (error) {
        if (i === 13) cardStatus.textContent = error.message || "Não foi possível confirmar o pagamento.";
      }
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    cardStatus.textContent = "Pagamento ainda não confirmado. Aguarde alguns instantes e tente novamente.";
  }

  gateTabRegister.addEventListener("click", () => switchGateTab("register"));
  gateTabLogin.addEventListener("click", () => switchGateTab("login"));

  gateRegisterForm.addEventListener("submit", async event => {
    event.preventDefault();
    gateRegisterButton.disabled = true;
    gateRegisterButton.textContent = "Criando conta...";
    gateMessage.textContent = "";
    gateMessage.classList.remove("error");

    try {
      const email = gateRegisterEmail.value.trim().toLowerCase();
      const password = gateRegisterPassword.value;

      await accountApi("register", { email, password }, false);
      await completeGateLogin(email, password);
    } catch (error) {
      gateMessage.textContent = error.message || "Não foi possível criar sua conta.";
      gateMessage.classList.add("error");
    } finally {
      gateRegisterButton.disabled = false;
      gateRegisterButton.textContent = "Criar minha conta";
    }
  });

  gateLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    gateLoginButton.disabled = true;
    gateLoginButton.textContent = "Entrando...";
    gateMessage.textContent = "";
    gateMessage.classList.remove("error");

    try {
      await completeGateLogin(
        gateLoginEmail.value.trim().toLowerCase(),
        gateLoginPassword.value
      );
    } catch (error) {
      gateMessage.textContent = error.message || "Não foi possível entrar.";
      gateMessage.classList.add("error");
    } finally {
      gateLoginButton.disabled = false;
      gateLoginButton.textContent = "Entrar no H ebooks";
    }
  });

  if (config.githubEnabled) {
    gateGithubButton.disabled = false;
    gateGithubNote.textContent = "Use sua conta GitHub para entrar.";
    gateGithubButton.addEventListener("click", async () => {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: "https://dominustech813-ui.github.io/EBOOKS/" }
      });
      if (error) {
        gateMessage.textContent = error.message || "Não foi possível entrar com GitHub.";
        gateMessage.classList.add("error");
      }
    });
  }

  authTabRegister.addEventListener("click", () => switchAuthTab("register"));
  authTabLogin.addEventListener("click", () => switchAuthTab("login"));

  registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    registerButton.disabled = true;
    registerButton.textContent = "Criando conta...";
    authMessage.textContent = "";

    try {
      const email = registerEmail.value.trim().toLowerCase();
      const password = registerPassword.value;
      await accountApi("register", { email, password }, false);

      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (pendingClaimToken) await claimAndRelease();
      else await loadLibrary();
    } catch (error) {
      authMessage.textContent = error.message || "Não foi possível criar a conta.";
      authMessage.classList.add("error");
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = pendingClaimToken ? "Criar conta e liberar eBook" : "Criar conta";
    }
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";
    authMessage.textContent = "";

    try {
      const email = loginEmail.value.trim().toLowerCase();
      const password = loginPassword.value;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error("E-mail ou senha inválidos.");

      if (pendingClaimToken) await claimAndRelease();
      else await loadLibrary();
    } catch (error) {
      authMessage.textContent = error.message || "Não foi possível entrar.";
      authMessage.classList.add("error");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Entrar na minha conta";
    }
  });

  if (config.githubEnabled) {
    githubButton.disabled = false;
    githubNote.textContent = "Use sua conta GitHub para entrar.";
    githubButton.addEventListener("click", async () => {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: "https://dominustech813-ui.github.io/EBOOKS/" }
      });
      if (error) {
        authMessage.textContent = error.message || "Não foi possível entrar com GitHub.";
        authMessage.classList.add("error");
      }
    });
  }

  accountButton.addEventListener("click", async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      try {
        await loadLibrary();
      } catch (error) {
        alert(error.message || "Não foi possível abrir sua biblioteca.");
      }
    } else {
      pendingClaimToken = "";
      pendingClaimMethod = "";
      pendingBuyerEmail = "";
      await showAuthGate(null, "", "", "");
    }
  });

  logoutButton.addEventListener("click", async () => {
    await sb.auth.signOut();
    pixEmail.readOnly = false;
    cardEmail.readOnly = false;
    pixEmail.value = "";
    cardEmail.value = "";
    await lockSite();
  });

  supportButton.addEventListener("click", async () => {
    const name = (pixName.value || cardName.value || "").trim();
    const email = (pixEmail.value || cardEmail.value || "").trim();
    if (!name || !email) {
      alert("Preencha seu nome e e-mail no checkout antes de abrir um chamado.");
      return;
    }

    const problem = window.prompt("Descreva o problema para o suporte humano:");
    if (!problem || problem.trim().length < 5) return;

    supportButton.disabled = true;
    supportButton.textContent = "Abrindo chamado...";
    try {
      const data = await api(config.supportApiUrl, {
        action: "create-ticket",
        name,
        email,
        problem: (selectedProduct ? selectedProduct.title + " — " : "") + problem.trim()
      });
      alert((data.message || "Chamado aberto com sucesso.") + (data.ticketCode ? "\nCódigo: " + data.ticketCode : ""));
    } catch (error) {
      alert(error.message || "Não foi possível abrir o chamado.");
    } finally {
      supportButton.disabled = false;
      supportButton.textContent = "Está com problema? Falar com suporte humano";
    }
  });

  async function refreshPaymentConfig() {
    try {
      const data = await checkoutApi({ action: "config" });
      automaticPayments = data.automaticPayments === true;
    } catch {
      automaticPayments = false;
    }
  }

  async function loadCatalog() {
    try {
      products = await catalogApi();
      renderCatalog();
    } catch (error) {
      catalogCount.textContent = "Não foi possível carregar o catálogo";
      ebookGrid.innerHTML = '<div class="catalog-error">' + escapeHtml(error.message || "Tente novamente em instantes.") + '</div>';
    }
  }

  async function init() {
    switchGateTab("register");

    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      document.body.classList.add("auth-locked");
      return;
    }

    await unlockSite(session);

    const storedClaim = readStorage("hebooks:pending-claim");
    if (storedClaim?.checkoutToken) {
      pendingClaimToken = storedClaim.checkoutToken;
      pendingClaimMethod = storedClaim.method || "";
      pendingBuyerEmail = storedClaim.buyerEmail || "";
      selectedProduct = products.find(p => p.id === storedClaim.productId) || null;
    }

    if (session && pendingClaimToken && !new URLSearchParams(window.location.search).get("card_return")) {
      try { await claimAndRelease(); } catch {}
    }
  }

  init();
})();