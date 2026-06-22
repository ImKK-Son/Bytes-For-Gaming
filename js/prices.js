/* =============================================================
   Bytes For Gaming — Live price client
   Talks to a deployed price API (see /server). Normalizes results
   into the same shape as the estimate engine and caches them in
   the browser. If no endpoint is configured, or a request fails,
   callers fall back to built-in estimates — the site never breaks.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var LS_ENDPOINT = 'bfg_price_api';
  var LS_CACHE = 'bfg_price_cache';
  var mem = {}; // id -> { ts, result }

  function cfg() { return window.BFG_CONFIG || {}; }
  function ttlMs() { return (cfg().cacheTtlMin || 30) * 60 * 1000; }

  function getEndpoint() {
    try {
      var saved = window.localStorage.getItem(LS_ENDPOINT);
      if (saved) return saved;
    } catch (e) { /* private mode */ }
    return cfg().priceApi || '';
  }
  function setEndpoint(url) {
    try { window.localStorage.setItem(LS_ENDPOINT, url || ''); } catch (e) {}
    mem = {};
    try { window.localStorage.removeItem(LS_CACHE); } catch (e) {}
  }
  function clearEndpoint() {
    try { window.localStorage.removeItem(LS_ENDPOINT); } catch (e) {}
    mem = {};
  }
  function isEnabled() { return !!getEndpoint(); }

  /* ---- cache (memory + localStorage) ---- */
  function readCache(id) {
    if (mem[id] && Date.now() - mem[id].ts < ttlMs()) return mem[id].result;
    try {
      var all = JSON.parse(window.localStorage.getItem(LS_CACHE) || '{}');
      if (all[id] && Date.now() - all[id].ts < ttlMs()) {
        mem[id] = all[id];
        return all[id].result;
      }
    } catch (e) {}
    return null;
  }
  function writeCache(id, result) {
    var entry = { ts: Date.now(), result: result };
    mem[id] = entry;
    try {
      var all = JSON.parse(window.localStorage.getItem(LS_CACHE) || '{}');
      all[id] = entry;
      window.localStorage.setItem(LS_CACHE, JSON.stringify(all));
    } catch (e) {}
  }

  /* ---- normalize a raw API offer into our scored offer shape ---- */
  function normalizeOffers(rawOffers) {
    return (rawOffers || []).map(function (o) {
      var meta = BFG.retailerMeta(o.name || o.source || '');
      var price = Number(o.price != null ? o.price : o.extracted_price);
      return {
        key: meta.key,
        name: o.name || o.source || meta.name,
        consumerScore: meta.consumerScore,
        blurb: meta.blurb,
        price: price,
        url: o.url || o.link || '#'
      };
    }).filter(function (o) { return typeof o.price === 'number' && o.price > 0 && /^https?:/.test(o.url); });
  }

  /* ---- fetch live prices for one product ---- */
  function fetchFor(product) {
    var endpoint = getEndpoint();
    if (!endpoint) return Promise.reject(new Error('live prices not configured'));

    var cached = readCache(product.id);
    if (cached) return Promise.resolve(cached);

    var url = endpoint + (endpoint.indexOf('?') === -1 ? '?' : '&') +
      'q=' + encodeURIComponent(BFG.searchQuery(product)) +
      '&category=' + encodeURIComponent(product.category) +
      '&brand=' + encodeURIComponent(product.brand) +
      '&id=' + encodeURIComponent(product.id);

    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;

    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error('price API HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var offers = normalizeOffers(data.offers);
        if (offers.length < 2) throw new Error('not enough live offers');
        var pricing = BFG.decorateOffers(offers);
        var result = {
          live: true,
          source: data.source || 'live',
          image: data.image || null,
          pricing: pricing
        };
        writeCache(product.id, result);
        return result;
      });
  }

  BFG.prices = {
    isEnabled: isEnabled,
    getEndpoint: getEndpoint,
    setEndpoint: setEndpoint,
    clearEndpoint: clearEndpoint,
    fetchFor: fetchFor
  };
})();
