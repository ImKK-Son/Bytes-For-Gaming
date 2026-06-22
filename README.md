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
  "Our Pick" that balances a fair price with safety — because the cheapest
  option is not always the safest.
- **🔥 Deals page** — products ranked by how much they save off MSRP.
- **🛒 Browse & filter** — filter by category and brand, search, and sort by
  rating, deal, or price.
- **🤝 Consumer-protection guide** — a checklist to spot scams, gray-market
  gear, and fake discounts.

## 🚀 Running it

This is a **zero-dependency static site** — no build step, no install.

**Option A — just open it:** double-click `index.html`.

**Option B — local server (recommended):**

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

## 🌐 Deploying

It deploys anywhere that serves static files:

- **GitHub Pages** — Settings → Pages → deploy from the branch root.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or point
  it at the repo (no build command needed).

## 🗂️ Project structure

```
.
├── index.html        # Landing page: hero, value props, categories, deals, featured
├── quiz.html         # Categorized "Find My Gear" quiz
├── browse.html       # Browse / filter / compare all products
├── deals.html        # Best savings off MSRP
├── about.html        # How we protect you + anti-rip-off checklist
├── css/
│   └── styles.css    # Dark, neon gaming theme (responsive)
└── js/
    ├── data.js       # Product catalog, retailers, and the pricing engine
    ├── components.js # Shared UI: nav/footer, product cards, compare modal
    ├── home.js       # Home-page widgets
    ├── quiz.js       # Quiz definitions + product-matching engine
    ├── browse.js     # Browse filtering/sorting
    └── deals.js      # Deals ranking
```

## 🔧 Adding or editing products

Everything lives in `js/data.js`. Add an object to the `PRODUCTS` array:

```js
{
  id: 'unique-id',
  name: 'Brand Product Name',
  brand: 'Razer',            // must exist in BRANDS
  category: 'keyboard',      // must exist in CATEGORIES
  price: 99.99,              // typical street price
  msrp: 119.99,             // list price (drives the deal/savings math)
  rating: 4.6,              // out of 5
  highlight: 'One-line pitch shown on the card.',
  features: ['Feature 1', 'Feature 2'],
  tags: ['mechanical', 'tkl', 'wired'],   // used by the quiz matcher
  valueNote: 'Buyer-focused note shown in the compare modal.'
}
```

Pricing, store offers, the lowest/most-trusted badges, the "Our Pick"
recommendation, and the deal score are all computed automatically from `price`
and `msrp` — no manual per-store entry needed.

### How the quiz matches

Quiz options in `js/quiz.js` carry **tag weights** that are matched against each
product's `tags`. Scores combine tag overlap, a within-budget bonus, and the
review rating. Keep an option's tags consistent with the product tags so matches
stay accurate.

## 💵 A note on pricing

We do not scrape live prices (there is no backend). In-app prices are realistic,
**stable estimates** generated from each product's `price`/`msrp` to demonstrate
comparisons. Every **"View Deal" / "Buy Direct"** button links to the retailer's
**live search results**, so shoppers always see real-time pricing and current
deals — and links never 404 on a discontinued SKU.

## ⚖️ Disclaimer

Bytes For Gaming is an independent buying guide and is **not affiliated** with
any of the brands listed. Always confirm price, seller, and warranty on the
retailer's site before purchasing.
