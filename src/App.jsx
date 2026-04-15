import { useState, useRef, useEffect } from "react";

// ── Platform config ──────────────────────────────────────────
const PLATFORMS = [
  { id:"zepto",           name:"Zepto",             emoji:"⚡", color:"#a855f7", bg:"rgba(168,85,247,0.12)",  border:"rgba(168,85,247,0.4)"  },
  { id:"blinkit",         name:"Blinkit",           emoji:"🟡", color:"#eab308", bg:"rgba(234,179,8,0.12)",   border:"rgba(234,179,8,0.4)"   },
  { id:"instamart",       name:"Instamart",         emoji:"🛒", color:"#f97316", bg:"rgba(249,115,22,0.12)",  border:"rgba(249,115,22,0.4)"  },
  { id:"bigbasket",       name:"BigBasket",         emoji:"🧺", color:"#84cc16", bg:"rgba(132,204,22,0.12)",  border:"rgba(132,204,22,0.4)"  },
  { id:"swiggy",          name:"Swiggy",            emoji:"🍊", color:"#fb923c", bg:"rgba(251,146,60,0.12)",  border:"rgba(251,146,60,0.4)"  },
  { id:"amazonnow",       name:"Amazon Now",        emoji:"📦", color:"#ff9900", bg:"rgba(255,153,0,0.12)",   border:"rgba(255,153,0,0.4)"   },
  { id:"flipkartminutes", name:"Flipkart Minutes",  emoji:"🔵", color:"#3b82f6", bg:"rgba(59,130,246,0.12)",  border:"rgba(59,130,246,0.4)"  },
];

const SUGGESTIONS = [
  "Amul Milk 500ml","Eggs 12 pack","Maggi Noodles","Parle-G Biscuits",
  "Dettol Soap","Coke 750ml","Bread","Haldiram Bhujia",
];

const STATUS_META = {
  available:   { label:"In Stock",     icon:"✓", dot:"#22c55e", text:"#4ade80" },
  unavailable: { label:"Out of Stock", icon:"✕", dot:"#ef4444", text:"#f87171" },
  unknown:     { label:"Not Found",    icon:"?", dot:"#6b7280", text:"#94a3b8" },
  loading:     { label:"Checking…",   icon:"…", dot:"#f59e0b", text:"#fbbf24" },
};

// ── Skeleton card ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:20, padding:"20px 18px",
    }}>
      {[70,40,55].map((w,i) => (
        <div key={i} style={{
          height: i===0?18:13, width:`${w}%`, borderRadius:6, marginBottom:10,
          background:"linear-gradient(90deg,#1e2535 25%,#2a3347 50%,#1e2535 75%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.4s infinite",
          animationDelay:`${i*0.15}s`,
        }}/>
      ))}
    </div>
  );
}

