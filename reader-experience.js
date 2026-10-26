/* Reader tools share the store's existing session and checkout. */
window.createReaderExperience = function ({ client, endpoint, onBuy }) {
  const dialog = document.createElement("dialog");
  dialog.className = "reader-dialog";
  dialog.setAttribute("aria-labelledby", "reader-title");
  dialog.innerHTML = `<div class="reader-heading"><span class="eyebrow">EXPLORE SEU PRÓXIMO LIVRO</span><button type="button" class="reader-close" aria-label="Fechar">×</button></div>
    <h2 id="reader-title"></h2><p class="reader-description"></p>
    <div class="reader-content" aria-live="polite"></div><button type="button" class="btn reader-buy">Ver opções de compra</button>`;
  document.body.appendChild(dialog);
  const content = dialog.querySelector(".reader-content");
  const buy = dialog.querySelector(".reader-buy");
  let currentProduct, currentView, requestId = 0, objectUrl = "";
  const node = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  function revokePreview() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  }
  dialog.querySelector(".reader-close").onclick = () => dialog.close();
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { requestId++; revokePreview(); content.replaceChildren(); });
  buy.onclick = () => { const product = currentProduct; dialog.close(); onBuy(product); };

  async function request(action, productId, extra = {}) {
    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) throw new Error("Entre novamente na sua conta para continuar.");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ ...extra, action, productId })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Não foi possível carregar. Tente novamente.");
    }
    return action === "preview" ? response.blob() : response.json();
  }

  async function open(product, view) {
    currentProduct = product;
    currentView = view;
    revokePreview();
    const id = ++requestId;
    dialog.querySelector("h2").textContent = product.title;
    dialog.querySelector(".reader-description").textContent = view === "preview"
      ? "Leia até 3 páginas de amostra antes de escolher. O livro completo é liberado após a compra."
      : "Opiniões de leitores com compra confirmada. As avaliações mais recentes aparecem primeiro.";
    content.replaceChildren(node("p", "Carregando…", "reader-status"));
    if (!dialog.open) dialog.showModal();
    try {
      const data = await request(view, product.id);
      if (id !== requestId || !dialog.open) return;
      content.replaceChildren();
      if (view === "preview") {
        objectUrl = URL.createObjectURL(data);
        const link = node("a", "Abrir ou baixar a amostra", "btn btn-ghost");
        link.href = objectUrl; link.target = "_blank"; link.rel = "noopener";
        const frame = node("iframe");
        frame.title = "Amostra de " + product.title;
        frame.src = objectUrl;
        content.append(link, node("p", "Se o leitor não aparecer no celular, use o botão acima."), frame);
      } else {
        renderReviews(data, product, id);
      }
    } catch (error) {
      if (id !== requestId || !dialog.open) return;
      const retry = node("button", "Tentar novamente", "btn btn-ghost");
      retry.type = "button"; retry.onclick = () => open(product, view);
      content.replaceChildren(node("p", error.message, "reader-error"), retry);
    }
  }

  function renderReviews(data, product, id) {
    content.append(node("h3", data.count ? `${data.count} avaliação(ões)` : "Ainda não há avaliações"));
    (data.reviews || []).forEach(review => {
      const article = node("article", undefined, "reader-review");
      const rating = node("span", "★".repeat(review.rating) + "☆".repeat(5 - review.rating), "reader-stars");
      rating.setAttribute("aria-label", review.rating + " de 5 estrelas");
      article.append(rating, node("strong", review.display_name), node("small", "Compra confirmada"), node("p", review.comment));
      content.append(article);
    });
    if (data.count > 20) content.append(node("p", "Exibindo as 20 avaliações mais recentes."));
    if (!data.canReview) {
      content.append(node("p", "Após comprar este livro, você poderá deixar sua avaliação.", "reader-status"));
      return;
    }
    const form = document.createElement("form");
    form.className = "reader-review-form";
    form.innerHTML = `<h3>Sua avaliação</h3>
      <label>Nome público ou apelido<input name="displayName" maxlength="40" required autocomplete="nickname" value="Leitor(a)"></label>
      <label>Sua nota<select name="rating" required><option value="">Escolha</option><option value="5">5 — Excelente</option><option value="4">4 — Muito bom</option><option value="3">3 — Bom</option><option value="2">2 — Regular</option><option value="1">1 — Ruim</option></select></label>
      <label>O que achou do livro?<textarea name="comment" minlength="10" maxlength="1000" rows="4" required placeholder="Conte sua experiência (10 a 1.000 caracteres)"></textarea></label>
      <p>Seu nome público e comentário aparecerão na loja. Não inclua e-mail, telefone ou outros dados pessoais.</p>
      <button class="btn" type="submit">Salvar avaliação</button><p role="status" class="reader-save-status"></p>`;
    if (data.ownReview) {
      form.elements.displayName.value = data.ownReview.display_name;
      form.elements.rating.value = data.ownReview.rating;
      form.elements.comment.value = data.ownReview.comment;
    }
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const submit = form.querySelector("button");
      const status = form.querySelector(".reader-save-status");
      submit.disabled = true; status.textContent = "Salvando…";
      try {
        await request("save_review", product.id, {
          rating: Number(form.elements.rating.value),
          comment: form.elements.comment.value.trim(), displayName: form.elements.displayName.value.trim()
        });
        if (id === requestId && dialog.open) {
          await open(product, "reviews");
          content.prepend(node("p", "Avaliação salva!", "reader-status"));
        }
      } catch (error) { status.textContent = error.message; }
      finally { submit.disabled = false; }
    });
    content.append(form);
  }

  return {
    addButtons(container, product) {
      const row = node("div", undefined, "reader-actions");
      [["preview", "Ler amostra"], ["reviews", "Avaliações"]].forEach(([view, label]) => {
        const button = node("button", label, "btn btn-ghost btn-small");
        button.type = "button";
        button.setAttribute("aria-label", label + " — " + product.title);
        button.onclick = () => open(product, view);
        row.append(button);
      });
      container.append(row);
    }
  };
};
