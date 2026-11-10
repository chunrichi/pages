/* ============================================================
   SAP Super Agent · prototype runtime
   Hash router, shell interactions, overlays, demo data, motion
   ============================================================ */
(function () {
  "use strict";

  const SA = (window.SA = window.SA || {});
  SA.screens = SA.screens || {};
  SA.data = SA.data || {};
  SA.timers = []; /* setInterval：路由切换清理 */
  SA.timeouts = []; /* setTimeout（SA.after）：路由切换清理 */

  SA.register = function (name, spec) {
    SA.screens[name] = spec;
  };

  SA.isShot = /(?:\?|&)shot=1(?:&|$)/.test(location.search);
  if (SA.isShot) document.documentElement.classList.add("shot-mode");

  /* ------------------------------------------------------------
     motion · 时长 / 缓动只走 token，见 docs/01-设计系统.md §8
     三种模式：正常 / prefers-reduced-motion / ?shot=1
     ------------------------------------------------------------ */
  const DUR_FALLBACK = {
    "--dur-1": 140,
    "--dur-2": 220,
    "--dur-3": 360,
    "--dur-4": 560,
    "--dur-5": 900,
    "--dur-exit": 120,
    "--stagger": 38,
  };
  const durCache = {};
  const reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  SA.isReducedMotion = function () {
    return !!(reduceMotion && reduceMotion.matches);
  };
  /** 读取动效 token 的毫秒数；reduced-motion 下恒为 0。 */
  SA.dur = function (token) {
    if (SA.isReducedMotion()) return 0;
    if (Object.prototype.hasOwnProperty.call(durCache, token)) return durCache[token];
    const raw = String(
      getComputedStyle(document.documentElement).getPropertyValue(token) || ""
    ).trim();
    const n = parseFloat(raw);
    const ms = isNaN(n) ? DUR_FALLBACK[token] || 0 : /m?s$/.test(raw) && !/ms$/.test(raw) ? n * 1000 : n;
    durCache[token] = ms;
    return ms;
  };
  /** 回到顶部；reduced-motion 下直接跳转。 */
  SA.scrollTop = function (opts) {
    const smooth = !!(opts && opts.smooth) && !SA.isReducedMotion();
    if (smooth) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };
  /** 页面序列延时：登记在 SA.timers，路由切换统一清理；触发后自动出队。 */
  SA.after = function (fn, ms) {
    const run = () => {
      const idx = SA.timeouts.indexOf(id);
      if (idx >= 0) SA.timeouts.splice(idx, 1);
      fn();
    };
    const id = setTimeout(run, Math.max(0, ms || 0));
    SA.timeouts.push(id);
    return id;
  };
  /** 演示序列延时：reduced-motion 下压缩到 ≤ 80ms，避免等待。 */
  SA.sequence = function (fn, ms) {
    return SA.after(fn, SA.isReducedMotion() ? Math.min(ms || 0, 80) : ms || 0);
  };
  /** 不随路由清理的一次性延时，只用于外壳行为（toast 自动消失等）。 */
  SA.later = function (fn, ms) {
    return setTimeout(fn, Math.max(0, ms || 0));
  };

  /* ------------------------------------------------------------
     identity · view · permission
     工作视角（view）/ 业务角色（role）/ 管理权限（admin）三层分离
     详见 docs/06-角色权限与管理.md
     ------------------------------------------------------------ */
  SA.data.user = {
    name: "陈曦",
    short: "陈",
    role: "SAP 业务",
    group: "财务共享组",
    groupKey: "FIN-SH",
    email: "chen.xi@sap.example",
  };

  SA.auth = {
    account: {
      name: "陈曦",
      email: "chen.xi@sap.example",
      groupKey: "FIN-SH",
      groupName: "财务共享组",
      businessRole: "SAP 业务",
      views: ["business", "it"],
      admin: "platform", // "platform" | "group" | null
      adminGroups: ["FIN-SH"],
      invitedBy: "林桦",
      joinedAt: "2025-03-18",
    },
    previewMember: false,
    previewAdmin: null, // "group" 演示小组管理员视角（只读集成、仅本组参数）
    level() {
      return this.previewAdmin || this.account.admin;
    },
    can(cap) {
      const a = this.account;
      const level = this.level();
      // 成员预览下，管理能力与模板维护能力都收起（只读）
      if (this.previewMember && (cap.indexOf("admin.") === 0 || cap.indexOf("crq.templates") === 0)) return false;
      switch (cap) {
        case "admin.access":
          return !!level;
        case "admin.groups.create":
          return level === "platform";
        case "admin.groups.manage":
        case "admin.members.invite":
        case "admin.members.role":
        case "admin.members.admin":
        case "admin.members.remove":
          return level === "platform" || (level === "group" && a.adminGroups.length > 0);
        case "admin.members.transfer":
          return level === "platform";
        case "admin.integrations.manage":
          return level === "platform";
        case "admin.audit.view":
          return !!level;
        case "crq.templates.manage":
          return !!level; // 小组模板：小组管理员 / 平台管理员；成员只读
        case "crq.templates.base":
          return level === "platform"; // 平台基础模板：仅平台管理员
        default:
          return false;
      }
    },
    isAdmin() {
      return this.can("admin.access");
    },
  };

  SA.view = "business";
  SA.VIEW_META = {
    business: { label: "SAP 业务", route: "#/home" },
    it: { label: "SAP IT", route: "#/tasks" },
  };
  SA.viewDefaultRoute = function () {
    return (SA.VIEW_META[SA.view] || SA.VIEW_META.business).route;
  };
  SA.isReadOnly = function () {
    return SA.view === "business";
  };
  SA.setView = function (view, opts) {
    if (!SA.auth.account.views.includes(view) || SA.view === view) return;
    SA.view = view;
    SA.data.user.role = view === "it" ? "SAP IT" : SA.auth.account.businessRole;
    const spec = currentRouteSpec();
    applyShell();
    if (spec && spec.views && !spec.views.includes(view)) {
      SA.go(SA.viewDefaultRoute());
    } else {
      render();
    }
    if (!opts || !opts.silent) {
      SA.toast("已切换到 " + SA.VIEW_META[view].label + " 视角", { icon: "user" });
    }
  };
  SA.readOnlyBar = function (text) {
    return (
      '<div class="readonly-bar">' +
      window.ic("eye") +
      "<span><b>只读 · SAP 业务视角</b>" +
      (text || "业务方可以查看，创建与审批由 SAP IT 完成。") +
      "</span>" +
      '<span class="grow"></span>' +
      '<button class="btn btn--sm" data-action="switch-view" data-view="it">切换到 SAP IT 视角</button>' +
      "</div>"
    );
  };

  /* ------------------------------------------------------------
     demo data
     ------------------------------------------------------------ */

  SA.data.groups = [
    { key: "FIN-SH", name: "财务共享组", members: 7, tone: "blue", desc: "财务共享 / 采购到付款", template: "PDO 六阶段 · v4", approver: "林桦", admins: ["陈曦", "林桦", "王栎"] },
    { key: "SCM-CN", name: "供应链组", members: 5, tone: "teal", desc: "销售 / 物流 / 库存", template: "PDO 六阶段 · v4", approver: "郑一", admins: ["郑一"] },
    { key: "MFG-CN", name: "制造组", members: 6, tone: "violet", desc: "生产 / 质量 / MES", template: "默认三阶段 · v2", approver: "赵岑", admins: ["赵岑"] },
  ];

  SA.data.notifications = [
    {
      id: "n1",
      unread: true,
      todo: true,
      tone: "amber",
      icon: "git-commit",
      title: "功能设计 v2 等待你确认",
      desc: "R-2041 采购申请审批流增加部门预算校验 · 门禁 G1",
      meta: "需求顾问 林桦",
      time: "5 分钟前",
      action: { label: "去确认", route: "#/demands/R-2041/doc/functional-design" },
    },
    {
      id: "n2",
      unread: true,
      todo: true,
      tone: "violet",
      icon: "git-branch",
      title: "ChaRM CR-44102 已通过 Basis 审批",
      desc: "可以创建 Change Document 并补充传输信息",
      meta: "SAP IT 周予",
      time: "32 分钟前",
      action: { label: "查看变更", route: "#/tools/charm" },
    },
    {
      id: "n3",
      unread: true,
      todo: false,
      tone: "blue",
      icon: "send",
      title: "Teams 通知已送达 #fin-sap-it",
      desc: "R-2041 澄清完成，已 @ 3 位负责人 · hook.delivered",
      meta: "自动化",
      time: "1 小时前",
      action: { label: "查看投递", route: "#/ops/queue" },
    },
    {
      id: "n4",
      unread: true,
      todo: false,
      tone: "amber",
      icon: "alert-triangle",
      title: "CRQ-2026-0842 创建失败，已进入死信",
      desc: "SolMan 返回 400：请求类型 ZSAP_CHG 缺少必填字段",
      meta: "CRQ 编排器",
      time: "2 小时前",
      action: { label: "去处理", route: "#/tools/crq" },
    },
    {
      id: "n5",
      unread: false,
      todo: false,
      tone: "teal",
      icon: "bot",
      title: "Agent 完成 R-2041 技术设计 v1",
      desc: "基于 4 份知识库文档生成，用时 48s，消耗 18.4k tokens",
      meta: "Super Agent",
      time: "昨天 17:42",
      action: { label: "查看文档", route: "#/demands/R-2041/doc/tech-design" },
    },
    {
      id: "n6",
      unread: false,
      todo: false,
      tone: "slate",
      icon: "user-plus",
      title: "周予 在 VSCode 中领取了任务 T-8841",
      desc: "工作区 z-sales · 租约已生效",
      meta: "任务派发",
      time: "昨天 15:06",
      action: { label: "查看任务", route: "#/tasks" },
    },
  ];

  SA.data.demands = [
    {
      id: "R-2041",
      jira: "SAP-1187",
      title: "采购申请审批流增加部门预算校验",
      short: "预算校验",
      stage: "功能设计",
      stageIndex: 1,
      status: "待确认",
      statusTone: "amber",
      priority: "高",
      priorityTone: "red",
      owner: ["林桦", "陈曦"],
      updated: "12 分钟前",
      docs: 3,
      due: "11-18",
      progress: 38,
      size: "M",
      desc: "采购申请提交时按申请部门和费用科目校验预算余额，超预算时进入部门负责人审批，而不是直接生成采购订单。",
    },
    {
      id: "R-2042",
      jira: "SAP-1191",
      title: "销售开票清单支持批量导出 Excel",
      short: "开票导出",
      stage: "技术开发",
      stageIndex: 3,
      status: "进行中",
      statusTone: "blue",
      priority: "中",
      priorityTone: "slate",
      owner: ["周予", "沈珂"],
      updated: "40 分钟前",
      docs: 4,
      due: "11-20",
      progress: 72,
      size: "S",
      desc: "VF05 输出清单需要支持按选择条件批量导出 Excel，并保留抬头与合计行格式。",
    },
    {
      id: "R-2043",
      jira: "SAP-1204",
      title: "MES 工单状态回写生产订单",
      short: "MES 回写",
      stage: "测试",
      stageIndex: 4,
      status: "测试中",
      statusTone: "violet",
      priority: "高",
      priorityTone: "red",
      owner: ["王栎", "顾遥"],
      updated: "2 小时前",
      docs: 5,
      due: "11-15",
      progress: 86,
      size: "L",
      desc: "MES 报工完成后通过 RFC 回写生产订单状态，异常时写入接口日志并通知计划员。",
    },
    {
      id: "R-2044",
      jira: "SAP-1210",
      title: "供应商主数据银行账号校验规则升级",
      short: "银行校验",
      stage: "需求澄清",
      stageIndex: 0,
      status: "AI 澄清中",
      statusTone: "teal",
      priority: "中",
      priorityTone: "slate",
      owner: ["林桦"],
      updated: "3 小时前",
      docs: 1,
      due: "11-25",
      progress: 12,
      size: "S",
      desc: "按新合规要求校验 IBAN 与 SWIFT，补充对公账户户名校验与失败提示。",
    },
    {
      id: "R-2045",
      jira: "SAP-1213",
      title: "月结自动化任务增加失败重跑入口",
      short: "月结重跑",
      stage: "上线",
      stageIndex: 5,
      status: "待上线",
      statusTone: "green",
      priority: "高",
      priorityTone: "red",
      owner: ["陈曦", "沈珂"],
      updated: "昨天",
      docs: 6,
      due: "11-12",
      progress: 96,
      size: "M",
      desc: "月结批处理失败后允许业务在监控页重跑指定任务，并记录操作审计。",
    },
    {
      id: "R-2047",
      jira: "SAP-1221",
      title: "库存周转报表增加库龄区间筛选",
      short: "库龄筛选",
      stage: "技术设计",
      stageIndex: 2,
      status: "评审中",
      statusTone: "violet",
      priority: "中",
      priorityTone: "slate",
      owner: ["周予", "林桦"],
      updated: "5 小时前",
      docs: 3,
      due: "11-22",
      progress: 55,
      size: "M",
      desc: "库存周转报表按库龄区间筛选，并支持导出与保存变式。",
    },
    {
      id: "R-2046",
      jira: "SAP-1218",
      title: "供应商对账单支持多币种汇总",
      short: "多币种对账",
      stage: "功能设计",
      stageIndex: 1,
      status: "等待澄清",
      statusTone: "amber",
      priority: "低",
      priorityTone: "slate",
      owner: ["林桦"],
      updated: "昨天",
      docs: 2,
      due: "12-02",
      progress: 30,
      size: "M",
      desc: "对账单需要按币种分组汇总并展示折算后的本位币金额。",
    },
  ];

  SA.data.tasks = [
    {
      id: "T-8841",
      demand: "R-2042",
      title: "实现开票清单导出服务",
      stage: "技术开发",
      repo: "z-sales",
      type: "ABAP",
      priority: "高",
      owner: "周予",
      state: "进行中",
      lease: "租约剩余 42s",
      agent: "Copilot + sap-dev skill",
      updated: "刚刚",
    },
    {
      id: "T-8846",
      demand: "R-2043",
      title: "补充 MES 回写异常场景测试",
      stage: "测试",
      repo: "z-mfg",
      type: "测试",
      priority: "高",
      owner: "顾遥",
      state: "等待我回答",
      lease: "等待确认测试数据",
      updated: "18 分钟前",
    },
    {
      id: "T-8850",
      demand: "R-2045",
      title: "上线文档补充回滚步骤",
      stage: "上线",
      repo: "z-fin",
      type: "文档",
      priority: "中",
      owner: "沈珂",
      state: "可领取",
      lease: "未领取",
      updated: "1 小时前",
    },
    {
      id: "T-8852",
      demand: "R-2041",
      title: "功能设计评审：预算校验流程",
      stage: "功能设计",
      repo: "z-fin",
      type: "评审",
      priority: "中",
      owner: "周予",
      state: "可领取",
      lease: "未领取",
      updated: "2 小时前",
    },
  ];

  /* ------------------------------------------------------------
     utilities
     ------------------------------------------------------------ */
  SA.h = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
  SA.toast = function (msg, opts) {
    const stack = document.getElementById("toast-stack");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = (window.ic ? ic((opts && opts.icon) || "check-circle") : "") + "<span>" + SA.h(msg) + "</span>";
    stack.appendChild(el);
    // toast 属于外壳行为，不跟路由清理走，否则切页会留下永不消失的 toast
    SA.later(() => {
      el.classList.add("is-leaving");
      SA.later(() => el.remove(), SA.dur("--dur-2") + 40);
    }, (opts && opts.duration) || 2600);
  };
  SA.go = function (hash) {
    if (location.hash === hash) {
      render();
      return;
    }
    location.hash = hash;
  };
  SA.countUp = function (root) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      if (SA.isShot || SA.isReducedMotion()) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }
      const start = performance.now();
      const dur = SA.dur("--dur-5") || 900;
      function tick(now) {
        if (!el.isConnected) return;
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  };
  SA.animateBars = function (root) {
    const apply = () => {
      root.querySelectorAll("[data-bar]").forEach((el) => {
        el.style.width = el.dataset.bar + "%";
      });
      root.querySelectorAll("[data-ring]").forEach((el) => {
        el.style.background =
          "conic-gradient(var(--tone) " + el.dataset.ring + "%, var(--line-soft) 0)";
      });
    };
    if (SA.isShot) apply();
    else requestAnimationFrame(apply);
  };
  SA.clearTimers = function () {
    SA.timers.forEach((t) => clearInterval(t));
    SA.timeouts.forEach((t) => clearTimeout(t));
    SA.timers = [];
    SA.timeouts = [];
  };
  SA.onTimer = function (fn, ms) {
    SA.timers.push(setInterval(fn, ms));
    return SA.timers[SA.timers.length - 1];
  };
  /** 停掉单个循环计时器并同步清理登记表（暂停态用，如队列暂停）。 */
  SA.offTimer = function (id) {
    if (!id) return;
    clearInterval(id);
    const idx = SA.timers.indexOf(id);
    if (idx >= 0) SA.timers.splice(idx, 1);
  };
  SA.esc = SA.h;

  /* ------------------------------------------------------------
     icons hydration
     ------------------------------------------------------------ */
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = window.ic(el.dataset.icon);
    });
  }
  SA.hydrateIcons = hydrateIcons;

  /* ------------------------------------------------------------
     overlays
     ------------------------------------------------------------ */
  function openOverlay(id) {
    const scrim = document.getElementById("scrim");
    closeOverlays(true);
    scrim.classList.add("is-open");
    const layer = document.getElementById(id);
    if (layer) {
      layer.classList.add("is-open");
      layer.style.pointerEvents = "auto";
    }
    document.body.style.overflow = "hidden";
  }
  function closeOverlays(keepScrim) {
    document.querySelectorAll(".drawer.is-open, .modal.is-open").forEach((el) => {
      el.classList.remove("is-open");
    });
    if (!keepScrim) {
      document.getElementById("scrim").classList.remove("is-open");
      document.getElementById("profile-menu").hidden = true;
      document.body.style.overflow = "";
    }
  }
  SA.closeOverlays = closeOverlays;
  SA.openDrawer = function (id) {
    openOverlay(id || "detail-drawer");
  };
  SA.openModal = function (id) {
    openOverlay(id || "modal-generic");
  };

  SA.modal = function (opts) {
    const modal = document.getElementById("modal-generic");
    modal.classList.toggle("modal--wide", !!opts.wide);
    document.getElementById("modal-title").textContent = opts.title || "";
    const desc = document.getElementById("modal-desc");
    desc.textContent = opts.desc || "";
    desc.hidden = !opts.desc;
    const body = document.getElementById("modal-body");
    body.innerHTML = opts.body || "";
    body.hidden = !opts.body;
    const foot = document.getElementById("modal-foot");
    foot.innerHTML = "";
    (opts.actions || [
      { label: "取消", variant: "ghost", close: true },
      { label: "确认", variant: "ink", close: true },
    ]).forEach((a) => {
      const b = document.createElement("button");
      b.className = "btn " + (a.variant ? "btn--" + a.variant : "");
      b.textContent = a.label;
      b.addEventListener("click", () => {
        if (a.close !== false) closeOverlays();
        if (a.onClick) a.onClick();
      });
      foot.appendChild(b);
    });
    openOverlay("modal-generic");
    hydrateIcons(modal);
  };
  SA.confirm = function (opts) {
    SA.modal({
      title: opts.title,
      desc: opts.desc,
      body: opts.body,
      wide: opts.wide,
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: opts.okLabel || "确认",
          variant: opts.danger ? "danger" : "primary",
          onClick: opts.onOk,
        },
      ],
    });
  };
  SA.drawer = function (opts) {
    document.getElementById("detail-title").textContent = opts.title || "";
    const sub = document.getElementById("detail-sub");
    sub.textContent = opts.sub || "";
    sub.hidden = !opts.sub;
    document.getElementById("detail-body").innerHTML = opts.body || "";
    const foot = document.getElementById("detail-foot");
    foot.innerHTML = "";
    (opts.actions || []).forEach((a) => {
      const b = document.createElement("button");
      b.className = "btn " + (a.variant ? "btn--" + a.variant : "");
      b.innerHTML = (a.icon ? window.ic(a.icon) : "") + "<span>" + SA.h(a.label) + "</span>";
      b.addEventListener("click", () => {
        if (a.close !== false) closeOverlays();
        if (a.onClick) a.onClick();
      });
      foot.appendChild(b);
    });
    foot.hidden = !(opts.actions && opts.actions.length);
    openOverlay("detail-drawer");
    hydrateIcons(document.getElementById("detail-drawer"));
  };
  SA.hydrateIcons = hydrateIcons;

  /* ------------------------------------------------------------
     notification drawer
     ------------------------------------------------------------ */
  let notifTab = "todo";
  function renderNotifications() {
    const list = document.getElementById("notif-list");
    const items = SA.data.notifications.filter((n) =>
      notifTab === "todo" ? n.todo || n.unread : true
    );
    if (!items.length) {
      list.innerHTML =
        '<div class="empty notif-empty"><div class="empty__icon">' +
        ic("check-circle") +
        '</div><div class="empty__title">没有待你处理的事项</div><div class="empty__desc">新的门禁、审批与投递结果会实时出现在这里。</div></div>';
      return;
    }
    list.innerHTML = items
      .map(
        (n) => `
      <div class="notif-item" data-notif="${n.id}">
        <span class="notif-item__icon notif-item__icon--${n.tone}">${ic(n.icon)}</span>
        <span class="notif-item__main">
          <span class="notif-item__title">${SA.h(n.title)}</span>
          <span class="notif-item__meta">${SA.h(n.desc)}</span>
          <span class="notif-item__meta">${SA.h(n.meta)} <span class="notif-item__time">${SA.h(n.time)}</span></span>
          ${n.action ? `<span class="notif-item__actions"><a class="btn btn--sm" href="${n.action.route}" data-action="notif-go">${SA.h(n.action.label)}</a></span>` : ""}
        </span>
        ${n.unread ? '<span class="notif-item__unread"></span>' : ""}
      </div>`
      )
      .join("");
  }

  /* ------------------------------------------------------------
     command palette
     ------------------------------------------------------------ */
  const commandItems = [
    { group: "跳转", icon: "home", label: "总览", sub: "工作台", route: "#/home" },
    { group: "跳转", icon: "layers", label: "需求列表", sub: "6 个需求", route: "#/demands" },
    { group: "跳转", icon: "plus", label: "新建需求", sub: "N", route: "#/demands/new" },
    { group: "跳转", icon: "inbox", label: "任务台", labelBusiness: "待我确认", sub: "3 个待处理", route: "#/tasks" },
    { group: "跳转", icon: "book-open", label: "文档评审", sub: "R-2041", route: "#/demands/R-2041/doc/functional-design", views: ["it"] },
    { group: "跳转", icon: "file-text", label: "CRQ 工单", sub: "12 个工单", route: "#/tools/crq", views: ["it"] },
    { group: "跳转", icon: "git-branch", label: "ChaRM 变更中心", sub: "6 个变更", route: "#/tools/charm", views: ["it"] },
    { group: "跳转", icon: "activity", label: "队列与事件", sub: "24 条待处理", route: "#/ops/queue", views: ["it"] },
    { group: "跳转", icon: "bot", label: "Agent 运行", sub: "3 个运行中", route: "#/ops/agents", views: ["it"] },
    { group: "跳转", icon: "database", label: "知识库", sub: "128 篇文档", route: "#/knowledge" },
    { group: "命令", icon: "check-square", label: "确认功能设计 v2", sub: "R-2041", route: "#/demands/R-2041/doc/functional-design" },
    { group: "命令", icon: "upload", label: "提交上线审批", labelBusiness: "确认上线审批", sub: "R-2045", route: "#/demands/R-2045/release" },
    { group: "命令", icon: "monitor", label: "在 VSCode 中打开需求", sub: "R-2042", route: "#/tasks", views: ["it"] },
    { group: "命令", icon: "settings", label: "个人设置", sub: "账户与设备", route: "#/settings?tab=account" },
    { group: "命令", icon: "shield", label: "管理控制台", sub: "小组 · 集成 · 审计", route: "#/admin?tab=groups", cap: "admin.access" },
    { group: "命令", icon: "user", label: "切换到 SAP IT 视角", sub: "业务 / IT", run: () => SA.setView("it"), views: ["business"] },
    { group: "命令", icon: "user", label: "切换到 SAP 业务 视角", sub: "业务 / IT", run: () => SA.setView("business"), views: ["it"] },
  ];
  const recentDemands = SA.data.demands.map((d) => ({
    group: "需求",
    icon: "file",
    label: d.title,
    sub: d.id,
    route: "#/demands/" + d.id,
  }));
  const allCommands = commandItems.concat(recentDemands);
  let cmdIndex = 0;
  let cmdFiltered = allCommands;

  function renderCommands(q) {
    const query = (q || "").trim().toLowerCase();
    cmdFiltered = allCommands.filter((c) => {
      if (c.views && !c.views.includes(SA.view)) return false;
      if (c.cap && !SA.auth.can(c.cap)) return false;
      const label = commandLabel(c);
      return !query || label.toLowerCase().includes(query) || (c.sub || "").toLowerCase().includes(query);
    });
    cmdIndex = 0;
    const body = document.getElementById("cmd-results");
    if (!cmdFiltered.length) {
      body.innerHTML =
        '<div class="empty"><div class="empty__title">没有匹配结果</div><div class="empty__desc">试试需求编号 R-2041，或输入"新建"。</div></div>';
      return;
    }
    let html = "";
    let lastGroup = "";
    cmdFiltered.forEach((c, i) => {
      if (c.group !== lastGroup) {
        html += '<div class="cmd__group-label">' + c.group + "</div>";
        lastGroup = c.group;
      }
      html +=
        '<div class="cmd__item' +
        (i === cmdIndex ? " is-active" : "") +
        '" data-cmd="' +
        i +
        '">' +
        ic(c.icon) +
        "<span>" +
        SA.h(commandLabel(c)) +
        "</span>" +
        (c.sub ? '<span class="cmd__item__sub">' + SA.h(c.sub) + "</span>" : "") +
        "</div>";
    });
    body.innerHTML = html;
  }
  function commandLabel(c) {
    return SA.view === "business" && c.labelBusiness ? c.labelBusiness : c.label;
  }
  function openCommand() {
    const modal = document.getElementById("command-modal");
    openOverlay("command-modal");
    modal.classList.add("is-open");
    const input = document.getElementById("cmd-input");
    input.value = "";
    renderCommands("");
    SA.later(() => input.focus(), 30);
  }
  function runCommand(i) {
    const c = cmdFiltered[i];
    if (!c) return;
    closeOverlays();
    if (c.run) c.run();
    else SA.go(c.route);
  }

  /* ------------------------------------------------------------
     routing
     ------------------------------------------------------------ */
  const routes = [
    { re: /^\/welcome$/, screen: "welcome", auth: true },
    { re: /^\/verify$/, screen: "verify", auth: true },
    { re: /^\/bind$/, screen: "bind", auth: true },
    { re: /^\/rebind$/, screen: "rebind", auth: true },
    { re: /^\/home$/, screen: "home", nav: "home", title: "总览" },
    { re: /^\/demands$/, screen: "demands", nav: "demands", title: "需求" },
    { re: /^\/demands\/new$/, screen: "new-demand", nav: "demands", title: "新建需求" },
    { re: /^\/demands\/([^/]+)\/doc\/([^/]+)$/, screen: "doc-review", nav: "docs", title: "文档评审", params: ["id", "doc"] },
    { re: /^\/demands\/([^/]+)\/release$/, screen: "release", nav: "demands", title: "上线与审批", params: ["id"] },
    { re: /^\/demands\/([^/]+)$/, screen: "demand-detail", nav: "demands", title: "需求详情", params: ["id"] },
    { re: /^\/tasks$/, screen: "tasks", nav: "tasks", title: "任务台", titleBusiness: "待我确认" },
    { re: /^\/tools\/crq\/new$/, screen: "crq-new", nav: "crq", title: "新建 CRQ", views: ["it"] },
    { re: /^\/tools\/crq\/templates$/, screen: "crq-templates", nav: "crq", title: "CRQ 模板", views: ["it"] },
    { re: /^\/tools\/crq$/, screen: "crq", nav: "crq", title: "CRQ 工单" },
    { re: /^\/tools\/charm$/, screen: "charm", nav: "charm", title: "ChaRM 变更" },
    { re: /^\/ops\/queue$/, screen: "queue", nav: "queue", title: "队列与事件", views: ["it"] },
    { re: /^\/ops\/agents$/, screen: "agents", nav: "agents", title: "Agent 运行", views: ["it"] },
    { re: /^\/knowledge$/, screen: "knowledge", nav: "knowledge", title: "知识库" },
    { re: /^\/settings$/, screen: "settings", nav: "settings", title: "个人设置" },
    { re: /^\/admin$/, screen: "admin", nav: "admin", title: "管理控制台" },
  ];

  const NAV_NAMES = {
    home: "工作台",
    demands: "工作台",
    tasks: "工作台",
    docs: "交付工具",
    crq: "交付工具",
    charm: "交付工具",
    queue: "自动化",
    agents: "自动化",
    knowledge: "空间",
    settings: "空间",
    admin: "管理",
  };

  function parseHash() {
    let hash = location.hash.replace(/^#/, "") || "/home";
    const qi = hash.indexOf("?");
    let query = "";
    if (qi >= 0) {
      query = hash.slice(qi + 1);
      hash = hash.slice(0, qi);
    }
    return { path: hash, query: new URLSearchParams(query) };
  }

  function matchRoute(path) {
    let matched = null;
    let params = {};
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        matched = r;
        (r.params || []).forEach((p, i) => (params[p] = decodeURIComponent(m[i + 1])));
        break;
      }
    }
    return { matched, params };
  }
  function currentRouteSpec() {
    return matchRoute(parseHash().path).matched;
  }
  function routeTitle(spec) {
    if (!spec) return "";
    return SA.view === "business" && spec.titleBusiness ? spec.titleBusiness : spec.title || "";
  }

  /* 视角 / 权限驱动的应用壳：导航、用户卡、小组入口、执行器卡片 */
  function applyShell() {
    document.querySelectorAll(".nav__item").forEach((a) => {
      const views = (a.dataset.view || "business it").split(/\s+/);
      const cap = a.dataset.cap;
      const visible = views.includes(SA.view) && (!cap || SA.auth.can(cap));
      a.hidden = !visible;
      const label = a.dataset[SA.view === "it" ? "labelIt" : "labelBusiness"];
      const text = a.querySelector(".nav__text");
      if (label && text) text.textContent = label;
      // 折叠态：图标只显示 tooltip，把当前名称与计数写进 data-tip / aria-label
      const badge = a.querySelector(".nav__badge");
      const badgeText = badge ? badge.textContent.trim() : "";
      const tip = (text ? text.textContent : a.dataset.tip || "") + (badgeText ? " · " + badgeText : "");
      a.dataset.tip = tip;
      a.setAttribute("aria-label", tip);
    });
    document.querySelectorAll(".nav__group").forEach((g) => {
      const items = Array.from(g.querySelectorAll(".nav__item"));
      g.hidden = items.length > 0 && items.every((i) => i.hidden);
    });
    const exec = document.querySelector(".executor-card");
    if (exec) exec.hidden = SA.view !== "it";
    const userRole = document.getElementById("user-role");
    if (userRole) {
      userRole.textContent =
        SA.auth.account.groupName + " · " + (SA.view === "it" ? "SAP IT" : SA.auth.account.businessRole);
    }
    const groupSwitch = document.getElementById("group-switch");
    if (groupSwitch) {
      groupSwitch.href = SA.auth.can("admin.access") ? "#/admin?tab=groups" : "#/settings?tab=account";
      groupSwitch.dataset.tip = "我的小组 · " + SA.auth.account.groupName;
    }
    const userCard = document.querySelector(".user-card");
    if (userCard) {
      userCard.dataset.tip =
        SA.auth.account.name + " · " + SA.auth.account.groupName + " · " + (SA.view === "it" ? "SAP IT" : SA.auth.account.businessRole);
    }
    const roleSwitch = document.querySelector(".role-switch");
    if (roleSwitch) roleSwitch.hidden = SA.auth.account.views.length < 2;
    document.querySelectorAll(".role-switch button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.role === SA.view);
    });
  }

  function viewGuard(spec) {
    const label = SA.VIEW_META[SA.view].label;
    return `
      <div class="page page-guard">
        <div class="guard-card">
          <span class="guard-card__icon">${ic("eye")}</span>
          <h1>当前视角不可用</h1>
          <p>「${SA.h(spec.title || "")}」属于 SAP IT 工作台，${SA.h(label)}视角不提供该页面。</p>
          <div class="row gap-2">
            <button class="btn btn--primary" data-action="switch-view" data-view="it">切换到 SAP IT 视角</button>
            <a class="btn" href="${SA.viewDefaultRoute()}">返回工作台</a>
          </div>
        </div>
      </div>`;
  }

  let lastScreen = null;
  let renderToken = 0;

  /** 给页面直接子元素注入交错序号 --i（上限 8），配合 app.css 的入场规则。 */
  function applyStagger(root) {
    if (SA.isShot || SA.isReducedMotion()) return;
    const page = root.querySelector(".page");
    if (!page) return;
    const kids = page.children;
    for (let k = 0; k < kids.length; k++) {
      kids[k].style.setProperty("--i", String(Math.min(k, 8)));
    }
  }

  function render() {
    const token = ++renderToken;
    SA.clearTimers();
    closeOverlays();
    document.getElementById("app").classList.remove("sidebar-open");
    const { path, query } = parseHash();

    // 演示参数：视角与成员预览（截图 / 分享链接用）
    const viewParam = query.get("view");
    if ((viewParam === "it" || viewParam === "business") && SA.auth.account.views.includes(viewParam)) {
      SA.view = viewParam;
      SA.data.user.role = viewParam === "it" ? "SAP IT" : SA.auth.account.businessRole;
    }
    // 权限预览：在管理控制台内保持，离开后恢复真实权限
    const asParam = query.get("as");
    if (asParam === "member") {
      SA.auth.previewMember = true;
      SA.auth.previewAdmin = null;
    } else if (asParam === "groupadmin") {
      SA.auth.previewMember = false;
      SA.auth.previewAdmin = "group";
    } else if (asParam === "platform") {
      SA.auth.previewMember = false;
      SA.auth.previewAdmin = null;
    } else if (path !== "/admin") {
      SA.auth.previewMember = false;
      SA.auth.previewAdmin = null;
    }

    // 兼容 v2.1 的旧链接：设置页的管理 tab 收敛到管理控制台
    if (path === "/settings") {
      const tab = query.get("tab");
      if (tab === "groups" || tab === "integration") {
        location.replace("#/admin?tab=" + (tab === "groups" ? "groups" : "integrations"));
        return;
      }
      if (tab === "security") {
        location.replace("#/settings?tab=account");
        return;
      }
    }

    let { matched, params } = matchRoute(path);
    if (!matched) matched = routes.find((r) => r.screen === "home");
    const spec = SA.screens[matched.screen];
    if (!spec) return;

    const isAuth = !!matched.auth;
    const app = document.getElementById("app");
    const auth = document.getElementById("auth");
    app.hidden = isAuth;
    auth.hidden = !isAuth;
    document.body.classList.toggle("is-auth-route", isAuth);

    const view = isAuth ? auth : document.getElementById("view");
    const ctx = { params, query, path };
    const guard = !isAuth && matched.views && !matched.views.includes(SA.view);

    const doRender = () => {
      let html = "";
      if (guard) {
        html = viewGuard(matched);
      } else {
        try {
          html = spec.render ? spec.render(ctx) : "";
        } catch (e) {
          console.error(e);
          html = '<div class="page"><div class="callout">页面渲染失败：' + SA.h(e.message) + "</div></div>";
        }
      }
      view.innerHTML = html;
      applyStagger(view);
      hydrateIcons(view);
      if (!guard && spec.after) {
        try {
          spec.after(ctx, view);
        } catch (e) {
          console.error(e);
        }
      }
      SA.countUp(view);
      SA.animateBars(view);
      SA.scrollTop();
    };

    if (!isAuth) {
      applyShell();
      view.classList.remove("is-leaving");
      auth.classList.remove("is-leaving");
      // 路由离场：时长与 CSS 共用 --dur-exit；reduced-motion 下为 0，直接渲染
      const exitMs = SA.dur("--dur-exit");
      if (!SA.isShot && exitMs > 0 && lastScreen && lastScreen !== matched.screen) {
        view.classList.add("is-leaving");
        SA.after(() => {
          if (token !== renderToken) return;
          view.classList.remove("is-leaving");
          doRender();
        }, exitMs);
      } else {
        doRender();
      }
      // shell state
      document.querySelectorAll(".nav__item").forEach((a) => {
        a.classList.toggle("is-active", a.dataset.nav === matched.nav);
      });
      const crumb = document.getElementById("crumb");
      const title = routeTitle(matched);
      crumb.innerHTML =
        '<span class="crumb__root">' + SA.h(NAV_NAMES[matched.nav] || "Super Agent") + '</span><span class="crumb__sep">/</span><span class="crumb__now">' + SA.h(title) + "</span>";
      document.title = (title || "Super Agent") + " · SAP Super Agent";
    } else {
      doRender();
      document.title = (spec.title ? spec.title + " · " : "") + "SAP Super Agent";
    }
    lastScreen = matched.screen;
  }

  /* ------------------------------------------------------------
     global event handling
     ------------------------------------------------------------ */
  function bindGlobal() {
    document.addEventListener("click", (e) => {
      const actionEl = e.target.closest("[data-action]");
      if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === "toggle-sidebar") {
          const app = document.getElementById("app");
          if (window.innerWidth <= 960) app.classList.toggle("sidebar-open");
          else app.classList.toggle("is-collapsed");
        } else if (action === "new-demand") {
          SA.go("#/demands/new");
        } else if (action === "command") {
          openCommand();
        } else if (action === "notifications") {
          renderNotifications();
          openOverlay("notification-drawer");
        } else if (action === "close-sidebar") {
          document.getElementById("app").classList.remove("sidebar-open");
        } else if (action === "close-overlays") {
          closeOverlays();
        } else if (action === "mark-all-read") {
          SA.data.notifications.forEach((n) => (n.unread = false));
          renderNotifications();
          SA.toast("已全部标记为已读");
        } else if (action === "help") {
          SA.modal({
            title: "快捷键与帮助",
            desc: "原型中的键盘快捷键，让高频操作更快。",
            wide: false,
            body:
              '<div class="kv">' +
              '<div class="kv-row"><span class="kv-key">⌘ K</span><span class="kv-val">打开命令面板</span></div>' +
              '<div class="kv-row"><span class="kv-key">N</span><span class="kv-val">新建需求</span></div>' +
              '<div class="kv-row"><span class="kv-key">[</span><span class="kv-val">收起 / 展开侧栏</span></div>' +
              '<div class="kv-row"><span class="kv-key">视角</span><span class="kv-val">顶栏切换 SAP 业务 / SAP IT</span></div>' +
              '<div class="kv-row"><span class="kv-key">Esc</span><span class="kv-val">关闭浮层</span></div>' +
              '<div class="kv-row"><span class="kv-key">G H</span><span class="kv-val">回到总览</span></div>' +
              '<div class="kv-row"><span class="kv-key">?</span><span class="kv-val">打开本帮助</span></div>' +
              "</div>",
            actions: [{ label: "知道了", variant: "primary" }],
          });
        } else if (action === "profile") {
          const menu = document.getElementById("profile-menu");
          menu.hidden = !menu.hidden;
          renderProfileMenu();
        } else if (action === "switch-view") {
          SA.setView(actionEl.dataset.view === "business" ? "business" : "it");
        } else if (action === "notif-go") {
          closeOverlays();
        }
        return;
      }

      const notifTabEl = e.target.closest("[data-notif-tab]");
      if (notifTabEl) {
        notifTab = notifTabEl.dataset.notifTab;
        document.querySelectorAll("[data-notif-tab]").forEach((el) => {
          el.classList.toggle("is-active", el === notifTabEl);
        });
        renderNotifications();
        return;
      }

      const roleEl = e.target.closest("[data-role]");
      if (roleEl && roleEl.closest(".role-switch")) {
        SA.setView(roleEl.dataset.role === "it" ? "it" : "business");
        return;
      }

      const cmdEl = e.target.closest("[data-cmd]");
      if (cmdEl) {
        runCommand(parseInt(cmdEl.dataset.cmd, 10));
        return;
      }

      // click outside popovers
      if (!e.target.closest("#profile-menu") && !e.target.closest("[data-action='profile']")) {
        document.getElementById("profile-menu").hidden = true;
      }
    });

    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommand();
        return;
      }
      if (e.key === "Escape") {
        closeOverlays();
        return;
      }
      const cmdModal = document.getElementById("command-modal");
      if (cmdModal.classList.contains("is-open")) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          cmdIndex = Math.min(cmdFiltered.length - 1, cmdIndex + 1);
          highlightCmd();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          cmdIndex = Math.max(0, cmdIndex - 1);
          highlightCmd();
        } else if (e.key === "Enter") {
          e.preventDefault();
          runCommand(cmdIndex);
        }
        return;
      }
      if (typing) return;
      if (e.key === "n" || e.key === "N") SA.go("#/demands/new");
      else if (e.key === "[") document.getElementById("app").classList.toggle("is-collapsed");
      else if (e.key === "?") {
        const btn = document.querySelector("[data-action='help']");
        if (btn) btn.click();
      } else if (e.key === "g") {
        window.__gKey = Date.now();
      } else if (e.key === "h" && window.__gKey && Date.now() - window.__gKey < 800) {
        SA.go("#/home");
      }
    });

    document.getElementById("cmd-input").addEventListener("input", (e) => {
      renderCommands(e.target.value);
    });
    document.getElementById("scrim").addEventListener("click", () => closeOverlays());

    window.addEventListener("hashchange", render);
  }

  function highlightCmd() {
    document.querySelectorAll(".cmd__item").forEach((el, i) => {
      el.classList.toggle("is-active", i === cmdIndex);
    });
    const active = document.querySelector(".cmd__item.is-active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function renderProfileMenu() {
    const menu = document.getElementById("profile-menu");
    menu.innerHTML =
      '<div class="profile-menu__head"><div class="profile-menu__name">' +
      SA.h(SA.auth.account.name) +
      '</div><div class="profile-menu__sub">' +
      SA.h(SA.auth.account.email) +
      "</div></div>" +
      '<a class="menu-item" href="#/settings?tab=account">' +
      ic("fingerprint") +
      "账户与设备</a>" +
      '<a class="menu-item" href="#/settings?tab=notify">' +
      ic("bell") +
      "通知规则</a>" +
      (SA.auth.can("admin.access")
        ? '<a class="menu-item" href="#/admin?tab=groups">' + ic("shield") + "管理控制台</a>"
        : "") +
      '<a class="menu-item" href="#/welcome">' +
      ic("user-plus") +
      "重新注册 / 更换设备</a>" +
      '<div class="menu-sep"></div>' +
      '<a class="menu-item" href="#/welcome">' +
      ic("log-out") +
      "退出登录</a>";
    hydrateIcons(menu);
  }

  /* ------------------------------------------------------------
     boot
     ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    hydrateIcons(document);
    const demandBadge = document.querySelector('.nav__item[data-nav="demands"] .nav__badge');
    if (demandBadge) demandBadge.textContent = SA.data.demands.length;
    bindGlobal();
    if (!location.hash) location.hash = "#/home";
    if (parseHash().query.get("collapse") === "1") document.getElementById("app").classList.add("is-collapsed");
    render();
    const bootParams = new URLSearchParams(location.search);
    if (bootParams.get("notif") === "1") {
      renderNotifications();
      openOverlay("notification-drawer");
    }
    if (bootParams.get("cmd") === "1") {
      SA.later(openCommand, 80);
    }
  });
})();
