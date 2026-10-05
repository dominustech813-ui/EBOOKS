(() => {
  const config = window.HEBOOKS_CONFIG || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: config.currency || "BRL" });

  const modal = document.getElementById("checkout-modal");
  const buyButton = document.getElementById("buy-button");
  const form = document.getElementById("checkout-form");
  const formMessage = document.getElementById("form-message");
  const formView = document.getElementById("checkout-form-view");
  const pixView = document.getElementById("pix-view");
  const successView = document.getElementById("success-view");
  const qrImage = document.getElementById("qr-image");
  const pixCode = document.getElementById("pix-code");
  const copyPix = document.getElementById("copy-pix");
  const generatePix = document.getElementById("generate-pix");
  const statusText = document.getElementById("payment-status-text");
  const downloadButton = document.getElementById("download-button");

  let currentPaymentId = null;
  let pollTimer = null;

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("product-price").textContent = money.format(config.price || 0);
  document.getElementById("checkout-price").textContent = money.format(config.price || 0);

  function openModal() {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function show(view) {
    [formView, pixView, successView].forEach(el => el.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  function setMessage(message, isError = false) {
    formMessage.textContent = message || "";
    formMessage.classList.toggle("error", isError);
  }

  function normalizeDocument(value) {
    return String(value || "").replace(/\D/g, "");
  }

  async function api(payload) {
    if (!config.apiUrl) {
      throw new Error("A integração Pix ainda não foi conectada. Configure a URL da API no arquivo config.js.");
    }

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Não foi possível concluir a operação.");
    }
    return data;
  }

  async function checkPayment() {
    if (!currentPaymentId) return;

    try {
      const data = await api({ action: "status", paymentId: currentPaymentId });
      const paidStatuses = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];

      if (paidStatuses.includes(data.status)) {
        clearInterval(pollTimer);
        pollTimer = null;
        statusText.textContent = "Pagamento confirmado!";
        if (data.downloadUrl) {
          downloadButton.href = data.downloadUrl;
          show(successView);
        } else {
          statusText.textContent = "Pagamento confirmado. Preparando seu acesso...";
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  buyButton.addEventListener("click", openModal);

  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("active")) closeModal();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("");

    const name = document.getElementById("customer-name").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const cpfCnpj = normalizeDocument(document.getElementById("customer-document").value);

    if (!name || !email || ![11, 14].includes(cpfCnpj.length)) {
      setMessage("Preencha nome, e-mail e um CPF/CNPJ válido para continuar.", true);
      return;
    }

    generatePix.disabled = true;
    generatePix.textContent = "Gerando Pix...";

    try {
      const data = await api({
        action: "create-payment",
        productId: config.productId,
        name,
        email,
        cpfCnpj
      });

      currentPaymentId = data.paymentId;
      qrImage.src = data.encodedImage.startsWith("data:")
        ? data.encodedImage
        : "data:image/png;base64," + data.encodedImage;
      pixCode.value = data.payload || "";
      show(pixView);

      clearInterval(pollTimer);
      pollTimer = setInterval(checkPayment, Number(config.paymentPollMs) || 5000);
      checkPayment();
    } catch (error) {
      setMessage(error.message, true);
    } finally {
      generatePix.disabled = false;
      generatePix.textContent = "Gerar QR Code Pix";
    }
  });

  copyPix.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pixCode.value);
      copyPix.textContent = "Copiado!";
      setTimeout(() => (copyPix.textContent = "Copiar"), 1600);
    } catch {
      pixCode.select();
      document.execCommand("copy");
    }
  });
})();
