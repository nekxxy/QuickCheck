import { sortedOffers, formatINR } from "../data/products";

export default function ProductCard({ product, onOpen, index }) {
  const offers = sortedOffers(product);
  const best = offers[0];
  const worst = offers[offers.length - 1];
  const savePct = worst.price > best.price ? Math.round(((worst.price - best.price) / worst.price) * 100) : 0;

  return (
    <button className="card glass" onClick={() => onOpen(product)} style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}>
      <div className="card-top">
        <span className="card-emoji">{product.emoji}</span>
        {savePct > 0 && <span className="card-save">save {savePct}%</span>}
      </div>
      <h3 className="card-name">{product.name}</h3>
      <p className="card-variant">{product.variant}</p>
      <div className="card-bottom">
        <div>
          <span className="card-from">from</span>
          <div className="card-price">{formatINR(best.price)}</div>
        </div>
        <div className="card-meta">
          <span className="store-chip" style={{ "--store": best.color }}>{best.name}</span>
          <span className="card-count">{offers.length} store{offers.length > 1 ? "s" : ""}</span>
        </div>
      </div>
    </button>
  );
}
