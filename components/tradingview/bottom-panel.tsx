"use client"

import * as React from "react"

import { Position, formatPrice, getPositions } from "@/lib/market-data"
import { cn } from "@/lib/utils"

const TABS = [
  "Positions",
  "Open Orders",
  "Order History",
  "Trade History",
  "Notifications",
  "Agent Tasks",
] as const
type Tab = (typeof TABS)[number]

type AgentTask = {
  time: string
  agent: string
  tool: string
  args: string
  status: "running" | "done" | "queued"
  duration: string
  result: string
}

const AGENT_TASKS: AgentTask[] = [
  {
    time: "14:32:08",
    agent: "Sonnet 4.6",
    tool: "scan_watchlist",
    args: 'tf:"1h", factors:["trend","mom","vol","struct"]',
    status: "done",
    duration: "1.4s",
    result: "ranked 14 — top: SOL/USDT (0.82)",
  },
  {
    time: "14:32:09",
    agent: "Sonnet 4.6",
    tool: "compute_indicators",
    args: 'sym:"SOL/USDT", ind:["RSI","EMA","VWAP"]',
    status: "done",
    duration: "0.6s",
    result: "RSI 58.4 · EMA20>EMA50 · VWAP reclaimed",
  },
  {
    time: "14:32:10",
    agent: "Sonnet 4.6",
    tool: "read_order_book",
    args: 'sym:"SOL/USDT", depth:50',
    status: "done",
    duration: "0.3s",
    result: "bid wall 161.20 · imbalance +0.34",
  },
  {
    time: "14:32:11",
    agent: "Sonnet 4.6",
    tool: "find_levels",
    args: 'sym:"SOL/USDT", lookback:"7d"',
    status: "running",
    duration: "—",
    result: "scanning swing pivots…",
  },
  {
    time: "14:32:11",
    agent: "Sonnet 4.6",
    tool: "draft_order",
    args: "side:long, size:13.55 SOL",
    status: "queued",
    duration: "—",
    result: "waits for find_levels",
  },
]

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
            {t === "Agent Tasks" && (
              <span className="ml-1.5 flex items-center gap-1 rounded bg-[#cc785c]/15 px-1 text-[10px] text-[#cc785c]">
                <span className="h-1 w-1 animate-pulse rounded-full bg-[#cc785c]" />
                {AGENT_TASKS.filter((t) => t.status === "running").length}
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
        ) : tab === "Agent Tasks" ? (
          <AgentTasksTable />
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

function AgentTasksTable() {
  return (
    <table className="w-full text-[12px]">
      <thead className="text-[10px] uppercase tracking-wider text-[#56595e]">
        <tr className="border-b border-[#2a2e39]">
          <Th>Time</Th>
          <Th>Agent</Th>
          <Th>Tool</Th>
          <Th>Arguments</Th>
          <Th>Status</Th>
          <Th align="right">Duration</Th>
          <Th>Result</Th>
        </tr>
      </thead>
      <tbody className="font-mono tabular-nums">
        {AGENT_TASKS.map((t, i) => (
          <tr key={i} className="border-b border-[#1c2030] hover:bg-[#1c2030]">
            <Td className="text-[#9598a1]">{t.time}</Td>
            <Td>
              <span className="rounded border border-[#cc785c]/30 bg-[#cc785c]/10 px-1.5 py-0.5 text-[10px] text-[#cc785c]">
                {t.agent}
              </span>
            </Td>
            <Td className="text-[#d1d4dc]">{t.tool}</Td>
            <Td className="max-w-[280px] truncate text-[11px] text-[#9598a1]">
              {t.args}
            </Td>
            <Td>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                  t.status === "done" && "bg-[#26a69a]/15 text-[#26a69a]",
                  t.status === "running" && "bg-[#cc785c]/15 text-[#cc785c]",
                  t.status === "queued" && "bg-[#2a2e39] text-[#9598a1]"
                )}
              >
                {t.status === "running" && (
                  <span className="mr-1 inline-block h-1 w-1 animate-pulse rounded-full bg-[#cc785c]" />
                )}
                {t.status}
              </span>
            </Td>
            <Td align="right" className="text-[#d1d4dc]">{t.duration}</Td>
            <Td className="text-[11px] text-[#9598a1]">{t.result}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-[12px] text-[#56595e]">
      No {label.toLowerCase()} to display
    </div>
  )
}
