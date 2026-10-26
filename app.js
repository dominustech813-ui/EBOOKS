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

  // Fotografias editoriais no catálogo (sem bonecos SVG).
  // Imagens externas públicas: não são arquivos dos eBooks vendidos.
  const premiumPhotos = {
    food: "photo-1568901346375-23c9450c58cd",
    cooking: "photo-1556911220-bff31c812dba",
    nature: "photo-1441974231531-c6227db76b6e",
    travel: "photo-1488646953014-85cb44e25828",
    finance: "photo-1579621970563-ebec7560ff3e",
    business: "photo-1460925895917-afdab827c52f",
    technology: "photo-1518770660439-4636190af475",
    computer: "photo-1498050108023-c5249f4df085",
    study: "photo-1497633762265-9d179a990aa6",
    books: "photo-1507842217343-583bb7270b66",
    health: "photo-1505751172876-fa1923c5c528",
    fitness: "photo-1517836357463-d25dfeac3438",
    meditation: "photo-1544367567-0f2fcb009e0b",
    music: "photo-1511379938547-c1f69419868d",
    art: "photo-1513364776144-60967b0f800f",
    animals: "photo-1457140072488-019a7a0e7a1e",
    portrait: "photo-1534528741775-53994a69daeb",
    city: "photo-1519501025264-65ba15a82390",
    gaming: "photo-1542751371-adc38448a05e"
  };
  function premiumPhotoFor(product) {
    const key = coverKey([product.title,product.subtitle,product.category,product.description].join(" "));
    let type = "books";
    if (/hamburg|receita|cozinha|culin|aliment|chocolate|bolo|pizz|comida|gastronom/.test(key)) type="food";
    else if (/viag|turismo|paises|mundo|destino/.test(key)) type="travel";
    else if (/finan|dinheiro|invest|renda|econom|venda|empreend|negocio/.test(key)) type="finance";
    else if (/inteligencia artificial|\\bia\\b|tecnolog|robot|digital|program|comput|internet|software/.test(key)) type="technology";
    else if (/estud|escola|educa|aprender|historia|matemat|lingua|ingles|geograf/.test(key)) type="study";
    else if (/saude|medic|nutri|doenca|imun|corpo humano/.test(key)) type="health";
    else if (/esporte|treino|muscul|exercicio|academia|fitness/.test(key)) type="fitness";
    else if (/mindfulness|medit|ansiedade|paz interior|bem-estar/.test(key)) type="meditation";
    else if (/naturez|planta|jardim|floresta|meio ambiente/.test(key)) type="nature";
    else if (/musica|instrumento|violao|guitarra/.test(key)) type="music";
    else if (/arte|pintura|desenho|criativ/.test(key)) type="art";
    else if (/animal|cachorro|gato|pet/.test(key)) type="animals";
    else if (/anime|naruto|one piece|dragon ball|pokemon|demon slayer|attack on titan|sponge|bob esponja|patrick|lula molusco|sandy|sirigueijo|jogo|game/.test(key)) type="gaming";
    else if (/lider|comunic|psicolog|autoconhec|relacionamento/.test(key)) type="portrait";
    else if (/cidade|arquitet|urbano/.test(key)) type="city";
    return "https://images.unsplash.com/" + premiumPhotos[type] + "?auto=format&fit=crop&w=900&q=85";
  }
  function buildIllustratedCover(product) {
    const url = premiumPhotoFor(product);
    return '<img class="ebook-cover-photo" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="" src="' + url + '"><span class="ebook-photo-shade" aria-hidden="true"></span>';
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