/* ============================================================
   Screen · Release doc + business approval (email + CRQ)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  SA.register("release", {
    title: "上线与审批",
    render(ctx) {
      const id = ctx.params.id || "R-2045";
      const demand = SA.data.demands.find((d) => d.id === id) || SA.data.demands[4];
      return `
      <div class="page page-release">
        <a class="back-link" href="#/demands/${demand.id}">${ic("arrow-left")} ${demand.id} ${SA.h(demand.title)}</a>

        <header class="release-head">
          <div>
            <div class="eyebrow">RELEASE · 上线与审批</div>
            <div class="release-title">
              <h1>上线文档与审批</h1>
              <span class="pill pill--amber pill--lg"><span class="dot"></span>等待业务审批</span>
              <span class="pill pill--outline pill--lg">v1.2 · 11-11 生成</span>
            </div>
            <p class="page-head__desc">${demand.id} · ${SA.h(demand.title)} · 计划 11-12 21:00 上线</p>
          </div>
          <div class="release-head__actions">
            <button class="btn">${ic("download")} 导出 .md</button>
            <button class="btn">${ic("edit")} 编辑</button>
            <button class="btn btn--primary" data-action="submit-crq">${ic("send")} 提交 CRQ 审批</button>
          </div>
        </header>

        <div class="release-layout">
          <div class="release-main">
            <article class="card release-doc">
              <div class="release-doc__head">
                <span class="release-doc__badge">${ic("file-text")}</span>
                <div class="grow">
                  <div class="release-doc__title">上线方案 · R-2045 月结自动化任务增加失败重跑入口</div>
                  <div class="release-doc__meta">AI 生成 · 沈珂 修订 · 传输 6 个 · 影响 1 个系统</div>
                </div>
                <span class="pill pill--green"><span class="dot"></span>文档完整</span>
              </div>

              <div class="release-doc__body doc">
                <h2>01 变更摘要</h2>
                <p>为月结批处理增加失败重跑入口：业务方可在监控页选择失败的月结任务并重新执行，系统记录重跑操作与审计日志。本次上线包含 1 个报表增强、2 个类方法调整、2 个配置表和 1 个权限角色。</p>

                <h2>02 传输清单</h2>
                <table>
                  <thead><tr><th>传输号</th><th>对象</th><th>类型</th><th>负责人</th><th>状态</th></tr></thead>
                  <tbody>
                    <tr><td><span class="mono">FY2K900142</span></td><td>ZFI_MONTH_END_RERUN</td><td>报表</td><td>周予</td><td><span class="pill pill--green">已释放</span></td></tr>
                    <tr><td><span class="mono">FY2K900142</span></td><td>ZCL_FI_MONTH_END_RUN</td><td>类方法</td><td>周予</td><td><span class="pill pill--green">已释放</span></td></tr>
                    <tr><td><span class="mono">FY2K900143</span></td><td>ZFI_MONTH_END_ROLE</td><td>权限角色</td><td>王栎</td><td><span class="pill pill--green">已释放</span></td></tr>
                    <tr><td><span class="mono">FY2K900143</span></td><td>ZV_FI_MONTH_END_CFG</td><td>配置表</td><td>沈珂</td><td><span class="pill pill--amber">待导入</span></td></tr>
                  </tbody>
                </table>

                <h2>03 上线步骤</h2>
                <div class="release-steps">
                  <div class="release-step"><span class="release-step__time mono">21:00</span><span class="release-step__dot"></span><span><b>冻结月结任务</b><em>停止 SM36 作业，确认无运行中批次</em></span><span class="tag">5 min</span></div>
                  <div class="release-step"><span class="release-step__time mono">21:10</span><span class="release-step__dot"></span><span><b>导入传输请求</b><em>FY2K900142 → FY2K900143，按顺序导入</em></span><span class="tag">10 min</span></div>
                  <div class="release-step"><span class="release-step__time mono">21:20</span><span class="release-step__dot"></span><span><b>激活对象并生成配置</b><em>激活类与报表，导入配置表 ZV_FI_MONTH_END_CFG</em></span><span class="tag">10 min</span></div>
                  <div class="release-step"><span class="release-step__time mono">21:30</span><span class="release-step__dot"></span><span><b>冒烟验证</b><em>重跑 1 个失败任务，核对审计日志与通知</em></span><span class="tag">15 min</span></div>
                  <div class="release-step is-done"><span class="release-step__time mono">21:45</span><span class="release-step__dot"></span><span><b>解冻并通知业务</b><em>恢复 SM36 作业，发送 Teams 上线完成通知</em></span><span class="tag">5 min</span></div>
                </div>

                <h2>04 回滚方案</h2>
                <p>如冒烟验证失败，在 22:00 前执行回滚：导入反向传输 <code>FY2K900144</code>，恢复月结作业并重新激活旧版本。回滚决策人为 <strong>陈曦</strong>（业务）与 <strong>王栎</strong>（Basis），触发条件为「重跑入口不可用」或「审计日志缺失」。</p>

                <h2>05 上线验证清单</h2>
                <ul class="release-checks">
                  <li>${ic("check")} 监控页展示失败的月结任务列表</li>
                  <li>${ic("check")} 重跑入口仅对财务共享组角色可见</li>
                  <li>${ic("check")} 每次重跑写入审计日志，含操作人与时间</li>
                  <li>${ic("check")} 重跑完成后触发 Teams 通知</li>
                  <li>${ic("check")} 原月结批处理不受影响</li>
                </ul>
              </div>
            </article>

            <section class="card approval-flow">
              <div class="card-head">
                <h3>审批流</h3>
                <span class="sm">邮件通知 · 业务方确认后提交 CRQ</span>
              </div>
              <div class="approval-steps">
                <div class="approval-step is-done">
                  <span class="approval-step__icon">${ic("check")}</span>
                  <span class="approval-step__main"><b>提交上线申请</b><em>沈珂 · 11-11 16:20</em></span>
                  <span class="pill pill--green">完成</span>
                </div>
                <div class="approval-step is-current">
                  <span class="approval-step__icon">${ic("mail")}</span>
                  <span class="approval-step__main"><b>邮件通知业务方确认</b><em>已发送至 chen.xi@sap.example · 等待回复</em></span>
                  <span class="pill pill--amber pill--live"><span class="dot"></span>等待中</span>
                </div>
                <div class="approval-step">
                  <span class="approval-step__icon">${ic("send")}</span>
                  <span class="approval-step__main"><b>提交 CRQ 工单</b><em>业务确认后自动提交 CRQ-2026-0842</em></span>
                  <span class="pill pill--slate">待触发</span>
                </div>
                <div class="approval-step">
                  <span class="approval-step__icon">${ic("upload")}</span>
                  <span class="approval-step__main"><b>上线执行</b><em>11-12 21:00 · 王栎执行，沈珂验证</em></span>
                  <span class="pill pill--slate">计划中</span>
                </div>
              </div>
            </section>

            <section class="mailcard release-mail">
              <div class="mailcard__head">
                <span class="mailcard__from">
                  <span class="mailcard__avatar">S</span>
                  <span><span class="mailcard__name">Super Agent</span><span class="mailcard__addr">no-reply@sap.example</span></span>
                </span>
                <span class="mailcard__time">16:21</span>
              </div>
              <div class="mailcard__subject">上线审批 · R-2045 月结自动化任务增加失败重跑入口</div>
              <div class="mailcard__body">
                <p>陈曦 你好，</p>
                <p>沈珂提交了 <strong>R-2045</strong> 的上线申请，计划上线窗口为 <strong>11-12 21:00–22:00</strong>。请确认上线内容与回滚方案：</p>
                <div class="mail-facts">
                  <span>影响系统：FIN · 月结批处理</span>
                  <span>传输：6 个 · 已释放 5 个</span>
                  <span>风险等级：中</span>
                </div>
                <div class="mail-actions">
                  <span class="mailcard__btn">查看并确认</span>
                  <span class="mail-actions__hint">演示：确权链接在本原型中不跳转</span>
                </div>
              </div>
            </section>
          </div>

          <aside class="release-aside">
            <section class="card release-gate">
              <div class="card-head"><h3>上线门禁</h3><span class="pill pill--amber">4/5</span></div>
              <div class="release-gate__checks">
                <div class="release-gate__row is-ok"><span>${ic("check")}</span><b>上线文档完整</b><em>v1.2 · 6 个传输</em></div>
                <div class="release-gate__row is-ok"><span>${ic("check")}</span><b>测试证据通过</b><em>G4 已验收 · 11-10</em></div>
                <div class="release-gate__row is-ok"><span>${ic("check")}</span><b>ChaRM 已审批</b><em>CR-44102 · Basis</em></div>
                <div class="release-gate__row is-warn"><span>${ic("alert-circle")}</span><b>CRQ 待提交</b><em>业务确认后自动提交</em></div>
                <div class="release-gate__row is-ok"><span>${ic("check")}</span><b>回滚方案已确认</b><em>反向传输 FY2K900144</em></div>
              </div>
              <button class="btn btn--primary btn--block" data-action="submit-crq">${ic("send")} 提交 CRQ 审批</button>
              <p class="release-gate__hint">提交后将发送邮件给 SAP 业务方，并在 CRQ 队列中创建工单。</p>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>上线窗口</h3></div>
              <div class="release-window">
                <div class="release-window__date"><b>12</b><span>11 月 · 周三</span></div>
                <div class="release-window__time mono">21:00 — 22:00</div>
                <span class="pill pill--blue">已锁定</span>
              </div>
              <div class="side-kv">
                <div><span>上线类型</span><b>常规变更</b></div>
                <div><span>风险等级</span><b class="amber">中</b></div>
                <div><span>停机需求</span><b>无需停机</b></div>
                <div><span>业务确认人</span><b>陈曦</b></div>
              </div>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>审批与执行人</h3></div>
              <div class="people-list">
                <div class="people-row"><span class="avatar avatar--sm" data-tone="ink">陈</span><span class="grow"><b>陈曦</b><em>业务审批 · 财务共享组</em></span><span class="pill pill--amber">待确认</span></div>
                <div class="people-row"><span class="avatar avatar--sm" data-tone="rose">王</span><span class="grow"><b>王栎</b><em>Basis · 执行上线</em></span><span class="pill pill--outline">执行</span></div>
                <div class="people-row"><span class="avatar avatar--sm" data-tone="violet">沈</span><span class="grow"><b>沈珂</b><em>SAP IT · 验证</em></span><span class="pill pill--outline">验证</span></div>
              </div>
            </section>

            <section class="aside-block">
              <div class="aside-block__head"><h3>关联单据</h3></div>
              <div class="linked-tickets">
                <a class="linked-ticket" href="#/tools/charm"><span class="linked-ticket__icon linked-ticket__icon--violet">${ic("git-branch")}</span><span class="grow"><b>CR-44102</b><em>ChaRM · Basis 已通过</em></span><span class="pill pill--green">就绪</span></a>
                <a class="linked-ticket" href="#/tools/crq"><span class="linked-ticket__icon linked-ticket__icon--blue">${ic("file-text")}</span><span class="grow"><b>CRQ-2026-0842</b><em>待提交</em></span><span class="pill pill--slate">草稿</span></a>
              </div>
            </section>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      const submit = () => {
        SA.modal({
          title: "提交上线审批",
          desc: "将同时执行 3 个动作：发送邮件给业务审批人、创建 CRQ 工单、写入上线事件。",
          body:
            '<div class="submit-success">' +
            '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--blue">' + ic("mail") + '</span><span><b>邮件通知 SAP 业务</b><em>chen.xi@sap.example · 含确认深链</em></span><span class="pill pill--blue">将发送</span></div>' +
            '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--teal">' + ic("file-text") + '</span><span><b>创建 CRQ 工单</b><em>财务共享组模板 v3 · 6 个传输</em></span><span class="pill pill--teal">将创建</span></div>' +
            '<div class="submit-success__row"><span class="submit-success__icon">' + ic("git-commit") + '</span><span><b>写入上线事件</b><em>release.submitted · 可追溯</em></span><span class="pill pill--green">自动</span></div>' +
            "</div>" +
            '<div class="callout callout--amber" style="margin-top:14px">' + ic("alert-triangle") + "<span>提交后业务方需在邮件中确认，确认前不会真正提交到 SolMan。</span></div>",
          wide: true,
          actions: [
            { label: "取消", variant: "ghost" },
            {
              label: "确认提交",
              variant: "primary",
              onClick: () => {
                SA.modal({
                  title: "已提交上线审批",
                  desc: "邮件已发送，CRQ-2026-0842 已进入待审批队列。",
                  body:
                    '<div class="release-success">' +
                    '<div class="release-success__icon">' + ic("check") + "</div>" +
                    '<div class="release-success__title">等待 SAP 业务确认</div>' +
                    '<div class="release-success__sub">邮件已送达 陈曦；确认后自动提交 CRQ，可在队列中查看投递状态。</div>' +
                    '<div class="release-success__timeline">' +
                    '<span class="is-done">' + ic("check") + " 邮件已发送</span>" +
                    '<span class="is-current">' + ic("clock") + " 等待业务确认</span>" +
                    '<span>' + ic("send") + " 提交 CRQ</span>" +
                    "</div></div>",
                  wide: true,
                  actions: [
                    { label: "查看队列", variant: "ghost", onClick: () => SA.go("#/ops/queue") },
                    { label: "返回需求", variant: "primary", onClick: () => SA.go("#/demands/" + (ctx.params.id || "R-2045")) },
                  ],
                });
              },
            },
          ],
        });
      };
      root.querySelectorAll("[data-action='submit-crq']").forEach((b) => b.addEventListener("click", submit));
    },
  });
})();
