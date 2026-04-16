import { useState, useRef } from "react";

const PLATFORMS = [
  { id:"zepto",           name:"Zepto",            emoji:"⚡", color:"#a855f7" },
  { id:"blinkit",         name:"Blinkit",          emoji:"🟡", color:"#eab308" },
  { id:"instamart",       name:"Instamart",        emoji:"🛒", color:"#f97316" },
  { id:"bigbasket",       name:"BigBasket",        emoji:"🧺", color:"#84cc16" },
  { id:"swiggy",          name:"Swiggy",           emoji:"🍊", color:"#fb923c" },
  { id:"amazonnow",       name:"Amazon Now",       emoji:"📦", color:"#ff9900" },
  { id:"flipkartminutes", name:"Flipkart Minutes", emoji:"🔵", color:"#3b82f6" },
];

const SUGGESTIONS = [
  "Amul Milk 500ml","Eggs 12 pack","Maggi Noodles","Parle-G",
  "Dettol Soap","Coke 750ml","Bread Loaf","Haldiram Bhujia",
];

const DOT_COLOR = { available:"#22c55e", unavailable:"#ef4444", unknown:"#6b7280", loading:"#f59e0b" };
const STATUS_LABEL = { available:"In Stock", unavailable:"Out of Stock", unknown:"Not Found", loading:"Checking…" };

const PROMPT = `You are a product availability checker for quick-commerce platforms in Bangalore, India.

Use web_search to check availability on these 7 platforms in Bangalore:
1. Zepto (zepto.com)
2. Blinkit (blinkit.com)
3. Swiggy Instamart (swiggy.com/instamart)
4. BigBasket (bigbasket.com)
5. Swiggy (swiggy.com)
6. Amazon Now (amazon.in)
7. Flipkart Minutes (flipkart.com/minutes)

Respond ONLY with valid JSON (no markdown):
{
  "summary": "1-2 sentence summary",
  "platforms": [
    {"id":"zepto","status":"available|unavailable|unknown","price":"₹XX or null","note":"short note","url":"url or null"},
    {"id":"blinkit","status":"...","price":null,"note":"...","url":null},
    {"id":"instamart","status":"...","price":null,"note":"...","url":null},
    {"id":"bigbasket","status":"...","price":null,"note":"...","url":null},
    {"id":"swiggy","status":"...","price":null,"note":"...","url":null},
    {"id":"amazonnow","status":"...","price":null,"note":"...","url":null},
    {"id":"flipkartminutes","status":"...","price":null,"note":"...","url":null}
  ]
}
Rules: never fabricate prices. notes max 10 words.`;

