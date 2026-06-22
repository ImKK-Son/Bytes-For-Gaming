'use strict';
/* =============================================================
   Bytes For Gaming — Price API core
   Provider-agnostic: given a product query, return normalized
   multi-retailer offers (+ a product image when available).

   Providers:
     - "serpapi" : real live prices via SerpApi Google Shopping
                   (free tier: https://serpapi.com — set SERPAPI_KEY)
     - "mock"    : deterministic synthetic data, NO key required,
                   so the whole live pipeline is testable/demoable.

   Used by the standalone server, the Vercel function, and the
   Netlify function. Requires Node 18+ (global fetch).
   ============================================================= */

/* ---- helpers ---- */
function parsePrice(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    var m = v.replace(/[, ]/g, '').match(/([0-9]+(\.[0-9]+)?)/);
    if (m) return parseFloat(m[1]);
  }
  return NaN;
}
function round2(n) { return Math.round(n * 100) / 100; }
function hash(s) {
  var h = 0;
  s = String(s || '');
  for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
  return h;
}
// canonical retailer display name from a free-text source
function canonRetailer(name) {
  var n = String(name || '').toLowerCase();
  if (n.indexOf('amazon') !== -1) return 'Amazon';
  if (n.indexOf('best buy') !== -1 || n.indexOf('bestbuy') !== -1) return 'Best Buy';
  if (n.indexOf('walmart') !== -1) return 'Walmart';
  if (n.indexOf('newegg') !== -1) return 'Newegg';
  return name || 'Other store';
}
function searchUrl(retailer, q) {
  var e = encodeURIComponent(q);
  switch (canonRetailer(retailer)) {
    case 'Amazon':   return 'https://www.amazon.com/s?k=' + e;
    case 'Best Buy': return 'https://www.bestbuy.com/site/searchpage.jsp?st=' + e;
    case 'Walmart':  return 'https://www.walmart.com/search?q=' + e;
    case 'Newegg':   return 'https://www.newegg.com/p/pl?d=' + e;
    default:         return 'https://www.google.com/search?tbm=shop&q=' + e;
  }
}
// keep the cheapest offer per retailer, sorted cheapest first, capped
function dedupe(offers, cap) {
  var best = {};
  offers.forEach(function (o) {
    var k = canonRetailer(o.name);
    if (!best[k] || o.price < best[k].price) best[k] = { name: k, price: o.price, url: o.url };
  });
  return Object.keys(best)
    .map(function (k) { return best[k]; })
    .sort(function (a, b) { return a.price - b.price; })
    .slice(0, cap || 6);
}

/* ---- provider: SerpApi Google Shopping ---- */
async function serpapiProvider(opts) {
  if (!opts.key) throw new Error('SERPAPI_KEY is not set');
  var url = 'https://serpapi.com/search.json?engine=google_shopping&hl=en&gl=us&num=20' +
    '&q=' + encodeURIComponent(opts.q) + '&api_key=' + encodeURIComponent(opts.key);
  var res = await fetch(url);
  if (!res.ok) throw new Error('SerpApi HTTP ' + res.status);
  var data = await res.json();
  if (data.error) throw new Error('SerpApi: ' + data.error);
  var items = data.shopping_results || [];
  var image = null;
  var offers = [];
  items.forEach(function (it) {
    if (!image && it.thumbnail) image = it.thumbnail;
    var price = parsePrice(it.extracted_price != null ? it.extracted_price : it.price);
    var link = it.link || it.product_link;
    if (!isNaN(price) && price > 0 && link) {
      offers.push({ name: it.source || '', price: round2(price), url: link });
    }
  });
  return { source: 'serpapi', image: image, offers: dedupe(offers, 6) };
}

/* ---- provider: mock (no key) ---- */
function mockProvider(opts) {
  var h = hash(opts.q);
  var base = 40 + (h % 130); // 40..169
  var plan = [
    { name: 'Amazon.com', mult: 1.00 },
    { name: 'Best Buy',   mult: 1.04 },
    { name: 'Walmart',    mult: 0.96 },
    { name: 'Newegg',     mult: 1.02 }
  ];
  var offers = plan.map(function (r, i) {
    var jitter = ((h >> (i * 2)) % 7) - 3;
    var price = round2(base * r.mult + jitter);
    return { name: r.name, price: price, url: searchUrl(r.name, opts.q) };
  }).filter(function (o) { return o.price > 0; });
  return Promise.resolve({ source: 'mock', image: null, offers: dedupe(offers, 6) });
}

/* ---- entry point ---- */
async function fetchPrices(opts) {
  opts = opts || {};
  if (!opts.q) throw new Error('missing query (q)');
  var provider = opts.provider || (opts.key ? 'serpapi' : 'mock');
  var result;
  if (provider === 'serpapi') result = await serpapiProvider(opts);
  else if (provider === 'mock') result = await mockProvider(opts);
  else throw new Error('unknown provider: ' + provider);

  if (!result.offers || result.offers.length < 2) {
    throw new Error('not enough offers found for "' + opts.q + '"');
  }
  result.query = opts.q;
  return result;
}

module.exports = { fetchPrices: fetchPrices, canonRetailer: canonRetailer, _internals: { dedupe: dedupe, parsePrice: parsePrice, searchUrl: searchUrl } };
