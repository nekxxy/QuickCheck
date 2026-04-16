import { useState, useRef, useCallback, useMemo, memo } from "react";

/* ── Constants ──────────────────────────────────────────── */
const PLATFORMS = [
  { id:"zepto",           name:"Zepto",            emoji:"⚡", color:"#a855f7", bg:"rgba(168,85,247,0.11)", border:"rgba(168,85,247,0.38)" },
  { id:"blinkit",         name:"Blinkit",          emoji:"🟡", color:"#eab308", bg:"rgba(234,179,8,0.11)",  border:"rgba(234,179,8,0.38)"  },
  { id:"instamart",       name:"Instamart",        emoji:"🛒", color:"#f97316", bg:"rgba(249,115,22,0.11)", border:"rgba(249,115,22,0.38)" },
  { id:"bigbasket",       name:"BigBasket",        emoji:"🧺", color:"#84cc16", bg:"rgba(132,204,22,0.11)", border:"rgba(132,204,22,0.38)" },
  { id:"swiggy",          name:"Swiggy",           emoji:"🍊", color:"#fb923c", bg:"rgba(251,146,60,0.11)", border:"rgba(251,146,60,0.38)" },
  { id:"amazonnow",       name:"Amazon Now",       emoji:"📦", color:"#ff9900", bg:"rgba(255,153,0,0.11)",  border:"rgba(255,153,0,0.38)"  },
  { id:"flipkartminutes", name:"Flipkart Minutes", emoji:"🔵", color:"#3b82f6", bg:"rgba(59,130,246,0.11)", border:"rgba(59,130,246,0.38)" },
];

const PLATFORM_MAP = new Map(PLATFORMS.map(p => [p.id, p]));

const SUGGESTIONS = [
  "Amul Milk 500ml","Eggs 12 pack","Maggi Noodles","Parle-G",
  "Dettol Soap","Coke 750ml","Bread Loaf","Haldiram Bhujia",
  "Colgate Toothpaste","Paracetamol 500mg",
];

const STATUS_META = {
  available:   { label:"In Stock",     dot:"#22c55e", text:"#4ade80" },
  unavailable: { label:"Out of Stock", dot:"#ef4444", text:"#f87171" },
  unknown:     { label:"Not Found",    dot:"#4b5563", text:"#9ca3af" },
  loading:     { label:"Checking…",   dot:"#f59e0b", text:"#fbbf24" },
};

const SYSTEM_PROMPT = `You are a product availability checker for quick-commerce platforms in Bangalore, India.

Given a product name, use web_search to check availability on these 7 platforms in Bangalore:
1. Zepto (zepto.com)
2. Blinkit (blinkit.com)
3. Swiggy Instamart (swiggy.com/instamart)
4. BigBasket (bigbasket.com)
5. Swiggy (swiggy.com)
6. Amazon Now / Amazon Fresh (amazon.in)
7. Flipkart Minutes (flipkart.com/minutes)

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "summary": "1-2 sentence plain summary",
  "platforms": [
    { "id":"zepto",           "status":"available|unavailable|unknown", "price":"₹XX or null", "note":"10 words max", "url":"string or null" },
    { "id":"blinkit",         "status":"...", "price":null, "note":"...", "url":null },
    { "id":"instamart",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"bigbasket",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"swiggy",          "status":"...", "price":null, "note":"...", "url":null },
    { "id":"amazonnow",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"flipkartminutes", "status":"...", "price":null, "note":"...", "url":null }
  ]
}
Rules: "available"=listed+in stock, "unavailable"=found but OOS, "unknown"=no data. Never fabricate prices.`;

const HISTORY_KEY = "qc_recent";
const getHistory  = () => {
  try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
};
const pushHistory = (q) => {
  try {
    const prev = getHistory().filter(x => x.toLowerCase() !== q.toLowerCase());
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...prev].slice(0, 6)));
  } catch { /* ignore */ }
};

