export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Symbol = {
  ticker: string
  name: string
  exchange: string
  price: number
  change: number
  changePct: number
  volume: number
  high24h: number
  low24h: number
}

export type OrderBookLevel = {
  price: number
  size: number
  total: number
}

export type Trade = {
  time: number
  price: number
  size: number
  side: "buy" | "sell"
}

export type Position = {
  symbol: string
  side: "long" | "short"
  size: number
  entry: number
  mark: number
  pnl: number
  pnlPct: number
  margin: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateCandles(
  seed: number,
  count: number,
  start: number,
  intervalMs: number
): Candle[] {
  const rand = mulberry32(seed)
  const candles: Candle[] = []
  let price = start
  const baseTime = Date.UTC(2026, 3, 25, 0, 0, 0) - intervalMs * count
  for (let i = 0; i < count; i++) {
    const drift = (rand() - 0.48) * start * 0.012
    const open = price
    const close = Math.max(0.01, open + drift)
    const wick = Math.abs(drift) + start * 0.004 * rand()
    const high = Math.max(open, close) + wick * (0.4 + rand() * 0.8)
    const low = Math.min(open, close) - wick * (0.4 + rand() * 0.8)
    const volume = Math.round(50 + rand() * 950 + Math.abs(drift) * 25)
    candles.push({
      time: baseTime + i * intervalMs,
      open,
      high: Math.max(high, open, close),
      low: Math.max(0.01, Math.min(low, open, close)),
      close,
      volume,
    })
    price = close
  }
  return candles
}

const intervalToMs: Record<string, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1D": 24 * 60 * 60_000,
  "1W": 7 * 24 * 60 * 60_000,
}

export function getCandles(
  ticker: string,
  interval: string,
  count = 120
): Candle[] {
  const seed = hashString(ticker + interval)
  const meta = SYMBOL_META[ticker] ?? { start: 100 }
  return generateCandles(seed, count, meta.start, intervalToMs[interval] ?? 60_000)
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const SYMBOL_META: Record<string, { name: string; exchange: string; start: number }> = {
  "BTC/USDT": { name: "Bitcoin", exchange: "BINANCE", start: 71250 },
  "ETH/USDT": { name: "Ethereum", exchange: "BINANCE", start: 3580 },
  "SOL/USDT": { name: "Solana", exchange: "BINANCE", start: 162.4 },
  "BNB/USDT": { name: "BNB", exchange: "BINANCE", start: 598.2 },
  "XRP/USDT": { name: "XRP", exchange: "BINANCE", start: 0.532 },
  "ADA/USDT": { name: "Cardano", exchange: "BINANCE", start: 0.448 },
  "DOGE/USDT": { name: "Dogecoin", exchange: "BINANCE", start: 0.158 },
  "AVAX/USDT": { name: "Avalanche", exchange: "BINANCE", start: 36.7 },
  "LINK/USDT": { name: "Chainlink", exchange: "BINANCE", start: 14.82 },
  "MATIC/USDT": { name: "Polygon", exchange: "BINANCE", start: 0.685 },
  AAPL: { name: "Apple Inc.", exchange: "NASDAQ", start: 218.3 },
  NVDA: { name: "NVIDIA Corp", exchange: "NASDAQ", start: 935.4 },
  TSLA: { name: "Tesla, Inc.", exchange: "NASDAQ", start: 251.8 },
  EURUSD: { name: "Euro / US Dollar", exchange: "FX", start: 1.0742 },
}

export const WATCHLIST: string[] = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "BNB/USDT",
  "XRP/USDT",
  "ADA/USDT",
  "DOGE/USDT",
  "AVAX/USDT",
  "LINK/USDT",
  "MATIC/USDT",
  "AAPL",
  "NVDA",
  "TSLA",
  "EURUSD",
]

