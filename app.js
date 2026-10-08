(() => {
  const config = window.HEBOOKS_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: config.currency || "BRL" });

  const modal = document.getElementById("checkout-modal");
  const buyButton = document.getElementById("buy-button");
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
    [paymentView, botView, successView].forEach(el => el.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  function openModal() {
    show(paymentView);
    paymentMessage.textContent = "";
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
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
  }

  buyButton.addEventListener("click", openModal);
  document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });

  copyPix.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(config.pixPayload);
      copyPix.textContent = "✓ Código Pix copiado";
    } catch {
      pixCode.select();
      document.execCommand("copy");
      copyPix.textContent = "✓ Código Pix copiado";
    }
    setTimeout(() => copyPix.textContent = "Copiar código Pix", 1800);
  });

  paymentDoneButton.addEventListener("click", () => show(botView));
  backToPayment.addEventListener("click", () => show(paymentView));

  async function verifyReceipt(formData) {
    if (!config.receiptVerifierUrl) {
      throw new Error("O verificador seguro ainda está sendo conectado. Seu comprovante não será aprovado automaticamente até o backend ficar ativo.");
    }
    const response = await fetch(config.receiptVerifierUrl, { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Não foi possível validar o comprovante.");
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

    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      botMessage("Envie o comprovante em PDF, PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      botMessage("O comprovante deve ter no máximo 10 MB.");
      return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = "Analisando...";
    botMessage("Recebi o comprovante. Estou conferindo valor, beneficiário, data e identificador da transação...");

    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("productId", config.productId || "");
    formData.append("expectedAmount", String(config.price || ""));
    formData.append("expectedRecipient", config.expectedRecipient || "");
    formData.append("expectedPixKey", config.expectedPixKey || "");

    try {
      const data = await verifyReceipt(formData);
      if (data.approved === true && data.downloadUrl) {
        botMessage("Pagamento aprovado. Os dados obrigatórios conferem.", "ok");
        downloadButton.href = data.downloadUrl;
        setTimeout(() => show(successView), 700);
      } else {
        botMessage((data.reason || "Não consegui confirmar todos os dados do pagamento.") + " O eBook não será liberado.");
      }
    } catch (error) {
      botMessage(error.message);
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Enviar para análise";
    }
  });
})();