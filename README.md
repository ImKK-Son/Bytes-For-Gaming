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
To get **live prices + real photos**, set up the price API below.

## ⚡ Live prices & real product photos

Live prices need an API key, and that key must stay **server-side** (browsers
can't safely call shopping APIs directly — the key would leak and most block
CORS). So this repo ships a tiny **price API** you can deploy, plus a frontend
that talks to it and **gracefully falls back to estimates** if it's missing or
fails. The site never breaks.

The included provider is **[SerpApi Google Shopping](https://serpapi.com)** — one
key returns prices from many retailers *and* product photos. It has a **free tier
(100 searches/month)**. There's also a **`mock` provider** that returns synthetic
data with **no key**, so you can try the whole live pipeline instantly.

### 1. Run the price API

**Option A — standalone server (anywhere):**

```bash
# mock mode (no key) — great for trying it out
npm start                       # -> http://localhost:8787/prices

# real prices
SERPAPI_KEY=your_key npm start
```

**Option B — Vercel:** push the repo, import it, set `SERPAPI_KEY` in the project
env. The function is auto-deployed at `https://<you>.vercel.app/api/prices`.

**Option C — Netlify:** connect the repo (config is in `netlify.toml`), set
`SERPAPI_KEY` in site env. Endpoint: `https://<you>.netlify.app/api/prices`.

See `.env.example` for all settings (`SERPAPI_KEY`, `PRICE_PROVIDER`, `PORT`,
`CACHE_TTL_MIN`, `CORS_ORIGIN`).

### 2. Point the site at it

Either edit **`config.js`**:

```js
window.BFG_CONFIG = { priceApi: 'https://your-app.vercel.app/api/prices' };
```

…or just open the **"How We Protect You"** page and paste the URL into
**"Turn on live prices"** (saved in your browser). Open any product's
**Compare & Buy** — it shows estimates instantly, then upgrades to a **LIVE**
badge with real prices and a real photo.

> Live prices are fetched **on demand** (when a product's compare modal opens)
> and cached in the browser, to be gentle on your API quota.

## 🗂️ Project structure

```
.
├── index.html / quiz.html / browse.html / deals.html / about.html
├── config.js              # front-end config (live price endpoint)
├── css/styles.css         # dark, neon gaming theme (responsive)
├── images/                # built-in category product illustrations (SVG)
├── js/
│   ├── data.js            # catalog, retailers, pricing/decorate engine, images
│   ├── components.js      # nav/footer, product cards, compare modal (live-aware)
│   ├── prices.js          # live price client (fetch + cache + fallback)
│   ├── home.js / quiz.js / browse.js / deals.js
├── server/
│   ├── lib/price-core.js  # provider-agnostic price logic (serpapi + mock)
│   └── price-proxy.js     # standalone zero-dependency price server
├── api/prices.js          # Vercel serverless function
├── netlify/functions/prices.js   # Netlify function
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
