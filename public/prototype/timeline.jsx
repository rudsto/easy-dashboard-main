// Timeline: agent + user message rendering

function Timeline() {
  return (
    <div className="timeline">
      <div className="timeline-day">
        <span className="day-line" />
        <span className="day-label">Today · April 25</span>
        <span className="day-line" />
      </div>

      {AGENT_TIMELINE.map((b, i) => {
        if (b.role === "user") return <UserBubble key={b.id} block={b} />;
        return (
          <div key={b.id}>
            <AgentBubble block={b} />
            {b.id === "a1" && (
              <div className="pinned-stack">
                <PinnedChartCard symbol="SOL/USDT" />
              </div>
            )}
            {b.id === "a2" && (
              <div className="pinned-stack two-up">
                <PinnedOrderBook />
                <DraftOrderCard draft={b.draft} />
              </div>
            )}
          </div>
        );
      })}

      <div className="cursor-line">
        <span className="cursor-dot" />
        <span>Claude is ready</span>
      </div>
    </div>
  );
}

function UserBubble({ block }) {
  return (
    <div className="msg user">
      <div className="msg-meta"><span>You</span><span className="time">{block.time}</span></div>
      <div className="msg-body">{block.text}</div>
    </div>
  );
}

function AgentBubble({ block }) {
  return (
    <div className="msg agent">
      <div className="agent-rail">
        <div className="agent-avatar"><Icon name="spark" size={14} /></div>
        <div className="agent-line" />
      </div>
      <div className="agent-content">
        <div className="msg-meta">
          <span>Claude</span>
          <span className="time">{block.time}</span>
        </div>

        {block.tools && (
          <div className="tools">
            {block.tools.map((t, i) => <ToolRow key={i} tool={t} />)}
          </div>
        )}

        <div className="msg-body">{block.text}</div>
      </div>
    </div>
  );
}

function ToolRow({ tool }) {
  const tone = tool.status === "done" ? "up" : tool.status === "ready" ? "accent" : "neutral";
  const iconName = tool.status === "done" ? "check" : tool.status === "ready" ? "target" : "loader";
  return (
    <div className={`tool tool-${tool.status}`}>
      <span className={`tool-icon tool-${tool.status}`}>
        <Icon name={iconName} size={11} />
      </span>
      <span className="tool-name">{tool.name}</span>
      <span className="tool-args">{tool.args}</span>
      <span className="tool-result">{tool.result}</span>
      <span className="tool-dur">{tool.duration}</span>
    </div>
  );
}

Object.assign(window, { Timeline, UserBubble, AgentBubble, ToolRow });
