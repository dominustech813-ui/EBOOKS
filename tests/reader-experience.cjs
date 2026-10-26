const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const { PDFDocument } = require('pdf-lib');

async function fixture({ pages = 6, owns = false, authenticated = true } = {}) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) pdf.addPage().drawText('Page ' + (i + 1));
  const bytes = await pdf.save();
  const writes = [];
  const db = {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'reader' } : null }, error: null }) },
    storage: { from: () => ({ download: async () => ({ data: new Blob([bytes]) }) }) },
    from(table) {
      const query = {
        select() { return query; }, eq() { return query; }, not() { return query; },
        in(field, values) { assert.deepEqual(Array.from(values), ['approved', 'processed']); return query; },
        order() { return query; }, limit() { return query; },
        maybeSingle() { return query; },
        upsert(value) { writes.push(value); return query; },
        then(resolve, reject) {
          let data = table === 'hebooks_products' ? { id: 'book', title: 'Book', file_path: 'private.pdf' }
            : table === 'mercadopago_orders' ? (owns ? [{ id: 'order' }] : []) : null;
          return Promise.resolve({ data, error: null, count: 0 }).then(resolve, reject);
        }
      }; return query;
    }
  };
  let handler;
  const source = fs.readFileSync('supabase/functions/reader-experience/index.ts', 'utf8').replace(/^import .*;\n/gm, '');
  vm.runInNewContext(stripTypeScriptTypes(source), {
    createClient: () => db, PDFDocument, Deno: { env: { get: () => 'test' }, serve: fn => handler = fn },
    Response, Request, console, Array, Uint8Array, ArrayBuffer, Error
  });
  return { writes, call: (body, token = 'valid') => handler(new Request('https://example.test', {
    method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {}, body: JSON.stringify(body)
  })) };
}

test('anonymous requests fail before returning product content', async () => {
  const f = await fixture(); assert.equal((await f.call({ action: 'preview', productId: 'book' }, '')).status, 401);
});
test('expired session fails', async () => {
  const f = await fixture({ authenticated: false }); assert.equal((await f.call({ action: 'reviews', productId: 'book' })).status, 401);
});
test('sample contains only first three pages', async () => {
  const f = await fixture(); const r = await f.call({ action: 'preview', productId: 'book' });
  assert.equal(r.status, 200); assert.equal(r.headers.get('Content-Type'), 'application/pdf');
  assert.equal((await PDFDocument.load(await r.arrayBuffer())).getPageCount(), 3);
});
test('two-page book exposes only one page; one-page book has no sample', async () => {
  const f = await fixture({ pages: 2 }); const r = await f.call({ action: 'preview', productId: 'book' });
  assert.equal((await PDFDocument.load(await r.arrayBuffer())).getPageCount(), 1);
  const single = await fixture({ pages: 1 }); assert.equal((await single.call({ action: 'preview', productId: 'book' })).status, 404);
});
test('nonbuyer cannot submit reviews', async () => {
  const f = await fixture(); const r = await f.call({ action: 'save_review', productId: 'book', rating: 5, comment: 'Muito bom este livro.' });
  assert.equal(r.status, 403); assert.equal(f.writes.length, 0);
});
test('invalid rating is rejected even for buyer', async () => {
  const f = await fixture({ owns: true }); const r = await f.call({ action: 'save_review', productId: 'book', rating: 6, comment: 'Muito bom este livro.' });
  assert.equal(r.status, 400); assert.equal(f.writes.length, 0);
});
test('review uses authenticated user, never supplied identity', async () => {
  const f = await fixture({ owns: true }); const r = await f.call({ action: 'save_review', productId: 'book', user_id: 'victim', rating: 4, comment: 'Muito bom este livro.' });
  assert.equal(r.status, 200); assert.equal(f.writes[0].user_id, 'reader');
});
