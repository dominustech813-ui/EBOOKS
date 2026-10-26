import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { PDFDocument } from "npm:pdf-lib@1.17.1";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const headers = {
  "Access-Control-Allow-Origin": "https://dominustech813-ui.github.io",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Vary": "Origin"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" }
});

async function ownsProduct(userId: string, productId: string) {
  const { data, error } = await db.from("mercadopago_orders").select("id")
    .eq("user_id", userId).eq("product_id", productId)
    .not("approved_at", "is", null).in("status", ["approved", "processed"])
    .limit(1);
  if (error) throw error;
  return Boolean(data?.length);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
    if (!token) return json({ error: "Entre na sua conta para continuar." }, 401);
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "Entre na sua conta para continuar." }, 401);
    const raw = await req.text();
    if (raw.length > 8000) return json({ error: "Solicitação muito grande." }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "Solicitação inválida." }, 400); }
    const productId = String(body?.productId || "");
    if (!productId || productId.length > 160) return json({ error: "Livro inválido." }, 400);
    const { data: product, error } = await db.from("hebooks_products")
      .select("id,title,file_path").eq("id", productId).eq("active", true).maybeSingle();
    if (error) throw error;
    if (!product) return json({ error: "Livro não encontrado." }, 404);

    if (body.action === "preview") {
      const { data: file, error: fileError } = await db.storage.from("ebooks").download(product.file_path);
      if (fileError || !file || file.size > 25 * 1024 * 1024) {
        return json({ error: "A prévia deste livro está indisponível no momento." }, 503);
      }
      const original = await PDFDocument.load(await file.arrayBuffer());
      // Never return the entire book, including books shorter than three pages.
      const count = Math.min(3, original.getPageCount() - 1);
      if (count < 1) return json({ error: "Este livro ainda não tem uma prévia disponível." }, 404);
      const preview = await PDFDocument.create();
      const pages = await preview.copyPages(original, Array.from({ length: count }, (_, i) => i));
      pages.forEach(page => preview.addPage(page));
      preview.setTitle("Amostra — " + product.title);
      return new Response(await preview.save(), { headers: {
        ...headers, "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="amostra.pdf"',
        "X-Content-Type-Options": "nosniff"
      }});
    }
    if (body.action === "reviews") {
      const { data: reviews, count, error: reviewError } = await db.from("hebooks_reviews")
        .select("rating,comment,display_name,created_at", { count: "exact" })
        .eq("product_id", productId).order("created_at", { ascending: false }).limit(20);
      if (reviewError) throw reviewError;
      const { data: ownReview, error: ownError } = await db.from("hebooks_reviews")
        .select("rating,comment,display_name").eq("product_id", productId).eq("user_id", auth.user.id).maybeSingle();
      if (ownError) throw ownError;
      return json({ reviews, count, ownReview, canReview: await ownsProduct(auth.user.id, productId) });
    }
    if (body.action === "save_review") {
      const rating = body.rating;
      const comment = String(body.comment || "").trim();
      const displayName = String(body.displayName || "Leitor(a)").trim();
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 1000 || !displayName || displayName.length > 40) {
        return json({ error: "Escolha de 1 a 5 estrelas, um nome de até 40 caracteres e um comentário de 10 a 1.000 caracteres." }, 400);
      }
      if (!await ownsProduct(auth.user.id, productId)) return json({ error: "Somente quem tem uma compra confirmada deste livro pode avaliar." }, 403);
      const { error: saveError } = await db.from("hebooks_reviews").upsert({
        product_id: productId, user_id: auth.user.id, rating, comment,
        display_name: displayName, updated_at: new Date().toISOString()
      }, { onConflict: "product_id,user_id" });
      if (saveError) throw saveError;
      return json({ ok: true });
    }
    return json({ error: "Ação inválida." }, 400);
  } catch (error) {
    console.error("reader-experience", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Não foi possível concluir. Tente novamente em instantes." }, 500);
  }
});
