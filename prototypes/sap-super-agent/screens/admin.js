/* ============================================================
   Screen · Admin console
   管理控制台：小组与成员 / 集成与维护 / 审计日志 / 无权限态
   设计说明见 docs/06-角色权限与管理.md
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const TABS = [
    { key: "groups", label: "小组与成员", icon: "users" },
    { key: "integrations", label: "集成与维护", icon: "plug" },
    { key: "audit", label: "审计日志", icon: "list" },
  ];

  const ROLES = ["SAP 业务", "需求顾问", "SAP IT · ABAP", "SAP IT · 前端", "Basis / ChaRM", "测试"];

  const STATUS = {
    connected: { label: "已连接", tone: "green", quick: "测试连接" },
    syncing: { label: "同步中", tone: "teal", quick: "查看同步日志" },
    attention: { label: "需处理", tone: "amber", quick: "重新授权" },
    paused: { label: "已停用", tone: "slate", quick: "恢复" },
    unconfigured: { label: "未配置", tone: "outline", quick: "配置连接" },
  };

  /* ------------------------------------------------------------
     data
     ------------------------------------------------------------ */
  const INTEGRATIONS = [
    {
      key: "teams",
      name: "Microsoft Teams",
      desc: "门禁通知、需求澄清、上线审批",
      icon: "users",
      status: "connected",
      meta: [["工作区", "SAP 财务交付"], ["频道", "#fin-sap-it"], ["最近投递", "0.9s · 10:42"]],
      conn: { endpoint: "https://teams.microsoft.com/l/channel/19%3Afin-sap-it", client: "SAP 财务交付 · 工作区", auth: "OAuth 2.0 · 服务账号", owner: "陈曦", maintained: "11-09 16:20" },
      cred: { type: "OAuth 客户端密钥", masked: "•••••••• 3f9a", rotated: "2026-09-12", expires: "2026-12-12" },
      health: { success: "99.6%", fails: "0", error: "—", next: "事件驱动" },
      calls: [["10:42", "approval.requested", "200", "0.9s"], ["10:18", "demand.submitted", "200", "1.1s"], ["09:52", "stage.done", "200", "0.7s"], ["09:30", "release.submitted", "200", "0.8s"]],
    },
    {
      key: "smtp",
      name: "企业邮件 SMTP",
      desc: "一次性注册链接、上线审批邮件",
      icon: "mail",
      status: "connected",
      meta: [["发件人", "no-reply@sap.example"], ["最近发送", "今天 16:21"], ["退信率", "0.2%"]],
      conn: { endpoint: "smtp://sap-exmail.example:587", client: "企业邮局 · SAP-EX", auth: "STARTTLS · 服务账号", owner: "陈曦", maintained: "10-28 11:02" },
      cred: { type: "应用专用密码", masked: "•••••••• 71c4", rotated: "2026-10-02", expires: "2027-01-02" },
      health: { success: "99.9%", fails: "0", error: "—", next: "事件驱动" },
      calls: [["16:21", "release.submitted", "200", "0.6s"], ["14:08", "invitation.sent", "200", "0.4s"], ["09:31", "gate.notify", "200", "0.5s"]],
    },
    {
      key: "jira",
      name: "JIRA",
      desc: "Backlog 双向同步、Issue 关联",
      icon: "trello",
      status: "attention",
      error: "401 凭据已过期 · 同步已暂停 3 小时",
      meta: [["Project", "SAP"], ["同步方向", "双向"], ["最近成功", "今天 07:12"]],
      conn: { endpoint: "https://jira.sap.example/rest/api/2", client: "Project SAP · Cloud", auth: "API Token", owner: "陈曦", maintained: "11-09 18:40" },
      cred: { type: "API Token", masked: "•••••• 8c21", rotated: "2026-08-11", expires: "2026-11-09 · 已过期" },
      health: { success: "96.1%", fails: "3", error: "401 Unauthorized · token expired", next: "暂停 · 待授权" },
      calls: [["07:12", "demand.submitted", "200", "1.2s"], ["07:14", "issue.sync", "401", "0.3s"], ["07:14", "issue.sync", "401", "0.3s"], ["07:15", "issue.sync", "401", "0.3s"]],
    },
    {
      key: "solman",
      name: "SolMan CRQ API",
      desc: "外部工单号、模板字段编排",
      icon: "file-text",
      status: "connected",
      meta: [["Client", "200 · FY2"], ["平均耗时", "12.4s"], ["最近调用", "10:42"]],
      conn: { endpoint: "https://solman.sap.example/sap/bc/srt/rfc/sap/zsa_crq", client: "SolMan 7.2 · Client 200", auth: "OAuth 2.0 · 服务账号", owner: "陈曦", maintained: "10-20 09:10" },
      cred: { type: "OAuth 客户端密钥", masked: "•••••••• 5b7e", rotated: "2026-09-12", expires: "2026-12-12" },
      health: { success: "98.8%", fails: "1", error: "400 请求类型 ZSAP_CHG 缺少必填字段", next: "事件驱动" },
      calls: [["10:42", "CRQ.create", "200", "12.4s"], ["10:39", "CRQ.create", "400", "11.8s"], ["10:20", "CRQ.status", "200", "8.2s"]],
    },
    {
      key: "charm",
      name: "ChaRM API",
      desc: "Change Request / Document 同步",
      icon: "git-branch",
      status: "syncing",
      meta: [["系统", "FY2 · 200"], ["轮询间隔", "60s"], ["最近拉取", "12s 前"]],
      conn: { endpoint: "https://charm.sap.example/api/v1", client: "ChaRM · FY2 200", auth: "OAuth 2.0 · 服务账号", owner: "陈曦", maintained: "10-20 09:12" },
      cred: { type: "OAuth 客户端密钥", masked: "•••••••• 2d08", rotated: "2026-10-01", expires: "2027-01-01" },
      health: { success: "99.2%", fails: "0", error: "—", next: "60s 后" },
      calls: [["10:41", "CR.status", "200", "2.1s"], ["10:40", "CD.sync", "200", "3.4s"], ["10:39", "CR.status", "200", "2.0s"]],
    },
    {
      key: "ai",
      name: "AI 网关",
      desc: "BYOK · 进入澄清与文档阶段",
      icon: "sparkles",
      status: "connected",
      meta: [["模型", "deepseek-v4"], ["本月 tokens", "2.4M"], ["成本上限", "$50 / 月"]],
      conn: { endpoint: "https://ai-gw.internal/v1", client: "BYOK · 财务共享组", auth: "API Key · 每 90 天轮换", owner: "陈曦", maintained: "10-20 09:15" },
      cred: { type: "API Key", masked: "sk-•••••• 9e02", rotated: "2026-10-20", expires: "2027-01-18" },
      health: { success: "99.9%", fails: "0", error: "—", next: "按需" },
      calls: [["10:42", "chat.completion", "200", "3.8s"], ["10:41", "embedding", "200", "0.4s"], ["10:38", "chat.completion", "200", "4.2s"]],
    },
    {
      key: "helix",
      name: "Helix",
      desc: "需求、缺陷与测试用例同步",
      icon: "box",
      status: "connected",
      wide: true,
      meta: [["系统", "Helix ALM · 2026"], ["同步方向", "双向"], ["最近同步", "3 分钟前"]],
      conn: { endpoint: "https://helix.sap.example/api/v1", client: "Helix ALM · 2026", auth: "OAuth 2.0 · 服务账号", owner: "陈曦", maintained: "11-09 15:02" },
      cred: { type: "OAuth 客户端密钥", masked: "•••••••• 7a10", rotated: "2026-09-30", expires: "2026-12-30" },
      health: { success: "99.4%", fails: "0", error: "—", next: "事件驱动" },
      calls: [["10:40", "requirement.sync", "200", "1.4s"], ["10:22", "defect.push", "200", "0.9s"], ["09:58", "testcase.sync", "200", "2.1s"]],
    },
  ];

  /* 集成两级配置：连接与凭据归平台，使用参数按小组维护（docs/06 §4.5） */
  const GROUP_PARAM_DEFS = [
    {
      key: "helix",
      name: "Helix",
      desc: "需求、缺陷与测试用例同步",
      icon: "box",
      fields: [
        { key: "workspace", label: "默认工作空间", def: "SAP-COMMON", type: "text" },
        { key: "project", label: "默认项目", def: "SAP-CORE", type: "text" },
        { key: "issueType", label: "默认工单类型", def: "需求", type: "select", options: ["需求", "缺陷", "测试用例"] },
        { key: "assigneeGroup", label: "默认指派组", def: "未指定", type: "text" },
      ],
    },
    {
      key: "jira",
      name: "JIRA",
      desc: "Backlog 双向同步、Issue 关联",
      icon: "trello",
      fields: [
        { key: "project", label: "默认 Project", def: "SAP", type: "text" },
        { key: "issueType", label: "默认 Issue 类型", def: "Story", type: "select", options: ["Story", "Task", "Bug"] },
        { key: "syncDirection", label: "同步方向", def: "双向", type: "select", options: ["双向", "仅推送", "仅拉取"] },
      ],
    },
    {
      key: "teams",
      name: "Microsoft Teams",
      desc: "门禁通知、需求澄清、上线审批",
      icon: "users",
      fields: [
        { key: "channel", label: "默认频道", def: "#sap-delivery", type: "text" },
        { key: "mention", label: "默认 @ 群组", def: "未指定", type: "text" },
      ],
    },
    {
      key: "solman",
      name: "SolMan CRQ API",
      desc: "外部工单号、模板字段编排",
      icon: "file-text",
      fields: [
        { key: "template", label: "默认 CRQ 模板", def: "通用 v1", type: "select", options: ["财务共享 v3", "供应链 v2", "制造 v1", "通用 v1"] },
        { key: "requestType", label: "默认请求类型", def: "ZSAP_CHG", type: "text" },
      ],
    },
  ];

  const GROUP_PARAMS = {
    "FIN-SH": {
      helix: { workspace: "FIN-SH-WS", project: "FIN-AP", assigneeGroup: "财务共享组" },
      jira: { project: "SAP-FIN" },
      teams: { channel: "#fin-sap-it", mention: "@财务共享组" },
      solman: { template: "财务共享 v3" },
    },
    "SCM-CN": {
      helix: { workspace: "SCM-WS", project: "SCM-SD", issueType: "缺陷" },
      jira: { project: "SAP-SCM" },
      teams: { channel: "#scm-sap-it" },
      solman: { template: "供应链 v2" },
    },
    "MFG-CN": {
      helix: { workspace: "MFG-WS" },
      jira: { project: "SAP-MFG" },
      teams: { channel: "#mfg-sap-it", mention: "@制造组" },
      solman: { template: "制造 v1" },
    },
  };

  const PARAM_META = {
    "FIN-SH": {
      helix: { by: "陈曦", at: "11-09 15:02" },
      jira: { by: "林桦", at: "11-08 10:20" },
      teams: { by: "林桦", at: "11-06 17:30" },
      solman: { by: "林桦", at: "11-06 17:30" },
    },
    "SCM-CN": {
      helix: { by: "郑一", at: "11-07 14:10" },
      teams: { by: "郑一", at: "11-05 09:40" },
      solman: { by: "郑一", at: "11-04 16:22" },
    },
    "MFG-CN": {
      helix: { by: "赵岑", at: "11-03 11:08" },
      teams: { by: "赵岑", at: "11-02 15:30" },
    },
  };

  const WEBHOOKS = [
    { event: "approval.requested", target: "teams-notify", status: "启用", tone: "green", last: "0.9s" },
    { event: "demand.submitted", target: "jira-sync", status: "启用", tone: "green", last: "1.2s" },
    { event: "stage.done", target: "confluence", status: "死信 1", tone: "amber", last: "—" },
    { event: "release.submitted", target: "smtp-approval", status: "启用", tone: "green", last: "16:21" },
  ];

  const AUDIT = [
    { time: "今天 09:12", actor: "陈曦", action: "轮换凭据", target: "集成 · SolMan CRQ API", source: "10.42.8.17", result: "成功", kind: "integrations" },
    { time: "今天 08:40", actor: "系统", action: "凭据过期 · 暂停同步", target: "集成 · JIRA", source: "control-plane", result: "需处理", kind: "integrations" },
    { time: "昨天 18:40", actor: "林桦", action: "调整业务角色", target: "王栎 · Basis / ChaRM", source: "10.42.8.22", result: "成功", kind: "members", group: "FIN-SH" },
    { time: "昨天 14:20", actor: "林桦", action: "发送邀请", target: "许澄 → 财务共享组", source: "10.42.8.22", result: "待接受", kind: "members", group: "FIN-SH" },
    { time: "11-09 16:20", actor: "陈曦", action: "测试连接", target: "集成 · Microsoft Teams", source: "10.42.8.17", result: "成功", kind: "integrations" },
    { time: "11-08 10:02", actor: "林桦", action: "任命小组管理员", target: "财务共享组 · 王栎", source: "10.42.8.22", result: "成功", kind: "members", group: "FIN-SH" },
    { time: "11-06 17:30", actor: "林桦", action: "修改分组规则", target: "财务共享组 · 默认模板 PDO v4", source: "10.42.8.22", result: "成功", kind: "groups", group: "FIN-SH" },
    { time: "11-05 11:04", actor: "陈曦", action: "解除设备绑定", target: "顾遥 · Windows 11", source: "10.42.8.17", result: "成功", kind: "security", group: "FIN-SH" },
    { time: "11-04 09:30", actor: "系统", action: "指纹不匹配 · 要求重新验证", target: "顾遥", source: "10.42.9.02", result: "已拦截", kind: "security", group: "FIN-SH" },
    { time: "11-03 15:12", actor: "陈曦", action: "创建小组", target: "制造组 · MFG-CN", source: "10.42.8.17", result: "成功", kind: "groups", group: "MFG-CN" },
  ];

  const MEMBERS = {
    "FIN-SH": [
      { id: "chen.xi", name: "陈曦", email: "chen.xi@sap.example", role: "SAP 业务", admin: "platform", device: "已绑定 · MacBook Pro", active: "刚刚", tone: "ink", self: true },
      { id: "lin.hua", name: "林桦", email: "lin.hua@sap.example", role: "需求顾问", admin: "group", device: "已绑定 · Windows", active: "12 分钟前", tone: "teal" },
      { id: "zhou.yu", name: "周予", email: "zhou.yu@sap.example", role: "SAP IT · ABAP", admin: null, device: "已绑定 · MacBook Pro", active: "今天 09:18", tone: "blue" },
      { id: "shen.ke", name: "沈珂", email: "shen.ke@sap.example", role: "SAP IT · 前端", admin: null, device: "已绑定 · WSL-02", active: "今天 08:42", tone: "violet" },
      { id: "wang.li", name: "王栎", email: "wang.li@sap.example", role: "Basis / ChaRM", admin: "group", device: "已绑定 · 办公机", active: "今天 08:12", tone: "rose" },
      { id: "gu.yao", name: "顾遥", email: "gu.yao@sap.example", role: "测试", admin: null, device: "未绑定", active: "昨天", tone: "amber" },
      { id: "xu.cheng", name: "许澄", email: "xu.cheng@sap.example", role: "SAP 业务", admin: null, device: "未绑定", active: "—", tone: "slate", status: "invited", invited: "11-09 14:20" },
    ],
    "SCM-CN": [
      { id: "zheng.yi", name: "郑一", email: "zheng.yi@sap.example", role: "需求顾问", admin: "group", device: "已绑定 · Windows", active: "5 分钟前", tone: "teal" },
      { id: "lu.heng", name: "陆衡", email: "lu.heng@sap.example", role: "SAP IT · ABAP", admin: null, device: "已绑定 · MacBook Pro", active: "今天 09:40", tone: "blue" },
      { id: "he.yu", name: "何雨", email: "he.yu@sap.example", role: "SAP 业务", admin: null, device: "已绑定 · 办公机", active: "昨天", tone: "ink" },
      { id: "qin.lang", name: "秦朗", email: "qin.lang@sap.example", role: "测试", admin: null, device: "未绑定", active: "2 天前", tone: "amber" },
      { id: "song.qi", name: "宋琪", email: "song.qi@sap.example", role: "SAP 业务", admin: null, device: "未绑定", active: "—", tone: "slate", status: "invited", invited: "11-08 10:12" },
    ],
    "MFG-CN": [
      { id: "zhao.cen", name: "赵岑", email: "zhao.cen@sap.example", role: "Basis / ChaRM", admin: "group", device: "已绑定 · 办公机", active: "3 分钟前", tone: "violet" },
      { id: "han.che", name: "韩彻", email: "han.che@sap.example", role: "SAP IT · ABAP", admin: null, device: "已绑定 · WSL-01", active: "今天 08:55", tone: "blue" },
      { id: "bai.lu", name: "白露", email: "bai.lu@sap.example", role: "SAP 业务", admin: null, device: "已绑定 · MacBook Pro", active: "昨天", tone: "ink" },
      { id: "jiang.ye", name: "江野", email: "jiang.ye@sap.example", role: "SAP IT · 前端", admin: null, device: "已绑定 · Windows", active: "昨天", tone: "teal" },
      { id: "su.he", name: "苏禾", email: "su.he@sap.example", role: "测试", admin: null, device: "未绑定", active: "3 天前", tone: "amber" },
      { id: "luo.qing", name: "罗青", email: "luo.qing@sap.example", role: "需求顾问", admin: null, device: "已绑定 · 办公机", active: "上周", tone: "rose" },
    ],
  };

  let auditKind = "all";

  /* 动效回放：refresh() 会整页重渲染，用一次性标记给受影响的集成卡与新审计行补入场 */
  const fx = { integration: null, audit: null };

  /* ------------------------------------------------------------
     helpers
     ------------------------------------------------------------ */
  function groupOf(key) {
    return SA.data.groups.find((g) => g.key === key) || SA.data.groups[0];
  }
  function membersOf(key) {
    if (!MEMBERS[key]) MEMBERS[key] = [];
    return MEMBERS[key];
  }
  function statusMeta(s) {
    return STATUS[s] || STATUS.connected;
  }
  function canManageGroup(key) {
    return SA.auth.can("admin.groups.manage") && (SA.auth.level() === "platform" || key === SA.auth.account.groupKey);
  }
  function auditPush(entry) {
    AUDIT.unshift(
      Object.assign(
        { time: "刚刚", actor: SA.auth.account.name, source: "10.42.8.17", result: "成功", kind: "groups" },
        entry
      )
    );
    fx.audit = entry.kind || "groups";
  }
  function refresh() {
    SA.go(location.hash);
  }
  function toast(msg, icon) {
    SA.toast(msg, { icon: icon || "check-circle" });
  }
  function adminLevelLabel() {
    return SA.auth.level() === "platform" ? "平台管理员" : "小组管理员";
  }

  /* ------------------------------------------------------------
     page pieces
     ------------------------------------------------------------ */
  function attentionStrip() {
    const items = [];
    INTEGRATIONS.filter((i) => i.status === "attention").forEach((it) => {
      items.push({ icon: "alert-triangle", title: it.name + " 需要维护", desc: it.error, action: "去维护", tab: "integrations", maintain: it.key });
    });
    SA.data.groups.forEach((g) => {
      const pending = membersOf(g.key).filter((m) => m.status === "invited");
      if (pending.length) {
        items.push({ icon: "user-plus", title: pending.map((m) => m.name).join("、") + " 的邀请待接受", desc: g.name + " · 邀请已过期，可重发", action: "去查看", tab: "groups", group: g.key });
      }
    });
    if (!items.length) return "";
    return (
      '<div class="admin-attention">' +
      items
        .map(
          (i) =>
            '<div class="admin-attention__item">' +
            '<span class="admin-attention__icon">' + ic(i.icon) + "</span>" +
            '<span class="grow"><b>' + SA.h(i.title) + "</b><em>" + SA.h(i.desc) + "</em></span>" +
            '<button class="btn btn--sm" data-action="admin-goto" data-tab="' + i.tab + '"' +
            (i.maintain ? ' data-maintain="' + i.maintain + '"' : "") +
            (i.group ? ' data-group="' + i.group + '"' : "") +
            ">" + i.action + "</button>" +
            "</div>"
        )
        .join("") +
      "</div>"
    );
  }

  function deniedPage() {
    return (
      '<div class="page page-admin">' +
      '<div class="denied">' +
      '<span class="denied__icon">' + ic("shield") + "</span>" +
      "<h1>需要管理员权限</h1>" +
      "<p>当前账号是 " + SA.h(SA.auth.account.groupName) + " 的普通成员，没有管理控制台权限。</p>" +
      '<div class="row gap-2" style="justify-content:center">' +
      '<a class="btn btn--primary" href="#/home">返回工作台</a>' +
      '<a class="btn" href="#/settings?tab=account">个人设置</a>' +
      "</div>" +
      '<div class="denied__note">需要权限？联系本组管理员 林桦，或平台管理员。</div>' +
      "</div></div>"
    );
  }

  /* ------------------------------------------------------------
     groups
     ------------------------------------------------------------ */
  function groupCard(g, selectedKey) {
    const mine = g.key === SA.auth.account.groupKey;
    const selected = g.key === selectedKey;
    const manage = canManageGroup(g.key);
    const list = membersOf(g.key);
    const admins = list.filter((m) => m.admin).map((m) => m.name);
    return (
      '<div class="group-card card' + (selected ? " is-selected" : "") + (mine ? " is-mine" : "") + '" data-action="select-group" data-group="' + g.key + '" role="button" tabindex="0">' +
      '<div class="group-card__head">' +
      '<span class="group-switch__icon">' + g.key.split("-")[0] + "</span>" +
      '<span class="grow"><b>' + SA.h(g.name) + "</b><em>" + g.key + " · " + list.length + " 位成员</em></span>" +
      (mine ? '<span class="pill pill--blue">我的小组</span>' : "") +
      "</div>" +
      '<div class="group-card__meta"><span>管理员</span><b>' + SA.h(admins.join("、") || "—") + "</b><span>默认模板</span><b>" + SA.h(g.template) + "</b></div>" +
      '<div class="group-card__foot">' +
      '<button class="btn btn--sm btn--ghost" data-action="manage-group" data-group="' + g.key + '"' + (manage ? "" : ' disabled title="仅平台管理员可管理"') + ">管理小组</button>" +
      '<span class="grow"></span>' +
      (selected ? '<span class="pill pill--outline">当前</span>' : "") +
      "</div></div>"
    );
  }

  function adminCell(m) {
    if (m.admin === "platform") return '<span class="pill pill--violet">平台管理员</span>';
    if (m.admin === "group") return '<span class="pill pill--blue">小组管理员</span>';
    return '<span class="sm muted">成员</span>';
  }

  function memberRow(m, groupKey, canManage) {
    const pending = m.status === "invited";
    const nameCell =
      '<span class="member-cell"><span class="avatar avatar--sm" data-tone="' + (m.tone || "slate") + '">' + SA.h(m.name[0]) + "</span>" + SA.h(m.name) +
      (m.self ? ' <span class="pill pill--outline">我</span>' : "") + "</span>";
    return (
      '<tr data-member="' + SA.h(m.id) + '">' +
      "<td>" + nameCell + "</td>" +
      '<td><span class="mono sm">' + SA.h(m.email) + "</span></td>" +
      '<td><span class="pill pill--outline">' + SA.h(m.role) + "</span></td>" +
      "<td>" + adminCell(m) + "</td>" +
      "<td>" + (pending ? '<span class="sm muted">邀请 ' + SA.h(m.invited) + " 发出</span>" : '<span class="sm ' + (m.device === "未绑定" ? "muted" : "") + '">' + SA.h(m.device) + "</span>") + "</td>" +
      '<td><span class="sm muted">' + SA.h(pending ? "—" : m.active) + "</span></td>" +
      "<td>" +
      (!canManage
        ? '<span class="sm muted">只读</span>'
        : pending
        ? '<span class="row gap-2"><button class="btn btn--sm" data-action="member-resend" data-group="' + groupKey + '" data-member="' + SA.h(m.id) + '">重发</button><button class="btn btn--sm btn--ghost" data-action="member-revoke" data-group="' + groupKey + '" data-member="' + SA.h(m.id) + '">撤销</button></span>'
        : '<button class="icon-btn icon-btn--sm" data-action="member-menu" data-group="' + groupKey + '" data-member="' + SA.h(m.id) + '" aria-label="成员操作">' + ic("more-horizontal") + "</button>") +
      "</td></tr>"
    );
  }

  function rulesCard() {
    return (
      '<div class="card">' +
      '<div class="card-head"><h3>成员维护权限</h3><span class="pill pill--outline">' + adminLevelLabel() + "</span></div>" +
      '<div class="settings-kv">' +
      "<div><span>平台管理员</span><b>全部小组 · 集成 · 审计</b></div>" +
      "<div><span>小组管理员</span><b>本组成员与默认配置</b></div>" +
      "<div><span>普通成员</span><b>只读 + 设备自助</b></div>" +
      "<div><span>最后一名管理员</span><b>不可移除或降级</b></div>" +
      "<div><span>跨组转移</span><b>仅平台管理员</b></div>" +
      "<div><span>变更留痕</span><b>写入审计日志</b></div>" +
      "</div>" +
      '<div class="integration-card__foot"><a class="btn btn--sm" href="#/admin?tab=audit">' + ic("list") + " 查看审计日志</a></div>" +
      "</div>"
    );
  }

  function visibleAudit() {
    if (SA.auth.level() === "group") return AUDIT.filter((a) => a.group === SA.auth.account.groupKey);
    return AUDIT;
  }

  function changesCard() {
    const rows = visibleAudit()
      .filter((a) => a.kind === "members")
      .slice(0, 3)
      .map(
        (a) =>
          '<div class="change-row"><span class="change-row__icon">' + ic("user") + "</span>" +
          '<span class="change-row__main"><b>' + SA.h(a.action) + " · " + SA.h(a.target) + "</b><em>" + SA.h(a.actor) + " · " + SA.h(a.time) + "</em></span></div>"
      )
      .join("");
    return (
      '<div class="card">' +
      '<div class="card-head"><h3>成员变更</h3><a class="link sm" href="#/admin?tab=audit">全部 ' + ic("arrow-right") + "</a></div>" +
      '<div class="change-list">' + (rows || '<div class="empty"><div class="empty__title">暂无成员变更</div></div>') + "</div>" +
      "</div>"
    );
  }

  function groupsTab(selectedKey) {
    const g = groupOf(selectedKey);
    const list = membersOf(selectedKey);
    const admins = list.filter((m) => m.admin).length;
    const pending = list.filter((m) => m.status === "invited").length;
    const manage = canManageGroup(selectedKey);
    return (
      '<div class="settings-section">' +
      '<div class="section-head">' +
      "<div><h2>小组与成员</h2></div>" +
      '<div class="row gap-2">' +
      (SA.auth.can("admin.groups.create") ? '<button class="btn btn--sm" data-action="create-group">' + ic("plus") + " 新建小组</button>" : "") +
      '<button class="btn btn--sm btn--primary" data-action="invite-member" data-group="' + selectedKey + '"' + (manage ? "" : ' disabled title="仅平台管理员可维护其他小组"') + ">" + ic("user-plus") + " 邀请成员</button>" +
      "</div></div>" +
      '<div class="group-cards">' + SA.data.groups.map((x) => groupCard(x, selectedKey)).join("") + "</div>" +
      '<div class="card" style="margin-top:14px">' +
      '<div class="card-head"><h3>' + SA.h(g.name) + "成员</h3>" +
      '<span class="sm">' + list.length + " 人 · " + admins + " 位管理员" + (pending ? " · " + pending + " 位待接受邀请" : "") + "</span></div>" +
      '<div class="table-wrap"><table class="table">' +
      "<thead><tr><th>成员</th><th>邮箱</th><th>业务角色</th><th>管理权限</th><th>设备绑定</th><th>最近活跃</th><th></th></tr></thead>" +
      "<tbody>" + list.map((m) => memberRow(m, selectedKey, manage)).join("") + "</tbody></table></div>" +
      '<div class="table-foot"><span class="sm">成员只能属于一个小组；跨组转移由平台管理员执行，历史需求与任务保留原小组归属。</span></div>' +
      "</div>" +
      '<div class="settings-two" style="margin-top:14px">' + rulesCard() + changesCard() + "</div>" +
      "</div>"
    );
  }

  /* ------------------------------------------------------------
     integrations
     ------------------------------------------------------------ */
  function integrationCard(it, canManage) {
    const st = statusMeta(it.status);
    return (
      '<div class="integration-card card' + (it.status === "attention" ? " integration-card--attention" : "") + '" data-key="' + it.key + '">' +
      '<div class="integration-card__head">' +
      '<span class="integration-card__icon integration-card__icon--' + (st.tone === "outline" ? "slate" : st.tone) + '">' + ic(it.icon) + "</span>" +
      '<span class="grow"><b>' + SA.h(it.name) + "</b><em>" + SA.h(it.desc) + "</em></span>" +
      '<span class="pill pill--' + st.tone + '"><span class="dot"></span>' + st.label + "</span>" +
      "</div>" +
      (it.status === "attention" ? '<div class="integration-card__alert">' + ic("alert-triangle") + "<span>" + SA.h(it.error) + "</span></div>" : "") +
      '<div class="integration-card__meta">' + it.meta.map(([k, v]) => "<div><span>" + SA.h(k) + "</span><b>" + SA.h(v) + "</b></div>").join("") + "</div>" +
      '<div class="integration-card__foot">' +
      '<button class="btn btn--sm btn--ghost" data-action="integration-quick" data-key="' + it.key + '">' + st.quick + "</button>" +
      '<span class="grow"></span>' +
      '<button class="btn btn--sm" data-action="integration-maintain" data-key="' + it.key + '">' + ic("tool") + " 维护</button>" +
      "</div></div>"
    );
  }

  function webhooksCard(canManage) {
    return (
      '<div class="card">' +
      '<div class="card-head"><h3>Webhook 订阅</h3>' + (canManage ? '<button class="btn btn--sm" data-action="new-webhook">' + ic("plus") + " 新建订阅</button>" : "") + "</div>" +
      '<div class="table-wrap"><table class="table">' +
      "<thead><tr><th>事件</th><th>目标</th><th>状态</th><th>最近投递</th></tr></thead><tbody>" +
      WEBHOOKS.map(
        (w) =>
          '<tr><td><span class="mono sm">' + SA.h(w.event) + "</span></td><td>" + SA.h(w.target) + "</td>" +
          '<td><span class="pill pill--' + w.tone + '"><span class="dot"></span>' + w.status + "</span></td>" +
          '<td class="sm">' + SA.h(w.last) + "</td></tr>"
      ).join("") +
      "</tbody></table></div>" +
      '<div class="table-foot"><span class="sm">失败会进入死信并保留 payload。</span><span class="grow"></span><a class="link sm" href="#/ops/queue">查看队列 ' + ic("arrow-right") + "</a></div>" +
      "</div>"
    );
  }

  function serviceAccountCard(canManage) {
    return (
      '<div class="card">' +
      '<div class="card-head"><h3>服务账号</h3><span class="sm">控制平面 → SAP</span></div>' +
      '<div class="service-account">' +
      '<div><span>账号</span><b class="mono">SV_SA_AGENT</b></div>' +
      "<div><span>作用域</span><b>需求读写 · 审批回写</b></div>" +
      "<div><span>凭据</span><b>Secret Manager · 每 90 天轮换</b></div>" +
      "<div><span>上次轮换</span><b>2026-10-20</b></div>" +
      "</div>" +
      '<div class="callout callout--blue" style="margin:0 16px 12px">' + ic("shield") + "<span>凭据只在服务端使用，不会下发到客户端或进入模型上下文。</span></div>" +
      (canManage ? '<div class="integration-card__foot"><button class="btn btn--sm" data-action="rotate-service">' + ic("refresh") + " 轮换凭据</button></div>" : "") +
      "</div>"
    );
  }

  function integrationCard(it, canManage) {
    const st = statusMeta(it.status);
    const fxOn = fx.integration === it.key;
    return (
      '<div class="integration-card card' + (it.status === "attention" ? " integration-card--attention" : "") + (it.wide ? " integration-card--wide" : "") + (fxOn ? " anim-fade" : "") + '" data-key="' + it.key + '">' +
      '<div class="integration-card__head">' +
      '<span class="integration-card__icon integration-card__icon--' + (st.tone === "outline" ? "slate" : st.tone) + '">' + ic(it.icon) + "</span>" +
      '<span class="grow"><b>' + SA.h(it.name) + "</b><em>" + SA.h(it.desc) + "</em></span>" +
      '<span class="pill pill--' + st.tone + (fxOn ? " anim-scale" : "") + '"><span class="dot"></span>' + st.label + "</span>" +
      "</div>" +
      (it.status === "attention" ? '<div class="integration-card__alert">' + ic("alert-triangle") + "<span>" + SA.h(it.error) + "</span></div>" : "") +
      '<div class="integration-card__meta">' + it.meta.map(([k, v]) => "<div><span>" + SA.h(k) + "</span><b>" + SA.h(v) + "</b></div>").join("") + "</div>" +
      '<div class="integration-card__foot">' +
      (canManage ? '<button class="btn btn--sm btn--ghost" data-action="integration-quick" data-key="' + it.key + '">' + st.quick + "</button>" : "") +
      (it.wide ? '<a class="btn btn--sm btn--ghost" href="#/admin?tab=integrations&sub=params&group=' + SA.auth.account.groupKey + '">' + ic("users") + " 小组参数</a>" : "") +
      '<span class="grow"></span>' +
      '<button class="btn btn--sm" data-action="integration-maintain" data-key="' + it.key + '">' + ic("tool") + " 维护</button>" +
      "</div></div>"
    );
  }

  function integrationSubnav(sub, groupKey) {
    return (
      '<div class="integration-subnav"><div class="segmented">' +
      '<button class="' + (sub === "connection" ? "is-active" : "") + '" data-action="integration-sub" data-sub="connection">' + ic("plug") + " 连接与凭据</button>" +
      '<button class="' + (sub === "params" ? "is-active" : "") + '" data-action="integration-sub" data-sub="params" data-group="' + groupKey + '">' + ic("users") + " 小组参数</button>" +
      "</div></div>"
    );
  }

  function connectionView() {
    const canManage = SA.auth.can("admin.integrations.manage");
    return (
      '<div class="settings-section">' +
      '<div class="section-head"><div><h2>连接与凭据</h2></div><a class="link sm" href="#/ops/queue">调用与投递 ' + ic("arrow-right") + "</a></div>" +
      '<div class="integration-grid">' + INTEGRATIONS.map((it) => integrationCard(it, canManage)).join("") + "</div>" +
      "</div>" +
      '<div class="settings-two">' + webhooksCard(canManage) + serviceAccountCard(canManage) + "</div>"
    );
  }

  function effectiveParams(groupKey, defKey) {
    const defs = GROUP_PARAM_DEFS.find((d) => d.key === defKey);
    if (!defs) return [];
    const store = (GROUP_PARAMS[groupKey] && GROUP_PARAMS[groupKey][defKey]) || {};
    return defs.fields.map((f) => ({
      key: f.key,
      label: f.label,
      def: f.def,
      type: f.type,
      options: f.options,
      value: store[f.key] !== undefined ? store[f.key] : f.def,
      overridden: store[f.key] !== undefined,
    }));
  }

  function groupParamRow(groupKey, d) {
    const params = effectiveParams(groupKey, d.key);
    const overrides = params.filter((p) => p.overridden).length;
    const meta = (PARAM_META[groupKey] || {})[d.key];
    const canManage = canManageGroup(groupKey);
    const integ = INTEGRATIONS.find((x) => x.key === d.key);
    const st = integ ? statusMeta(integ.status) : null;
    const flag = st && st.tone !== "green" && st.tone !== "teal" ? '<span class="pill pill--' + st.tone + '"><span class="dot"></span>' + st.label + "</span>" : "";
    return (
      "<tr>" +
      '<td><span class="integration-mini"><span class="integration-card__icon integration-card__icon--slate">' + ic(d.icon) + "</span><span><span class=\"integration-mini__name\"><b>" + SA.h(d.name) + "</b>" + flag + "</span><em>" + SA.h(d.desc) + "</em></span></span></td>" +
      '<td><div class="param-chips">' + params.map((p) => '<span class="param-chip' + (p.overridden ? " is-set" : " is-inherited") + '">' + SA.h(p.label) + " " + SA.h(p.value) + "</span>").join("") + "</div></td>" +
      "<td>" + (overrides ? '<span class="pill pill--blue">已覆盖 ' + overrides + " 项</span>" : '<span class="pill pill--slate">继承平台默认</span>') + "</td>" +
      '<td><span class="sm muted">' + (meta ? SA.h(meta.by) + " · " + SA.h(meta.at) : "—") + "</span></td>" +
      '<td><button class="btn btn--sm" data-action="param-edit" data-group="' + groupKey + '" data-key="' + d.key + '"' +
      (canManage ? (SA.auth.level() === "platform" && groupKey !== SA.auth.account.groupKey ? ' title="平台管理员代为维护，审计会标注"' : "") : ' disabled title="仅可维护本组参数"') +
      ">" + ic("edit") + " 维护</button></td>" +
      "</tr>"
    );
  }

  function groupParamsView(groupKey) {
    const g = groupOf(groupKey);
    const canSwitch = SA.auth.level() === "platform";
    const totalOverrides = GROUP_PARAM_DEFS.reduce((n, d) => n + effectiveParams(groupKey, d.key).filter((p) => p.overridden).length, 0);
    return (
      '<div class="settings-section">' +
      '<div class="section-head"><div><h2>小组参数</h2></div>' +
      '<div class="segmented param-groups">' +
      SA.data.groups.map((x) => '<button class="' + (x.key === groupKey ? "is-active" : "") + '" data-action="param-group" data-group="' + x.key + '"' + (canSwitch || x.key === SA.auth.account.groupKey ? "" : ' disabled title="仅平台管理员可切换小组"') + ">" + SA.h(x.name) + "</button>").join("") +
      "</div></div>" +
      '<div class="callout callout--blue" style="margin-bottom:14px">' + ic("users") + "<span>" +
      (SA.auth.level() === "platform"
        ? "连接与凭据由平台统一维护；小组参数归属各组，由小组管理员自行维护，平台管理员可代为修改。"
        : "连接与凭据由平台统一维护；本组参数由小组管理员自行维护，未覆盖的字段继承平台默认。") +
      "</span></div>" +
      '<div class="card">' +
      '<div class="card-head"><h3>' + SA.h(g.name) + ' · 集成默认值</h3><span class="sm">' + totalOverrides + " 项已覆盖 · 其余继承平台默认</span></div>" +
      '<div class="table-wrap"><table class="table">' +
      "<thead><tr><th>集成</th><th>本组默认值</th><th>来源</th><th>更新</th><th></th></tr></thead><tbody>" +
      GROUP_PARAM_DEFS.map((d) => groupParamRow(groupKey, d)).join("") +
      "</tbody></table></div>" +
      '<div class="table-foot"><span class="sm">参数只影响本组新建对象与默认选择，不回溯历史数据。</span></div>' +
      "</div></div>"
    );
  }

  function integrationsView(sub, groupKey) {
    return integrationSubnav(sub, groupKey) + (sub === "params" ? groupParamsView(groupKey) : connectionView());
  }

  function paramDefsOf(key) {
    return GROUP_PARAM_DEFS.find((d) => d.key === key);
  }

  function openParamDrawer(groupKey, key) {
    const defs = paramDefsOf(key);
    if (!defs) return;
    const g = groupOf(groupKey);
    const canManage = canManageGroup(groupKey);
    const params = effectiveParams(groupKey, key);
    const draft = {};
    params.forEach((p) => (draft[p.key] = p.value));
    const delegated = SA.auth.level() === "platform" && groupKey !== SA.auth.account.groupKey;
    const body =
      (delegated
        ? '<div class="callout callout--amber" style="margin-bottom:14px">' + ic("alert-triangle") + "<span>该组参数由小组管理员主责维护；本次修改会以「代为维护」记入审计。</span></div>"
        : '<div class="callout callout--blue" style="margin-bottom:14px">' + ic("users") + "<span>本组参数由小组管理员自行维护；连接与凭据由平台统一维护。</span></div>") +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">默认值 <span class="pill pill--outline">' + SA.h(g.name) + " · " + SA.h(defs.name) + "</span></div>" +
      '<div class="param-form">' +
      params
        .map(
          (p) =>
            '<div class="field"><span class="field__label">' + SA.h(p.label) + "</span>" +
            (p.type === "select"
              ? '<select class="select" data-param="' + p.key + '">' + p.options.map((o) => "<option" + (o === p.value ? " selected" : "") + ">" + o + "</option>").join("") + "</select>"
              : '<input class="input" data-param="' + p.key + '" value="' + SA.h(p.value) + '" />') +
            '<span class="param-hint">平台默认：' + SA.h(p.def) + (p.overridden ? " · 本组已覆盖" : " · 继承中") + "</span></div>"
        )
        .join("") +
      "</div></div>" +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">生效范围</div>' +
      '<div class="kv">' +
      '<div class="kv-row"><span class="kv-key">影响</span><span class="kv-val">本组新建对象与默认选择</span></div>' +
      '<div class="kv-row"><span class="kv-key">历史数据</span><span class="kv-val">不回溯、不改写</span></div>' +
      "</div></div>";
    const actions = canManage
      ? [
          { label: "恢复平台默认", variant: "ghost", onClick: () => confirmResetParams(groupKey, key) },
          { label: "保存", variant: "primary", onClick: () => saveParams(groupKey, key, draft) },
        ]
      : [{ label: "关闭", variant: "ghost" }];
    SA.drawer({ title: defs.name + " · 小组参数", sub: g.name + " · " + defs.desc, body: body, actions: actions });
    const dr = document.getElementById("detail-drawer");
    dr.querySelectorAll("[data-param]").forEach((el) => {
      const sync = () => (draft[el.dataset.param] = el.value);
      el.addEventListener("input", sync);
      el.addEventListener("change", sync);
      if (!canManage) el.disabled = true;
    });
  }

  function saveParams(groupKey, key, draft) {
    const defs = paramDefsOf(key);
    if (!defs) return;
    GROUP_PARAMS[groupKey] = GROUP_PARAMS[groupKey] || {};
    const store = (GROUP_PARAMS[groupKey][key] = GROUP_PARAMS[groupKey][key] || {});
    let changed = 0;
    const changedLabels = [];
    defs.fields.forEach((f) => {
      const v = draft[f.key] == null ? "" : String(draft[f.key]).trim();
      if (!v || v === f.def) {
        if (store[f.key] !== undefined) {
          delete store[f.key];
          changed++;
          changedLabels.push(f.label);
        }
      } else if (store[f.key] !== v) {
        store[f.key] = v;
        changed++;
        changedLabels.push(f.label);
      }
    });
    PARAM_META[groupKey] = PARAM_META[groupKey] || {};
    PARAM_META[groupKey][key] = { by: SA.auth.account.name, at: "刚刚" };
    const delegatedSave = SA.auth.level() === "platform" && groupKey !== SA.auth.account.groupKey;
    auditPush({
      action: changed ? (delegatedSave ? "代为修改小组集成参数" : "修改小组集成参数") : delegatedSave ? "代为保存小组集成参数" : "保存小组集成参数",
      target: groupOf(groupKey).name + " · " + defs.name + (changedLabels.length ? " · " + changedLabels.join("/") : ""),
      kind: "integrations",
      group: groupKey,
    });
    toast(changed ? "已更新 " + defs.name + " 的小组参数" : "参数未变化");
    refresh();
  }

  function confirmResetParams(groupKey, key) {
    const defs = paramDefsOf(key);
    if (!defs) return;
    SA.confirm({
      title: "恢复平台默认 · " + defs.name,
      desc: "将清除本组对该集成的全部参数覆盖，回到平台默认值。",
      okLabel: "恢复默认",
      onOk: () => {
        if (GROUP_PARAMS[groupKey]) delete GROUP_PARAMS[groupKey][key];
        if (PARAM_META[groupKey]) delete PARAM_META[groupKey][key];
        auditPush({
          action: SA.auth.level() === "platform" && groupKey !== SA.auth.account.groupKey ? "代为恢复平台默认" : "恢复平台默认",
          target: groupOf(groupKey).name + " · " + defs.name,
          kind: "integrations",
          group: groupKey,
        });
        toast("已恢复 " + defs.name + " 的平台默认");
        refresh();
      },
    });
  }

  /* ------------------------------------------------------------
     audit
     ------------------------------------------------------------ */
  function auditTab() {
    const kinds = [["all", "全部"], ["members", "成员"], ["groups", "小组"], ["integrations", "集成"], ["security", "安全"]];
    const rows = visibleAudit().filter((a) => auditKind === "all" || a.kind === auditKind);
    const resultTone = (r) => (r === "成功" ? "green" : r === "待接受" ? "blue" : "amber");
    return (
      '<div class="settings-section">' +
      '<div class="section-head"><div><h2>审计日志</h2></div>' +
      '<div class="row gap-2">' +
      kinds.map(([k, label]) => '<button class="chip' + (auditKind === k ? " is-active" : "") + '" data-action="audit-filter" data-kind="' + k + '">' + label + "</button>").join("") +
      "</div></div>" +
      '<div class="card"><div class="table-wrap"><table class="table">' +
      "<thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>对象</th><th>来源</th><th>结果</th></tr></thead><tbody>" +
      (rows.length
        ? rows
            .map(
              (a, i) =>
                '<tr data-audit-row="' + a.kind + '"' +
                  (i === 0 && fx.audit && (auditKind === "all" || auditKind === a.kind) ? ' class="anim-rise"' : "") +
                  ">" +
                '<td><span class="mono sm">' + SA.h(a.time) + "</span></td>" +
                "<td>" + SA.h(a.actor) + "</td>" +
                "<td>" + SA.h(a.action) + "</td>" +
                "<td>" + SA.h(a.target) + "</td>" +
                '<td><span class="mono sm">' + SA.h(a.source) + "</span></td>" +
                '<td><span class="pill pill--' + resultTone(a.result) + '">' + SA.h(a.result) + "</span></td></tr>"
            )
            .join("")
        : '<tr><td colspan="6"><div class="empty"><div class="empty__title">没有匹配的审计记录</div><div class="empty__desc">换一个类型，或等待新的管理操作。</div></div></td></tr>') +
      "</tbody></table></div>" +
      '<div class="table-foot"><span class="sm">管理操作全部写入审计；成员变更、集成维护与权限调整不可删除。</span><span class="grow"></span><button class="btn btn--sm btn--ghost" data-action="export-audit">' + ic("download") + " 导出</button></div>" +
      "</div></div>"
    );
  }

  /* ------------------------------------------------------------
     integration maintenance
     ------------------------------------------------------------ */
  function openMaintenance(key) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    const st = statusMeta(it.status);
    const canManage = SA.auth.can("admin.integrations.manage");
    if (it.status === "unconfigured") {
      const draft = { endpoint: "", auth: it.conn.auth, secret: "" };
      const body =
        '<div class="callout callout--blue" style="margin-bottom:14px">' + ic("info") + "<span>填写端点与凭据后测试连接；保存成功后状态变为「已连接」。</span></div>" +
        '<div class="drawer-block">' +
        '<div class="drawer-block__head">连接配置</div>' +
        '<div class="param-form">' +
        '<div class="field"><span class="field__label">端点</span><input class="input mono" data-cfg="endpoint" placeholder="https://…" value="' + SA.h(it.conn.endpoint) + '" /></div>' +
        '<div class="field"><span class="field__label">认证方式</span><select class="select" data-cfg="auth">' + ["OAuth 2.0 · 服务账号", "API Token", "应用专用密码"].map((x) => "<option" + (x === it.conn.auth ? " selected" : "") + ">" + x + "</option>").join("") + "</select></div>" +
        '<div class="field"><span class="field__label">凭据</span><input class="input mono" data-cfg="secret" placeholder="粘贴凭据" /></div>' +
        "</div></div>" +
        '<div class="callout callout--blue">' + ic("shield") + "<span>凭据只在服务端保存，不会下发客户端或进入模型上下文。</span></div>";
      const actions = canManage
        ? [
            { label: "取消", variant: "ghost" },
            {
              label: "保存并连接",
              variant: "primary",
              onClick: () => {
                if (draft.endpoint) it.conn.endpoint = draft.endpoint;
                if (draft.auth) it.conn.auth = draft.auth;
                it.status = "connected";
                it.error = "";
                it.meta[2][1] = "刚刚";
                it.cred.rotated = "今天";
                it.cred.expires = "2027-02-10";
                it.health = { success: "—", fails: "0", error: "—", next: "事件驱动" };
                auditPush({ action: "配置连接", target: "集成 · " + it.name, kind: "integrations" });
                fx.integration = it.key;
                toast(it.name + " 已连接");
                refresh();
              },
            },
          ]
        : [{ label: "关闭", variant: "ghost" }];
      SA.drawer({ title: it.name + " · 配置连接", sub: "未配置", body: body, actions: actions });
      const dr = document.getElementById("detail-drawer");
      dr.querySelectorAll("[data-cfg]").forEach((el) => {
        const sync = () => (draft[el.dataset.cfg] = el.value);
        el.addEventListener("input", sync);
        el.addEventListener("change", sync);
        if (!canManage) el.disabled = true;
      });
      return;
    }
    const body =
      (it.status === "attention" ? '<div class="callout callout--amber" style="margin-bottom:12px">' + ic("alert-triangle") + "<span>" + SA.h(it.error) + "</span></div>" : "") +
      (!canManage ? '<div class="callout callout--blue" style="margin-bottom:12px">' + ic("lock") + "<span>集成是平台级资源，小组管理员只读；如需修改请联系平台管理员。</span></div>" : "") +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">连接信息</div>' +
      '<div class="kv">' +
      '<div class="kv-row"><span class="kv-key">端点</span><span class="kv-val mono" style="word-break:break-all">' + SA.h(it.conn.endpoint) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">客户端</span><span class="kv-val">' + SA.h(it.conn.client) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">认证方式</span><span class="kv-val">' + SA.h(it.conn.auth) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">维护人</span><span class="kv-val">' + SA.h(it.conn.owner) + " · 最近 " + SA.h(it.conn.maintained) + "</span></div>" +
      "</div></div>" +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">凭据 <span class="pill pill--outline">' + SA.h(it.cred.type) + "</span></div>" +
      '<div class="kv">' +
      '<div class="kv-row"><span class="kv-key">当前凭据</span><span class="kv-val mono">' + SA.h(it.cred.masked) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">上次轮换</span><span class="kv-val mono">' + SA.h(it.cred.rotated) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">到期</span><span class="kv-val">' + SA.h(it.cred.expires) + "</span></div>" +
      "</div>" +
      (canManage ? '<div class="drawer-actions"><button class="btn btn--sm" data-mact="rotate">' + ic("refresh") + " 轮换凭据</button></div>" : "") +
      "</div>" +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">健康 <span class="pill pill--' + st.tone + '"><span class="dot"></span>' + st.label + "</span></div>" +
      '<div class="kv">' +
      '<div class="kv-row"><span class="kv-key">24h 成功率</span><span class="kv-val mono">' + SA.h(it.health.success) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">连续失败</span><span class="kv-val mono">' + SA.h(it.health.fails) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">最近错误</span><span class="kv-val">' + SA.h(it.health.error) + "</span></div>" +
      '<div class="kv-row"><span class="kv-key">下次轮询</span><span class="kv-val">' + SA.h(it.health.next) + "</span></div>" +
      "</div>" +
      (canManage ? '<div class="drawer-actions"><button class="btn btn--sm" data-mact="test">' + ic("zap") + " 测试连接</button></div>" : "") +
      "</div>" +
      '<div class="drawer-block">' +
      '<div class="drawer-block__head">最近调用</div>' +
      '<div class="call-log">' +
      it.calls
        .map(
          (c) =>
            '<div class="call-log__row"><span class="mono">' + SA.h(c[0]) + '</span><span class="grow">' + SA.h(c[1]) + "</span>" +
            '<span class="pill pill--' + (String(c[2]).charAt(0) === "2" ? "green" : "amber") + '">' + SA.h(c[2]) + "</span>" +
            '<span class="mono">' + SA.h(c[3]) + "</span></div>"
        )
        .join("") +
      "</div></div>";

    const actions = [];
    if (canManage) {
      if (it.status === "attention") actions.push({ label: "重新授权", variant: "primary", onClick: () => reauthorize(it.key) });
      if (it.status === "paused") actions.push({ label: "恢复同步", variant: "primary", onClick: () => setPaused(it.key, false) });
      if (it.status === "connected" || it.status === "syncing") actions.push({ label: "暂停同步", onClick: () => setPaused(it.key, true) });
      actions.push({ label: "断开连接", variant: "danger", onClick: () => disconnectIntegration(it.key) });
    } else {
      actions.push({ label: "关闭", variant: "ghost" });
    }
    SA.drawer({ title: it.name + " · 维护", sub: st.label + " · " + it.conn.client, body: body, actions: actions });

    const dr = document.getElementById("detail-drawer");
    dr.querySelectorAll("[data-mact]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.mact;
        if (act === "test") {
          btn.classList.add("is-loading");
          SA.sequence(() => {
            btn.classList.remove("is-loading");
            it.calls.unshift(["刚刚", "health.check", "200", "0.8s"]);
            it.meta[2][1] = "刚刚 · 0.8s";
            it.health.error = "—";
            it.health.fails = "0";
            auditPush({ action: "测试连接", target: "集成 · " + it.name, kind: "integrations" });
            fx.integration = it.key;
            toast("测试成功 · 200 OK · 0.8s");
            refresh();
          }, 900);
        } else if (act === "rotate") {
          rotateCredential(it.key);
        }
      });
    });
  }

  function quickIntegration(key) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    if (!SA.auth.can("admin.integrations.manage")) {
      openMaintenance(it.key);
      return;
    }
    if (it.status === "connected") {
      it.calls.unshift(["刚刚", "health.check", "200", "0.8s"]);
      it.meta[2][1] = "刚刚 · 0.8s";
      it.health.error = "—";
      it.health.fails = "0";
      auditPush({ action: "测试连接", target: "集成 · " + it.name, kind: "integrations" });
      fx.integration = it.key;
      toast("测试成功 · 200 OK · 0.8s");
      refresh();
    } else if (it.status === "paused") {
      setPaused(it.key, false);
    } else if (it.status === "attention") {
      reauthorize(it.key);
    } else {
      openMaintenance(it.key);
    }
  }

  function setPaused(key, paused) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    it.status = paused ? "paused" : "connected";
    it.meta[2][1] = paused ? "已暂停" : "刚刚";
    auditPush({ action: paused ? "暂停同步" : "恢复同步", target: "集成 · " + it.name, kind: "integrations" });
    fx.integration = it.key;
    toast(paused ? "已暂停 " + it.name + " 的同步" : "已恢复 " + it.name + " 的同步");
    refresh();
  }

  function disconnectIntegration(key) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    SA.confirm({
      title: "断开连接 · " + it.name,
      desc: "断开后事件订阅与同步立即停止，已投递的数据不受影响。",
      body: '<div class="callout callout--amber">' + ic("alert-triangle") + "<span>需要重新配置凭据才能恢复连接。</span></div>",
      okLabel: "断开连接",
      danger: true,
      onOk: () => {
        it.status = "unconfigured";
        it.error = "";
        it.meta[2][1] = "已断开";
        auditPush({ action: "断开连接", target: "集成 · " + it.name, kind: "integrations" });
        fx.integration = it.key;
        toast("已断开 " + it.name);
        refresh();
      },
    });
  }

  function rotateCredential(key) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    SA.confirm({
      title: "轮换凭据 · " + it.name,
      desc: "生成新凭据并吊销旧凭据；进行中的调用会使用新凭据重试。",
      okLabel: "轮换凭据",
      onOk: () => {
        it.cred.rotated = "今天";
        it.cred.expires = "2027-02-10";
        auditPush({ action: "轮换凭据", target: "集成 · " + it.name, kind: "integrations" });
        toast("凭据已轮换");
        refresh();
      },
    });
  }

  function reauthorize(key) {
    const it = INTEGRATIONS.find((x) => x.key === key);
    if (!it) return;
    SA.modal({
      title: "重新授权 · " + it.name,
      desc: "粘贴新的凭据后立即恢复同步；旧凭据会被吊销。",
      body:
        '<div class="field"><span class="field__label">' + SA.h(it.cred.type) + '</span><input class="input mono" id="reauth-token" placeholder="粘贴新的 ' + SA.h(it.cred.type) + '" /></div>' +
        '<div class="callout callout--blue" style="margin-top:12px">' + ic("shield") + "<span>凭据只在服务端保存，不会下发客户端或进入模型上下文。</span></div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "授权并恢复",
          variant: "primary",
          onClick: () => {
            it.status = "connected";
            it.error = "";
            it.cred.rotated = "今天";
            it.cred.expires = "2027-02-10";
            it.meta[2][1] = "刚刚";
            it.health = { success: "—", fails: "0", error: "—", next: "事件驱动" };
            it.calls.unshift(["刚刚", "auth.refresh", "200", "0.6s"]);
            auditPush({ action: "重新授权", target: "集成 · " + it.name, kind: "integrations" });
            fx.integration = it.key;
            toast(it.name + " 已恢复连接");
            refresh();
          },
        },
      ],
    });
  }

  /* ------------------------------------------------------------
     group + member actions
     ------------------------------------------------------------ */
  function memberActionRow(action, label, hint, disabled) {
    return (
      '<button class="member-action" data-mact="' + action + '"' + (disabled ? " disabled" : "") + ">" +
      '<span class="member-action__label">' + label + "</span>" +
      (hint ? '<span class="member-action__hint">' + hint + "</span>" : "") +
      "</button>"
    );
  }

  function openMemberMenu(groupKey, id) {
    const list = membersOf(groupKey);
    const m = list.find((x) => x.id === id);
    if (!m) return;
    if (!canManageGroup(groupKey)) {
      SA.modal({
        title: "成员操作 · " + m.name,
        desc: "只读：你只能维护自己所属小组的成员。",
        body: '<div class="callout callout--blue">' + ic("lock") + "<span>跨组维护需要平台管理员权限，可联系平台管理员处理。</span></div>",
        actions: [{ label: "关闭", variant: "ghost" }],
      });
      return;
    }
    const self = !!m.self;
    const groupAdmins = list.filter((x) => x.admin === "group");
    const lastGroupAdmin = m.admin === "group" && groupAdmins.length <= 1;
    const rows = [];
    rows.push(memberActionRow("role", "调整业务角色", "当前：" + m.role, self));
    if (m.admin === "platform") {
      rows.push(memberActionRow("admin", "取消平台管理员", "平台管理员由平台授予", true));
    } else if (m.admin === "group") {
      rows.push(memberActionRow("admin", "取消小组管理员", lastGroupAdmin ? "最后一名小组管理员不可降级" : "仍保留成员身份", self || lastGroupAdmin));
    } else {
      rows.push(memberActionRow("admin", "设为小组管理员", "可维护本组成员与默认配置", self));
    }
    if (m.status === "invited") rows.push(memberActionRow("resend", "重新发送邀请", "邀请 " + m.invited + " 发出", false));
    else if (m.device === "未绑定") rows.push(memberActionRow("resend", "重新发送绑定链接", "当前未绑定设备", false));
    if (m.device && m.device.indexOf("已绑定") === 0) rows.push(memberActionRow("unbind", "解除设备绑定", m.device, self));
    rows.push(memberActionRow("transfer", "转移到其他小组", self ? "不能转移自己" : lastGroupAdmin ? "最后一名小组管理员不可转移" : "仅平台管理员可执行", self || lastGroupAdmin || !SA.auth.can("admin.members.transfer")));
    rows.push(memberActionRow("remove", "移除成员", "历史需求与任务保留原小组归属", self || lastGroupAdmin));

    SA.modal({
      title: "成员操作 · " + m.name,
      desc: "变更会写入审计日志。",
      body: '<div class="member-actions">' + rows.join("") + "</div>",
      actions: [{ label: "关闭", variant: "ghost" }],
    });
    document.getElementById("modal-body").querySelectorAll("[data-mact]").forEach((btn) => {
      btn.addEventListener("click", () => handleMemberAction(btn.dataset.mact, groupKey, id));
    });
  }

  function handleMemberAction(action, groupKey, id) {
    const list = membersOf(groupKey);
    const m = list.find((x) => x.id === id);
    if (!m) return;
    const g = groupOf(groupKey);
    SA.closeOverlays();

    if (action === "role") {
      SA.modal({
        title: "调整业务角色 · " + m.name,
        desc: "业务角色决定任务类型与门禁职责，不改变管理权限。",
        body: '<div class="field"><span class="field__label">业务角色</span><select class="select" id="member-role-select">' + ROLES.map((r) => '<option' + (r === m.role ? " selected" : "") + ">" + r + "</option>").join("") + "</select></div>",
        actions: [
          { label: "取消", variant: "ghost" },
          {
            label: "保存",
            variant: "primary",
            onClick: () => {
              const sel = document.getElementById("member-role-select");
              if (sel) m.role = sel.value;
              auditPush({ action: "调整业务角色", target: g.name + " · " + m.name + " → " + m.role, kind: "members", group: groupKey });
              toast("已更新 " + m.name + " 的业务角色");
              refresh();
            },
          },
        ],
      });
    } else if (action === "admin") {
      const making = m.admin !== "group";
      SA.confirm({
        title: making ? "设为小组管理员" : "取消小组管理员",
        desc: making ? m.name + " 将可以维护本组成员与默认配置。" : m.name + " 将失去本组管理权限，已提交的内容不受影响。",
        okLabel: making ? "设为管理员" : "取消管理员",
        danger: !making,
        onOk: () => {
          m.admin = making ? "group" : null;
          auditPush({ action: making ? "任命小组管理员" : "取消小组管理员", target: g.name + " · " + m.name, kind: "members", group: groupKey });
          toast(making ? "已设为小组管理员" : "已取消小组管理员");
          refresh();
        },
      });
    } else if (action === "resend") {
      if (m.status === "invited") m.invited = "刚刚";
      auditPush({ action: m.status === "invited" ? "重发邀请" : "重发绑定链接", target: g.name + " · " + m.name, kind: "members", group: groupKey });
      toast("已发送至 " + m.email);
      refresh();
    } else if (action === "unbind") {
      SA.confirm({
        title: "解除设备绑定 · " + m.name,
        desc: "解除后该设备凭证立即失效，成员下次访问需要重新绑定。",
        okLabel: "解除绑定",
        danger: true,
        onOk: () => {
          m.device = "未绑定";
          auditPush({ action: "解除设备绑定", target: g.name + " · " + m.name, kind: "security", group: groupKey });
          toast("已解除 " + m.name + " 的设备绑定");
          refresh();
        },
      });
    } else if (action === "transfer") {
      const admins = list.filter((x) => x.admin === "group");
      if (m.self || (m.admin === "group" && admins.length <= 1) || !SA.auth.can("admin.members.transfer")) return;
      const others = SA.data.groups.filter((x) => x.key !== groupKey);
      if (!others.length) return;
      SA.modal({
        title: "转移到其他小组 · " + m.name,
        desc: "成员只能属于一个小组；历史需求与任务保留原小组归属。",
        body:
          '<div class="field"><span class="field__label">目标小组</span><select class="select" id="member-group-select">' +
          others.map((x) => '<option value="' + x.key + '">' + x.name + " · " + x.key + "</option>").join("") +
          "</select></div>" +
          '<div class="callout callout--amber" style="margin-top:12px">' + ic("alert-triangle") + "<span>转移后该成员立即失去本组数据的访问权限。</span></div>",
        actions: [
          { label: "取消", variant: "ghost" },
          {
            label: "转移",
            variant: "primary",
            onClick: () => {
              const sel = document.getElementById("member-group-select");
              const targetKey = sel ? sel.value : others[0].key;
              const target = groupOf(targetKey);
              const idx = list.findIndex((x) => x.id === id);
              if (idx >= 0) list.splice(idx, 1);
              membersOf(targetKey).push(m);
              g.members = list.length;
              target.members = membersOf(targetKey).length;
              auditPush({ action: "转移小组", target: m.name + " · " + g.name + " → " + target.name, kind: "members", group: groupKey });
              toast(m.name + " 已转移到 " + target.name);
              refresh();
            },
          },
        ],
      });
    } else if (action === "remove") {
      SA.confirm({
        title: "移除成员 · " + m.name,
        desc: "移除后该成员立即失去小组访问权限；历史需求与任务保留原小组归属。",
        okLabel: "移除成员",
        danger: true,
        onOk: () => {
          const idx = list.findIndex((x) => x.id === id);
          if (idx >= 0) list.splice(idx, 1);
          g.members = list.length;
          auditPush({ action: "移除成员", target: g.name + " · " + m.name, kind: "members", group: groupKey });
          toast("已移除 " + m.name);
          refresh();
        },
      });
    }
  }

  function resendInvite(groupKey, id) {
    const m = membersOf(groupKey).find((x) => x.id === id);
    if (!m || !canManageGroup(groupKey)) return;
    m.invited = "刚刚";
    auditPush({ action: "重发邀请", target: groupOf(groupKey).name + " · " + m.name, kind: "members", group: groupKey });
    toast("邀请已重新发送至 " + m.email);
    refresh();
  }

  function revokeInvite(groupKey, id) {
    const list = membersOf(groupKey);
    const m = list.find((x) => x.id === id);
    if (!m || !canManageGroup(groupKey)) return;
    SA.confirm({
      title: "撤销邀请 · " + m.name,
      desc: "撤销后该邮箱需要重新邀请才能加入小组。",
      okLabel: "撤销邀请",
      danger: true,
      onOk: () => {
        const idx = list.findIndex((x) => x.id === id);
        if (idx >= 0) list.splice(idx, 1);
        groupOf(groupKey).members = list.length;
        auditPush({ action: "撤销邀请", target: groupOf(groupKey).name + " · " + m.name, kind: "members", group: groupKey });
        toast("已撤销邀请");
        refresh();
      },
    });
  }

  function openInvite(groupKey) {
    const g = groupOf(groupKey);
    const canChooseGroup = SA.auth.level() === "platform";
    const groupField = canChooseGroup
      ? '<div class="field"><span class="field__label">小组</span><select class="select" id="invite-group">' +
        SA.data.groups.map((x) => '<option value="' + x.key + '"' + (x.key === groupKey ? " selected" : "") + ">" + x.name + " · " + x.key + "</option>").join("") +
        "</select></div>"
      : '<div class="field"><span class="field__label">小组</span><input class="input" value="' + SA.h(g.name) + " · " + g.key + '" readonly /></div>';
    SA.modal({
      title: "邀请成员",
      desc: "邀请会绑定邮箱与小组，成员点击一次性链接后加入。",
      wide: true,
      body:
        '<div class="form-row form-row--2">' +
        '<div class="field"><span class="field__label">姓名</span><input class="input" id="invite-name" placeholder="例如：许澄" /></div>' +
        '<div class="field"><span class="field__label">企业邮箱</span><input class="input" type="email" id="invite-email" placeholder="you@sap.example" /></div>' +
        "</div>" +
        '<div class="form-row form-row--2" style="margin-top:12px">' +
        groupField +
        '<div class="field"><span class="field__label">业务角色</span><select class="select" id="invite-role">' + ROLES.map((r) => "<option>" + r + "</option>").join("") + "</select></div>" +
        "</div>" +
        '<div class="callout callout--blue" style="margin-top:12px">' + ic("mail") + "<span>邀请邮件包含一次性绑定链接，10 分钟内有效。</span></div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "发送邀请",
          variant: "primary",
          onClick: () => {
            const nameEl = document.getElementById("invite-name");
            const emailEl = document.getElementById("invite-email");
            const roleEl = document.getElementById("invite-role");
            const groupEl = document.getElementById("invite-group");
            const name = ((nameEl && nameEl.value) || "新成员").trim();
            const email = ((emailEl && emailEl.value) || "new.member@sap.example").trim();
            const gk = canChooseGroup && groupEl ? groupEl.value : groupKey;
            const list = membersOf(gk);
            list.push({
              id: email.split("@")[0],
              name: name,
              email: email,
              role: roleEl ? roleEl.value : "SAP 业务",
              admin: null,
              device: "未绑定",
              active: "—",
              tone: "slate",
              status: "invited",
              invited: "刚刚",
            });
            groupOf(gk).members = list.length;
            auditPush({ action: "发送邀请", target: name + " → " + groupOf(gk).name, kind: "members", group: gk });
            toast("邀请已发送至 " + email);
            refresh();
          },
        },
      ],
    });
  }

  function openCreateGroup() {
    SA.modal({
      title: "新建小组",
      desc: "小组用于隔离需求、模板与通知默认值；Key 创建后不可修改。",
      wide: true,
      body:
        '<div class="form-row form-row--2">' +
        '<div class="field"><span class="field__label">小组名称</span><input class="input" id="new-group-name" placeholder="例如：财务共享组" /></div>' +
        '<div class="field"><span class="field__label">小组 Key</span><input class="input mono" id="new-group-key" placeholder="FIN-SH" /></div>' +
        "</div>" +
        '<div class="field" style="margin-top:12px"><span class="field__label">默认阶段模板</span><select class="select" id="new-group-template"><option>PDO 六阶段 · v4</option><option>默认三阶段 · v2</option></select></div>' +
        '<div class="callout callout--blue" style="margin-top:12px">' + ic("info") + "<span>创建后可在小组配置里调整名称、模板与管理员；成员跨组转移仍由平台管理员执行。</span></div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "创建小组",
          variant: "primary",
          onClick: () => {
            const nameEl = document.getElementById("new-group-name");
            const keyEl = document.getElementById("new-group-key");
            const tplEl = document.getElementById("new-group-template");
            const name = ((nameEl && nameEl.value) || "新小组").trim();
            let key = ((keyEl && keyEl.value) || "NEW-GRP").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "-");
            if (SA.data.groups.some((x) => x.key === key)) key = key + "-2";
            const group = { key: key, name: name, members: 0, tone: "slate", desc: "新建小组", template: tplEl ? tplEl.value : "PDO 六阶段 · v4", approver: SA.auth.account.name, admins: [] };
            SA.data.groups.push(group);
            membersOf(key);
            auditPush({ action: "创建小组", target: name + " · " + key, kind: "groups", group: key });
            toast("小组已创建");
            SA.go("#/admin?tab=groups&group=" + key);
          },
        },
      ],
    });
  }

  function openManageGroup(key) {
    const g = groupOf(key);
    const list = membersOf(key);
    SA.modal({
      title: "管理小组 · " + g.name,
      desc: "小组决定默认模板、审批人与成员归属。",
      wide: true,
      body:
        '<div class="form-row form-row--2">' +
        '<div class="field"><span class="field__label">小组名称</span><input class="input" id="group-name" value="' + SA.h(g.name) + '" /></div>' +
        '<div class="field"><span class="field__label">小组 Key</span><input class="input mono" value="' + SA.h(g.key) + '" readonly /></div>' +
        "</div>" +
        '<div class="form-row form-row--2" style="margin-top:12px">' +
        '<div class="field"><span class="field__label">默认阶段模板</span><select class="select" id="group-template">' +
        ["PDO 六阶段 · v4", "默认三阶段 · v2"].map((t) => "<option" + (t === g.template ? " selected" : "") + ">" + t + "</option>").join("") +
        "</select></div>" +
        '<div class="field"><span class="field__label">默认审批人</span><select class="select" id="group-approver">' +
        list.map((m) => "<option" + (m.name === g.approver ? " selected" : "") + ">" + m.name + "</option>").join("") +
        "</select></div>" +
        "</div>" +
        '<div class="field" style="margin-top:12px"><span class="field__label">小组管理员</span><div class="owner-picker"><div class="owner-picker__selected">' +
        list.filter((m) => m.admin).map((m) => '<span class="owner-chip"><span class="avatar avatar--sm" data-tone="' + (m.tone || "slate") + '">' + m.name[0] + "</span>" + m.name + '<span class="owner-chip__role">' + (m.admin === "platform" ? "平台" : "小组") + "</span></span>").join("") +
        "</div></div></div>" +
        '<div class="callout callout--blue" style="margin-top:12px">' + ic("info") + "<span>管理员调整在成员行操作里完成；历史需求与任务保留原小组归属。</span></div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "保存",
          variant: "primary",
          onClick: () => {
            const nameEl = document.getElementById("group-name");
            const tplEl = document.getElementById("group-template");
            const apEl = document.getElementById("group-approver");
            if (nameEl) g.name = nameEl.value.trim() || g.name;
            if (tplEl) g.template = tplEl.value;
            if (apEl) g.approver = apEl.value;
            auditPush({ action: "修改小组配置", target: g.name, kind: "groups", group: key });
            toast("小组配置已保存");
            refresh();
          },
        },
      ],
    });
  }

  function openNewWebhook() {
    if (!SA.auth.can("admin.integrations.manage")) {
      toast("仅平台管理员可维护 Webhook", "lock");
      return;
    }
    SA.modal({
      title: "新建 Webhook 订阅",
      desc: "订阅控制平面事件，失败会进入死信并保留 payload。",
      body:
        '<div class="field"><span class="field__label">事件</span><select class="select" id="hook-event"><option>approval.requested</option><option>demand.submitted</option><option>stage.done</option><option>release.submitted</option></select></div>' +
        '<div class="field" style="margin-top:12px"><span class="field__label">目标</span><input class="input mono" id="hook-target" placeholder="例如：teams-notify" /></div>' +
        '<div class="callout callout--blue" style="margin-top:12px">' + ic("link") + "<span>目标需要先在服务端登记；签名头由控制平面生成。</span></div>",
      actions: [
        { label: "取消", variant: "ghost" },
        {
          label: "创建订阅",
          variant: "primary",
          onClick: () => {
            const evEl = document.getElementById("hook-event");
            const tgEl = document.getElementById("hook-target");
            WEBHOOKS.push({ event: evEl ? evEl.value : "approval.requested", target: (tgEl && tgEl.value) || "new-target", status: "启用", tone: "green", last: "—" });
            auditPush({ action: "新建 Webhook 订阅", target: (tgEl && tgEl.value) || "new-target", kind: "integrations" });
            toast("订阅已创建");
            refresh();
          },
        },
      ],
    });
  }

  function rotateServiceAccount() {
    if (!SA.auth.can("admin.integrations.manage")) {
      toast("仅平台管理员可轮换服务账号凭据", "lock");
      return;
    }
    SA.confirm({
      title: "轮换服务账号凭据",
      desc: "新凭据写入 Secret Manager，旧凭据在 5 分钟后吊销；控制平面会自动重载。",
      okLabel: "轮换凭据",
      onOk: () => {
        auditPush({ action: "轮换服务账号凭据", target: "SV_SA_AGENT", kind: "security" });
        toast("服务账号凭据已轮换");
        refresh();
      },
    });
  }

  function adminGoto(el) {
    let hash = "#/admin?tab=" + (el.dataset.tab || "groups");
    if (el.dataset.maintain) hash += "&maintain=" + el.dataset.maintain;
    if (el.dataset.group) hash += "&group=" + el.dataset.group;
    SA.go(hash);
  }

  /* ------------------------------------------------------------
     register
     ------------------------------------------------------------ */
  SA.register("admin", {
    title: "管理控制台",
    render(ctx) {
      if (!SA.auth.can("admin.access")) return deniedPage();
      const tabParam = ctx.query.get("tab");
      const tab = ["groups", "integrations", "audit"].indexOf(tabParam) >= 0 ? tabParam : "groups";
      const sub = ctx.query.get("sub") === "params" ? "params" : "connection";
      const groupParam = ctx.query.get("group");
      let selectedKey = SA.data.groups.some((g) => g.key === groupParam) ? groupParam : SA.auth.account.groupKey;
      if (SA.auth.level() === "group" && selectedKey !== SA.auth.account.groupKey) selectedKey = SA.auth.account.groupKey;
      return (
        '<div class="page page-admin">' +
        '<div class="page-head">' +
        '<div class="page-head__main">' +
        '<div class="eyebrow">MANAGE · 管理</div>' +
        '<div class="page-head__title"><h1>管理控制台</h1><span class="pill pill--violet">' + ic("shield") + " " + adminLevelLabel() + "</span></div>" +
        '<p class="page-head__desc">管理范围由平台授予。</p>' +
        "</div></div>" +
        (tab === "groups" ? attentionStrip() : "") +
        '<div class="settings-tabs">' +
        TABS.map((t) => '<a class="settings-tab' + (tab === t.key ? " is-active" : "") + '" href="#/admin?tab=' + t.key + '">' + ic(t.icon) + t.label + "</a>").join("") +
        "</div>" +
        '<div id="admin-content">' +
        (tab === "groups" ? groupsTab(selectedKey) : tab === "integrations" ? integrationsView(sub, selectedKey) : auditTab()) +
        "</div></div>"
      );
    },
    after(ctx, root) {
      if (!SA.auth.can("admin.access")) return;
      const page = root.querySelector(".page-admin");
      if (!page) return;

      page.addEventListener("click", (e) => {
        const el = e.target.closest("[data-action]");
        if (!el) return;
        const action = el.dataset.action;
        if (action === "select-group") {
          if (SA.auth.level() === "group" && el.dataset.group !== SA.auth.account.groupKey) {
            toast("小组管理员只能维护本组", "lock");
            return;
          }
          adminGoto({ dataset: { tab: "groups", group: el.dataset.group } });
        }
        else if (action === "manage-group") openManageGroup(el.dataset.group);
        else if (action === "create-group") openCreateGroup();
        else if (action === "invite-member") openInvite(el.dataset.group || SA.auth.account.groupKey);
        else if (action === "member-menu") openMemberMenu(el.dataset.group, el.dataset.member);
        else if (action === "member-resend") resendInvite(el.dataset.group, el.dataset.member);
        else if (action === "member-revoke") revokeInvite(el.dataset.group, el.dataset.member);
        else if (action === "integration-quick") quickIntegration(el.dataset.key);
        else if (action === "integration-maintain") openMaintenance(el.dataset.key);
        else if (action === "integration-sub")
          SA.go(el.dataset.sub === "params" ? "#/admin?tab=integrations&sub=params&group=" + (el.dataset.group || SA.auth.account.groupKey) : "#/admin?tab=integrations");
        else if (action === "param-group") SA.go("#/admin?tab=integrations&sub=params&group=" + el.dataset.group);
        else if (action === "param-edit") openParamDrawer(el.dataset.group, el.dataset.key);
        else if (action === "new-webhook") openNewWebhook();
        else if (action === "rotate-service") rotateServiceAccount();
        else if (action === "admin-goto") adminGoto(el);
        else if (action === "export-audit") toast("演示：已导出审计日志 CSV", "download");
        else if (action === "audit-filter") {
          auditKind = el.dataset.kind;
          page.querySelectorAll("[data-action='audit-filter']").forEach((x) => x.classList.toggle("is-active", x === el));
          page.querySelectorAll("[data-audit-row]").forEach((row) => {
            row.hidden = auditKind !== "all" && row.dataset.auditRow !== auditKind;
          });
        }
      });

      const maintain = ctx.query.get("maintain");
      if (maintain) {
        openMaintenance(maintain);
        const clean = location.hash.replace(/([?&])maintain=[^&]*/, "$1").replace(/[?&]$/, "");
        history.replaceState(null, "", clean);
      }
      const edit = ctx.query.get("edit");
      if (edit) {
        openParamDrawer(ctx.query.get("group") || SA.auth.account.groupKey, edit);
        const clean = location.hash.replace(/([?&])edit=[^&]*/, "$1").replace(/[?&]$/, "");
        history.replaceState(null, "", clean);
      }
      // 回放标记只生效一次：集成卡本次渲染已消费；审计行留到审计 tab 首次渲染时消费
      fx.integration = null;
      if (ctx.query.get("tab") === "audit") fx.audit = null;
    },
  });
})();
