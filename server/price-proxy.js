'use strict';
/* =============================================================
   Bytes For Gaming — Standalone price proxy
   A tiny zero-dependency HTTP server (Node 18+) that the static
   site can call for live prices. Keeps your API key server-side.

   Run:
     SERPAPI_KEY=xxxx node server/price-proxy.js     # real prices
     node server/price-proxy.js                       # mock mode

   Then enable it on the site (About page) with:
     http://localhost:8787/prices
   ============================================================= */

var http = require('http');
var url = require('url');
var fetchPrices = require('./lib/price-core').fetchPrices;

var PORT = process.env.PORT || 8787;
var KEY = process.env.SERPAPI_KEY || '';
var PROVIDER = process.env.PRICE_PROVIDER || (KEY ? 'serpapi' : 'mock');
var TTL = (Number(process.env.CACHE_TTL_MIN) || 30) * 60 * 1000;
var ORIGIN = process.env.CORS_ORIGIN || '*';

var cache = new Map();

function send(res, status, obj, extraHeaders) {
  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (extraHeaders) for (var k in extraHeaders) headers[k] = extraHeaders[k];
  res.writeHead(status, headers);
  res.end(JSON.stringify(obj));
}

var server = http.createServer(async function (req, res) {
  var parsed = url.parse(req.url, true);

  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (parsed.pathname === '/health') return send(res, 200, { ok: true, provider: PROVIDER });
  if (parsed.pathname !== '/prices' && parsed.pathname !== '/') {
    return send(res, 404, { error: 'not found' });
  }

  var q = parsed.query.q;
  if (!q) return send(res, 400, { error: 'missing query parameter: q' });

  var ckey = PROVIDER + '|' + q;
  var hit = cache.get(ckey);
  if (hit && Date.now() - hit.ts < TTL) {
    return send(res, 200, hit.data, { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=1800' });
  }

  try {
    var data = await fetchPrices({
      q: q, brand: parsed.query.brand, category: parsed.query.category,
      provider: PROVIDER, key: KEY
    });
    cache.set(ckey, { ts: Date.now(), data: data });
    send(res, 200, data, { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=1800' });
  } catch (e) {
    send(res, 502, { error: String(e && e.message || e) });
  }
});

server.listen(PORT, function () {
  console.log('[bytes-for-gaming] price proxy listening on http://localhost:' + PORT +
    '  (provider=' + PROVIDER + (PROVIDER === 'mock' ? ', no key needed' : '') + ')');
});
