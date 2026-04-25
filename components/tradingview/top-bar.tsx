"use client"

import * as React from "react"
import {
  Bell,
  Camera,
  ChevronDown,
  LayoutGrid,
  Maximize2,
  Search,
  Settings,
  Star,
  TrendingUp,
} from "lucide-react"

import { INTERVALS, Interval, Symbol, formatPrice, formatVolume } from "@/lib/market-data"
import { cn } from "@/lib/utils"

type Props = {
  symbol: Symbol
  interval: Interval
  onIntervalChange: (i: Interval) => void
  onSearchClick?: () => void
}

const INDICATORS = ["MA", "EMA", "BB", "RSI", "MACD", "VOL"]

export function TopBar({ symbol, interval, onIntervalChange, onSearchClick }: Props) {
  const up = symbol.change >= 0
  return (
    <div className="flex h-12 items-center gap-2 border-b border-[#2a2e39] bg-[#131722] px-2 text-[13px] text-[#d1d4dc]">
      <button
        onClick={onSearchClick}
        className="flex h-8 items-center gap-2 rounded px-2 hover:bg-[#2a2e39]"
      >
        <Search className="h-4 w-4 text-[#9598a1]" />
        <span className="font-semibold tracking-wide">{symbol.ticker}</span>
        <span className="rounded bg-[#2a2e39] px-1.5 py-0.5 text-[10px] font-medium text-[#9598a1]">
          {symbol.exchange}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[#9598a1]" />
      </button>

      <Divider />

      <div className="flex items-center gap-1">
        {INTERVALS.map((i) => (
          <button
            key={i}
            onClick={() => onIntervalChange(i)}
            className={cn(
              "h-7 min-w-[28px] rounded px-2 font-mono text-[11px] hover:bg-[#2a2e39]",
              interval === i
                ? "bg-[#2a2e39] text-white"
                : "text-[#9598a1]"
            )}
          >
            {i}
          </button>
        ))}
      </div>

      <Divider />

      <ToolbarButton icon={<TrendingUp className="h-4 w-4" />} label="Indicators" />
      <ToolbarButton icon={<LayoutGrid className="h-4 w-4" />} label="Layout" />
      <ToolbarButton icon={<Bell className="h-4 w-4" />} label="Alert" />
      <ToolbarButton icon={<Camera className="h-4 w-4" />} label="Snapshot" />

      <Divider />

      <div className="hidden items-center gap-1 lg:flex">
        {INDICATORS.map((ind) => (
          <span
            key={ind}
            className="rounded border border-[#2a2e39] px-1.5 py-0.5 font-mono text-[10px] text-[#9598a1]"
          >
            {ind}
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-3 md:flex">
          <Stat label="O" value={formatPrice(symbol.price - symbol.change * 0.6)} />
          <Stat label="H" value={formatPrice(symbol.high24h)} accent="up" />
          <Stat label="L" value={formatPrice(symbol.low24h)} accent="down" />
          <Stat label="Vol" value={formatVolume(symbol.volume)} />
        </div>

        <div className="flex items-baseline gap-2 font-mono">
          <span
            className={cn(
              "text-base font-semibold tabular-nums",
              up ? "text-[#26a69a]" : "text-[#ef5350]"
            )}
          >
            {formatPrice(symbol.price)}
          </span>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              up ? "text-[#26a69a]" : "text-[#ef5350]"
            )}
          >
            {up ? "+" : ""}
            {symbol.change.toFixed(2)} ({up ? "+" : ""}
            {symbol.changePct.toFixed(2)}%)
          </span>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#2a2e39]">
          <Star className="h-4 w-4 text-[#9598a1]" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#2a2e39]">
          <Maximize2 className="h-4 w-4 text-[#9598a1]" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#2a2e39]">
          <Settings className="h-4 w-4 text-[#9598a1]" />
        </button>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-[#2a2e39]" />
}

function ToolbarButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
      className="flex h-7 items-center gap-1.5 rounded px-2 text-[12px] text-[#9598a1] hover:bg-[#2a2e39] hover:text-white"
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "up" | "down"
}) {
  return (
    <div className="flex items-baseline gap-1 font-mono text-[11px]">
      <span className="text-[#9598a1]">{label}</span>
      <span
        className={cn(
          "tabular-nums text-[#d1d4dc]",
          accent === "up" && "text-[#26a69a]",
          accent === "down" && "text-[#ef5350]"
        )}
      >
        {value}
      </span>
    </div>
  )
}
