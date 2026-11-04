import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const U=Deno.env.get("SUPABASE_URL")!;
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BASE="https://lojahebooks.com.br/";
const ORIGIN="https://dominustech813-ui.github.io";
const db=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});

function cors(req:Request){
  const o=req.headers.get("origin")||"";
  return {
    "Access-Control-Allow-Origin":[ORIGIN,"https://lojahebooks.com.br","https://www.lojahebooks.com.br"].includes(o)?o:"https://lojahebooks.com.br",
    "Access-Control-Allow-Headers":"content-type",
    "Access-Control-Allow-Methods":"POST,OPTIONS",
    "Content-Type":"application/json; charset=utf-8",
    "Vary":"Origin"
  };
}
function json(req:Request,b:any,s=200){return new Response(JSON.stringify(b),{status:s,headers:cors(req)})}
async function secret(){
  const {data}=await db.rpc("hebooks_get_private_secret",{p_name:"mp_prod_access_token"});
  return typeof data==="string"?data:"";
}
async function enabled(){
  const {data}=await db.from("hebooks_settings").select("mp_production_enabled").eq("id",true).maybeSingle();
  return data?.mp_production_enabled===true;
}
async function product(id:string){
  const {data}=await db.from("hebooks_products")
    .select("id,title,subtitle,price,file_path,active")
    .eq("id",id).eq("active",true).maybeSingle();
  return data||null;
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"Método não permitido."},405);

  try{
    if(!(await enabled()))return json(req,{error:"Pagamentos em produção estão desativados."},503);
    const body=await req.json().catch(()=>({}));
    const action=String(body?.action||"");
    const token=await secret();
    if(!token)return json(req,{error:"Produção do Mercado Pago não configurada."},503);

    if(action==="create"){
      const productId=String(body?.productId||"").trim();
      const prod=await product(productId);
      if(!prod)return json(req,{error:"eBook não encontrado."},404);

      const name=String(body?.name||"").trim().replace(/\s+/g," ").slice(0,120);
      const email=String(body?.email||"").trim().toLowerCase().slice(0,180);
      if(name.length<3||!/^\S+@\S+\.\S+$/.test(email))return json(req,{error:"Informe nome e e-mail válidos."},400);

      const since=new Date(Date.now()-15*60*1000).toISOString();
      const {count}=await db.from("mercadopago_orders").select("*",{count:"exact",head:true}).eq("buyer_email",email).gte("created_at",since);
      if((count||0)>=6)return json(req,{error:"Muitas tentativas em pouco tempo. Aguarde alguns minutos."},429);

      const price=Number(prod.price);
      const checkoutToken=crypto.randomUUID();
      const externalReference="HEB-CARD-"+crypto.randomUUID();
      const ret=(result:string)=>BASE+"?card_return="+encodeURIComponent(checkoutToken)+"&card_result="+result;

      const prefBody={
        items:[{
          id:productId,
          title:prod.title,
          description:prod.subtitle||"eBook digital H ebooks",
          currency_id:"BRL",
          quantity:1,
          unit_price:price
        }],
        payer:{name,email},
        external_reference:externalReference,
        back_urls:{success:ret("success"),pending:ret("pending"),failure:ret("failure")},
        auto_return:"approved",
        statement_descriptor:"H EBOOKS"
      };

      const r=await fetch("https://api.mercadopago.com/checkout/preferences",{
        method:"POST",
        headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
        body:JSON.stringify(prefBody)
      });
      const p=await r.json().catch(()=>({}));
      if(!r.ok){
        console.error("MP preference create error",r.status,p?.message||p?.error||"unknown");
        return json(req,{error:p?.message||"Não foi possível abrir o pagamento com cartão."},502);
      }

      const {error}=await db.from("mercadopago_orders").insert({
        checkout_token:checkoutToken,
        external_reference:externalReference,
        buyer_name:name,
        buyer_email:email,
        amount:price,
        status:"created",
        status_detail:"checkout_pro",
        live_mode:true,
        payment_method:"checkout_pro",
        payment_type:"credit_card",
        preference_id:String(p?.id||""),
        product_id:productId
      });
      if(error)return json(req,{error:"Não foi possível registrar a compra."},500);

      return json(req,{ok:true,productId,productName:prod.title,price,checkoutToken,preferenceId:p?.id||null,checkoutUrl:p?.init_point||null});
    }

    if(action==="status"){
      const checkoutToken=String(body?.checkoutToken||"").trim();
      if(!/^[0-9a-f-]{36}$/i.test(checkoutToken))return json(req,{error:"Compra inválida."},400);

      const {data:row}=await db.from("mercadopago_orders").select("*").eq("checkout_token",checkoutToken).maybeSingle();
      if(!row)return json(req,{error:"Compra não encontrada."},404);

      const prod=await product(row.product_id||"atividades-fisicas-guia");
      if(!prod)return json(req,{error:"eBook não encontrado."},404);

      if(row.approved_at&&(row.status==="approved"||row.status==="processed")&&row.status_detail==="accredited"){
        return json(req,{ok:true,approved:true,requiresAccount:true,productId:prod.id,productName:prod.title,buyerEmail:row.buyer_email,status:row.status,statusDetail:row.status_detail});
      }

      const u=new URL("https://api.mercadopago.com/v1/payments/search");
      u.searchParams.set("sort","date_created");
      u.searchParams.set("criteria","desc");
      u.searchParams.set("external_reference",row.external_reference);
      u.searchParams.set("range","date_created");
      u.searchParams.set("begin_date","NOW-1DAYS");
      u.searchParams.set("end_date","NOW");

      const r=await fetch(u.toString(),{headers:{Authorization:"Bearer "+token,Accept:"application/json"}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)return json(req,{error:"Não foi possível consultar o pagamento."},502);

      const results=Array.isArray(d?.results)?d.results:[];
      const amount=Number(row.amount);
      const pay=results.find((x:any)=>String(x?.external_reference||"")===row.external_reference&&Math.abs(Number(x?.transaction_amount||0)-amount)<0.001)||results[0]||null;
      if(!pay)return json(req,{ok:true,approved:false,productId:prod.id,status:"waiting_payment"});

      const ok=pay?.status==="approved"&&pay?.status_detail==="accredited"&&Math.abs(Number(pay?.transaction_amount||0)-amount)<0.001;
      const now=new Date();
      const up:any={
        payment_id:String(pay?.id||""),
        status:String(pay?.status||""),
        status_detail:String(pay?.status_detail||""),
        updated_at:now.toISOString()
      };
      if(ok&&!row.approved_at){up.approved_at=now.toISOString();up.access_until=null;}
      await db.from("mercadopago_orders").update(up).eq("id",row.id);

      if(!ok)return json(req,{ok:true,approved:false,productId:prod.id,status:pay?.status||null,statusDetail:pay?.status_detail||null});

      return json(req,{ok:true,approved:true,requiresAccount:true,productId:prod.id,productName:prod.title,buyerEmail:row.buyer_email,status:pay.status,statusDetail:pay.status_detail});
    }

    return json(req,{error:"Ação inválida."},400);
  }catch(e){
    console.error(e);
    return json(req,{error:"Erro interno no pagamento."},500);
  }
});
