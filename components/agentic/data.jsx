// Mock market data + agent state
// Deterministic so the design is reproducible

const SYMBOLS = [
  { ticker: "SOL/USDT", name: "Solana", price: 162.84, change: +4.21, changePct: +2.65, vol: "1.2B", spark: [158,159,160,161,160,161,162,162,163,162,163,162.8] },
  { ticker: "BTC/USDT", name: "Bitcoin", price: 67_412.50, change: +812.30, changePct: +1.22, vol: "24.8B", spark: [66200,66400,66100,66800,67100,66900,67200,67300,67200,67400,67300,67412] },
  { ticker: "ETH/USDT", name: "Ethereum", price: 3_481.20, change: -18.40, changePct: -0.53, vol: "9.4B", spark: [3510,3505,3500,3495,3490,3485,3490,3485,3482,3480,3478,3481] },
  { ticker: "NVDA",     name: "NVIDIA",   price: 138.92, change: +2.41, changePct: +1.77, vol: "412M", spark: [134,135,136,135,137,136,137,138,138,139,138,138.9] },
  { ticker: "AAPL",     name: "Apple",    price: 226.41, change: -0.82, changePct: -0.36, vol: "58M",  spark: [228,227,226,227,226,227,226,225,226,226,226,226.4] },
  { ticker: "TSLA",     name: "Tesla",    price: 252.10, change: +6.40, changePct: +2.61, vol: "112M", spark: [244,245,246,247,248,250,251,250,251,252,252,252.1] },
];

const POSITIONS = [
  { symbol: "BTC/USDT", side: "long",  size: 0.42, entry: 65_120, mark: 67_412.50, pnl: +962.85, pnlPct: +3.52, margin: 2734 },
  { symbol: "NVDA",     side: "long",  size: 40,   entry: 132.10, mark: 138.92,    pnl: +272.80, pnlPct: +5.16, margin: 1056 },
  { symbol: "ETH/USDT", side: "short", size: 1.2,  entry: 3_510,  mark: 3_481.20,  pnl: +34.56,  pnlPct: +0.82, margin: 842  },
];

const ORDER_BOOK = (() => {
  const mid = 162.84;
  const bids = [];
  const asks = [];
  for (let i = 1; i <= 8; i++) {
    bids.push({ price: +(mid - i * 0.12).toFixed(2), size: +(40 + Math.sin(i) * 80 + i * 12).toFixed(1) });
    asks.push({ price: +(mid + i * 0.12).toFixed(2), size: +(40 + Math.cos(i) * 80 + i * 9).toFixed(1) });
  }
  return { bids, asks, mid, spread: 0.24 };
})();

// Build a deterministic candlestick series for SOL/USDT
const CANDLES = (() => {
  const out = [];
  let p = 152;
  for (let i = 0; i < 80; i++) {
    const drift = Math.sin(i * 0.18) * 1.4 + Math.cos(i * 0.41) * 0.6 + 0.08;
    const o = p;
    const c = +(o + drift + (Math.sin(i * 1.3) * 0.9)).toFixed(2);
    const h = +(Math.max(o, c) + Math.abs(Math.sin(i * 0.7)) * 0.9 + 0.2).toFixed(2);
    const l = +(Math.min(o, c) - Math.abs(Math.cos(i * 0.5)) * 0.9 - 0.2).toFixed(2);
    out.push({ o, h, l, c });
    p = c;
  }
  return out;
})();

// The agent conversation that drives the workspace
const AGENT_TIMELINE = [
  {
    id: "u1",
    role: "user",
    time: "09:14",
    text: "Good morning. What changed in my watchlist overnight, and is there anything worth my attention before the open?"
  },
  {
    id: "a1",
    role: "assistant",
    time: "09:14",
    text: "Overnight your watchlist drifted up — average +1.4%. Two things stand out: SOL reclaimed VWAP on the 1h with a clean bid wall at 161.20, and NVDA gapped +1.8% on after-hours volume. Everything else is noise.",
    tools: [
      { name: "scan_watchlist", args: 'window: "overnight"', status: "done", duration: "1.4s",
        result: "ranked 6 — SOL/USDT (0.82), NVDA (0.71), BTC/USDT (0.66) lead" },
      { name: "compute_indicators", args: 'symbol: "SOL/USDT"', status: "done", duration: "0.6s",
        result: "RSI 58.4 rising, EMA20>EMA50, VWAP reclaimed 32m ago" },
    ],
    pinned: ["chart:SOL/USDT", "watchlist"],
  },
  {
    id: "u2",
    role: "user",
    time: "09:16",
    text: "Draft a long on SOL with 1% account risk. Stop below the bid wall."
  },
  {
    id: "a2",
    role: "assistant",
    time: "09:16",
    text: "Drafted. Sizing 13.55 SOL (≈$2,200 notional) with stop at 160.95 — just under the 161.20 wall. Take profit at the prior swing high gives R:R of 1 : 2.34. Nothing sent until you confirm.",
    tools: [
      { name: "read_order_book", args: 'symbol: "SOL/USDT", depth: 50', status: "done", duration: "0.3s",
        result: "bid wall at 161.20 (size 18.4k), imbalance +0.34" },
      { name: "find_levels", args: 'lookback: "7d"', status: "done", duration: "0.9s",
        result: "swing high 167.40, support cluster 161.0–161.5" },
      { name: "draft_order", args: "side:long, size:13.55, sl:160.95, tp:167.40", status: "ready", duration: "—",
        result: "awaiting confirmation" },
    ],
    draft: {
      side: "long", symbol: "SOL/USDT", size: 13.55,
      entry: 162.84, tp: 167.40, sl: 160.95, rr: 2.34, notional: 2206
    },
  },
];

