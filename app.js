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
  const mobileCatalogSearch = document.getElementById("mobile-catalog-search");
  const mobileCatalogCategory = document.getElementById("mobile-catalog-category");
  const mobileLibraryButton = document.getElementById("mobile-library-button");
  const discordLinkButton = document.getElementById("discord-link-button");
  const discordLinkStatus = document.getElementById("discord-link-status");
  const discordRoleModal = document.getElementById("discord-role-modal");
  const discordRoleCheckoutName = document.getElementById("discord-role-checkout-name");
  const discordRoleCheckoutPrice = document.getElementById("discord-role-checkout-price");
  const discordRoleMethodPix = document.getElementById("discord-role-method-pix");
  const discordRoleMethodCard = document.getElementById("discord-role-method-card");
  const discordRolePixPanel = document.getElementById("discord-role-pix-panel");
  const discordRoleCardPanel = document.getElementById("discord-role-card-panel");
  const discordRolePixButton = document.getElementById("discord-role-pix-button");
  const discordRoleCardButton = document.getElementById("discord-role-card-button");
  const discordRolePixArea = document.getElementById("discord-role-pix-area");
  const discordRolePixImage = document.getElementById("discord-role-pix-image");
  const discordRolePixCode = document.getElementById("discord-role-pix-code");
  const discordRoleCopyPix = document.getElementById("discord-role-copy-pix");
  const discordRoleCheckStatus = document.getElementById("discord-role-check-status");
  const discordRolePaymentStatus = document.getElementById("discord-role-payment-status");
  const supportTeamStatus = document.getElementById("support-team-status");
  const supportTeamPixButton = document.getElementById("support-team-pix-button");
  const supportTeamPixArea = document.getElementById("support-team-pix-area");
  const supportTeamPixImage = document.getElementById("support-team-pix-image");
  const supportTeamPixCode = document.getElementById("support-team-pix-code");
  const supportTeamCopyPix = document.getElementById("support-team-copy-pix");
  const supportTeamCheckStatus = document.getElementById("support-team-check-status");
  const supportTeamPaymentStatus = document.getElementById("support-team-payment-status");

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

  const readerExperience = window.createReaderExperience({
    client: sb,
    endpoint: config.supabaseUrl + "/functions/v1/reader-experience",
    onBuy: handleProductClick
  });

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
  let discordRoles = [];
  let selectedDiscordRole = null;
  let discordRoleCheckoutToken = "";
  let discordRolePollTimer = null;
  let discordRoleTestMode = false;
  let discordRoleTestAllowed = false;
  let supportTeamCheckoutToken = "";
  let supportTeamPollTimer = null;

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

  function startDirectDownload(url) {
    const safeUrl = String(url || "").trim();
    if (!safeUrl) throw new Error("Link do eBook não encontrado.");
    window.location.assign(safeUrl);
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

  downloadButton.addEventListener("click", event => {
    event.preventDefault();
    try {
      startDirectDownload(downloadButton.href);
    } catch (error) {
      alert(error.message || "Não foi possível iniciar o download.");
    }
  });

  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  function applyProductToCheckout(product) {
    selectedProduct = product;
    checkoutProductName.textContent = product.title + " — " + product.subtitle;
    checkoutPrice.textContent = money.format(Number(product.price));
    checkoutCoverTitle.textContent = product.title;
    checkoutCover.className = "checkout-cover illustrated-checkout-cover theme-" + themeClasses[(product.sort_order - 1) % themeClasses.length];
    let checkoutArt = checkoutCover.querySelector(".checkout-cover-art");
    if (!checkoutArt) {
      checkoutArt = document.createElement("div");
      checkoutArt.className = "checkout-cover-art";
      checkoutCover.insertBefore(checkoutArt, checkoutCover.firstChild);
    }
    checkoutArt.innerHTML = buildIllustratedCover(product);
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

  async function discordRoleApi(action, extra = {}) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) throw new Error("Entre na sua conta do H ebooks para continuar.");
    const response = await fetch(config.discordRoleApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.access_token,
        apikey: config.supabasePublishableKey
      },
      body: JSON.stringify({ action, ...extra })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Não foi possível acessar a Loja Discord.");
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
            startDirectDownload(data.downloadUrl);
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


  function coverKey(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function illustratedPerson(hair, outfit, accent, extra) {
    return '<g transform="translate(210 118)">' +
      '<ellipse cx="0" cy="100" rx="96" ry="28" fill="#000" opacity=".18"/>' +
      '<path d="M-82 92 Q-70 20 0 12 Q70 20 82 92 L58 168 L-58 168Z" fill="' + outfit + '"/>' +
      '<circle cx="0" cy="-8" r="56" fill="#f1bd94"/>' +
      '<path d="M-58 -25 L-40 -80 L-16 -50 L0 -92 L18 -48 L46 -82 L58 -24 Q30 -48 0 -48 Q-32 -48 -58 -25Z" fill="' + hair + '"/>' +
      '<circle cx="-20" cy="-4" r="5" fill="#12233f"/><circle cx="20" cy="-4" r="5" fill="#12233f"/>' +
      '<path d="M-18 24 Q0 34 18 24" stroke="#7b3f35" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M-92 72 Q-128 36 -112 2" stroke="' + accent + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      '<path d="M92 72 Q128 36 112 2" stroke="' + accent + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      (extra || "") + '</g>';
  }

  function buildIllustratedCover(product) {
    const t = coverKey(product.title);
    const c = coverKey(product.category);
    let a="#6847ff", b="#0d1f49", glow="#36d4ff", scene="";

    if (t.includes("naruto")) {
      a="#ff8a1d"; b="#151b38"; glow="#ffd34e";
      scene=illustratedPerson("#ffd34e","#f47b20","#111827",
        '<rect x="-58" y="-45" width="116" height="18" rx="8" fill="#253858"/><rect x="-20" y="-43" width="40" height="14" rx="5" fill="#b9c6d8"/>');
    } else if (t.includes("one piece")) {
      a="#e23732"; b="#102b61"; glow="#43c7ff";
      scene=illustratedPerson("#141414","#d9342b","#f2c84b",
        '<ellipse cx="0" cy="-55" rx="72" ry="18" fill="#e3b447"/><rect x="-64" y="-62" width="128" height="12" rx="5" fill="#cb3530"/>');
    } else if (t.includes("dragon ball")) {
      a="#f28b1a"; b="#172557"; glow="#ffe34f";
      scene=illustratedPerson("#ffd52d","#f1761a","#2b55d4",
        '<path d="M-95 10 Q0 -70 95 10" stroke="#ffe93d" stroke-width="12" opacity=".7" fill="none"/>');
    } else if (t.includes("demon slayer")) {
      a="#163c48"; b="#111521"; glow="#34d399";
      scene=illustratedPerson("#4b171b","#173e32","#44d19e",
        '<g opacity=".9"><rect x="-75" y="52" width="150" height="16" fill="#39b883"/><rect x="-75" y="84" width="150" height="16" fill="#39b883"/></g><path d="M82 85 L130 -28" stroke="#dcecff" stroke-width="8"/>');
    } else if (t.includes("attack on titan")) {
      a="#485c4e"; b="#1b2027"; glow="#d7b26a";
      scene=illustratedPerson("#171717","#3f5b46","#c8a766",
        '<path d="M-155 148 H155 M-145 118 H145 M-130 88 H130" stroke="#c9a973" stroke-width="10" opacity=".55"/>');
    } else if (t.includes("jujutsu")) {
      a="#6427b8"; b="#12162b"; glow="#b36bff";
      scene=illustratedPerson("#f3f5ff","#16172c","#8c5bff",
        '<rect x="-58" y="-20" width="116" height="25" rx="10" fill="#121320"/>');
    } else if (t.includes("my hero")) {
      a="#138966"; b="#102a35"; glow="#62f6c3";
      scene=illustratedPerson("#1e6b54","#124e3d","#f2f5f7",
        '<path d="M-62 70 L0 115 L62 70" stroke="#e8f3f7" stroke-width="10" fill="none"/>');
    } else if (t.includes("spy x family")) {
      a="#d3a6a0"; b="#18342c"; glow="#ffd6ca";
      scene='<g transform="translate(210 112)">' +
        illustratedPerson("#d6bf9a","#202d29","#d6b15d",'') +
        '<g transform="translate(-86 52) scale(.62)">' + illustratedPerson("#222","#1b2c28","#ccb26d",'') + '</g>' +
        '<g transform="translate(90 58) scale(.55)">' + illustratedPerson("#f3a9b8","#151f2a","#eec4d0",'') + '</g></g>';
    } else if (t.includes("pokemon")) {
      a="#1a73d9"; b="#17295c"; glow="#ffe33b";
      scene='<g transform="translate(210 118)"><ellipse cx="0" cy="112" rx="90" ry="25" fill="#000" opacity=".18"/>' +
        '<ellipse cx="0" cy="30" rx="78" ry="72" fill="#ffd934"/><path d="M-48 -25 L-76 -112 L-26 -48Z" fill="#ffd934"/><path d="M48 -25 L76 -112 L26 -48Z" fill="#ffd934"/>' +
        '<circle cx="-27" cy="18" r="8" fill="#141414"/><circle cx="27" cy="18" r="8" fill="#141414"/><circle cx="-50" cy="48" r="15" fill="#ef3b3b"/><circle cx="50" cy="48" r="15" fill="#ef3b3b"/>' +
        '<path d="M-18 58 Q0 72 18 58" stroke="#7b4b12" stroke-width="5" fill="none"/></g>';
    } else if (t.includes("death note")) {
      a="#311c39"; b="#0b0b12"; glow="#d94052";
      scene=illustratedPerson("#15151d","#1a1b22","#cf3948",
        '<rect x="62" y="35" width="70" height="92" rx="5" fill="#09090c"/><circle cx="-105" cy="70" r="26" fill="#c82837"/>');
    } else if (t.includes("fullmetal")) {
      a="#b6222a"; b="#34201d"; glow="#f0c36a";
      scene=illustratedPerson("#f2c55b","#a91f2d","#333",
        '<path d="M58 34 L126 130" stroke="#cbd2d9" stroke-width="16"/><circle cx="126" cy="130" r="18" fill="#9ca8b4"/>');
    } else if (t.includes("haikyuu")) {
      a="#f47c20"; b="#172236"; glow="#ffb14b";
      scene=illustratedPerson("#f07a20","#171b25","#f48b23",
        '<circle cx="108" cy="35" r="34" fill="#f6f6f2"/><path d="M85 18 L132 52 M132 18 L85 52" stroke="#3a3a3a" stroke-width="4"/>');
    } else if (t.includes("hunter x hunter")) {
      a="#21966a"; b="#17312e"; glow="#60f0a5";
      scene=illustratedPerson("#153f2f","#2f9d69","#e54d43",
        '<path d="M-62 64 L0 102 L62 64" stroke="#e34f43" stroke-width="10" fill="none"/>');
    } else if (t.includes("bleach")) {
      a="#ec7c2b"; b="#16191f"; glow="#ffd1a0";
      scene=illustratedPerson("#ed7f28","#111318","#d9e6ef",
        '<path d="M74 100 L132 -35" stroke="#e8edf0" stroke-width="9"/>');
    } else if (t.includes("one punch")) {
      a="#f0c928"; b="#a51f2b"; glow="#fff06a";
      scene=illustratedPerson("#f2cfae","#e8c72c","#c92735",
        '<path d="M-58 -48 Q0 -70 58 -48" fill="#f2cfae"/><circle cx="-105" cy="65" r="24" fill="#c92735"/><circle cx="105" cy="65" r="24" fill="#c92735"/>');
    } else if (t.includes("tokyo revengers")) {
      a="#d6b950"; b="#12141d"; glow="#f3df7a";
      scene=illustratedPerson("#e7c44f","#101218","#d9b84d",
        '<path d="M-55 44 H55 M-45 72 H45" stroke="#d0ae4c" stroke-width="5"/>');
    } else if (t.includes("chainsaw")) {
      a="#ea6a2c"; b="#16161a"; glow="#ff9d50";
      scene='<g transform="translate(210 118)"><path d="M-70 150 L-55 25 L-15 -35 L45 -25 L72 25 L62 150Z" fill="#212229"/>' +
        '<path d="M-42 -18 L72 -70 L88 -50 L-18 15Z" fill="#ef6d2f"/><path d="M-20 -38 L-5 -95 L16 -85 L8 -25Z" fill="#ef6d2f"/>' +
        '<circle cx="-12" cy="-10" r="8" fill="#ffd34d"/><circle cx="28" cy="-17" r="8" fill="#ffd34d"/></g>';
    } else if (t.includes("frieren")) {
      a="#83a8cf"; b="#24304b"; glow="#dcecff";
      scene=illustratedPerson("#eef2f7","#eff2f7","#8bb4d9",
        '<path d="M-58 -8 L-102 -28 L-62 18Z" fill="#f1c29d"/><path d="M58 -8 L102 -28 L62 18Z" fill="#f1c29d"/>');
    } else if (t.includes("solo leveling")) {
      a="#2c4cd7"; b="#0d1025"; glow="#637cff";
      scene=illustratedPerson("#10121c","#121629","#596cff",
        '<path d="M-110 110 Q-155 18 -100 -72 M110 110 Q155 18 100 -72" stroke="#5a71ff" stroke-width="10" opacity=".7" fill="none"/>');
    } else if (t.includes("bob esponja")) {
      a="#19aee7"; b="#075f8a"; glow="#ffe43c";
      scene='<g transform="translate(210 115)"><rect x="-78" y="-55" width="156" height="170" rx="28" fill="#f9df32"/>' +
        '<circle cx="-28" cy="-8" r="30" fill="#fff"/><circle cx="28" cy="-8" r="30" fill="#fff"/><circle cx="-28" cy="-8" r="10" fill="#2698d3"/><circle cx="28" cy="-8" r="10" fill="#2698d3"/>' +
        '<path d="M-42 44 Q0 78 42 44" stroke="#8f4a28" stroke-width="6" fill="#fff"/><rect x="-35" y="70" width="70" height="30" fill="#f4f4ec"/></g>';
    } else if (t.includes("patrick")) {
      a="#ef7c91"; b="#153e72"; glow="#ffb0bd";
      scene='<g transform="translate(210 125)"><path d="M0 -105 L38 -18 L120 -35 L58 30 L92 120 L0 72 L-92 120 L-58 30 L-120 -35 L-38 -18Z" fill="#f58da0"/>' +
        '<circle cx="-24" cy="-18" r="8" fill="#111"/><circle cx="24" cy="-18" r="8" fill="#111"/><path d="M-25 20 Q0 38 25 20" stroke="#8c3d55" stroke-width="5" fill="none"/></g>';
    } else if (t.includes("siriguejo")) {
      a="#d74c31"; b="#126b80"; glow="#ff9b67";
      scene='<g transform="translate(210 125)"><ellipse cx="0" cy="35" rx="70" ry="90" fill="#d94731"/><path d="M-58 25 L-130 -20 M58 25 L130 -20" stroke="#d94731" stroke-width="20"/>' +
        '<circle cx="-20" cy="-45" r="18" fill="#fff"/><circle cx="20" cy="-45" r="18" fill="#fff"/><circle cx="-20" cy="-45" r="6" fill="#111"/><circle cx="20" cy="-45" r="6" fill="#111"/></g>';
    } else if (t.includes("sandy")) {
      a="#3d9ed0"; b="#143257"; glow="#edf9ff";
      scene='<g transform="translate(210 118)"><circle cx="0" cy="-4" r="92" fill="#eef8ff" stroke="#bde7f7" stroke-width="9"/><circle cx="0" cy="5" r="54" fill="#a96b38"/>' +
        '<circle cx="-40" cy="-42" r="22" fill="#a96b38"/><circle cx="40" cy="-42" r="22" fill="#a96b38"/><circle cx="-18" cy="0" r="6"/><circle cx="18" cy="0" r="6"/>' +
        '<path d="M-18 28 Q0 42 18 28" stroke="#512c20" stroke-width="5" fill="none"/><path d="M-42 100 L42 100 L62 170 L-62 170Z" fill="#f0f1ee"/></g>';
    } else if (t.includes("lula molusco")) {
      a="#2d9b9f"; b="#12445c"; glow="#83d5cf";
      scene='<g transform="translate(210 118)"><ellipse cx="0" cy="-15" rx="62" ry="78" fill="#71b9ad"/><path d="M-40 45 L-58 150 M-15 52 L-20 158 M15 52 L20 158 M40 45 L58 150" stroke="#71b9ad" stroke-width="16"/>' +
        '<circle cx="-23" cy="-15" r="12" fill="#f3e5a7"/><circle cx="23" cy="-15" r="12" fill="#f3e5a7"/><path d="M-22 30 H22" stroke="#465c58" stroke-width="5"/></g>';
    } else {
      if (c.includes("pets")) {
        a="#aa7655"; b="#283441"; glow="#ffd2a8";
        scene='<g transform="translate(210 122)"><circle cx="-55" cy="15" r="62" fill="#d69a68"/><path d="M-105 -10 L-85 -80 L-48 -38Z" fill="#bd7a49"/><path d="M-5 -10 L-25 -80 L-62 -38Z" fill="#bd7a49"/><circle cx="-75" cy="8" r="7"/><circle cx="-35" cy="8" r="7"/><ellipse cx="-55" cy="34" rx="12" ry="9" fill="#222"/>' +
        '<circle cx="62" cy="18" r="58" fill="#c8c6c4"/><path d="M25 -15 L40 -70 L70 -38Z" fill="#9f9d9a"/><path d="M99 -15 L85 -70 L55 -38Z" fill="#9f9d9a"/><circle cx="45" cy="12" r="7"/><circle cx="78" cy="12" r="7"/></g>';
      } else if (c.includes("culin") || c.includes("aliment")) {
        a="#e56b32"; b="#4d2230"; glow="#ffcf63";
        scene='<g transform="translate(210 125)"><ellipse cx="0" cy="32" rx="126" ry="66" fill="#f3f0e9"/><ellipse cx="0" cy="28" rx="92" ry="42" fill="#da6c3f"/><circle cx="-28" cy="15" r="24" fill="#f5d24a"/><circle cx="28" cy="15" r="24" fill="#61a94a"/><path d="M-120 -15 L-150 120 M120 -15 L150 120" stroke="#d9dfe5" stroke-width="12"/></g>';
      } else if (c.includes("program") || c.includes("tecnologia") || c.includes("inteligencia artificial") || c.includes("ia e trabalho")) {
        a="#1674d1"; b="#111d3d"; glow="#49e5ff";
        scene='<g transform="translate(210 125)"><rect x="-125" y="-75" width="250" height="150" rx="16" fill="#17263f" stroke="#44d9ff" stroke-width="5"/><rect x="-105" y="-55" width="210" height="110" fill="#0a1325"/><path d="M-55 -20 L-85 0 L-55 20 M55 -20 L85 0 L55 20 M18 -34 L-18 34" stroke="#45e5ff" stroke-width="8" fill="none"/><path d="M-145 92 H145" stroke="#9ba9bd" stroke-width="18"/></g>';
      } else if (c.includes("finan") || c.includes("negocio") || c.includes("carreira")) {
        a="#138c68"; b="#11302b"; glow="#64efb6";
        scene='<g transform="translate(210 130)"><rect x="-128" y="-70" width="256" height="155" rx="18" fill="#0d2826"/><path d="M-100 55 L-45 10 L0 28 L70 -50 L112 -72" stroke="#67efb3" stroke-width="12" fill="none"/><path d="M-100 55 V75 M-45 10 V75 M0 28 V75 M70 -50 V75 M112 -72 V75" stroke="#316d60" stroke-width="8"/><circle cx="94" cy="-66" r="28" fill="#f1c84b"/></g>';
      } else if (c.includes("fotografia") || c.includes("video")) {
        a="#3450a1"; b="#151c34"; glow="#8db7ff";
        scene='<g transform="translate(210 125)"><rect x="-130" y="-70" width="260" height="155" rx="28" fill="#20283b"/><circle cx="0" cy="8" r="62" fill="#0d1220" stroke="#7d9bd0" stroke-width="15"/><circle cx="0" cy="8" r="28" fill="#2b73ad"/><rect x="-75" y="-103" width="92" height="40" rx="10" fill="#303a51"/></g>';
      } else if (c.includes("musica")) {
        a="#b15725"; b="#2b1721"; glow="#ffb858";
        scene='<g transform="translate(210 122)"><path d="M-80 -75 C-20 -45 30 25 45 115" stroke="#d79a45" stroke-width="34" fill="none"/><ellipse cx="-72" cy="-72" rx="45" ry="62" fill="#bc6a2f"/><circle cx="-62" cy="-65" r="22" fill="#2b1721"/><path d="M58 -80 V70 Q20 50 20 88 Q20 126 60 112 Q86 102 86 75 V-95" stroke="#f5d5a0" stroke-width="14" fill="none"/></g>';
      } else if (c.includes("jardin") || c.includes("sustent")) {
        a="#379650"; b="#14372c"; glow="#8af29d";
        scene='<g transform="translate(210 130)"><path d="M0 105 V-45" stroke="#83d48a" stroke-width="16"/><ellipse cx="-55" cy="-20" rx="62" ry="28" transform="rotate(-28 -55 -20)" fill="#55b866"/><ellipse cx="55" cy="-50" rx="62" ry="28" transform="rotate(28 55 -50)" fill="#6acb70"/><ellipse cx="-42" cy="48" rx="55" ry="24" transform="rotate(-25 -42 48)" fill="#4ba85d"/><ellipse cx="48" cy="30" rx="55" ry="24" transform="rotate(25 48 30)" fill="#74d47a"/><ellipse cx="0" cy="125" rx="105" ry="28" fill="#5c3e2d"/></g>';
      } else if (c.includes("viagem") || c.includes("geografia") || c.includes("historia")) {
        a="#2876aa"; b="#18304d"; glow="#72d8ff";
        scene='<g transform="translate(210 122)"><circle cx="-18" cy="12" r="92" fill="#3c9dd0"/><path d="M-78 -20 Q-35 -70 10 -35 Q45 -10 35 32 Q0 70 -60 45Z" fill="#55ad68"/><path d="M45 -70 L145 -118 L76 -20 L135 5 L45 24 L18 95 L-8 18Z" fill="#e9f2f8"/></g>';
      } else if (c.includes("ciencias") || c.includes("matematica") || c.includes("educacao") || c.includes("idiomas")) {
        a="#2774c8"; b="#25245b"; glow="#67d9ff";
        scene='<g transform="translate(210 124)"><path d="M-125 -75 Q-55 -110 0 -60 V110 Q-58 72 -125 95Z" fill="#f0f4ff"/><path d="M125 -75 Q55 -110 0 -60 V110 Q58 72 125 95Z" fill="#e4ebff"/><circle cx="72" cy="-5" r="42" fill="#38a7d3"/><path d="M72 -55 V45 M22 -5 H122" stroke="#d8f5ff" stroke-width="5"/><path d="M-96 -25 H-25 M-96 5 H-35 M-96 35 H-18" stroke="#596b8e" stroke-width="8"/></g>';
      } else if (c.includes("artesanato") || c.includes("design") || c.includes("cultura")) {
        a="#a84d91"; b="#342040"; glow="#ff91d5";
        scene='<g transform="translate(210 122)"><circle cx="-70" cy="0" r="72" fill="#e4569e"/><circle cx="-70" cy="0" r="48" fill="#ca4687"/><path d="M-12 -80 L104 90 M18 -100 L134 70" stroke="#f2e8f0" stroke-width="10"/><circle cx="66" cy="-35" r="34" fill="#45b9d4"/><circle cx="110" cy="25" r="25" fill="#f2c84e"/></g>';
      } else if (c.includes("saude") || c.includes("bem-estar")) {
        a="#149da0"; b="#16334d"; glow="#70f0df";
        scene='<g transform="translate(210 122)"><path d="M0 110 C-135 20 -120 -80 -45 -75 C-5 -72 0 -35 0 -35 C0 -35 8 -75 50 -75 C125 -75 138 25 0 110Z" fill="#e94d62"/><path d="M-125 20 H-62 L-38 -30 L-5 68 L28 -10 L52 20 H125" stroke="#d8fff8" stroke-width="9" fill="none"/></g>';
      } else {
        a="#6547d9"; b="#19204c"; glow="#55d5ff";
        scene='<g transform="translate(210 125)"><circle cx="0" cy="0" r="105" fill="#ffffff" opacity=".12"/><path d="M-95 65 L-20 -65 L45 15 L105 -90" stroke="#69ddff" stroke-width="18" fill="none"/><circle cx="-85" cy="-45" r="28" fill="#ffcb57"/><circle cx="88" cy="52" r="35" fill="#ff6fa7"/></g>';
      }
    }

    return '<svg class="ebook-cover-art" viewBox="0 0 420 300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>' +
      '<radialGradient id="glow" cx=".75" cy=".18" r=".8"><stop stop-color="' + glow + '" stop-opacity=".55"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="420" height="300" fill="url(#bg)"/><rect width="420" height="300" fill="url(#glow)"/>' +
      '<circle cx="40" cy="35" r="4" fill="#fff" opacity=".65"/><circle cx="365" cy="65" r="3" fill="#fff" opacity=".5"/><circle cx="340" cy="235" r="5" fill="#fff" opacity=".28"/>' +
      scene + '</svg>';
  }

  function populateMobileCatalogCategories() {
    if (!mobileCatalogCategory) return;
    const categories = [...new Set(products.map(p => String(p.category || "").trim()).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b, "pt-BR"));
    mobileCatalogCategory.innerHTML = '<option value="">Todas as categorias</option>';
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      mobileCatalogCategory.appendChild(option);
    });
  }

  function renderCatalog() {
    ebookGrid.innerHTML = "";

    const searchTerm = String(mobileCatalogSearch?.value || "").trim().toLocaleLowerCase("pt-BR");
    const categoryFilter = String(mobileCatalogCategory?.value || "").trim();

    const visibleProducts = products.filter(product => {
      const haystack = [product.title, product.subtitle, product.description, product.category]
        .map(value => String(value || "").toLocaleLowerCase("pt-BR"))
        .join(" ");
      const matchesSearch = !searchTerm || haystack.includes(searchTerm);
      const matchesCategory = !categoryFilter || String(product.category || "") === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    catalogCount.textContent = visibleProducts.length === products.length
      ? products.length + " eBooks disponíveis"
      : visibleProducts.length + " de " + products.length + " eBooks";

    if (!visibleProducts.length) {
      ebookGrid.innerHTML = '<div class="catalog-error">Nenhum eBook encontrado.</div>';
      return;
    }

    visibleProducts.forEach((product, index) => {
      const theme = themeClasses[index % themeClasses.length];
      const icon = categoryIcons[product.category] || "📘";
      const owned = !!readStorage(purchaseKey(product.id));

      const card = document.createElement("article");
      card.className = "ebook-card";

      const cover = document.createElement("div");
      cover.className = "ebook-cover illustrated-cover theme-" + theme;
      cover.innerHTML =
        '<div class="ebook-cover-brand"><span class="mini-h">H</span><span>ebooks</span></div>' +
        '<div class="ebook-cover-art-wrap">' + buildIllustratedCover(product) + '</div>' +
        '<div class="ebook-cover-copy"><strong>' + escapeHtml(product.title) + '</strong>' +
        '<small>' + escapeHtml(product.subtitle) + '</small></div>';

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
      readerExperience.addButtons(body, product);
      card.append(cover, body);
      ebookGrid.appendChild(card);
    });
  }


  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  if (mobileCatalogSearch) {
    mobileCatalogSearch.addEventListener("input", renderCatalog);
  }
  if (mobileCatalogCategory) {
    mobileCatalogCategory.addEventListener("change", renderCatalog);
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

  if (mobileLibraryButton) {
    mobileLibraryButton.addEventListener("click", () => accountButton.click());
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

  function selectDiscordRoleMethod(method) {
    const card = method === "card";
    discordRoleMethodPix.classList.toggle("active", !card);
    discordRoleMethodCard.classList.toggle("active", card);
    discordRolePixPanel.classList.toggle("hidden", card);
    discordRoleCardPanel.classList.toggle("hidden", !card);
  }

  function closeDiscordRoleModal() {
    clearTimeout(discordRolePollTimer);
    discordRoleModal.classList.remove("active");
    discordRoleModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openDiscordRoleModal(role) {
    selectedDiscordRole = role;
    discordRoleCheckoutName.textContent = role.role_name;
    discordRoleCheckoutPrice.textContent = money.format(Number(role.price));
    discordRolePixArea.classList.add("hidden");
    discordRolePaymentStatus.textContent = "";
    discordRoleCheckoutToken = "";
    selectDiscordRoleMethod("pix");
    discordRoleModal.classList.add("active");
    discordRoleModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  async function loadDiscordStore() {
    if (!config.discordRoleApiUrl || !discordLinkButton) return;
    try {
      const data = await discordRoleApi("status");
      discordRoles = Array.isArray(data.roles) ? data.roles : [];
      discordRoleTestMode = data.testMode === true;
      discordRoleTestAllowed = data.testAllowed === true;

      if (!data.oauthConfigured) {
        discordLinkStatus.textContent = "Integração Discord aguardando configuração segura";
        discordLinkButton.classList.remove("linked");
        discordLinkButton.disabled = true;
        discordLinkButton.querySelector("span").textContent = "Configuração pendente";
      } else if (data.linked) {
        discordLinkStatus.textContent = "Vinculado como " + (data.discord?.username || "Discord");
        discordLinkButton.classList.add("linked");
        discordLinkButton.disabled = false;
        discordLinkButton.dataset.linked = "true";
        discordLinkButton.querySelector("span").textContent = "Desvincular Discord";
      } else {
        discordLinkStatus.textContent = "Discord ainda não vinculado";
        discordLinkButton.classList.remove("linked");
        discordLinkButton.disabled = false;
        discordLinkButton.dataset.linked = "false";
        discordLinkButton.querySelector("span").textContent = "Vincular Discord";
      }

      discordRoles.forEach(role => {
        const priceEl = document.querySelector('[data-role-price="' + CSS.escape(role.id) + '"]');
        const buyButton = document.querySelector('[data-discord-role-buy="' + CSS.escape(role.id) + '"]');
        if (priceEl) {
          priceEl.textContent = discordRoleTestMode
            ? "TESTE TEMPORÁRIO • SEM COBRANÇA"
            : (role.price ? money.format(Number(role.price)) : "Preço a definir");
        }
        if (buyButton) {
          if (role.owned) {
            buyButton.disabled = true;
            buyButton.classList.add("role-delivered");
            buyButton.textContent = "CARGO ENTREGUE ✓";
            return;
          }
          buyButton.classList.remove("role-delivered");
          if (discordRoleTestMode) {
            const canTest = role.configured && data.oauthConfigured && data.linked && discordRoleTestAllowed;
            buyButton.disabled = !canTest;
            buyButton.textContent = !role.configured
              ? "Configuração pendente"
              : !data.oauthConfigured
                ? "Integração pendente"
                : !data.linked
                  ? "Vincule o Discord primeiro"
                  : !discordRoleTestAllowed
                    ? "Teste reservado à administração"
                    : "PEGAR CARGO";
          } else {
            const canBuy = role.configured && data.oauthConfigured && data.linked;
            buyButton.disabled = !canBuy;
            buyButton.textContent = !role.configured
              ? "Configuração pendente"
              : !data.oauthConfigured
                ? "Integração pendente"
                : !data.linked
                  ? "Vincule o Discord primeiro"
                  : "GERAR PIX • " + money.format(Number(role.price));
          }
        }
      });

      const supportRole = discordRoles.find(role => role.id === "support-team");
      if (supportTeamPixButton && supportTeamStatus) {
        if (!supportRole || !supportRole.configured) {
          supportTeamPixButton.disabled = true;
          supportTeamPixButton.textContent = "CONFIGURAÇÃO PENDENTE";
          supportTeamStatus.textContent = "Programa de suporte aguardando configuração.";
        } else if (supportRole.owned) {
          supportTeamPixButton.disabled = true;
          supportTeamPixButton.textContent = "CARGO DE SUPORTE ENTREGUE ✓";
          supportTeamStatus.textContent = "Você já faz parte da equipe de suporte ✓";
        } else if (!data.oauthConfigured) {
          supportTeamPixButton.disabled = true;
          supportTeamPixButton.textContent = "INTEGRAÇÃO PENDENTE";
          supportTeamStatus.textContent = "Integração com Discord indisponível.";
        } else if (!data.linked) {
          supportTeamPixButton.disabled = true;
          supportTeamPixButton.textContent = "VINCULE O DISCORD PRIMEIRO";
          supportTeamStatus.textContent = "Vincule seu Discord acima para participar.";
        } else {
          supportTeamPixButton.disabled = false;
          supportTeamPixButton.textContent = "GERAR PIX • " + money.format(Number(supportRole.price || 30));
          supportTeamStatus.textContent = "Discord vinculado. Você já pode gerar o PIX.";
        }
      }
    } catch (error) {
      discordLinkStatus.textContent = "Loja Discord temporariamente indisponível";
      if (supportTeamStatus) supportTeamStatus.textContent = "Programa de suporte temporariamente indisponível.";
    }
  }

  async function checkDiscordRolePayment(manual = false) {
    if (!discordRoleCheckoutToken) return;
    if (manual) {
      discordRoleCheckStatus.disabled = true;
      discordRoleCheckStatus.textContent = "Verificando...";
    }
    try {
      const data = await discordRoleApi("payment_status", { checkoutToken: discordRoleCheckoutToken });
      if (data.approved && data.roleGranted) {
        clearTimeout(discordRolePollTimer);
        discordRolePaymentStatus.textContent = "Pagamento confirmado. Cargo adicionado ao seu Discord ✓";
        discordRolePaymentStatus.classList.remove("error");
        discordRoleCheckStatus.textContent = "Cargo liberado ✓";
        discordRoleCheckStatus.disabled = true;
        return;
      }
      if (data.approved && data.error) {
        clearTimeout(discordRolePollTimer);
        discordRolePaymentStatus.textContent = data.error;
        discordRolePaymentStatus.classList.add("error");
        return;
      }
      discordRolePaymentStatus.textContent = "Pagamento ainda não confirmado.";
      if (!manual) discordRolePollTimer = setTimeout(() => checkDiscordRolePayment(false), 4500);
    } catch (error) {
      discordRolePaymentStatus.textContent = error.message || "Não foi possível consultar o pagamento.";
      discordRolePaymentStatus.classList.add("error");
    } finally {
      if (manual && !discordRoleCheckStatus.disabled) {
        discordRoleCheckStatus.disabled = false;
        discordRoleCheckStatus.textContent = "Já paguei • verificar cargo";
      }
    }
  }


  async function checkSupportTeamPayment(manual = false) {
    if (!supportTeamCheckoutToken) return;
    if (manual && supportTeamCheckStatus) {
      supportTeamCheckStatus.disabled = true;
      supportTeamCheckStatus.textContent = "Verificando...";
    }
    try {
      const data = await discordRoleApi("payment_status", { checkoutToken: supportTeamCheckoutToken });
      if (data.approved && data.roleGranted) {
        clearTimeout(supportTeamPollTimer);
        if (supportTeamPaymentStatus) {
          supportTeamPaymentStatus.textContent = "Pagamento confirmado. Cargo Suporte H ebooks entregue no Discord ✓";
          supportTeamPaymentStatus.classList.remove("error");
        }
        if (supportTeamPixButton) {
          supportTeamPixButton.disabled = true;
          supportTeamPixButton.textContent = "CARGO DE SUPORTE ENTREGUE ✓";
        }
        if (supportTeamStatus) supportTeamStatus.textContent = "Você já faz parte da equipe de suporte ✓";
        if (supportTeamCheckStatus) {
          supportTeamCheckStatus.disabled = true;
          supportTeamCheckStatus.textContent = "Cargo entregue ✓";
        }
        await loadDiscordStore();
        return;
      }
      if (data.approved && data.error) {
        clearTimeout(supportTeamPollTimer);
        if (supportTeamPaymentStatus) {
          supportTeamPaymentStatus.textContent = data.error;
          supportTeamPaymentStatus.classList.add("error");
        }
        return;
      }
      if (supportTeamPaymentStatus) {
        supportTeamPaymentStatus.textContent = "Pagamento ainda não confirmado.";
        supportTeamPaymentStatus.classList.remove("error");
      }
      if (!manual) supportTeamPollTimer = setTimeout(() => checkSupportTeamPayment(false), 4500);
    } catch (error) {
      if (supportTeamPaymentStatus) {
        supportTeamPaymentStatus.textContent = error.message || "Não foi possível consultar o pagamento.";
        supportTeamPaymentStatus.classList.add("error");
      }
    } finally {
      if (manual && supportTeamCheckStatus && supportTeamCheckStatus.textContent !== "Cargo entregue ✓") {
        supportTeamCheckStatus.disabled = false;
        supportTeamCheckStatus.textContent = "Já paguei • verificar";
      }
    }
  }

  if (supportTeamPixButton) {
    supportTeamPixButton.addEventListener("click", async () => {
      const supportRole = discordRoles.find(role => role.id === "support-team");
      if (!supportRole) {
        alert("O programa de suporte ainda não está disponível.");
        return;
      }
      if (supportRole.owned) {
        alert("O cargo Suporte H ebooks já foi entregue à sua conta.");
        return;
      }
      if (!discordLinkButton || discordLinkButton.dataset.linked !== "true") {
        alert("Vincule sua conta do Discord antes de gerar o PIX.");
        return;
      }

      supportTeamPixButton.disabled = true;
      supportTeamPixButton.textContent = "GERANDO PIX...";
      if (supportTeamPaymentStatus) supportTeamPaymentStatus.textContent = "";

      try {
        const data = await discordRoleApi("create_pix", { roleId: "support-team" });
        supportTeamCheckoutToken = data.checkoutToken || "";
        if (!supportTeamCheckoutToken || !data.qrCode) throw new Error("O PIX não foi gerado corretamente.");

        if (supportTeamPixCode) supportTeamPixCode.value = data.qrCode;
        if (supportTeamPixImage) {
          supportTeamPixImage.src = data.qrCodeBase64
            ? "data:image/png;base64," + data.qrCodeBase64
            : "";
        }
        if (supportTeamPixArea) supportTeamPixArea.classList.remove("hidden");
        supportTeamPixButton.textContent = "PIX GERADO • R$ 30,00";
        if (supportTeamPaymentStatus) supportTeamPaymentStatus.textContent = "PIX gerado. Aguardando confirmação do pagamento...";
        clearTimeout(supportTeamPollTimer);
        supportTeamPollTimer = setTimeout(() => checkSupportTeamPayment(false), 4500);
      } catch (error) {
        alert(error.message || "Não foi possível gerar o PIX.");
        supportTeamPixButton.disabled = false;
        supportTeamPixButton.textContent = "GERAR PIX • R$ 30,00";
      }
    });
  }

  if (supportTeamCopyPix) {
    supportTeamCopyPix.addEventListener("click", async () => {
      const code = String(supportTeamPixCode?.value || "").trim();
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        const old = supportTeamCopyPix.textContent;
        supportTeamCopyPix.textContent = "PIX COPIADO ✓";
        setTimeout(() => { supportTeamCopyPix.textContent = old; }, 1800);
      } catch {
        supportTeamPixCode?.select();
        document.execCommand("copy");
      }
    });
  }

  if (supportTeamCheckStatus) {
    supportTeamCheckStatus.addEventListener("click", () => checkSupportTeamPayment(true));
  }

  if (discordLinkButton) {
    discordLinkButton.addEventListener("click", async () => {
      const linked = discordLinkButton.dataset.linked === "true";

      if (linked) {
        const confirmed = window.confirm(
          "Deseja desvincular sua conta do Discord do H ebooks?\n\n" +
          "Os cargos que você já recebeu no servidor não serão removidos."
        );
        if (!confirmed) return;

        discordLinkButton.disabled = true;
        try {
          await discordRoleApi("unlink");
          await loadDiscordStore();
          alert("Conta do Discord desvinculada com sucesso.");
        } catch (error) {
          alert(error.message || "Não foi possível desvincular o Discord.");
          discordLinkButton.disabled = false;
        }
        return;
      }

      discordLinkButton.disabled = true;
      try {
        const data = await discordRoleApi("link");
        if (!data.url) throw new Error("Não foi possível iniciar a vinculação.");
        window.location.href = data.url;
      } catch (error) {
        alert(error.message || "Não foi possível vincular o Discord.");
        discordLinkButton.disabled = false;
      }
    });
  }

  document.querySelectorAll("[data-discord-role-buy]").forEach(button => {
    button.addEventListener("click", async () => {
      const role = discordRoles.find(r => r.id === button.dataset.discordRoleBuy);
      if (!role) return;
      if (!role.configured) {
        alert("Este cargo ainda não está configurado.");
        return;
      }
      if (!discordLinkButton.classList.contains("linked")) {
        alert("Vincule sua conta do Discord antes de pegar o cargo.");
        return;
      }

      if (discordRoleTestMode) {
        if (!discordRoleTestAllowed) {
          alert("O teste temporário está reservado à administração.");
          return;
        }
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "ENVIANDO CARGO...";
        try {
          const data = await discordRoleApi("grant_test_role", { roleId: role.id });
          if (!data.roleGranted) throw new Error("O Discord não confirmou a entrega do cargo.");
          button.textContent = "CARGO ENTREGUE ✓";
          alert("Teste concluído! O cargo " + (data.roleName || role.role_name) + " foi adicionado ao seu Discord.");
        } catch (error) {
          alert(error.message || "Não foi possível entregar o cargo.");
          button.disabled = false;
          button.textContent = originalText || "PEGAR CARGO";
        }
        return;
      }

      openDiscordRoleModal(role);
      discordRolePaymentStatus.classList.remove("error");
      discordRolePaymentStatus.textContent = "Gerando Pix...";
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "GERANDO PIX...";
      try {
        const data = await discordRoleApi("create_pix", { roleId: role.id });
        discordRoleCheckoutToken = data.checkoutToken || "";
        discordRolePixCode.value = data.qrCode || "";
        discordRolePixImage.src = data.qrCodeBase64 ? "data:image/png;base64," + data.qrCodeBase64 : "";
        discordRolePixArea.classList.remove("hidden");
        discordRolePaymentStatus.textContent = "Pix gerado. Aguardando a confirmação do pagamento...";
        clearTimeout(discordRolePollTimer);
        discordRolePollTimer = setTimeout(() => checkDiscordRolePayment(false), 4000);
      } catch (error) {
        discordRolePaymentStatus.textContent = error.message || "Não foi possível gerar o Pix.";
        discordRolePaymentStatus.classList.add("error");
        button.disabled = false;
        button.textContent = originalText || ("GERAR PIX • " + money.format(Number(role.price)));
      }
    });
  });

  document.querySelectorAll("[data-close-discord-role]").forEach(el => {
    el.addEventListener("click", closeDiscordRoleModal);
  });

  if (discordRoleMethodPix) discordRoleMethodPix.addEventListener("click", () => selectDiscordRoleMethod("pix"));
  if (discordRoleMethodCard) discordRoleMethodCard.addEventListener("click", () => selectDiscordRoleMethod("card"));

  if (discordRolePixButton) {
    discordRolePixButton.addEventListener("click", async () => {
      if (!selectedDiscordRole) return;
      discordRolePixButton.disabled = true;
      discordRolePaymentStatus.textContent = "Gerando Pix...";
      try {
        const data = await discordRoleApi("create_pix", { roleId: selectedDiscordRole.id });
        discordRoleCheckoutToken = data.checkoutToken || "";
        discordRolePixCode.value = data.qrCode || "";
        discordRolePixImage.src = data.qrCodeBase64 ? "data:image/png;base64," + data.qrCodeBase64 : "";
        discordRolePixArea.classList.remove("hidden");
        discordRolePaymentStatus.textContent = "Pix gerado. Aguardando a confirmação do pagamento...";
        clearTimeout(discordRolePollTimer);
        discordRolePollTimer = setTimeout(() => checkDiscordRolePayment(false), 4000);
      } catch (error) {
        discordRolePaymentStatus.textContent = error.message || "Não foi possível gerar o Pix.";
        discordRolePaymentStatus.classList.add("error");
      } finally {
        discordRolePixButton.disabled = false;
      }
    });
  }

  if (discordRoleCopyPix) {
    discordRoleCopyPix.addEventListener("click", async () => {
      if (!discordRolePixCode.value) return;
      try {
        await navigator.clipboard.writeText(discordRolePixCode.value);
        discordRoleCopyPix.textContent = "Código copiado ✓";
        setTimeout(() => discordRoleCopyPix.textContent = "Copiar código Pix", 1500);
      } catch {
        discordRolePixCode.select();
        document.execCommand("copy");
      }
    });
  }

  if (discordRoleCheckStatus) discordRoleCheckStatus.addEventListener("click", () => checkDiscordRolePayment(true));

  if (discordRoleCardButton) {
    discordRoleCardButton.addEventListener("click", async () => {
      if (!selectedDiscordRole) return;
      discordRoleCardButton.disabled = true;
      discordRolePaymentStatus.textContent = "Abrindo Mercado Pago...";
      try {
        const data = await discordRoleApi("create_card", { roleId: selectedDiscordRole.id });
        if (!data.checkoutUrl) throw new Error("O Mercado Pago não retornou o checkout.");
        window.location.href = data.checkoutUrl;
      } catch (error) {
        discordRolePaymentStatus.textContent = error.message || "Não foi possível abrir o pagamento.";
        discordRolePaymentStatus.classList.add("error");
        discordRoleCardButton.disabled = false;
      }
    });
  }

  async function handleDiscordReturn() {
    const params = new URLSearchParams(window.location.search);
    const linkResult = params.get("discord_link");
    const roleReturn = params.get("discord_role_return");

    if (linkResult) {
      await loadDiscordStore();
      if (linkResult === "ok") {
        setTimeout(() => {
          const el = document.getElementById("discord");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }

    if (roleReturn) {
      discordRoleCheckoutToken = roleReturn;
      for (let i = 0; i < 12; i++) {
        try {
          const data = await discordRoleApi("payment_status", { checkoutToken: roleReturn });
          if (data.approved && data.roleGranted) {
            alert("Pagamento confirmado! O cargo já foi adicionado ao seu Discord.");
            break;
          }
          if (data.approved && data.error) {
            alert(data.error);
            break;
          }
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    }

    if (linkResult || roleReturn) {
      history.replaceState({}, document.title, window.location.pathname + "#discord");
    }
  }

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
      populateMobileCatalogCategories();
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
    await loadDiscordStore();
    await handleDiscordReturn();

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