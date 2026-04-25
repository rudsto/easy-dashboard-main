// Pinned market cards Claude opens in the timeline
const { useState: useStateP } = React;

function PinnedChartCard({ symbol = "SOL/USDT" }) {
  return (
    <div className="card pinned-card">
      <div className="pinned-head">
        <div className="pinned-meta">
          <span className="dot-accent" />
          <span className="pinned-label">Claude pinned</span>
          <span className="pinned-sep">·</span>
          <span className="pinned-title">{symbol}</span>
          <span className="muted-mono">1h · 80 candles</span>
        </div>
        <div className="pinned-actions">
          <button className="ghost-btn">Open full</button>
          <button className="ghost-btn icon-only" aria-label="dismiss"><Icon name="x" size={14} /></button>
        </div>
      </div>
      <div className="chart-wrap">
        <CandleChart candles={CANDLES} width={760} height={240} />
      </div>
      <div className="chart-legend">
        <span><span className="legend-swatch up" /> entry zone</span>
        <span><span className="legend-swatch down" /> stop zone</span>
        <span><span className="legend-swatch accent" /> bid wall · 161.20</span>
      </div>
    </div>
  );
}

function PinnedOrderBook() {
  const { bids, asks, mid, spread } = ORDER_BOOK;
  const max = Math.max(...bids.map(b => b.size), ...asks.map(a => a.size));
  return (
    <div className="card pinned-card book-card">
      <div className="pinned-head">
        <div className="pinned-meta">
          <span className="dot-accent" />
          <span className="pinned-label">Order book</span>
          <span className="pinned-sep">·</span>
          <span className="pinned-title">SOL/USDT</span>
        </div>
        <button className="ghost-btn icon-only" aria-label="dismiss"><Icon name="x" size={14} /></button>
      </div>
      <div className="book-grid">
        <div className="book-side">
          <div className="book-head"><span>Asks</span><span>Size</span></div>
          {[...asks].slice(0, 6).reverse().map((a) => (
            <div key={a.price} className="book-row">
              <div className="book-bar down" style={{ width: `${(a.size / max) * 100}%` }} />
              <span className="book-price down">{a.price.toFixed(2)}</span>
              <span className="book-size">{a.size.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div className="book-mid">
          <span className="mid-price">{mid.toFixed(2)}</span>
          <span className="mid-spread">spread {spread.toFixed(2)} · imbalance <b>+0.34</b></span>
        </div>
        <div className="book-side">
          <div className="book-head"><span>Bids</span><span>Size</span></div>
          {bids.slice(0, 6).map((b, i) => (
            <div key={b.price} className={`book-row ${b.price === 161.20 ? 'wall' : ''}`}>
              <div className="book-bar up" style={{ width: `${(b.size / max) * 100}%` }} />
              <span className="book-price up">{b.price.toFixed(2)}</span>
              <span className="book-size">{b.size.toFixed(1)}{b.price === 161.20 && <span className="wall-tag"> wall</span>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraftOrderCard({ draft }) {
  const isLong = draft.side === "long";
  return (
    <div className="card draft-card">
      <div className="draft-head">
        <div className="draft-title">
          <Icon name="target" size={14} />
          <span>Draft order</span>
          <span className={`side-pill ${draft.side}`}>{isLong ? "LONG" : "SHORT"}</span>
          <span className="draft-sym">{draft.symbol}</span>
        </div>
        <span className="rr-badge">R:R 1 : {draft.rr.toFixed(2)}</span>
      </div>
      <div className="draft-grid">
        <Field label="Size"        value={`${draft.size} SOL`} />
        <Field label="Notional"    value={`$${draft.notional.toLocaleString()}`} />
        <Field label="Entry"       value={draft.entry.toFixed(2)} />
        <Field label="Take profit" value={draft.tp.toFixed(2)} tone="up" />
        <Field label="Stop loss"   value={draft.sl.toFixed(2)} tone="down" />
        <Field label="Risk"        value="1.0% acct" />
      </div>
      <div className="risk-bar">
        <div className="rb-rail">
          <div className="rb-stop" />
          <div className="rb-entry" style={{ left: "30%" }} />
          <div className="rb-tp" />
          <div className="rb-marker" style={{ left: "30%" }} />
        </div>
        <div className="rb-labels">
          <span className="down">{draft.sl}</span>
          <span className="muted">{draft.entry}</span>
          <span className="up">{draft.tp}</span>
        </div>
      </div>
      <div className="draft-actions">
        <button className="primary-btn">
          <Icon name="check" size={14} /> Confirm &amp; send
        </button>
        <button className="secondary-btn">Edit</button>
        <button className="ghost-btn">Discard</button>
        <span className="dry-run"><Icon name="shield" size={12} /> dry-run available</span>
      </div>
    </div>
  );
}

function Field({ label, value, tone }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span className={`field-value ${tone || ""}`}>{value}</span>
    </div>
  );
}

Object.assign(window, { PinnedChartCard, PinnedOrderBook, DraftOrderCard, Field });
