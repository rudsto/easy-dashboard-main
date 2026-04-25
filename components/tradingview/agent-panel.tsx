"use client"

import * as React from "react"
import {
  ArrowUp,
  AtSign,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Clock,
  Database,
  LineChart as LineIcon,
  Plus,
  Wand2,
  Square,
  Target,
  X,
  Zap,
} from "lucide-react"

import { Symbol, Interval, formatPrice } from "@/lib/market-data"
import { cn } from "@/lib/utils"

type ToolUse = {
  id: string
  icon: React.ComponentType<{ className?: string }>
  name: string
  args: string
  result?: string
  status: "running" | "done"
}

type DraftOrder = {
  side: "long" | "short"
  symbol: string
  size: number
  entry: number
  tp: number
  sl: number
  rr: number
}

type AssistantBlock = {
  id: string
  role: "assistant"
  preface?: string
  tools?: ToolUse[]
  body?: React.ReactNode
  draft?: DraftOrder
  chips?: string[]
  streaming?: boolean
}

type UserBlock = {
  id: string
  role: "user"
  text: string
}

type Block = AssistantBlock | UserBlock

type Props = {
  symbol: Symbol
  interval: Interval
}

const SLASH_COMMANDS = [
  { cmd: "/scan", hint: "scan watchlist" },
  { cmd: "/analyze", hint: "current symbol" },
  { cmd: "/draft", hint: "limit order" },
  { cmd: "/alert", hint: "price alert" },
  { cmd: "/levels", hint: "S/R levels" },
]

export function AgentPanel({ symbol, interval }: Props) {
  const blocks = React.useMemo<Block[]>(() => buildConversation(symbol), [symbol])
  const [draft, setDraft] = React.useState("")
  const [model] = React.useState("Claude Sonnet 4.6")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [blocks])

  return (
    <div className="flex h-full w-full flex-col bg-[#0e1118] text-[#d1d4dc]">
      <Header model={model} />
      <ContextChips symbol={symbol} interval={interval} />

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {blocks.map((b) =>
          b.role === "user" ? (
            <UserMessage key={b.id} block={b} />
          ) : (
            <AssistantMessage key={b.id} block={b} />
          )
        )}
      </div>

      <Composer draft={draft} onChange={setDraft} model={model} />
    </div>
  )
}

