"use client"

import * as React from "react"

import { CandlestickChart } from "@/components/tradingview/candlestick-chart"
import { TopBar } from "@/components/tradingview/top-bar"
import { Watchlist } from "@/components/tradingview/watchlist"
import { OrderBookPanel } from "@/components/tradingview/order-book"
import { ToolsSidebar } from "@/components/tradingview/tools-sidebar"
import { BottomPanel } from "@/components/tradingview/bottom-panel"
import { OrderForm } from "@/components/tradingview/order-form"
import {
  Interval,
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
            <div className="flex flex-1 flex-col overflow-hidden border-r border-[#2a2e39]">
              <CandlestickChart candles={candles} className="h-full w-full" />
            </div>

            <div className="flex w-[300px] flex-col border-r border-[#2a2e39]">
              <div className="h-[55%] border-b border-[#2a2e39]">
                <Watchlist active={ticker} onSelect={setTicker} />
              </div>
              <div className="flex-1">
                <OrderBookPanel ticker={ticker} />
              </div>
            </div>

            <div className="hidden w-[260px] flex-col xl:flex">
              <OrderForm symbol={symbol} />
            </div>
          </div>

          <div className="h-[220px] border-t border-[#2a2e39]">
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
        </div>
        <div className="flex items-center gap-3">
          <span>{symbol.exchange}</span>
          <span className="font-mono">{symbol.ticker}</span>
          <span>v0.1 · prototype</span>
        </div>
      </div>
    </div>
  )
}
