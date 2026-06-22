#!/usr/bin/env node
'use strict';
/* =============================================================
   Bytes For Gaming — Affiliate feed ingester
   Reads feeds.config.json, downloads/loads each advertiser feed,
   normalizes + matches rows to the product catalog, and writes
   data/offers.json (which the site reads for live affiliate prices).

   Usage:
     node server/ingest-feeds.js [path/to/feeds.config.json]

   Feed "source" can be a local file ({ "file": "feeds/x.csv" }) or a
   URL ({ "url": "https://..." }). URLs and config values may contain
   ${ENV_VARS} so credentials never live in the repo.
   ============================================================= */

var fs = require('fs');
var path = require('path');
var feedCore = require('./lib/feed-core');

var ROOT = path.resolve(__dirname, '..');

/* ---- load the product catalog from js/data.js via a tiny window shim ---- */
function loadCatalog() {
  global.window = {};
  global.document = { addEventListener: function () {}, getElementById: function () { return null; } };
  require(path.join(ROOT, 'js', 'data.js'));
  return global.window.BFG.PRODUCTS;
}

async function loadSource(src) {
  if (src.file) return fs.readFileSync(path.resolve(ROOT, feedCore.envSubst(src.file)), 'utf8');
  if (src.url) {
    var url = feedCore.envSubst(src.url);
    var headers = {};
    if (src.headers) Object.keys(src.headers).forEach(function (k) { headers[k] = feedCore.envSubst(src.headers[k]); });
    var res = await fetch(url, { headers: headers });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching feed');
    return await res.text();
  }
  throw new Error('feed source needs "file" or "url"');
}

function effectivePrice(o) {
  return (o.salePrice != null && o.salePrice > 0 && o.salePrice < o.price) ? o.salePrice : o.price;
}

async function main() {
  var configPath = process.argv[2] || path.join(ROOT, 'feeds.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('No feed config found at ' + configPath +
      '\n  -> copy feeds.config.example.json to feeds.config.json and edit it.');
    process.exit(1);
  }
  var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  var products = loadCatalog();
  var overrides = config.overrides || {};
  var threshold = config.matchThreshold;

  var byProduct = {};        // id -> { image, offers: { retailer -> offer } }
  var stats = { feeds: 0, rows: 0, matched: 0, unmatched: 0, unmatchedSamples: [] };

  for (var fi = 0; fi < (config.feeds || []).length; fi++) {
    var feed = config.feeds[fi];
    if (feed.enabled === false) continue;
    stats.feeds++;
    var text;
    try {
      text = await loadSource(feed.source);
    } catch (e) {
      console.warn('  ! skipping feed "' + feed.name + '": ' + e.message);
      continue;
    }
    var rows = feedCore.parseFeed(text, feed);
    rows.forEach(function (raw) {
      stats.rows++;
      var offer = feedCore.normalizeRow(raw, feed);
      var price = effectivePrice(offer);
      if (!offer.url || isNaN(price) || price <= 0) return;
      var hit = feedCore.matchProduct(offer, products, overrides, threshold);
      if (!hit) {
        stats.unmatched++;
        if (stats.unmatchedSamples.length < 8) stats.unmatchedSamples.push(offer.brand + ' / ' + offer.name);
        return;
      }
      stats.matched++;
      var id = hit.product.id;
      if (!byProduct[id]) byProduct[id] = { image: '', offers: {} };
      if (!byProduct[id].image && offer.image) byProduct[id].image = offer.image;
      var rkey = offer.retailer;
      var existing = byProduct[id].offers[rkey];
      // keep the cheapest offer per retailer
      if (!existing || price < effectivePrice(existing)) {
        byProduct[id].offers[rkey] = offer;
      }
    });
  }

  // shape final output
  var out = { generatedAt: new Date().toISOString(), source: 'affiliate-feeds', products: {} };
  Object.keys(byProduct).forEach(function (id) {
    var entry = byProduct[id];
    var offers = Object.keys(entry.offers).map(function (r) {
      var o = entry.offers[r];
      return {
        name: o.retailer,
        price: o.price,
        salePrice: o.salePrice,
        url: o.url,
        image: o.image || null,
        inStock: o.inStock,
        updatedAt: out.generatedAt
      };
    }).sort(function (a, b) { return effectivePrice(a) - effectivePrice(b); });
    out.products[id] = { image: entry.image || null, offers: offers };
  });

  var dataDir = path.join(ROOT, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  var outPath = path.join(dataDir, 'offers.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  console.log('Bytes For Gaming — feed ingest complete');
  console.log('  feeds processed : ' + stats.feeds);
  console.log('  rows parsed     : ' + stats.rows);
  console.log('  rows matched    : ' + stats.matched + ' (unmatched: ' + stats.unmatched + ')');
  console.log('  products covered: ' + Object.keys(out.products).length + ' / ' + products.length);
  if (stats.unmatchedSamples.length) {
    console.log('  unmatched examples: ' + stats.unmatchedSamples.join(' | '));
  }
  console.log('  written         : ' + path.relative(ROOT, outPath));
}

main().catch(function (e) { console.error(e); process.exit(1); });
