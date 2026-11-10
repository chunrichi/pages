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
      const readOnly = SA.isReadOnly();
      const orders = readOnly ? ORDERS.filter((o) => o.group === SA.data.user.groupKey) : ORDERS;
      const countOf = (st) => orders.filter((o) => o.status === st).length;
      return `
      <div class="page page-crq">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">TOOLS · CRQ 工单</div>
            <div class="page-head__title"><h1>CRQ 工单</h1><span class="pill pill--outline pill--lg">12 个</span></div>
            <p class="page-head__desc">通过 SolMan 接口创建外部工单。接口不完整的部分由模板配置编排，按小组与版本管理。</p>
          </div>
          ${
            readOnly
              ? ""
              : `<div class="page-head__actions">
            <a class="btn" href="#/tools/crq/templates">${ic("columns")} 模板管理</a>
            <a class="btn btn--primary" href="#/tools/crq/new">${ic("plus")} 新建 CRQ</a>
          </div>`
          }
        </div>

        ${readOnly ? SA.readOnlyBar("业务方可以查看与本组需求相关的工单，创建与编排由 SAP IT 完成。") : ""}

        <section class="metric-strip">
          <div class="metric"><span>待审批</span><b>${countOf("待审批")}</b><em class="amber">CRQ-0842 等 ${countOf("待审批")} 个</em></div>
          <div class="metric"><span>创建中</span><b>${countOf("创建中")}</b><em class="blue">编排执行 3/6</em></div>
          <div class="metric"><span>本周已创建</span><b>18</b><em>成功 17 · 失败 1</em></div>
          <div class="metric"><span>平均创建耗时</span><b>12.4<span class="metric__unit">s</span></b><em>接口调用 5 次</em></div>
        </section>

        <div class="tabs crq-tabs">
          <button class="tab is-active" data-crq-tab="all">全部 <span class="count">${orders.length}</span></button>
          <button class="tab" data-crq-tab="draft">草稿 <span class="count">${countOf("草稿")}</span></button>
          <button class="tab" data-crq-tab="running">创建中 <span class="count">${countOf("创建中")}</span></button>
          <button class="tab" data-crq-tab="pending">待审批 <span class="count">${countOf("待审批")}</span></button>
          <button class="tab" data-crq-tab="done">已创建 <span class="count">${countOf("已创建")}</span></button>
          <button class="tab" data-crq-tab="failed">失败 <span class="count">${countOf("失败")}</span></button>
          <span class="grow"></span>
          <div class="search"><span data-icon="search"></span><input class="input" placeholder="搜索 CRQ 号…" /></div>
        </div>

        <div class="card crq-table-card">
          <div class="table-wrap">
            <table class="table crq-table">
              <thead><tr><th>CRQ 号</th><th>标题</th><th>小组 / 模板</th><th>关联需求</th><th>申请人</th><th>创建时间</th><th>状态</th><th></th></tr></thead>
              <tbody>
                ${orders.map(
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
          <span>${ic("info")} ${
            readOnly
              ? "CRQ 的创建与编排由 SAP IT 完成；失败重试只影响未上线的变更。"
              : "CRQ 创建需要多次调用接口，失败时会保留中间结果并从失败步骤重试。"
          }</span>
          ${readOnly ? "" : '<a class="link" href="#/ops/queue">查看调用队列 ' + ic("arrow-right") + "</a>"}
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
            const status = (ORDERS.find((o) => o.id === tr.dataset.crq) || {}).status;
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
      actions: SA.isReadOnly()
        ? []
        : [
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
              <div class="callout callout--blue">${ic("info")}<span>模板已固定 10 个字段，其中 6 个由接口或 ChaRM 自动填充；你只需要维护传输请求、优先级等 4 个定制字段。</span></div>
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
          log.insertAdjacentHTML("beforeend", `<div class="anim-rise"><span class="c">${ts}</span> <span class="k">→</span> ${STEPS[i].api} <span class="s">…</span></div>`);
          log.scrollTop = log.scrollHeight;
          SA.sequence(() => {
            step.classList.remove("is-current");
            step.classList.add("is-done");
            const node = step.querySelector(".orche-step__node");
            node.innerHTML = ic("check");
            node.classList.add("anim-scale");
            step.querySelector(".orche-step__time").textContent = STEPS[i].time;
            log.insertAdjacentHTML("beforeend", `<div class="anim-rise"><span class="c">${ts}</span> <span class="k">✓</span> ${STEPS[i].api} <span class="s">200</span> ${STEPS[i].time}</div>`);
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
     平台基础模板（平台管理员维护）+ 小组模板（本组维护，其他组不可见）
     下拉选项与默认值支持从 ChaRM 值列表拉取后勾选添加
     ------------------------------------------------------------ */
  const TPL_TODAY = "2026-11-11";
  const TPL_NOW = "2026-11-11 14:00";

  const TPL_SOURCE = {
    default: { label: "默认值", cls: "default" },
    currentUser: { label: "当前用户", cls: "default" },
    charmApi: { label: "ChaRM API", cls: "api" },
    apiGenerated: { label: "接口生成", cls: "auto" },
    manual: { label: "手动", cls: "manual" },
    autoFromDemand: { label: "需求带入", cls: "auto" },
  };

  /* ChaRM 值列表：真实实现走 GET /charm/value-help?field=… */
  const CHARM_VALUE_HELP = {
    changeType: {
      endpoint: "GET /charm/value-help?field=changeType",
      values: [
        { code: "FIN_CHANGE", label: "财务常规变更", note: "FIN" },
        { code: "FIN_EMERGENCY", label: "财务紧急变更", note: "FIN" },
        { code: "FIN_CONFIG", label: "配置变更", note: "FIN" },
        { code: "FIN_ASSET", label: "资产变更", note: "FIN" },
        { code: "MM_CHANGE", label: "物料主数据变更", note: "MM" },
      ],
    },
    targetSystem: {
      endpoint: "GET /charm/value-help?field=targetSystem",
      values: [
        { code: "FY2-200", label: "FY2 · 200 开发", note: "DEV" },
        { code: "FY2-300", label: "FY2 · 300 测试", note: "QAS" },
        { code: "FY2-500", label: "FY2 · 500 生产", note: "PRD" },
      ],
    },
    approver: {
      endpoint: "GET /charm/value-help?field=approver",
      values: [
        { code: "lin.hua", label: "林桦 · 财务顾问", note: "FIN-SH" },
        { code: "wang.li", label: "王栎 · IT 主管", note: "FIN-SH" },
        { code: "shen.ke", label: "沈珂 · 应用维护", note: "FIN-SH" },
      ],
    },
    priority: {
      endpoint: "GET /charm/value-help?field=priority",
      values: [
        { code: "P1", label: "紧急" },
        { code: "P2", label: "常规" },
        { code: "P3", label: "低" },
      ],
    },
  };

  function tplOpt(code, label) {
    return { code: code, label: label || code };
  }
  function tplField(key, name, type, source, def, options) {
    return { key: key, name: name, type: type, source: source, defaultValue: def || "", options: options || [] };
  }
  function tplClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* 平台基础字段 v2：所有小组共享 */
  function baseSchemaV2() {
    return [
      tplField("applyDate", "申请日期", "date", "default", "今天"),
      tplField("applicant", "申请人", "user", "currentUser", "当前账号"),
      tplField("changeType", "类型分组", "select", "charmApi", "FIN_CHANGE", [
        tplOpt("FIN_CHANGE", "财务常规变更"),
        tplOpt("FIN_EMERGENCY", "财务紧急变更"),
      ]),
      tplField("targetSystem", "目标系统", "select", "charmApi", "FY2-200", [
        tplOpt("FY2-200", "FY2 · 200 开发"),
        tplOpt("FY2-300", "FY2 · 300 测试"),
      ]),
      tplField("description", "文本描述", "textarea", "autoFromDemand", "需求摘要自动带入"),
      tplField("requestNo", "请求号", "text", "apiGenerated", "POST /request-number"),
      tplField("attachment", "附件", "file", "apiGenerated", "上线文档 + 测试证据"),
      tplField("priority", "优先级", "select", "default", "P2", [
        tplOpt("P1", "紧急"),
        tplOpt("P2", "常规"),
        tplOpt("P3", "低"),
      ]),
    ];
  }
  function baseSchemaV1() {
    return [
      tplField("applyDate", "申请日期", "date", "default", "今天"),
      tplField("applicant", "申请人", "user", "currentUser", "当前账号"),
      tplField("changeType", "类型分组", "select", "charmApi", "FIN_CHANGE", [tplOpt("FIN_CHANGE", "财务常规变更")]),
      tplField("description", "文本描述", "textarea", "autoFromDemand", "需求摘要自动带入"),
      tplField("requestNo", "请求号", "text", "apiGenerated", "POST /request-number"),
    ];
  }
  /* 财务共享组：基础字段 + 组内定制字段 */
  function finSchemaV3() {
    return baseSchemaV2().concat([
      tplField("transport", "传输请求", "text", "manual", "从 ChaRM 拉取"),
      tplField("approver", "业务审批人", "select", "charmApi", "lin.hua", [
        tplOpt("lin.hua", "林桦 · 财务顾问"),
        tplOpt("wang.li", "王栎 · IT 主管"),
      ]),
    ]);
  }
  function finSchemaV2() {
    return baseSchemaV2().concat([tplField("transport", "传输请求", "text", "manual", "从 ChaRM 拉取")]);
  }
  function finSchemaV1() {
    return baseSchemaV1().concat([
      tplField("transport", "传输请求", "text", "manual", "从 ChaRM 拉取"),
      tplField("approver", "业务审批人", "select", "charmApi", "lin.hua", [tplOpt("lin.hua", "林桦 · 财务顾问")]),
    ]);
  }
  function blankSchema() {
    return [
      tplField("applyDate", "申请日期", "date", "default", "今天"),
      tplField("applicant", "申请人", "user", "currentUser", "当前账号"),
      tplField("changeType", "类型分组", "select", "charmApi", "FIN_CHANGE", [tplOpt("FIN_CHANGE", "财务常规变更")]),
      tplField("priority", "优先级", "select", "default", "P2", [tplOpt("P1", "紧急"), tplOpt("P2", "常规")]),
    ];
  }

  const BASE_TEMPLATES = [
    {
      id: "base-crq",
      scope: "base",
      name: "平台基础 · CRQ 标准字段",
      versions: [
        {
          id: "b-v2",
          version: "v2",
          status: "已发布",
          date: "2026-10-08",
          updated: "2026-10-08 11:20",
          owner: "平台管理员",
          used: 45,
          desc: "所有小组共享的 CRQ 基础字段与来源；小组模板只覆盖差异部分。",
          schema: baseSchemaV2(),
        },
        {
          id: "b-v1",
          version: "v1",
          status: "已归档",
          date: "2026-06-16",
          updated: "2026-06-16 09:40",
          owner: "平台管理员",
          used: 32,
          desc: "初版基础字段。",
          schema: baseSchemaV1(),
        },
      ],
    },
  ];

  const GROUP_TEMPLATES = [
    {
      id: "fin-std",
      scope: "group",
      name: "财务共享 · 标准变更",
      versions: [
        {
          id: "fin-v3",
          version: "v3",
          status: "已发布",
          date: "2026-11-04",
          updated: "2026-11-04 14:20",
          owner: "王栎",
          used: 24,
          desc: "适用于 FIN 模块的常规变更，包含 CRQ 与 ChaRM 联动字段。",
          schema: finSchemaV3(),
        },
        {
          id: "fin-v2",
          version: "v2",
          status: "已归档",
          date: "2026-09-18",
          updated: "2026-09-18 10:05",
          owner: "王栎",
          used: 41,
          desc: "旧版本，仅保留用于历史工单复现。",
          schema: finSchemaV2(),
        },
        {
          id: "fin-v1",
          version: "v1",
          status: "已归档",
          date: "2026-06-02",
          updated: "2026-06-02 16:31",
          owner: "林桦",
          used: 18,
          desc: "初版模板。",
          schema: finSchemaV1(),
        },
      ],
    },
  ];

  function currentTplVersion(tpl) {
    return tpl.versions.filter(function (v) { return v.status === "已发布"; })[0] || tpl.versions[0];
  }
  function tplTemplateList(scope) {
    return scope === "base" ? BASE_TEMPLATES : GROUP_TEMPLATES;
  }
  function resolveTplState(query) {
    const canBase = SA.auth.can("crq.templates.base");
    const scope = canBase && query.get("scope") === "base" ? "base" : "group";
    const templates = tplTemplateList(scope);
    const wanted = query.get("tpl");
    const tpl = templates.filter(function (t) { return t.id === wanted; })[0] || templates[0];
    const current = currentTplVersion(tpl);
    const wantedVersion = query.get("v");
    const ver = tpl.versions.filter(function (v) { return v.id === wantedVersion; })[0] || current;
    return { scope: scope, templates: templates, tpl: tpl, current: current, ver: ver };
  }
  function tplHash(scope, tpl, ver, extra) {
    const params = new URLSearchParams();
    if (scope === "base") params.set("scope", "base");
    params.set("tpl", tpl.id);
    params.set("v", ver.id);
    Object.keys(extra || {}).forEach(function (k) { params.set(k, extra[k]); });
    return "#/tools/crq/templates?" + params.toString();
  }
  function tplSourcePill(field) {
    const meta = TPL_SOURCE[field.source] || TPL_SOURCE.default;
    return '<span class="tpl-field__source tpl-field__source--' + meta.cls + '">' + meta.label + "</span>";
  }
  function tplOptionsSummary(field) {
    if (!field.options.length) return SA.h(field.defaultValue || "—");
    const hit = field.options.filter(function (o) { return o.code === field.defaultValue; })[0];
    return SA.h((hit ? hit.code : field.defaultValue || "—") + " · " + field.options.length + " 个选项");
  }
  function tplNewVersion(tpl, publish) {
    const nextNum =
      tpl.versions.reduce(function (max, v) {
        return Math.max(max, parseInt(String(v.version).replace(/^v/, ""), 10) || 0);
      }, 0) + 1;
    return {
      id: tpl.id + "-v" + nextNum + "-" + Date.now().toString(36),
      version: "v" + nextNum,
      status: publish ? "已发布" : "草稿",
      date: TPL_TODAY,
      updated: TPL_NOW,
      owner: SA.data.user.name,
      used: 0,
      desc: "",
      schema: [],
    };
  }

  /* ---------------- 编辑模板：选项维护 + ChaRM 拉取 ---------------- */
  function openTplEditor(state, opts) {
    opts = opts || {};
    if (!SA.auth.can("crq.templates.manage")) return;
    const tpl = state.tpl;
    const baseVer = state.ver;
    const canBase = state.scope === "base";
    const draft = {
      name: tpl.name,
      desc: baseVer.desc,
      schema: tplClone(baseVer.schema),
    };
    const openPulls = {};
    const loaded = {};
    let flashKey = "";

    function pullHelp(field) {
      return (
        CHARM_VALUE_HELP[field.key] || {
          endpoint: "GET /charm/value-help?field=" + field.key,
          values: [],
        }
      );
    }
    function findField(key) {
      return draft.schema.filter(function (f) { return f.key === key; })[0];
    }

    function optionChip(field, option) {
      const isDefault = option.code === field.defaultValue;
      return (
        '<button type="button" class="opt-chip' + (isDefault ? " is-default" : "") +
        '" data-opt-chip="' + field.key + ":" + option.code +
        '" title="' + SA.h(option.label || option.code) + "（点击设为默认值）" + '">' +
        SA.h(option.code) + (isDefault ? "<em>默认</em>" : "") +
        "</button>"
      );
    }

    function pullPanel(field) {
      const help = pullHelp(field);
      if (!loaded[field.key]) {
        return '<div class="charm-pull"><div class="charm-pull__loading"><i class="spinner"></i> 正在从 ChaRM 拉取值列表…</div></div>';
      }
      const rows = help.values
        .map(function (value) {
          const added = field.options.some(function (o) { return o.code === value.code; });
          return (
            '<label class="charm-pull__row' + (added ? " is-added" : "") + '">' +
            (added
              ? '<span class="charm-pull__added">' + ic("check") + "</span>"
              : '<input type="checkbox" value="' + SA.h(value.code) + '" />') +
            '<span class="mono">' + SA.h(value.code) + "</span>" +
            '<span class="sm">' + SA.h(value.label) + "</span>" +
            '<span class="grow"></span>' +
            (added
              ? '<span class="tag tag--teal">已添加</span>'
              : value.note
              ? '<span class="tag">' + SA.h(value.note) + "</span>"
              : "") +
            "</label>"
          );
        })
        .join("");
      return (
        '<div class="charm-pull">' +
        '<div class="charm-pull__head">' + ic("sync") + "<b>ChaRM 值列表</b>" +
        '<span class="mono">' + SA.h(help.endpoint) + "</span></div>" +
        '<div class="charm-pull__rows">' + (rows || '<div class="opt-empty">ChaRM 未返回可选值</div>') + "</div>" +
        '<div class="charm-pull__foot">' +
        '<span class="sm" data-pull-count>已选 0 项</span><span class="grow"></span>' +
        '<button type="button" class="btn btn--sm" data-pull-close="' + field.key + '">收起</button>' +
        '<button type="button" class="btn btn--sm btn--blue" data-pull-add="' + field.key + '" disabled>添加到选项</button>' +
        "</div></div>"
      );
    }

    function optionEditor(field) {
      const chips = field.options.map(function (option) { return optionChip(field, option); }).join("");
      let pull = "";
      if (openPulls[field.key]) pull = pullPanel(field);
      return (
        '<div class="ed-opt" data-opt-block="' + field.key + '">' +
        '<div class="ed-opt__head"><b>' + SA.h(field.name) + "</b>" + tplSourcePill(field) +
        '<span class="grow"></span><span class="sm">' + field.options.length + " 个选项</span></div>" +
        '<div class="ed-opt__chips"' + (flashKey === field.key ? ' data-flash="1"' : "") + ">" +
        (chips || '<span class="opt-empty">暂无选项</span>') +
        '<button type="button" class="opt-chip opt-chip--add" data-pull-open="' + field.key + '">' +
        ic("plus") + " 从 ChaRM 拉取</button>" +
        "</div>" +
        pull +
        "</div>"
      );
    }

    function bodyHtml() {
      const selectFields = draft.schema.filter(function (f) { return f.type === "select"; });
      return (
        '<div class="drawer-block">' +
        '<div class="drawer-block__head">基本信息 <span class="sm">基于 ' + SA.h(baseVer.version) + "</span></div>" +
        '<div class="field"><span class="field__label">模板名称</span><input class="input" id="tpl-name-input" value="' + SA.h(draft.name) + '" /></div>' +
        '<div class="field" style="margin-top:10px"><span class="field__label">说明</span><textarea class="textarea" id="tpl-desc-input" rows="2">' + SA.h(draft.desc) + "</textarea></div>" +
        "</div>" +
        '<div class="drawer-block">' +
        '<div class="drawer-block__head">下拉选项 <span class="sm">来自 ChaRM 值列表 · 点击选项设为默认值</span></div>' +
        selectFields.map(optionEditor).join("") +
        "</div>" +
        '<div class="callout callout--blue">' + ic("info") +
        "<span>其它字段由接口 / 需求自动填充。保存生成新草稿版本；发布后当前版本自动归档。</span></div>"
      );
    }

    function paint(keepScroll) {
      const body = document.getElementById("detail-body");
      if (!body) return;
      const scroll = keepScroll === false ? 0 : body.scrollTop;
      body.innerHTML = bodyHtml();
      body.scrollTop = scroll;
      bind();
      flashKey = "";
    }

    function syncPullFoot(key) {
      const block = document.querySelector('[data-opt-block="' + key + '"]');
      if (!block) return;
      const picked = block.querySelectorAll(".charm-pull__row input:checked:not(:disabled)");
      const count = block.querySelector("[data-pull-count]");
      if (count) count.textContent = "已选 " + picked.length + " 项";
      const addBtn = block.querySelector("[data-pull-add]");
      if (addBtn) addBtn.disabled = picked.length === 0;
    }

    function loadPull(key) {
      openPulls[key] = true;
      if (loaded[key]) {
        paint();
        return;
      }
      if (SA.isShot) {
        loaded[key] = true;
        paint();
        return;
      }
      paint();
      SA.sequence(function () {
        if (!openPulls[key] || !document.querySelector('[data-opt-block="' + key + '"]')) return;
        loaded[key] = true;
        paint();
      }, 650);
    }

    function bind() {
      const body = document.getElementById("detail-body");
      if (!body) return;
      const nameInput = body.querySelector("#tpl-name-input");
      if (nameInput) nameInput.addEventListener("input", function () { draft.name = nameInput.value; });
      const descInput = body.querySelector("#tpl-desc-input");
      if (descInput) descInput.addEventListener("input", function () { draft.desc = descInput.value; });

      body.querySelectorAll("[data-opt-chip]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          const parts = chip.dataset.optChip.split(":");
          const field = findField(parts[0]);
          if (!field) return;
          field.defaultValue = parts.slice(1).join(":");
          flashKey = field.key;
          paint();
        });
      });

      body.querySelectorAll("[data-pull-open]").forEach(function (btn) {
        btn.addEventListener("click", function () { loadPull(btn.dataset.pullOpen); });
      });

      body.querySelectorAll("[data-pull-close]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          delete openPulls[btn.dataset.pullClose];
          paint();
        });
      });

      body.querySelectorAll(".charm-pull__row input").forEach(function (input) {
        input.addEventListener("change", function () {
          const block = input.closest("[data-opt-block]");
          if (block) syncPullFoot(block.dataset.optBlock);
        });
      });

      body.querySelectorAll(".charm-pull__row").forEach(function (row) {
        const input = row.querySelector("input");
        if (!input) return;
        row.addEventListener("click", function (event) {
          if (event.target === input || input.disabled) return;
          event.preventDefault();
          input.checked = !input.checked;
          const block = input.closest("[data-opt-block]");
          if (block) syncPullFoot(block.dataset.optBlock);
        });
      });

      body.querySelectorAll("[data-pull-add]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const field = findField(btn.dataset.pullAdd);
          if (!field) return;
          const block = document.querySelector('[data-opt-block="' + field.key + '"]');
          if (!block) return;
          const help = pullHelp(field);
          let added = 0;
          block.querySelectorAll(".charm-pull__row input:checked:not(:disabled)").forEach(function (input) {
            const code = input.value;
            if (field.options.some(function (o) { return o.code === code; })) return;
            const meta = help.values.filter(function (v) { return v.code === code; })[0] || {};
            field.options.push(tplOpt(code, meta.label));
            added += 1;
          });
          if (!field.defaultValue && field.options.length) {
            const first = field.options[field.options.length - added];
            if (first) field.defaultValue = first.code;
          }
          flashKey = field.key;
          paint();
          if (added) SA.toast("已从 ChaRM 添加 " + added + " 个选项", { icon: "check-circle" });
        });
      });

      const flashChips = body.querySelector('.ed-opt__chips[data-flash="1"]');
      if (flashChips) {
        const mark = flashChips.querySelector(".opt-chip.is-default") || flashChips;
        mark.classList.add("anim-scale");
      }
    }

    function commit(publish) {
      const nameInput = document.getElementById("tpl-name-input");
      const descInput = document.getElementById("tpl-desc-input");
      if (nameInput && nameInput.value.trim()) draft.name = nameInput.value.trim();
      if (descInput) draft.desc = descInput.value.trim();
      const next = tplNewVersion(tpl, publish);
      next.schema = tplClone(draft.schema);
      next.desc = draft.desc || baseVer.desc;
      if (publish) {
        tpl.versions.forEach(function (v) { if (v.status === "已发布") v.status = "已归档"; });
      }
      tpl.versions.unshift(next);
      tpl.name = draft.name || tpl.name;
      SA.closeOverlays();
      SA.go(tplHash(state.scope, tpl, next));
      SA.toast(publish ? "已发布 " + next.version + "，旧版本自动归档" : "已保存草稿 " + next.version, {
        icon: publish ? "check-circle" : "file",
      });
    }

    const actions = [{ label: "取消", variant: "ghost" }];
    if (SA.auth.can("crq.templates.manage")) {
      actions.push({ label: "保存草稿", onClick: function () { commit(false); } });
      actions.push({ label: "发布新版本", variant: "primary", onClick: function () { commit(true); } });
    }
    SA.drawer({
      title: "编辑模板 · " + tpl.name,
      sub: (canBase ? "平台基础模板" : SA.data.user.group + " · 本组模板") + " · 基于 " + baseVer.version,
      body: bodyHtml(),
      actions: actions,
    });
    bind();

    // 深链：截图 / 分享用 ?edit=1&pull=changeType 直接展开 ChaRM 值列表
    if (opts.pull && CHARM_VALUE_HELP[opts.pull]) {
      loadPull(opts.pull);
    }
  }

  /* ---------------- 预览表单 ---------------- */
  function openTplFormPreview(state) {
    const tpl = state.tpl;
    const ver = state.ver;
    const rows = ver.schema
      .map(function (field) {
        let control = "";
        if (field.type === "select") {
          control =
            '<select class="select">' +
            field.options
              .map(function (o) {
                return '<option' + (o.code === field.defaultValue ? " selected" : "") + ">" +
                  SA.h(o.code) + " · " + SA.h(o.label || o.code) + "</option>";
              })
              .join("") +
            "</select>";
        } else if (field.type === "textarea") {
          control = '<textarea class="textarea" rows="2" placeholder="' + SA.h(field.defaultValue || "") + '"></textarea>';
        } else if (field.type === "date") {
          control = '<input class="input" value="' + TPL_TODAY + '" readonly />';
        } else if (field.type === "user") {
          control = '<input class="input" value="' + SA.h(SA.data.user.name) + '" readonly />';
        } else if (field.type === "file") {
          control = '<div class="fp-file">' + ic("paperclip") + SA.h(field.defaultValue || "未选择文件") + "</div>";
        } else {
          control = '<input class="input" placeholder="' + SA.h(field.defaultValue || "自动填充") + '" />';
        }
        return '<div class="fp-row"><span>' + SA.h(field.name) + tplSourcePill(field) + "</span>" + control + "</div>";
      })
      .join("");
    SA.modal({
      title: "表单预览 · " + tpl.name + " " + ver.version,
      desc: "按当前模板生成；下拉选项来自 ChaRM 值列表，提交时写入 CRQ 创建编排。",
      wide: true,
      body: '<div class="form-preview">' + rows + "</div>",
      actions: [{ label: "关闭", variant: "primary" }],
    });
  }

  /* ---------------- 发布草稿 ---------------- */
  function openTplPublish(state) {
    const ver = state.ver;
    const optionCount = ver.schema.reduce(function (n, f) { return n + (f.options ? f.options.length : 0); }, 0);
    SA.modal({
      title: "发布 " + ver.version + " 版本",
      desc: "版本发布后不可修改；已创建工单仍使用创建时的版本。",
      body:
        '<div class="confirm-list">' +
        '<div class="confirm-row"><span class="ok">' + ic("check") + "</span>" + ver.schema.length + " 个字段 · " + optionCount + " 个下拉选项</div>" +
        '<div class="confirm-row"><span class="ok">' + ic("check") + "</span>下拉选项来自 ChaRM 值列表</div>" +
        '<div class="confirm-row"><span class="warn">' + ic("alert-triangle") + "</span>发布后当前版本自动归档</div>" +
        "</div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "确认发布",
          variant: "primary",
          onClick: function () {
            state.tpl.versions.forEach(function (v) { if (v.status === "已发布") v.status = "已归档"; });
            ver.status = "已发布";
            SA.go(tplHash(state.scope, state.tpl, ver));
            SA.toast("已发布 " + ver.version + "，旧版本自动归档", { icon: "check-circle" });
          },
        },
      ],
    });
  }

  /* ---------------- 新建 / 复制模板 ---------------- */
  function openTplCreate(state, copyFrom) {
    const isBase = state.scope === "base";
    const baseVer = currentTplVersion(BASE_TEMPLATES[0]);
    const nameDefault = copyFrom ? copyFrom.tpl.name + " · 副本" : (isBase ? "平台基础" : SA.data.user.group) + " · 新模板";
    const desc = copyFrom
      ? "以当前版本为起点创建新模板，副本从草稿 v1 开始，不影响原模板。"
      : isBase
      ? "平台基础模板对全部小组生效；新建后为草稿 v1。"
      : "新建模板归属本组，其他小组不可见；未覆盖字段继承平台基础模板。";
    SA.modal({
      title: copyFrom ? "复制模板" : "新建模板",
      desc: desc,
      body:
        '<div class="field"><span class="field__label">模板名称</span><input class="input" id="new-tpl-name" value="' + SA.h(nameDefault) + '" /></div>' +
        (isBase
          ? ""
          : '<div class="field" style="margin-top:12px"><span class="field__label">基于</span>' +
            '<select class="select" id="new-tpl-base">' +
            '<option value="base">平台基础模板 · ' + SA.h(baseVer.version) + "</option>" +
            '<option value="blank">空白模板</option>' +
            "</select></div>"),
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "创建草稿",
          variant: "primary",
          onClick: function () {
            const nameInput = document.getElementById("new-tpl-name");
            const name = (nameInput && nameInput.value.trim()) || nameDefault;
            const basedOnBase = !copyFrom && !isBase && document.getElementById("new-tpl-base").value === "base";
            let schema;
            if (copyFrom) schema = tplClone(state.ver.schema);
            else if (isBase || basedOnBase) schema = tplClone(baseVer.schema);
            else schema = blankSchema();
            const next = {
              id: "tpl-" + Date.now().toString(36) + "-v1",
              version: "v1",
              status: "草稿",
              date: TPL_TODAY,
              updated: TPL_NOW,
              owner: SA.data.user.name,
              used: 0,
              desc: copyFrom ? state.ver.desc : "新建模板",
              schema: schema,
            };
            const created = { id: next.id, scope: state.scope, name: name, versions: [next] };
            (isBase ? BASE_TEMPLATES : GROUP_TEMPLATES).unshift(created);
            SA.go(tplHash(state.scope, created, next));
            SA.toast((copyFrom ? "已复制为 " : "已创建 ") + name + " 草稿 v1", { icon: "copy" });
          },
        },
      ],
    });
  }

  SA.register("crq-templates", {
    title: "CRQ 模板",
    render(ctx) {
      const state = resolveTplState(ctx.query);
      const canManage = SA.auth.can("crq.templates.manage");
      const canBase = SA.auth.can("crq.templates.base");
      const isBase = state.scope === "base";
      const tpl = state.tpl;
      const ver = state.ver;
      const current = state.current;
      const baseVer = currentTplVersion(BASE_TEMPLATES[0]);
      const selectFields = ver.schema.filter(function (f) { return f.type === "select"; });
      const scopePill = isBase
        ? '<span class="pill pill--violet">' + ic("shield") + " 平台基础 · 对全部小组生效</span>"
        : '<span class="pill pill--outline">' + ic("users") + " " + SA.h(SA.data.user.group) + " · " + SA.data.user.groupKey + "</span>";
      return `
      <div class="page page-templates">
        <a class="back-link" href="#/tools/crq">${ic("arrow-left")} CRQ 工单</a>
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">CRQ TEMPLATES · 模板管理</div>
            <div class="page-head__title"><h1>CRQ 模板</h1></div>
            <p class="page-head__desc">模板按小组维护、版本不可变；下拉选项与默认值可从 ChaRM 拉取。其他小组的模板不可见。</p>
          </div>
          <div class="page-head__actions">
            ${canManage ? '<button class="btn" data-action="tpl-copy">' + ic("copy") + ' 复制模板</button><button class="btn btn--primary" data-action="tpl-new">' + ic("plus") + " 新建模板</button>" : ""}
          </div>
        </div>

        ${
          canManage
            ? ""
            : '<div class="readonly-bar">' + ic("eye") + "<span><b>只读</b>模板由本组小组管理员维护" + (isBase ? "，平台基础模板由平台管理员维护。" : "；其他小组的模板不可见。") + "</span></div>"
        }

        <div class="toolbar tpl-toolbar">
          <div class="segmented view-switch tpl-scope" role="group" aria-label="模板范围">
            <button data-scope="group" class="${isBase ? "" : "is-active"}">${ic("users")} 本组模板</button>
            ${canBase ? '<button data-scope="base" class="' + (isBase ? "is-active" : "") + '">' + ic("shield") + " 平台基础模板</button>" : ""}
          </div>
          <span class="grow"></span>
          ${scopePill}
        </div>

        <div class="tpl-layout">
          <aside class="tpl-templates card">
            <div class="tpl-templates__head">${isBase ? "平台基础模板" : "本组模板"}</div>
            ${state.templates
              .map(function (item) {
                const itemCurrent = currentTplVersion(item);
                return (
                  '<button class="tpl-template' + (item.id === tpl.id ? " is-active" : "") + '" data-tpl="' + item.id + '">' +
                  '<span class="group-switch__icon">' + (isBase ? "BASE" : SA.data.user.groupKey.split("-")[0]) + "</span>" +
                  '<span class="grow"><b>' + SA.h(item.name) + "</b><em>" + item.versions.length + " 个版本 · " +
                    (itemCurrent.status === "已发布" ? "当前 " : "最新 ") + itemCurrent.version + "</em></span>" +
                  '<span class="tpl-template__count">' + itemCurrent.used + "</span>" +
                  "</button>"
                );
              })
              .join("")}
            <div class="tpl-templates__foot">
              <div>${ic(isBase ? "info" : "lock")}<span>${
                isBase
                  ? "基础模板对全部小组生效，小组模板只覆盖差异字段。"
                  : "只显示本组模板；未覆盖字段继承平台基础模板 " + baseVer.version + "。"
              }</span></div>
            </div>
          </aside>

          <section class="tpl-list card">
            <div class="card-head"><h3>${SA.h(tpl.name)}</h3><span class="sm">共 ${tpl.versions.length} 个版本</span></div>
            <div class="tpl-rows">
              ${tpl.versions
                .map(function (v) {
                  const statusTag =
                    v.status === "已发布"
                      ? '<span class="tag tag--teal">当前发布</span>'
                      : v.status === "草稿"
                      ? '<span class="tag tag--amber">草稿未发布</span>'
                      : '<span class="tag">已归档</span>';
                  return (
                    '<button class="tpl-row' + (v.id === ver.id ? " is-active" : "") + '" data-ver="' + v.id + '" title="' + SA.h(v.status) + '">' +
                    '<span class="tpl-row__version mono">' + v.version + "</span>" +
                    '<span class="tpl-row__main"><b>' + statusTag + "</b><em>" + v.schema.length + " 个字段 · 已被 " + v.used + " 个工单使用 · " + v.updated + "</em></span>" +
                    '<span class="tpl-row__owner">' + SA.h(v.owner) + "</span>" +
                    "</button>"
                  );
                })
                .join("")}
            </div>
            <div class="table-foot"><span class="sm">版本创建后不可修改字段顺序，发布后会生成新的 schema 快照。</span></div>
          </section>

          <section class="tpl-preview card">
            <div class="tpl-preview__head">
              <div>
                <div class="row gap-2">
                  <span class="mono tpl-preview__version">${ver.version}</span>
                  ${ver.status === "已发布" ? '<span class="tag tag--teal">当前发布</span>' : ver.status === "草稿" ? '<span class="tag tag--amber">草稿</span>' : '<span class="tag">已归档</span>'}
                  <span class="tag">${ver.date}</span>
                  ${isBase ? '<span class="tag tag--violet">平台基础</span>' : ""}
                </div>
                <h2>${SA.h(tpl.name)}</h2>
                <p class="sm">${SA.h(ver.desc)}</p>
              </div>
              ${canManage ? '<button class="btn btn--sm" data-action="tpl-edit">' + ic("edit") + " 编辑模板</button>" : ""}
            </div>
            <div class="tpl-fields">
              <div class="tpl-fields__head"><span>字段</span><span>类型</span><span>来源</span><span>默认值 / 说明</span></div>
              ${ver.schema
                .map(
                  (field) =>
                    '<div class="tpl-field">' +
                    '<span class="tpl-field__name">' + SA.h(field.name) + "</span>" +
                    '<span class="tpl-field__type mono">' + field.type + "</span>" +
                    tplSourcePill(field) +
                    '<span class="tpl-field__default">' + tplOptionsSummary(field) + "</span>" +
                    "</div>"
                )
                .join("")}
            </div>
            <div class="tpl-preview__foot">
              ${
                selectFields.length
                  ? '<div class="tpl-options"><span class="tpl-options__head">下拉选项 · ' + selectFields.length + " 个字段 · 来自 ChaRM</span>" +
                    selectFields
                      .map(function (field) {
                        return (
                          '<div class="tpl-options__row"><span>' + SA.h(field.name) + "</span>" +
                          '<span class="tpl-options__chips">' +
                          field.options
                            .map(function (o) {
                              return '<span' + (o.code === field.defaultValue ? ' class="is-default"' : "") + ">" + SA.h(o.code) + "</span>";
                            })
                            .join("") +
                          "</span></div>"
                        );
                      })
                      .join("") +
                    "</div>"
                  : ""
              }
              <div class="tpl-preview__actions">
                <button class="btn" data-action="tpl-preview">${ic("eye")} 预览表单</button>
                ${canManage && ver.status === "草稿" ? '<button class="btn btn--primary" data-action="tpl-publish">' + ic("upload") + " 发布新版本</button>" : ""}
              </div>
            </div>
          </section>
        </div>
      </div>`;
    },
    after(ctx, root) {
      const state = resolveTplState(ctx.query);
      root.querySelectorAll("[data-scope]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.dataset.scope === state.scope) return;
          SA.go("#/tools/crq/templates" + (btn.dataset.scope === "base" ? "?scope=base" : ""));
        });
      });
      root.querySelectorAll("[data-tpl]").forEach(function (el) {
        el.addEventListener("click", function () {
          const tpl = state.templates.filter(function (t) { return t.id === el.dataset.tpl; })[0];
          if (!tpl || tpl.id === state.tpl.id) return;
          SA.go(tplHash(state.scope, tpl, currentTplVersion(tpl)));
        });
      });
      root.querySelectorAll("[data-ver]").forEach(function (el) {
        el.addEventListener("click", function () {
          const ver = state.tpl.versions.filter(function (v) { return v.id === el.dataset.ver; })[0];
          if (!ver || ver.id === state.ver.id) return;
          SA.go(tplHash(state.scope, state.tpl, ver));
        });
      });
      const on = function (action, handler) {
        const el = root.querySelector('[data-action="' + action + '"]');
        if (el) el.addEventListener("click", handler);
      };
      on("tpl-copy", function () { openTplCreate(state, { tpl: state.tpl }); });
      on("tpl-new", function () { openTplCreate(state, null); });
      on("tpl-edit", function () { openTplEditor(state, {}); });
      on("tpl-preview", function () { openTplFormPreview(state); });
      on("tpl-publish", function () { openTplPublish(state); });
      if (ctx.query.get("edit") === "1" || ctx.query.get("pull")) {
        openTplEditor(state, { pull: ctx.query.get("pull") || "" });
      }
    },
  });
})();