export default function App() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const search = async (q) => {
    const text = (q || query).trim();
    if (!text || loading) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    inputRef.current?.blur();
    setLoading(true);
    setError(null);
    setResults({ summary: null, platforms: PLATFORMS.map(p => ({ id: p.id, status: "loading" })) });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: abortRef.current.signal,
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Check Bangalore availability: ${text}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const block = [...(data.content || [])].reverse().find(b => b.type === "text");
      if (!block) throw new Error("No response");
      const raw = block.text.replace(/```json|```/gi, "").trim();
      const m = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : raw);
      setResults(parsed);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message || "Something went wrong.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setQuery(""); setResults(null); setError(null);
    inputRef.current?.focus();
  };

  const platformMap = {};
  (results?.platforms || []).forEach(r => { platformMap[r.id] = r; });

  return (
    <div style={{ minHeight:"100dvh", background:"#080c14", color:"#e2e8f0",
      fontFamily:"'Plus Jakarta Sans',sans-serif", paddingBottom:120 }}>

      {/* Glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:360, height:360, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",
          top:-100, left:-80 }}/>
        <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(234,179,8,0.1) 0%,transparent 70%)",
          bottom:80, right:-50 }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:540, margin:"0 auto", padding:"0 16px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"32px 0 22px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.28)",
            borderRadius:99, padding:"4px 12px", marginBottom:12 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e",
              display:"inline-block", animation:"pulse 2s infinite" }}/>
            <span style={{ color:"#a5b4fc", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em" }}>
              📍 BANGALORE
            </span>
          </div>
          <h1 style={{ fontSize:"clamp(2rem,8vw,2.8rem)", fontWeight:800, letterSpacing:"-0.04em",
            color:"#f1f5f9", lineHeight:1.1, margin:"0 0 6px" }}>
            <span style={{ background:"linear-gradient(135deg,#818cf8,#a855f7,#ec4899)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Quick</span>Check
          </h1>
          <p style={{ color:"#475569", fontSize:"0.84rem", margin:"0 0 14px" }}>
            Search once · Check 7 platforms instantly
          </p>
          {/* Platform pills */}
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:5 }}>
            {PLATFORMS.map(p => (
              <span key={p.id} style={{ background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)", borderRadius:99,
                padding:"3px 9px", fontSize:"0.68rem", color:"#475569" }}>
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {!results && !loading && (
          <div style={{ marginBottom:20 }}>
            <p style={{ color:"#334155", fontSize:"0.68rem", fontWeight:700,
              letterSpacing:"0.1em", marginBottom:8, textAlign:"center" }}>
              POPULAR SEARCHES
            </p>
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setQuery(s); search(s); }}
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:99, padding:"8px 14px", fontSize:"0.8rem", color:"#94a3b8",
                    whiteSpace:"nowrap", cursor:"pointer", flexShrink:0,
                    fontFamily:"inherit", WebkitTapHighlightColor:"transparent" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:14, padding:"14px 16px", marginBottom:14, fontSize:"0.84rem", color:"#fca5a5" }}>
            ⚠️ {error}
            <button onClick={() => search()} style={{ display:"block", marginTop:8,
              background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:8, color:"#fca5a5", fontSize:"0.78rem", fontWeight:600,
              padding:"6px 14px", cursor:"pointer", fontFamily:"inherit" }}>
              ↺ Retry
            </button>
          </div>
        )}

        {/* Summary */}
        {results?.summary && !loading && (
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:14, padding:"12px 14px", marginBottom:12,
            display:"flex", gap:8, alignItems:"flex-start" }}>
            <span style={{ color:"#22c55e", fontSize:"0.65rem", marginTop:3, flexShrink:0 }}>●</span>
            <p style={{ fontSize:"0.82rem", color:"#94a3b8", lineHeight:1.55, margin:0 }}>
              {results.summary}
            </p>
            <span style={{ background:"rgba(99,102,241,0.18)", color:"#a5b4fc",
              borderRadius:99, padding:"2px 9px", fontSize:"0.72rem", fontWeight:700,
              whiteSpace:"nowrap", flexShrink:0 }}>
              {(results.platforms || []).filter(r => r.status === "available").length}/{PLATFORMS.length}
            </span>
          </div>
        )}

        {/* Cards */}
        {(results || loading) && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {PLATFORMS.map((p, i) => {
              const r = platformMap[p.id];
              const status = r?.status || "loading";
              const dot = DOT_COLOR[status];
              const available = status === "available";

              if (!r || status === "loading") {
                return (
                  <div key={p.id} style={{ background:"rgba(255,255,255,0.02)",
                    border:"1px solid rgba(255,255,255,0.05)", borderRadius:18, padding:"16px 14px" }}>
                    {[60,40,70].map((w,j) => (
                      <div key={j} style={{ height: j===0?13:10, width:`${w}%`, borderRadius:5,
                        marginBottom:8, background:"linear-gradient(90deg,#1a2033 25%,#252e44 50%,#1a2033 75%)",
                        backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite",
                        animationDelay:`${j*0.12}s` }}/>
                    ))}
                  </div>
                );
              }

              return (
                <div key={p.id} style={{
                  background: available ? `rgba(${p.color === "#a855f7" ? "168,85,247" : p.color === "#eab308" ? "234,179,8" : p.color === "#f97316" ? "249,115,22" : p.color === "#84cc16" ? "132,204,22" : p.color === "#fb923c" ? "251,146,60" : p.color === "#ff9900" ? "255,153,0" : "59,130,246"},0.1)` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${available ? p.color + "55" : "rgba(255,255,255,0.07)"}`,
                  borderRadius:18, padding:"16px 14px",
                  animation:"popIn 0.28s ease forwards",
                  animationDelay:`${i*0.05}s`, opacity:0 }}>

                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:"1.25rem", lineHeight:1 }}>{p.emoji}</span>
                    <span style={{ fontWeight:700, fontSize:"0.86rem", color:p.color, flex:1 }}>{p.name}</span>
                    <span style={{ width:9, height:9, borderRadius:"50%", background:dot,
                      boxShadow:`0 0 6px ${dot}`, flexShrink:0 }}/>
                  </div>

                  <span style={{ display:"inline-block",
                    background: available ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                    borderRadius:99, padding:"3px 10px", marginBottom:7,
                    fontSize:"0.7rem", fontWeight:700, color: DOT_COLOR[status],
                    letterSpacing:"0.04em" }}>
                    {STATUS_LABEL[status]}
                  </span>

                  {r.price && (
                    <div style={{ fontSize:"1.15rem", fontWeight:800, color:"#f1f5f9",
                      letterSpacing:"-0.02em", marginBottom:4 }}>{r.price}</div>
                  )}
                  {r.note && (
                    <div style={{ fontSize:"0.74rem", color:"#475569", lineHeight:1.45 }}>{r.note}</div>
                  )}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:3, marginTop:8,
                        fontSize:"0.72rem", fontWeight:700, color:p.color, textDecoration:"none" }}>
                      Open ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {results && !loading && (
          <p style={{ textAlign:"center", color:"#1e293b", fontSize:"0.7rem",
            lineHeight:1.6, paddingBottom:4 }}>
            ⚡ AI-powered via web search — not live inventory. Confirm before ordering.
          </p>
        )}
      </div>

      {/* Sticky search bar */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"linear-gradient(to top,#080c14 55%,transparent)",
        padding:`14px 16px calc(14px + env(safe-area-inset-bottom))` }}>
        <div style={{ maxWidth:540, margin:"0 auto", display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:10,
            background: focused ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius:14, padding:"0 14px", transition:"all 0.2s" }}>
            <span style={{ fontSize:"1rem", opacity:0.4, flexShrink:0 }}>🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What are you looking for?"
              disabled={loading}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              style={{ flex:1, background:"transparent", border:"none", outline:"none",
                color:"#f1f5f9", fontSize:"0.94rem", padding:"15px 0",
                fontFamily:"inherit" }}
            />
            {query && !loading && (
              <button onClick={clear} style={{ background:"none", border:"none",
                color:"#475569", cursor:"pointer", padding:4, fontSize:"0.85rem",
                flexShrink:0, lineHeight:1 }}>✕</button>
            )}
          </div>
          <button onClick={() => search()} disabled={loading || !query.trim()}
            style={{ background: loading || !query.trim()
              ? "rgba(99,102,241,0.28)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:14, color:"#fff", fontWeight:700,
              fontSize:"0.9rem", padding:"0 20px", height:52, minWidth:66,
              cursor: loading || !query.trim() ? "default" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, fontFamily:"inherit", WebkitTapHighlightColor:"transparent" }}>
            {loading
              ? <span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.25)",
                  borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite",
                  display:"block" }}/>
              : "Go"}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        body{overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
        input::placeholder{color:#334155;}
        ::-webkit-scrollbar{display:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes popIn{from{transform:scale(0.94);opacity:0}to{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
