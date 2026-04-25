"use client"

import * as React from "react"

import {
  formatPrice,
  formatTime,
  getOrderBook,
  getRecentTrades,
} from "@/lib/market-data"
import { cn } from "@/lib/utils"

type Props = {
  ticker: string
}

export function OrderBookPanel({ ticker }: Props) {
  const [tab, setTab] = React.useState<"book" | "trades">("book")
  return (
    <div className="flex h-full w-full flex-col bg-[#131722] text-[#d1d4dc]">
      <div className="flex h-9 items-center gap-1 border-b border-[#2a2e39] px-2">
        <Tab active={tab === "book"} onClick={() => setTab("book")}>
          Order Book
        </Tab>
        <Tab active={tab === "trades"} onClick={() => setTab("trades")}>
          Trades
        </Tab>
      </div>
      {tab === "book" ? <OrderBookView ticker={ticker} /> : <TradesView ticker={ticker} />}
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 rounded px-2 text-[12px]",
        active
          ? "bg-[#2a2e39] text-white"
          : "text-[#9598a1] hover:bg-[#2a2e39] hover:text-white"
      )}
    >
      {children}
    </button>
  )
}

function OrderBookView({ ticker }: { ticker: string }) {
  const { bids, asks, spread } = React.useMemo(() => getOrderBook(ticker, 13), [ticker])
  const maxTotal = Math.max(
    bids[bids.length - 1]?.total ?? 1,
    asks[asks.length - 1]?.total ?? 1
  )
  const midPrice = (bids[0].price + asks[0].price) / 2

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#56595e]">
        <span>Price (USDT)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex flex-col-reverse">
        {asks.map((l) => {
          const w = (l.total / maxTotal) * 100
          return (
            <Row
              key={"a" + l.price}
              priceClass="text-[#ef5350]"
              barClass="bg-[#ef5350]/15"
              barWidth={w}
              price={l.price}
              size={l.size}
              total={l.total}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between border-y border-[#2a2e39] bg-[#0e1118] px-3 py-1.5 text-[12px]">
        <span className="font-mono font-semibold tabular-nums text-[#d1d4dc]">
          {formatPrice(midPrice)}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[#9598a1]">
          spread {formatPrice(spread)}
        </span>
      </div>

      <div className="flex flex-col">
        {bids.map((l) => {
          const w = (l.total / maxTotal) * 100
          return (
            <Row
              key={"b" + l.price}
              priceClass="text-[#26a69a]"
              barClass="bg-[#26a69a]/15"
              barWidth={w}
              price={l.price}
              size={l.size}
              total={l.total}
            />
          )
        })}
      </div>
    </div>
  )
}

function Row({
  priceClass,
  barClass,
  barWidth,
  price,
  size,
  total,
}: {
  priceClass: string
  barClass: string
  barWidth: number
  price: number
  size: number
  total: number
}) {
  return (
    <div className="relative grid grid-cols-3 gap-2 px-3 py-[3px] font-mono text-[11px] tabular-nums">
      <div
        className={cn("absolute inset-y-0 right-0", barClass)}
        style={{ width: barWidth + "%" }}
      />
      <span className={cn("relative", priceClass)}>{formatPrice(price)}</span>
      <span className="relative text-right text-[#d1d4dc]">{size.toFixed(3)}</span>
      <span className="relative text-right text-[#9598a1]">{total.toFixed(3)}</span>
    </div>
  )
}

function TradesView({ ticker }: { ticker: string }) {
  const trades = React.useMemo(() => getRecentTrades(ticker, 26), [ticker])
  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#56595e]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {trades.map((t, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-2 px-3 py-[3px] font-mono text-[11px] tabular-nums hover:bg-[#1c2030]"
          >
            <span className={t.side === "buy" ? "text-[#26a69a]" : "text-[#ef5350]"}>
              {formatPrice(t.price)}
            </span>
            <span className="text-right text-[#d1d4dc]">{t.size.toFixed(4)}</span>
            <span className="text-right text-[#9598a1]">{formatTime(t.time)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
