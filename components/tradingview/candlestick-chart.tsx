"use client"

import * as React from "react"

import { Candle, formatPrice, formatVolume } from "@/lib/market-data"

type Props = {
  candles: Candle[]
  className?: string
}

const PADDING = { top: 16, right: 64, bottom: 28, left: 8 }
const VOLUME_RATIO = 0.22
const PRICE_GAP = 6

export function CandlestickChart({ candles, className }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ w: 800, h: 480 })
  const [hover, setHover] = React.useState<{ x: number; y: number; idx: number } | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setSize({ w: Math.max(320, r.width), h: Math.max(280, r.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const innerW = w - PADDING.left - PADDING.right
  const priceH = (h - PADDING.top - PADDING.bottom) * (1 - VOLUME_RATIO) - PRICE_GAP
  const volH = (h - PADDING.top - PADDING.bottom) * VOLUME_RATIO
  const priceTop = PADDING.top
  const priceBottom = priceTop + priceH
  const volTop = priceBottom + PRICE_GAP
  const volBottom = volTop + volH

  const min = Math.min(...candles.map((c) => c.low))
  const max = Math.max(...candles.map((c) => c.high))
  const pad = (max - min) * 0.06
  const yMin = min - pad
  const yMax = max + pad
  const maxVol = Math.max(...candles.map((c) => c.volume), 1)

  const slotW = innerW / candles.length
  const candleW = Math.max(1.5, slotW * 0.65)

  const yPrice = (v: number) =>
    priceBottom - ((v - yMin) / (yMax - yMin)) * priceH
  const yVol = (v: number) => volBottom - (v / maxVol) * volH
  const xCenter = (i: number) => PADDING.left + slotW * i + slotW / 2

  const ticks = React.useMemo(() => {
    const arr: number[] = []
    const step = niceStep((yMax - yMin) / 6)
    const start = Math.ceil(yMin / step) * step
    for (let v = start; v <= yMax; v += step) arr.push(v)
    return arr
  }, [yMin, yMax])

  const timeTicks = React.useMemo(() => {
    const out: { idx: number; label: string }[] = []
    const target = Math.max(4, Math.floor(innerW / 110))
    const step = Math.max(1, Math.floor(candles.length / target))
    for (let i = step; i < candles.length; i += step) {
      const d = new Date(candles[i].time)
      out.push({
        idx: i,
        label:
          String(d.getUTCMonth() + 1).padStart(2, "0") +
          "/" +
          String(d.getUTCDate()).padStart(2, "0") +
          " " +
          String(d.getUTCHours()).padStart(2, "0") +
          ":" +
          String(d.getUTCMinutes()).padStart(2, "0"),
      })
    }
    return out
  }, [candles, innerW])

  const last = candles[candles.length - 1]
  const lastY = yPrice(last.close)
  const lastUp = last.close >= last.open

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const idx = Math.min(
      candles.length - 1,
      Math.max(0, Math.floor((x - PADDING.left) / slotW))
    )
    setHover({ x, y, idx })
  }

  const hoverCandle = hover ? candles[hover.idx] : null
  const hoverPrice = hover
    ? yMin + ((priceBottom - hover.y) / priceH) * (yMax - yMin)
    : 0

  return (
    <div ref={containerRef} className={className}>
      <svg
        width={w}
        height={h}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block cursor-crosshair"
      >
        <rect width={w} height={h} fill="hsl(220 13% 9%)" />

        {ticks.map((t) => {
          const y = yPrice(t)
          return (
            <g key={"g" + t}>
              <line
                x1={PADDING.left}
                x2={w - PADDING.right}
                y1={y}
                y2={y}
                stroke="hsl(220 13% 16%)"
                strokeWidth={1}
              />
              <text
                x={w - PADDING.right + 6}
                y={y + 3}
                fontSize={10}
                fill="hsl(220 9% 60%)"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
              >
                {formatPrice(t)}
              </text>
            </g>
          )
        })}

        {timeTicks.map((t) => {
          const x = xCenter(t.idx)
          return (
            <g key={"t" + t.idx}>
              <line
                x1={x}
                x2={x}
                y1={priceTop}
                y2={volBottom}
                stroke="hsl(220 13% 14%)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={h - 8}
                fontSize={10}
                fill="hsl(220 9% 55%)"
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
              >
                {t.label}
              </text>
            </g>
          )
        })}

        <line
          x1={PADDING.left}
          x2={w - PADDING.right}
          y1={priceBottom}
          y2={priceBottom}
          stroke="hsl(220 13% 22%)"
        />
        <line
          x1={PADDING.left}
          x2={w - PADDING.right}
          y1={volBottom}
          y2={volBottom}
          stroke="hsl(220 13% 22%)"
        />

        {candles.map((c, i) => {
          const up = c.close >= c.open
          const fill = up ? "#26a69a" : "#ef5350"
          const x = xCenter(i)
          const yOpen = yPrice(c.open)
          const yClose = yPrice(c.close)
          const top = Math.min(yOpen, yClose)
          const bodyH = Math.max(1, Math.abs(yClose - yOpen))
          return (
            <g key={c.time}>
              <line
                x1={x}
                x2={x}
                y1={yPrice(c.high)}
                y2={yPrice(c.low)}
                stroke={fill}
                strokeWidth={1}
              />
              <rect
                x={x - candleW / 2}
                y={top}
                width={candleW}
                height={bodyH}
                fill={fill}
              />
              <rect
                x={x - candleW / 2}
                y={yVol(c.volume)}
                width={candleW}
                height={volBottom - yVol(c.volume)}
                fill={fill}
                opacity={0.55}
              />
            </g>
          )
        })}

        <line
          x1={PADDING.left}
          x2={w - PADDING.right}
          y1={lastY}
          y2={lastY}
          stroke={lastUp ? "#26a69a" : "#ef5350"}
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <rect
          x={w - PADDING.right}
          y={lastY - 9}
          width={PADDING.right - 2}
          height={18}
          fill={lastUp ? "#26a69a" : "#ef5350"}
        />
        <text
          x={w - PADDING.right + 4}
          y={lastY + 4}
          fontSize={11}
          fill="white"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fontWeight={600}
        >
          {formatPrice(last.close)}
        </text>

        {hover && (
          <g pointerEvents="none">
            <line
              x1={xCenter(hover.idx)}
              x2={xCenter(hover.idx)}
              y1={priceTop}
              y2={volBottom}
              stroke="hsl(220 9% 55%)"
              strokeDasharray="2 3"
            />
            <line
              x1={PADDING.left}
              x2={w - PADDING.right}
              y1={hover.y}
              y2={hover.y}
              stroke="hsl(220 9% 55%)"
              strokeDasharray="2 3"
            />
            <rect
              x={w - PADDING.right}
              y={hover.y - 9}
              width={PADDING.right - 2}
              height={18}
              fill="hsl(220 9% 30%)"
            />
            <text
              x={w - PADDING.right + 4}
              y={hover.y + 4}
              fontSize={11}
              fill="white"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {formatPrice(hoverPrice)}
            </text>
          </g>
        )}

        {hoverCandle && (
          <g>
            <rect
              x={10}
              y={8}
              width={340}
              height={22}
              fill="hsl(220 13% 11%)"
              stroke="hsl(220 13% 22%)"
              rx={3}
            />
            <text
              x={18}
              y={23}
              fontSize={11}
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fill="hsl(220 9% 75%)"
            >
              <tspan fill="hsl(220 9% 55%)">O</tspan>{" "}
              <tspan fill={hoverCandle.close >= hoverCandle.open ? "#26a69a" : "#ef5350"}>
                {formatPrice(hoverCandle.open)}
              </tspan>{"   "}
              <tspan fill="hsl(220 9% 55%)">H</tspan>{" "}
              <tspan fill="#26a69a">{formatPrice(hoverCandle.high)}</tspan>{"   "}
              <tspan fill="hsl(220 9% 55%)">L</tspan>{" "}
              <tspan fill="#ef5350">{formatPrice(hoverCandle.low)}</tspan>{"   "}
              <tspan fill="hsl(220 9% 55%)">C</tspan>{" "}
              <tspan fill={hoverCandle.close >= hoverCandle.open ? "#26a69a" : "#ef5350"}>
                {formatPrice(hoverCandle.close)}
              </tspan>{"   "}
              <tspan fill="hsl(220 9% 55%)">V</tspan>{" "}
              <tspan fill="hsl(220 9% 80%)">{formatVolume(hoverCandle.volume)}</tspan>
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / exp
  let nice: number
  if (f < 1.5) nice = 1
  else if (f < 3) nice = 2
  else if (f < 7) nice = 5
  else nice = 10
  return nice * exp
}