const parsePrice = (str) => {
  if (!str) return null;
  const n = parseFloat(str.replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
};

/* ── SkeletonCard ───────────────────────────────────────── */
const SkeletonCard = memo(() => (
  <div className="skeleton-card">
    <div className="skel-line" style={{ height:14, width:"60%", animationDelay:"0s" }} />
    <div className="skel-line" style={{ height:11, width:"40%", animationDelay:"0.12s" }} />
    <div className="skel-line" style={{ height:11, width:"70%", animationDelay:"0.24s" }} />
  </div>
));

/* ── PlatformCard ───────────────────────────────────────── */
const PlatformCard = memo(({ platform, result, isBest, idx }) => {
  const sm          = STATUS_META[result?.status || "loading"];
  const isAvailable = result?.status === "available";

  return (
    <div
      className={`platform-card${isAvailable ? " available" : ""}`}
      style={{
        "--card-bg":     isAvailable ? platform.bg     : "rgba(255,255,255,0.02)",
        "--card-border": isAvailable ? platform.border : "rgba(255,255,255,0.07)",
        animationDelay:  `${idx * 0.055}s`,
      }}
    >
      <div className="card-top">
        <span className="card-emoji">{platform.emoji}</span>
        <span className="card-name" style={{ color: platform.color }}>{platform.name}</span>
        <span className="card-dot" style={{ background: sm.dot, boxShadow: `0 0 7px ${sm.dot}` }} />
      </div>

      <div className={`status-badge${isAvailable ? " available" : ""}`}>
        <span className="status-label" style={{ color: sm.text }}>{sm.label}</span>
      </div>

      {result?.price && (
        <div className="card-price">
          {result.price}
          {isBest && <span className="best-badge">BEST</span>}
        </div>
      )}

      {result?.note && <div className="card-note">{result.note}</div>}

      {result?.url && (
        <a href={result.url} target="_blank" rel="noopener noreferrer"
           className="card-link" style={{ color: platform.color }}>
          Open ↗
        </a>
      )}
    </div>
  );
});

/* ── BestPriceBanner ────────────────────────────────────── */
const BestPriceBanner = memo(({ best }) => {
  if (!best) return null;
  const p = PLATFORM_MAP.get(best.id);
  return (
    <div className="best-price-banner">
      <span>🏷️</span>
      <span className="best-price-label">Best price</span>
      <span className="best-price-val">{best.price}</span>
      <span className="best-price-on">on {p?.name}</span>
    </div>
  );
});

/* ── App ────────────────────────────────────────────────── */
export default function App() {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [focused,     setFocused]     = useState(false);
  const [filterStock, setFilterStock] = useState(false);
  const [history,     setHistory]     = useState(getHistory);
  const [lastQuery,   setLastQuery]   = useState("");

  const inputRef  = useRef();
  const abortRef  = useRef(null);
  const resultRef = useRef();

  const platformResults = useMemo(() => {
    if (!results?.platforms) return new Map();
    return new Map(results.platforms.map(r => [r.id, r]));
  }, [results]);

  const bestPlatform = useMemo(() => {
    if (!results?.platforms) return null;
    let best = null, bestPrice = Infinity;
    for (const r of results.platforms) {
      if (r.status !== "available") continue;
      const n = parsePrice(r.price);
      if (n !== null && n < bestPrice) { bestPrice = n; best = r; }
    }
    return best;
  }, [results]);

  const visiblePlatforms = useMemo(() => (
    filterStock
      ? PLATFORMS.filter(p => platformResults.get(p.id)?.status === "available")
      : PLATFORMS
  ), [filterStock, platformResults]);

  const inStock = useMemo(() => (
    results?.platforms?.filter(r => r.status === "available").length ?? 0
  ), [results]);

  const doSearch = useCallback(async (overrideQ) => {
    const trimmed = (overrideQ ?? query).trim();
    if (!trimmed || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (navigator?.vibrate) navigator.vibrate(10);
    inputRef.current?.blur();

    setLoading(true);
    setError(null);
    setFilterStock(false);
    setLastQuery(trimmed);
    setResults({
      summary: null,
      platforms: PLATFORMS.map(p => ({ id: p.id, status: "loading" })),
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Check Bangalore availability: ${trimmed}` }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const textBlock = data.content?.filter(b => b.type === "text").pop();
      if (!textBlock) throw new Error("No response received.");

      let raw  = textBlock.text.trim().replace(/```json|```/gi, "").trim();
      const m  = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : raw);

      setResults(parsed);
      pushHistory(trimmed);
      setHistory(getHistory());
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message || "Something went wrong. Try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setQuery("");
    setResults(null);
    setError(null);
    setFilterStock(false);
    setLastQuery("");
    inputRef.current?.focus();
  }, []);

  const clearHistory = useCallback(() => {
    try { sessionStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
    setHistory([]);
  }, []);

  return (
    <div className="app">
      {/* Ambient glows */}
      <div className="glow-wrap">
        <div className="glow-1" />
        <div className="glow-2" />
      </div>

      <div className="content">

        {/* Header */}
        <header className="header">
          <div className="location-badge">
            <span className="location-dot" />
            <span className="location-text">📍 BANGALORE</span>
          </div>
          <h1 className="title">
            <span className="title-accent">Quick</span>Check
          </h1>
          <p className="subtitle">Search once · Check 7 platforms instantly</p>
          <div className="platforms-row">
            {PLATFORMS.map(p => (
              <span key={p.id} className="platform-pill">{p.emoji} {p.name}</span>
            ))}
          </div>
        </header>

        {/* Recent searches */}
        {history.length > 0 && !results && !loading && (
          <div className="recent-wrap">
            <div className="recent-header">
              <span className="recent-label">RECENT</span>
              <button className="recent-clear" onClick={clearHistory}>Clear</button>
            </div>
            <div className="recent-scroll">
              {history.map(h => (
                <button key={h} className="recent-btn"
                  onClick={() => { setQuery(h); doSearch(h); }}>
                  🕐 {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!results && !loading && (
          <div className="suggestions-wrap">
            <p className="suggestions-label">POPULAR SEARCHES</p>
            <div className="suggestions-scroll">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-btn"
                  onClick={() => { setQuery(s); doSearch(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-box">
            <div className="error-text">⚠️ {error}</div>
            <button className="retry-btn" onClick={() => doSearch()}>↺ Try Again</button>
          </div>
        )}

        {/* Results toolbar */}
        {results && (
          <div ref={resultRef} className="toolbar">
            <div className="result-meta">
              <span className="result-count">{inStock}/{PLATFORMS.length} in stock</span>
              {lastQuery && <span className="result-query">"{lastQuery}"</span>}
            </div>
            <button
              className={`filter-toggle${filterStock ? " active" : ""}`}
              onClick={() => setFilterStock(v => !v)}
            >
              {filterStock ? "✓ Available" : "All"}
            </button>
          </div>
        )}

        {/* Summary */}
        {results?.summary && !loading && (
          <div className="summary-bar">
            <span className="summary-dot">●</span>
            <p className="summary-text">{results.summary}</p>
          </div>
        )}

        {/* Best price banner */}
        {!loading && <BestPriceBanner best={bestPlatform} />}

        {/* Cards grid */}
        {(results || loading) && (
          <div className="cards-grid">
            {(loading ? PLATFORMS : visiblePlatforms).map((p, i) => {
              const res = platformResults.get(p.id);
              if (loading && res?.status === "loading") {
                return <SkeletonCard key={p.id} />;
              }
              return (
                <PlatformCard
                  key={p.id}
                  platform={p}
                  result={res}
                  isBest={bestPlatform?.id === p.id}
                  idx={i}
                />
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        {results && !loading && (
          <p className="disclaimer">
            ⚡ AI-powered via web search — not live inventory.<br />
            Confirm stock in the app before ordering.
          </p>
        )}

      </div>

      {/* Bottom search dock */}
      <div className="search-dock">
        <div className="search-inner">
          <div className={`search-field${focused ? " focused" : ""}`}>
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              className="search-input"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="What are you looking for?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={loading}
            />
            {query && !loading && (
              <button className="clear-btn" onClick={clear}>✕</button>
            )}
          </div>

          <button
            className="go-btn"
            onClick={() => doSearch()}
            disabled={loading || !query.trim()}
          >
            {loading ? <span className="spinner" /> : "Go"}
          </button>
        </div>
      </div>
    </div>
  );
}
