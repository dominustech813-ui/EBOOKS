(() => {
  const config = window.HEBOOKS_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: config.currency || "BRL" });

  const modal = document.getElementById("checkout-modal");
  const buyButton = document.getElementById("buy-button");
  const autoView = document.getElementById("auto-checkout-view");
  const paymentView = document.getElementById("payment-view");
  const botView = document.getElementById("receipt-bot-view");
  const successView = document.getElementById("success-view");
  const paymentDoneButton = document.getElementById("payment-done-button");
  const paymentMessage = document.getElementById("payment-message");
  const receiptForm = document.getElementById("receipt-form");
  const verifyButton = document.getElementById("verify-button");
  const backToPayment = document.getElementById("back-to-payment");
  const chatWindow = document.getElementById("chat-window");
  const downloadButton = document.getElementById("download-button");
  const pixCode = document.getElementById("pix-code");
  const copyPix = document.getElementById("copy-pix");
  const supportButton = document.getElementById("support-human-button");
  const supportForm = document.getElementById("support-form");
  const supportProblem = document.getElementById("support-problem");
  const supportSubmit = document.getElementById("support-submit");
  const supportMessage = document.getElementById("support-message");

  const autoForm = document.getElementById("auto-checkout-form");
  const autoName = document.getElementById("auto-buyer-name");
  const autoEmail = document.getElementById("auto-buyer-email");
  const autoGenerate = document.getElementById("auto-generate-pix");
  const autoPixArea = document.getElementById("auto-pix-area");
  const autoPixImage = document.getElementById("auto-pix-image");
  const autoPixCode = document.getElementById("auto-pix-code");
  const autoCopyPix = document.getElementById("auto-copy-pix");
  const autoStatus = document.getElementById("auto-payment-status");
  const autoCheckStatus = document.getElementById("auto-check-status");
  const autoSupportButton = document.getElementById("auto-support-button");

  let automaticPayments = false;
  let checkoutToken = "";
  let pollTimer = null;
  let pollCount = 0;

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("product-price").textContent = money.format(config.price || 0);
  pixCode.value = config.pixPayload || "";

  if (window.QRCode && config.pixPayload) {
    new QRCode(document.getElementById("pix-qr"), {
      text: config.pixPayload,
      width: 230,
      height: 230,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function show(view) {
    [autoView, paymentView, botView, successView].forEach(el => {
      if (el) el.classList.add("hidden");
    });
    if (view) view.classList.remove("hidden");
  }

  async function checkoutApi(payload) {
    if (!config.checkoutApiUrl) throw new Error("Checkout automático indisponível.");
    const response = await fetch(config.checkoutApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Não foi possível processar o pagamento.");
      error.data = data;
      throw error;
    }
    return data;
  }

  async function refreshCheckoutMode() {
    try {
      const data = await checkoutApi({ action: "config" });
      automaticPayments = data.automaticPayments === true;
    } catch {
      automaticPayments = false;
    }
    return automaticPayments;
  }

  async function openModal() {
    paymentMessage.textContent = "";
    checkoutToken = "";
    pollCount = 0;
    clearTimeout(pollTimer);
    if (autoPixArea) autoPixArea.classList.add("hidden");
    if (autoStatus) autoStatus.textContent = "Aguardando pagamento...";
    if (autoForm) autoForm.reset();

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const isAutomatic = await refreshCheckoutMode();
    show(isAutomatic && autoView ? autoView : paymentView);
  }

  function closeModal() {
    clearTimeout(pollTimer);
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function botMessage(text, kind = "bot") {
    const wrap = document.createElement("div");
    wrap.className = "chat-message " + kind;
    const avatar = document.createElement("span");
    avatar.className = "chat-avatar";
    avatar.textContent = kind === "ok" ? "✓" : "H";
    const body = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = kind === "ok" ? "Verificação" : "Bot H ebooks";
    const p = document.createElement("p");
    p.textContent = text;
    body.append(strong, p);
    wrap.append(avatar, body);
    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return p;
  }

  async function copyValue(value, button, input, normalLabel) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      input.select();
      document.execCommand("copy");
    }
    button.textContent = "✓ Código Pix copiado";
    setTimeout(() => button.textContent = normalLabel, 1800);
  }

  async function checkAutomaticPayment(scheduleNext = false) {
    if (!checkoutToken) return;
    try {
      const data = await checkoutApi({ action: "status", checkoutToken });

      if (data.approved === true && data.downloadUrl) {
        clearTimeout(pollTimer);
        autoStatus.textContent = "✓ Pagamento confirmado pelo Mercado Pago. Liberando seu eBook...";
        downloadButton.href = data.downloadUrl;
        setTimeout(() => show(successView), 500);
        return;
      }

      autoStatus.textContent = "Aguardando confirmação do Mercado Pago...";
      if (data.status === "action_required") {
        autoStatus.textContent = "Pix gerado. Aguardando o pagamento...";
      }

      if (scheduleNext && pollCount < 225 && modal.classList.contains("active")) {
        pollCount++;
        pollTimer = setTimeout(() => checkAutomaticPayment(true), 4000);
      }
    } catch (error) {
      autoStatus.textContent = error.message || "Não foi possível consultar o pagamento.";
    }
  }

  if (autoForm) {
    autoForm.addEventListener("submit", async e => {
      e.preventDefault();
      const name = autoName.value.trim();
      const email = autoEmail.value.trim();

      autoGenerate.disabled = true;
      autoGenerate.textContent = "Gerando Pix...";
      autoStatus.textContent = "";

      try {
        const data = await checkoutApi({ action: "create", name, email });
        checkoutToken = data.checkoutToken || "";
        autoPixCode.value = data.qrCode || "";
        if (data.qrCodeBase64) {
          autoPixImage.src = "data:image/png;base64," + data.qrCodeBase64;
          autoPixImage.style.display = "";
        } else {
          autoPixImage.style.display = "none";
        }
        autoPixArea.classList.remove("hidden");
        autoStatus.textContent = "Pix gerado. Aguardando o pagamento...";
        pollCount = 0;
        clearTimeout(pollTimer);
        pollTimer = setTimeout(() => checkAutomaticPayment(true), 2500);
      } catch (error) {
        autoStatus.textContent = error.message || "Não foi possível gerar o Pix.";
        autoPixArea.classList.remove("hidden");
      } finally {
        autoGenerate.disabled = false;
        autoGenerate.textContent = "Gerar novo Pix de R$ 29,90";
      }
    });

    autoCopyPix.addEventListener("click", () => {
      if (autoPixCode.value) copyValue(autoPixCode.value, autoCopyPix, autoPixCode, "Copiar código Pix");
    });

    autoCheckStatus.addEventListener("click", () => checkAutomaticPayment(false));

    autoSupportButton.addEventListener("click", () => {
      document.getElementById("buyer-name").value = autoName.value.trim();
      document.getElementById("buyer-email").value = autoEmail.value.trim();
      receiptForm.style.display = "none";
      supportForm.classList.remove("hidden");
      if (!supportProblem.value) supportProblem.value = "Tive um problema com o pagamento automático via Pix.";
      show(botView);
    });
  }

  buyButton.addEventListener("click", openModal);
  document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });

  copyPix.addEventListener("click", () => {
    copyValue(config.pixPayload || "", copyPix, pixCode, "Copiar código Pix");
  });

  paymentDoneButton.addEventListener("click", () => {
    receiptForm.style.display = "";
    show(botView);
  });

  supportButton.addEventListener("click", () => {
    supportForm.classList.toggle("hidden");
    if (!supportForm.classList.contains("hidden")) supportProblem.focus();
  });

  async function supportApi(payload) {
    const response = await fetch(config.supportApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Não foi possível abrir o chamado.");
    return data;
  }

  supportForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("buyer-name").value.trim() || autoName?.value.trim() || "";
    const email = document.getElementById("buyer-email").value.trim() || autoEmail?.value.trim() || "";
    const problem = supportProblem.value.trim();

    if (!name || !email || problem.length < 5) {
      supportMessage.textContent = "Preencha nome, e-mail e descreva o problema.";
      supportMessage.classList.add("error");
      return;
    }

    supportSubmit.disabled = true;
    supportSubmit.textContent = "Abrindo chamado...";
    supportMessage.textContent = "";
    supportMessage.classList.remove("error");

    try {
      const data = await supportApi({ action: "create-ticket", name, email, problem });
      supportMessage.innerHTML = "Chamado <strong>" + data.ticketCode + "</strong> aberto com sucesso. Guarde esse número.";
      supportSubmit.disabled = true;
      supportSubmit.textContent = "Chamado aberto";
    } catch (error) {
      supportMessage.textContent = error.message;
      supportMessage.classList.add("error");
      supportSubmit.disabled = false;
      supportSubmit.textContent = "Abrir chamado";
    }
  });

  backToPayment.addEventListener("click", async () => {
    receiptForm.style.display = "";
    show(automaticPayments && autoView ? autoView : paymentView);
  });

  async function sha256(file) {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function readReceipt(file, progressElement) {
    if (!window.Tesseract) throw new Error("O leitor do comprovante não carregou. Atualize a página e tente novamente.");
    const result = await Tesseract.recognize(file, "por", {
      logger: m => {
        if (m.status === "recognizing text") {
          const pct = Math.max(1, Math.round((m.progress || 0) * 100));
          progressElement.textContent = "Lendo o comprovante... " + pct + "%";
        }
      }
    });
    return result?.data?.text || "";
  }

  async function verifyReceipt(payload) {
    if (!config.receiptVerifierUrl) throw new Error("O verificador seguro ainda não está configurado.");
    const response = await fetch(config.receiptVerifierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.reason || data.error || "Não foi possível validar o comprovante.");
    return data;
  }

  receiptForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("buyer-name").value.trim();
    const email = document.getElementById("buyer-email").value.trim();
    const file = document.getElementById("receipt-file").files[0];

    if (!name || !email || !file) {
      botMessage("Preencha seu nome, e-mail e envie o comprovante para continuar.");
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      botMessage("Para a análise automática, envie uma imagem PNG, JPG ou WEBP do comprovante.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      botMessage("O comprovante deve ter no máximo 10 MB.");
      return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = "Analisando...";
    const progress = botMessage("Preparando a leitura do comprovante...");

    try {
      const [receiptHash, ocrText] = await Promise.all([sha256(file), readReceipt(file, progress)]);
      progress.textContent = "Leitura concluída. Conferindo os dados do comprovante...";

      const data = await verifyReceipt({ name, email, receiptHash, ocrText });

      if (data.approved === true && data.downloadUrl) {
        botMessage("Comprovante aprovado na análise automática.", "ok");
        downloadButton.href = data.downloadUrl;
        setTimeout(() => show(successView), 700);
      } else {
        const reason = data.reason || "Não consegui confirmar todos os dados do pagamento.";
        botMessage(reason + " O eBook não será liberado.");
        supportForm.classList.remove("hidden");
        if (!supportProblem.value) supportProblem.value = reason;
      }
    } catch (error) {
      const reason = error.message || "Falha ao analisar o comprovante.";
      botMessage(reason);
      supportForm.classList.remove("hidden");
      if (!supportProblem.value) supportProblem.value = reason;
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Enviar para análise";
    }
  });

  refreshCheckoutMode();
})();