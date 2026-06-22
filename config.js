/* =============================================================
   Bytes For Gaming — Site configuration
   -------------------------------------------------------------
   LIVE PRICES + PRODUCT PHOTOS
   The site works out of the box with built-in price estimates.
   To switch on real, live prices and real product photos, deploy
   the price API (see /server + README "Live prices") and paste
   its public URL below — or enable it in the UI on the
   "How We Protect You" page (saved to your browser).

   Examples:
     priceApi: 'https://your-app.vercel.app/api/prices'
     priceApi: 'http://localhost:8787/prices'   (local proxy)
   ============================================================= */
window.BFG_CONFIG = {
  priceApi: '',     // empty = use built-in estimates
  cacheTtlMin: 30   // how long to cache a product's live prices in the browser
};
