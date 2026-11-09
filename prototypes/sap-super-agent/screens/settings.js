/* ============================================================
   Screen · Settings (integrations / groups / security / notify)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const TABS = [
    { key: "integration", label: "集成", icon: "plug" },
    { key: "groups", label: "小组与成员", icon: "users" },
    { key: "security", label: "安全与绑定", icon: "shield" },
    { key: "notify", label: "通知规则", icon: "bell" },
  ];

  const INTEGRATIONS = [
    { name: "Microsoft Teams", desc: "门禁通知、需求澄清、上线审批", status: "已连接", tone: "green", icon: "users", meta: [["工作区", "SAP 财务交付"], ["频道", "#fin-sap-it"], ["最近投递", "0.9s · 10:42"]], action: "发送测试消息" },
    { name: "企业邮件 SMTP", desc: "一次性注册链接、上线审批邮件", status: "已连接", tone: "green", icon: "mail", meta: [["发件人", "no-reply@sap.example"], ["最近发送", "今天 16:21"], ["退信率", "0.2%"]], action: "发送测试邮件" },
    { name: "JIRA", desc: "Backlog 双向同步、Issue 关联", status: "已连接", tone: "green", icon: "trello", meta: [["Project", "SAP"], ["同步方向", "双向"], ["最近同步", "2 分钟前"]], action: "立即同步" },
    { name: "SolMan CRQ API", desc: "外部工单号、模板字段编排", status: "已连接", tone: "green", icon: "file-text", meta: [["Client", "200 · FY2"], ["平均耗时", "12.4s"], ["最近调用", "10:42"]], action: "测试接口" },
    { name: "ChaRM API", desc: "Change Request / Document 同步", status: "同步中", tone: "teal", icon: "git-branch", meta: [["系统", "FY2 · 200"], ["轮询间隔", "60s"], ["最近拉取", "12s 前"]], action: "查看同步日志" },
    { name: "AI 网关", desc: "BYOK · 进入澄清与文档阶段", status: "已连接", tone: "green", icon: "sparkles", meta: [["模型", "deepseek-v4"], ["本月 tokens", "2.4M"], ["成本上限", "$50 / 月"]], action: "调整模型" },
  ];

  const SETTINGS_HTML = {
    integration: () => `
      <div class="settings-section">
        <div class="section-head"><h2>集成</h2><span class="sm">外部系统的连接状态与最近一次成功调用</span></div>
        <div class="integration-grid">
          ${INTEGRATIONS.map(
            (s) => `
            <div class="integration-card card">
              <div class="integration-card__head">
                <span class="integration-card__icon integration-card__icon--${s.tone}">${ic(s.icon)}</span>
                <span class="grow"><b>${s.name}</b><em>${s.desc}</em></span>
                <span class="pill pill--${s.tone}">${s.tone === "teal" ? '<span class="dot"></span>' : '<span class="dot"></span>'}${s.status}</span>
              </div>
              <div class="integration-card__meta">
                ${s.meta.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}
              </div>
              <div class="integration-card__foot">
                <button class="btn btn--sm btn--ghost" data-action="integration-test">${s.action}</button>
                <span class="grow"></span>
                <button class="btn btn--sm">${ic("settings")} 配置</button>
              </div>
            </div>`
          ).join("")}
        </div>
      </div>

      <div class="settings-section settings-two">
        <div class="card">
          <div class="card-head"><h3>Webhook 订阅</h3><button class="btn btn--sm">${ic("plus")} 新建订阅</button></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>事件</th><th>目标</th><th>状态</th><th>最近投递</th></tr></thead>
            <tbody>
              <tr><td><span class="mono sm">approval.requested</span></td><td>teams-notify</td><td><span class="pill pill--green"><span class="dot"></span>启用</span></td><td class="sm">0.9s</td></tr>
              <tr><td><span class="mono sm">demand.submitted</span></td><td>jira-sync</td><td><span class="pill pill--green"><span class="dot"></span>启用</span></td><td class="sm">1.2s</td></tr>
              <tr><td><span class="mono sm">stage.done</span></td><td>confluence</td><td><span class="pill pill--amber"><span class="dot"></span>死信 1</span></td><td class="sm">—</td></tr>
              <tr><td><span class="mono sm">release.submitted</span></td><td>smtp-approval</td><td><span class="pill pill--green"><span class="dot"></span>启用</span></td><td class="sm">16:21</td></tr>
            </tbody>
          </table></div>
          <div class="table-foot"><span class="sm">订阅事件来自控制平面持久事件；失败会进入死信并保留 payload。</span><span class="grow"></span><a class="link sm" href="#/ops/queue">查看队列 ${ic("arrow-right")}</a></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>服务账号</h3><span class="sm">控制平面 → SAP</span></div>
          <div class="service-account">
            <div><span>账号</span><b class="mono">SV_SA_AGENT</b></div>
            <div><span>作用域</span><b>需求读写 · 审批回写</b></div>
            <div><span>凭据</span><b>Secret Manager · 每 90 天轮换</b></div>
            <div><span>上次轮换</span><b>2026-10-20</b></div>
          </div>
          <div class="callout callout--blue" style="margin:12px 16px 16px">${ic("shield")}<span>凭据只在服务端使用，不会下发到客户端或进入模型上下文。</span></div>
        </div>
      </div>`,

    groups: () => `
      <div class="settings-section">
        <div class="section-head">
          <div>
            <h2>小组与成员</h2>
          </div>
          <div class="row gap-2">
            <button class="btn btn--sm" data-action="create-group">${ic("plus")} 新建小组</button>
            <button class="btn btn--sm btn--primary" data-action="invite-member">${ic("user-plus")} 邀请成员</button>
          </div>
        </div>
        <div class="callout callout--blue" style="margin-bottom:14px">
          ${ic("users")}
          <span><b style="font-weight:600">一个账号只属于一个小组。</b>小组决定需求、任务、模板与通知的默认归属；跨组协作通过任务转交或文档授权完成。</span>
        </div>
        <div class="group-cards">
          ${SA.data.groups.map(
            (g) => `
            <div class="group-card card ${g.key === SA.data.user.groupKey ? "is-active" : ""}">
              <div class="group-card__head">
                <span class="group-switch__icon">${g.key.split("-")[0]}</span>
                <span class="grow"><b>${g.name}</b><em>${g.key} · ${g.members} 位成员</em></span>
                ${g.key === SA.data.user.groupKey ? '<span class="pill pill--blue">我的小组</span>' : ""}
              </div>
              <div class="group-card__meta"><span>默认模板</span><b>PDO v4</b><span>默认审批</span><b>林桦</b></div>
              <div class="group-card__foot">
                <button class="btn btn--sm btn--ghost" data-action="manage-group" data-group="${g.key}">管理小组</button>
                <span class="grow"></span>
                <button class="btn btn--sm" data-action="manage-group" data-group="${g.key}" aria-label="小组设置">${ic("settings")}</button>
              </div>
            </div>`
          ).join("")}
        </div>

        <div class="card" style="margin-top:14px">
          <div class="card-head"><h3>财务共享组成员</h3><span class="sm">12 人 · 3 位管理员 · 1 位待接受邀请</span></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>成员</th><th>邮箱</th><th>角色</th><th>所属小组</th><th>设备绑定</th><th>最近活跃</th><th></th></tr></thead>
            <tbody>
              ${[
                ["陈曦", "chen.xi@sap.example", "SAP 业务", "已绑定 · MacBook Pro", "刚刚", "ink"],
                ["林桦", "lin.hua@sap.example", "需求顾问", "已绑定 · Windows", "12 分钟前", "teal"],
                ["周予", "zhou.yu@sap.example", "SAP IT · ABAP", "已绑定 · MacBook Pro", "今天 09:18", "blue"],
                ["沈珂", "shen.ke@sap.example", "SAP IT · 前端", "已绑定 · WSL-02", "今天 08:42", "violet"],
                ["王栎", "wang.li@sap.example", "Basis / ChaRM", "已绑定 · 办公机", "今天 08:12", "rose"],
                ["顾遥", "gu.yao@sap.example", "测试", "未绑定", "昨天", "amber"],
              ]
                .map(
                  ([name, email, role, device, active, tone]) => `
                <tr>
                  <td><span class="member-cell"><span class="avatar avatar--sm" data-tone="${tone}">${name[0]}</span>${name}</span></td>
                  <td><span class="mono sm">${email}</span></td>
                  <td><span class="pill pill--outline">${role}</span></td>
                  <td><span class="pill pill--slate" style="font-size:8.5px">财务共享组</span></td>
                  <td><span class="sm ${device === "未绑定" ? "muted" : ""}">${device}</span></td>
                  <td><span class="sm muted">${active}</span></td>
                  <td><button class="icon-btn icon-btn--sm" data-action="member-more">${ic("more-horizontal")}</button></td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table></div>
          <div class="table-foot"><span class="sm">成员只能属于一个小组；调整小组通过管理员操作完成。未绑定成员下次访问需通过一次性链接完成设备绑定。</span></div>
        </div>

        <div class="settings-two" style="margin-top:14px">
          <div class="card">
            <div class="card-head"><h3>分组规则</h3><span class="pill pill--outline">管理员</span></div>
            <div class="settings-kv">
              <div><span>账号归属</span><b>每人仅 1 个小组</b></div>
              <div><span>默认审批人</span><b>林桦 · 需求顾问</b></div>
              <div><span>默认阶段模板</span><b>PDO 六阶段 · v4</b></div>
              <div><span>需求可见性</span><b>仅本组可见</b></div>
              <div><span>跨组协作</span><b>任务转交 / 文档授权</b></div>
              <div><span>通知归属</span><b>按小组默认频道 #fin-sap-it</b></div>
            </div>
            <div class="integration-card__foot"><button class="btn btn--sm" data-action="edit-group-rules">${ic("edit")} 修改分组规则</button></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>成员变更</h3><span class="sm">最近 7 天</span></div>
            <div class="change-list">
              <div class="change-row"><span class="change-row__icon" style="color:var(--green)">${ic("user-plus")}</span><span class="change-row__main"><b>顾遥 加入财务共享组</b><em>邀请已接受 · 11-09 14:20</em></span></div>
              <div class="change-row"><span class="change-row__icon" style="color:var(--ink-4)">${ic("user")}</span><span class="change-row__main"><b>王栎 角色调整为 Basis / ChaRM</b><em>管理员 林桦 · 11-08 10:02</em></span></div>
              <div class="change-row"><span class="change-row__icon" style="color:var(--ink-4)">${ic("users")}</span><span class="change-row__main"><b>小组默认模板切换到 PDO v4</b><em>仅影响新建需求 · 11-06 17:30</em></span></div>
            </div>
          </div>
        </div>
      </div>`,

    security: () => `
      <div class="settings-section">
        <div class="section-head"><h2>安全与绑定</h2><span class="sm">一次性链接、浏览器指纹与设备凭证策略</span></div>
        <div class="settings-two">
          <div class="card">
            <div class="card-head"><h3>一次性链接</h3><span class="pill pill--green">启用</span></div>
            <div class="settings-kv">
              <div><span>链接有效期</span><b>10 分钟</b></div>
              <div><span>使用次数</span><b>仅 1 次</b></div>
              <div><span>绑定要素</span><b>邮箱 + 浏览器指纹 + 访问 IP + 用户名</b></div>
              <div><span>设备凭证有效期</span><b>180 天 · HttpOnly Cookie</b></div>
              <div><span>重新注册</span><b>用户可在账户菜单自助发起</b></div>
              <div><span>旧设备处理</span><b>重新绑定后立即吊销</b></div>
            </div>
            <div class="integration-card__foot"><button class="btn btn--sm btn--ghost">查看策略</button><span class="grow"></span><button class="btn btn--sm">${ic("edit")} 修改</button></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>当前设备</h3><span class="sm">1 台已绑定</span></div>
            <div class="device-block">
              <div class="device-block__main">
                <span class="device-block__icon">${ic("monitor")}</span>
                <div><b>MacBook Pro · Chrome 156</b><em>fp_9a3f…c41d · 10.42.8.17 · 绑定于 2026-05-12</em></div>
                <span class="pill pill--green">当前设备</span>
              </div>
              <div class="device-block__actions">
                <a class="btn btn--sm" href="#/rebind">${ic("refresh")} 重新注册此设备</a>
                <button class="btn btn--sm btn--danger">解除绑定</button>
              </div>
            </div>
            <div class="card-head" style="border-top:1px solid var(--line-soft)"><h3>已解除设备</h3></div>
            <div class="device-block__row"><span class="mono">Windows 11 · Edge 142</span><span class="sm muted">10.42.8.22 · 解除于 11-08</span><span class="pill pill--slate">已吊销</span></div>
            <div class="callout callout--amber" style="margin:12px 16px 16px">${ic("alert-triangle")}<span>重新注册会立即吊销旧设备凭证。若发现异常绑定，请联系小组管理员并重置账户。</span></div>
          </div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="card-head"><h3>安全事件</h3><a class="link sm" href="#/ops/queue">审计日志 ${ic("arrow-right")}</a></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>时间</th><th>事件</th><th>用户</th><th>IP / 设备</th><th>结果</th></tr></thead>
            <tbody>
              <tr><td><span class="mono sm">今天 09:02</span></td><td>设备绑定成功</td><td>陈曦</td><td class="mono sm">10.42.8.17 · fp_9a3f</td><td><span class="pill pill--green">成功</span></td></tr>
              <tr><td><span class="mono sm">昨天 18:40</span></td><td>重新注册请求</td><td>周予</td><td class="mono sm">10.42.8.31 · fp_2c11</td><td><span class="pill pill--green">成功</span></td></tr>
              <tr><td><span class="mono sm">11-08 14:12</span></td><td>指纹不匹配，要求重新验证</td><td>顾遥</td><td class="mono sm">10.42.9.02 · fp_ab77</td><td><span class="pill pill--amber">已拦截</span></td></tr>
            </tbody>
          </table></div>
        </div>
      </div>`,

    notify: () => `
      <div class="settings-section">
        <div class="section-head"><h2>通知规则</h2><span class="sm">只通知必须你处理的事；其余默认静默</span></div>
        <div class="card">
          <div class="card-head"><h3>事件订阅</h3><span class="sm">按角色生效</span></div>
          <div class="notify-matrix">
            <div class="notify-matrix__head"><span>事件</span><span>Teams</span><span>邮件</span><span>站内</span></div>
            ${[
              ["门禁待确认（@我）", true, false, true],
              ["上线审批（@业务）", true, true, true],
              ["任务可领取", false, false, true],
              ["等待我回答", true, false, true],
              ["投递失败 / 死信", false, true, true],
              ["周报汇总", false, true, false],
            ]
              .map(
                ([label, teams, mail, inapp]) => `
              <div class="notify-matrix__row">
                <span>${label}</span>
                <span><button class="switch ${teams ? "is-on" : ""}" aria-label="Teams"></button></span>
                <span><button class="switch ${mail ? "is-on" : ""}" aria-label="邮件"></button></span>
                <span><button class="switch ${inapp ? "is-on" : ""}" aria-label="站内"></button></span>
              </div>`
              )
              .join("")}
          </div>
          <div class="notify-quiet">
            <span>${ic("clock")} 免打扰</span>
            <b>工作日 20:00 — 次日 08:00</b>
            <span class="sm">紧急门禁与上线审批不受限制</span>
            <span class="grow"></span>
            <button class="btn btn--sm">修改</button>
          </div>
        </div>
      </div>`,
  };

  SA.register("settings", {
    title: "集成与设置",
    render(ctx) {
      const tab = ctx.query.get("tab") || "integration";
      return `
      <div class="page page-settings">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">SPACE · 设置</div>
            <h1>集成与设置</h1>
            <p class="page-head__desc">外部系统连接、小组成员、设备绑定与通知规则。只有管理员可以修改集成凭据。</p>
          </div>
          <div class="page-head__actions">
            <span class="pill pill--outline">${ic("shield")} 管理员</span>
            <button class="btn btn--primary">${ic("check")} 保存</button>
          </div>
        </div>

        <div class="settings-tabs">
          ${TABS.map(
            (t) => `<a class="settings-tab ${tab === t.key ? "is-active" : ""}" href="#/settings?tab=${t.key}">${ic(t.icon)}${t.label}</a>`
          ).join("")}
        </div>

        <div id="settings-content">
          ${(SETTINGS_HTML[tab] || SETTINGS_HTML.integration)()}
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll("[data-action='integration-test']").forEach((b) => {
        b.addEventListener("click", () => {
          b.classList.add("is-loading");
          setTimeout(() => {
            b.classList.remove("is-loading");
            SA.toast("测试成功 · 200 OK · 0.8s", { icon: "check-circle" });
          }, 900);
        });
      });
      root.querySelectorAll(".switch").forEach((s) => {
        s.addEventListener("click", () => s.classList.toggle("is-on"));
      });
      root.addEventListener("click", (e) => {
        const el = e.target.closest("[data-action]");
        if (!el) return;
        const action = el.dataset.action;
        if (action === "manage-group") {
          const key = el.dataset.group || "FIN-SH";
          const g = SA.data.groups.find((x) => x.key === key) || SA.data.groups[0];
          SA.modal({
            title: "管理小组 · " + g.name,
            desc: "小组成员与默认配置。一个账号只属于一个小组。",
            wide: true,
            body:
              '<div class="form-row form-row--2">' +
              '<div class="field"><span class="field__label">小组名称</span><input class="input" value="' + g.name + '" /></div>' +
              '<div class="field"><span class="field__label">小组 Key</span><input class="input mono" value="' + g.key + '" readonly /></div>' +
              "</div>" +
              '<div class="form-row form-row--2" style="margin-top:12px">' +
              '<div class="field"><span class="field__label">默认阶段模板</span><select class="select"><option>PDO 六阶段 · v4</option><option>默认三阶段 · v2</option></select></div>' +
              '<div class="field"><span class="field__label">默认审批人</span><select class="select"><option>林桦 · 需求顾问</option><option>陈曦 · 业务方</option></select></div>' +
              "</div>" +
              '<div class="field" style="margin-top:12px"><span class="field__label">成员</span><div class="owner-picker"><div class="owner-picker__selected">' +
              ["陈曦", "林桦", "周予", "沈珂", "王栎", "顾遥"].map((n) => '<span class="owner-chip"><span class="avatar avatar--sm" data-tone="slate">' + n[0] + "</span>" + n + '<span class="owner-chip__role">成员</span></span>').join("") +
              '<button class="owner-picker__add">' + ic("plus") + " 添加成员</button></div></div></div>" +
              '<div class="callout callout--blue" style="margin-top:12px">' + ic("info") + "<span>成员从一个小组转移到另一个小组时，其历史需求与任务仍归属原小组，新的需求按新小组归属。</span></div>",
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "保存", variant: "primary", onClick: () => SA.toast("小组配置已保存") },
            ],
          });
        } else if (action === "create-group") {
          SA.modal({
            title: "新建小组",
            desc: "小组用于隔离需求、模板与通知默认值。",
            body:
              '<div class="field"><span class="field__label">小组名称</span><input class="input" placeholder="例如：财务共享组" /></div>' +
              '<div class="form-row form-row--2" style="margin-top:12px">' +
              '<div class="field"><span class="field__label">小组 Key</span><input class="input mono" placeholder="FIN-SH" /></div>' +
              '<div class="field"><span class="field__label">默认模板</span><select class="select"><option>PDO 六阶段 · v4</option><option>默认三阶段 · v2</option></select></div>' +
              "</div>" +
              '<div class="callout callout--blue" style="margin-top:12px">' + ic("info") + "<span>成员加入小组后不可同时属于其他小组；跨组协作通过任务转交完成。</span></div>",
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "创建小组", variant: "primary", onClick: () => SA.toast("小组已创建") },
            ],
          });
        } else if (action === "invite-member") {
          SA.modal({
            title: "邀请成员",
            desc: "邀请会绑定邮箱与小组，成员点击一次性链接后加入。",
            body:
              '<div class="field"><span class="field__label">姓名</span><input class="input" placeholder="例如：顾遥" /></div>' +
              '<div class="field" style="margin-top:12px"><span class="field__label">企业邮箱</span><input class="input" type="email" placeholder="you@sap.example" /></div>' +
              '<div class="form-row form-row--2" style="margin-top:12px">' +
              '<div class="field"><span class="field__label">小组</span><select class="select"><option>财务共享组 · FIN-SH</option><option>供应链组 · SCM-CN</option><option>制造组 · MFG-CN</option></select></div>' +
              '<div class="field"><span class="field__label">角色</span><select class="select"><option>SAP 业务</option><option>需求顾问</option><option>SAP IT · 开发</option><option>Basis / ChaRM</option></select></div>' +
              "</div>" +
              '<div class="callout callout--blue" style="margin-top:12px">' + ic("mail") + "<span>邀请邮件包含一次性绑定链接，10 分钟内有效。</span></div>",
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "发送邀请", variant: "primary", onClick: () => SA.toast("邀请已发送") },
            ],
          });
        } else if (action === "edit-group-rules") {
          SA.toast("演示：打开分组规则编辑");
        } else if (action === "member-more") {
          SA.modal({
            title: "成员操作",
            desc: "成员只能属于一个小组，调整归属会记录审计事件。",
            body:
              '<div class="kv">' +
              '<div class="kv-row"><span class="kv-key">角色</span><span class="kv-val">调整角色 / 权限</span></div>' +
              '<div class="kv-row"><span class="kv-key">设备</span><span class="kv-val">解除设备绑定 / 要求重新注册</span></div>' +
              '<div class="kv-row"><span class="kv-key">小组</span><span class="kv-val">转移至其他小组（审计）</span></div>' +
              '<div class="kv-row"><span class="kv-key">危险</span><span class="kv-val" style="color:var(--red)">移除成员</span></div>' +
              "</div>",
            actions: [{ label: "关闭", variant: "ghost" }],
          });
        }
      });
    },
  });
})();
