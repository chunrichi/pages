/* ============================================================
   Screen · Demands (list / kanban / backlog)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;
  const STAGES = ["需求澄清", "功能设计", "技术设计", "技术开发", "测试", "上线"];

  function ownerAvatar(name) {
    const tones = ["blue", "teal", "violet", "amber", "rose", "slate"];
    const tone = tones[name.charCodeAt(0) % tones.length];
    return `<span class="avatar avatar--sm" data-tone="${tone}" title="${SA.h(name)}">${SA.h(name[0])}</span>`;
  }
  function owners(list, size) {
    return `<span class="owner-stack">${list
      .map((n) => ownerAvatar(n).replace("avatar--sm", size || "avatar--sm"))
      .join("")}</span>`;
  }
  function stageRail(d) {
    return `<span class="stage-rail stage-rail--wide">${[0, 1, 2, 3, 4, 5]
      .map((i) => `<span class="stage-seg ${i < d.stageIndex ? "is-done" : i === d.stageIndex ? "is-current" : ""}"></span>`)
      .join("")}</span>`;
  }

  /* ---------- list ---------- */
  function listView(demands) {
    return `
      <div class="card demand-table-card">
        <div class="table-wrap">
          <table class="table demand-table">
            <thead>
              <tr>
                <th style="width:32%">需求</th>
                <th>阶段</th>
                <th>负责人</th>
                <th>过程文档</th>
                <th>优先级</th>
                <th>更新时间</th>
                <th style="text-align:right">状态</th>
              </tr>
            </thead>
            <tbody>
              ${demands
                .map(
                  (d) => `
                <tr data-href="#/demands/${d.id}" class="clickable-row">
                  <td>
                    <div class="demand-cell">
                      <div class="demand-cell__top">
                        <span class="demand-cell__id mono">${d.id}</span>
                        <span class="tag tag--mono">${d.jira}</span>
                      </div>
                      <div class="demand-cell__title">${SA.h(d.title)}</div>
                      <div class="demand-cell__desc clamp-2">${SA.h(d.desc)}</div>
                    </div>
                  </td>
                  <td>
                    <div class="stage-cell">
                      <span class="stage-cell__name">${d.stage}<em class="mono">0${d.stageIndex + 1}/06</em></span>
                      ${stageRail(d)}
                    </div>
                  </td>
                  <td><span class="cell-owners">${owners(d.owner)}<span class="cell-owners__names">${SA.h(d.owner.join("、"))}</span></span></td>
                  <td>
                    <span class="doc-count">${ic("files")} <b>${d.docs}</b><span class="muted">份</span></span>
                  </td>
                  <td><span class="pill pill--${d.priorityTone === "red" ? "red" : "slate"} pill--outline-dot">${d.priority}</span></td>
                  <td><span class="sm" style="color:var(--ink-3)">${d.updated}</span></td>
                  <td style="text-align:right"><span class="pill pill--${d.statusTone}"><span class="dot"></span>${SA.h(d.status)}</span></td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="table-foot">
          <span class="sm">显示 ${demands.length} / ${SA.data.demands.length} 个需求</span>
          <span class="grow"></span>
          <span class="sm">数据来自 SAP ICF · 最后同步 2 分钟前</span>
        </div>
      </div>`;
  }

  /* ---------- kanban ---------- */
  function kanbanView(demands) {
    return `
      <div class="kanban">
        ${STAGES.map((stage, i) => {
          const items = demands.filter((d) => d.stageIndex === i);
          return `
          <section class="kanban-col" data-stage="${i}">
            <header class="kanban-col__head">
              <span class="kanban-col__dot ${i === 5 ? "is-green" : ""}"></span>
              <span class="kanban-col__name">${stage}</span>
              <span class="kanban-col__count">${items.length}</span>
              <button class="icon-btn icon-btn--sm kanban-col__add tooltip" data-tip="添加需求" aria-label="添加需求">${ic("plus")}</button>
            </header>
            <div class="kanban-col__body">
              ${items
                .map(
                  (d) => `
                <a class="kanban-card" href="#/demands/${d.id}">
                  <div class="kanban-card__top">
                    <span class="mono kanban-card__id">${d.id}</span>
                    <span class="tag tag--mono">${d.jira}</span>
                  </div>
                  <div class="kanban-card__title">${SA.h(d.title)}</div>
                  <div class="kanban-card__meta">
                    <span class="kanban-card__docs">${ic("files")}${d.docs}</span>
                    <span class="kanban-card__dot"></span>
                    <span>${d.due}</span>
                    <span class="grow"></span>
                    ${owners(d.owner)}
                  </div>
                  <div class="kanban-card__foot">
                    <span class="pill pill--${d.statusTone}"><span class="dot"></span>${SA.h(d.status)}</span>
                    <span class="mini-priority mini-priority--${d.priorityTone === "red" ? "high" : "normal"}">${d.priority}</span>
                  </div>
                </a>`
                )
                .join("")}
              ${items.length === 0 ? `<div class="kanban-empty">暂无需求</div>` : ""}
            </div>
          </section>`;
        }).join("")}
      </div>`;
  }

  /* ---------- backlog ---------- */
  function backlogView(demands) {
    const groups = [
      { key: "sprint", label: "本期迭代 · Sprint 24", meta: "11-11 → 11-22 · 容量 34/40 点" },
      { key: "next", label: "下个迭代候选", meta: "按优先级排序，等待排期" },
      { key: "icebox", label: "Backlog · 待定", meta: "未承诺交付时间" },
    ];
    const bucket = (d) => (["R-2041", "R-2044", "R-2043"].includes(d.id) ? "sprint" : ["R-2042", "R-2045"].includes(d.id) ? "next" : "icebox");
    return `
      <div class="backlog-head card">
        <div class="backlog-head__left">
          <span class="backlog-head__epic">
            <span class="backlog-head__icon">${ic("trello")}</span>
            <span><span class="backlog-head__name">SAP-DELIVERY-24</span><span class="backlog-head__sub">JIRA Epic · 财务与供应链交付</span></span>
          </span>
          <span class="pill pill--blue pill--live"><span class="dot"></span>已同步 JIRA</span>
          <span class="sm">2 分钟前 · 双向同步开启</span>
        </div>
        <div class="backlog-head__right">
          <span class="sm">估算容量</span>
          <span class="backlog-head__cap"><i style="width:78%"></i></span>
          <span class="mono sm">34 / 40 点</span>
          <button class="btn btn--sm">${ic("refresh")} 同步</button>
        </div>
      </div>

      <div class="backlog">
        ${groups
          .map(
            (g) => `
          <section class="backlog-group">
            <header class="backlog-group__head">
              <div class="row gap-2">
                <span class="backlog-group__caret">${ic("chevron-down")}</span>
                <h3>${g.label}</h3>
                <span class="tag">${demands.filter((d) => bucket(d) === g.key).length}</span>
                <span class="sm">${g.meta}</span>
              </div>
              <button class="btn btn--sm btn--ghost">${ic("plus")} 添加</button>
            </header>
            <div class="backlog-rows">
              ${demands
                .filter((d) => bucket(d) === g.key)
                .map(
                  (d, idx) => `
                <div class="backlog-row" data-href="#/demands/${d.id}">
                  <span class="backlog-row__drag">${ic("more-vertical")}</span>
                  <span class="backlog-row__rank mono">${String(idx + 1).padStart(2, "0")}</span>
                  <span class="backlog-row__key mono">${d.jira}</span>
                  <span class="backlog-row__main">
                    <span class="backlog-row__title">${SA.h(d.title)}</span>
                    <span class="backlog-row__meta"><span class="mono">${d.id}</span><span class="backlog-row__dot"></span>${SA.h(d.owner.join("、"))}<span class="backlog-row__dot"></span>${d.stage}</span>
                  </span>
                  <span class="backlog-row__size" title="故事点">${d.size}</span>
                  <span class="pill pill--${d.statusTone}"><span class="dot"></span>${SA.h(d.status)}</span>
                  <span class="backlog-row__action">
                    <button class="btn btn--sm btn--soft" data-action="plan-demand">${ic("calendar")} 排期</button>
                  </span>
                </div>`
                )
                .join("")}
            </div>
          </section>`
          )
          .join("")}
      </div>`;
  }

  SA.register("demands", {
    title: "需求",
    render(ctx) {
      const view = ctx.query.get("view") || "list";
      return `
      <div class="page page-demands">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">DEMANDS · 需求</div>
            <div class="page-head__title">
              <h1>需求</h1>
              <span class="pill pill--outline pill--lg">${SA.data.demands.length} 个</span>
              <span class="pill pill--blue pill--lg" title="当前账号唯一所属小组">${ic("users")} ${SA.data.user.group} · ${SA.data.user.groupKey}</span>
            </div>
            <p class="page-head__desc">从 SAP 业务提出到上线归档的全部需求。过程文档、审批与工单状态都在同一条时间线上。</p>
          </div>
          <div class="page-head__actions">
            <button class="btn" data-action="sync-jira">${ic("refresh")} 同步 JIRA</button>
            <a class="btn btn--primary" href="#/demands/new">${ic("plus")} 新建需求</a>
          </div>
        </div>

        <div class="toolbar">
          <div class="segmented view-switch">
            <button data-view="list" class="${view === "list" ? "is-active" : ""}">${ic("list")} 列表</button>
            <button data-view="kanban" class="${view === "kanban" ? "is-active" : ""}">${ic("kanban")} 看板</button>
            <button data-view="backlog" class="${view === "backlog" ? "is-active" : ""}">${ic("trello")} Backlog</button>
          </div>
          <div class="toolbar__spacer"></div>
          <div class="search toolbar__search">
            ${ic("search")}
            <input class="input" id="demand-search" placeholder="搜索标题、编号、JIRA Key…" />
          </div>
          <button class="toolbar__filter" data-filter="mine">${ic("user")} 我负责的</button>
          <button class="toolbar__filter" data-filter="confirm">${ic("git-commit")} 待确认</button>
          <button class="toolbar__filter" data-filter="all">${ic("filter")} 全部阶段 ${ic("chevron-down")}</button>
        </div>

        <div id="demand-view" class="demand-view">
          ${view === "kanban" ? kanbanView(SA.data.demands) : view === "backlog" ? backlogView(SA.data.demands) : listView(SA.data.demands)}
        </div>
      </div>`;
    },
    after(ctx, root) {
      let current = ctx.query.get("view") || "list";
      let filter = "all";
      let stageFilter = null;
      let search = "";
      const container = root.querySelector("#demand-view");
      const searchInput = root.querySelector("#demand-search");

      function filtered() {
        return SA.data.demands.filter((d) => {
          if (search) {
            const q = search.toLowerCase();
            const hay = (d.title + d.id + d.jira + d.desc + d.owner.join("")).toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (filter === "mine") return d.owner.includes("陈曦") || d.owner.includes("周予");
          if (filter === "confirm") return d.status === "待确认" || d.status === "等待澄清";
          if (stageFilter) return d.stage === stageFilter;
          return true;
        });
      }
      function paint() {
        const list = filtered();
        container.innerHTML =
          current === "kanban" ? kanbanView(list) : current === "backlog" ? backlogView(list) : listView(list);
        container.classList.remove("anim-fade");
        void container.offsetWidth;
        container.classList.add("anim-fade");
        SA.animateBars(container);
      }
      root.querySelectorAll("[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
          current = btn.dataset.view;
          root.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
          paint();
        });
      });
      root.querySelectorAll("[data-filter]").forEach((btn) => {
        if (btn.dataset.filter === "mine" || btn.dataset.filter === "confirm") {
          btn.addEventListener("click", () => {
            filter = filter === btn.dataset.filter ? "all" : btn.dataset.filter;
            root.querySelectorAll("[data-filter]").forEach((b) => {
              if (b.dataset.filter !== "all") b.classList.toggle("is-active", b.dataset.filter === filter);
            });
            paint();
          });
        }
      });
      searchInput.addEventListener("input", (e) => {
        search = e.target.value.trim();
        paint();
      });
      const stageBtn = root.querySelector("[data-filter='all']");
      if (stageBtn) {
        stageBtn.addEventListener("click", () => {
          const opts = [null].concat(STAGES);
          const idx = opts.indexOf(stageFilter);
          stageFilter = opts[(idx + 1) % opts.length];
          stageBtn.innerHTML =
            ic("filter") + " " + (stageFilter || "全部阶段") + " " + ic("chevron-down");
          stageBtn.classList.toggle("is-active", !!stageFilter);
          paint();
        });
      }
      root.addEventListener("click", (e) => {
        const row = e.target.closest("[data-href]");
        if (row) {
          e.preventDefault();
          SA.go(row.dataset.href);
        }
        const planBtn = e.target.closest("[data-action='plan-demand']");
        if (planBtn) {
          e.preventDefault();
          SA.modal({
            title: "安排迭代",
            desc: "把需求放入 Sprint 24，AI 会根据负责人容量给出建议。",
            body:
              '<div class="field"><span class="field__label">目标迭代</span><select class="select"><option>Sprint 24 · 11-11 → 11-22</option><option>Sprint 25 · 11-25 → 12-06</option></select></div>' +
              '<div class="field" style="margin-top:12px"><span class="field__label">故事点</span><div class="row gap-2"><span class="pill pill--outline">S</span><span class="pill pill--blue">M</span><span class="pill pill--outline">L</span></div></div>',
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "加入迭代", variant: "primary", onClick: () => SA.toast("已加入 Sprint 24") },
            ],
          });
        }
      });
      const sync = root.querySelector("[data-action='sync-jira']");
      if (sync) {
        sync.addEventListener("click", () => {
          sync.classList.add("is-loading");
          setTimeout(() => {
            sync.classList.remove("is-loading");
            SA.toast("JIRA Backlog 已同步 · 7 个 issue", { icon: "refresh" });
          }, 900);
        });
      }
    },
  });
})();
