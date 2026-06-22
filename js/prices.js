/* =============================================================
   Bytes For Gaming — Prices helper
   The site shows built-in price estimates by default. ADVANCED
   (optional): if you generate an affiliate offers file
   (data/offers.json via server/ingest-feeds.js) and point
   config.js `offersFile` at it, the compare modal will show those
   real prices instead. If it is not set, everything falls back to
   estimates — nothing to configure for a normal setup.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var offersFilePromise = null;

  function cfg() { return window.BFG_CONFIG || {}; }
  function getOffersFile() { return cfg().offersFile || ''; }
  function isEnabled() { return !!getOffersFile(); }

  // enrich raw offers with buyer-protection meta + flag them exact (real data)
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
        url: o.url || o.link || '#',
        exact: true
      };
    }).filter(function (o) { return typeof o.price === 'number' && o.price > 0 && /^https?:/.test(o.url); });
  }

  function loadOffersFile() {
    if (offersFilePromise) return offersFilePromise;
    offersFilePromise = fetch(getOffersFile()).then(function (res) {
      if (!res.ok) throw new Error('offers file HTTP ' + res.status);
      return res.json();
    });
    return offersFilePromise;
  }

  function fetchFor(product) {
    if (!getOffersFile()) return Promise.reject(new Error('live prices not configured'));
    return loadOffersFile().then(function (data) {
      var entry = data && data.products && data.products[product.id];
      if (!entry || !entry.offers) throw new Error('no offers for ' + product.id);
      var raw = entry.offers.map(function (o) {
        var p = (o.salePrice != null && o.salePrice > 0 && o.salePrice < o.price) ? o.salePrice : o.price;
        return { name: o.name, price: p, url: o.url };
      });
      var offers = normalizeOffers(raw);
      if (offers.length < 2) throw new Error('not enough offers');
      return { live: true, source: 'affiliate', image: entry.image || null, pricing: BFG.decorateOffers(offers) };
    });
  }

  BFG.prices = {
    isEnabled: isEnabled,
    getOffersFile: getOffersFile,
    fetchFor: fetchFor
  };
})();
