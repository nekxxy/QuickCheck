// ── Platforms ────────────────────────────────────────────────
// Brand-colored chips used on cards; searchUrl builds a real
// outbound search link so users can verify on the store.
export const PLATFORMS = {
  amazon:    { name: "Amazon",     color: "#FF9900", ship: "1–2 days",  searchUrl: q => `https://www.amazon.in/s?k=${encodeURIComponent(q)}` },
  flipkart:  { name: "Flipkart",   color: "#2874F0", ship: "2–3 days",  searchUrl: q => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}` },
  croma:     { name: "Croma",      color: "#12DAA8", ship: "2–4 days",  searchUrl: q => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}%3Arelevance` },
  tatacliq:  { name: "Tata CLiQ",  color: "#E11B2E", ship: "3–5 days",  searchUrl: q => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}` },
  zepto:     { name: "Zepto",      color: "#A855F7", ship: "10 min",    searchUrl: q => `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}` },
  blinkit:   { name: "Blinkit",    color: "#F0C000", ship: "10 min",    searchUrl: q => `https://blinkit.com/s/?q=${encodeURIComponent(q)}` },
  bigbasket: { name: "BigBasket",  color: "#84C225", ship: "15–30 min", searchUrl: q => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}` },
  instamart: { name: "Instamart",  color: "#FC8019", ship: "15 min",    searchUrl: q => `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(q)}` },
};

export const PLATFORM_IDS = Object.keys(PLATFORMS);

export const CATEGORIES = ["All", "Mobiles", "Electronics", "Appliances", "Grocery", "Essentials"];

// ── Catalog ──────────────────────────────────────────────────
// Demo pricing data (₹). null / absent = product not sold there.
export const PRODUCTS = [
  {
    id: "iphone-15", name: "Apple iPhone 15", variant: "128 GB · Black", category: "Mobiles", emoji: "📱",
    keywords: "apple iphone smartphone mobile phone ios",
    prices: { amazon: 57999, flipkart: 57490, croma: 58900, tatacliq: 57999 },
  },
  {
    id: "galaxy-s24", name: "Samsung Galaxy S24 5G", variant: "256 GB · Onyx Black", category: "Mobiles", emoji: "📱",
    keywords: "samsung galaxy smartphone mobile phone android",
    prices: { amazon: 62999, flipkart: 61999, croma: 64490, tatacliq: 62990 },
  },
  {
    id: "oneplus-12r", name: "OnePlus 12R", variant: "8 GB / 128 GB · Cool Blue", category: "Mobiles", emoji: "📱",
    keywords: "oneplus smartphone mobile phone android",
    prices: { amazon: 39999, flipkart: 39998, croma: 40999, tatacliq: 40490 },
  },
  {
    id: "redmi-note-13-pro", name: "Redmi Note 13 Pro 5G", variant: "8 GB / 256 GB", category: "Mobiles", emoji: "📱",
    keywords: "xiaomi redmi note smartphone mobile phone android budget",
    prices: { amazon: 23999, flipkart: 23499, croma: 24499, tatacliq: 23999 },
  },
  {
    id: "sony-xm5", name: "Sony WH-1000XM5", variant: "Wireless ANC Headphones", category: "Electronics", emoji: "🎧",
    keywords: "sony headphones noise cancelling audio wireless bluetooth",
    prices: { amazon: 26990, flipkart: 27490, croma: 26990, tatacliq: 28990 },
  },
  {
    id: "airpods-pro-2", name: "Apple AirPods Pro (2nd Gen)", variant: "USB-C · ANC", category: "Electronics", emoji: "🎧",
    keywords: "apple airpods earbuds audio wireless bluetooth tws",
    prices: { amazon: 22900, flipkart: 22499, croma: 23900, tatacliq: 22990, blinkit: 24900 },
  },
  {
    id: "boat-airdopes", name: "boAt Airdopes 141", variant: "TWS Earbuds · Bold Black", category: "Electronics", emoji: "🎧",
    keywords: "boat airdopes earbuds audio wireless bluetooth tws budget",
    prices: { amazon: 1099, flipkart: 1049, croma: 1199, tatacliq: 1299, zepto: 1299, blinkit: 1249, instamart: 1349 },
  },
  {
    id: "jbl-flip-6", name: "JBL Flip 6", variant: "Portable Bluetooth Speaker", category: "Electronics", emoji: "🔊",
    keywords: "jbl speaker bluetooth audio portable",
    prices: { amazon: 9999, flipkart: 9499, croma: 9999, tatacliq: 10490, blinkit: 11099 },
  },
  {
    id: "samsung-tv-55", name: "Samsung 55\" Crystal 4K TV", variant: "UHD Smart TV (2024)", category: "Electronics", emoji: "📺",
    keywords: "samsung tv television 4k uhd smart 55 inch",
    prices: { amazon: 42990, flipkart: 41990, croma: 43990, tatacliq: 42490 },
  },
  {
    id: "macbook-air-m2", name: "Apple MacBook Air M2", variant: "13\" · 8 GB / 256 GB · Midnight", category: "Electronics", emoji: "💻",
    keywords: "apple macbook laptop m2 notebook computer",
    prices: { amazon: 86990, flipkart: 85990, croma: 88900, tatacliq: 86900 },
  },
  {
    id: "philips-airfryer", name: "Philips Air Fryer HD9200", variant: "4.1 L · Rapid Air", category: "Appliances", emoji: "🍳",
    keywords: "philips air fryer kitchen appliance cooking",
    prices: { amazon: 9495, flipkart: 8999, croma: 9490, tatacliq: 9995 },
  },
  {
    id: "prestige-mixer", name: "Prestige Iris Mixer Grinder", variant: "750 W · 4 Jars", category: "Appliances", emoji: "🥣",
    keywords: "prestige mixer grinder kitchen appliance mixie",
    prices: { amazon: 3499, flipkart: 3299, croma: 3599, tatacliq: 3699, bigbasket: 3799 },
  },
  {
    id: "dyson-v8", name: "Dyson V8 Absolute", variant: "Cordless Vacuum Cleaner", category: "Appliances", emoji: "🧹",
    keywords: "dyson vacuum cleaner cordless home appliance",
    prices: { amazon: 34900, flipkart: 33900, croma: 34900, tatacliq: 35900 },
  },
  {
    id: "amul-butter", name: "Amul Butter", variant: "500 g · Pasteurised", category: "Grocery", emoji: "🧈",
    keywords: "amul butter dairy breakfast",
    prices: { amazon: 305, flipkart: 299, zepto: 285, blinkit: 279, bigbasket: 275, instamart: 282 },
  },
  {
    id: "tata-salt", name: "Tata Salt", variant: "1 kg · Iodised", category: "Grocery", emoji: "🧂",
    keywords: "tata salt iodised cooking",
    prices: { amazon: 32, flipkart: 30, zepto: 30, blinkit: 28, bigbasket: 27, instamart: 30 },
  },
  {
    id: "maggi-12", name: "Maggi 2-Minute Noodles", variant: "12-pack · Masala", category: "Grocery", emoji: "🍜",
    keywords: "maggi noodles instant nestle snack",
    prices: { amazon: 174, flipkart: 168, zepto: 172, blinkit: 165, bigbasket: 162, instamart: 170 },
  },
  {
    id: "fortune-oil", name: "Fortune Sunlite Sunflower Oil", variant: "1 L Pouch · Refined", category: "Grocery", emoji: "🛢️",
    keywords: "fortune sunflower oil cooking refined sunlite",
    prices: { amazon: 152, flipkart: 149, zepto: 146, blinkit: 142, bigbasket: 139, instamart: 145 },
  },
  {
    id: "india-gate-rice", name: "India Gate Basmati Rice", variant: "5 kg · Feast Rozzana", category: "Grocery", emoji: "🍚",
    keywords: "india gate basmati rice grain",
    prices: { amazon: 449, flipkart: 465, zepto: 479, blinkit: 459, bigbasket: 442, instamart: 469 },
  },
  {
    id: "toor-dal", name: "Tata Sampann Toor Dal", variant: "1 kg · Unpolished", category: "Grocery", emoji: "🫘",
    keywords: "tata sampann toor dal arhar pulses lentils",
    prices: { amazon: 195, flipkart: 189, zepto: 185, blinkit: 179, bigbasket: 175, instamart: 182 },
  },
  {
    id: "nescafe-classic", name: "Nescafé Classic Coffee", variant: "90 g Jar", category: "Grocery", emoji: "☕",
    keywords: "nescafe coffee instant nestle beverage",
    prices: { amazon: 345, flipkart: 335, zepto: 340, blinkit: 330, bigbasket: 325, instamart: 338 },
  },
  {
    id: "coke-125", name: "Coca-Cola Soft Drink", variant: "1.25 L Bottle", category: "Grocery", emoji: "🥤",
    keywords: "coca cola coke soft drink beverage soda",
    prices: { amazon: 68, zepto: 65, blinkit: 62, bigbasket: 60, instamart: 64 },
  },
  {
    id: "dove-shampoo", name: "Dove Intense Repair Shampoo", variant: "650 ml", category: "Essentials", emoji: "🧴",
    keywords: "dove shampoo hair care personal",
    prices: { amazon: 520, flipkart: 499, zepto: 489, blinkit: 475, bigbasket: 469, instamart: 482 },
  },
  {
    id: "dettol-handwash", name: "Dettol Handwash Refill", variant: "750 ml · Original", category: "Essentials", emoji: "🧼",
    keywords: "dettol handwash soap hygiene refill",
    prices: { amazon: 109, flipkart: 105, zepto: 102, blinkit: 99, bigbasket: 96, instamart: 101 },
  },
  {
    id: "surf-excel-matic", name: "Surf Excel Matic Liquid", variant: "2 L · Front Load", category: "Essentials", emoji: "🧺",
    keywords: "surf excel detergent liquid laundry washing",
    prices: { amazon: 499, flipkart: 485, zepto: 478, blinkit: 465, bigbasket: 458, instamart: 472 },
  },
  {
    id: "colgate-maxfresh", name: "Colgate MaxFresh Toothpaste", variant: "300 g (150 g × 2)", category: "Essentials", emoji: "🪥",
    keywords: "colgate toothpaste maxfresh oral care",
    prices: { amazon: 190, flipkart: 185, zepto: 182, blinkit: 178, bigbasket: 172, instamart: 180 },
  },
  {
    id: "harpic-1l", name: "Harpic Toilet Cleaner", variant: "1 L · Original", category: "Essentials", emoji: "🚽",
    keywords: "harpic toilet cleaner bathroom hygiene",
    prices: { amazon: 199, flipkart: 195, zepto: 192, blinkit: 188, bigbasket: 184, instamart: 190 },
  },
];

// ── Derived helpers ──────────────────────────────────────────
export function sortedOffers(product) {
  return Object.entries(product.prices)
    .filter(([, price]) => price != null)
    .map(([id, price]) => ({ id, price, ...PLATFORMS[id] }))
    .sort((a, b) => a.price - b.price);
}

// Deterministic PRNG so a product's history never changes between renders.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const WEEKS = 26; // ~6 months, weekly samples

// Price history of the *best available price* for a product.
// Returns { series: [{date, price}], lowest, highest, avg }.
export function priceHistory(product) {
  const offers = sortedOffers(product);
  const best = offers[0];
  const rand = mulberry32(hash(product.id));
  const now = new Date();

  // Random walk that ends exactly at today's best price.
  const pts = [];
  let level = 1 + 0.04 + rand() * 0.06; // started 4–10% higher 6 months ago
  const saleWeek = 4 + Math.floor(rand() * (WEEKS - 10)); // one sale dip
  for (let i = 0; i < WEEKS; i++) {
    level += (rand() - 0.52) * 0.035;
    level = Math.min(1.18, Math.max(0.92, level));
    let f = level;
    if (i === saleWeek) f = 0.88 + rand() * 0.03; // festival / sale price
    if (i === WEEKS - 1) f = 1;                   // today = current best
    const date = new Date(now);
    date.setDate(now.getDate() - (WEEKS - 1 - i) * 7);
    pts.push({ date, price: Math.max(1, Math.round(best.price * f)) });
  }

  let lowest = pts[0], highest = pts[0], sum = 0;
  for (const p of pts) {
    if (p.price < lowest.price) lowest = p;
    if (p.price > highest.price) highest = p;
    sum += p.price;
  }
  return {
    series: pts,
    lowest: { ...lowest, platform: best },
    highest,
    avg: Math.round(sum / pts.length),
  };
}

export const formatINR = (n) => "₹" + n.toLocaleString("en-IN");

export const formatDate = (d) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
