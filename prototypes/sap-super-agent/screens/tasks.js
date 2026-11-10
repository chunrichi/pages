/* ============================================================
   Screen · Tasks
   SAP 业务视角 = 待我确认（文档门禁 / 上线审批 / 澄清问题）
   SAP IT 视角 = 任务台（可领取 / 进行中 / 等待回答 + VSCode）
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const GROUPS = [
    {
      key: "available",
      label: "可领取",
      tone: "blue",
      items: [
        { id: "T-8850", demand: "R-2045", title: "上线文档补充回滚步骤", stage: "上线", repo: "z-fin", type: "文档", priority: "中", state: "可领取", note: "未绑定工作区", age: "1 小时前" },
        { id: "T-8852", demand: "R-2041", title: "功能设计评审：预算校验流程", stage: "功能设计", repo: "z-fin", type: "评审", priority: "中", state: "可领取", note: "需 consultant 角色", age: "2 小时前" },
      ],
    },
    {
      key: "active",
      label: "进行中",
      tone: "teal",
      items: [
        { id: "T-8841", demand: "R-2042", title: "实现开票清单导出服务", stage: "技术开发", repo: "z-sales", type: "ABAP", priority: "高", state: "进行中", note: "租约剩余 42s · 续约中", age: "刚刚" },
      ],
    },
    {
      key: "waiting",
      label: "等待我回答",
      tone: "amber",
      items: [
        { id: "T-8846", demand: "R-2043", title: "补充 MES 回写异常场景测试", stage: "测试", repo: "z-mfg", type: "测试", priority: "高", state: "等待我回答", note: "测试数据需要确认", age: "18 分钟前" },
      ],
    },
    {
      key: "done",
      label: "最近完成",
      tone: "green",
      items: [
        { id: "T-8838", demand: "R-2040", title: "供应商主数据校验修复", stage: "技术开发", repo: "z-mm", type: "ABAP", priority: "中", state: "已完成", note: "已提交工件 · 12 分钟", age: "昨天" },
        { id: "T-8836", demand: "R-2038", title: "采购报表性能优化", stage: "测试", repo: "z-fin", type: "ABAP", priority: "低", state: "已完成", note: "已回写测试证据", age: "昨天" },
      ],
    },
  ];

  function taskCard(t) {
    const tone = t.priority === "高" ? "red" : "slate";
    return `
      <div class="task-card" data-task="${t.id}">
        <div class="task-card__top">
          <span class="mono task-card__id">${t.id}</span>
          <span class="tag tag--mono">${t.repo}</span>
          <span class="grow"></span>
          <span class="mini-priority mini-priority--${t.priority === "高" ? "high" : "normal"}">${t.priority}</span>
        </div>
        <div class="task-card__title">${t.title}</div>
        <div class="task-card__meta">
          <span class="tag">${t.type}</span>
          <span class="dot-sep"></span>
          <span>${t.demand}</span>
          <span class="dot-sep"></span>
          <span>${t.stage}</span>
        </div>
        <div class="task-card__note ${t.state === "等待我回答" ? "is-warn" : t.state === "进行中" ? "is-live" : ""}">
          ${t.state === "进行中" ? '<i class="live-dot"></i>' : ""}
          ${t.state === "等待我回答" ? ic("message") : ""}
          ${t.note}
        </div>
        <div class="task-card__foot">
          <span class="task-card__age">${t.age}</span>
          <span class="grow"></span>
          ${
            t.state === "可领取"
              ? '<button class="btn btn--sm btn--primary" data-action="claim">领取</button>'
              : t.state === "等待我回答"
              ? '<button class="btn btn--sm btn--primary" data-action="answer">回答</button>'
              : t.state === "进行中"
              ? '<button class="btn btn--sm" data-action="open-vscode">' + ic("monitor") + " 在 VSCode 打开</button>"
              : '<span class="task-done">' + ic("check") + " 已完成</span>"
          }
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------
     SAP 业务视角：待我确认
     ------------------------------------------------------------ */
  function demandRow(d) {
    const tones = ["blue", "teal", "violet", "amber"];
    return `
      <a class="demand-row" href="#/demands/${d.id}">
        <span class="demand-row__id cell-mono">${d.id}</span>
        <span class="demand-row__main">
          <span class="demand-row__title">${SA.h(d.title)}</span>
          <span class="demand-row__meta">
            <span class="tag tag--mono">${d.jira}</span>
            <span class="demand-row__dot"></span>
            <span>${SA.h(d.owner.join("、"))}</span>
            <span class="demand-row__dot"></span>
            <span>更新于 ${d.updated}</span>
          </span>
        </span>
        <span class="demand-row__stage">
          <span class="demand-row__stage-name">${SA.h(d.stage)}<em>0${d.stageIndex + 1}</em></span>
          <span class="stage-rail">
            ${[0, 1, 2, 3, 4, 5]
              .map((i) => `<span class="stage-seg ${i < d.stageIndex ? "is-done" : i === d.stageIndex ? "is-current" : ""}"></span>`)
              .join("")}
          </span>
        </span>
        <span class="demand-row__owners">
          ${d.owner
            .slice(0, 2)
            .map((o, i) => `<span class="avatar avatar--sm" data-tone="${tones[i % 4]}">${SA.h(o[0])}</span>`)
            .join("")}
        </span>
        <span class="pill pill--${d.statusTone}"><span class="dot"></span>${SA.h(d.status)}</span>
        <span class="demand-row__chev">${ic("chevron-right")}</span>
      </a>`;
  }

  function businessView() {
    const a = SA.auth.account;
    const mine = SA.data.demands.filter((d) => d.owner.includes(a.name)).slice(0, 3);
    return `
      <div class="page page-tasks">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">TODO · SAP 业务</div>
            <div class="page-head__title">
              <h1>待我确认</h1>
              <span class="pill pill--amber pill--lg">3 项待确认</span>
              <span class="pill pill--blue pill--lg" title="当前账号唯一所属小组">${ic("users")} ${SA.h(a.groupName)} · ${SA.h(a.groupKey)}</span>
            </div>
            <p class="page-head__desc">确认文档、审批上线、回答澄清；确认后由 SAP IT 继续推进。</p>
          </div>
        </div>

        <div class="task-bottom">
          <section class="card">
            <div class="card-head">
              <h3>待确认文档</h3>
              <span class="tag tag--amber">2</span>
            </div>
            <a class="gate-item" href="#/demands/R-2041/doc/functional-design">
              <span class="gate-item__icon">${ic("git-commit")}</span>
              <span class="gate-item__main">
                <span class="gate-item__title">功能设计 v2 · R-2041</span>
                <span class="gate-item__meta">G1 门禁 · 3 项检查待看</span>
              </span>
              <span class="gate-item__arrow">${ic("chevron-right")}</span>
            </a>
            <a class="gate-item" href="#/demands/R-2046/doc/functional-design">
              <span class="gate-item__icon gate-item__icon--violet">${ic("message")}</span>
              <span class="gate-item__main">
                <span class="gate-item__title">功能设计 v1 · R-2046</span>
                <span class="gate-item__meta">等待澄清 · 2 个问题未回答</span>
              </span>
              <span class="gate-item__arrow">${ic("chevron-right")}</span>
            </a>
            <div class="card-foot"><span class="sm">确认后进入开发阶段</span></div>
          </section>

          <section class="card">
            <div class="card-head">
              <h3>上线审批</h3>
              <span class="tag tag--amber">1</span>
            </div>
            <a class="gate-item" href="#/demands/R-2045/release">
              <span class="gate-item__icon gate-item__icon--violet">${ic("upload")}</span>
              <span class="gate-item__main">
                <span class="gate-item__title">上线审批 · R-2045</span>
                <span class="gate-item__meta">11-12 月结窗口 · 待业务方确认</span>
              </span>
              <span class="gate-item__arrow">${ic("chevron-right")}</span>
            </a>
            <div class="card-foot"><span class="sm">审批通过后由 SAP IT 执行上线</span></div>
          </section>

          <section class="card">
            <div class="card-head">
              <h3>等待我回答</h3>
              <span class="tag tag--amber">1</span>
            </div>
            <a class="gate-item" href="#/demands/R-2044">
              <span class="gate-item__icon">${ic("message")}</span>
              <span class="gate-item__main">
                <span class="gate-item__title">AI 澄清 · R-2044</span>
                <span class="gate-item__meta">4 个问题等待回答 · Super Agent 已暂停</span>
              </span>
              <span class="gate-item__arrow">${ic("chevron-right")}</span>
            </a>
            <div class="card-foot"><span class="sm">回答后 Super Agent 继续澄清</span></div>
          </section>
        </div>

        <section class="card" style="margin-top:14px">
          <div class="card-head">
            <h3>我提交的需求</h3>
            <a class="link sm" href="#/demands">全部需求 ${ic("arrow-right")}</a>
          </div>
          ${
            mine.length
              ? '<div class="demand-list">' + mine.map(demandRow).join("") + "</div>"
              : '<div class="empty"><div class="empty__icon">' +
                ic("layers") +
                '</div><div class="empty__title">还没有提交过需求</div><div class="empty__desc">提交需求后会出现在这里，便于跟踪进度。</div></div>'
          }
        </section>
      </div>`;
  }

  SA.register("tasks", {
    title: "任务台",
    render() {
      const isBusiness = SA.view === "business";
      if (isBusiness) return businessView();
      return `
      <div class="page page-tasks">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">TASKS · SAP IT</div>
            <div class="page-head__title">
              <h1>任务台</h1>
              <span class="pill pill--outline pill--lg">4 个待处理</span>
              <span class="pill pill--blue pill--lg" title="当前账号唯一所属小组">${ic("users")} ${SA.data.user.group} · ${SA.data.user.groupKey}</span>
            </div>
            <p class="page-head__desc">领取开发任务，在 VSCode 中加载需求上下文与过程文档。Super Agent 会在你离线时继续推进文档阶段。</p>
          </div>
          <div class="page-head__actions">
            <div class="accepting">
              <span class="accepting__label"><i class="dot"></i><b>接受派单</b></span>
              <button class="switch is-on" data-action="toggle-accept" aria-label="切换接单状态"></button>
            </div>
            <button class="btn">${ic("refresh")} 刷新</button>
            <button class="btn">${ic("settings")} 工作区</button>
          </div>
        </div>

        <section class="executor-strip">
          <div class="executor-strip__main">
            <span class="executor-strip__icon">${ic("monitor")}</span>
            <div>
              <div class="executor-strip__title">VSCode 已连接 <span class="pill pill--green"><span class="dot"></span>在线</span></div>
              <div class="executor-strip__sub">周予@laptop-fink · z-fin · Copilot Chat 可用 · sap-dev skill 已同步</div>
            </div>
          </div>
          <div class="executor-strip__stats">
            <div><span>并发</span><b>1 / 2</b></div>
            <div><span>租约续约</span><b class="mono">20s</b></div>
            <div><span>心跳</span><b class="mono">2s 前</b></div>
            <div><span>最近领取</span><b class="mono">08:41</b></div>
          </div>
          <div class="executor-strip__actions">
            <span class="executor-strip__note">${ic("sync")} 任务箱与 VSCode 扩展实时同步</span>
          </div>
        </section>

        <div class="task-board">
          ${GROUPS.map(
            (g) => `
            <section class="task-col task-col--${g.tone}">
              <header class="task-col__head">
                <span class="task-col__dot"></span>
                <span class="task-col__name">${g.label}</span>
                <span class="task-col__count">${g.items.length}</span>
                <span class="grow"></span>
                ${g.key === "available" ? '<button class="icon-btn icon-btn--sm">' + ic("refresh") + "</button>" : ""}
              </header>
              <div class="task-col__body">
                ${g.items.map(taskCard).join("")}
                ${g.items.length === 0 ? '<div class="kanban-empty">暂无任务</div>' : ""}
              </div>
            </section>`
          ).join("")}
        </div>

        <div class="task-bottom">
          <section class="card">
            <div class="card-head">
              <h3><span class="live-dot" style="color:var(--teal)">Super Agent 运行中</span></h3>
              <a class="link sm" href="#/ops/agents">全部运行 ${ic("arrow-right")}</a>
            </div>
            <div class="card-body task-agent-list">
              <a class="task-agent" href="#/ops/agents">
                <span class="agent-job__icon">${ic("sparkles")}</span>
                <span class="grow"><b>生成技术设计 · R-2041</b><em>deepseek-v4 · 正在结合 BAPI 文档生成</em></span>
                <span class="task-agent__pct mono">64%</span>
              </a>
              <a class="task-agent" href="#/ops/agents">
                <span class="agent-job__icon">${ic("brain")}</span>
                <span class="grow"><b>澄清需求 · R-2044</b><em>知识库检索 · 4 个来源</em></span>
                <span class="task-agent__pct mono">34%</span>
              </a>
              <a class="task-agent" href="#/ops/agents">
                <span class="agent-job__icon agent-job__icon--violet">${ic("file-text")}</span>
                <span class="grow"><b>归档测试文档 · R-2043</b><em>已生成 12 个用例，等待人工确认</em></span>
                <span class="pill pill--amber"><span class="dot"></span>待确认</span>
              </a>
            </div>
          </section>

          <section class="card">
            <div class="card-head">
              <h3>等待我回答</h3>
              <span class="tag">1</span>
            </div>
            <div class="card-body task-question">
              <div class="task-question__head">
                <span class="avatar avatar--sm" data-tone="violet">沈</span>
                <span class="grow"><b>沈珂 在任务 T-8846 中提问</b><em>18 分钟前 · MES 回写测试</em></span>
              </div>
              <p>“MES 回写异常场景需要一张已关闭的生产订单作为测试数据，能不能用测试系统里的 10008821？”</p>
              <div class="task-question__actions">
                <button class="btn btn--sm btn--primary" data-action="answer">回复并继续</button>
                <button class="btn btn--sm btn--ghost">稍后</button>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-head">
              <h3>上下文包</h3>
              <span class="sm mono">.sap-superagent/task/T-8841</span>
            </div>
            <div class="card-body context-files">
              <div class="context-file">${ic("file-text")}<span>context.md</span><span class="mono">4.2 KB</span><span class="pill pill--green">已生成</span></div>
              <div class="context-file">${ic("file-text")}<span>functional-design.md</span><span class="mono">12 KB</span><span class="pill pill--green">v2</span></div>
              <div class="context-file">${ic("file-text")}<span>tech-design.md</span><span class="mono">18 KB</span><span class="pill pill--amber">生成中</span></div>
            </div>
          </section>
        </div>
      </div>`;
    },
    after(ctx, root) {
      if (SA.view === "business") return;
      const accept = root.querySelector("[data-action='toggle-accept']");
      if (accept) {
        accept.addEventListener("click", (e) => {
          e.currentTarget.classList.toggle("is-on");
          const on = e.currentTarget.classList.contains("is-on");
          const label = root.querySelector(".accepting__label b");
          if (label) label.textContent = on ? "接受派单" : "暂停接单";
          SA.toast(on ? "已恢复接单，任务箱将实时刷新" : "已暂停接单，不再接收新任务");
        });
      }
      root.querySelectorAll("[data-action='claim']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest(".task-card");
          const id = card.dataset.task;
          btn.classList.add("is-loading");
          SA.sequence(() => {
            btn.classList.remove("is-loading");
            card.classList.add("is-claimed");
            const note = card.querySelector(".task-card__note");
            if (note) {
              note.innerHTML = '<i class="live-dot"></i> 已领取 · 租约 60s · 续约每 20s';
              note.classList.remove("anim-fade");
              void note.offsetWidth;
              note.classList.add("anim-fade");
            }
            btn.outerHTML = '<button class="btn btn--sm anim-fade" data-action="open-vscode">' + ic("monitor") + " 在 VSCode 打开</button>";
            SA.toast("已领取 " + id + "，租约 60 秒");
            bindVscode();
          }, 500);
        });
      });
      function bindVscode() {
        root.querySelectorAll("[data-action='open-vscode']").forEach((b) => {
          if (b.dataset.bound) return;
          b.dataset.bound = "1";
          b.addEventListener("click", () => {
            SA.modal({
              title: "在 VSCode 中打开任务",
              desc: "扩展将创建 worktree、写入上下文包并打开需求 Webview。",
              body:
                '<div class="code" style="font-size:10.5px">' +
                '<span class="c">→ sap-superagent.openTask T-8841</span>\n' +
                '<span class="s">✓</span> executor online · 周予@laptop-fink\n' +
                '<span class="s">✓</span> workspace bound · z-sales / feature/R-2042\n' +
                '<span class="s">✓</span> worktree created · ../.sap-superagent-worktrees/T-8841\n' +
                '<span class="s">✓</span> context.md written (4.2 KB)\n' +
                '<span class="k">→</span> 打开 SAP Super Agent 需求详情' +
                "</div>" +
                '<div class="callout callout--teal" style="margin-top:12px">' + ic("info") + "<span>任务详情与过程文档会在插件 Webview 中加载；Copilot Chat 可通过 <code>#file</code> 引用上下文包。</span></div>",
              actions: [{ label: "知道了", variant: "primary" }],
            });
          });
        });
      }
      bindVscode();
      root.querySelectorAll("[data-action='answer']").forEach((b) => {
        b.addEventListener("click", () => {
          SA.modal({
            title: "回复并继续",
            desc: "回答会写入任务事件，并通知提问的人。",
            body: '<div class="field"><span class="field__label">回复</span><textarea class="textarea" rows="3">可以，用测试系统 10008821。注意回写前先在 MES 侧关闭重复报工。</textarea></div>',
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "发送回复", variant: "primary", onClick: () => SA.toast("回复已发送，任务继续") },
            ],
          });
        });
      });
    },
  });
})();
