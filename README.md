# ⚡ QuickCheck — Price Comparison Across 8 Stores

Compare the same product's price across **Amazon, Flipkart, Croma, Tata CLiQ,
Zepto, Blinkit, BigBasket & Instamart** — sorted by price, with a 6-month
price-history chart showing the lowest-ever price and when it happened.

**Live:** https://nekxxy.github.io/QuickCheck/

## Features

- 🔍 **Product search** with token matching over names, brands and keywords, plus popular-search shortcuts
- 🏷️ **Same product, every store** — offers sorted low → high, best price highlighted, "+₹" difference vs the best on every other store
- 📈 **Price history** — 6-month best-price chart with hover tooltip, a gold marker on the lowest-ever price (with date & store), plus average/highest stats and an accessible table view
- 🗂️ Category filters (Mobiles, Electronics, Appliances, Grocery, Essentials) and sorting (price, savings, name)
- 🔗 **Visit ↗** links open the product search on the real store
- 🌗 Light/dark theme (palette borrowed from [wc26.watch](https://wc26.watch)), fully responsive

> **Note:** pricing is curated demo data — retailers don't expose public pricing
> APIs and block client-side scraping, so a static site can't fetch live prices.
> Price history is generated deterministically per product. Swap
> `src/data/products.js` for a real backend/API to go live.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run lint
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app
and publishes `dist/` to GitHub Pages via the `gh-pages` branch.

## Stack

React 19 · Vite 8 · hand-rolled SVG chart (no chart library) · zero runtime dependencies beyond React
