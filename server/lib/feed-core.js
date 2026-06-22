'use strict';
/* =============================================================
   Bytes For Gaming — Affiliate feed core
   Parse advertiser product datafeeds (CSV / TSV / XML) from
   affiliate networks (Impact, CJ, Rakuten, Awin, brand programs),
   normalize them, build affiliate deeplinks, and match rows to
   our product catalog.

   Pure + dependency-free so it's easy to test. Node 18+.
   ============================================================= */

/* ---------- env substitution: "${MY_SECRET}" -> process.env.MY_SECRET ---------- */
function envSubst(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([A-Z0-9_]+)\}/gi, function (_, name) {
    return process.env[name] != null ? process.env[name] : '';
  });
}

/* ---------- delimited (CSV / TSV) parser: handles quotes, commas, newlines ---------- */
function parseDelimited(text, delimiter) {
  delimiter = delimiter || ',';
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;
  text = String(text).replace(/^﻿/, ''); // strip BOM
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (c === '\r') {
      // swallow; handled by \n
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  var header = rows.shift().map(function (h) { return h.trim(); });
  return rows
    .filter(function (r) { return r.length > 1 || (r.length === 1 && r[0] !== ''); })
    .map(function (r) {
      var o = {};
      header.forEach(function (h, idx) { o[h] = (r[idx] != null ? r[idx] : '').trim(); });
      return o;
    });
}

/* ---------- minimal flat XML feed parser ---------- */
function parseXML(text, recordTag) {
  recordTag = recordTag || 'item';
  var out = [];
  var re = new RegExp('<' + recordTag + '[^>]*>([\\s\\S]*?)<\\/' + recordTag + '>', 'gi');
  var m;
  while ((m = re.exec(text))) {
    var body = m[1];
    var obj = {};
    var fre = /<([a-z0-9_:-]+)[^>]*>([\s\S]*?)<\/\1>/gi;
    var f;
    while ((f = fre.exec(body))) {
      var key = f[1].replace(/^.*:/, ''); // drop namespace
      var val = f[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
      obj[key] = val;
    }
    out.push(obj);
  }
  return out;
}

function parseFeed(text, feed) {
  var fmt = (feed.format || 'csv').toLowerCase();
  if (fmt === 'xml') return parseXML(text, feed.recordTag);
  var delim = feed.delimiter || (fmt === 'tsv' ? '\t' : ',');
  return parseDelimited(text, delim);
}

/* ---------- money parsing ---------- */
function parseMoney(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  var m = String(v).replace(/[, ]/g, '').match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : NaN;
}
function truthy(v) {
  var s = String(v == null ? '' : v).toLowerCase().trim();
  return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === 'in stock' || s === 'instock' || s === 'available';
}

/* ---------- field mapping ----------
   map value is a COLUMN name, or a literal if prefixed with "=".
   e.g. { retailer: "=Amazon", name: "product_name", price: "price" }
*/
function mapValue(rawRow, spec) {
  if (spec == null) return '';
  if (spec[0] === '=') return spec.slice(1);
  return rawRow[spec] != null ? rawRow[spec] : '';
}

/* ---------- affiliate deeplink builder ----------
   If feed.deeplinkTemplate is set, build a tracking URL:
     "https://network.example/c/{pubId}/{campaign}?url={url}"
   {url} is URL-encoded; other {keys} pull from feed.params.
   Otherwise the feed's own URL (already containing tracking) is used.
*/
function buildAffiliateUrl(rawUrl, feed) {
  var params = feed.params || {};
  if (!feed.deeplinkTemplate) return rawUrl;
  return feed.deeplinkTemplate.replace(/\{(\w+)\}/g, function (_, key) {
    if (key === 'url') return encodeURIComponent(rawUrl || '');
    return envSubst(params[key] != null ? params[key] : '');
  });
}

/* ---------- normalize one raw row into an offer ---------- */
function normalizeRow(rawRow, feed) {
  var map = feed.map || {};
  var rawUrl = mapValue(rawRow, map.url);
  var price = parseMoney(mapValue(rawRow, map.price));
  var sale = map.salePrice ? parseMoney(mapValue(rawRow, map.salePrice)) : NaN;
  return {
    retailer: mapValue(rawRow, map.retailer) || feed.name || 'Store',
    name: mapValue(rawRow, map.name),
    brand: mapValue(rawRow, map.brand),
    category: mapValue(rawRow, map.category),
    sku: mapValue(rawRow, map.sku),
    upc: mapValue(rawRow, map.upc),
    image: mapValue(rawRow, map.image),
    inStock: map.inStock ? truthy(mapValue(rawRow, map.inStock)) : true,
    price: isNaN(price) ? NaN : price,
    salePrice: isNaN(sale) ? null : sale,
    url: buildAffiliateUrl(rawUrl, feed)
  };
}

/* ---------- catalog matching ---------- */
function normName(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function tokenize(s) { return normName(s).split(' ').filter(Boolean); }
function jaccard(a, b) {
  if (!a.length || !b.length) return 0;
  var setB = {}; b.forEach(function (t) { setB[t] = 1; });
  var inter = 0, seen = {};
  a.forEach(function (t) { if (setB[t] && !seen[t]) { inter++; seen[t] = 1; } });
  var union = {};
  a.concat(b).forEach(function (t) { union[t] = 1; });
  return inter / Object.keys(union).length;
}
function brandToken(b) { return normName(b).replace(/\bg\b/, '').trim().split(' ')[0] || ''; }

// Match an offer to a catalog product. Prefer explicit UPC/SKU overrides
// (overrides: { "<upc-or-sku>": "<productId>" }), then fuzzy name+brand.
function matchProduct(offer, products, overrides, threshold) {
  threshold = threshold == null ? 0.45 : threshold;
  if (overrides) {
    var key = offer.upc || offer.sku;
    if (key && overrides[key]) {
      var byId = products.filter(function (p) { return p.id === overrides[key]; })[0];
      if (byId) return { product: byId, score: 1, method: 'override' };
    }
  }
  var ob = brandToken(offer.brand);
  var pool = products;
  if (ob) {
    var sameBrand = products.filter(function (p) { return brandToken(p.brand) === ob; });
    if (sameBrand.length) pool = sameBrand;
  }
  var offerTokens = tokenize(offer.brand + ' ' + offer.name);
  var best = null, bestScore = 0;
  pool.forEach(function (p) {
    var s = jaccard(offerTokens, tokenize(p.brand + ' ' + p.name));
    if (s > bestScore) { bestScore = s; best = p; }
  });
  return bestScore >= threshold ? { product: best, score: +bestScore.toFixed(2), method: 'fuzzy' } : null;
}

module.exports = {
  envSubst: envSubst,
  parseDelimited: parseDelimited,
  parseXML: parseXML,
  parseFeed: parseFeed,
  parseMoney: parseMoney,
  truthy: truthy,
  normalizeRow: normalizeRow,
  buildAffiliateUrl: buildAffiliateUrl,
  matchProduct: matchProduct,
  _internals: { normName: normName, tokenize: tokenize, jaccard: jaccard, brandToken: brandToken, mapValue: mapValue }
};
