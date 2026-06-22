'use strict';
/* Netlify function — GET /api/prices?q=...  (redirected to here via netlify.toml)
   Set SERPAPI_KEY in your Netlify site env for live prices, or leave it
   unset to run in mock mode. */
var fetchPrices = require('../../server/lib/price-core').fetchPrices;

exports.handler = async function (event) {
  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: headers, body: '' };

  var p = event.queryStringParameters || {};
  if (!p.q) return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'missing query parameter: q' }) };

  try {
    var key = process.env.SERPAPI_KEY || '';
    var provider = process.env.PRICE_PROVIDER || (key ? 'serpapi' : 'mock');
    var data = await fetchPrices({ q: p.q, brand: p.brand, category: p.category, provider: provider, key: key });
    headers['Cache-Control'] = 'public, max-age=1800';
    return { statusCode: 200, headers: headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, headers: headers, body: JSON.stringify({ error: String(e && e.message || e) }) };
  }
};
