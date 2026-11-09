/* ============================================================
   Screens · CRQ orders, create orchestration, template management
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const ORDERS = [
    { id: "CRQ-2026-0842", title: "月结重跑入口上线 · R-2045", group: "FIN-SH", template: "财务共享 v3", demand: "R-2045", status: "待审批", tone: "amber", owner: "沈珂", time: "今天 16:20", steps: [1, 2, 3, 4, 5] },
    { id: "CRQ-2026-0841", title: "开票清单导出服务 · R-2042", group: "FIN-SH", template: "财务共享 v3", demand: "R-2042", status: "创建中", tone: "blue", owner: "周予", time: "今天 15:48", live: true, steps: [1, 2, 3] },
    { id: "CRQ-2026-0839", title: "预算校验增强 · R-2041", group: "FIN-SH", template: "财务共享 v2", demand: "R-2041", status: "已创建", tone: "green", owner: "林桦", time: "昨天 11:02", steps: [1, 2, 3, 4, 5, 6] },
    { id: "CRQ-2026-0836", title: "供应商银行账号校验 · R-2044", group: "FIN-SH", template: "财务共享 v3", demand: "R-2044", status: "失败", tone: "red", owner: "陈曦", time: "昨天 09:31", failed: true, steps: [1, 2] },
    { id: "CRQ-2026-0835", title: "MES 工单状态回写 · R-2043", group: "MFG-CN", template: "制造组 v1", demand: "R-2043", status: "已创建", tone: "green", owner: "王栎", time: "11-10", steps: [1, 2, 3, 4, 5, 6] },
    { id: "CRQ-2026-0834", title: "库龄区间筛选 · R-2047", group: "SCM-CN", template: "供应链 v2", demand: "R-2047", status: "草稿", tone: "slate", owner: "周予", time: "11-10", steps: [] },
  ];

  const TEMPLATES = [
    {
      id: "fin-v3",
      group: "FIN-SH",
      name: "财务共享 · 标准变更",
      version: "v3",
      status: "已发布",
      active: true,
      updated: "2026-11-04 14:20",
      owner: "王栎",
      fields: 18,
      used: 24,
      desc: "适用于 FIN 模块的常规变更，包含 CRQ 与 ChaRM 联动字段。",
    },
    { id: "fin-v2", group: "FIN-SH", name: "财务共享 · 标准变更", version: "v2", status: "已归档", updated: "2026-09-18 10:05", owner: "王栎", fields: 16, used: 41, desc: "旧版本，仅保留用于历史工单复现。" },
    { id: "fin-v1", group: "FIN-SH", name: "财务共享 · 标准变更", version: "v1", status: "已归档", updated: "2026-06-02 16:31", owner: "林桦", fields: 12, used: 18, desc: "初版模板。" },
    { id: "scm-v2", group: "SCM-CN", name: "供应链 · 标准变更", version: "v2", status: "已发布", active: true, updated: "2026-10-22 09:12", owner: "周予", fields: 15, used: 12, desc: "供应链组默认 CRQ 模板。" },
    { id: "mfg-v1", group: "MFG-CN", name: "制造组 · 变更", version: "v1", status: "已发布", active: true, updated: "2026-08-30 15:44", owner: "王栎", fields: 14, used: 9, desc: "制造组 CRQ 模板，含 MES 系统字段。" },
  ];

  const STEPS = [
    { key: "validate", label: "校验模板与字段", api: "POST /solman/validate", time: "0.4s" },
    { key: "number", label: "获取请求号", api: "POST /solman/request-number", time: "0.8s" },
    { key: "create", label: "创建 CRQ 工单", api: "POST /solman/crq", time: "2.1s" },
    { key: "fields", label: "补充定制字段", api: "PATCH /solman/crq/{id}", time: "1.2s" },
    { key: "attach", label: "关联传输与附件", api: "POST /solman/crq/{id}/attach", time: "1.7s" },
    { key: "submit", label: "提交审批", api: "POST /solman/crq/{id}/submit", time: "0.9s" },
  ];

  /* ------------------------------------------------------------
     list
     ------------------------------------------------------------ */
  SA.register("crq", {
    title: "CRQ 工单",
    render() {
      return `
      <div class="page page-crq">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">TOOLS · CRQ 工单</div>
            <div class="page-head__title"><h1>CRQ 工单</h1><span class="pill pill--outline pill--lg">12 个</span></div>
            <p class="page-head__desc">通过 SolMan 接口创建外部工单。接口不完整的部分由模板配置编排，按小组与版本管理。</p>
          </div>
          <div class="page-head__actions">
            <a class="btn" href="#/tools/crq/templates">${ic("columns")} 模板管理</a>
            <a class="btn btn--primary" href="#/tools/crq/new">${ic("plus")} 新建 CRQ</a>
          </div>
        </div>

        <section class="metric-strip">
          <div class="metric"><span>待审批</span><b>3</b><em class="amber">CRQ-0842 等 3 个</em></div>
          <div class="metric"><span>创建中</span><b>1</b><em class="blue">编排执行 3/6</em></div>
          <div class="metric"><span>本周已创建</span><b>18</b><em>成功 17 · 失败 1</em></div>
          <div class="metric"><span>平均创建耗时</span><b>12.4<span class="metric__unit">s</span></b><em>接口调用 5 次</em></div>
        </section>

        <div class="tabs crq-tabs">
          <button class="tab is-active" data-crq-tab="all">全部 <span class="count">6</span></button>
          <button class="tab" data-crq-tab="draft">草稿 <span class="count">1</span></button>
          <button class="tab" data-crq-tab="running">创建中 <span class="count">1</span></button>
          <button class="tab" data-crq-tab="pending">待审批 <span class="count">1</span></button>
          <button class="tab" data-crq-tab="done">已创建 <span class="count">2</span></button>
          <button class="tab" data-crq-tab="failed">失败 <span class="count">1</span></button>
          <span class="grow"></span>
          <div class="search"><span data-icon="search"></span><input class="input" placeholder="搜索 CRQ 号…" /></div>
        </div>

        <div class="card crq-table-card">
          <div class="table-wrap">
            <table class="table crq-table">
              <thead><tr><th>CRQ 号</th><th>标题</th><th>小组 / 模板</th><th>关联需求</th><th>申请人</th><th>创建时间</th><th>状态</th><th></th></tr></thead>
              <tbody>
                ${ORDERS.map(
                  (o) => `
                  <tr data-crq="${o.id}">
                    <td><span class="cell-mono">${o.id}</span></td>
                    <td><div class="crq-title">${o.title}</div>${o.live ? `<div class="crq-progress"><span class="progress progress--thin"><span class="progress__bar progress__bar--blue" data-bar="50"></span></span><em>编排中 3/6</em></div>` : ""}</td>
                    <td><span class="crq-group">${o.group}</span><span class="sm">${o.template}</span></td>
                    <td><span class="cell-mono">${o.demand}</span></td>
                    <td><span class="crq-owner"><span class="avatar avatar--sm" data-tone="slate">${o.owner[0]}</span>${o.owner}</span></td>
                    <td><span class="sm" style="color:var(--ink-3)">${o.time}</span></td>
                    <td><span class="pill pill--${o.tone}"><span class="dot"></span>${o.status}</span></td>
                    <td><button class="icon-btn icon-btn--sm" data-action="crq-detail">${ic("chevron-right")}</button></td>
                  </tr>`
                ).join("")}
              </tbody>
            </table>
          </div>
          <div class="table-foot">
            <span class="sm">模板变更只影响新建工单，进行中的工单固定创建时的模板版本。</span>
            <span class="grow"></span>
            <span class="sm mono">SolMan · client 200 · 队列正常</span>
          </div>
        </div>

        <div class="crq-help">
          <span>${ic("info")} CRQ 创建需要多次调用接口，失败时会保留中间结果并从失败步骤重试。</span>
          <a class="link" href="#/ops/queue">查看调用队列 ${ic("arrow-right")}</a>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-crq-tab]").forEach((b) => {
        b.addEventListener("click", () => {
          root.querySelectorAll("[data-crq-tab]").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          const key = b.dataset.crqTab;
          const map = { draft: "草稿", running: "创建中", pending: "待审批", done: "已创建", failed: "失败" };
          root.querySelectorAll("[data-crq]").forEach((tr) => {
            const status = ORDERS.find((o) => o.id === tr.dataset.crq).status;
            tr.hidden = key !== "all" && status !== map[key];
          });
        });
      });
      root.querySelectorAll("[data-crq]").forEach((tr) => {
        tr.addEventListener("click", () => openCrqDrawer(tr.dataset.crq));
      });
    },
  });

  function openCrqDrawer(id) {
    const o = ORDERS.find((x) => x.id === id) || ORDERS[0];
    const stepHtml = STEPS.map((s, i) => {
      const done = o.steps.includes(i + 1);
      const current = o.live && i === o.steps.length;
      const failed = o.failed && i === o.steps.length;
      return `
        <div class="orche-step ${done ? "is-done" : ""} ${current ? "is-current" : ""} ${failed ? "is-failed" : ""}">
          <span class="orche-step__node">${done ? ic("check") : failed ? ic("x") : current ? '<i class="spinner"></i>' : i + 1}</span>
          <span class="orche-step__main"><b>${s.label}</b><em class="mono">${s.api}</em></span>
          <span class="orche-step__time mono">${done ? s.time : current ? "进行中" : failed ? "HTTP 400" : "等待"}</span>
        </div>`;
    }).join("");
    SA.drawer({
      title: o.id,
      sub: o.title + " · " + o.group + " · " + o.template,
      body: `
        <div class="drawer-block">
          <div class="drawer-block__head">编排状态 <span class="pill pill--${o.tone}"><span class="dot"></span>${o.status}</span></div>
          <div class="orche-steps">${stepHtml}</div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">工单字段</div>
          <div class="kv">
            <div class="kv-row"><span class="kv-key">申请日期</span><span class="kv-val">2026-11-11</span></div>
            <div class="kv-row"><span class="kv-key">申请人</span><span class="kv-val">${o.owner} · FIN-SH</span></div>
            <div class="kv-row"><span class="kv-key">类型分组</span><span class="kv-val">FIN_CHANGE / 月结自动化</span></div>
            <div class="kv-row"><span class="kv-key">文本描述</span><span class="kv-val">${o.title}，关联 ${o.demand}，共 6 个传输。</span></div>
            <div class="kv-row"><span class="kv-key">目标系统</span><span class="kv-val mono">FY2 / 200</span></div>
            <div class="kv-row"><span class="kv-key">请求号</span><span class="kv-val mono">SAPK-902114</span></div>
          </div>
        </div>
        <div class="drawer-block">
          <div class="drawer-block__head">接口调用日志 <span class="sm mono">trace 9f2c…41d</span></div>
          <div class="code" style="font-size:9.5px"><span class="c">16:20:01</span> <span class="k">POST</span> /solman/validate <span class="s">200</span> 0.4s
<span class="c">16:20:02</span> <span class="k">POST</span> /solman/request-number <span class="s">200</span> 0.8s → SAPK-902114
<span class="c">16:20:03</span> <span class="k">POST</span> /solman/crq <span class="s">201</span> 2.1s → CRQ-2026-0842
<span class="c">16:20:05</span> <span class="k">PATCH</span> /solman/crq/CRQ-2026-0842 <span class="s">200</span> 1.2s
<span class="c">16:20:07</span> <span class="k">POST</span> /solman/crq/CRQ-2026-0842/attach <span class="s">200</span> 1.7s
<span class="c">16:20:08</span> <span class="k">POST</span> /solman/crq/CRQ-2026-0842/submit <span class="s">200</span> 0.9s</div>
        </div>`,
      actions: [
        { label: "在队列查看", icon: "activity", onClick: () => SA.go("#/ops/queue") },
        { label: "重试失败步骤", variant: "primary", onClick: () => SA.toast("已从失败步骤重试，保留中间结果") },
      ],
    });
  }

  /* ------------------------------------------------------------
     create
     ------------------------------------------------------------ */
  SA.register("crq-new", {
    title: "新建 CRQ",
    render() {
      return `
      <div class="page page-crq-new">
        <a class="back-link" href="#/tools/crq">${ic("arrow-left")} CRQ 工单</a>
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">NEW CRQ · 创建工单</div>
            <div class="page-head__title"><h1>新建 CRQ 工单</h1></div>
            <p class="page-head__desc">选择小组模板，补齐接口无法自动填充的字段。右侧会实时展示编排进度。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn btn--ghost" data-action="save-crq">保存草稿</button>
          </div>
        </div>

        <div class="crq-new-layout">
          <div class="crq-form card">
            <div class="crq-form__head">
              <div class="row gap-2">
                <span class="crq-form__icon">${ic("file-text")}</span>
                <div><h2>工单信息</h2><span class="sm">财务共享组 · 标准变更模板 v3</span></div>
              </div>
              <a class="link sm" href="#/tools/crq/templates">更换模板 ${ic("arrow-right")}</a>
            </div>
            <div class="crq-form__body">
              <div class="form-row form-row--3">
                <div class="field"><span class="field__label">申请日期 <span class="tag tag--mono">默认</span></span><input class="input" type="date" value="2026-11-11" /></div>
                <div class="field"><span class="field__label">申请人 <span class="tag tag--mono">当前用户</span></span><input class="input" value="陈曦 · FIN-SH" readonly /></div>
                <div class="field"><span class="field__label">优先级</span><select class="select"><option>中 · 常规变更</option><option>高 · 紧急变更</option><option>低</option></select></div>
              </div>
              <div class="form-row form-row--2">
                <div class="field"><span class="field__label">类型分组 <span class="tag tag--teal">ChaRM API</span></span><select class="select"><option>FIN_CHANGE · 财务常规变更</option><option>FIN_EMERGENCY · 紧急变更</option><option>FIN_CONFIG · 配置变更</option></select></div>
                <div class="field"><span class="field__label">目标系统 <span class="tag tag--teal">ChaRM API</span></span><select class="select"><option>FY2 · 200 · 测试系统</option><option>FY2 · 300 · 生产系统</option></select></div>
              </div>
              <div class="field">
                <span class="field__label">文本描述 <span class="req">*</span></span>
                <textarea class="textarea" rows="4">月结自动化任务增加失败重跑入口。业务方可在监控页选择失败的月结任务重新执行，系统记录重跑操作与审计日志。关联需求 R-2045，共 6 个传输。</textarea>
                <span class="field__hint">描述会写入 SolMan CRQ 的 TEXT 字段，并同步到 ChaRM Change Document。</span>
              </div>
              <div class="form-row form-row--2">
                <div class="field"><span class="field__label">关联需求 <span class="tag tag--mono">自动</span></span><input class="input" value="R-2045 · 月结自动化任务增加失败重跑入口" readonly /></div>
                <div class="field"><span class="field__label">请求号 <span class="tag tag--blue">接口生成</span></span><input class="input mono" value="SAPK-902114" readonly /></div>
              </div>
              <div class="form-row form-row--2">
                <div class="field"><span class="field__label">传输请求</span><input class="input mono" value="FY2K900142, FY2K900143" /></div>
                <div class="field"><span class="field__label">业务审批人 <span class="tag tag--teal">ChaRM API</span></span><select class="select"><option>陈曦 · 财务共享组</option><option>林桦 · 需求顾问</option></select></div>
              </div>
              <div class="field">
                <span class="field__label">附件</span>
                <div class="dropzone dropzone--sm" data-action="crq-attach"><span class="dropzone__icon">${ic("paperclip")}</span><span class="grow"><span class="dropzone__title">上传上线文档、测试证据或变更说明</span><span class="dropzone__hint">已自动带入 R-2045 的上线文档 v1.2</span></span><span class="btn btn--sm">选择</span></div>
                <div class="file-list"><div class="file-row"><span class="file-row__icon">PDF</span><span class="file-row__meta"><span class="file-row__name">R-2045-上线方案-v1.2.pdf</span><span class="file-row__size">自动关联 · 来自需求</span></span><span class="pill pill--green">已带入</span></div></div>
              </div>
              <div class="callout callout--blue">${ic("info")}<span>模板已固定 18 个字段，其中 12 个由接口自动填充；你只需要维护 6 个定制字段。</span></div>
            </div>
            <div class="wizard-foot">
              <span class="sm">预计调用 5 个接口，耗时 7.1s</span>
              <span class="grow"></span>
              <button class="btn btn--ghost" data-action="save-crq">保存草稿</button>
              <button class="btn btn--primary" data-action="run-crq">${ic("play")} 创建并提交</button>
            </div>
          </div>

          <aside class="crq-orche card">
            <div class="crq-orche__head">
              <div class="row gap-2"><span class="crq-orche__icon">${ic("workflow")}</span><div><h2>创建编排</h2><span class="sm">模板驱动 · 失败可重试</span></div></div>
              <span class="pill pill--outline" id="orche-status">待执行</span>
            </div>
            <div class="orche-steps" id="orche-list">
              ${STEPS.map(
                (s, i) => `
                <div class="orche-step" data-orche-step="${i}">
                  <span class="orche-step__node">${i + 1}</span>
                  <span class="orche-step__main"><b>${s.label}</b><em class="mono">${s.api}</em></span>
                  <span class="orche-step__time mono">等待</span>
                </div>`
              ).join("")}
            </div>
            <div class="crq-orche__log">
              <div class="crq-orche__log-head">调用日志 <span class="live-dot">idle</span></div>
              <div class="crq-orche__console" id="orche-log">
                <span class="c">// 点击「创建并提交」开始编排</span>
              </div>
            </div>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-action='save-crq']").forEach((b) => b.addEventListener("click", () => SA.toast("草稿已保存")));
      root.querySelector("[data-action='crq-attach']").addEventListener("click", () => SA.toast("演示：已选择 1 个附件"));
      const btn = root.querySelector("[data-action='run-crq']");
      btn.addEventListener("click", () => {
        if (btn.classList.contains("is-loading") || btn.dataset.done) return;
        btn.classList.add("is-loading");
        const log = root.querySelector("#orche-log");
        const status = root.querySelector("#orche-status");
        status.textContent = "执行中";
        status.className = "pill pill--blue pill--live";
        log.innerHTML = "";
        const start = new Date();
        let i = 0;
        const tick = () => {
          if (i >= STEPS.length) {
            btn.classList.remove("is-loading");
            btn.dataset.done = "1";
            btn.innerHTML = ic("check") + " 已创建";
            status.textContent = "已完成";
            status.className = "pill pill--green";
            SA.modal({
              title: "CRQ 工单已创建",
              desc: "CRQ-2026-0842 已提交至 SolMan，等待业务审批。",
              body:
                '<div class="submit-success">' +
                '<div class="submit-success__row"><span class="submit-success__icon">' + ic("check") + "</span><span><b>CRQ-2026-0842</b><em>6 个步骤全部完成 · 共 7.1s</em></span><span class=\"pill pill--green\">已创建</span></div>" +
                '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--violet">' + ic("git-branch") + "</span><span><b>ChaRM Change Request</b><em>CR-44102 · 等待 Basis 审批</em></span><span class=\"pill pill--violet\">已关联</span></div>" +
                '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--blue">' + ic("send") + "</span><span><b>邮件通知</b><em>已发送至陈曦 · 含审批深链</em></span><span class=\"pill pill--blue\">已发送</span></div>" +
                "</div>",
              wide: true,
              actions: [
                { label: "返回列表", variant: "ghost", onClick: () => SA.go("#/tools/crq") },
                { label: "查看工单", variant: "primary", onClick: () => SA.go("#/tools/crq") },
              ],
            });
            return;
          }
          const step = root.querySelector('[data-orche-step="' + i + '"]');
          step.classList.add("is-current");
          step.querySelector(".orche-step__node").innerHTML = '<i class="spinner"></i>';
          step.querySelector(".orche-step__time").textContent = "请求中";
          const t = new Date();
          const ts = [t.getHours(), t.getMinutes(), t.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
          log.insertAdjacentHTML("beforeend", `<div><span class="c">${ts}</span> <span class="k">→</span> ${STEPS[i].api} <span class="s">…</span></div>`);
          log.scrollTop = log.scrollHeight;
          setTimeout(() => {
            step.classList.remove("is-current");
            step.classList.add("is-done");
            step.querySelector(".orche-step__node").innerHTML = ic("check");
            step.querySelector(".orche-step__time").textContent = STEPS[i].time;
            log.insertAdjacentHTML("beforeend", `<div><span class="c">${ts}</span> <span class="k">✓</span> ${STEPS[i].api} <span class="s">200</span> ${STEPS[i].time}</div>`);
            log.scrollTop = log.scrollHeight;
            i += 1;
            tick();
          }, 520);
        };
        if (SA.isShot) {
          STEPS.forEach((s, idx) => {
            const step = root.querySelector('[data-orche-step="' + idx + '"]');
            step.classList.add("is-done");
            step.querySelector(".orche-step__node").innerHTML = ic("check");
            step.querySelector(".orche-step__time").textContent = s.time;
          });
          log.innerHTML = '<div><span class="c">16:20:01</span> <span class="k">POST</span> /solman/validate <span class="s">200</span> 0.4s</div>';
          return;
        }
        tick();
      });
    },
  });

  /* ------------------------------------------------------------
     templates
     ------------------------------------------------------------ */
  SA.register("crq-templates", {
    title: "CRQ 模板",
    render() {
      return `
      <div class="page page-templates">
        <a class="back-link" href="#/tools/crq">${ic("arrow-left")} CRQ 工单</a>
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">CRQ TEMPLATES · 模板管理</div>
            <div class="page-head__title"><h1>CRQ 模板</h1></div>
            <p class="page-head__desc">接口不完整的字段用模板补齐。模板按小组 + 版本管理，已创建工单固定使用创建时的版本。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn">${ic("copy")} 复制模板</button>
            <button class="btn btn--primary">${ic("plus")} 新建模板</button>
          </div>
        </div>

        <div class="tpl-layout">
          <aside class="tpl-groups card">
            <div class="tpl-groups__head">小组模板</div>
            <div class="tpl-group is-active" data-group="FIN-SH">
              <span class="group-switch__icon">FIN</span>
              <span class="grow"><b>财务共享组</b><em>3 个版本 · 当前 v3</em></span>
              <span class="tpl-group__count">24</span>
            </div>
            <div class="tpl-group" data-group="SCM-CN">
              <span class="group-switch__icon">SCM</span>
              <span class="grow"><b>供应链组</b><em>1 个版本 · 当前 v2</em></span>
              <span class="tpl-group__count">12</span>
            </div>
            <div class="tpl-group" data-group="MFG-CN">
              <span class="group-switch__icon">MFG</span>
              <span class="grow"><b>制造组</b><em>1 个版本 · 当前 v1</em></span>
              <span class="tpl-group__count">9</span>
            </div>
            <div class="tpl-groups__foot">
              <div>${ic("info")} 新版本发布后，旧版本自动归档，不影响进行中的工单。</div>
            </div>
          </aside>

          <section class="tpl-list card">
            <div class="card-head"><h3>财务共享组 · 版本列表</h3><span class="sm">共 3 个版本</span></div>
            <div class="tpl-rows">
              ${TEMPLATES.filter((t) => t.group === "FIN-SH")
                .map(
                  (t) => `
                <div class="tpl-row ${t.active ? "is-active" : ""}" data-tpl="${t.id}">
                  <span class="tpl-row__version mono">${t.version}</span>
                  <span class="tpl-row__main">
                    <b>${t.name}${t.active ? ' <span class="tag tag--teal">当前发布</span>' : ""}</b>
                    <em>${t.fields} 个字段 · 已被 ${t.used} 个工单使用 · ${t.updated}</em>
                  </span>
                  <span class="pill pill--${t.active ? "green" : "slate"}"><span class="dot"></span>${t.status}</span>
                  <button class="icon-btn icon-btn--sm">${ic("more-vertical")}</button>
                </div>`
                )
                .join("")}
            </div>
            <div class="table-foot"><span class="sm">版本创建后不可修改字段顺序，发布后会生成新的 schema 快照。</span></div>
          </section>

          <section class="tpl-preview card">
            <div class="tpl-preview__head">
              <div>
                <div class="row gap-2">
                  <span class="mono tpl-preview__version">v3</span>
                  <span class="tag tag--teal">当前发布</span>
                  <span class="tag">2026-11-04</span>
                </div>
                <h2>财务共享 · 标准变更</h2>
                <p class="sm">适用于 FIN 模块的常规变更，包含 CRQ 与 ChaRM 联动字段。</p>
              </div>
              <button class="btn btn--sm">${ic("edit")} 编辑模板</button>
            </div>
            <div class="tpl-fields">
              <div class="tpl-fields__head"><span>字段</span><span>类型</span><span>来源</span><span>默认值 / 说明</span></div>
              ${[
                ["申请日期", "date", "默认值", "今天"],
                ["申请人", "user", "当前用户", "根据绑定设备识别"],
                ["类型分组", "select", "ChaRM API", "FIN_CHANGE / FIN_EMERGENCY"],
                ["目标系统", "select", "ChaRM API", "FY2 · 200 / 300"],
                ["文本描述", "textarea", "手动", "需求摘要自动带入"],
                ["请求号", "text", "接口生成", "POST /request-number"],
                ["传输请求", "text", "手动 / 自动", "从 ChaRM 拉取"],
                ["业务审批人", "select", "ChaRM API", "按小组默认人"],
                ["附件", "file", "自动", "上线文档 + 测试证据"],
                ["优先级", "select", "默认值", "中 · 常规变更"],
              ]
                .map(
                  ([name, type, source, def]) => `
                <div class="tpl-field">
                  <span class="tpl-field__name">${name}</span>
                  <span class="tpl-field__type mono">${type}</span>
                  <span class="tpl-field__source tpl-field__source--${source.includes("API") ? "api" : source === "手动" ? "manual" : source === "自动" ? "auto" : "default"}">${source}</span>
                  <span class="tpl-field__default">${def}</span>
                </div>`
                )
                .join("")}
            </div>
            <div class="tpl-preview__foot">
              <div class="tpl-dropdown">
                <span class="tpl-dropdown__head">下拉选项来源 · 类型分组</span>
                <div class="tpl-dropdown__chips"><span>FIN_CHANGE</span><span>FIN_EMERGENCY</span><span>FIN_CONFIG</span><span>+ 从 ChaRM 同步</span></div>
              </div>
              <div class="tpl-preview__actions">
                <button class="btn">${ic("eye")} 预览表单</button>
                <button class="btn btn--primary">${ic("upload")} 发布新版本</button>
              </div>
            </div>
          </section>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll(".tpl-group").forEach((g) => {
        g.addEventListener("click", () => {
          root.querySelectorAll(".tpl-group").forEach((x) => x.classList.remove("is-active"));
          g.classList.add("is-active");
          SA.toast("已切换到 " + g.querySelector("b").textContent);
        });
      });
      root.querySelectorAll(".tpl-row").forEach((r) => {
        r.addEventListener("click", () => {
          root.querySelectorAll(".tpl-row").forEach((x) => x.classList.remove("is-active"));
          r.classList.add("is-active");
        });
      });
    },
  });
})();
