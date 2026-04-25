"use client"

import * as React from "react"

import { Symbol, formatPrice } from "@/lib/market-data"
import { cn } from "@/lib/utils"

type Props = {
  symbol: Symbol
}

export function OrderForm({ symbol }: Props) {
  const [side, setSide] = React.useState<"buy" | "sell">("buy")
  const [type, setType] = React.useState<"limit" | "market">("limit")
  const [price, setPrice] = React.useState(formatPrice(symbol.price))
  const [amount, setAmount] = React.useState("")
  const [pct, setPct] = React.useState(0)

  React.useEffect(() => {
    setPrice(formatPrice(symbol.price))
  }, [symbol.ticker, symbol.price])

  const numericPrice = parseFloat(price.replace(/,/g, "")) || symbol.price
  const numericAmount = parseFloat(amount) || 0
  const total = numericPrice * numericAmount

  return (
    <div className="flex h-full flex-col bg-[#131722] p-3 text-[12px] text-[#d1d4dc]">
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#9598a1]">
        <span>Available</span>
        <span className="font-mono tabular-nums text-[#d1d4dc]">12,480.50 USDT</span>
      </div>

      <div className="mb-3 grid grid-cols-2 overflow-hidden rounded">
        <button
          onClick={() => setSide("buy")}
          className={cn(
            "h-8 text-[12px] font-semibold",
            side === "buy"
              ? "bg-[#26a69a] text-white"
              : "bg-[#1c2030] text-[#9598a1] hover:bg-[#2a2e39]"
          )}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide("sell")}
          className={cn(
            "h-8 text-[12px] font-semibold",
            side === "sell"
              ? "bg-[#ef5350] text-white"
              : "bg-[#1c2030] text-[#9598a1] hover:bg-[#2a2e39]"
          )}
        >
          Sell / Short
        </button>
      </div>

      <div className="mb-3 flex gap-1">
        {(["limit", "market"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "h-7 flex-1 rounded text-[11px] uppercase tracking-wider",
              type === t
                ? "bg-[#2a2e39] text-white"
                : "text-[#9598a1] hover:bg-[#2a2e39] hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Field
        label="Price"
        suffix="USDT"
        value={type === "market" ? "Market" : price}
        disabled={type === "market"}
        onChange={setPrice}
      />
      <Field label="Amount" suffix={symbol.ticker.split("/")[0]} value={amount} onChange={setAmount} />

      <div className="mb-3 grid grid-cols-4 gap-1">
        {[25, 50, 75, 100].map((p) => (
          <button
            key={p}
            onClick={() => {
              setPct(p)
              setAmount(((12480.5 * (p / 100)) / numericPrice).toFixed(4))
            }}
            className={cn(
              "h-7 rounded text-[11px]",
              pct === p
                ? "bg-[#2a2e39] text-white"
                : "bg-[#1c2030] text-[#9598a1] hover:bg-[#2a2e39] hover:text-white"
            )}
          >
            {p}%
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between text-[11px]">
        <span className="text-[#9598a1]">Total</span>
        <span className="font-mono tabular-nums">
          {total.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT
        </span>
      </div>

      <button
        className={cn(
          "h-9 rounded text-[13px] font-semibold text-white",
          side === "buy"
            ? "bg-[#26a69a] hover:bg-[#2bbbad]"
            : "bg-[#ef5350] hover:bg-[#f56e6c]"
        )}
      >
        {side === "buy" ? "Buy" : "Sell"} {symbol.ticker.split("/")[0]}
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#2a2e39] pt-3 text-[11px] text-[#9598a1]">
        <Stat label="Max Buy" value={`${(12480.5 / numericPrice).toFixed(4)} ${symbol.ticker.split("/")[0]}`} />
        <Stat label="Cost" value={`${total.toFixed(2)} USDT`} />
        <Stat label="Fee (taker)" value={`${(total * 0.001).toFixed(4)} USDT`} />
        <Stat label="Leverage" value="10x cross" />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  suffix,
  onChange,
  disabled,
}: {
  label: string
  value: string
  suffix: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-[#56595e]">
        {label}
      </span>
      <div
        className={cn(
          "flex h-9 items-center rounded border border-[#2a2e39] bg-[#0e1118] px-2",
          disabled && "opacity-60"
        )}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent font-mono text-[12px] tabular-nums text-[#d1d4dc] focus:outline-none"
        />
        <span className="text-[10px] text-[#56595e]">{suffix}</span>
      </div>
    </label>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-mono text-[#d1d4dc]">{value}</span>
    </div>
  )
}
