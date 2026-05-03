// Sidebar (workspaces), Top header, Watchlist + Positions rail, Composer

const { useState: useStateA } = React;

function Sidebar() {
  const items = [
    { icon: "spark",   label: "Today",       active: true, badge: 3 },
    { icon: "history", label: "History" },
    { icon: "chart",   label: "Markets" },
    { icon: "wallet",  label: "Positions",   badge: 3 },
    { icon: "bell",    label: "Alerts" },
    { icon: "shield",  label: "Risk rules" },
  ];
  const projects = [
    { name: "Morning routine", color: "var(--accent)" },
    { name: "Crypto majors",   color: "oklch(0.72 0.12 175)" },
    { name: "AI semis basket", color: "oklch(0.72 0.12 280)" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="spark" size={16} /></div>
        <div className="brand-text">
          <div className="brand-name">Lumen</div>
          <div className="brand-sub">agentic trading</div>
        </div>
      </div>

      <button className="new-thread">
        <Icon name="plus" size={14} /> New session
        <span className="kbd">⌘N</span>
      </button>

      <nav className="nav">
        {items.map((it) => (
          <a key={it.label} className={`nav-item ${it.active ? "active" : ""}`}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
            {it.badge && <span className="nav-badge">{it.badge}</span>}
          </a>
        ))}
      </nav>

      <div className="nav-section">
        <div className="nav-section-head">
          <span>Workspaces</span>
          <button className="ghost-btn icon-only" aria-label="add"><Icon name="plus" size={12} /></button>
        </div>
        {projects.map((p) => (
          <a key={p.name} className="project-item">
            <span className="project-dot" style={{ background: p.color }} />
            <span>{p.name}</span>
          </a>
        ))}
      </div>

      <div className="account">
        <div className="account-row">
          <div className="avatar">R</div>
          <div className="account-meta">
            <div className="account-name">rudsto</div>
            <div className="account-bal">$12,480.50 · paper</div>
          </div>
          <button className="ghost-btn icon-only" aria-label="settings"><Icon name="settings" size={14} /></button>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="thread-title">Morning scan · Apr 25</h1>
        <span className="thread-meta"><Dot color="var(--up)" pulse /> Claude Sonnet 4.6 · live</span>
      </div>
      <div className="header-search">
        <Icon name="search" size={14} />
        <input placeholder="Ask Claude or jump to a symbol…" />
        <span className="kbd">⌘K</span>
      </div>
      <div className="header-right">
        <button className="ghost-btn icon-only" aria-label="alerts"><Icon name="bell" size={16} /></button>
        <button className="ghost-btn">
          <Dot color="var(--up)" /> Markets open
        </button>
      </div>
    </header>
  );
}

function RightRail() {
  const totalPnl = POSITIONS.reduce((a, p) => a + p.pnl, 0);
  return (
    <aside className="rightrail">
      <section className="rail-section">
        <div className="rail-head">
          <span>Watchlist</span>
          <button className="ghost-btn icon-only"><Icon name="plus" size={12} /></button>
        </div>
        <div className="watch-list">
          {SYMBOLS.map((s) => {
            const up = s.change >= 0;
            return (
              <div key={s.ticker} className={`watch-row ${s.ticker === "SOL/USDT" ? "focused" : ""}`}>
                <div className="watch-id">
                  <div className="watch-ticker">{s.ticker}</div>
                  <div className="watch-name">{s.name}</div>
                </div>
                <Sparkline data={s.spark} up={up} w={56} h={20} />
                <div className="watch-num">
                  <div className="watch-price">{s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={`watch-chg ${up ? "up" : "down"}`}>{up ? "+" : ""}{s.changePct.toFixed(2)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rail-section">
        <div className="rail-head">
          <span>Open positions</span>
          <span className={`rail-pnl ${totalPnl >= 0 ? "up" : "down"}`}>
            {totalPnl >= 0 ? "+" : "-"}${Math.abs(totalPnl).toFixed(2)}
          </span>
        </div>
        <div className="pos-list">
          {POSITIONS.map((p) => (
            <div key={p.symbol} className="pos-row">
              <div className="pos-id">
                <div className="pos-sym">{p.symbol}</div>
                <span className={`side-pill ${p.side}`}>{p.side === "long" ? "L" : "S"}</span>
              </div>
              <div className="pos-num">
                <div className={`pos-pnl ${p.pnl >= 0 ? "up" : "down"}`}>
                  {p.pnl >= 0 ? "+" : "-"}${Math.abs(p.pnl).toFixed(2)}
                </div>
                <div className="pos-meta">{p.size} @ {p.entry.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rail-section guardrails">
        <div className="rail-head"><span>Guardrails</span><Icon name="shield" size={12} /></div>
        <ul className="guardrail-list">
          <li><Dot color="var(--up)" size={5} /> Max 1% risk per trade</li>
          <li><Dot color="var(--up)" size={5} /> No trades w/o confirmation</li>
          <li><Dot color="var(--up)" size={5} /> Stop required on every order</li>
          <li><Dot color="var(--muted)" size={5} /> Daily loss cap: $300</li>
        </ul>
      </section>
    </aside>
  );
}

function Composer() {
  const [v, setV] = useStateA("");
  const slash = ["/scan", "/analyze", "/draft", "/alert", "/levels"];
  return (
    <div className="composer-wrap">
      <div className="suggested">
        {SUGGESTED_ACTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => setV(s)}>{s}</button>
        ))}
      </div>
      <div className={`composer ${v ? "filled" : ""}`}>
        <div className="composer-context">
          <span className="ctx-pill"><Icon name="chart" size={11} /> SOL/USDT</span>
          <span className="ctx-pill"><Icon name="book" size={11} /> order book</span>
          <span className="ctx-pill"><Icon name="list" size={11} /> watchlist</span>
          <button className="ctx-add"><Icon name="plus" size={11} /> add context</button>
        </div>
        <textarea
          rows={2}
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Ask Claude to analyze, draft, or watch something. Try /scan or /draft."
        />
        <div className="composer-foot">
          <div className="slash">
            {slash.map((s) => <button key={s} onClick={() => setV(s + " ")} className="slash-btn">{s}</button>)}
          </div>
          <div className="composer-actions">
            <span className="hint"><Icon name="command" size={11} /> ⏎ to send</span>
            <button className={`primary-btn send ${v.trim() ? "" : "disabled"}`}>
              <Icon name="send" size={13} /> Run
            </button>
          </div>
        </div>
      </div>
      <div className="trust-bar">
        <Icon name="shield" size={11} />
        <span>Claude reads market data and drafts orders. Trades require your explicit confirmation.</span>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Header, RightRail, Composer });
