#!/usr/bin/env node
/* =============================================================
   Bytes For Gaming — Price Tracker
   Snapshots every product's street price (and MSRP) from
   js/data.js into data/price-history.json, then reports which
   products have gone UP or DOWN since the last snapshot.

   Run manually or from a daily job:
     node server/price-tracker.js

   The history file keeps a small per-product trail so future
   runs can always compare "today" against the last recorded day.
   ============================================================= */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var DATA_JS = path.join(ROOT, 'js', 'data.js');
var HISTORY_FILE = path.join(ROOT, 'data', 'price-history.json');

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Pull id / name / price / msrp out of the PRODUCTS array in data.js.
function parseProducts(src) {
  var start = src.indexOf('var PRODUCTS = [');
  var end = src.indexOf('PRICING ENGINE', start);
  var slice = src.slice(start, end === -1 ? undefined : end);
  var re = /id:\s*'([^']+)',\s*name:\s*'([^']+)'[\s\S]*?price:\s*([\d.]+),\s*msrp:\s*([\d.]+)/g;
  var out = [];
  var m;
  while ((m = re.exec(slice)) !== null) {
    out.push({ id: m[1], name: m[2], price: parseFloat(m[3]), msrp: parseFloat(m[4]) });
  }
  return out;
}

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch (e) {
    return { updated: null, products: {} };
  }
}

function main() {
  var src = fs.readFileSync(DATA_JS, 'utf8');
  var products = parseProducts(src);
  var history = loadHistory();
  var date = today();

  var changes = { up: [], down: [], unchanged: 0, added: [] };

  products.forEach(function (p) {
    var rec = history.products[p.id];
    if (!rec) {
      history.products[p.id] = {
        name: p.name,
        history: [{ date: date, price: p.price, msrp: p.msrp }]
      };
      changes.added.push(p);
      return;
    }
    rec.name = p.name;
    var last = rec.history[rec.history.length - 1];
    var delta = +(p.price - last.price).toFixed(2);
    if (delta > 0) changes.up.push({ p: p, from: last.price, delta: delta });
    else if (delta < 0) changes.down.push({ p: p, from: last.price, delta: delta });
    else changes.unchanged++;
    // only append a new point when something changed or the day rolled over
    if (delta !== 0 || last.date !== date) {
      rec.history.push({ date: date, price: p.price, msrp: p.msrp });
    }
    if (rec.history.length > 60) rec.history = rec.history.slice(-60);
  });

  history.updated = date;
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + '\n');

  // ----- human-readable report -----
  var belowMsrp = products.filter(function (p) { return p.price < p.msrp; }).length;
  var atMsrp = products.filter(function (p) { return p.price === p.msrp; }).length;

  console.log('Bytes For Gaming — price check for ' + date);
  console.log('Catalog size: ' + products.length + ' products');
  if (changes.added.length) {
    console.log('\nNew products tracked (' + changes.added.length + '):');
    changes.added.forEach(function (p) {
      var dir = p.price < p.msrp ? 'below MSRP' : p.price > p.msrp ? 'above MSRP' : 'at MSRP';
      console.log('  + ' + p.name + ' — $' + p.price.toFixed(2) +
        ' (MSRP $' + p.msrp.toFixed(2) + ', ' + dir + ')');
    });
  }
  console.log('\nPrice movement since last snapshot:');
  if (!changes.up.length && !changes.down.length) {
    console.log('  No price changes vs. previous snapshot.');
  }
  changes.up.forEach(function (c) {
    console.log('  ↑ ' + c.p.name + ': $' + c.from.toFixed(2) + ' → $' +
      c.p.price.toFixed(2) + ' (+$' + c.delta.toFixed(2) + ')');
  });
  changes.down.forEach(function (c) {
    console.log('  ↓ ' + c.p.name + ': $' + c.from.toFixed(2) + ' → $' +
      c.p.price.toFixed(2) + ' (-$' + Math.abs(c.delta).toFixed(2) + ')');
  });
  console.log('\nAgainst MSRP: ' + belowMsrp + ' below, ' + atMsrp + ' at, ' +
    (products.length - belowMsrp - atMsrp) + ' above.');

  // exit code 0; write a compact summary for scripts
  return { date: date, count: products.length, changes: changes, belowMsrp: belowMsrp };
}

main();
