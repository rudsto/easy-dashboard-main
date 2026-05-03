// Visual primitives: sparkline, candlestick, depth bar, pill, etc.

const { useMemo } = React;

function Sparkline({ data, up, w = 64, h = 20 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(2)},${(h - ((v - min) / range) * h).toFixed(2)}`).join(" ");
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CandleChart({ candles, width = 720, height = 260, accent = "var(--up)", down = "var(--down)" }) {
  const padL = 8, padR = 56, padT = 12, padB = 22;
  const w = width - padL - padR;
  const h = height - padT - padB;
  const min = Math.min(...candles.map(c => c.l));
  const max = Math.max(...candles.map(c => c.h));
  const range = max - min || 1;
  const cw = w / candles.length;
  const bw = Math.max(2, cw * 0.6);
  const y = (v) => padT + h - ((v - min) / range) * h;

  // Annotations: bid wall + agent target
  const wall = 161.20;
  const tp = 167.40;
  const sl = 160.95;
  const entry = candles[candles.length - 1].c;

  // Y axis ticks
  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => min + (range * i) / (ticks - 1));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* grid */}
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={width - padR} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 0 || i === ticks - 1 ? "" : "2 4"} opacity="0.5" />
          <text x={width - padR + 6} y={y(v) + 3} fontSize="10" fontFamily="var(--mono)" fill="var(--muted)">{v.toFixed(2)}</text>
        </g>
      ))}

      {/* agent zones */}
      <rect x={padL} y={y(tp)} width={w} height={Math.max(2, y(entry) - y(tp))} fill="var(--up)" opacity="0.05" />
      <rect x={padL} y={y(entry)} width={w} height={Math.max(2, y(sl) - y(entry))} fill="var(--down)" opacity="0.05" />

      {/* bid wall */}
      <line x1={padL} x2={width - padR} y1={y(wall)} y2={y(wall)} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <rect x={width - padR - 60} y={y(wall) - 8} width="56" height="14" rx="3" fill="var(--accent)" opacity="0.15" />
      <text x={width - padR - 32} y={y(wall) + 2} fontSize="9" fontFamily="var(--mono)" fill="var(--accent)" textAnchor="middle">bid wall</text>

      {/* candles */}
      {candles.map((c, i) => {
        const cx = padL + i * cw + cw / 2;
        const isUp = c.c >= c.o;
        const color = isUp ? accent : down;
        const yo = y(c.o), yc = y(c.c), yh = y(c.h), yl = y(c.l);
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={color} strokeWidth="1" />
            <rect
              x={cx - bw / 2}
              y={Math.min(yo, yc)}
              width={bw}
              height={Math.max(1, Math.abs(yo - yc))}
              fill={color}
              opacity={isUp ? 0.9 : 1}
            />
          </g>
        );
      })}

      {/* current price marker */}
      <line x1={padL} x2={width - padR} y1={y(entry)} y2={y(entry)} stroke="var(--fg)" strokeWidth="0.6" opacity="0.4" />
      <rect x={width - padR + 1} y={y(entry) - 8} width="50" height="16" rx="3" fill="var(--up)" />
      <text x={width - padR + 26} y={y(entry) + 3} fontSize="10" fontFamily="var(--mono)" fill="#fff" fontWeight="600" textAnchor="middle">{entry.toFixed(2)}</text>
    </svg>
  );
}

function Pill({ tone = "neutral", children, style }) {
  const tones = {
    up:      { bg: "color-mix(in oklab, var(--up) 14%, transparent)",     fg: "var(--up)" },
    down:    { bg: "color-mix(in oklab, var(--down) 14%, transparent)",   fg: "var(--down)" },
    accent:  { bg: "color-mix(in oklab, var(--accent) 14%, transparent)", fg: "var(--accent)" },
    neutral: { bg: "var(--surface-2)", fg: "var(--muted)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.01em",
      background: t.bg, color: t.fg,
      ...style
    }}>{children}</span>
  );
}

function Dot({ color = "var(--accent)", pulse = false, size = 6 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: color, animation: pulse ? "pulse 1.6s ease-in-out infinite" : undefined
    }} />
  );
}

// Tiny inline icons (no library — keeps things light + on-brand)
function Icon({ name, size = 16, stroke = 1.5 }) {
  const s = size;
  const props = {
    width: s, height: s, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round"
  };
  switch (name) {
    case "spark": return (
      <svg {...props}><path d="M12 3l1.6 5.4 5.4 1.6-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z" /><path d="M19 17l.7 1.8L21 19.5l-1.3.7L19 22l-.7-1.8L17 19.5l1.3-.7z" /></svg>
    );
    case "send": return <svg {...props}><path d="M5 12l14-7-7 14-2-5z"/></svg>;
    case "plus": return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "chevron": return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case "chart": return <svg {...props}><path d="M4 19h16M7 16V9M12 16V5M17 16v-7"/></svg>;
    case "book": return <svg {...props}><path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
    case "list": return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "wallet": return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 13h2"/></svg>;
    case "bell": return <svg {...props}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.4 1.8l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.8-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.4l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.4-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1A1.7 1.7 0 003.6 9a1.7 1.7 0 00-.4-1.8l-.1-.1A2 2 0 116 3.3l.1.1a1.7 1.7 0 001.8.4H8a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.4l.1-.1A2 2 0 1120.7 6l-.1.1a1.7 1.7 0 00-.4 1.8V8a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case "target": return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>;
    case "command": return <svg {...props}><path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10-3 3"/></svg>;
    case "check": return <svg {...props}><path d="M20 6L9 17l-5-5"/></svg>;
    case "loader": return <svg {...props}><path d="M12 3a9 9 0 019 9"/></svg>;
    case "shield": return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>;
    case "history": return <svg {...props}><path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-7 3l-2 2"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/></svg>;
    case "agent": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 .8 2 1 3 1s2-.2 3-1"/></svg>;
    case "x": return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    default: return null;
  }
}

Object.assign(window, { Sparkline, CandleChart, Pill, Dot, Icon });