const SUGGESTED_ACTIONS = [
  "Show me where the bid wall actually sits",
  "What's the bear case here?",
  "Run the same scan on a 4h",
  "Set an alert at 161.20",
];

// Expose
Object.assign(window, { SYMBOLS, POSITIONS, ORDER_BOOK, CANDLES, AGENT_TIMELINE, SUGGESTED_ACTIONS, LIVE_STREAM, EXPLAIN, ANNOTATIONS });

// A live tool-call stream that plays out over time when the user runs a query.
// Each step has an offset (ms) when it should appear and a duration before it transitions to done.
const LIVE_STREAM = [
  { name: "read_candles",       args: 'symbol:"SOL/USDT", tf:"1h", n:200', startAt: 100,  runFor: 700,  result: "200 candles loaded · last 162.84" },
  { name: "compute_indicators", args: 'ind:["RSI","EMA20","EMA50","VWAP"]',  startAt: 850,  runFor: 900,  result: "RSI 58.4 (rising) · EMA20>EMA50 · VWAP reclaimed 32m ago" },
  { name: "find_levels",        args: 'lookback:"7d", method:"swing+volume"', startAt: 1800, runFor: 1100, result: "S 161.0–161.5 · R 167.4 · cluster 164.5" },
  { name: "read_order_book",    args: 'depth:50',                            startAt: 2950, runFor: 600,  result: "bid wall 161.20 (18.4k) · imbalance +0.34" },
  { name: "draft_setup",        args: 'risk:1%, wait_confirm:true',          startAt: 3600, runFor: 800,  result: "long 13.55 SOL · SL 160.95 · TP 167.40 · R:R 1:2.34" },
];

// Explainability data: reasoning behind each claim Claude makes.
const EXPLAIN = {
  "vwap-reclaim": {
    title: "Why VWAP reclaim is meaningful",
    bullets: [
      "Price closed back above session VWAP (161.92) at 08:42, after 4 hours below.",
      "Volume on the reclaim candle was 1.7× the 20-bar average — institutional confirmation, not a wick.",
      "VWAP is now sloping up (slope +0.04/min), turning prior resistance into support.",
    ],
    inputs: ["candles[1h, 200]", "volume_profile[24h]", "vwap_session"],
  },
  "bid-wall": {
    title: "Why 161.20 is a defendable invalidation",
    bullets: [
      "Visible bid of 18.4k SOL at 161.20 — 4.2× the average book depth at that distance.",
      "Confluence with the 1h swing low (161.18) and prior breakout retest (161.32).",
      "If 161.20 fails on volume, the structural thesis is broken — clean stop logic.",
    ],
    inputs: ["order_book[depth:50]", "swing_pivots[7d]"],
  },
  "rr": {
    title: "How R:R 1 : 2.34 was computed",
    bullets: [
      "Entry 162.84 · Stop 160.95 · Target 167.40 (prior swing high).",
      "Risk: 162.84 − 160.95 = 1.89 per SOL.",
      "Reward: 167.40 − 162.84 = 4.56 per SOL → 4.56 / 1.89 = 2.41 (rounded down to 2.34 after fees).",
    ],
    inputs: ["entry_price", "swing_high[7d]", "fee_model"],
  },
};

// Annotations to draw on the chart — Claude"s reasoning, made visual
const ANNOTATIONS = [
  { kind: "hline", price: 161.20, label: "bid wall · 18.4k",  color: "accent", explainKey: "bid-wall" },
  { kind: "hline", price: 167.40, label: "swing high · TP",   color: "up",     explainKey: "rr" },
  { kind: "hline", price: 160.95, label: "stop · below wall", color: "down",   explainKey: "bid-wall" },
  { kind: "hline", price: 161.92, label: "VWAP reclaim",      color: "muted",  explainKey: "vwap-reclaim" },
];
