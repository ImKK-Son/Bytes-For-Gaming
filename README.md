# 🎮 Bytes For Gaming

An independent, consumer-first buying guide for gaming accessories. It compiles
the major brands — **8BitDo, Razer, Logitech G, SteelSeries, Corsair, HyperX,
Keychron, Glorious, Secretlab, Sony, Xbox, Herman Miller** — and compares each
product across the major stores so you find the right gear **at a fair price,
without getting ripped off**.

## ✨ Features

- **🎯 Find My Gear quiz** — categorized quizzes (keyboards, mice, controllers,
  headsets, chairs, mousepads, microphones) that match products to how you play
  and your budget.
- **🏷️ Price comparison** — every product is lined up across **Amazon, Best Buy,
  Walmart, Newegg, and Manufacturer Direct**, with the **lowest price** and the
  **most trusted seller** clearly flagged.
- **🛡️ Anti-rip-off scoring** — each retailer has a buyer-protection score
  (returns, warranty, authenticity, price transparency). We recommend an
  "Our Pick" that balances a fair price with safety.
- **🖼️ Product images** — crisp built-in category illustrations that always load,
  plus **real product photos** pulled in live when the price API is enabled.
- **⚡ Live prices (optional)** — flip on a real shopping API to replace the
  built-in estimates with **real-time prices and photos** from across the web.
- **🔥 Deals page**, **🛒 browse & filter**, and a **consumer-protection guide**.

## 🚀 Running it

The site itself is a **zero-dependency static site** — no build step.

**Open it:** double-click `index.html`, or serve it:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npx serve .
```

Out of the box it shows realistic **price estimates** and built-in illustrations.
For real prices + photos you have two paths: **affiliate feeds** (recommended
for a commercial site) or a **price API**. Both gracefully fall back to estimates
if not configured — the site never breaks.

## 💸 Affiliate feeds (recommended, commercial-OK)

Affiliate product datafeeds are **free, allowed for commercial use, and your buy
links earn commission**. You join affiliate networks/brand programs (Impact, CJ,
Rakuten, Awin, Amazon Associates, Best Buy, …), they give you **product feeds**
(CSV/TSV/XML with prices, links, images), and this repo turns those into the
site's live prices.

How it works: `server/ingest-feeds.js` reads `feeds.config.json`, downloads each
feed, **normalizes + matches** rows to the catalog, wraps URLs as your affiliate
links, and writes **`data/offers.json`**. The site reads that file — no per-visit
API calls, no key in the browser.

### 1. Try it with the bundled sample (no accounts needed)

```bash
npm run ingest:sample      # parses feeds/sample/* -> data/offers.json
```

Then set in **`config.js`**: `offersFile: 'data/offers.json'`, serve the site,
and open any covered product's **Compare & Buy** — you'll see a **LIVE · affiliate**
badge with offers. (Products not in the feed fall back to estimates.)

### 2. Wire up your real feeds

1. Join your affiliate networks and grab each advertiser's **datafeed** (a file or
   a feed URL) plus your **publisher/tracking IDs**.
2. `cp feeds.config.example.json feeds.config.json` and edit it:
   - one block per feed: `format` (csv/tsv/xml), `source` (`{file}` or `{url}`),
     and a `map` from the feed's columns to our fields,
   - put secrets in env vars and reference them as `${MY_VAR}` (never commit keys),
   - optional `deeplinkTemplate` wraps each product URL into your tracking link,
   - optional `overrides` pin a UPC/GTIN to an exact product id for perfect matches.
3. Run `npm run ingest` → regenerates `data/offers.json`.
4. Keep it fresh automatically with the included **GitHub Action**
   (`.github/workflows/refresh-feeds.yml`, daily) or a host build step.

> Improve matching by adding `upc`/`gtin` values to products in `js/data.js` (or
> `overrides` in the feed config). The ingester prints matched/unmatched counts.

## ⚡ Price API (alternative: per-query live data)

If you'd rather pull live prices per product from a shopping API, this repo also
ships a small server-side API (key stays server-side). The bundled provider is
**[SerpApi Google Shopping](https://serpapi.com)** (note: its **free** tier is
**non-commercial** — use a paid tier or another provider for a commercial site;
swapping providers is a localized change in `server/lib/price-core.js`). A keyless
**`mock`** provider lets you test the pipeline instantly.

- **Local:** `npm start` (mock) or `SERPAPI_KEY=xxx npm start` → `http://localhost:8787/prices`
- **Vercel:** import repo, set `SERPAPI_KEY` → `/api/prices`
- **Netlify:** connect repo (`netlify.toml` included), set `SERPAPI_KEY` → `/api/prices`

