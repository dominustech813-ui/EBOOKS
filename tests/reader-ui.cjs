const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
 for (const width of [390,1280]) {
  const page = await browser.newPage({ viewport:{width,height:850} });
  await page.route('https://reader.test/api', async route => {
   const body = route.request().postDataJSON();
   await route.fulfill({json:body.action==='save_review'?{ok:true}:{count:1,canReview:true,reviews:[{rating:4,display_name:'Leitor <script>',comment:'Conteúdo interessante <img src=x onerror=alert(1)>'}],ownReview:null}});
  });
  await page.setContent('<html><body><main id="cards"></main></body></html>');
  await page.addStyleTag({content:fs.readFileSync('styles.css','utf8')});
  await page.addScriptTag({content:fs.readFileSync('reader-experience.js','utf8')});
  await page.evaluate(() => {
   const reader = window.createReaderExperience({client:{auth:{getSession:async()=>({data:{session:{access_token:'test'}}})}},endpoint:'https://reader.test/api',onBuy:()=>window.bought=true});
   reader.addButtons(document.getElementById('cards'),{id:'book',title:'Foco Inabalável'});
  });
  await page.getByRole('button',{name:'Avaliações — Foco Inabalável',exact:true}).click();
  await page.getByText('Compra confirmada',{exact:true}).waitFor();
  assert.equal(await page.locator('.reader-review img,.reader-review script').count(),0);
  await page.getByLabel('Sua nota').selectOption('5');
  await page.getByLabel('O que achou do livro?').fill('Muito bom para organizar minha rotina.');
  await page.getByRole('button',{name:'Salvar avaliação',exact:true}).click();
  await page.getByText('Avaliação salva!',{exact:true}).waitFor();
  const bounds=await page.locator('dialog').boundingBox();assert.ok(bounds.x>=0 && bounds.width<=width);
  await page.screenshot({path:`/workspace/scratch/59438c257edf/reader-${width}.png`});
  await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(el=>el.open),false);
  await page.getByRole('button',{name:'Avaliações — Foco Inabalável',exact:true}).click();
  await page.getByRole('button',{name:'Ver opções de compra',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.bought),true);
  await page.close();console.log(`UI ${width}px: reviews, XSS escaping, save, dialog, checkout callback OK`);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
