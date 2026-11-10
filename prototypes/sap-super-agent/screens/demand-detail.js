/* ============================================================
   Screen · Demand detail (stages, docs, gates, integrations)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const STAGES = ["需求澄清", "功能设计", "技术设计", "技术开发", "测试", "上线"];

  const DOCS = [
    {
      stage: "需求澄清",
      idx: 0,
      kind: "需求分析",
      icon: "file-text",
      title: "需求分析文档",
      version: "v3",
      status: "已通过",
      tone: "green",
      author: "AI 生成 · 林桦 确认",
      time: "11-06 15:20",
      gate: "G1 已通过",
      excerpt: "明确预算校验触发点、数据来源与超预算后的审批路径；包含 6 条验收标准与 3 个边界场景。",
      reviewable: true,
    },
    {
      stage: "功能设计",
      idx: 1,
      kind: "功能设计",
      icon: "layers",
      title: "功能设计说明",
      version: "v2",
      status: "待确认",
      tone: "amber",
      author: "AI 生成 · 林桦 修订",
      time: "今天 09:18",
      gate: "G1 待确认",
      excerpt: "定义采购申请保存时的校验时序、审批人推导规则与 UI 提示文案；含 2 个未决问题。",
      reviewable: true,
      active: true,
    },
    {
      stage: "技术设计",
      idx: 2,
      kind: "技术设计",
      icon: "cpu",
      title: "技术设计说明",
      version: "v1 草稿",
      status: "生成中 64%",
      tone: "teal",
      author: "Super Agent · deepseek-v4",
      time: "09:42 开始",
      gate: "G3 待评审",
      excerpt: "正在分析 BAPI 调用链与 BW 取数逻辑，预计 1 分钟内生成初稿。",
      generating: true,
    },
    {
      stage: "技术开发",
      idx: 3,
      kind: "开发实现",
      icon: "code",
      title: "代码变更与传输",
      version: "—",
      status: "未开始",
      tone: "slate",
      author: "等待技术设计通过",
      time: "",
      gate: "G3 开发评审",
      excerpt: "任务将在技术设计通过后自动创建，并派发给在线开发者。",
    },
    {
      stage: "测试",
      idx: 4,
      kind: "测试文档",
      icon: "check-square",
      title: "测试用例与执行证据",
      version: "—",
      status: "未开始",
      tone: "slate",
      author: "等待开发完成",
      time: "",
      gate: "G4 业务验收",
      excerpt: "由 AI 基于验收标准生成测试用例，开发者在 VSCode 执行并回写证据。",
    },
    {
      stage: "上线",
      idx: 5,
      kind: "上线文档",
      icon: "upload",
      title: "上线方案与回滚",
      version: "—",
      status: "未开始",
      tone: "slate",
      author: "等待测试通过",
      time: "",
      gate: "上线审批",
      excerpt: "汇总传输清单、上线窗口、影响对象与回滚步骤，提交 CRQ 审批。",
    },
  ];

  function docCard(d) {
    return `
      <a class="doc-card ${d.active ? "doc-card--active" : ""} ${d.generating ? "doc-card--generating" : ""}" href="${d.reviewable ? "#/demands/R-2041/doc/" + (d.idx === 0 ? "requirement-analysis" : d.idx === 1 ? "functional-design" : "tech-design") : "#/demands/R-2041"}">
        <div class="doc-card__top">
          <span class="doc-card__stage"><span class="doc-card__icon doc-card__icon--${d.tone}">${ic(d.icon)}</span>${d.stage}</span>
          <span class="pill pill--${d.tone}"><span class="dot"></span>${d.status}</span>
        </div>
        <div class="doc-card__title">${d.title}</div>
        <div class="doc-card__excerpt">${d.excerpt}</div>
        <div class="doc-card__foot">
          <span class="mono">${d.version}</span>
          <span class="doc-card__dot"></span>
          <span>${d.author}</span>
          ${d.time ? `<span class="grow"></span><span class="mono">${d.time}</span>` : ""}
        </div>
        ${d.generating ? '<div class="doc-card__progress"><span data-bar="64"></span></div>' : ""}
      </a>`;
  }

  SA.register("demand-detail", {
    title: "需求详情",
    render(ctx) {
      const id = ctx.params.id || "R-2041";
      const demand = SA.data.demands.find((d) => d.id === id) || SA.data.demands[0];
      const tab = ctx.query.get("tab") || "overview";
      return `
      <div class="page page-detail">
        <a class="back-link" href="#/demands">${ic("arrow-left")} 需求列表</a>

        <header class="detail-head">
          <div class="detail-head__main">
            <div class="detail-head__top">
              <span class="mono detail-head__id">${demand.id}</span>
              <span class="tag tag--mono">${demand.jira}</span>
              <span class="pill pill--${demand.statusTone}"><span class="dot"></span>${SA.h(demand.status)}</span>
              <span class="pill pill--outline">PDO 六阶段 · v4</span>
            </div>
            <h1>${SA.h(demand.title)}</h1>
            <div class="detail-head__meta">
              <span class="user-line"><span class="avatar avatar--sm" data-tone="ink">陈</span>陈曦 提交</span>
              <span class="meta-sep"></span>
              <span class="user-line"><span class="avatar avatar--sm" data-tone="teal">林</span>林桦 · 负责人</span>
              <span class="meta-sep"></span>
              <span>${ic("calendar")} 期望上线 ${demand.due}</span>
              <span class="meta-sep"></span>
              <span>${ic("flag")} ${demand.priority}优先级</span>
              <span class="meta-sep"></span>
              <span>${ic("git-branch")} 更新于 ${demand.updated}</span>
            </div>
          </div>
          <div class="detail-head__actions">
            ${SA.view === "business" ? "" : '<button class="btn" data-action="open-vscode">' + ic("monitor") + " 在 VSCode 打开</button>"}
            <a class="btn btn--primary" href="#/demands/${demand.id}/doc/functional-design">${ic("git-commit")} 确认功能设计 v2</a>
            <button class="icon-btn detail-more" data-action="detail-more">${ic("more-horizontal")}</button>
          </div>
        </header>

        <section class="detail-stepper card">
          ${STAGES.map((s, i) => {
            const done = i < demand.stageIndex;
            const current = i === demand.stageIndex;
            const docs = DOCS[i];
            return `
            <div class="detail-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}">
              <div class="detail-step__rail"><span class="detail-step__node">${done ? ic("check") : current ? '<i></i>' : i + 1}</span></div>
              <div class="detail-step__body">
                <span class="detail-step__name">${s}</span>
                <span class="detail-step__sub">${docs.status === "未开始" ? "等待前序阶段" : done ? "已完成 · v" + (i === 0 ? "3" : "1") : current ? "进行中 · 门禁待确认" : "排队中"}</span>
              </div>
            </div>`;
          }).join("")}
        </section>

        <div class="tabs detail-tabs" role="tablist">
          <button class="tab ${tab === "overview" ? "is-active" : ""}" data-detail-tab="overview">概览</button>
          <button class="tab ${tab === "docs" ? "is-active" : ""}" data-detail-tab="docs">过程文档 <span class="count">6</span></button>
          <button class="tab ${tab === "activity" ? "is-active" : ""}" data-detail-tab="activity">活动 <span class="count">12</span></button>
          <button class="tab ${tab === "files" ? "is-active" : ""}" data-detail-tab="files">附件 <span class="count">2</span></button>
          <button class="tab ${tab === "queue" ? "is-active" : ""}" data-detail-tab="queue">队列与集成 <span class="count">3</span></button>
          <span class="grow"></span>
          <button class="tab detail-tabs__watch">${ic("bell")} 关注</button>
        </div>

        <div class="detail-layout">
          <div class="detail-main">
            <!-- overview -->
            <section class="detail-panel" data-panel="overview" ${tab !== "overview" ? "hidden" : ""}>
              <div class="card ai-summary">
                <div class="ai-summary__head">
                  <span class="ai-summary__icon">${ic("sparkles")}</span>
                  <div class="grow">
                    <div class="ai-summary__title">需求摘要</div>
                    <div class="ai-summary__meta">基于需求描述、2 个附件与 4 篇知识库生成 · <span class="link" data-action="regenerate-summary">重新生成</span></div>
                  </div>
                  <span class="pill pill--teal"><span class="dot"></span>已确认</span>
                </div>
                <div class="ai-summary__body">
                  <p>采购申请在保存时按「申请部门 + 费用类科目」汇总预算占用，与 BW <code>ZBW_BUDGET</code> 视图比对。超预算申请允许提交，但进入现有采购申请审批链，审批人不变；预算数据缺失时只记录警告，不阻断提交。</p>
                  <div class="ai-summary__facts">
                    <span>${ic("target")} 6 条验收标准</span>
                    <span>${ic("alert-triangle")} 3 个边界场景</span>
                    <span>${ic("database")} 4 处知识库引用</span>
                    <span>${ic("user")} 3 个部门受影响</span>
                  </div>
                </div>
              </div>

              <div class="section-head">
                <h2>阶段文档</h2>
                <span class="sm">6 个阶段 · 已完成 1 份 · 1 份待确认</span>
              </div>
              <div class="doc-grid">
                ${DOCS.slice(0, 4).map(docCard).join("")}
              </div>

              <div class="detail-two">
                <section class="card">
                  <div class="card-head">
                    <h3>验收标准</h3>
                    <span class="sm mono">AI 覆盖 6/6</span>
                  </div>
                  <div class="card-body acceptance-list">
                    ${[
                      ["采购申请提交时展示部门预算余额与占用额度", true],
                      ["超预算时阻止直接生成采购订单，进入部门负责人审批", true],
                      ["预算校验结果写入审批日志，可按采购申请号追溯", true],
                      ["预算数据缺失时记录警告，不阻断提交", true],
                    ]
                      .map(
                        ([text, covered], i) => `
                      <div class="acceptance-item">
                        <span class="acceptance-item__n mono">0${i + 1}</span>
                        <span class="grow">${text}</span>
                        <span class="acceptance-item__cover ${covered ? "is-ok" : ""}">${covered ? ic("check") + "已覆盖" : "未覆盖"}</span>
                      </div>`
                      )
                      .join("")}
                  </div>
                </section>

                <section class="card">
                  <div class="card-head">
                    <h3>关联工单</h3>
                    <a class="link sm" href="#/tools/crq">全部 ${ic("arrow-right")}</a>
                  </div>
                  <div class="linked-tickets">
                    <a class="linked-ticket" href="#/tools/crq">
                      <span class="linked-ticket__icon linked-ticket__icon--blue">${ic("file-text")}</span>
                      <span class="grow"><b>CRQ-2026-0842</b><em>CRQ · 财务共享组模板 v3</em></span>
                      <span class="pill pill--amber"><span class="dot"></span>待审批</span>
                    </a>
                    <a class="linked-ticket" href="#/tools/charm">
                      <span class="linked-ticket__icon linked-ticket__icon--violet">${ic("git-branch")}</span>
                      <span class="grow"><b>CR-44102</b><em>ChaRM Change Request · FY2</em></span>
                      <span class="pill pill--green"><span class="dot"></span>Basis 已通过</span>
                    </a>
                    <a class="linked-ticket" href="#/demands">
                      <span class="linked-ticket__icon linked-ticket__icon--jira">${ic("trello")}</span>
                      <span class="grow"><b>SAP-1187</b><em>JIRA Issue · 同步于 2 分钟前</em></span>
                      <span class="pill pill--jira">已关联</span>
                    </a>
                  </div>
                </section>
              </div>
            </section>

            <!-- docs -->
            <section class="detail-panel" data-panel="docs" ${tab !== "docs" ? "hidden" : ""}>
              <div class="card">
                <div class="card-head"><h3>过程文档 · 按阶段</h3><span class="sm">版本链不可变 · 每次修改生成新版本</span></div>
                <div class="doc-timeline">
                  ${DOCS.map(
                    (d) => `
                    <div class="doc-timeline__row ${d.active ? "is-active" : ""}">
                      <span class="doc-timeline__stage">
                        <span class="doc-timeline__dot doc-timeline__dot--${d.tone}"></span>
                        ${d.stage}
                      </span>
                      <span class="doc-timeline__doc">
                        <b>${d.title}</b>
                        <em>${d.excerpt}</em>
                      </span>
                      <span class="doc-timeline__ver mono">${d.version}</span>
                      <span class="pill pill--${d.tone}"><span class="dot"></span>${d.status}</span>
                      <span class="doc-timeline__time mono">${d.time || "—"}</span>
                      <span class="doc-timeline__action">${d.reviewable ? `<a class="link sm" href="#/demands/R-2041/doc/functional-design">查看 ${ic("arrow-right")}</a>` : '<span class="sm">—</span>'}</span>
                    </div>`
                  ).join("")}
                </div>
              </div>
            </section>

            <!-- activity -->
            <section class="detail-panel" data-panel="activity" ${tab !== "activity" ? "hidden" : ""}>
              <div class="card">
                <div class="card-head"><h3>活动时间线</h3><span class="sm">事件不可变 · 可导出审计</span></div>
                <div class="card-body">
                  <div class="timeline">
                    ${[
                      ["amber", "git-commit", "功能设计 v2 进入 G1 门禁，等待陈曦确认", "09:18", "林桦 · 需求顾问"],
                      ["teal", "bot", "AI 完成技术设计资料检索，开始生成初稿", "09:42", "Super Agent · deepseek-v4"],
                      ["violet", "git-branch", "ChaRM CR-44102 通过 Basis 审批", "08:56", "王栎 · Basis"],
                      ["blue", "monitor", "周予 在 VSCode 中领取任务 T-8852", "08:41", "任务派发 · 工作区 z-fin"],
                      ["green", "check", "需求分析文档 v3 通过 G1 门禁", "昨天 15:20", "林桦 · 需求顾问"],
                    ]
                      .map(
                        ([tone, icon, title, time, who]) => `
                      <div class="timeline-item">
                        <span class="timeline__node timeline__node--${tone}">${ic(icon)}</span>
                        <span class="timeline__main">
                          <span class="timeline__title">${title}</span>
                          <span class="timeline__meta"><span class="mono">${time}</span><span>${who}</span></span>
                        </span>
                      </div>`
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </section>

            <!-- files -->
            <section class="detail-panel" data-panel="files" ${tab !== "files" ? "hidden" : ""}>
              <div class="card">
                <div class="card-head"><h3>附件</h3><button class="btn btn--sm">${ic("upload")} 上传</button></div>
                <div class="card-body">
                  <div class="file-row"><span class="file-row__icon">PDF</span><span class="file-row__meta"><span class="file-row__name">预算校验现状流程.pdf</span><span class="file-row__size">1.8 MB · 陈曦 上传于 11-05</span></span><span class="pill pill--outline">原始附件</span><button class="icon-btn icon-btn--sm">${ic("download")}</button></div>
                  <div class="file-row"><span class="file-row__icon">PNG</span><span class="file-row__meta"><span class="file-row__name">BW-预算余额截图.png</span><span class="file-row__size">640 KB · 陈曦 上传于 11-05</span></span><span class="pill pill--outline">原始附件</span><button class="icon-btn icon-btn--sm">${ic("download")}</button></div>
                </div>
              </div>
            </section>

            <!-- queue -->
            <section class="detail-panel" data-panel="queue" ${tab !== "queue" ? "hidden" : ""}>
              <div class="detail-two">
                <section class="card">
                  <div class="card-head"><h3>本次需求相关队列</h3><a class="link sm" href="#/ops/queue">队列看板 ${ic("arrow-right")}</a></div>
                  <div class="mini-queue">
                    <div class="mini-queue__row"><span class="mono">teams-notify</span><span>2 条待投递</span><span class="pill pill--green"><span class="dot"></span>正常</span></div>
                    <div class="mini-queue__row"><span class="mono">jira-sync</span><span>已同步</span><span class="pill pill--green"><span class="dot"></span>正常</span></div>
                    <div class="mini-queue__row"><span class="mono">ai-stage-runner</span><span>技术设计生成中</span><span class="pill pill--teal pill--live"><span class="dot"></span>运行中</span></div>
                  </div>
                </section>
                <section class="card">
                  <div class="card-head"><h3>最近投递</h3><span class="sm mono">hook.delivered</span></div>
                  <div class="mini-queue">
                    <div class="mini-queue__row"><span class="mono">12:08</span><span>Teams #fin-sap-it</span><span class="pill pill--green">200 · 1.2s</span></div>
                    <div class="mini-queue__row"><span class="mono">09:44</span><span>JIRA SAP-1187</span><span class="pill pill--green">201 · 840ms</span></div>
                    <div class="mini-queue__row"><span class="mono">09:18</span><span>Teams 门禁提醒</span><span class="pill pill--green">200 · 910ms</span></div>
                  </div>
                </section>
              </div>
            </section>
          </div>

          <aside class="detail-aside">
            <section class="next-action card">
              <div class="next-action__head"><span class="live-dot">下一步</span><span class="mono">G1</span></div>
              <h3>确认功能设计 v2</h3>
              <p>3 项检查中 2 项已通过，1 个未决问题需要你确认。</p>
              <div class="next-check">
                <span class="is-ok">${ic("check")} 验收标准已覆盖</span>
                <span class="is-ok">${ic("check")} 上游文档版本一致</span>
                <span class="is-warn">${ic("alert-circle")} 预算缺失场景待确认</span>
              </div>
              <a class="btn btn--primary btn--block" href="#/demands/R-2041/doc/functional-design">去评审 ${ic("arrow-right")}</a>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>负责人</h3><button class="link sm">管理</button></div>
              <div class="people-list">
                <div class="people-row"><span class="avatar avatar--sm" data-tone="teal">林</span><span class="grow"><b>林桦</b><em>需求顾问</em></span><span class="pill pill--outline">主负责人</span></div>
                <div class="people-row"><span class="avatar avatar--sm" data-tone="ink">陈</span><span class="grow"><b>陈曦</b><em>业务方</em></span><span class="pill pill--outline">关注</span></div>
                <div class="people-row"><span class="avatar avatar--sm" data-tone="blue">周</span><span class="grow"><b>周予</b><em>SAP IT · ABAP</em></span><span class="pill pill--outline">开发</span></div>
              </div>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>关键信息</h3></div>
              <div class="side-kv">
                <div><span>所属小组</span><b>财务共享组 FIN-SH</b></div>
                <div><span>当前阶段</span><b>功能设计 02/06</b></div>
                <div><span>现行门禁</span><b class="amber">G1 需求顾问确认</b></div>
                <div><span>期望上线</span><b>11-18 · 21:00</b></div>
                <div><span>运行模板</span><b>PDO v4 · 六阶段</b></div>
              </div>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>集成状态</h3></div>
              <div class="integration-status">
                <span><i class="dot dot--green"></i>Teams 已通知 · 3 人</span>
                <span><i class="dot dot--green"></i>JIRA 已同步 · SAP-1187</span>
                <span><i class="dot dot--amber"></i>CRQ 待审批 · 0842</span>
                <span><i class="dot dot--green"></i>ChaRM 已通过 · CR-44102</span>
              </div>
            </section>

            <a class="aside-link" href="#/demands/R-2045/release">${ic("upload")} 查看示例：上线文档与审批 ${ic("arrow-right")}</a>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-detail-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.detailTab;
          root.querySelectorAll("[data-detail-tab]").forEach((b) => b.classList.toggle("is-active", b === btn));
          root.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== key));
          SA.animateBars(root);
        });
      });
      const vscode = root.querySelector("[data-action='open-vscode']");
      if (vscode) {
        vscode.addEventListener("click", () => {
          SA.modal({
            title: "在 VSCode 中打开",
            desc: "将启动 SAP Super Agent 扩展，并加载需求上下文。",
            body:
              '<div class="code" style="font-size:10.5px">' +
              '<span class="c">// vscode://sap-superagent.open?demand=R-2041</span>\n' +
              '<span class="k">SAP Super Agent</span>: 正在请求执行器…\n' +
              '<span class="s">✓</span> 执行器在线 · 周予@laptop-fink\n' +
              '<span class="s">✓</span> 工作区匹配 · z-fin\n' +
              '<span class="s">✓</span> 上下文包已写入 .sap-superagent/task/T-8852/context.md' +
              "</div>" +
              '<div class="callout callout--teal" style="margin-top:12px">' +
              ic("info") +
              "<span>VSCode 扩展会在任务箱中高亮该需求，并打开「需求详情」Webview。</span></div>",
            actions: [{ label: "知道了", variant: "primary" }],
          });
        });
      }
      const more = root.querySelector("[data-action='detail-more']");
      if (more) {
        more.addEventListener("click", () => {
          SA.modal({
            title: "更多操作",
            body:
              '<div class="kv">' +
              '<div class="kv-row"><span class="kv-key">协作</span><span class="kv-val">复制需求深链 · 邀请关注者</span></div>' +
              '<div class="kv-row"><span class="kv-key">数据</span><span class="kv-val">导出过程文档 · 导出审计事件</span></div>' +
              '<div class="kv-row"><span class="kv-key">危险</span><span class="kv-val" style="color:var(--red)">撤回需求 · 取消任务</span></div>' +
              "</div>",
            actions: [{ label: "关闭", variant: "ghost" }],
          });
        });
      }
      root.querySelectorAll("[data-action='regenerate-summary']").forEach((el) => {
        el.addEventListener("click", () => SA.toast("已重新生成摘要", { icon: "sparkles" }));
      });
    },
  });
})();
