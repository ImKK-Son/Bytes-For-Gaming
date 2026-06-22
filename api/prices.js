'use strict';
/* Vercel serverless function — GET /api/prices?q=...
   Set SERPAPI_KEY in your Vercel project env for live prices,
   or leave it unset to run in mock mode. */
var fetchPrices = require('../server/lib/price-core').fetchPrices;

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  var query = req.query || {};
  if (!query.q) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'missing query parameter: q' })); }

  try {
    var key = process.env.SERPAPI_KEY || '';
    var provider = process.env.PRICE_PROVIDER || (key ? 'serpapi' : 'mock');
    var data = await fetchPrices({ q: query.q, brand: query.brand, category: query.category, provider: provider, key: key });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (e) {
    res.statusCode = 502; res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
