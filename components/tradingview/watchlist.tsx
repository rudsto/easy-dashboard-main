"use client"

import * as React from "react"
import { ChevronDown, Plus, Search } from "lucide-react"

import { Symbol, formatPrice, getWatchlist } from "@/lib/market-data"
import { cn } from "@/lib/utils"

type Props = {
  active: string
  onSelect: (ticker: string) => void
}

export function Watchlist({ active, onSelect }: Props) {
  const [query, setQuery] = React.useState("")
  const items = React.useMemo(() => getWatchlist(), [])
  const filtered = items.filter((s) =>
    s.ticker.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="flex h-full w-full flex-col bg-[#131722] text-[#d1d4dc]">
      <div className="flex h-9 items-center justify-between border-b border-[#2a2e39] px-3">
        <div className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-wider text-[#9598a1]">
          Watchlist
          <ChevronDown className="h-3 w-3" />
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded text-[#9598a1] hover:bg-[#2a2e39] hover:text-white">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex h-9 items-center gap-2 border-b border-[#2a2e39] px-3">
        <Search className="h-3.5 w-3.5 text-[#9598a1]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol"
          className="w-full bg-transparent text-[12px] text-[#d1d4dc] placeholder:text-[#56595e] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-[1fr_72px_56px] gap-2 border-b border-[#2a2e39] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#56595e]">
        <span>Symbol</span>
        <span className="text-right">Last</span>
        <span className="text-right">Chg%</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((s) => (
          <Row key={s.ticker} sym={s} active={active === s.ticker} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function Row({
  sym,
  active,
  onSelect,
}: {
  sym: Symbol
  active: boolean
  onSelect: (t: string) => void
}) {
  const up = sym.change >= 0
  return (
    <button
      onClick={() => onSelect(sym.ticker)}
      className={cn(
        "grid w-full grid-cols-[1fr_72px_56px] items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[#1c2030]",
        active && "bg-[#1c2030]"
      )}
    >
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-[#d1d4dc]">{sym.ticker}</span>
        <span className="truncate text-[10px] text-[#56595e]">{sym.exchange}</span>
      </div>
      <span className="text-right font-mono tabular-nums text-[#d1d4dc]">
        {formatPrice(sym.price)}
      </span>
      <span
        className={cn(
          "rounded px-1 py-0.5 text-right font-mono text-[11px] tabular-nums",
          up ? "bg-[#26a69a]/15 text-[#26a69a]" : "bg-[#ef5350]/15 text-[#ef5350]"
        )}
      >
        {up ? "+" : ""}
        {sym.changePct.toFixed(2)}%
      </span>
    </button>
  )
}
