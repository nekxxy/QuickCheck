import { useEffect, useMemo, useState } from "react";
import { PLATFORMS, PLATFORM_IDS, PRODUCTS, CATEGORIES, sortedOffers } from "./data/products";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";

const SORTS = [
  { id: "price-asc",  label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "savings",    label: "Biggest Savings" },
  { id: "name",       label: "Name: A to Z" },
];

const POPULAR = ["iPhone", "Headphones", "Milk Butter", "Maggi", "Air Fryer", "Shampoo", "Basmati Rice", "TV"];

const initialTheme = () => {
  const saved = localStorage.getItem("qc_theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("price-asc");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("qc_theme", theme);
  }, [theme]);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = PRODUCTS.filter(p => {
      if (category !== "All" && p.category !== category) return false;
      if (!tokens.length) return true;
      const hay = `${p.name} ${p.variant} ${p.category} ${p.keywords}`.toLowerCase();
      return tokens.every(t => hay.includes(t));
    });
    const bestOf = p => sortedOffers(p)[0].price;
    const savings = p => {
      const o = sortedOffers(p);
      return (o[o.length - 1].price - o[0].price) / o[o.length - 1].price;
    };
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "price-desc": return bestOf(b) - bestOf(a);
        case "savings":    return savings(b) - savings(a);
        case "name":       return a.name.localeCompare(b.name);
        default:           return bestOf(a) - bestOf(b);
      }
    });
  }, [query, category, sortBy]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-bolt">⚡</span>
          <span className="brand-name"><b>Quick</b>Check</span>
        </div>
        <button
          className="theme-toggle glass"
          onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <section className="hero">
        <h1>One search.<br /><span className="hero-accent">Eight stores.</span> Best price.</h1>
        <p className="hero-sub">
          Compare the same product across Amazon, Flipkart, Croma, Tata CLiQ, Zepto,
          Blinkit, BigBasket &amp; Instamart — sorted by price, with 6-month history.
        </p>

        <div className="searchbar glass">
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products — iPhone, Maggi, shampoo…"
            aria-label="Search products"
            enterKeyHint="search"
          />
          {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">✕</button>}
        </div>

        <div className="popular">
          {POPULAR.map(s => (
            <button key={s} className="pill" onClick={() => setQuery(s)}>{s}</button>
          ))}
        </div>

        <div className="store-strip" aria-label="Stores compared">
          {PLATFORM_IDS.map(id => (
            <span key={id} className="store-chip" style={{ "--store": PLATFORMS[id].color }}>{PLATFORMS[id].name}</span>
          ))}
        </div>
      </section>

      <section className="controls">
        <div className="cat-row" role="tablist" aria-label="Categories">
          {CATEGORIES.map(c => (
            <button
              key={c} role="tab" aria-selected={category === c}
              className={`pill ${category === c ? "pill-on" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="sort-row">
          <span className="result-count">{results.length} product{results.length === 1 ? "" : "s"}</span>
          <label className="sort-label">
            Sort
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort products">
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {results.length > 0 ? (
        <main className="grid">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} />
          ))}
        </main>
      ) : (
        <div className="empty glass">
          <span className="empty-emoji">🕵️</span>
          <p>No products match “{query}”.</p>
          <button className="pill pill-on" onClick={() => { setQuery(""); setCategory("All"); }}>Reset search</button>
        </div>
      )}

      <footer className="footer">
        <p>⚡ QuickCheck · demo pricing data for illustration — confirm live prices on the store before buying.</p>
        <p className="footer-dim">UI theme inspired by wc26.watch</p>
      </footer>

      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
