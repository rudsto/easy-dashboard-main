"use client"

import * as React from "react"
import { Wand2 } from "lucide-react"

import { CandlestickChart } from "@/components/tradingview/candlestick-chart"
import { TopBar } from "@/components/tradingview/top-bar"
import { Watchlist } from "@/components/tradingview/watchlist"
import { OrderBookPanel } from "@/components/tradingview/order-book"
import { ToolsSidebar } from "@/components/tradingview/tools-sidebar"
import { BottomPanel } from "@/components/tradingview/bottom-panel"
import { AgentPanel } from "@/components/tradingview/agent-panel"
import {
  Interval,
  formatPrice,
  getCandles,
  getSymbol,
} from "@/lib/market-data"

export default function TradingViewDashboard() {
  const [ticker, setTicker] = React.useState("BTC/USDT")
  const [interval, setInterval] = React.useState<Interval>("1h")

  const symbol = React.useMemo(() => getSymbol(ticker), [ticker])
  const candles = React.useMemo(
    () => getCandles(ticker, interval, 120),
    [ticker, interval]
  )

  const aiSupport = +(symbol.low24h * 1.001).toFixed(2)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0e1118] text-[#d1d4dc]">
      <TopBar
        symbol={symbol}
        interval={interval}
        onIntervalChange={setInterval}
      />

      <div className="flex flex-1 overflow-hidden">
        <ToolsSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <div className="relative flex flex-1 flex-col overflow-hidden border-r border-[#2a2e39]">
              <CandlestickChart candles={candles} className="h-full w-full" />

              <div className="pointer-events-none absolute left-3 top-12 flex flex-col gap-1.5">
                <div className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-[#cc785c]/40 bg-[#cc785c]/10 px-2 py-1 text-[11px] text-[#cc785c] backdrop-blur">
                  <Wand2 className="h-3 w-3 animate-pulse" />
                  <span className="font-medium">Claude is watching</span>
                  <span className="text-[#cc785c]/70">·</span>
                  <span className="text-[#cc785c]/80">3 signals</span>
                </div>
                <div className="pointer-events-auto rounded-md border border-[#2a2e39] bg-[#131722]/90 px-2 py-1 font-mono text-[10px] text-[#9598a1] backdrop-blur">
                  AI · support {formatPrice(aiSupport)}
                </div>
                <div className="pointer-events-auto rounded-md border border-[#2a2e39] bg-[#131722]/90 px-2 py-1 font-mono text-[10px] text-[#9598a1] backdrop-blur">
                  AI · 1h trend bullish · RSI 58.4
                </div>
              </div>
            </div>

            <div className="flex w-[280px] flex-col border-r border-[#2a2e39]">
              <div className="h-[55%] border-b border-[#2a2e39]">
                <Watchlist active={ticker} onSelect={setTicker} />
              </div>
              <div className="flex-1">
                <OrderBookPanel ticker={ticker} />
              </div>
            </div>

            <div className="hidden w-[400px] flex-col border-l border-[#2a2e39] xl:flex">
              <AgentPanel symbol={symbol} interval={interval} />
            </div>
          </div>

          <div className="h-[240px] border-t border-[#2a2e39]">
            <BottomPanel />
          </div>
        </div>
      </div>

      <div className="flex h-6 items-center justify-between border-t border-[#2a2e39] bg-[#131722] px-3 text-[10px] text-[#56595e]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#26a69a]" />
            Connected
          </span>
          <span>Latency 24ms</span>
          <span>UTC+00:00</span>
          <span className="flex items-center gap-1 text-[#cc785c]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#cc785c]" />
            Claude · agent active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{symbol.exchange}</span>
          <span className="font-mono">{symbol.ticker}</span>
          <span>v2 · agent prototype</span>
        </div>
      </div>
    </div>
  )
}