export function getSymbol(ticker: string): Symbol {
  const meta = SYMBOL_META[ticker] ?? {
    name: ticker,
    exchange: "—",
    start: 100,
  }
  const candles = getCandles(ticker, "1h", 24)
  const last = candles[candles.length - 1]
  const first = candles[0]
  const change = last.close - first.open
  return {
    ticker,
    name: meta.name,
    exchange: meta.exchange,
    price: last.close,
    change,
    changePct: (change / first.open) * 100,
    volume: candles.reduce((a, c) => a + c.volume, 0),
    high24h: Math.max(...candles.map((c) => c.high)),
    low24h: Math.min(...candles.map((c) => c.low)),
  }
}

export function getWatchlist(): Symbol[] {
  return WATCHLIST.map(getSymbol)
}

export function getOrderBook(
  ticker: string,
  depth = 14
): { bids: OrderBookLevel[]; asks: OrderBookLevel[]; spread: number } {
  const sym = getSymbol(ticker)
  const rand = mulberry32(hashString(ticker + "ob"))
  const tick = sym.price * 0.0002
  const bids: OrderBookLevel[] = []
  const asks: OrderBookLevel[] = []
  let bidTotal = 0
  let askTotal = 0
  for (let i = 0; i < depth; i++) {
    const bidPrice = sym.price - tick * (i + 1)
    const askPrice = sym.price + tick * (i + 1)
    const bidSize = +(0.05 + rand() * 4.2).toFixed(3)
    const askSize = +(0.05 + rand() * 4.2).toFixed(3)
    bidTotal += bidSize
    askTotal += askSize
    bids.push({ price: bidPrice, size: bidSize, total: bidTotal })
    asks.push({ price: askPrice, size: askSize, total: askTotal })
  }
  return { bids, asks, spread: tick * 2 }
}

export function getRecentTrades(ticker: string, count = 20): Trade[] {
  const sym = getSymbol(ticker)
  const rand = mulberry32(hashString(ticker + "trades"))
  const trades: Trade[] = []
  const now = Date.UTC(2026, 3, 25, 14, 32, 0)
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = rand() > 0.5 ? "buy" : "sell"
    const price = sym.price * (1 + (rand() - 0.5) * 0.0008)
    const size = +(0.005 + rand() * 1.8).toFixed(4)
    trades.push({
      time: now - i * (4_000 + Math.floor(rand() * 8_000)),
      price,
      size,
      side,
    })
  }
  return trades
}

export function getPositions(): Position[] {
  const seed: Position[] = [
    {
      symbol: "BTC/USDT",
      side: "long",
      size: 0.42,
      entry: 69820.5,
      mark: getSymbol("BTC/USDT").price,
      pnl: 0,
      pnlPct: 0,
      margin: 2_932.46,
    },
    {
      symbol: "ETH/USDT",
      side: "short",
      size: 5.0,
      entry: 3675.1,
      mark: getSymbol("ETH/USDT").price,
      pnl: 0,
      pnlPct: 0,
      margin: 1_837.55,
    },
    {
      symbol: "SOL/USDT",
      side: "long",
      size: 60,
      entry: 158.9,
      mark: getSymbol("SOL/USDT").price,
      pnl: 0,
      pnlPct: 0,
      margin: 1_589.0,
    },
  ]
  return seed.map((p) => {
    const direction = p.side === "long" ? 1 : -1
    const pnl = (p.mark - p.entry) * p.size * direction
    const pnlPct = ((p.mark - p.entry) / p.entry) * 100 * direction
    return { ...p, pnl, pnlPct }
  })
}

export function formatPrice(value: number): string {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  if (value >= 1) return value.toFixed(2)
  if (value >= 0.01) return value.toFixed(4)
  return value.toFixed(6)
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M"
  if (value >= 1_000) return (value / 1_000).toFixed(2) + "K"
  return value.toFixed(2)
}

export function formatTime(time: number): string {
  const d = new Date(time)
  return (
    String(d.getUTCHours()).padStart(2, "0") +
    ":" +
    String(d.getUTCMinutes()).padStart(2, "0") +
    ":" +
    String(d.getUTCSeconds()).padStart(2, "0")
  )
}

export const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"] as const
export type Interval = (typeof INTERVALS)[number]
