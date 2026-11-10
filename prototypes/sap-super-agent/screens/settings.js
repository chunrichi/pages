/* ============================================================
   Screen · Personal settings (account / devices / notify)
   管理类操作（成员、集成、审计）在 #/admin，不在个人设置里
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const TABS = [
    { key: "account", label: "账号与设备", icon: "user" },
    { key: "notify", label: "通知规则", icon: "bell" },
  ];

  function adminLevel() {
    const admin = SA.auth.account.admin;
    if (admin === "platform") return "平台管理员";
    if (admin === "group") return "小组管理员";
    return "成员";
  }

  const SETTINGS_HTML = {
    account() {
      const a = SA.auth.account;
      const isAdmin = SA.auth.can("admin.access");
      return `
      <div class="settings-section">
        <div class="settings-two">
          <div class="col gap-3">
            <section class="card">
              <div class="card-head"><h3>我的账号</h3></div>
              <div class="card-body" style="padding-bottom:8px">
                <div class="row gap-3">
                  <span class="avatar avatar--lg" data-tone="ink">${SA.h(a.name[0])}</span>
                  <span class="col gap-1">
                    <b>${SA.h(a.name)}</b>
                    <span class="sm mono">${SA.h(a.email)}</span>
                  </span>
                </div>
              </div>
              <div class="settings-kv">
                <div><span>所属小组</span><b>${SA.h(a.groupName)} · ${SA.h(a.groupKey)}</b></div>
                <div><span>业务角色</span><b>${SA.h(a.businessRole)}</b></div>
                <div><span>管理权限</span><b>${adminLevel()}</b></div>
                <div><span>邀请人</span><b>${SA.h(a.invitedBy || "—")}</b></div>
                <div><span>加入时间</span><b>${SA.h(a.joinedAt || "—")}</b></div>
              </div>
            </section>

            <section class="card">
              <div class="card-head"><h3>一次性链接</h3><span class="pill pill--slate">平台策略</span></div>
              <div class="settings-kv">
                <div><span>链接有效期</span><b>10 分钟</b></div>
                <div><span>使用次数</span><b>仅 1 次</b></div>
                <div><span>绑定要素</span><b>邮箱 + 浏览器指纹 + 访问 IP + 用户名</b></div>
                <div><span>设备凭证有效期</span><b>180 天 · HttpOnly Cookie</b></div>
                <div><span>旧设备处理</span><b>重新绑定后立即吊销</b></div>
              </div>
              <div class="integration-card__foot">
                <span class="sm">由平台管理员设置</span>
                ${
                  isAdmin
                    ? '<span class="grow"></span><a class="link sm" href="#/admin?tab=groups">去管理控制台 ' + ic("arrow-right") + "</a>"
                    : ""
                }
              </div>
            </section>
          </div>

          <div class="col gap-3">
            <section class="card">
              <div class="card-head"><h3>当前设备</h3><span class="sm">1 台已绑定</span></div>
              <div class="device-block">
                <div class="device-block__main">
                  <span class="device-block__icon">${ic("monitor")}</span>
                  <div>
                    <b>MacBook Pro · Chrome 156</b>
                    <em>fp_9a3f…c41d · 10.42.8.17 · 绑定于 2026-05-12</em>
                  </div>
                  <span class="pill pill--green">当前设备</span>
                </div>
                <div class="device-block__actions">
                  <a class="btn btn--sm" href="#/rebind">${ic("refresh")} 重新注册此设备</a>
                  <button class="btn btn--sm btn--danger" data-action="unbind-device">解除绑定</button>
                </div>
              </div>
              <div class="card-head" style="border-top:1px solid var(--line-soft)"><h3>已解除设备</h3></div>
              <div class="device-block__row">
                <span class="mono">Windows 11 · Edge 142</span>
                <span class="sm muted">10.42.8.22 · 解除于 11-08</span>
                <span class="pill pill--slate">已吊销</span>
              </div>
              <div class="callout callout--amber" style="margin:12px 16px 16px">${ic("alert-triangle")}<span>重新注册会立即吊销旧设备凭证。若发现异常绑定，请联系小组管理员并重置账户。</span></div>
            </section>

            <section class="card">
              <div class="card-head">
                <h3>安全事件</h3>
                ${isAdmin ? '<a class="link sm" href="#/admin?tab=audit">审计日志 ' + ic("arrow-right") + "</a>" : ""}
              </div>
              <div class="table-wrap"><table class="table">
                <thead><tr><th>时间</th><th>事件</th><th>用户</th><th>IP / 设备</th><th>结果</th></tr></thead>
                <tbody>
                  <tr><td><span class="mono sm" style="white-space:nowrap">今天 09:02</span></td><td>设备绑定成功</td><td style="white-space:nowrap">陈曦</td><td class="mono sm">10.42.8.17 · fp_9a3f</td><td><span class="pill pill--green">成功</span></td></tr>
                  <tr><td><span class="mono sm" style="white-space:nowrap">昨天 18:40</span></td><td>重新注册请求</td><td style="white-space:nowrap">周予</td><td class="mono sm">10.42.8.31 · fp_2c11</td><td><span class="pill pill--green">成功</span></td></tr>
                  <tr><td><span class="mono sm" style="white-space:nowrap">11-08 14:12</span></td><td>指纹不匹配，要求重新验证</td><td style="white-space:nowrap">顾遥</td><td class="mono sm">10.42.9.02 · fp_ab77</td><td><span class="pill pill--amber">已拦截</span></td></tr>
                </tbody>
              </table></div>
            </section>
          </div>
        </div>
      </div>`;
    },

    notify() {
      return `
      <div class="settings-section">
        <div class="card">
          <div class="card-head"><h3>事件订阅</h3><span class="sm">按账号生效</span></div>
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
            <button class="btn btn--sm" data-action="edit-quiet">修改</button>
          </div>
        </div>
      </div>`;
    },
  };

  SA.register("settings", {
    title: "个人设置",
    render(ctx) {
      const requested = ctx.query.get("tab");
      const tab = TABS.some((t) => t.key === requested) ? requested : "account";
      const isAdmin = SA.auth.can("admin.access");
      return `
      <div class="page page-settings">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">SPACE · 账户</div>
            <h1>个人设置</h1>
            <p class="page-head__desc">账号、设备与通知规则；小组成员与集成维护在管理控制台。</p>
          </div>
          <div class="page-head__actions">
            ${
              isAdmin
                ? '<a class="btn" href="#/admin?tab=groups">' + ic("shield") + " 管理控制台</a>"
                : '<span class="pill pill--outline">成员</span>'
            }
          </div>
        </div>

        <div class="settings-tabs">
          ${TABS.map(
            (t) => `<a class="settings-tab ${tab === t.key ? "is-active" : ""}" href="#/settings?tab=${t.key}">${ic(t.icon)}${t.label}</a>`
          ).join("")}
        </div>

        <div id="settings-content">
          ${SETTINGS_HTML[tab]()}
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll(".switch").forEach((s) => {
        s.addEventListener("click", () => s.classList.toggle("is-on"));
      });

      const unbind = root.querySelector("[data-action='unbind-device']");
      if (unbind) {
        unbind.addEventListener("click", () => {
          SA.confirm({
            title: "解除当前设备绑定？",
            desc: "解除后本设备的凭证立即失效，下次访问需要重新注册。",
            danger: true,
            okLabel: "解除绑定",
            onOk: () => SA.toast("已解除绑定，设备凭证立即失效", { icon: "shield" }),
          });
        });
      }

      const quiet = root.querySelector("[data-action='edit-quiet']");
      if (quiet) {
        quiet.addEventListener("click", () => {
          SA.modal({
            title: "修改免打扰时段",
            desc: "紧急门禁与上线审批不受免打扰限制。",
            body:
              '<div class="form-row form-row--2">' +
              '<div class="field"><span class="field__label">开始</span><select class="select"><option>20:00</option><option>21:00</option><option>22:00</option></select></div>' +
              '<div class="field"><span class="field__label">结束</span><select class="select"><option>08:00</option><option>07:00</option><option>09:00</option></select></div>' +
              "</div>",
            actions: [
              { label: "取消", variant: "ghost" },
              { label: "保存", variant: "primary", onClick: () => SA.toast("免打扰时段已更新") },
            ],
          });
        });
      }
    },
  });
})();
