import { useMemo, useRef, useState } from "react";
import { formatINR } from "../data/products";

const W = 640, H = 230;
const PAD = { t: 26, r: 16, b: 30, l: 56 };

const shortDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Single-series line chart of the best price over time.
// Hover/touch shows a crosshair + tooltip; the all-time low wears
// a gold marker with a direct label.
export default function PriceChart({ history }) {
  const { series, lowest } = history;
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null); // index into series

  const { path, area, pts, yTicks, lowIdx } = useMemo(() => {
    const prices = series.map(p => p.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    const span = Math.max(max - min, 1);
    const yLo = min - span * 0.18, yHi = max + span * 0.18;
    const x = i => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r);
    const y = v => PAD.t + (1 - (v - yLo) / (yHi - yLo)) * (H - PAD.t - PAD.b);
    const pts = series.map((p, i) => ({ x: x(i), y: y(p.price), ...p }));
    const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
    const area = `${path}L${pts[pts.length - 1].x.toFixed(1)},${H - PAD.b}L${pts[0].x.toFixed(1)},${H - PAD.b}Z`;
    const yTicks = [min, (min + max) / 2, max].map(v => ({ v: Math.round(v), y: y(v) }));
    const lowIdx = series.findIndex(p => p.price === lowest.price && p.date === lowest.date);
    return { path, area, pts, yTicks, lowIdx };
  }, [series, lowest]);

  const locate = (clientX) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - px); if (d < bd) { bd = d; best = i; } });
    setHover(best);
  };

  const hp = hover != null ? pts[hover] : null;
  const low = pts[lowIdx];
  // Keep the tooltip inside the plot.
  const tipX = hp ? Math.min(Math.max(hp.x, PAD.l + 52), W - PAD.r - 52) : 0;
  const tipUp = hp && hp.y > PAD.t + 52;
  const lowLabelAnchor = low.x > W - 120 ? "end" : low.x < PAD.l + 60 ? "start" : "middle";

  return (
    <svg
      ref={svgRef}
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Price history. Lowest ${formatINR(lowest.price)}.`}
      onMouseMove={e => locate(e.clientX)}
      onMouseLeave={() => setHover(null)}
      onTouchStart={e => locate(e.touches[0].clientX)}
      onTouchMove={e => locate(e.touches[0].clientX)}
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* recessive grid + y labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} className="chart-grid" />
          <text x={PAD.l - 8} y={t.y + 3.5} textAnchor="end" className="chart-label">{formatINR(t.v)}</text>
        </g>
      ))}

      {/* x labels: first / middle / last */}
      {[0, Math.floor(pts.length / 2), pts.length - 1].map(i => (
        <text
          key={i} x={pts[i].x} y={H - 10}
          textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}
          className="chart-label"
        >
          {shortDate(series[i].date)}
        </text>
      ))}

      <path d={area} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="var(--chart-line)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* all-time low: gold marker, surface ring, direct label */}
      <circle cx={low.x} cy={low.y} r="7" fill="var(--chart-gold)" stroke="var(--card-solid)" strokeWidth="2" />
      <text x={low.x} y={low.y + 20} textAnchor={lowLabelAnchor} className="chart-low-label">
        Lowest {formatINR(lowest.price)}
      </text>

      {/* hover crosshair + tooltip */}
      {hp && (
        <g pointerEvents="none">
          <line x1={hp.x} x2={hp.x} y1={PAD.t - 4} y2={H - PAD.b} className="chart-crosshair" />
          <circle cx={hp.x} cy={hp.y} r="5" fill="var(--chart-line)" stroke="var(--card-solid)" strokeWidth="2" />
          <g transform={`translate(${tipX},${tipUp ? hp.y - 46 : hp.y + 14})`}>
            <rect x="-52" y="0" width="104" height="34" rx="8" className="chart-tip-bg" />
            <text x="0" y="14" textAnchor="middle" className="chart-tip-price">{formatINR(hp.price)}</text>
            <text x="0" y="27" textAnchor="middle" className="chart-tip-date">{shortDate(hp.date)}</text>
          </g>
        </g>
      )}
    </svg>
  );
}
