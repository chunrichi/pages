/* ============================================================
   Screen · Home (role-aware overview)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  function greeting() {
    // 原型固定演示时间：2026-11-11 14:00，与页面中的时间线保持一致
    return "下午好";
  }

  function statCell(label, value, suffix, meta, tone, spark) {
    const decimals = String(value).includes(".") ? 1 : 0;
    return `
      <div class="stat">
        <div class="stat__label">${label}</div>
        <div class="stat__value num ${tone ? "stat__value--" + tone : ""}">
          <span data-count="${value}" data-decimals="${decimals}">0</span>${suffix ? '<span class="stat__unit">' + suffix + "</span>" : ""}
        </div>
        <div class="stat__meta">${meta}</div>
        ${
          spark
            ? `<svg class="sparkline stat__spark" viewBox="0 0 120 32" preserveAspectRatio="none" style="--tone:${spark};--tone-tint:var(--${tone || "blue"}-tint)">
                <path class="area" d="M0 26 L14 22 L28 24 L42 17 L56 19 L70 12 L84 14 L98 8 L112 10 L120 4 L120 32 L0 32 Z"/>
                <path d="M0 26 L14 22 L28 24 L42 17 L56 19 L70 12 L84 14 L98 8 L112 10 L120 4"/>
              </svg>`
            : ""
        }
      </div>`;
  }

  SA.register("home", {
    title: "总览",
    render() {
      const isIT = SA.data.user.role === "SAP IT";
      const demands = SA.data.demands.slice(0, 5);
      return `
      <div class="page page-home">

        <header class="home-hero">
          <div class="home-hero__main">
            <div class="eyebrow">${isIT ? "SAP IT · 交付视图" : "SAP 业务 · 需求视图"}</div>
            <h1>${greeting()}，${SA.h(SA.data.user.name)}</h1>
            <p class="page-head__desc">${isIT
              ? "4 个开发任务在推进，1 个等待你回答。Super Agent 正在生成功能设计文档。"
              : "6 个需求在推进，2 个需要你确认。今天有 1 个上线文档等待审批。"}</p>
          </div>
          <div class="home-hero__actions">
            <a class="btn btn--primary" href="#/demands/new">${ic("plus")} 新建需求</a>
            <a class="btn" href="#/ops/queue">${ic("activity")} 运行看板</a>
          </div>
          <div class="home-hero__meta">
            <span class="mono">11 月 11 日 · 星期三</span>
            <span class="home-hero__dot"></span>
            <span>${SA.h(SA.data.user.group)} · ${SA.data.user.groupKey}</span>
            <span class="home-hero__dot"></span>
            <span class="live-dot">全部系统正常</span>
          </div>
        </header>

        <section class="stats-strip">
          ${statCell("进行中的需求", 6, "", "较上周 +2", "blue", "var(--blue)")}
          ${statCell("待我确认", 2, "", "R-2041 · R-2045", "amber")}
          ${statCell("AI 生成文档", 18, "", "本周 · 节省约 6.4h", "teal")}
          ${statCell("平均流转时长", 3.2, "天", "较上季度 -0.8 天", "violet", "var(--violet)")}
        </section>

        <div class="home-grid">
          <section class="card home-demands">
            <div class="card-head">
              <h3>正在推进</h3>
              <div class="row gap-2">
                <div class="segmented home-filter">
                  <button class="is-active">全部</button>
                  <button>待我确认</button>
                  <button>我负责的</button>
                </div>
                <a class="link sm" href="#/demands">全部需求 ${ic("arrow-right")}</a>
              </div>
            </div>
            <div class="demand-list">
              ${demands
                .map(
                  (d) => `
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
                      .map((o, i) => `<span class="avatar avatar--sm" data-tone="${["blue", "teal", "violet", "amber"][i % 4]}">${SA.h(o[0])}</span>`)
                      .join("")}
                  </span>
                  <span class="pill pill--${d.statusTone}"><span class="dot"></span>${SA.h(d.status)}</span>
                  <span class="demand-row__chev">${ic("chevron-right")}</span>
                </a>`
                )
                .join("")}
            </div>
            <div class="card-foot">
              <span class="sm">AI 已为 4 个需求生成 9 份过程文档</span>
              <span class="grow"></span>
              <a class="link sm" href="#/demands">查看全部 ${ic("arrow-right")}</a>
            </div>
          </section>

          <aside class="home-side">
            <section class="card agent-live">
              <div class="card-head">
                <h3><span class="live-dot">运行中</span></h3>
                <span class="tag tag--teal mono">3 jobs</span>
              </div>
              <div class="agent-live__list">
                <div class="agent-job">
                  <div class="agent-job__head">
                    <span class="agent-job__icon">${ic("sparkles")}</span>
                    <span class="agent-job__main">
                      <span class="agent-job__title">生成技术设计 · R-2042</span>
                      <span class="agent-job__meta">deepseek-v4 · 8.2k tokens</span>
                    </span>
                    <span class="agent-job__pct mono">72%</span>
                  </div>
                  <div class="progress progress--thin"><span class="progress__bar progress__bar--teal" data-bar="72"></span></div>
                </div>
                <div class="agent-job">
                  <div class="agent-job__head">
                    <span class="agent-job__icon">${ic("sparkles")}</span>
                    <span class="agent-job__main">
                      <span class="agent-job__title">澄清需求 · R-2044</span>
                      <span class="agent-job__meta">知识库检索 · 4 个来源</span>
                    </span>
                    <span class="agent-job__pct mono">34%</span>
                  </div>
                  <div class="progress progress--thin"><span class="progress__bar progress__bar--teal" data-bar="34"></span></div>
                </div>
                <div class="agent-job">
                  <div class="agent-job__head">
                    <span class="agent-job__icon agent-job__icon--violet">${ic("file-text")}</span>
                    <span class="agent-job__main">
                      <span class="agent-job__title">同步上线文档 · R-2045</span>
                      <span class="agent-job__meta">plannotator · 版本 v3</span>
                    </span>
                    <span class="agent-job__pct mono">91%</span>
                  </div>
                  <div class="progress progress--thin"><span class="progress__bar progress__bar--violet" data-bar="91"></span></div>
                </div>
              </div>
              <div class="agent-live__foot">
                <div class="queue-mini">
                  <div><span class="mono">队列</span><strong>24</strong></div>
                  <div><span class="mono">成功率</span><strong>99.2%</strong></div>
                  <div><span class="mono">p95</span><strong>1.8s</strong></div>
                </div>
                <a class="link sm" href="#/ops/agents">Agent 运行 ${ic("arrow-right")}</a>
              </div>
            </section>

            <section class="card gate-card">
              <div class="card-head">
                <h3>待我确认</h3>
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
              <a class="gate-item" href="#/demands/R-2045/release">
                <span class="gate-item__icon gate-item__icon--violet">${ic("upload")}</span>
                <span class="gate-item__main">
                  <span class="gate-item__title">上线审批 · R-2045</span>
                  <span class="gate-item__meta">等待业务方确认 · 11-12 窗口</span>
                </span>
                <span class="gate-item__arrow">${ic("chevron-right")}</span>
              </a>
              <div class="card-foot">
                <span class="sm">确认后将触发 Teams 通知</span>
                <span class="grow"></span>
                <a class="link sm" href="#/tasks">全部待办 ${ic("arrow-right")}</a>
              </div>
            </section>
          </aside>
        </div>

        <div class="home-grid home-grid--bottom">
          <section class="card">
            <div class="card-head">
              <h3>最近活动</h3>
              <a class="link sm" href="#/demands/R-2041">R-2041 时间线 ${ic("arrow-right")}</a>
            </div>
            <div class="card-body home-activity">
              <div class="timeline">
                <div class="timeline-item">
                  <span class="timeline__node timeline__node--teal">${ic("bot")}</span>
                  <span class="timeline__main">
                    <span class="timeline__title"><b>Super Agent</b> 完成 R-2044 需求澄清草稿，提出 4 个待确认问题</span>
                    <span class="timeline__meta"><span class="mono">09:42</span><span>知识库命中：PDO-2024-118、财务主数据规范</span></span>
                  </span>
                </div>
                <div class="timeline-item">
                  <span class="timeline__node timeline__node--amber">${ic("git-commit")}</span>
                  <span class="timeline__main">
                    <span class="timeline__title"><b>林桦</b> 提交功能设计 v2，进入 G1 门禁</span>
                    <span class="timeline__meta"><span class="mono">09:18</span><span>需求 R-2041 · 等待你确认</span></span>
                  </span>
                </div>
                <div class="timeline-item">
                  <span class="timeline__node timeline__node--violet">${ic("git-branch")}</span>
                  <span class="timeline__main">
                    <span class="timeline__title">ChaRM <b>CR-44102</b> 通过 Basis 审批</span>
                    <span class="timeline__meta"><span class="mono">08:56</span><span>可创建 Change Document</span></span>
                  </span>
                </div>
                <div class="timeline-item">
                  <span class="timeline__node timeline__node--blue">${ic("monitor")}</span>
                  <span class="timeline__main">
                    <span class="timeline__title"><b>周予</b> 在 VSCode 中领取任务 T-8841</span>
                    <span class="timeline__meta"><span class="mono">08:41</span><span>工作区 z-sales · 租约已生效</span></span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="card home-calendar">
            <div class="card-head">
              <h3>上线窗口</h3>
              <span class="sm mono">NOV 2026</span>
            </div>
            <div class="card-body">
              <div class="calendar-list">
                <div class="calendar-item">
                  <span class="calendar-item__date"><b>12</b><span>周三</span></span>
                  <span class="calendar-item__main"><span class="calendar-item__title">R-2045 月结重跑入口</span><span class="calendar-item__meta">21:00 · 财务共享组 · 待审批</span></span>
                  <span class="pill pill--amber"><span class="dot"></span>待确认</span>
                </div>
                <div class="calendar-item">
                  <span class="calendar-item__date"><b>15</b><span>周六</span></span>
                  <span class="calendar-item__main"><span class="calendar-item__title">R-2043 MES 状态回写</span><span class="calendar-item__meta">02:00 · 制造组 · ChaRM 已通过</span></span>
                  <span class="pill pill--green"><span class="dot"></span>就绪</span>
                </div>
                <div class="calendar-item">
                  <span class="calendar-item__date"><b>18</b><span>周二</span></span>
                  <span class="calendar-item__main"><span class="calendar-item__title">R-2041 预算校验</span><span class="calendar-item__meta">21:00 · 财务共享组 · 设计评审中</span></span>
                  <span class="pill pill--slate">计划</span>
                </div>
              </div>
            </div>
            <div class="card-foot">
              <span class="sm">2 个上线窗口需要 CRQ 审批</span>
              <span class="grow"></span>
              <a class="link sm" href="#/tools/crq">CRQ 工单 ${ic("arrow-right")}</a>
            </div>
          </section>
        </div>
      </div>`;
    },
    after(ctx, root) {
      const rows = root.querySelectorAll(".demand-row");
      root.querySelectorAll(".home-filter button").forEach((btn) => {
        btn.addEventListener("click", () => {
          root.querySelectorAll(".home-filter button").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const label = btn.textContent.trim();
          const data = SA.data.demands;
          rows.forEach((row) => {
            const id = row.getAttribute("href").split("/").pop();
            const d = data.find((x) => x.id === id);
            if (!d) return;
            let show = true;
            if (label === "待我确认") show = d.status === "待确认" || d.status === "等待澄清";
            if (label === "我负责的") show = d.owner.includes("陈曦") || d.owner.includes("周予");
            row.style.display = show ? "" : "none";
          });
        });
      });
    },
  });
})();
