# 🎮 Bytes For Gaming

An independent, consumer-first buying guide for gaming accessories. It compiles
the major brands — **8BitDo, Razer, Logitech G, SteelSeries, Corsair, HyperX,
Keychron, Glorious, Secretlab, Sony, Xbox, Herman Miller** — and compares each
product across the major stores so you find the right gear **at a fair price,
without getting ripped off**.

## ✨ Features

- **🎯 Find My Gear quiz** — categorized quizzes (keyboards, mice, controllers,
  headsets, chairs, mousepads, microphones, webcams) that match products to how
  you play and your budget.
- **🏷️ Price comparison** — every product is lined up across **Amazon, Best Buy,
  Walmart, Newegg, and Manufacturer Direct**, with the **lowest price** and the
  **most trusted seller** flagged. The manufacturer "Buy Direct" link goes to the
  exact product; estimated prices are clearly marked with a “≈”.
- **🛡️ Anti-rip-off scoring** — each retailer gets a buyer-protection score and we
  recommend an "Our Pick" balancing price and safety.
- **🔥 Deals page**, **🛒 browse & filter**, and a **consumer-protection guide**.

No accounts, no API keys, no build step.

## 🚀 Running it

Just open `index.html` in your browser. Or serve it locally:

```bash
npm start          # serves at http://localhost:8000
# (or)  python3 -m http.server 8000
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
  url: 'https://www.razer.com/.../exact-product',  // OPTIONAL exact "Buy Direct" page
  image: 'images/products/my-photo.png'            // OPTIONAL (else auto/icon)
}
```

Pricing, store offers, the badges, the "Our Pick" recommendation, and the deal
score are all computed automatically.

**About prices:** a static site can't show each store's exact live price, so
retailer prices are friendly **estimates** (shown with a “≈”) that link to a
precise product search. The **Manufacturer "Buy Direct"** offer links to the
exact product at its real price when a product `url` is set.

## 🗂️ Project structure

```
.
├── index.html / quiz.html / browse.html / deals.html / about.html
├── config.js              # simple settings (product photos on/off)
├── css/styles.css         # dark, neon gaming theme (responsive)
├── images/                # built-in category illustrations (SVG)
│   └── products/          # optional product photos
├── js/
│   ├── data.js            # the catalog + pricing engine (edit products here)
│   ├── components.js      # nav/footer, product cards, compare modal
│   ├── prices.js          # estimates + optional affiliate-feed prices
│   └── home.js / quiz.js / browse.js / deals.js
└── (optional) server/ + feeds/ — advanced affiliate feeds, see below
```

## 🌐 Deploying

It's a plain static site — deploy the folder anywhere:

- **GitHub Pages** — Settings → Pages → deploy from the branch root.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder (no build
  command, no settings needed).

## 💸 (Optional, advanced) Affiliate feeds — earn commission + auto photos

This is **optional** and only for when you want real live prices, automatic
product photos, and affiliate commission on sales. It needs a bit of setup, so
skip it unless you want it.

You join affiliate networks/brand programs (Impact, CJ, Rakuten, Awin, Amazon
Associates, Best Buy…), download their **product feeds**, and this repo turns
them into the site's prices and photos:

```bash
npm run ingest:sample      # try it with the bundled sample data
```

Then set `offersFile: 'data/offers.json'` in `config.js`. For your real feeds,
copy `feeds.config.example.json` to `feeds.config.json`, map each feed's columns,
keep secrets in env vars (`.env.example`), and run `npm run ingest`. A daily
GitHub Action (`.github/workflows/refresh-feeds.yml`) can refresh it for you.

## ⚖️ Disclaimer

Bytes For Gaming is an independent buying guide and is **not affiliated** with any
of the brands or retailers listed. Always confirm price, seller, and warranty on
the retailer's site before purchasing.