Then set `priceApi` in `config.js`, or use the **"Turn on live prices"** box on the
*How We Protect You* page. Results are fetched on demand and cached in the browser.
See `.env.example` for all settings.

## 🗂️ Project structure

```
.
├── index.html / quiz.html / browse.html / deals.html / about.html
├── config.js              # front-end config (offersFile / priceApi)
├── css/styles.css         # dark, neon gaming theme (responsive)
├── images/                # built-in category product illustrations (SVG)
├── js/
│   ├── data.js            # catalog, retailers, pricing/decorate engine, images
│   ├── components.js      # nav/footer, product cards, compare modal (live-aware)
│   ├── prices.js          # live price client: affiliate-feed + API modes + fallback
│   ├── home.js / quiz.js / browse.js / deals.js
├── data/offers.json       # generated affiliate offers the site reads (npm run ingest)
├── feeds/sample/          # sample CSV/TSV datafeeds (for the demo)
├── feeds.config.example.json      # affiliate feed config template
├── server/
│   ├── lib/price-core.js  # provider-agnostic price API logic (serpapi + mock)
│   ├── lib/feed-core.js   # feed parsing / mapping / affiliate links / matching
│   ├── ingest-feeds.js    # builds data/offers.json from your feeds
│   └── price-proxy.js     # standalone zero-dependency price server
├── api/prices.js          # Vercel serverless function (price API)
├── netlify/functions/prices.js    # Netlify function (price API)
├── .github/workflows/refresh-feeds.yml   # daily feed refresh (optional)
├── vercel.json / netlify.toml / .env.example / package.json
```

## 🔧 Adding or editing products

Everything lives in `js/data.js` → the `PRODUCTS` array:

```js
{
  id: 'unique-id', name: 'Brand Product Name',
  brand: 'Razer',          // must exist in BRANDS
  category: 'keyboard',    // must exist in CATEGORIES
  price: 99.99, msrp: 119.99, rating: 4.6,
  highlight: 'One-line pitch shown on the card.',
  features: ['Feature 1', 'Feature 2'],
  tags: ['mechanical', 'tkl', 'wired'],   // used by the quiz matcher
  valueNote: 'Buyer-focused note shown in the compare modal.',
  image: 'images/your-photo.jpg'          // OPTIONAL real photo (else illustration)
}
```

Pricing, store offers, the lowest/most-trusted badges, the "Our Pick"
recommendation, and the deal score are computed automatically. The live API
path reuses the **same** `decorateOffers()` scoring, so estimated and live
results behave identically.

### Images, in priority order
1. **Live photo** from the price API (when live prices are on),
2. **`image`** URL on the product (a manual/local photo), else
3. the **built-in category SVG** in `images/` (always loads, zero network).

## 💵 A note on pricing

Without the live API, in-app prices are realistic, **stable estimates** generated
from each product's `price`/`msrp` to demonstrate comparisons; every store button
links to live search results. With the live API enabled, comparisons show
**real-time prices and photos**. Always confirm the price, seller, and warranty
on the retailer's site before buying.

## ⚖️ Disclaimer

Bytes For Gaming is an independent buying guide and is **not affiliated** with any
of the brands or retailers listed.
