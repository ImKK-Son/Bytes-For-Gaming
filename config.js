/* =============================================================
   Bytes For Gaming — Site configuration
   -------------------------------------------------------------
   LIVE PRICES + PRODUCT PHOTOS
   The site works out of the box with built-in price estimates.
   Turn on real prices + photos with EITHER of these:

   1) AFFILIATE FEEDS (recommended for a commercial site —
      free, commercial-OK, and your buy links earn commission):
      Generate data/offers.json with `node server/ingest-feeds.js`
      then point offersFile at it. See README "Affiliate feeds".
        offersFile: 'data/offers.json'

   2) PRICE API (per-query live data; e.g. a paid shopping API):
        priceApi: 'https://your-app.vercel.app/api/prices'
      (Also settable in the UI on "How We Protect You".)

   If both are set, the affiliate offers file wins.
   ============================================================= */
window.BFG_CONFIG = {
  offersFile: '',   // e.g. 'data/offers.json' (affiliate feed output)
  priceApi: '',     // e.g. 'https://your-app.vercel.app/api/prices'
  cacheTtlMin: 30   // how long to cache a product's live prices in the browser
};
