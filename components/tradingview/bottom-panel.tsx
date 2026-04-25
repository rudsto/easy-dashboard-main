"use client"

import * as React from "react"

import { Position, formatPrice, getPositions } from "@/lib/market-data"
import { cn } from "@/lib/utils"

const TABS = ["Positions", "Open Orders", "Order History", "Trade History", "Notifications"] as const
type Tab = (typeof TABS)[number]

export function BottomPanel() {
  const [tab, setTab] = React.useState<Tab>("Positions")
  const positions = React.useMemo(() => getPositions(), [])
  const totalPnl = positions.reduce((a, p) => a + p.pnl, 0)
  const totalMargin = positions.reduce((a, p) => a + p.margin, 0)

  return (
    <div className="flex h-full w-full flex-col bg-[#131722] text-[#d1d4dc]">
      <div className="flex h-9 items-center border-b border-[#2a2e39] px-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-7 rounded px-3 text-[12px]",
              tab === t
                ? "bg-[#2a2e39] text-white"
                : "text-[#9598a1] hover:bg-[#2a2e39] hover:text-white"
            )}
          >
            {t}
            {t === "Positions" && (
              <span className="ml-1.5 rounded bg-[#2962ff]/20 px-1 text-[10px] text-[#2962ff]">
                {positions.length}
              </span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 pr-2 font-mono text-[11px]">
          <Stat label="Margin" value={"$" + totalMargin.toLocaleString("en-US", { maximumFractionDigits: 2 })} />
          <Stat
            label="Unrealized PnL"
            value={(totalPnl >= 0 ? "+$" : "-$") + Math.abs(totalPnl).toFixed(2)}
            tone={totalPnl >= 0 ? "up" : "down"}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "Positions" ? (
          <PositionsTable positions={positions} />
        ) : (
          <EmptyState label={tab} />
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "up" | "down"
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[#9598a1]">{label}</span>
      <span
        className={cn(
          "tabular-nums text-[#d1d4dc]",
          tone === "up" && "text-[#26a69a]",
          tone === "down" && "text-[#ef5350]"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <table className="w-full text-[12px]">
      <thead className="text-[10px] uppercase tracking-wider text-[#56595e]">
        <tr className="border-b border-[#2a2e39]">
          <Th>Symbol</Th>
          <Th>Side</Th>
          <Th align="right">Size</Th>
          <Th align="right">Entry</Th>
          <Th align="right">Mark</Th>
          <Th align="right">PnL</Th>
          <Th align="right">PnL %</Th>
          <Th align="right">Margin</Th>
          <Th align="right">Actions</Th>
        </tr>
      </thead>
      <tbody className="font-mono tabular-nums">
        {positions.map((p) => (
          <tr key={p.symbol} className="border-b border-[#1c2030] hover:bg-[#1c2030]">
            <Td className="font-sans font-medium">{p.symbol}</Td>
            <Td>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  p.side === "long"
                    ? "bg-[#26a69a]/15 text-[#26a69a]"
                    : "bg-[#ef5350]/15 text-[#ef5350]"
                )}
              >
                {p.side}
              </span>
            </Td>
            <Td align="right">{p.size}</Td>
            <Td align="right">{formatPrice(p.entry)}</Td>
            <Td align="right">{formatPrice(p.mark)}</Td>
            <Td align="right" className={p.pnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"}>
              {p.pnl >= 0 ? "+" : "-"}${Math.abs(p.pnl).toFixed(2)}
            </Td>
            <Td align="right" className={p.pnlPct >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"}>
              {p.pnlPct >= 0 ? "+" : ""}
              {p.pnlPct.toFixed(2)}%
            </Td>
            <Td align="right">${p.margin.toFixed(2)}</Td>
            <Td align="right">
              <button className="rounded border border-[#2a2e39] px-2 py-0.5 text-[10px] text-[#9598a1] hover:border-[#ef5350] hover:text-[#ef5350]">
                Close
              </button>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className={cn(
        "px-3 py-1.5 font-medium",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode
  align?: "left" | "right"
  className?: string
}) {
  return (
    <td
      className={cn(
        "px-3 py-2 text-[#d1d4dc]",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </td>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-[12px] text-[#56595e]">
      No {label.toLowerCase()} to display
    </div>
  )
}