// ── Result card ──────────────────────────────────────────────
function PlatformCard({ platform, result, idx }) {
  const sm = STATUS_META[result?.status || "loading"];
  const isAvailable = result?.status === "available";

  return (
    <div style={{
      background: isAvailable ? platform.bg : "rgba(255,255,255,0.02)",
      border: `1px solid ${isAvailable ? platform.border : "rgba(255,255,255,0.07)"}`,
      borderRadius: 20,
      padding: "20px 18px 18px",
      animation: "popIn 0.3s ease forwards",
      animationDelay: `${idx * 0.06}s`,
      opacity: 0,
      WebkitTapHighlightColor: "transparent",
    }}>
      {/* Top row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <span style={{ fontSize:"1.4rem", lineHeight:1 }}>{platform.emoji}</span>
        <span style={{ fontWeight:700, fontSize:"0.95rem", color: platform.color, flex:1 }}>
          {platform.name}
        </span>
        <span style={{
          width:10, height:10, borderRadius:"50%",
          background: sm.dot,
          boxShadow: `0 0 8px ${sm.dot}`,
          flexShrink:0,
        }}/>
      </div>

      {/* Status */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:6,
        background: isAvailable ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
        borderRadius:99, padding:"4px 12px", marginBottom:10,
      }}>
        <span style={{ color: sm.text, fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.04em" }}>
          {sm.label}
        </span>
      </div>

      {/* Price */}
      {result?.price && (
        <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em", marginBottom:6 }}>
          {result.price}
        </div>
      )}

      {/* Note */}
      {result?.note && (
        <div style={{ fontSize:"0.8rem", color:"#64748b", lineHeight:1.5 }}>
          {result.note}
        </div>
      )}

      {/* Link */}
      {result?.url && (
        <a href={result.url} target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:4, marginTop:10,
          fontSize:"0.78rem", fontWeight:700, color: platform.color,
          textDecoration:"none",
        }}>
          Open in app <span style={{ fontSize:"0.7rem" }}>↗</span>
        </a>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState(null);   // {summary, platforms:[]}
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [focused, setFocused]   = useState(false);
  const inputRef = useRef();
  const resultsRef = useRef();

  const inStock = results?.platforms?.filter(r => r.status === "available").length ?? 0;

  const doSearch = async (q) => {
    const trimmed = (q || query).trim();
    if (!trimmed || loading) return;
    inputRef.current?.blur();
    setLoading(true);
    setError(null);
    setResults({ summary: null, platforms: PLATFORMS.map(p => ({ id:p.id, status:"loading" })) });

    // Scroll to results on mobile
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);

    const systemPrompt = `You are a product availability checker for quick-commerce platforms in Bangalore, India.

The user will give you a product name. Use web_search to check availability on these 7 platforms in Bangalore:
1. Zepto (zepto.com)
2. Blinkit (blinkit.com)  
3. Swiggy Instamart (swiggy.com/instamart)
4. BigBasket (bigbasket.com)
5. Swiggy (swiggy.com)
6. Amazon Now / Amazon Fresh (amazon.in/now)
7. Flipkart Minutes (flipkart.com/minutes)

Search strategy: search "[product] [platform] Bangalore" and "[product] price [platform]" for each.

Respond ONLY with valid JSON — no markdown fences, no preamble:
{
  "summary": "1-2 sentence plain-English summary",
  "platforms": [
    { "id":"zepto",           "status":"available|unavailable|unknown", "price":"₹XX or null", "note":"≤10 words", "url":"string or null" },
    { "id":"blinkit",         "status":"...", "price":null, "note":"...", "url":null },
    { "id":"instamart",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"bigbasket",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"swiggy",          "status":"...", "price":null, "note":"...", "url":null },
    { "id":"amazonnow",       "status":"...", "price":null, "note":"...", "url":null },
    { "id":"flipkartminutes", "status":"...", "price":null, "note":"...", "url":null }
  ]
}

Rules:
- "available" = listed and likely in stock
- "unavailable" = found but out of stock  
- "unknown" = no reliable data found
- Never fabricate prices. Use null if unsure.
- Keep notes under 10 words.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role:"user", content:`Check availability in Bangalore: ${trimmed}` }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const textBlock = data.content?.filter(b => b.type === "text").pop();
      if (!textBlock) throw new Error("No response received");

      let raw = textBlock.text.trim().replace(/```json|```/gi, "").trim();
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);

      setResults(parsed);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setResults(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div style={{ minHeight:"100dvh", background:"#080c14", fontFamily:"'Plus Jakarta Sans',sans-serif", paddingBottom:120 }}>

      {/* Ambient glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)", top:-120, left:-100 }}/>
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(234,179,8,0.10) 0%,transparent 70%)", bottom:80, right:-60 }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:540, margin:"0 auto", padding:"0 16px" }}>

        {/* ── Header ── */}
        <header style={{ textAlign:"center", padding:"48px 0 32px" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
            borderRadius:99, padding:"5px 14px", marginBottom:16,
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite", display:"inline-block" }}/>
            <span style={{ color:"#a5b4fc", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em" }}>
              📍 BANGALORE
            </span>
          </div>

          <h1 style={{ fontSize:"clamp(2.2rem,8vw,3rem)", fontWeight:800, letterSpacing:"-0.04em", color:"#f1f5f9", lineHeight:1.1, marginBottom:10 }}>
            <span style={{ background:"linear-gradient(135deg,#818cf8,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Quick</span>Check
          </h1>
          <p style={{ color:"#475569", fontSize:"0.88rem", lineHeight:1.5 }}>
            Search once · Check 7 platforms instantly
          </p>

          {/* Platform pills */}
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:6, marginTop:18 }}>
            {PLATFORMS.map(p => (
              <span key={p.id} style={{
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:99, padding:"3px 10px", fontSize:"0.72rem", color:"#475569",
              }}>
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </header>

        {/* ── Quick suggestions ── */}
        {!results && !loading && (
          <div style={{ marginBottom:24 }}>
            <p style={{ color:"#334155", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", marginBottom:10, textAlign:"center" }}>
              POPULAR SEARCHES
            </p>
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                  style={{
                    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
                    borderRadius:99, padding:"8px 16px", fontSize:"0.82rem", color:"#94a3b8",
                    whiteSpace:"nowrap", cursor:"pointer", flexShrink:0,
                    WebkitTapHighlightColor:"transparent",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:16, padding:"14px 16px", marginBottom:16, fontSize:"0.85rem", color:"#fca5a5",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Summary bar ── */}
        {results?.summary && !loading && (
          <div ref={resultsRef} style={{
            background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:16, padding:"14px 16px", marginBottom:16,
            display:"flex", alignItems:"flex-start", gap:10,
            animation:"fadeUp 0.4s ease",
          }}>
            <span style={{ color:"#22c55e", fontSize:"0.7rem", marginTop:2, animation:"pulse 2s infinite", flexShrink:0 }}>●</span>
            <p style={{ fontSize:"0.85rem", color:"#94a3b8", lineHeight:1.55, flex:1 }}>{results.summary}</p>
            <span style={{
              background:"rgba(99,102,241,0.2)", color:"#a5b4fc",
              borderRadius:99, padding:"3px 10px", fontSize:"0.75rem", fontWeight:700,
              whiteSpace:"nowrap", flexShrink:0,
            }}>
              {inStock}/{PLATFORMS.length}
            </span>
          </div>
        )}
        {results && !results.summary && <div ref={resultsRef} />}

        {/* ── Results grid ── */}
        {(results || loading) && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {PLATFORMS.map((p, i) => {
              const res = results?.platforms?.find(r => r.id === p.id);
              return loading && (!results?.platforms || res?.status === "loading")
                ? <SkeletonCard key={p.id} />
                : <PlatformCard key={p.id} platform={p} result={res} idx={i} />;
            })}
          </div>
        )}

        {/* ── Disclaimer ── */}
        {results && (
          <p style={{ textAlign:"center", color:"#1e2535", fontSize:"0.72rem", lineHeight:1.6, padding:"0 8px", marginBottom:8 }}>
            ⚡ AI-powered via web search — not live inventory feeds.<br/>Confirm stock in the app before ordering.
          </p>
        )}
      </div>

      {/* ── Sticky bottom search bar ── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"linear-gradient(to top, #080c14 60%, transparent)",
        padding:"16px 16px calc(16px + env(safe-area-inset-bottom))",
      }}>
        <div style={{ maxWidth:540, margin:"0 auto", display:"flex", gap:10, alignItems:"center" }}>
          <div style={{
            flex:1, display:"flex", alignItems:"center", gap:10,
            background: focused ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius:16, padding:"0 16px",
            transition:"all 0.2s",
          }}>
            <span style={{ fontSize:"1rem", opacity:0.5, flexShrink:0 }}>🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What are you looking for?"
              disabled={loading}
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                color:"#f1f5f9", fontSize:"0.95rem", padding:"16px 0",
                fontFamily:"inherit",
              }}
            />
            {query && !loading && (
              <button onClick={clear} style={{
                background:"none", border:"none", color:"#475569",
                cursor:"pointer", padding:"4px", fontSize:"0.85rem", flexShrink:0,
                WebkitTapHighlightColor:"transparent",
              }}>✕</button>
            )}
          </div>

          <button
            onClick={() => doSearch()}
            disabled={loading || !query.trim()}
            style={{
              background: loading || !query.trim()
                ? "rgba(99,102,241,0.3)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:16,
              color:"#fff", fontWeight:700, fontSize:"0.9rem",
              padding:"0 20px", height:54, minWidth:70,
              cursor: loading || !query.trim() ? "default" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, WebkitTapHighlightColor:"transparent",
              transition:"all 0.2s",
            }}>
            {loading
              ? <span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"block" }}/>
              : "Go"}
          </button>
        </div>
      </div>
    </div>
  );
}
