import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve((req) => {
  const origin = req.headers.get("origin") || "";
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ["https://lojahebooks.com.br", "https://www.lojahebooks.com.br", "https://dominustech813-ui.github.io"].includes(origin) ? origin : "https://lojahebooks.com.br",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Vary": "Origin"
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  return new Response(JSON.stringify({ error: "Entre na sua conta H ebooks para acessar este eBook." }), { status: 410, headers });
});

