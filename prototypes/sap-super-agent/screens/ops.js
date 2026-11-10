/* ============================================================
   Screens · Ops (queues / events / webhooks / external API)
              and Super Agent runs
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const QUEUES = [
    { id: "q-teams", name: "teams-notify", kind: "hook", depth: 2, rate: "12/min", workers: "2/2", oldest: "8s", status: "healthy", tone: "green", p95: "0.9s" },
    { id: "q-jira", name: "jira-sync", kind: "hook", depth: 0, rate: "4/min", workers: "1/2", oldest: "—", status: "healthy", tone: "green", p95: "1.2s" },
    { id: "q-charm", name: "charm-poll", kind: "api", depth: 6, rate: "10/min", workers: "1/1", oldest: "1m 12s", status: "busy", tone: "amber", p95: "3.1s" },
    { id: "q-crq", name: "crq-orchestrator", kind: "api", depth: 1, rate: "2/min", workers: "1/2", oldest: "14s", status: "busy", tone: "amber", p95: "7.4s" },
    { id: "q-ai", name: "ai-stage-runner", kind: "ai", depth: 3, rate: "6/min", workers: "3/4", oldest: "22s", status: "healthy", tone: "teal", p95: "58s" },
    { id: "q-dead", name: "dead-letter", kind: "dlq", depth: 2, rate: "—", workers: "0/0", oldest: "2h 06m", status: "attention", tone: "red", p95: "—" },
  ];

  const EVENTS = [
    { time: "10:42:18", type: "hook.delivered", subject: "teams-notify · R-2041", desc: "200 · 0.9s · externalId=ts_8842", tone: "green", icon: "check-circle" },
    { time: "10:42:12", type: "stage.ai_job.completed", subject: "R-2041 · 需求分析", desc: "artifact v3 · 18.4k tokens · 48s", tone: "teal", icon: "sparkles" },
    { time: "10:42:05", type: "approval.requested", subject: "R-2041 · G1", desc: "派发至 林桦 · 需求顾问", tone: "amber", icon: "git-commit" },
    { time: "10:41:58", type: "hook.attempted", subject: "charm-poll · CR-44103", desc: "503 retryable · 尝试 2/5 · 退避 4s", tone: "amber", icon: "refresh" },
    { time: "10:41:44", type: "task.claimed", subject: "T-8841 · 周予", desc: "工作区 z-sales · 租约 60s", tone: "blue", icon: "monitor" },
    { time: "10:41:33", type: "artifact.stale", subject: "R-2042 · dev_spec", desc: "上游 requirement_analysis v4 更新", tone: "red", icon: "alert-triangle" },
    { time: "10:41:20", type: "demand.updated", subject: "R-2044 · 需求澄清", desc: "AI 提出 4 个问题 · 等待业务回答", tone: "teal", icon: "sparkles" },
  ];

  const HOOKS = [
    { id: "hk-8842", target: "teams-notify", event: "approval.requested", demand: "R-2041", code: "200", ok: true, attempt: "1/5", latency: "0.9s", time: "10:42:18", key: "R-2041:teams:9f2c" },
    { id: "hk-8841", target: "jira-sync", event: "demand.updated", demand: "R-2042", code: "201", ok: true, attempt: "1/5", latency: "1.2s", time: "10:42:10", key: "R-2042:jira:a18e" },
    { id: "hk-8838", target: "charm-poll", event: "charm.status", demand: "R-2045", code: "503", ok: false, attempt: "2/5", latency: "3.1s", time: "10:41:58", key: "R-2045:charm:77b1", retry: "4s 后重试" },
    { id: "hk-8834", target: "teams-notify", event: "stage.waiting_human", demand: "R-2043", code: "429", ok: false, attempt: "1/5", latency: "0.4s", time: "10:41:22", key: "R-2043:teams:1c9d", retry: "按 Retry-After 等待 2s" },
    { id: "hk-8829", target: "confluence", event: "stage.done", demand: "R-2038", code: "—", ok: false, attempt: "5/5", latency: "30s", time: "10:38:02", key: "R-2038:conf:09af", dead: "已进入死信" },
  ];

  const APIS = [
    { method: "POST", path: "/solman/request-number", system: "SolMan", code: "200", latency: "0.8s", retries: "0", time: "10:42:01", trace: "tr_9f2c" },
    { method: "POST", path: "/solman/crq", system: "SolMan", code: "201", latency: "2.1s", retries: "0", time: "10:42:02", trace: "tr_9f2c" },
    { method: "GET", path: "/charm/change-requests/CR-44103", system: "ChaRM", code: "200", latency: "1.1s", retries: "0", time: "10:42:10", trace: "tr_a81c" },
    { method: "GET", path: "/charm/change-requests/CR-44103", system: "ChaRM", code: "503", latency: "3.1s", retries: "2", time: "10:41:58", trace: "tr_a81b" },
    { method: "POST", path: "/bw/budget/read", system: "BW", code: "200", latency: "0.6s", retries: "0", time: "10:41:40", trace: "tr_77b1" },
    { method: "POST", path: "/ai/gateway/completions", system: "AI Gateway", code: "200", latency: "18.4s", retries: "0", time: "10:41:12", trace: "tr_5510" },
  ];

  function kindBadge(kind) {
    const map = { hook: ["send", "WEBHOOK"], api: ["tool", "API"], ai: ["sparkles", "AI"], dlq: ["alert-triangle", "DLQ"] };
    const [icon, label] = map[kind] || map.api;
    return `<span class="kind-badge kind-badge--${kind}">${ic(icon)}${label}</span>`;
  }

  SA.register("queue", {
    title: "队列与事件",
    render() {
      return `
      <div class="page page-ops">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">AUTOMATION · 实时可观测</div>
            <div class="page-head__title">
              <h1>队列与事件</h1>
              <span class="pill pill--green pill--live"><span class="dot"></span>实时</span>
            </div>
            <p class="page-head__desc">外部接口调用、Webhook 投递、Super Agent 任务与事件流。每条消息都能看到 payload、重试与死信。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn" data-action="pause-queue">${ic("pause")} 暂停队列</button>
            <button class="btn">${ic("download")} 导出日志</button>
          </div>
        </div>

        <section class="metric-strip metric-strip--5">
          <div class="metric"><span>队列深度</span><b data-live-depth>14</b><em>6 个队列</em></div>
          <div class="metric"><span>运行中</span><b>3</b><em class="teal">AI worker 3/4</em></div>
          <div class="metric"><span>成功率 · 24h</span><b>99.2<span class="metric__unit">%</span></b><em>1,284 / 1,294</em></div>
          <div class="metric"><span>p95 延迟</span><b>1.8<span class="metric__unit">s</span></b><em>外部 API 2.3s</em></div>
          <div class="metric"><span>死信</span><b class="metric__danger">2</b><em class="red">需要人工处理</em></div>
        </section>

        <div class="tabs ops-tabs">
          <button class="tab is-active" data-ops-tab="queues">队列 <span class="count">6</span></button>
          <button class="tab" data-ops-tab="events">事件流 <span class="count">live</span></button>
          <button class="tab" data-ops-tab="webhooks">Webhook 投递 <span class="count">5</span></button>
          <button class="tab" data-ops-tab="apis">外部 API <span class="count">6</span></button>
          <span class="grow"></span>
          <span class="ops-tabs__hint">${ic("info")} 刷新频率 2s</span>
        </div>

        <div class="ops-panel" data-ops-panel="queues">
          <div class="card">
            <div class="table-wrap">
              <table class="table ops-table">
                <thead><tr><th>队列</th><th>类型</th><th>深度</th><th>速率</th><th>Workers</th><th>最老消息</th><th>p95</th><th>状态</th><th></th></tr></thead>
                <tbody>
                  ${QUEUES.map(
                    (q) => `
                    <tr data-queue="${q.id}">
                      <td><span class="queue-name"><span class="queue-name__icon">${ic(q.kind === "ai" ? "bot" : q.kind === "dlq" ? "alert-triangle" : q.kind === "hook" ? "send" : "plug")}</span>${q.name}</span></td>
                      <td>${kindBadge(q.kind)}</td>
                      <td><span class="queue-depth ${q.depth > 3 ? "is-high" : ""}">${q.depth}</span></td>
                      <td><span class="mono sm">${q.rate}</span></td>
                      <td><span class="mono sm">${q.workers}</span></td>
                      <td><span class="sm ${q.oldest.includes("h") || q.oldest.includes("m") ? "" : "muted"}">${q.oldest}</span></td>
                      <td><span class="mono sm">${q.p95}</span></td>
                      <td><span class="pill pill--${q.tone}"><span class="dot"></span>${{ healthy: "正常", busy: "繁忙", attention: "需处理" }[q.status]}</span></td>
                      <td><button class="icon-btn icon-btn--sm" data-action="queue-detail">${ic("chevron-right")}</button></td>
                    </tr>`
                  ).join("")}
                </tbody>
              </table>
            </div>
            <div class="table-foot">
              <span class="sm">死信队列中的消息可重放；重放保持 idempotencyKey 不变。</span>
              <span class="grow"></span>
              <a class="link sm" href="#/ops/agents">查看 Agent 运行 ${ic("arrow-right")}</a>
            </div>
          </div>
          <div class="ops-insight">
            <span>${ic("alert-triangle")} charm-poll 出现重试：SolMan 返回 503，按指数退避重试中（第 2/5 次）。</span>
            <a class="link" href="#/ops/queue">查看投递详情 ${ic("arrow-right")}</a>
          </div>
        </div>

        <div class="ops-panel" data-ops-panel="events" hidden>
          <div class="card">
            <div class="card-head">
              <h3>事件流</h3>
              <div class="row gap-2"><span class="live-dot">tail</span><span class="sm mono">seq 12,043</span></div>
            </div>
            <div class="event-feed" id="event-feed">
              ${EVENTS.map(
                (e) => `
                <div class="event-row">
                  <span class="event-row__time mono">${e.time}</span>
                  <span class="event-row__icon event-row__icon--${e.tone}">${ic(e.icon)}</span>
                  <span class="event-row__main">
                    <span class="event-row__type mono">${e.type}</span>
                    <span class="event-row__subject">${e.subject}</span>
                  </span>
                  <span class="event-row__desc">${e.desc}</span>
                </div>`
              ).join("")}
            </div>
            <div class="table-foot"><span class="sm">事件只追加，不更新；最多保留 7 天。</span><span class="grow"></span><a class="link sm" href="#/ops/queue">事件文档 ${ic("arrow-right")}</a></div>
          </div>
        </div>

        <div class="ops-panel" data-ops-panel="webhooks" hidden>
          <div class="card">
            <div class="table-wrap">
              <table class="table ops-table">
                <thead><tr><th>投递</th><th>目标</th><th>事件</th><th>需求</th><th>状态码</th><th>尝试</th><th>延迟</th><th>时间</th><th></th></tr></thead>
                <tbody>
                  ${HOOKS.map(
                    (h) => `
                    <tr data-hook="${h.id}">
                      <td><span class="cell-mono">${h.id}</span></td>
                      <td><span class="hook-target">${h.target}</span></td>
                      <td><span class="mono sm">${h.event}</span></td>
                      <td><span class="cell-mono">${h.demand}</span></td>
                      <td><span class="code-badge ${h.ok ? "is-ok" : "is-err"}">${h.code}</span></td>
                      <td><span class="mono sm">${h.attempt}</span></td>
                      <td><span class="mono sm">${h.latency}</span></td>
                      <td><span class="mono sm muted">${h.time}</span></td>
                      <td><span class="pill pill--${h.dead ? "red" : h.ok ? "green" : "amber"}">${h.dead ? "死信" : h.ok ? "已送达" : "重试中"}</span></td>
                    </tr>`
                  ).join("")}
                </tbody>
              </table>
            </div>
            <div class="table-foot"><span class="sm">每次尝试都会写入 hook.attempted 事件；2xx 视为成功。</span></div>
          </div>
        </div>

        <div class="ops-panel" data-ops-panel="apis" hidden>
          <div class="card">
            <div class="table-wrap">
              <table class="table ops-table">
                <thead><tr><th>方法</th><th>接口</th><th>系统</th><th>状态码</th><th>延迟</th><th>重试</th><th>时间</th><th>Trace</th></tr></thead>
                <tbody>
                  ${APIS.map(
                    (a) => `
                    <tr data-api="${a.path}">
                      <td><span class="method method--${a.method.toLowerCase()}">${a.method}</span></td>
                      <td><span class="cell-mono">${a.path}</span></td>
                      <td><span class="hook-target">${a.system}</span></td>
                      <td><span class="code-badge ${a.code.startsWith("2") ? "is-ok" : "is-err"}">${a.code}</span></td>
                      <td><span class="mono sm ${parseFloat(a.latency) > 5 ? "latency-high" : ""}">${a.latency}</span></td>
                      <td><span class="mono sm">${a.retries}</span></td>
                      <td><span class="mono sm muted">${a.time}</span></td>
                      <td><span class="cell-mono muted">${a.trace}</span></td>
                    </tr>`
                  ).join("")}
                </tbody>
              </table>
            </div>
            <div class="table-foot"><span class="sm">外部调用统一走封装接口，记录 trace、重试与幂等键。</span></div>
          </div>
        </div>
      </div>`;
    },
    after(ctx, root) {
      function replay(el, cls) {
        if (!el || SA.isShot) return;
        el.classList.remove(cls);
        void el.offsetWidth;
        el.classList.add(cls);
      }
      root.querySelectorAll("[data-ops-tab]").forEach((b) => {
        b.addEventListener("click", () => {
          root.querySelectorAll("[data-ops-tab]").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          root.querySelectorAll("[data-ops-panel]").forEach((p) => (p.hidden = p.dataset.opsPanel !== b.dataset.opsTab));
          replay(root.querySelector('[data-ops-panel="' + b.dataset.opsTab + '"]'), "anim-fade");
        });
      });
      root.querySelectorAll("[data-queue]").forEach((tr) => {
        tr.addEventListener("click", () => openQueueDrawer(tr.dataset.queue));
      });
      root.querySelectorAll("[data-hook]").forEach((tr) => {
        tr.addEventListener("click", () => openHookDrawer(tr.dataset.hook));
      });
      root.querySelectorAll("[data-api]").forEach((tr) => {
        tr.addEventListener("click", () => openApiDrawer(tr.dataset.api));
      });
      root.querySelector("[data-action='pause-queue']").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const paused = btn.dataset.paused !== "1";
        btn.dataset.paused = paused ? "1" : "0";
        btn.innerHTML = paused ? ic("play") + " 恢复队列" : ic("pause") + " 暂停队列";
        if (paused) stopLive();
        else startLive();
        SA.toast(paused ? "队列已暂停，不再消费新消息" : "队列已恢复");
      });
      // live event tail / live depth：暂停队列时一并停表，恢复时重启
      const extra = [
        { time: "10:42:24", type: "hook.delivered", subject: "teams-notify · R-2043", desc: "200 · 0.7s · externalId=ts_8843", tone: "green", icon: "check-circle" },
        { time: "10:42:27", type: "task.updated", subject: "T-8841 · 进度 68%", desc: "Copilot 工具调用 · sap_report_progress", tone: "blue", icon: "monitor" },
        { time: "10:42:31", type: "hook.delivered", subject: "jira-sync · R-2041", desc: "200 · 1.1s · externalId=SAP-1187", tone: "green", icon: "check-circle" },
      ];
      let feedIdx = 0;
      let eventTimer = null;
      let depthTimer = null;
      function startEventTail() {
        if (eventTimer) return;
        eventTimer = SA.onTimer(() => {
          const feed = root.querySelector("#event-feed");
          if (!feed || feedIdx >= extra.length) return;
          const e = extra[feedIdx++];
          const div = document.createElement("div");
          div.className = "event-row anim-rise";
          div.innerHTML =
            '<span class="event-row__time mono">' + e.time + "</span>" +
            '<span class="event-row__icon event-row__icon--' + e.tone + '">' + ic(e.icon) + "</span>" +
            '<span class="event-row__main"><span class="event-row__type mono">' + e.type + '</span><span class="event-row__subject">' + e.subject + "</span></span>" +
            '<span class="event-row__desc">' + e.desc + "</span>";
          feed.insertBefore(div, feed.firstChild);
        }, 3600);
      }
      function startDepth() {
        if (depthTimer) return;
        depthTimer = SA.onTimer(() => {
          const el = root.querySelector("[data-live-depth]");
          if (el) el.textContent = String(12 + Math.floor(Math.random() * 5));
        }, 5000);
      }
      function startLive() {
        if (SA.isShot) return;
        startEventTail();
        startDepth();
      }
      function stopLive() {
        if (eventTimer) { SA.offTimer(eventTimer); eventTimer = null; }
        if (depthTimer) { SA.offTimer(depthTimer); depthTimer = null; }
      }
      startLive();
    },
  });

  function openQueueDrawer(id) {
    const q = QUEUES.find((x) => x.id === id) || QUEUES[0];
    SA.drawer({
      title: q.name,
      sub: q.kind.toUpperCase() + " 队列 · " + q.workers + " workers · p95 " + q.p95,
      body: `
        <div class="drawer-block">
          <div class="drawer-block__head">队列状态 <span class="pill pill--${q.tone}"><span class="dot"></span>${{ healthy: "正常", busy: "繁忙", attention: "需处理" }[q.status]}</span></div>
          <div class="queue-detail-grid">
            <div><span>深度</span><b>${q.depth}</b></div>
            <div><span>速率</span><b>${q.rate}</b></div>
            <div><span>最老消息</span><b>${q.oldest}</b></div>
            <div><span>死信</span><b>${q.kind === "dlq" ? 2 : 0}</b></div>
          </div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">待处理消息</div>
          <div class="queue-msgs">
            <div class="queue-msg"><span class="mono">msg_9f2c</span><span>R-2041 · approval.requested</span><span class="mono">8s</span><button class="icon-btn icon-btn--sm">${ic("chevron-right")}</button></div>
            <div class="queue-msg"><span class="mono">msg_9f2b</span><span>R-2045 · charm.status</span><span class="mono">1m</span><button class="icon-btn icon-btn--sm">${ic("chevron-right")}</button></div>
            <div class="queue-msg"><span class="mono">msg_9f29</span><span>R-2042 · jira.sync</span><span class="mono">2m</span><button class="icon-btn icon-btn--sm">${ic("chevron-right")}</button></div>
          </div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">消息 Envelope</div>
          <div class="code" style="font-size:9.5px">{
  <span class="json-key">"eventId"</span>: <span class="json-str">"01J8ZQ9W3K5M2V7X4C6B8N0P1Q"</span>,
  <span class="json-key">"eventType"</span>: <span class="json-str">"approval.requested"</span>,
  <span class="json-key">"subject"</span>: { <span class="json-key">"type"</span>: <span class="json-str">"demand"</span>, <span class="json-key">"id"</span>: <span class="json-str">"R-2041"</span> },
  <span class="json-key">"idempotencyKey"</span>: <span class="json-str">"R-2041:teams:9f2c..."</span>,
  <span class="json-key">"retry"</span>: { <span class="json-key">"maxAttempts"</span>: <span class="json-num">5</span>, <span class="json-key">"backoff"</span>: <span class="json-str">"exponential"</span> }
}</div>
        </div>`,
      actions: [
        { label: "清空队列", variant: "danger", onClick: () => SA.toast("演示：需要管理员确认") },
        { label: "重放选中", variant: "primary", onClick: () => SA.toast("已重放 1 条消息") },
      ],
    });
  }

  function openHookDrawer(id) {
    const h = HOOKS.find((x) => x.id === id) || HOOKS[0];
    SA.drawer({
      title: h.id,
      sub: h.target + " · " + h.event + " · " + h.demand,
      body: `
        <div class="drawer-block">
          <div class="drawer-block__head">投递结果 <span class="pill pill--${h.dead ? "red" : h.ok ? "green" : "amber"}">${h.dead ? "死信" : h.ok ? "已送达" : "重试中"}</span></div>
          <div class="kv">
            <div class="kv-row"><span class="kv-key">状态码</span><span class="kv-val mono">${h.code}</span></div>
            <div class="kv-row"><span class="kv-key">尝试</span><span class="kv-val mono">${h.attempt}</span></div>
            <div class="kv-row"><span class="kv-key">延迟</span><span class="kv-val mono">${h.latency}</span></div>
            <div class="kv-row"><span class="kv-key">幂等键</span><span class="kv-val mono">${h.key}</span></div>
            <div class="kv-row"><span class="kv-key">重试</span><span class="kv-val">${h.retry || h.dead || "—"}</span></div>
          </div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">Request</div>
          <div class="code" style="font-size:9px"><span class="k">POST</span> https://hooks.internal/${h.target}
<span class="k">X-SA-Signature:</span> sha256=6f2c…91d
<span class="k">X-SA-Delivery:</span> ${h.key}

{
  <span class="json-key">"eventType"</span>: <span class="json-str">"${h.event}"</span>,
  <span class="json-key">"subject"</span>: { <span class="json-key">"demandId"</span>: <span class="json-str">"${h.demand}"</span> },
  <span class="json-key">"payload"</span>: { <span class="json-key">"gateKey"</span>: <span class="json-str">"G1"</span>, <span class="json-key">"decidedBy"</span>: <span class="json-str">"LIN_HUA"</span> }
}</div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">Response</div>
          <div class="code" style="font-size:9px">HTTP/1.1 <span class="${h.ok ? "s" : "n"}">${h.code}</span>
{ <span class="json-key">"externalId"</span>: <span class="json-str">"ts_8842"</span>, <span class="json-key">"status"</span>: <span class="json-str">"delivered"</span> }</div>
        </div>`,
      actions: [
        { label: "重放", variant: "primary", onClick: () => SA.toast("已重放 " + h.id + "（幂等键不变）") },
      ],
    });
  }

  function openApiDrawer(path) {
    const a = APIS.find((x) => x.path === path) || APIS[0];
    SA.drawer({
      title: a.method + " " + a.path,
      sub: a.system + " · trace " + a.trace,
      body: `
        <div class="drawer-block">
          <div class="drawer-block__head">调用结果 <span class="code-badge ${a.code.startsWith("2") ? "is-ok" : "is-err"}">${a.code}</span></div>
          <div class="kv">
            <div class="kv-row"><span class="kv-key">延迟</span><span class="kv-val mono">${a.latency}</span></div>
            <div class="kv-row"><span class="kv-key">重试</span><span class="kv-val mono">${a.retries}</span></div>
            <div class="kv-row"><span class="kv-key">系统</span><span class="kv-val">${a.system}</span></div>
            <div class="kv-row"><span class="kv-key">时间</span><span class="kv-val mono">${a.time}</span></div>
          </div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">Request Body</div>
          <div class="code" style="font-size:9px">{
  <span class="json-key">"demandNo"</span>: <span class="json-str">"R-2045"</span>,
  <span class="json-key">"system"</span>: <span class="json-str">"FY2"</span>,
  <span class="json-key">"client"</span>: <span class="json-str">"200"</span>,
  <span class="json-key">"transports"</span>: [<span class="json-str">"FY2K900142"</span>, <span class="json-str">"FY2K900143"</span>]
}</div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">Response</div>
          <div class="code" style="font-size:9px">{ <span class="json-key">"id"</span>: <span class="json-str">"CRQ-2026-0842"</span>, <span class="json-key">"status"</span>: <span class="json-str">"pending_approval"</span> }</div>
        </div>`,
      actions: [{ label: "复制 trace", variant: "primary", onClick: () => SA.toast("已复制 trace " + a.trace) }],
    });
  }

  /* ------------------------------------------------------------
     agents
     ------------------------------------------------------------ */
  const RUNS = [
    { id: "RN-8821", demand: "R-2041", stage: "功能设计", status: "运行中", tone: "teal", progress: 64, model: "deepseek-v4", tokens: "18.4k", cost: "$0.08", duration: "48s", started: "09:42", selected: true },
    { id: "RN-8819", demand: "R-2044", stage: "需求澄清", status: "运行中", tone: "teal", progress: 34, model: "deepseek-v4", tokens: "9.2k", cost: "$0.04", duration: "22s", started: "09:41" },
    { id: "RN-8817", demand: "R-2043", stage: "测试文档", status: "待确认", tone: "amber", progress: 100, model: "deepseek-v4", tokens: "24.1k", cost: "$0.11", duration: "1m 42s", started: "09:36" },
    { id: "RN-8812", demand: "R-2045", stage: "上线文档", status: "已完成", tone: "green", progress: 100, model: "deepseek-v4", tokens: "31.8k", cost: "$0.14", duration: "2m 06s", started: "08:58" },
    { id: "RN-8809", demand: "R-2042", stage: "技术设计", status: "失败", tone: "red", progress: 82, model: "deepseek-v4", tokens: "14.6k", cost: "$0.06", duration: "1m 12s", started: "08:47", error: "输出 schema 校验失败：缺少 dataSources 字段" },
  ];

  SA.register("agents", {
    title: "Agent 运行",
    render() {
      return `
      <div class="page page-agents">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">AUTOMATION · SUPER AGENT</div>
            <div class="page-head__title">
              <h1>Agent 运行</h1>
              <span class="pill pill--teal pill--live"><span class="dot"></span>3 运行中</span>
            </div>
            <p class="page-head__desc">Super Agent 的每次运行、工具调用、输入输出与成本都可追溯。失败的运行可查看原因并重试。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn">${ic("pause")} 暂停调度</button>
            <button class="btn btn--primary" data-action="new-run">${ic("sparkles")} 手动触发</button>
          </div>
        </div>

        <section class="metric-strip metric-strip--4">
          <div class="metric"><span>运行中</span><b>3</b><em>队列 3 个 job</em></div>
          <div class="metric"><span>今日完成</span><b>27</b><em>成功 26 · 失败 1</em></div>
          <div class="metric"><span>平均耗时</span><b>58<span class="metric__unit">s</span></b><em>p95 2m 06s</em></div>
          <div class="metric"><span>本月成本</span><b>$12.40</b><em>deepseek-v4 · BYOK</em></div>
        </section>

        <div class="agents-layout">
          <section class="card agents-list">
            <div class="card-head"><h3>最近运行</h3><span class="sm">最近 24 小时</span></div>
            <div class="run-rows">
              ${RUNS.map(
                (r) => `
                <div class="run-row ${r.selected ? "is-active" : ""}" data-run="${r.id}">
                  <span class="run-status run-status--${r.tone}"><i></i></span>
                  <span class="run-row__main">
                    <span class="run-row__title"><b>${r.demand}</b> ${r.stage}<em class="mono">${r.id}</em></span>
                    <span class="run-row__meta">${r.model} · ${r.tokens} tokens · ${r.duration} · ${r.started}</span>
                    ${r.progress < 100 ? `<span class="progress progress--thin" style="margin-top:6px"><span class="progress__bar progress__bar--teal" data-bar="${r.progress}"></span></span>` : ""}
                  </span>
                  <span class="run-row__cost mono">${r.cost}</span>
                  <span class="pill pill--${r.tone}">${r.status}</span>
                </div>`
              ).join("")}
            </div>
            <div class="table-foot"><span class="sm">每次运行记录模型、prompt 版本、输入工件版本与成本。</span></div>
          </section>

          <aside class="card run-detail">
            <div class="run-detail__head">
              <div class="row gap-2">
                <span class="ai-avatar">${ic("sparkles")}</span>
                <div><h2>RN-8821 · R-2041</h2><span class="sm">功能设计 · 第 2 次尝试</span></div>
              </div>
              <span class="pill pill--teal pill--live"><span class="dot"></span>运行中</span>
            </div>
            <div class="run-detail__stats">
              <div><span>模型</span><b>deepseek-v4</b></div>
              <div><span>tokens</span><b>18,412</b></div>
              <div><span>成本</span><b>$0.08</b></div>
              <div><span>耗时</span><b>48s</b></div>
            </div>
            <div class="run-detail__block">
              <div class="run-detail__title">执行计划</div>
              <div class="run-steps">
                <div class="run-step is-done"><span>${ic("check")}</span><b>检索知识库</b><em>4 篇命中 · 1.2s</em></div>
                <div class="run-step is-done"><span>${ic("check")}</span><b>组装上下文</b><em>需求 + 3 个上游工件 · 0.3s</em></div>
                <div class="run-step is-active"><span><i class="spinner"></i></span><b>生成功能设计</b><em>输出 24 个章节 · 进行中</em></div>
                <div class="run-step"><span>4</span><b>schema 自检</b><em>等待生成完成</em></div>
                <div class="run-step"><span>5</span><b>提交门禁</b><em>G1 · 等待人工确认</em></div>
              </div>
            </div>
            <div class="run-detail__block">
              <div class="run-detail__title">工具调用</div>
              <div class="run-tools">
                <div class="run-tool"><span class="mono">knowledge.search</span><span>query="预算校验"</span><span class="pill pill--green">200</span></div>
                <div class="run-tool"><span class="mono">artifact.read</span><span>requirement_analysis v3</span><span class="pill pill--green">200</span></div>
                <div class="run-tool"><span class="mono">model.generate</span><span>deepseek-v4 · stream</span><span class="pill pill--teal pill--live">streaming</span></div>
              </div>
            </div>
            <div class="run-detail__block">
              <div class="run-detail__title">输出预览</div>
              <div class="run-output">
                <p>在采购申请保存时触发预算校验，按「申请部门 + 费用类科目」汇总预算占用，与 BW <code>ZBW_BUDGET</code> 视图比对。超预算申请允许提交但进入现有审批链……</p>
                <div class="run-output__foot"><span class="mono">content sha256: 7a1c…</span><a class="link" href="#/demands/R-2041/doc/functional-design">打开评审 ${ic("arrow-right")}</a></div>
              </div>
            </div>
            <div class="run-detail__foot">
              <button class="btn btn--sm">${ic("file-text")} 查看完整日志</button>
              <button class="btn btn--sm btn--ghost">${ic("rotate-ccw")} 从检查点重试</button>
            </div>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-run]").forEach((row) => {
        row.addEventListener("click", () => {
          root.querySelectorAll("[data-run]").forEach((r) => r.classList.remove("is-active"));
          row.classList.add("is-active");
          SA.toast("已切换运行 " + row.dataset.run);
        });
      });
      root.querySelector("[data-action='new-run']").addEventListener("click", () => {
        SA.modal({
          title: "手动触发 Agent 运行",
          desc: "选择一个需求与阶段，Super Agent 会立即组装上下文并运行。",
          body:
            '<div class="field"><span class="field__label">需求</span><select class="select"><option>R-2041 · 采购申请审批流增加部门预算校验</option><option>R-2044 · 供应商主数据银行账号校验规则升级</option></select></div>' +
            '<div class="field" style="margin-top:12px"><span class="field__label">阶段</span><select class="select"><option>功能设计（G1 前）</option><option>技术设计</option><option>测试文档</option></select></div>' +
            '<div class="callout callout--teal" style="margin-top:14px">' + ic("info") + "<span>手动运行仍受阶段模板与门禁约束，不会跳过人工确认。</span></div>",
          actions: [
            { label: "取消", variant: "ghost" },
            { label: "开始运行", variant: "primary", onClick: () => SA.toast("已入队 RN-8822，预计 1 分钟内完成", { icon: "sparkles" }) },
          ],
        });
      });
    },
  });
})();
