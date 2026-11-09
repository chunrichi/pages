/* ============================================================
   Screen · ChaRM change center (CR / CD / Basis approval)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const CDS = [
    { id: "CD-88213", title: "月结自动化任务增加失败重跑入口", system: "FY2 · 200", status: "待 Basis 审批", tone: "amber", crs: 2, owner: "王栎", time: "今天 16:22", active: true },
    { id: "CD-88214", title: "采购预算校验增强", system: "FY2 · 200", status: "已创建", tone: "green", crs: 3, owner: "周予", time: "昨天 11:10" },
    { id: "CD-88209", title: "供应商银行账号校验规则", system: "FY2 · 300", status: "已关闭", tone: "slate", crs: 1, owner: "沈珂", time: "11-06" },
  ];

  const CRS = [
    { id: "CR-44102", desc: "月结重跑入口 — 报表与类方法调整", status: "Basis 已通过", tone: "green", system: "FY2 · 200", owner: "周予", approveAt: "今天 08:56" },
    { id: "CR-44103", desc: "月配重跑入口 — 权限角色与配置表", status: "待 Basis 审批", tone: "amber", system: "FY2 · 200", owner: "王栎", approveAt: "等待中 · 已 2h" },
  ];

  SA.register("charm", {
    title: "ChaRM 变更",
    render() {
      return `
      <div class="page page-charm">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">TOOLS · SOLMAN CHARM</div>
            <div class="page-head__title"><h1>ChaRM 变更中心</h1><span class="pill pill--violet pill--lg">SOLMAN</span></div>
            <p class="page-head__desc">申请 Change Request、等待 Basis 审批、创建 Change Document。字段与审批人从 ChaRM 接口实时拉取。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn" data-action="sync-charm">${ic("refresh")} 同步 SolMan</button>
            <button class="btn btn--primary" data-action="new-cr">${ic("plus")} 新建 Change Request</button>
          </div>
        </div>

        <div class="charm-status">
          <div class="charm-status__left">
            <span class="charm-status__icon">${ic("git-branch")}</span>
            <div>
              <div class="charm-status__title">SolMan 连接正常 <span class="pill pill--green">FY2 / 200</span></div>
              <div class="charm-status__sub" id="charm-sync-sub">最后一次同步 12 秒前 · 自动同步每 60s</div>
            </div>
          </div>
          <div class="charm-status__right">
            <span class="charm-status__metric"><b>2</b> 待 Basis 审批</span>
            <span class="charm-status__metric"><b>6</b> 活跃 Change Document</span>
            <div class="charm-status__switch">
              <span>自动同步</span>
              <button class="switch is-on" data-action="toggle-sync"></button>
            </div>
          </div>
        </div>

        <div class="charm-layout">
          <aside class="charm-list card">
            <div class="charm-list__head">
              <span>Change Documents</span>
              <span class="mono">3</span>
            </div>
            <div class="search charm-list__search"><span data-icon="search"></span><input class="input" placeholder="搜索 CD / 传输…" /></div>
            <div class="charm-list__items">
              ${CDS.map(
                (c) => `
                <div class="charm-item ${c.active ? "is-active" : ""}" data-cd="${c.id}">
                  <div class="charm-item__top">
                    <span class="mono charm-item__id">${c.id}</span>
                    <span class="pill pill--${c.tone}"><span class="dot"></span>${c.status}</span>
                  </div>
                  <div class="charm-item__title">${c.title}</div>
                  <div class="charm-item__meta"><span>${c.system}</span><span class="dot-sep"></span><span>${c.crs} 个 CR</span><span class="grow"></span><span class="mono">${c.time}</span></div>
                </div>`
              ).join("")}
            </div>
            <div class="charm-list__foot">
              <a class="link sm" href="#/ops/queue">${ic("activity")} 同步队列 ${ic("arrow-right")}</a>
            </div>
          </aside>

          <section class="charm-detail">
            <div class="card charm-head">
              <div class="charm-head__main">
                <div class="charm-head__top">
                  <span class="mono">CD-88213</span>
                  <span class="tag tag--mono">FY2 · 200</span>
                  <span class="pill pill--amber"><span class="dot"></span>待 Basis 审批</span>
                </div>
                <h1>月结自动化任务增加失败重跑入口</h1>
                <div class="charm-head__meta">
                  <span>${ic("user")} 王栎 · 负责人</span>
                  <span>${ic("link")} CRQ-2026-0842</span>
                  <span>${ic("layers")} R-2045</span>
                  <span>${ic("clock")} 今天 16:22 创建</span>
                </div>
              </div>
              <div class="charm-head__actions">
                <button class="btn btn--sm" data-action="poll-charm">${ic("rotate-cw")} 拉取状态</button>
                <button class="btn btn--sm btn--primary" data-action="new-cr">${ic("plus")} 新建 CR</button>
              </div>
            </div>

            <div class="card charm-flow">
              <div class="card-head"><h3>Change Request / Document 流程</h3><span class="sm mono">SolMan ChaRM</span></div>
              <div class="charm-flow__steps">
                ${[
                  ["创建 Change Request", "已完成", "done", "16:22"],
                  ["等待 Basis 审批", "进行中 · 已 2h", "current", "16:40"],
                  ["创建 Change Document", "等待审批通过", "pending", ""],
                  ["补充传输与审批信息", "等待前序步骤", "pending", ""],
                  ["上线归档", "计划 11-12", "pending", ""],
                ]
                  .map(
                    ([label, sub, state, time]) => `
                  <div class="charm-flow__step is-${state}">
                    <span class="charm-flow__node">${state === "done" ? ic("check") : state === "current" ? '<i></i>' : ""}</span>
                    <span class="charm-flow__main"><b>${label}</b><em>${sub}</em></span>
                    <span class="charm-flow__time mono">${time}</span>
                  </div>`
                  )
                  .join("")}
              </div>
            </div>

            <div class="charm-grid">
              <div class="card">
                <div class="card-head"><h3>Change Requests</h3><span class="sm">2 个</span></div>
                <div class="charm-crs">
                  ${CRS.map(
                    (cr) => `
                    <div class="charm-cr">
                      <span class="charm-cr__icon charm-cr__icon--${cr.tone}">${ic("git-branch")}</span>
                      <span class="charm-cr__main"><b>${cr.id} · ${cr.desc}</b><em>${cr.system} · ${cr.owner} · ${cr.approveAt}</em></span>
                      <span class="pill pill--${cr.tone}"><span class="dot"></span>${cr.status}</span>
                      <button class="icon-btn icon-btn--sm">${ic("chevron-right")}</button>
                    </div>`
                  ).join("")}
                </div>
              </div>

              <div class="card charm-basis">
                <div class="card-head"><h3>Basis 审批</h3><span class="pill pill--amber"><span class="dot"></span>1 个等待</span></div>
                <div class="charm-basis__body">
                  <div class="charm-basis__pulse">
                    <span class="charm-basis__ring">${ic("clock")}</span>
                    <div><b>CR-44103 等待审批</b><em>审批人：吴工 · Basis<br />已等待 2 小时 · 自动拉取下一状态</em></div>
                  </div>
                  <div class="charm-basis__timeline">
                    <span class="is-done">${ic("check")} 16:22 提交 CR</span>
                    <span class="is-current">${ic("clock")} 16:40 进入 Basis 审批</span>
                    <span>${ic("git-branch")} 审批通过后自动创建 CD</span>
                  </div>
                  <button class="btn btn--sm btn--block" data-action="mock-approve">${ic("shield")} 模拟 Basis 审批通过</button>
                </div>
              </div>
            </div>

            <div class="charm-grid">
              <div class="card">
                <div class="card-head"><h3>变更字段</h3><span class="sm">部分来自接口</span></div>
                <div class="card-body">
                  <div class="charm-fields">
                    <div><span>目标系统</span><b>FY2 · 200</b><em>ChaRM API</em></div>
                    <div><span>变更类型</span><b>Normal Change</b><em>ChaRM API</em></div>
                    <div><span>负责人</span><b>王栎</b><em>默认值</em></div>
                    <div><span>传输请求</span><b class="mono">FY2K900142</b><em>手动</em></div>
                    <div><span>关联 CRQ</span><b class="mono">CRQ-2026-0842</b><em>自动</em></div>
                    <div><span>关联需求</span><b class="mono">R-2045</b><em>自动</em></div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-head"><h3>ChaRM 同步日志</h3><span class="live-dot">每 60s</span></div>
                <div class="code charm-log" style="border:0;border-radius:0;margin:0">
<span class="c">16:42:10</span> GET /charm/change-documents/CD-88213 <span class="s">200</span> → 2 CR
<span class="c">16:42:10</span> GET /charm/change-requests/CR-44103 <span class="s">200</span> → pending
<span class="c">16:41:08</span> GET /charm/change-requests/CR-44103 <span class="s">200</span> → pending
<span class="c">16:40:07</span> POST /charm/change-requests <span class="s">201</span> → CR-44103
<span class="c">16:22:03</span> POST /charm/change-documents <span class="s">201</span> → CD-88213</div>
              </div>
            </div>
          </section>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-cd]").forEach((item) => {
        item.addEventListener("click", () => {
          root.querySelectorAll("[data-cd]").forEach((x) => x.classList.remove("is-active"));
          item.classList.add("is-active");
        });
      });
      root.querySelector("[data-action='sync-charm']").addEventListener("click", (e) => {
        e.currentTarget.classList.add("is-loading");
        setTimeout(() => {
          e.currentTarget.classList.remove("is-loading");
          document.getElementById("charm-sync-sub").textContent = "最后一次同步 刚刚 · 自动同步每 60s";
          SA.toast("已从 SolMan 拉取最新状态", { icon: "refresh" });
        }, 900);
      });
      root.querySelector("[data-action='poll-charm']").addEventListener("click", (e) => {
        e.currentTarget.classList.add("is-loading");
        setTimeout(() => {
          e.currentTarget.classList.remove("is-loading");
          SA.toast("CR-44103 状态未变化 · 仍在 Basis 审批中");
        }, 900);
      });
      root.querySelector("[data-action='toggle-sync']").addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("is-on");
        SA.toast(e.currentTarget.classList.contains("is-on") ? "自动同步已开启" : "自动同步已暂停");
      });
      root.querySelector("[data-action='mock-approve']").addEventListener("click", () => {
        SA.toast("演示：Basis 审批通过，将自动创建 CD", { icon: "check-circle" });
      });
      const newCr = () => {
        SA.modal({
          title: "新建 Change Request",
          desc: "将在 ChaRM 中创建 CR，并关联到 CD-88213。提交后自动拉取 Basis 审批人。",
          wide: true,
          body:
            '<div class="form-row form-row--2">' +
            '<div class="field"><span class="field__label">目标系统</span><select class="select"><option>FY2 · 200 · 测试</option><option>FY2 · 300 · 生产</option></select></div>' +
            '<div class="field"><span class="field__label">变更类型</span><select class="select"><option>Normal Change</option><option>Urgent Change</option></select></div>' +
            "</div>" +
            '<div class="field" style="margin-top:12px"><span class="field__label">变更描述</span><textarea class="textarea" rows="3">月结重跑入口 — 权限角色与配置表调整</textarea></div>' +
            '<div class="field" style="margin-top:12px"><span class="field__label">传输请求</span><input class="input mono" value="FY2K900143" /></div>' +
            '<div class="callout callout--violet" style="margin-top:14px;background:var(--violet-tint);border-color:var(--violet-line);color:#43369c">' +
            ic("info") +
            "<span>Basis 审批人由 ChaRM 按系统与小组自动带出：吴工（Basis）。审批通过前不会创建 Change Document。</span></div>",
          actions: [
            { label: "取消", variant: "ghost" },
            {
              label: "创建 CR",
              variant: "primary",
              onClick: () => {
                SA.toast("CR-44104 已创建，等待 Basis 审批", { icon: "git-branch" });
              },
            },
          ],
        });
      };
      root.querySelectorAll("[data-action='new-cr']").forEach((b) => b.addEventListener("click", newCr));
    },
  });
})();
