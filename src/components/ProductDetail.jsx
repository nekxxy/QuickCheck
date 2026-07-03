import { useEffect, useMemo, useState } from "react";
import { PLATFORMS, PLATFORM_IDS, sortedOffers, priceHistory, formatINR, formatDate } from "../data/products";
import PriceChart from "./PriceChart";

export default function ProductDetail({ product, onClose }) {
  const [view, setView] = useState("chart"); // chart | table
  const offers = useMemo(() => sortedOffers(product), [product]);
  const history = useMemo(() => priceHistory(product), [product]);
  const best = offers[0];
  const worst = offers[offers.length - 1];
  const saving = worst.price - best.price;
  const missing = PLATFORM_IDS.filter(id => product.prices[id] == null);

  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-label={product.name} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="detail-head">
          <div className="detail-emoji">{product.emoji}</div>
          <div>
            <h2>{product.name}</h2>
            <p className="detail-variant">{product.variant} · {product.category}</p>
          </div>
        </div>

        <div className="best-banner">
          <div>
            <span className="best-banner-label">Best price today</span>
            <div className="best-banner-price">{formatINR(best.price)}</div>
            <span className="best-banner-store">
              on <b style={{ color: "var(--txt)" }}>{best.name}</b> · {best.ship}
            </span>
          </div>
          {saving > 0 && (
            <div className="best-banner-save">
              Save {formatINR(saving)}<span> vs highest ({worst.name})</span>
            </div>
          )}
        </div>

        <h3 className="section-title">Compare across stores <span className="section-sub">· sorted by price</span></h3>
        <ul className="offer-list">
          {offers.map((o, i) => (
            <li key={o.id} className={`offer-row ${i === 0 ? "offer-best" : ""}`}>
              <span className="store-chip" style={{ "--store": o.color }}>{o.name}</span>
              <span className="offer-ship">{o.ship}</span>
              <span className="offer-price">
                {formatINR(o.price)}
                {i > 0 && <em className="offer-diff">+{formatINR(o.price - best.price)}</em>}
                {i === 0 && <em className="offer-tag">BEST</em>}
              </span>
              <a
                className="offer-link"
                href={o.searchUrl(`${product.name} ${product.variant}`)}
                target="_blank" rel="noopener noreferrer"
                aria-label={`Open ${product.name} on ${o.name}`}
              >
                Visit ↗
              </a>
            </li>
          ))}
        </ul>
        {missing.length > 0 && (
          <p className="offer-missing">
            Not available on: {missing.map(id => PLATFORMS[id].name).join(", ")}
          </p>
        )}

        <div className="history-head">
          <h3 className="section-title">Price history <span className="section-sub">· best price, last 6 months</span></h3>
          <div className="seg" role="tablist" aria-label="History view">
            <button role="tab" aria-selected={view === "chart"} className={view === "chart" ? "on" : ""} onClick={() => setView("chart")}>Chart</button>
            <button role="tab" aria-selected={view === "table"} className={view === "table" ? "on" : ""} onClick={() => setView("table")}>Table</button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-tile stat-low">
            <span className="stat-label">Lowest ever</span>
            <span className="stat-value">{formatINR(history.lowest.price)}</span>
            <span className="stat-note">{formatDate(history.lowest.date)} · {history.lowest.platform.name}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Average</span>
            <span className="stat-value">{formatINR(history.avg)}</span>
            <span className="stat-note">6-month mean</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Highest</span>
            <span className="stat-value">{formatINR(history.highest.price)}</span>
            <span className="stat-note">{formatDate(history.highest.date)}</span>
          </div>
        </div>

        {view === "chart" ? (
          <PriceChart history={history} />
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead><tr><th>Week of</th><th>Best price</th></tr></thead>
              <tbody>
                {[...history.series].reverse().map((p, i) => (
                  <tr key={i} className={p.price === history.lowest.price && p.date === history.lowest.date ? "row-low" : ""}>
                    <td>{formatDate(p.date)}</td>
                    <td>{formatINR(p.price)}{p.price === history.lowest.price && p.date === history.lowest.date ? " ★ lowest" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="disclaimer">Demo pricing data for illustration — always confirm the live price on the store before buying.</p>
      </div>
    </div>
  );
}
