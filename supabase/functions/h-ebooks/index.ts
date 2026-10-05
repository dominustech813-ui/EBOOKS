import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const PRODUCT_ID = "atividades-fisicas-guia";
const PRODUCT_NAME = "Atividades Físicas: Guia Definitivo para Escolher a Melhor para Você";
const PRODUCT_PRICE = Number(Deno.env.get("PRODUCT_PRICE") || "29.90");
const EBOOK_BUCKET = Deno.env.get("EBOOK_BUCKET") || "ebooks";
const EBOOK_FILE = Deno.env.get("EBOOK_FILE") || "atividades-fisicas-guia.pdf";
const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") || "https://api.asaas.com/v3";
const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY") || "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function onlyDigits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function todayBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function asaas(path: string, options: RequestInit = {}) {
  if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY não configurada.");

  const response = await fetch(ASAAS_API_URL + path, {
    ...options,
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "access_token": ASAAS_API_KEY,
      "User-Agent": "H-ebooks/1.0",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = data?.errors?.map((e: { description?: string }) => e.description).filter(Boolean).join(" | ");
    throw new Error(details || data?.message || "Erro ao comunicar com o provedor de pagamento.");
  }
  return data;
}

async function signedDownloadUrl() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) throw new Error("Supabase Storage não configurado.");

  const client = createClient(supabaseUrl, serviceRole);
  const { data, error } = await client.storage.from(EBOOK_BUCKET).createSignedUrl(EBOOK_FILE, 900);

  if (error || !data?.signedUrl) throw new Error("Não foi possível gerar o link seguro do eBook.");
  return data.signedUrl;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "create-payment") {
      const name = String(body?.name || "").trim();
      const email = String(body?.email || "").trim().toLowerCase();
      const cpfCnpj = onlyDigits(body?.cpfCnpj);
      const productId = String(body?.productId || "");

      if (productId !== PRODUCT_ID) return json({ error: "Produto inválido." }, 400);
      if (name.length < 3) return json({ error: "Informe seu nome completo." }, 400);
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, 400);
      if (![11, 14].includes(cpfCnpj.length)) return json({ error: "Informe um CPF/CNPJ válido." }, 400);

      const orderId = crypto.randomUUID();

      const customer = await asaas("/customers", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          cpfCnpj,
          externalReference: "h-ebooks-customer:" + orderId,
          notificationDisabled: true
        })
      });

      const payment = await asaas("/payments", {
        method: "POST",
        body: JSON.stringify({
          customer: customer.id,
          billingType: "PIX",
          value: PRODUCT_PRICE,
          dueDate: todayBrazil(),
          description: PRODUCT_NAME,
          externalReference: "h-ebooks:" + orderId
        })
      });

      const pix = await asaas("/payments/" + encodeURIComponent(payment.id) + "/pixQrCode", {
        method: "GET"
      });

      return json({
        paymentId: payment.id,
        amount: PRODUCT_PRICE,
        status: payment.status,
        encodedImage: pix.encodedImage,
        payload: pix.payload,
        expirationDate: pix.expirationDate
      });
    }

    if (action === "status") {
      const paymentId = String(body?.paymentId || "").trim();
      if (!paymentId.startsWith("pay_")) return json({ error: "Pagamento inválido." }, 400);

      const payment = await asaas("/payments/" + encodeURIComponent(paymentId), { method: "GET" });

      const reference = String(payment?.externalReference || "");
      const amount = Number(payment?.value || 0);
      const isOurProduct = reference.startsWith("h-ebooks:") && Math.abs(amount - PRODUCT_PRICE) < 0.001;
      if (!isOurProduct) return json({ error: "Pagamento não pertence a este produto." }, 403);

      const paid = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(String(payment.status));
      let downloadUrl = null;

      if (paid) {
        downloadUrl = await signedDownloadUrl();
      }

      return json({
        status: payment.status,
        paid,
        downloadUrl
      });
    }

    return json({ error: "Ação inválida." }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Erro interno." }, 500);
  }
});
