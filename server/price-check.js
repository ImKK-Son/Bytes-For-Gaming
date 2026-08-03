#!/usr/bin/env node
/* =============================================================
   Bytes For Gaming — Price Check
   Loads the product catalog, compares each product's current
   street price against the committed snapshot in
   data/price-snapshot.json, and reports which prices went UP,
   went DOWN, are NEW, or are UNCHANGED. Then it rewrites the
   snapshot so the next run can diff against today.

   Usage:  node server/price-check.js
   No dependencies, no network — reads the same catalog the site
   ships (js/data.js) via a tiny window shim.
   ============================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DATA_JS = path.join(ROOT, 'js', 'data.js');
const SNAPSHOT = path.join(ROOT, 'data', 'price-snapshot.json');

// --- Load the catalog by evaluating js/data.js in a window shim -----------
function loadProducts() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(DATA_JS, 'utf8'), sandbox, { filename: 'data.js' });
  const bfg = sandbox.window.BFG;
  if (!bfg || !Array.isArray(bfg.PRODUCTS)) {
    throw new Error('Could not read window.BFG.PRODUCTS from js/data.js');
  }
  return bfg.PRODUCTS;
}

function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT)) return null;
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  } catch (e) {
    console.warn('! Existing snapshot is unreadable, treating as first run:', e.message);
    return null;
  }
}

function money(n) { return '$' + Number(n).toFixed(2); }

function main() {
  const products = loadProducts();
  const prev = loadSnapshot();
  const prevPrices = (prev && prev.products) || {};

  const up = [], down = [], added = [], unchanged = [];
  const nextProducts = {};

  for (const p of products) {
    nextProducts[p.id] = { name: p.name, price: p.price, msrp: p.msrp };
    const before = prevPrices[p.id];
    if (!before) {
      added.push(p);
    } else if (p.price > before.price) {
      up.push({ p, from: before.price });
    } else if (p.price < before.price) {
      down.push({ p, from: before.price });
    } else {
      unchanged.push(p);
    }
  }

  // Discount posture (price vs MSRP) — useful even on the first baseline run.
  const belowMsrp = products.filter(p => p.price < p.msrp);
  const atMsrp = products.filter(p => p.price >= p.msrp);

  // --- Report ------------------------------------------------------------
  const lines = [];
  lines.push('=== Bytes For Gaming — Price Check ===');
  lines.push('Catalog size: ' + products.length + ' products');
  lines.push(prev
    ? 'Comparing against snapshot from ' + prev.generatedAt
    : 'No prior snapshot — establishing baseline this run.');
  lines.push('');

  if (up.length) {
    lines.push('PRICES UP (' + up.length + '):');
    up.forEach(({ p, from }) =>
      lines.push('  ▲ ' + p.name + ': ' + money(from) + ' -> ' + money(p.price)));
    lines.push('');
  }
  if (down.length) {
    lines.push('PRICES DOWN (' + down.length + '):');
    down.forEach(({ p, from }) =>
      lines.push('  ▼ ' + p.name + ': ' + money(from) + ' -> ' + money(p.price)));
    lines.push('');
  }
  if (added.length) {
    lines.push('NEW PRODUCTS (' + added.length + '):');
    added.forEach(p => {
      const dir = p.price < p.msrp
        ? 'below MSRP (' + money(p.msrp) + ') — a deal'
        : (p.price > p.msrp ? 'above MSRP (' + money(p.msrp) + ')' : 'at MSRP');
      lines.push('  + ' + p.name + ': ' + money(p.price) + ' — ' + dir);
    });
    lines.push('');
  }

  lines.push('Discount posture: ' + belowMsrp.length + ' priced below MSRP, '
    + atMsrp.length + ' at/above MSRP.');
  lines.push('Unchanged since last run: ' + unchanged.length);

  const report = lines.join('\n');
  console.log(report);

  // --- Persist the new snapshot -----------------------------------------
  // generatedAt is passed in via env so runs are reproducible / not tied to
  // wall-clock inside restricted sandboxes; falls back to now() otherwise.
  const stamp = process.env.PRICE_CHECK_AT || new Date().toISOString();
  const snapshot = { generatedAt: stamp, count: products.length, products: nextProducts };
  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log('\nSnapshot written to data/price-snapshot.json (' + products.length + ' products).');
}

main();
