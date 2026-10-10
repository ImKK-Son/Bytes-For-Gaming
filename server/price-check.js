#!/usr/bin/env node
/* =============================================================
   Bytes For Gaming — Price checker
   Snapshots every product's price/MSRP into data/price-history.json
   (keyed by date) and reports which prices have gone UP or DOWN
   since the previous snapshot. Run it on a schedule (e.g. daily)
   so movement is tracked over time.

     node server/price-check.js            # snapshot today + diff
     node server/price-check.js --date=YYYY-MM-DD

   No dependencies, no build step. Reads the catalog straight out
   of js/data.js via a tiny window stub.
   ============================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_JS = path.join(ROOT, 'js', 'data.js');
const HIST = path.join(ROOT, 'data', 'price-history.json');

function todayISO() {
  const arg = process.argv.find(function (a) { return a.indexOf('--date=') === 0; });
  if (arg) return arg.slice('--date='.length);
  return new Date().toISOString().slice(0, 10);
}

// Load the browser data layer with a minimal window stub.
function loadCatalog() {
  const stub = {};
  global.window = stub;
  require(DATA_JS);
  const BFG = stub.BFG || {};
  if (!Array.isArray(BFG.PRODUCTS)) {
    throw new Error('Could not read window.BFG.PRODUCTS from ' + DATA_JS);
  }
  return BFG;
}

function main() {
  const date = todayISO();
  const BFG = loadCatalog();
  const PRODUCTS = BFG.PRODUCTS;

  // Build today's snapshot.
  const snapshot = {};
  PRODUCTS.forEach(function (p) {
    snapshot[p.id] = { name: p.name, price: p.price, msrp: p.msrp };
  });

  // Load prior history (if any).
  let history = { snapshots: {} };
  if (fs.existsSync(HIST)) {
    try { history = JSON.parse(fs.readFileSync(HIST, 'utf8')); }
    catch (e) { console.error('! existing history unreadable, starting fresh:', e.message); }
    if (!history.snapshots) history.snapshots = {};
  }

  // Most recent prior snapshot (ignoring today).
  const priorDates = Object.keys(history.snapshots).filter(function (d) { return d !== date; }).sort();
  const priorDate = priorDates[priorDates.length - 1];

  console.log('Bytes For Gaming price check — ' + date);
  console.log('Catalog: ' + PRODUCTS.length + ' products');

  if (priorDate) {
    const prior = history.snapshots[priorDate];
    const up = [], down = [], added = [];
    Object.keys(snapshot).forEach(function (id) {
      const now = snapshot[id], was = prior[id];
      if (!was) { added.push(now); return; }
      if (now.price > was.price) up.push({ name: now.name, from: was.price, to: now.price });
      else if (now.price < was.price) down.push({ name: now.name, from: was.price, to: now.price });
    });
    console.log('\nSince ' + priorDate + ':  ↑ ' + up.length + ' up   ↓ ' + down.length + ' down   + ' + added.length + ' new');
    up.forEach(function (x) { console.log('  ↑ ' + x.name + '  $' + x.from + ' → $' + x.to); });
    down.forEach(function (x) { console.log('  ↓ ' + x.name + '  $' + x.from + ' → $' + x.to); });
    added.forEach(function (x) { console.log('  + ' + x.name + '  $' + x.price + ' (new)'); });
    if (!up.length && !down.length && !added.length) console.log('  (no price changes)');
  } else {
    console.log('\nBaseline run — no prior snapshot. Recording today so future runs can diff.');
  }

  // Persist today's snapshot.
  history.snapshots[date] = snapshot;
  history.updated = date;
  history.note = 'Daily price snapshot. Each key under "snapshots" is a date; diff two dates to see movement.';
  fs.writeFileSync(HIST, JSON.stringify(history, null, 2) + '\n');
  console.log('\nSaved snapshot to data/price-history.json');
}

main();
