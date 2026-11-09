/* ============================================================
   Screens · auth / device binding
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  function brandPanel(activeStep) {
    const steps = [
      { n: "01", title: "邮箱邀请", desc: "账号由小组管理员邀请，确认企业邮箱。" },
      { n: "02", title: "设备绑定", desc: "一次性链接 + 浏览器指纹 + 访问 IP。" },
      { n: "03", title: "免登录进入", desc: "此设备后续访问直接进入工作台。" },
    ];
    return `
    <section class="auth__brand">
      <div class="auth__logo">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 7.5 12 3l7 4.5v9L12 21l-7-4.5v-9Z" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 10.2c1.9-1.3 4.9-1.3 6.8 0M8.6 13.8c1.9 1.3 4.9 1.3 6.8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </span>
        <span class="brand__text">
          <span class="brand__name">Super Agent</span>
          <span class="brand__sub">SAP 交付工作台</span>
        </span>
      </div>

      <div class="auth__hero">
        <div class="auth__kicker"><i></i> SAP DELIVERY WORKSPACE · 2026</div>
        <h1 class="auth__title">让需求<br />自己<em>往前跑</em>。</h1>
        <p class="auth__lead">需求澄清、过程文档、CRQ 与 ChaRM、代码开发，被一条可追溯的自动化链路串起来。人只需要在关键的门禁上做判断。</p>

        <div class="auth__flow">
          ${steps
            .map(
              (s, i) => `
            <div class="auth-flow-step ${i <= activeStep ? "is-active" : ""}">
              <span class="auth-flow-step__icon">${i < activeStep ? ic("check") : ic(i === 0 ? "mail" : i === 1 ? "fingerprint" : "log-out")}</span>
              <span>
                <span class="auth-flow-step__title">${s.n} · ${s.title}</span>
                <span class="auth-flow-step__desc">${s.desc}</span>
              </span>
            </div>`
            )
            .join("")}
        </div>
      </div>

      <div class="auth__brand-foot">
        <span>Internal preview · v2.0</span>
        <span class="mono">SSO · FINGERPRINT · ONE-TIME LINK</span>
      </div>
    </section>`;
  }

  function layout(activeStep, panel) {
    return brandPanel(activeStep) + `<section class="auth__panel">${panel}</section>`;
  }

  /* ------------------------------------------------------------
     welcome
     ------------------------------------------------------------ */
  SA.register("welcome", {
    title: "注册账号",
    render() {
      return layout(
        0,
        `<div class="auth-card">
          <div class="auth-card__head">
            <div class="auth-card__eyebrow">ACCOUNT LINKING · 账号绑定</div>
            <h1 class="auth-card__title">加入 财务共享组</h1>
            <p class="auth-card__desc">账号与后端小组关联。我们会向邮箱发送一次性链接，确认身份并绑定当前设备。</p>
          </div>

          <form class="auth-form" id="welcome-form">
            <div class="field">
              <label class="field__label" for="reg-name">姓名 <span class="req">*</span></label>
              <input class="input" id="reg-name" placeholder="例如：陈曦" autocomplete="name" />
            </div>
            <div class="field">
              <label class="field__label" for="reg-email">企业邮箱 <span class="req">*</span></label>
              <input class="input" id="reg-email" type="email" placeholder="you@sap.example" autocomplete="email" />
              <span class="field__hint">仅接受 @sap.example 企业邮箱，链接 10 分钟内有效。</span>
            </div>
            <div class="field">
              <label class="field__label" for="reg-group">关联小组</label>
              <select class="select" id="reg-group">
                <option>财务共享组 · FIN-SH</option>
                <option>供应链组 · SCM-CN</option>
                <option>制造组 · MFG-CN</option>
              </select>
            </div>
            <div class="field">
              <span class="field__label">你的角色</span>
              <div class="role-pick" id="role-pick">
                <div class="role-pick__card is-active" data-role-pick="business">
                  <div class="role-pick__title">${ic("user")} SAP 业务</div>
                  <div class="role-pick__desc">提需求、确认澄清、验收上线</div>
                </div>
                <div class="role-pick__card" data-role-pick="it">
                  <div class="role-pick__title">${ic("code")} SAP IT</div>
                  <div class="role-pick__desc">开发、CRQ / ChaRM、Agent 协作</div>
                </div>
              </div>
            </div>

            <div class="auth-note">
              ${ic("fingerprint")}
              <span>提交时会结合浏览器指纹、访问 IP 与用户名生成一次性认证信息。确认后，此设备再次访问无需登录。</span>
            </div>

            <button class="btn btn--primary btn--lg btn--block" type="submit" id="send-link">
              发送一次性注册链接 ${ic("arrow-right")}
            </button>
          </form>

          <div class="auth-alt">
            <span>已有绑定设备？</span>
            <a class="link" href="#/home">直接进入工作台 ${ic("arrow-right")}</a>
          </div>
          <div class="auth-alt" style="margin-top:10px;padding-top:0;border-top:0">
            <span>更换设备或解除旧设备？</span>
            <a class="link" href="#/rebind">重新注册 ${ic("refresh")}</a>
          </div>

          <div class="auth-foot">仅限企业内网使用 · 账号由小组管理员分配 · 绑定信息不会用于其他用途</div>
        </div>`
      );
    },
    after(ctx, root) {
      const form = root.querySelector("#welcome-form");
      root.querySelectorAll("[data-role-pick]").forEach((card) => {
        card.addEventListener("click", () => {
          root.querySelectorAll("[data-role-pick]").forEach((c) => c.classList.remove("is-active"));
          card.classList.add("is-active");
        });
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = root.querySelector("#reg-name").value.trim() || "陈曦";
        const email = root.querySelector("#reg-email").value.trim() || "chen.xi@sap.example";
        SA.data.user.name = name;
        SA.data.user.email = email;
        SA.toast("一次性链接已发送至 " + email, { icon: "mail" });
        setTimeout(() => SA.go("#/verify"), 300);
      });
    },
  });

  /* ------------------------------------------------------------
     verify (email sent)
     ------------------------------------------------------------ */
  SA.register("verify", {
    title: "检查邮箱",
    render() {
      return layout(
        1,
        `<div class="auth-card">
          <div class="auth-card__head">
            <div class="auth-card__eyebrow">ONE-TIME LINK · 一次性链接</div>
            <h1 class="auth-card__title">检查你的邮箱</h1>
            <p class="auth-card__desc">注册链接已发送至 <strong>${SA.h(SA.data.user.email)}</strong>，点击邮件中的按钮即可在当前浏览器完成绑定。</p>
          </div>

          <div class="mailcard">
            <div class="mailcard__head">
              <span class="mailcard__from">
                <span class="mailcard__avatar">S</span>
                <span>
                  <span class="mailcard__name">Super Agent</span>
                  <span class="mailcard__addr">no-reply@sap.example</span>
                </span>
              </span>
              <span class="mailcard__time">刚刚</span>
            </div>
            <div class="mailcard__subject">绑定此设备并进入「财务共享组」</div>
            <div class="mailcard__body">
              <p>${SA.h(SA.data.user.name)} 你好，</p>
              <p>你正在注册 SAP Super Agent。点击下方按钮确认邮箱并绑定当前设备。链接 <strong>10 分钟</strong>内有效，仅可使用一次。</p>
              <a class="mailcard__btn" href="#/bind" id="mail-bind-btn">绑定此设备 ${ic("arrow-right")}</a>
              <div class="mailcard__meta">
                ${ic("fingerprint")} 绑定信息 · 浏览器指纹 + 访问 IP + 用户名
              </div>
            </div>
          </div>

          <div class="verify-status">
            <span class="verify-status__ring">
              <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" stroke-width="2.4"/><circle id="countdown-ring" cx="18" cy="18" r="15.5" fill="none" stroke="var(--blue)" stroke-width="2.4" stroke-linecap="round" transform="rotate(-90 18 18)" stroke-dasharray="97.4" stroke-dashoffset="0"/></svg>
            </span>
            <span class="verify-status__text">
              <strong>等待验证</strong>
              <span>链接 <span class="mono" id="countdown-text">09:59</span> 后失效 · 仅可使用一次</span>
            </span>
          </div>

          <div class="auth-alt">
            <span>没有收到邮件？</span>
            <a class="link" href="#/welcome">更换邮箱 ${ic("arrow-left")}</a>
          </div>
          <div class="auth-alt" style="margin-top:10px;padding-top:0;border-top:0">
            <span>演示提示：</span>
            <a class="link" href="#/bind">直接打开一次性链接 ${ic("external")}</a>
          </div>

          <div class="auth-foot">邮件由 SAP 企业邮局投递 · 如果 1 分钟内仍未收到，请检查垃圾邮件或联系小组管理员。</div>
        </div>`
      );
    },
    after(ctx, root) {
      let left = 599;
      const text = root.querySelector("#countdown-text");
      const ring = root.querySelector("#countdown-ring");
      const t = SA.onTimer(() => {
        left = Math.max(0, left - 1);
        const m = String(Math.floor(left / 60)).padStart(2, "0");
        const s = String(left % 60).padStart(2, "0");
        text.textContent = m + ":" + s;
        ring.style.strokeDashoffset = String(97.4 * (1 - left / 600));
        if (left === 0) clearInterval(t);
      }, 1000);
    },
  });

  /* ------------------------------------------------------------
     bind (one-time link + fingerprint verification)
     ------------------------------------------------------------ */
  SA.register("bind", {
    title: "绑定设备",
    render() {
      return layout(
        2,
        `<div class="auth-card auth-card--wide">
          <div class="auth-card__head">
            <div class="auth-card__eyebrow">DEVICE BINDING · 设备绑定</div>
            <h1 class="auth-card__title">正在绑定此设备</h1>
            <p class="auth-card__desc">正在校验一次性链接、浏览器指纹、访问 IP 与用户名。完成后此设备将免登录访问。</p>
          </div>

          <div class="bind-steps" id="bind-steps">
            <div class="bind-step is-done"><span class="bind-step__icon">${ic("check")}</span><span class="bind-step__main"><span class="bind-step__title">一次性链接有效</span><span class="bind-step__sub">exp 09:42 · 单次使用</span></span><span class="bind-step__val mono">MOkT3…9f2a</span></div>
            <div class="bind-step is-done"><span class="bind-step__icon">${ic("check")}</span><span class="bind-step__main"><span class="bind-step__title">浏览器指纹已采集</span><span class="bind-step__sub">canvas · webgl · fonts · timezone</span></span><span class="bind-step__val mono">fp_9a3f…c41d</span></div>
            <div class="bind-step is-done"><span class="bind-step__icon">${ic("check")}</span><span class="bind-step__main"><span class="bind-step__title">访问 IP 属于企业内网</span><span class="bind-step__sub">上海 · SAP 办公网段</span></span><span class="bind-step__val mono">10.42.8.17</span></div>
            <div class="bind-step is-done"><span class="bind-step__icon">${ic("check")}</span><span class="bind-step__main"><span class="bind-step__title">用户名与小组匹配</span><span class="bind-step__sub">邀请记录 · 财务共享组</span></span><span class="bind-step__val mono">chen.xi → FIN-SH</span></div>
            <div class="bind-step is-active"><span class="bind-step__icon"><i class="dot"></i></span><span class="bind-step__main"><span class="bind-step__title">生成设备凭证</span><span class="bind-step__sub">写入 HttpOnly Cookie · 有效期 180 天</span></span><span class="bind-step__val mono" id="bind-progress">签发中…</span></div>
          </div>

          <div class="bind-success" id="bind-success" hidden>
            <div class="bind-success__mark">${ic("check")}</div>
            <div class="grow">
              <div class="bind-success__title">设备已绑定</div>
              <div class="bind-success__desc">下次访问 <span class="mono">superagent.sap.example</span> 将直接进入工作台。</div>
            </div>
            <a class="btn btn--primary" href="#/home">进入工作台 ${ic("arrow-right")}</a>
          </div>

          <div class="device-card" id="device-card">
            <div class="device-card__head"><span>${ic("monitor")} 当前设备</span><span class="pill pill--green"><span class="dot"></span>已识别</span></div>
            <div class="device-card__grid">
              <div><span>设备</span><strong>MacBook Pro · Chrome 156</strong></div>
              <div><span>设备指纹</span><strong class="mono">fp_9a3f…c41d</strong></div>
              <div><span>访问 IP</span><strong class="mono">10.42.8.17</strong></div>
              <div><span>绑定用户</span><strong>陈曦 · 财务共享组</strong></div>
            </div>
          </div>

          <div class="auth-note">
            ${ic("shield")}
            <span>绑定凭证仅与当前浏览器绑定，不会随账号同步到其他设备。更换设备或需要解除绑定时，可在账户设置中重新注册。</span>
          </div>

          <div class="auth-alt">
            <span>这不是你的设备？</span>
            <a class="link" href="#/welcome">取消并退出 ${ic("x")}</a>
          </div>
          <div class="auth-alt" style="margin-top:10px;padding-top:0;border-top:0">
            <span>需要绑定新设备？</span>
            <a class="link" href="#/rebind">重新注册 ${ic("refresh")}</a>
          </div>
        </div>`
      );
    },
    after(ctx, root) {
      const finalize = (silent) => {
        const active = root.querySelector(".bind-step.is-active");
        if (active) {
          active.classList.remove("is-active");
          active.classList.add("is-done");
          const icon = active.querySelector(".bind-step__icon");
          icon.innerHTML = ic("check");
          const val = active.querySelector("#bind-progress");
          if (val) val.textContent = "已签发 · dvc_8c21";
        }
        const success = root.querySelector("#bind-success");
        if (success) success.hidden = false;
        if (!silent) SA.toast("设备绑定成功，下次访问将免登录", { icon: "fingerprint" });
      };
      if (SA.isShot) { finalize(true); return; }
      setTimeout(() => finalize(false), 1400);
    },
  });

  /* ------------------------------------------------------------
     rebind
     ------------------------------------------------------------ */
  SA.register("rebind", {
    title: "重新注册设备",
    render() {
      return layout(
        0,
        `<div class="auth-card">
          <div class="auth-card__head">
            <div class="auth-card__eyebrow">RE-BIND · 重新注册</div>
            <h1 class="auth-card__title">重新注册此设备</h1>
            <p class="auth-card__desc">账号已存在。重新注册会向邮箱发送新的设备绑定链接，并解除当前账号绑定的旧设备。</p>
          </div>

          <div class="callout callout--amber">
            ${ic("alert-triangle")}
            <span>重新绑定后，旧设备上的免登录凭证会立即失效，需要重新注册才能再次访问。</span>
          </div>

          <form class="auth-form" id="rebind-form" style="margin-top:16px">
            <div class="field">
              <label class="field__label" for="re-email">企业邮箱 <span class="req">*</span></label>
              <input class="input" id="re-email" type="email" value="chen.xi@sap.example" />
            </div>
            <div class="field">
              <label class="field__label">账号</label>
              <div class="rebind-account">
                <span class="avatar avatar--lg" data-tone="ink">陈</span>
                <span class="grow">
                  <span class="rebind-account__name">陈曦</span>
                  <span class="rebind-account__sub">财务共享组 · SAP 业务 · 上次绑定于 2026-05-12</span>
                </span>
                <span class="pill pill--outline">已存在</span>
              </div>
            </div>
            <div class="field">
              <span class="field__label">已绑定设备</span>
              <div class="device-list">
                <div class="device-row"><span class="device-row__icon">${ic("monitor")}</span><span class="grow"><span class="device-row__name">Windows 11 · Edge 142<em>旧设备</em></span><span class="device-row__sub mono">10.42.8.22 · 最后访问 3 天前</span></span><span class="pill pill--slate">待解除</span></div>
                <div class="device-row"><span class="device-row__icon">${ic("monitor")}</span><span class="grow"><span class="device-row__name">MacBook Pro · Chrome 156<em>当前设备</em></span><span class="device-row__sub mono">10.42.8.17 · 正在验证</span></span><span class="pill pill--blue">当前</span></div>
              </div>
            </div>
            <button class="btn btn--primary btn--lg btn--block" type="submit">发送重新绑定链接 ${ic("arrow-right")}</button>
          </form>

          <div class="auth-alt">
            <span>不想更换设备？</span>
            <a class="link" href="#/home">返回工作台 ${ic("arrow-right")}</a>
          </div>
          <div class="auth-foot">重新注册不会影响账号已有的需求、任务与文档数据。</div>
        </div>`
      );
    },
    after(ctx, root) {
      root.querySelector("#rebind-form").addEventListener("submit", (e) => {
        e.preventDefault();
        SA.toast("重新绑定链接已发送", { icon: "mail" });
        setTimeout(() => SA.go("#/verify"), 300);
      });
    },
  });
})();
