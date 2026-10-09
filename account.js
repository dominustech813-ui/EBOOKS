(() => {
  const config = window.HEBOOKS_CONFIG || {};
  const SESSION_KEY = "hebooks-account-session";
  const EMAIL_KEY = "hebooks-login-email";

  const loginView = document.getElementById("login-view");
  const codeView = document.getElementById("code-view");
  const accountView = document.getElementById("account-view");
  const emailForm = document.getElementById("email-form");
  const codeForm = document.getElementById("code-form");
  const emailInput = document.getElementById("login-email");
  const codeInput = document.getElementById("login-code");
  const sendButton = document.getElementById("send-code-button");
  const verifyButton = document.getElementById("verify-code-button");
  const resendButton = document.getElementById("resend-code-button");
  const changeEmailButton = document.getElementById("change-email-button");
  const logoutButton = document.getElementById("logout-button");
  const loginMessage = document.getElementById("login-message");
  const codeMessage = document.getElementById("code-message");
  const codeEmail = document.getElementById("code-email");
  const accountEmail = document.getElementById("account-email");
  const library = document.getElementById("library-list");
  const adminBox = document.getElementById("admin-box");

  let pendingEmail = sessionStorage.getItem(EMAIL_KEY) || "";

  function getSessionToken() {
    return localStorage.getItem(SESSION_KEY) || "";
  }

  function setSessionToken(token) {
    if (token) localStorage.setItem(SESSION_KEY, token);
    else localStorage.removeItem(SESSION_KEY);
  }

  function show(view) {
    [loginView, codeView, accountView].forEach(el => el.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  async function accountApi(action, extra = {}) {
    if (!config.accountApiUrl) throw new Error("Serviço de conta indisponível.");
    const response = await fetch(config.accountApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        sessionToken: getSessionToken(),
        ...extra
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Não foi possível processar sua conta.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function sendCode(email) {
    const clean = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) throw new Error("Informe um e-mail válido.");

    const data = await accountApi("request-code", { email: clean });
    pendingEmail = clean;
    sessionStorage.setItem(EMAIL_KEY, clean);
    codeEmail.textContent = clean;
    codeInput.value = "";
    show(codeView);
    setTimeout(() => codeInput.focus(), 100);
    return data;
  }

  function renderLibrary(data) {
    accountEmail.textContent = data.user.email;
    library.innerHTML = "";

    if (!data.purchases || data.purchases.length === 0) {
      library.innerHTML = '<div class="empty-library">Você ainda não tem eBooks aprovados nesta conta.<br><a href="index.html" style="color:var(--brand);font-weight:800">Ir para a loja</a></div>';
    } else {
      data.purchases.forEach(p => {
        const item = document.createElement("article");
        item.className = "library-item";

        const info = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = p.productName;
        const desc = document.createElement("p");
        const approved = p.approved_at ? new Date(p.approved_at).toLocaleDateString("pt-BR") : "";
        desc.textContent = "Compra aprovada" + (approved ? " em " + approved : "") + " • acesso liberado";
        info.append(title, desc);

        const button = document.createElement("button");
        button.className = "btn";
        button.type = "button";
        button.textContent = "Baixar eBook";
        button.addEventListener("click", async () => {
          button.disabled = true;
          button.textContent = "Gerando acesso...";
          try {
            const download = await accountApi("download", { purchaseId: p.id });
            window.open(download.downloadUrl, "_blank", "noopener");
          } catch (error) {
            alert(error.message);
          } finally {
            button.disabled = false;
            button.textContent = "Baixar eBook";
          }
        });

        item.append(info, button);
        library.appendChild(item);
      });
    }

    if (data.user.role === "admin") {
      adminBox.classList.remove("hidden");
      accountApi("admin-overview").then(overview => {
        document.getElementById("admin-users").textContent = overview.users || 0;
        document.getElementById("admin-sales").textContent = overview.approvedSales || 0;
        document.getElementById("admin-tickets").textContent = overview.supportTickets || 0;
      }).catch(() => {});
    } else {
      adminBox.classList.add("hidden");
    }

    show(accountView);
  }

  async function loadAccount() {
    const data = await accountApi("me");
    renderLibrary(data);
  }

  emailForm.addEventListener("submit", async e => {
    e.preventDefault();
    sendButton.disabled = true;
    sendButton.textContent = "Enviando código...";
    loginMessage.textContent = "";
    loginMessage.classList.remove("error");

    try {
      const data = await sendCode(emailInput.value);
      codeMessage.textContent = data.message || "Código enviado. Confira seu e-mail.";
      codeMessage.classList.remove("error");
    } catch (error) {
      loginMessage.textContent = error.message || "Não foi possível enviar o código.";
      loginMessage.classList.add("error");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Enviar código por e-mail";
    }
  });

  codeForm.addEventListener("submit", async e => {
    e.preventDefault();
    const code = codeInput.value.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      codeMessage.textContent = "Digite os 6 números do código.";
      codeMessage.classList.add("error");
      return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = "Verificando...";
    codeMessage.textContent = "";
    codeMessage.classList.remove("error");

    try {
      const data = await accountApi("verify-code", { email: pendingEmail, code });
      setSessionToken(data.sessionToken);
      sessionStorage.removeItem(EMAIL_KEY);
      renderLibrary(data);
    } catch (error) {
      codeMessage.textContent = error.message || "Código inválido ou expirado.";
      codeMessage.classList.add("error");
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Entrar na minha conta";
    }
  });

  resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    codeMessage.textContent = "Enviando novo código...";
    codeMessage.classList.remove("error");
    try {
      const data = await sendCode(pendingEmail);
      codeMessage.textContent = data.message || "Novo código enviado. Confira seu e-mail.";
    } catch (error) {
      codeMessage.textContent = error.message || "Não foi possível reenviar.";
      codeMessage.classList.add("error");
    } finally {
      resendButton.disabled = false;
    }
  });

  changeEmailButton.addEventListener("click", () => {
    pendingEmail = "";
    sessionStorage.removeItem(EMAIL_KEY);
    show(loginView);
    emailInput.focus();
  });

  logoutButton.addEventListener("click", async () => {
    try { await accountApi("logout"); } catch {}
    setSessionToken("");
    show(loginView);
  });

  (async () => {
    if (getSessionToken()) {
      try {
        await loadAccount();
        return;
      } catch {
        setSessionToken("");
      }
    }

    if (pendingEmail) {
      codeEmail.textContent = pendingEmail;
      show(codeView);
    } else {
      show(loginView);
    }
  })();
})();