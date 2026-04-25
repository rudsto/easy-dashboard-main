// V2 components: live tool stream, annotated interactive chart, explain popover, undo toast

const { useState: useStateV2, useEffect: useEffectV2, useRef: useRefV2 } = React;

/* ───────────────────── Live tool stream ───────────────────── */

function LiveToolStream({ steps, onComplete, onAnnotate }) {
  const [now, setNow] = useStateV2(0);
  const startRef = useRefV2(performance.now());

  useEffectV2(() => {
    let raf;
    const tick = () => {
      const t = performance.now() - startRef.current;
      setNow(t);
      const totalEnd = Math.max(...steps.map(s => s.startAt + s.runFor));
      if (t < totalEnd + 400) {
        raf = requestAnimationFrame(tick);
      } else {
        onComplete && onComplete();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="livestream">
      <div className="livestream-head">
        <span className="ls-spark"><Icon name="spark" size={11}/></span>
        <span>Claude is working</span>
        <span className="ls-elapsed">{(now/1000).toFixed(1)}s</span>
      </div>
      <div className="livestream-rail">
        <div className="ls-rail-fill" style={{
          width: Math.min(100, (now / Math.max(...steps.map(s=>s.startAt+s.runFor))) * 100) + "%"
        }}/>
      </div>
      <div className="livestream-list">
        {steps.map((s, i) => {
          const started = now >= s.startAt;
          const done = now >= s.startAt + s.runFor;
          const status = done ? "done" : started ? "running" : "queued";
          const progress = started && !done ? ((now - s.startAt) / s.runFor) * 100 : done ? 100 : 0;
          return (
            <div key={i} className={`ls-step ls-${status}`}>
              <span className={`ls-icon ls-${status}`}>
                <Icon name={status==="done" ? "check" : status==="running" ? "loader" : "chevron"} size={10}/>
              </span>
              <span className="ls-name">{s.name}</span>
              <span className="ls-args">{s.args}</span>
              {done ? (
                <span className="ls-result">{s.result}</span>
              ) : started ? (
                <span className="ls-progress"><span style={{width: progress+"%"}}/></span>
              ) : (
                <span className="ls-queued">queued</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────── Annotated, hoverable chart ───────────────────── */

function AnnotatedChart({ candles, annotations, positions, onExplain }) {
  const width = 760, height = 280;
  const padL = 8, padR = 64, padT = 16, padB = 24;
  const w = width - padL - padR;
  const h = height - padT - padB;
  const min = Math.min(...candles.map(c => c.l), ...annotations.map(a=>a.price));
  const max = Math.max(...candles.map(c => c.h), ...annotations.map(a=>a.price));
  const range = (max - min) * 1.05 || 1;
  const baseMin = min - (max-min)*0.025;
  const cw = w / candles.length;
  const bw = Math.max(2, cw * 0.62);
  const y = (v) => padT + h - ((v - baseMin) / range) * h;

  const [hover, setHover] = useStateV2(null);
  const svgRef = useRefV2(null);

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.max(0, Math.min(candles.length-1, Math.floor((x - padL) / cw)));
    setHover({ idx, x: padL + idx * cw + cw/2 });
  };

  const colorFor = (k) => ({
    accent: "var(--accent)", up: "var(--up)", down: "var(--down)", muted: "var(--muted)"
  })[k] || "var(--muted)";

  const last = candles[candles.length-1].c;
  const hovered = hover ? candles[hover.idx] : null;

  return (
    <div className="achart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="achart-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* horizontal grid */}
        {Array.from({length: 5}, (_, i) => {
          const v = baseMin + (range * i) / 4;
          return (
            <g key={i}>
              <line x1={padL} x2={width-padR} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" strokeDasharray={i===0||i===4?"":"2 4"} opacity="0.4"/>
              <text x={width-padR+6} y={y(v)+3} fontSize="10" fontFamily="var(--mono)" fill="var(--muted)">{v.toFixed(2)}</text>
            </g>
          );
        })}

        {/* candles */}
        {candles.map((c, i) => {
          const cx = padL + i * cw + cw/2;
          const isUp = c.c >= c.o;
          const color = isUp ? "var(--up)" : "var(--down)";
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1"/>
              <rect
                x={cx - bw/2}
                y={Math.min(y(c.o), y(c.c))}
                width={bw}
                height={Math.max(1, Math.abs(y(c.o) - y(c.c)))}
                fill={color}
                opacity={isUp ? 0.85 : 0.95}
              />
            </g>
          );
        })}

        {/* annotations */}
        {annotations.map((a, i) => (
          <g key={i} className="annotation" style={{cursor:"pointer"}} onClick={() => onExplain && onExplain(a.explainKey)}>
            <line x1={padL} x2={width-padR} y1={y(a.price)} y2={y(a.price)}
              stroke={colorFor(a.color)} strokeWidth="1" strokeDasharray="3 3" opacity="0.85"/>
            <rect x={padL+4} y={y(a.price)-9} width={a.label.length*5.6+30} height="16" rx="3"
              fill={colorFor(a.color)} fillOpacity="0.16" stroke={colorFor(a.color)} strokeOpacity="0.5"/>
            <circle cx={padL+12} cy={y(a.price)} r="2.5" fill={colorFor(a.color)}/>
            <text x={padL+20} y={y(a.price)+3} fontSize="10" fontFamily="var(--mono)" fill={colorFor(a.color)}>{a.label}</text>
            <text x={padL + a.label.length*5.6 + 26} y={y(a.price)+3} fontSize="9" fontFamily="var(--mono)" fill={colorFor(a.color)} opacity="0.7">ⓘ</text>
          </g>
        ))}

        {/* positions overlay */}
        {positions.filter(p => p.symbol === "SOL/USDT").map((p, i) => (
          <g key={"p"+i}>
            <line x1={padL} x2={width-padR} y1={y(p.entry)} y2={y(p.entry)} stroke="var(--fg)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>
            <text x={padL+4} y={y(p.entry)-3} fontSize="9" fontFamily="var(--mono)" fill="var(--fg)" opacity="0.7">your entry {p.entry}</text>
          </g>
        ))}

        {/* hover crosshair */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padT} y2={padT+h} stroke="var(--muted)" strokeWidth="0.6" strokeDasharray="2 3"/>
          </g>
        )}

        {/* current price tag */}
        <rect x={width-padR+1} y={y(last)-9} width="58" height="18" rx="3" fill="var(--up)"/>
        <text x={width-padR+30} y={y(last)+4} fontSize="11" fontFamily="var(--mono)" fontWeight="600" fill="#fff" textAnchor="middle">{last.toFixed(2)}</text>
      </svg>

      {hovered && (
        <div className="achart-tooltip">
          <span><b>O</b> {hovered.o.toFixed(2)}</span>
          <span><b>H</b> {hovered.h.toFixed(2)}</span>
          <span><b>L</b> {hovered.l.toFixed(2)}</span>
          <span><b>C</b> {hovered.c.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Explainability popover ───────────────────── */

function ExplainPopover({ explainKey, onClose }) {
  if (!explainKey) return null;
  const data = EXPLAIN[explainKey];
  if (!data) return null;
  return (
    <div className="explain-overlay" onClick={onClose}>
      <div className="explain-pop" onClick={(e) => e.stopPropagation()}>
        <div className="explain-head">
          <div className="explain-title">
            <span className="explain-spark"><Icon name="spark" size={12}/></span>
            <span>{data.title}</span>
          </div>
          <button className="ghost-btn icon-only" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <ul className="explain-bullets">
          {data.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <div className="explain-inputs">
          <span className="explain-label">Inputs</span>
          {data.inputs.map((s) => <code key={s} className="explain-input">{s}</code>)}
        </div>
        <div className="explain-foot">
          <button className="secondary-btn">Open full reasoning trace</button>
          <button className="ghost-btn">Disagree</button>
        </div>
      </div>
    </div>
  );
}

function ExplainTrigger({ children, explainKey, onExplain }) {
  return (
    <span className="explain-trigger" onClick={() => onExplain(explainKey)}>
      {children}
      <span className="explain-mark">ⓘ</span>
    </span>
  );
}

/* ───────────────────── Reversible action toast ───────────────────── */

function UndoToast({ open, onUndo, onComplete, label = "Order sent to broker" }) {
  const [remaining, setRemaining] = useStateV2(5);
  useEffectV2(() => {
    if (!open) return;
    setRemaining(5);
    const start = performance.now();
    let raf;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const left = Math.max(0, 5 - t);
      setRemaining(left);
      if (left <= 0) {
        onComplete && onComplete();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;
  const pct = (remaining / 5) * 100;
  return (
    <div className="undo-toast">
      <div className="undo-rail"><div className="undo-fill" style={{width: pct + "%"}}/></div>
      <div className="undo-body">
        <div className="undo-icon"><Icon name="check" size={14}/></div>
        <div className="undo-text">
          <div className="undo-title">{label}</div>
          <div className="undo-sub">Sending in <b>{remaining.toFixed(1)}s</b> · click undo to cancel</div>
        </div>
        <button className="undo-btn" onClick={onUndo}>Undo</button>
      </div>
    </div>
  );
}

Object.assign(window, { LiveToolStream, AnnotatedChart, ExplainPopover, ExplainTrigger, UndoToast });
