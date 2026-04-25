# Handoff: Agentic Trading Dashboard

A redesign of a TradingView-style trading dashboard, restructured around an **AI agent (Claude) as the primary interface** rather than as a side panel. The user converses with the agent; the agent pins charts, order books, and draft orders inline as it works.

The original was a dense multi-panel pro-tool layout. This redesign trades pixel-density for **legibility, trust, and explainability** — every claim the agent makes is auditable, every action is reversible.

---

## About the Design Files

The HTML files in this bundle are **design references built as runnable prototypes**. They are not production code to copy directly. Treat them as a high-fidelity spec showing intended look, layout, copy, interaction model, and motion.

The implementation task is to **recreate these designs in the target codebase's environment** (likely React + TypeScript given the prototype is JSX, but use whatever the host app already uses) — wired to real market data, real LLM streaming, and the host app's design tokens / component library.

The prototype uses:
- React 18 (UMD via Babel standalone — replace with the project's bundler)
- Inline `<script type="text/babel">` tags (replace with proper module imports)
- Mock data in `data.jsx` (replace with WebSocket / REST data sources)
- Simulated tool-call streaming via `setTimeout` (replace with real SSE / WebSocket from the agent backend)

## Fidelity

**High-fidelity (hi-fi).** Final colors, typography, spacing, and interaction patterns are committed. Recreate pixel-close. Two versions exist:

- `Agentic Trading Dashboard.html` — **v1**, baseline agent-first layout
- `Agentic Trading Dashboard v2.html` — **v2** (recommended), adds live tool streaming, annotated chart, explainability popovers, undo buffer, memory strip

**Build v2.** v1 is included only as a reference for the simpler timeline if v2's complexity needs to be staged.

---

## Design Tokens

Defined in `styles.css` under `:root` (light) and `[data-theme="dark"]`. Both themes are first-class.

### Colors — light
| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf8f5` | App background (warm off-white) |
| `--bg-2` | `#f3efe8` | Sidebar, secondary surfaces |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-2` | `#fbf9f4` | Inset surfaces |
| `--fg` | `#1a1816` | Primary text |
| `--fg-2` | `#3d3a36` | Secondary text |
| `--muted` | `#7a7670` | Muted text |
| `--muted-2` | `#9c9892` | Tertiary / labels |
| `--line` | `#e8e3d9` | Borders |
| `--line-soft` | `#efeae0` | Soft borders |
| `--accent` | `#b86b3d` | Brand accent (warm terracotta) — tweakable |
| `--accent-soft` | `#e8d4c4` | Accent backgrounds |
| `--positive` | `#5a7a3e` | Profit / up |
| `--negative` | `#a84a3c` | Loss / down |
| `--warning` | `#b8862c` | Warnings |

### Colors — dark
| Token | Value |
|---|---|
| `--bg` | `#16140f` |
| `--bg-2` | `#1d1a14` |
| `--surface` | `#211d16` |
| `--fg` | `#ebe4d4` |
| `--fg-2` | `#c8c0ad` |
| `--line` | `#2d281f` |
| (positive/negative slightly lifted for contrast) |

### Typography
- **Sans**: `Inter`, system-ui fallback. Weights 400, 500, 600.
- **Mono**: `JetBrains Mono`, ui-monospace fallback. Weights 400, 500.
- **Serif** (only for the brand wordmark in sidebar): `Newsreader`.

Scale:
| Use | Size | Weight | Line-height |
|---|---|---|---|
| Body | 14px | 400 | 1.55 |
| Agent message | 14.5px | 400 | 1.6 |
| User message | 14px | 400 | 1.55 |
| Numbers / data | 13px mono | 500 | 1.4 |
| Labels (uppercase) | 10–11px | 500 | letter-spacing 0.08em |
| Card title | 13px | 600 | 1.3 |
| Headline (sidebar wordmark) | 18px serif | 500 | — |
| Minimum allowed text | 11px | — | — |

### Spacing
4px grid. Card padding 14–16px. Gap between major regions 12–16px. Generous reading width on the conversation: max 720px content column.

### Radii
- `--r-sm` 6px — chips, pills
- `--r-md` 10px — buttons, inputs
- `--r-lg` 14px — cards
- `--r-xl` 20px — composer, large surfaces

### Shadows
Avoid heavy drop shadows. Use a 1px border + subtle `box-shadow: 0 1px 2px rgba(0,0,0,0.04)` for elevated cards.

### Density modes (tweakable)
- Compact: row-padding 6px, font 13px
- Cozy (default): row-padding 10px, font 14px
- Spacious: row-padding 14px, font 14.5px

---

## Layout

```
┌─────────┬───────────────────────────────────┬──────────────┐
│         │  Memory strip                      │              │
│ Sidebar ├───────────────────────────────────┤  Right rail  │
│ 240px   │                                    │  300px       │
│         │   Conversation timeline            │              │
│ - logo  │   (max-width 720px, centered)      │  - Watchlist │
│ - new   │                                    │  - Positions │
│   chat  │   • user message                   │  - Guard-    │
│ - work- │   • agent message                  │    rails     │
│   spaces│   • tool-call block                │              │
│ - sess- │   • pinned chart card              │              │
│   ions  │   • pinned draft-order card        │              │
│ - alerts│                                    │              │
│ - risk  │                                    │              │
│   rules │                                    │              │
│         ├───────────────────────────────────┤              │
│         │  Composer (chat input + chips)     │              │
│         │  Trust bar                         │              │
└─────────┴───────────────────────────────────┴──────────────┘
```

Total min width: 1280px. Below that, right rail collapses to a drawer; below 900px, sidebar collapses too.

---

## Screens / Components

### 1. Sidebar (left, 240px)
- **Wordmark** at top — serif, "Claude / Markets"
- **New session** button (full-width, accent border)
- **Workspaces** section — list of saved trading contexts (e.g. "Crypto majors", "Earnings plays")
- **Recent sessions** — timestamped, last message preview, max 6 visible
- **Alerts** — count badge if any active
- **Risk rules** — link to memory editor
- **Footer**: paper/live toggle (small), user avatar

### 2. Memory strip (top of main, full-width)
- Label: `CLAUDE REMEMBERS` (uppercase, 10px, muted)
- Pills, comma-separated values: e.g. "R:R ≥ 2", "no trades before 09:30", "max 3 open positions", "stop required", "prefers volume confirmation"
- Each pill is editable on click (inline edit, save on blur)
- "+" pill at end to add a new memory
- All pills must be `white-space: nowrap` and the strip must scroll horizontally if overflow

### 3. Conversation timeline (center)
- Max content width 720px, centered with auto margins
- **User messages**: right-aligned, accent-soft background, 14px, no avatar
- **Agent messages**: left-aligned, no background, agent avatar 24px circle
- **Tool-call blocks** (key v2 feature): inset card showing the agent's live work
  - Header: tool icon + name + status dot (running/done/error)
  - Body: streamed JSON or summary line
  - Progress bar fills as the call streams
  - Multiple tool calls collapse into a stack with overall progress
- **Pinned cards**: full-width within the 720px column, the agent "pins" these as it answers
  - Annotated chart card (see component 5)
  - Draft order card (see component 6)
  - Order book / depth card

### 4. Composer (bottom of main)
- Rounded textarea (radius 20px), grows to ~5 lines max then scrolls
- Suggested **chips** above the input — `white-space: nowrap`, scroll horizontally if overflow
  - Examples: "Re-run analysis on SOL/USDT (live)", "Set an alert at 161.20", "What's the bear case here?"
- Send button (accent), keyboard `Enter` to send, `Shift+Enter` for newline
- **Trust bar** below: small icon + text, single line, e.g. "🔒 Paper mode · Claude can draft orders, you confirm"

### 5. Annotated chart (pinned card)
The chart visualizes the agent's reasoning, not raw data alone.
- SVG candlestick chart, ~280px tall
- `preserveAspectRatio="xMidYMid meet"` (NOT `none` — `none` collapses the SVG)
- Overlays drawn directly on the chart:
  - Entry price line (dashed, accent)
  - Stop-loss line (dashed, negative)
  - Take-profit line (dashed, positive)
  - Bid wall annotation (horizontal band, muted)
  - VWAP line (solid, muted)
- Each overlay has a small **ⓘ button** at the right edge — click opens a popover showing the reasoning: which indicator, which values, which logic
- Hover anywhere on the chart shows OHLC tooltip in mono
- User's existing entry (if any) shown as dotted line in a different color

### 6. Draft order card (pinned card)
- Header: side badge (Long/Short, color-coded) + symbol + "DRAFT"
- Three-column grid: Entry / Stop / Target — each with price and "% from current" in mono
- **Risk bar**: visual bar showing R:R ratio with marker, label "R:R 1 : 2.34" (clickable for explanation)
- Position size + dollar risk in mono
- Action row: `[ Dry run ]` `[ Edit ]` `[ Confirm & send ]` (accent button)
- Confirm triggers the **undo toast** (component 8)

### 7. Right rail (300px)
Three stacked sections, each with `rail-head` (uppercase 11px label + count, `white-space: nowrap`):
- **Watchlist** — symbol, last price (mono, color-coded), Δ%, sparkline 60px wide
- **Open positions** — symbol, qty, entry, unrealized PnL (mono, `white-space: nowrap` on `pos-meta`)
- **Guardrails** — list of active risk rules with status (✓ within / ⚠ near / ✕ breached)

### 8. Undo toast (after Confirm & send)
- Bottom-center, 64px from bottom
- Surface card with: spinner → "Sending order in 5s" → countdown
- Live progress bar fills over 5 seconds
- `[ Undo ]` button, accent
- After 5s elapsed: toast morphs to "Sent ✓" and auto-dismisses after 2s
- If Undo clicked: order cancelled, toast becomes "Cancelled" then dismisses

### 9. Explainability popovers
- Any **dotted-underlined** word/phrase in agent messages is clickable
- Popover (bottom-aligned to anchor): max 320px wide
  - Title (the claim)
  - 3 bullet points of reasoning
  - "Sources" line: which tools / data points were used
  - Link: "View full reasoning trace →"
- Same popover used by chart ⓘ buttons and the R:R badge on draft orders

---

## Interactions & Behavior

### Live tool-call streaming
- When user sends a message, the agent response area renders progressively:
  1. Tool-call blocks appear in order, status `running` (pulsing dot)
  2. Each tool-call has its own progress (0→100% over its duration)
  3. Overall stack progress bar at top fills proportionally
  4. As each completes, status flips to `done`, dot stops pulsing
  5. Pinned cards (chart, draft) appear after the relevant tool finishes
  6. Final agent text streams in token-by-token after all tools complete
- For real implementation: Server-Sent Events or WebSocket from the agent backend, with events like `tool_start`, `tool_progress`, `tool_end`, `text_delta`

### Memory strip editing
- Click pill → becomes input
- Enter saves, Esc cancels, blur saves
- "+" pill expands to input on click
- All edits POST to a memory endpoint; optimistic UI

### Theme toggle
- Persists in localStorage as `dashboard-theme`
- `data-theme="dark"` on `<html>` root
- Smooth 200ms color transition

### Density toggle (Tweaks)
- Sets `data-density="compact|cozy|spacious"` on root
- Adjusts spacing / font tokens via CSS attribute selectors

### Layout toggle (Tweaks)
- "Full" — sidebar + timeline + right rail
- "Focus" — chat-only, hides sidebar and right rail (Cmd+\\ shortcut)

### Chart hover
- Mouse move over SVG → calculate nearest candle index → show OHLC tooltip
- Tooltip follows cursor with 12px offset, mono font

---

## State Management

Minimum state needed:

```ts
type DashboardState = {
  theme: 'light' | 'dark'
  density: 'compact' | 'cozy' | 'spacious'
  layout: 'full' | 'focus'
  accent: string  // OKLCH or hex
  showMemory: boolean

  activeSessionId: string
  sessions: Session[]
  memory: MemoryItem[]

  conversation: Message[]    // mix of user, agent, tool-call, pinned-card
  streamingMessageId: string | null
  toolCalls: Record<string, ToolCallState>

  watchlist: Symbol[]
  positions: Position[]
  guardrails: Rule[]

  pendingOrder: DraftOrder | null
  undoTimer: { orderId: string, expiresAt: number } | null
}
```

Streaming and undo are the two stateful interactions that need careful implementation:
- **Streaming**: append-only event log, derive UI from events
- **Undo**: timer-based; on `confirm` set `expiresAt = Date.now() + 5000`, render countdown, dispatch real order only after timer elapses

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Agentic Trading Dashboard v2.html` | **Main reference — build this** |
| `Agentic Trading Dashboard.html` | v1, simpler version, reference for layout fundamentals |
| `styles.css` | Base tokens, layout, components |
| `styles-v2.css` | v2-specific styles (memory strip, annotated chart, popovers, undo toast, tool-call blocks) |
| `data.jsx` | Mock data — sessions, candles, watchlist, positions |
| `primitives.jsx` | Button, Pill, Card, Badge primitives |
| `shell.jsx` | Sidebar + main + right-rail layout |
| `timeline.jsx` | v1 conversation timeline |
| `timeline-v2.jsx` | v2 conversation timeline (with tool-call blocks, pinned cards, popovers) |
| `pinned-cards.jsx` | Chart card, draft-order card |
| `v2-components.jsx` | Annotated chart SVG, undo toast, memory strip |
| `tweaks-panel.jsx` | Tweaks UI (theme/density/layout/accent) — strip for production or keep as a dev panel |

---

## Implementation order (suggested)

1. **Tokens + theme**: port colors/type/spacing into the host app's token system
2. **Shell layout**: sidebar + main + right rail, responsive collapse
3. **Static conversation**: render messages without streaming, with mock data
4. **Pinned cards**: annotated chart (real candle data first, annotations second), draft order
5. **Right rail**: watchlist + positions + guardrails (read-only first)
6. **Tool-call streaming**: wire to agent backend
7. **Memory strip**: editable pills + persistence
8. **Undo toast**: 5s buffer before order dispatch
9. **Explainability popovers**: hook into agent's reasoning trace
10. **Tweaks**: theme + density + layout + accent (optional for production)

---

## Notes for the developer

- **Original repo cited**: `tradingview/easy-dashboard-main` was used as the visual baseline for what NOT to do (dense multi-panel). This redesign deliberately departs from it.
- **No copyrighted UI**: this design is original. Do not lift TradingView, Bloomberg, or other branded chrome.
- **Real LLM**: the prototype simulates Claude responses with timeouts. Wire to your actual agent backend (Anthropic API + tool use + streaming).
- **Real market data**: candles, order book, watchlist prices need a live source (your existing data layer).
- **Accessibility**: ensure keyboard nav for composer chips, tool-call expansion, and memory pill editing. Color contrast is AA in both themes — verify after porting tokens.
- **Performance**: tool-call blocks can pile up in long sessions. Virtualize the timeline if sessions go beyond ~50 turns.

Questions on intent or tradeoffs — refer back to the live prototype, it's the source of truth.
