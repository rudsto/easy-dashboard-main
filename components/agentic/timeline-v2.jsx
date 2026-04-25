// V2 Timeline + pinned cards that use the new annotated chart & explain triggers

const { useState: useStateT2 } = React;

function TimelineV2({ onExplain, onConfirm, liveActive, onLiveDone }) {
  return (
    <div className="timeline">
      <div className="timeline-day">
        <span className="day-line"/><span className="day-label">Today · April 25</span><span className="day-line"/>
      </div>

      {AGENT_TIMELINE.map((b) => {
        if (b.role === "user") return <UserBubble key={b.id} block={b}/>;
        return (
          <div key={b.id}>
            <AgentBubbleV2 block={b} onExplain={onExplain}/>
            {b.id === "a1" && (
              <div className="pinned-stack">
                <PinnedAnnotatedChart onExplain={onExplain}/>
              </div>
            )}
            {b.id === "a2" && (
              <div className="pinned-stack two-up">
                <PinnedOrderBook/>
                <DraftOrderCardV2 draft={b.draft} onExplain={onExplain} onConfirm={onConfirm}/>
              </div>
            )}
          </div>
        );
      })}

      {liveActive && (
        <div className="msg agent">
          <div className="agent-rail">
            <div className="agent-avatar"><Icon name="spark" size={14}/></div>
            <div className="agent-line"/>
          </div>
          <div className="agent-content">
            <div className="msg-meta"><span>Claude</span><span className="time">now</span></div>
            <LiveToolStream steps={LIVE_STREAM} onComplete={onLiveDone}/>
          </div>
        </div>
      )}

      <div className="cursor-line">
        <span className="cursor-dot"/>
        <span>Claude is ready</span>
      </div>
    </div>
  );
}

function AgentBubbleV2({ block, onExplain }) {
  // Surface inline-clickable explanations for keywords in the body text.
  const renderBody = (text) => {
    if (block.id === "a1") {
      // Highlight VWAP and bid wall mentions
      const parts = text.split(/(VWAP|bid wall at 161\.20)/g);
      return parts.map((p, i) => {
        if (p === "VWAP") return <ExplainTrigger key={i} explainKey="vwap-reclaim" onExplain={onExplain}>{p}</ExplainTrigger>;
        if (p === "bid wall at 161.20") return <ExplainTrigger key={i} explainKey="bid-wall" onExplain={onExplain}>{p}</ExplainTrigger>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      });
    }
    if (block.id === "a2") {
      const parts = text.split(/(R:R of 1 : 2\.34|161\.20 wall)/g);
      return parts.map((p, i) => {
        if (p === "R:R of 1 : 2.34") return <ExplainTrigger key={i} explainKey="rr" onExplain={onExplain}>{p}</ExplainTrigger>;
        if (p === "161.20 wall") return <ExplainTrigger key={i} explainKey="bid-wall" onExplain={onExplain}>{p}</ExplainTrigger>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      });
    }
    return text;
  };

  return (
    <div className="msg agent">
      <div className="agent-rail">
        <div className="agent-avatar"><Icon name="spark" size={14}/></div>
        <div className="agent-line"/>
      </div>
      <div className="agent-content">
        <div className="msg-meta"><span>Claude</span><span className="time">{block.time}</span></div>
        {block.tools && (
          <div className="tools">
            {block.tools.map((t, i) => <ToolRow key={i} tool={t}/>)}
          </div>
        )}
        <div className="msg-body">{renderBody(block.text)}</div>
      </div>
    </div>
  );
}

function PinnedAnnotatedChart({ onExplain }) {
  return (
    <div className="card pinned-card">
      <div className="pinned-head">
        <div className="pinned-meta">
          <span className="dot-accent"/>
          <span className="pinned-label">Claude pinned</span>
          <span className="pinned-sep">·</span>
          <span className="pinned-title">SOL/USDT</span>
          <span className="muted-mono">1h · 80 candles · 4 annotations</span>
        </div>
        <div className="pinned-actions">
          <button className="ghost-btn">Open full chart</button>
          <button className="ghost-btn icon-only"><Icon name="x" size={14}/></button>
        </div>
      </div>
      <div className="achart-container">
        <AnnotatedChart
          candles={CANDLES}
          annotations={ANNOTATIONS}
          positions={POSITIONS}
          onExplain={onExplain}
        />
      </div>
      <div className="chart-legend">
        <span><span className="legend-swatch accent"/> agent levels (click ⓘ to see why)</span>
        <span><span className="legend-swatch up"/> your entry / target</span>
        <span><span className="legend-swatch down"/> stop</span>
      </div>
    </div>
  );
}

function DraftOrderCardV2({ draft, onExplain, onConfirm }) {
  const isLong = draft.side === "long";
  return (
    <div className="card draft-card">
      <div className="draft-head">
        <div className="draft-title">
          <Icon name="target" size={14}/>
          <span>Draft order</span>
          <span className={`side-pill ${draft.side}`}>{isLong ? "LONG" : "SHORT"}</span>
          <span className="draft-sym">{draft.symbol}</span>
        </div>
        <span className="rr-badge" onClick={() => onExplain("rr")} style={{cursor:"pointer"}}>
          R:R 1 : {draft.rr.toFixed(2)} ⓘ
        </span>
      </div>
      <div className="draft-grid">
        <Field label="Size"        value={`${draft.size} SOL`}/>
        <Field label="Notional"    value={`$${draft.notional.toLocaleString()}`}/>
        <Field label="Entry"       value={draft.entry.toFixed(2)}/>
        <Field label="Take profit" value={draft.tp.toFixed(2)} tone="up"/>
        <Field label="Stop loss"   value={draft.sl.toFixed(2)} tone="down"/>
        <Field label="Risk"        value="1.0% acct"/>
      </div>
      <div className="risk-bar">
        <div className="rb-rail">
          <div className="rb-stop"/>
          <div className="rb-tp"/>
          <div className="rb-marker" style={{left:"30%"}}/>
        </div>
        <div className="rb-labels">
          <span className="down">{draft.sl}</span>
          <span className="muted">{draft.entry}</span>
          <span className="up">{draft.tp}</span>
        </div>
      </div>
      <div className="draft-actions">
        <button className="primary-btn" onClick={onConfirm}>
          <Icon name="check" size={14}/> Confirm &amp; send
        </button>
        <button className="secondary-btn">Edit</button>
        <button className="ghost-btn">Discard</button>
        <span className="dry-run"><Icon name="shield" size={12}/> 5s undo · dry-run available</span>
      </div>
    </div>
  );
}

Object.assign(window, { TimelineV2, AgentBubbleV2, PinnedAnnotatedChart, DraftOrderCardV2 });