function Header({ model }: { model: string }) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-[#2a2e39] px-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#cc785c]/15 text-[#cc785c]">
          <ClaudeStar className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-[#d1d4dc]">Claude</span>
        <button className="flex items-center gap-1 rounded border border-[#2a2e39] px-1.5 py-0.5 text-[10px] text-[#9598a1] hover:bg-[#1c2030]">
          {model}
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <span className="flex items-center gap-1 rounded bg-[#26a69a]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#26a69a]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#26a69a]" />
          live
        </span>
        <button className="flex h-7 w-7 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
          <Clock className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ContextChips({ symbol, interval }: { symbol: Symbol; interval: Interval }) {
  const items = [
    { icon: AtSign, label: symbol.ticker },
    { icon: Clock, label: interval },
    { icon: BarChart3, label: "120 candles" },
    { icon: BookOpen, label: "order book" },
    { icon: Database, label: "watchlist" },
  ]
  return (
    <div className="flex items-center gap-1.5 border-b border-[#2a2e39] bg-[#131722] px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[#56595e]">Context</span>
      <div className="flex flex-wrap items-center gap-1">
        {items.map((c) => {
          const Icon = c.icon
          return (
            <span
              key={c.label}
              className="flex items-center gap-1 rounded border border-[#2a2e39] bg-[#1c2030] px-1.5 py-0.5 text-[10px] text-[#d1d4dc]"
            >
              <Icon className="h-2.5 w-2.5 text-[#9598a1]" />
              {c.label}
            </span>
          )
        })}
        <button className="flex items-center gap-1 rounded border border-dashed border-[#2a2e39] px-1.5 py-0.5 text-[10px] text-[#56595e] hover:border-[#cc785c]/60 hover:text-[#cc785c]">
          <Plus className="h-2.5 w-2.5" />
          add
        </button>
      </div>
    </div>
  )
}

function UserMessage({ block }: { block: UserBlock }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-lg rounded-br-sm border border-[#2a2e39] bg-[#1c2030] px-3 py-2 text-[12.5px] leading-relaxed text-[#d1d4dc]">
        {block.text}
      </div>
    </div>
  )
}

function AssistantMessage({ block }: { block: AssistantBlock }) {
  return (
    <div className="flex gap-2">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#cc785c]/15 text-[#cc785c]">
        <ClaudeStar className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-2 text-[12.5px] leading-relaxed">
        {block.preface && <p className="text-[#d1d4dc]">{block.preface}</p>}

        {block.tools && (
          <div className="space-y-1.5">
            {block.tools.map((t) => (
              <ToolBlock key={t.id} tool={t} />
            ))}
          </div>
        )}

        {block.body && <div className="text-[#d1d4dc]">{block.body}</div>}

        {block.draft && <DraftCard draft={block.draft} />}

        {block.streaming && <StreamingDots />}

        {block.chips && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {block.chips.map((c) => (
              <button
                key={c}
                className="rounded-full border border-[#2a2e39] bg-[#131722] px-2.5 py-1 text-[11px] text-[#d1d4dc] hover:border-[#cc785c]/60 hover:text-[#cc785c]"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolBlock({ tool }: { tool: ToolUse }) {
  const [open, setOpen] = React.useState(tool.status === "running")
  const Icon = tool.icon
  return (
    <div className="overflow-hidden rounded-md border border-[#2a2e39] bg-[#131722]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
      >
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded",
            tool.status === "running"
              ? "bg-[#cc785c]/15 text-[#cc785c]"
              : "bg-[#26a69a]/15 text-[#26a69a]"
          )}
        >
          {tool.status === "running" ? (
            <Wand2 className="h-3 w-3 animate-pulse" />
          ) : (
            <Icon className="h-3 w-3" />
          )}
        </div>
        <div className="flex-1 truncate font-mono text-[11px]">
          <span className="text-[#9598a1]">{tool.name}</span>
          <span className="text-[#56595e]">(</span>
          <span className="text-[#d1d4dc]">{tool.args}</span>
          <span className="text-[#56595e]">)</span>
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
            tool.status === "running"
              ? "bg-[#cc785c]/15 text-[#cc785c]"
              : "bg-[#26a69a]/15 text-[#26a69a]"
          )}
        >
          {tool.status === "running" ? "running" : "done"}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-[#56595e] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && tool.result && (
        <div className="border-t border-[#2a2e39] bg-[#0e1118] px-2.5 py-1.5 font-mono text-[10.5px] leading-relaxed text-[#9598a1]">
          {tool.result}
        </div>
      )}
    </div>
  )
}

function DraftCard({ draft }: { draft: DraftOrder }) {
  const isLong = draft.side === "long"
  return (
    <div className="overflow-hidden rounded-md border border-[#cc785c]/40 bg-gradient-to-br from-[#cc785c]/8 to-transparent">
      <div className="flex items-center justify-between border-b border-[#cc785c]/30 bg-[#cc785c]/10 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#cc785c]">
          <Target className="h-3 w-3" />
          Draft order · {draft.symbol}
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
            isLong
              ? "bg-[#26a69a]/20 text-[#26a69a]"
              : "bg-[#ef5350]/20 text-[#ef5350]"
          )}
        >
          {draft.side}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-2.5 font-mono text-[11px] tabular-nums">
        <Stat label="Size" value={`${draft.size} ${draft.symbol.split("/")[0]}`} />
        <Stat label="Entry" value={formatPrice(draft.entry)} />
        <Stat label="Take Profit" value={formatPrice(draft.tp)} tone="up" />
        <Stat label="Stop Loss" value={formatPrice(draft.sl)} tone="down" />
        <Stat label="R:R" value={`1 : ${draft.rr.toFixed(2)}`} />
        <Stat
          label="Notional"
          value={`$${(draft.size * draft.entry).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`}
        />
      </div>
      <div className="flex gap-1.5 border-t border-[#2a2e39] bg-[#0e1118] p-2">
        <button className="flex-1 rounded bg-[#cc785c] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#d97757]">
          Send to dry-run
        </button>
        <button className="rounded border border-[#2a2e39] px-2 py-1.5 text-[11px] text-[#9598a1] hover:bg-[#1c2030]">
          Edit
        </button>
        <button className="rounded border border-[#2a2e39] px-2 py-1.5 text-[11px] text-[#9598a1] hover:bg-[#1c2030]">
          Discard
        </button>
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
    <div className="flex items-center justify-between">
      <span className="font-sans text-[#56595e]">{label}</span>
      <span
        className={cn(
          "text-[#d1d4dc]",
          tone === "up" && "text-[#26a69a]",
          tone === "down" && "text-[#ef5350]"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function StreamingDots() {
  return (
    <div className="flex items-center gap-1 text-[#cc785c]">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#cc785c]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#cc785c] [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#cc785c] [animation-delay:300ms]" />
      <span className="ml-1 text-[10px] uppercase tracking-wider text-[#56595e]">
        thinking
      </span>
    </div>
  )
}

function Composer({
  draft,
  onChange,
  model,
}: {
  draft: string
  onChange: (v: string) => void
  model: string
}) {
  return (
    <div className="border-t border-[#2a2e39] bg-[#131722] p-2">
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        {SLASH_COMMANDS.map((s) => (
          <button
            key={s.cmd}
            onClick={() => onChange(s.cmd + " ")}
            className="flex items-center gap-1 rounded border border-[#2a2e39] bg-[#0e1118] px-1.5 py-0.5 text-[10px] text-[#9598a1] hover:border-[#cc785c]/60 hover:text-[#cc785c]"
          >
            <span className="font-mono text-[#cc785c]">{s.cmd}</span>
            <span className="text-[#56595e]">{s.hint}</span>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-[#2a2e39] bg-[#0e1118] focus-within:border-[#cc785c]/60">
        <textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder="Ask Claude about this market…"
          className="w-full resize-none bg-transparent px-2.5 py-2 text-[12px] text-[#d1d4dc] placeholder:text-[#56595e] focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-[#2a2e39] px-2 py-1.5">
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-6 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
              <AtSign className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-6 w-6 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
              <LineIcon className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-6 w-6 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
              <Bell className="h-3.5 w-3.5" />
            </button>
            <span className="ml-1 rounded border border-[#2a2e39] px-1.5 py-0.5 font-mono text-[9px] text-[#56595e]">
              {model.split(" ").slice(-2).join(" ")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="flex h-6 w-6 items-center justify-center rounded text-[#9598a1] hover:bg-[#1c2030]">
              <Square className="h-3 w-3" />
            </button>
            <button
              className={cn(
                "flex h-6 items-center gap-1 rounded px-2 text-[11px] font-semibold text-white",
                draft.trim()
                  ? "bg-[#cc785c] hover:bg-[#d97757]"
                  : "bg-[#cc785c]/40 cursor-not-allowed"
              )}
            >
              <ArrowUp className="h-3 w-3" />
              Run
            </button>
          </div>
        </div>
      </div>

      <p className="mt-1.5 text-center text-[9.5px] text-[#56595e]">
        Claude reads market data only. Trades require your confirmation.
      </p>
    </div>
  )
}

function ClaudeStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 L13.6 8.4 L20 10 L13.6 11.6 L12 18 L10.4 11.6 L4 10 L10.4 8.4 Z" />
      <path d="M18 14 L18.7 16.3 L21 17 L18.7 17.7 L18 20 L17.3 17.7 L15 17 L17.3 16.3 Z" />
    </svg>
  )
}

function buildConversation(symbol: Symbol): Block[] {
  const tickerOnly = symbol.ticker.split("/")[0]
  const entry = symbol.price
  const tp = +(entry * 1.034).toFixed(2)
  const sl = +(entry * 0.987).toFixed(2)
  const rr = (tp - entry) / (entry - sl)

  return [
    {
      id: "u1",
      role: "user",
      text: "Scan my watchlist and find the strongest long setup right now. Walk me through your reasoning.",
    },
    {
      id: "a1",
      role: "assistant",
      preface:
        "I'll run a multi-factor scan across the 14 symbols in your watchlist (trend, momentum, volume, structure) and verify the top candidate against the live order book.",
      tools: [
        {
          id: "t1",
          icon: Database,
          name: "scan_watchlist",
          args: 'timeframe: "1h", factors: ["trend","momentum","volume","structure"]',
          status: "done",
          result:
            "ranked 14 symbols\n  1. SOL/USDT  score 0.82  ✓ trend ✓ momentum ✓ vol\n  2. BTC/USDT  score 0.71  ✓ trend ~ momentum\n  3. NVDA      score 0.68  ✓ trend ✓ momentum\n  …",
        },
        {
          id: "t2",
          icon: BarChart3,
          name: "compute_indicators",
          args: 'ticker: "SOL/USDT", indicators: ["RSI(14)","EMA(20,50)","VWAP"]',
          status: "done",
          result:
            "RSI(14)  58.4   (rising, no divergence)\nEMA20    > EMA50  (stacked bull)\nVWAP     reclaimed 32m ago",
        },
        {
          id: "t3",
          icon: BookOpen,
          name: "read_order_book",
          args: 'ticker: "SOL/USDT", depth: 50',
          status: "done",
          result:
            "bid wall at 161.20  (size 18.4k)\nask thin to 164.50\nimbalance +0.34 (bid heavy)",
        },
        {
          id: "t4",
          icon: LineIcon,
          name: "find_levels",
          args: 'ticker: "SOL/USDT", lookback: "7d"',
          status: "running",
          result: undefined,
        },
      ],
      body: (
        <div className="space-y-2">
          <p>
            <strong className="text-white">SOL/USDT</strong> is the strongest long
            candidate. Reclaim of VWAP with stacked EMAs, supportive 1h structure,
            and a deep bid wall at 161.20 acting as defendable invalidation.
            Risk:reward from current price is{" "}
            <span className="font-mono text-[#26a69a]">1 : {rr.toFixed(2)}</span>.
          </p>
          <ul className="space-y-1 pl-4 text-[#9598a1]">
            <li>· Entry near current with size scaled to 1% account risk</li>
            <li>· Stop just below 161.20 wall (structural)</li>
            <li>· First TP at the prior swing high</li>
          </ul>
        </div>
      ),
      draft: {
        side: "long",
        symbol: symbol.ticker,
        size: +(2200 / entry).toFixed(2),
        entry,
        tp,
        sl,
        rr,
      },
      chips: [
        "Add EMA(20,50) to chart",
        "Set alert at 161.20",
        "Run again on 4h",
        "What's the bear case?",
      ],
      streaming: true,
    },
  ]
}
