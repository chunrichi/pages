/* ============================================================
   VSCode extension prototype · view switching & static content
   ============================================================ */
(function () {
  "use strict";
  const ic = window.ic;

  const ICON = {
    sparkles: "sparkles",
    file: "file-text",
    doc: "file-text",
    task: "inbox",
    agent: "bot",
    skill: "brain",
    branch: "git-branch",
    check: "check-circle",
    clock: "clock",
    monitor: "monitor",
    plug: "plug",
  };

  const avatar = (name, tone) =>
    '<span class="avatar avatar--sm" data-tone="' + (tone || "slate") + '">' + name[0] + "</span>";

  function treeItem(opts) {
    return `
      <div class="vs-tree-item ${opts.active ? "is-active" : ""}" ${opts.toast ? 'data-toast="' + opts.toast + '"' : ""}>
        ${opts.badge ? '<span class="vs-tree-item__badge vs-tree-item__badge--' + opts.badge + '"></span>' : '<span class="vs-tree-item__icon">' + ic(opts.icon || "file") + "</span>"}
        <span class="vs-tree-item__main">
          <span class="vs-tree-item__title">${opts.title}</span>
          ${opts.meta ? '<span class="vs-tree-item__meta">' + opts.meta + "</span>" : ""}
        </span>
      </div>`;
  }

  function group(title, count, items, open) {
    return `
      <div class="vs-tree-group">
        <div class="vs-tree-group__head ${open === false ? "" : "is-open"}">${ic("chevron-right")}${title}${count != null ? '<span class="vs-tree-group__count">' + count + "</span>" : ""}</div>
        <div class="vs-tree-group__body">${items}</div>
      </div>`;
  }

  function connectionCard() {
    return `
      <div class="vs-connection">
        <div class="vs-connection__row"><span class="vs-connection__dot"></span><b>控制平面已连接</b><span style="margin-left:auto;font-family:var(--mono);font-size:8px;color:#8d928a">online</span></div>
        <div class="vs-connection__row">周予@laptop-fink · z-sales</div>
        <div class="vs-connection__meta"><span>心跳 20s</span><span>租约 60s</span><span>并发 1/2</span></div>
      </div>`;
  }

  function taskSidebar(selected) {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">SAP Super Agent</span>
        <span class="vs-panel-head__actions">
          <button class="vs-icon-btn" data-toast="已刷新任务箱">${ic("refresh")}</button>
          <button class="vs-icon-btn" data-toast="更多操作">${ic("more-horizontal")}</button>
        </span>
      </div>
      <div class="vs-side-scroll">
        ${connectionCard()}
        ${group(
          "可领取",
          2,
          treeItem({ title: "上线文档补充回滚步骤", meta: "T-8850 · R-2045 · z-fin", icon: "file", badge: "blue" }) +
            treeItem({ title: "功能设计评审 · 预算校验", meta: "T-8852 · R-2041 · 需 consultant", icon: "git-commit", badge: "blue" })
        )}
        ${group(
          "我的任务",
          1,
          treeItem({ title: "实现开票清单导出服务", meta: "T-8841 · R-2042 · 租约 42s", icon: "monitor", badge: "teal", active: selected === "T-8841" })
        )}
        ${group(
          "等待我回答",
          1,
          treeItem({ title: "通过 G1 · R-2041 功能设计", meta: "审批 · 需求顾问 · 今天 09:18", icon: "git-commit", badge: "amber" }) +
            '<div class="vs-tree-empty">新门禁会实时出现在这里。</div>'
        )}
        ${group(
          "已绑定工作区",
          null,
          treeItem({ title: "z-sales", meta: "feature/R-2041 · main", icon: "folder" }) + treeItem({ title: "z-fin", meta: "main", icon: "folder" })
        )}
      </div>
      <div class="vs-side-foot"><span class="pill pill--green">在线</span><span>2 个待办</span><span class="grow"></span><span class="mono">v1.0.0</span></div>`;
  }

  function docsSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">过程文档</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="已从服务端拉取最新版本">${ic("refresh")}</button></span>
      </div>
      <div class="vs-side-scroll">
        <div class="vs-tree-group">
          <div class="vs-tree-group__head is-open">${ic("chevron-right")}R-2041 · 采购预算校验</div>
          ${treeItem({ title: "需求分析 v3", meta: "已同步 · AI + 林桦", icon: "file", badge: "teal" })}
          ${treeItem({ title: "功能设计 v2", meta: "本地有修改 · 待推送", icon: "file", badge: "amber", active: true })}
          ${treeItem({ title: "技术设计 v1 草稿", meta: "服务端有更新 · 待拉取", icon: "file", badge: "blue" })}
          ${treeItem({ title: "测试用例 v1", meta: "未生成", icon: "file" })}
        </div>
        <div class="vs-tree-group">
          <div class="vs-tree-group__head is-open">${ic("chevron-right")}本地文件</div>
          ${treeItem({ title: "context.md", meta: ".sap-superagent/task/T-8841", icon: "file" })}
          ${treeItem({ title: "functional-design.md", meta: "本地快照 · 12 KB", icon: "file" })}
        </div>
        <div class="vs-tree-group">
          <div class="vs-tree-group__head is-open">${ic("chevron-right")}批注</div>
          ${treeItem({ title: "3 条未解决", meta: "来自 林桦 / 周予 / 陈曦", icon: "message", badge: "amber" })}
        </div>
      </div>
      <div class="vs-side-foot"><span class="pill pill--amber">1 项待推送</span><span class="grow"></span><span class="mono">同步 12s 前</span></div>`;
  }

  function agentsSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">Agents &amp; Skills</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="已同步全部 Agents 与 Skills">${ic("sync")}</button></span>
      </div>
      <div class="vs-side-scroll">
        ${group("Agents", 4, treeItem({ title: "sap-developer", meta: "v3 · 服务端 · 已启用", icon: "bot", badge: "teal", active: true }) + treeItem({ title: "doc-reviewer", meta: "v2 · 服务端 · 已启用", icon: "bot", badge: "teal" }) + treeItem({ title: "fin-dev", meta: "v1 · 本地草稿 · 未同步", icon: "bot", badge: "amber" }) + treeItem({ title: "test-runner", meta: "v1 · 服务端 · 已停用", icon: "bot" }))}
        ${group("Skills", 5, treeItem({ title: "sap-dev", meta: "v4 · 服务端", icon: "brain", badge: "teal" }) + treeItem({ title: "abap-cli-edit", meta: "v2 · .agents/skills", icon: "brain" }) + treeItem({ title: "abap-cli-read", meta: "v2 · .agents/skills", icon: "brain" }) + treeItem({ title: "doc-review", meta: "v1 · 服务端", icon: "brain" }) + treeItem({ title: "plannotator-review", meta: "v2 · 服务端", icon: "brain" }))}
        ${group("同步来源", null, treeItem({ title: "服务端 Agent 市场", meta: "上次同步 今天 08:40", icon: "cloud" }) + treeItem({ title: "仓库 .github/agents", meta: "工作区自动发现", icon: "folder" }))}
      </div>
      <div class="vs-side-foot"><span class="pill pill--teal">已同步</span><span class="grow"></span><span class="mono">08:40</span></div>`;
  }

  function charmSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">ChaRM 变更</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="已同步 SolMan 状态">${ic("rotate-cw")}</button></span>
      </div>
      <div class="vs-side-scroll">
        <div class="vs-connection">
          <div class="vs-connection__row"><span class="vs-connection__dot" style="background:var(--violet);box-shadow:0 0 0 3px var(--violet-tint)"></span><b>本机 SSO 可用</b></div>
          <div class="vs-connection__row">SAP Secure Login Client · FY2/200</div>
          <div class="vs-connection__meta"><span>Windows 会话</span><span>不写入服务端</span></div>
        </div>
        ${group("Change Documents", 2, treeItem({ title: "CD-88213 · 月结重跑", meta: "待 Basis 审批 · 2 CR", icon: "git-branch", badge: "amber", active: true }) + treeItem({ title: "CD-88214 · 预算校验", meta: "已创建 · 3 CR", icon: "git-branch", badge: "teal" }))}
        ${group("Change Requests", 2, treeItem({ title: "CR-44102", meta: "Basis 已通过 · 08:56", icon: "check-circle" }) + treeItem({ title: "CR-44103", meta: "等待 Basis · 已 2h", icon: "clock", badge: "amber" }))}
        ${group("关联单据", null, treeItem({ title: "CRQ-2026-0842", meta: "待审批 · SolMan", icon: "file-text" }) + treeItem({ title: "R-2045 · 月结重跑", meta: "需求 · 上线阶段", icon: "layers" }))}
      </div>
      <div class="vs-side-foot"><span class="pill pill--amber">1 个等待</span><span class="grow"></span><span class="mono">轮询 60s</span></div>`;
  }

  function chatSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">Copilot 上下文</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="已重新生成上下文包">${ic("refresh")}</button></span>
      </div>
      <div class="vs-side-scroll">
        ${group("当前任务", 1, treeItem({ title: "T-8841 · 实现开票导出", meta: "R-2042 · 技术开发", icon: "inbox", badge: "teal", active: true }))}
        ${group("上下文文件", 3, treeItem({ title: "context.md", meta: "4.2 KB · #file 可引用", icon: "file", badge: "teal" }) + treeItem({ title: "functional-design.md", meta: "12 KB · v2", icon: "file" }) + treeItem({ title: "tech-design.md", meta: "18 KB · v1", icon: "file" }))}
        ${group("Extension Tools", 6, treeItem({ title: "sap_task_context", meta: "读任务上下文", icon: "tool" }) + treeItem({ title: "sap_report_progress", meta: "上报进度", icon: "tool" }) + treeItem({ title: "sap_submit_artifact", meta: "提交工件 · 需确认", icon: "tool" }) + treeItem({ title: "sap_abap_check", meta: "本机 abap-cli", icon: "tool" }) + treeItem({ title: "sap_search_demand", meta: "查询需求", icon: "tool" }))}
        ${group("工作区", null, treeItem({ title: "z-sales", meta: "branch feature/R-2042", icon: "folder" }))}
      </div>
      <div class="vs-side-foot"><span class="pill pill--green">Copilot 可用</span><span class="grow"></span><span class="mono">#context.md</span></div>`;
  }

  function syncSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">同步状态</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="已全量同步">${ic("sync")}</button></span>
      </div>
      <div class="vs-side-scroll">
        ${group("待处理", 3, treeItem({ title: "功能设计 v2", meta: "本地修改 · 待推送", icon: "upload", badge: "amber", active: true }) + treeItem({ title: "技术设计 v1", meta: "服务端更新 · 待拉取", icon: "download", badge: "blue" }) + treeItem({ title: "上线文档 v1", meta: "冲突 · 2 处差异", icon: "alert-triangle", badge: "amber" }))}
        ${group("已同步", 4, treeItem({ title: "需求分析 v3", meta: "10:42 · sha 9f2c", icon: "check-circle", badge: "teal" }) + treeItem({ title: "context.md", meta: "10:41 · 4.2 KB", icon: "check-circle" }) + treeItem({ title: "测试证据.png", meta: "10:38 · 640 KB", icon: "check-circle" }) + treeItem({ title: "batch-report.pdf", meta: "10:35 · 1.1 MB", icon: "check-circle" }))}
        ${group("同步来源", null, treeItem({ title: "控制平面 artifacts", meta: "每 20s 轮询", icon: "cloud" }) + treeItem({ title: "本地 .sap-superagent/", meta: "task/T-8841", icon: "folder" }))}
      </div>
      <div class="vs-side-foot"><span class="pill pill--red">1 冲突</span><span class="grow"></span><span class="mono">30s 前</span></div>`;
  }

  function statesSidebar() {
    return `
      <div class="vs-panel-head">
        <span class="vs-panel-head__title">连接与状态</span>
        <span class="vs-panel-head__actions"><button class="vs-icon-btn" data-toast="重置连接">${ic("refresh")}</button></span>
      </div>
      <div class="vs-side-scroll">
        <div class="vs-connection">
          <div class="vs-connection__row"><span class="vs-connection__dot"></span><b>已连接 · accepting</b></div>
          <div class="vs-connection__row">周予@laptop-fink · z-sales</div>
          <div class="vs-connection__meta"><span>online</span><span>load 1/2</span><span>lease 60s</span></div>
        </div>
        ${group("状态预设", 4, treeItem({ title: "在线 / 接受派单", meta: "默认状态", icon: "wifi", badge: "teal", active: true }) + treeItem({ title: "在线 / 暂停接单", meta: "点击状态栏切换", icon: "pause-circle" }) + treeItem({ title: "离线 / 断线重连", meta: "指数退避 1s → 60s", icon: "alert-triangle" }) + treeItem({ title: "工作区未匹配", meta: "任务不可领取", icon: "folder" }))}
        ${group("命令", 6, treeItem({ title: "连接控制平面", meta: "SAP Super Agent: Connect", icon: "plug" }) + treeItem({ title: "绑定当前工作区", meta: "Bind Workspace", icon: "folder" }) + treeItem({ title: "领取任务", meta: "Claim Task", icon: "inbox" }) + treeItem({ title: "打开任务", meta: "Open Task · worktree", icon: "external" }) + treeItem({ title: "提交工件", meta: "Submit Artifact", icon: "upload" }) + treeItem({ title: "暂停接单", meta: "Pause Dispatch", icon: "pause" }))}
      </div>
      <div class="vs-side-foot"><span class="pill pill--green">在线</span><span>2 个待办</span><span class="grow"></span><span class="mono">⌘⇧P</span></div>`;
  }

  /* ------------------------------------------------------------
     editor contents
     ------------------------------------------------------------ */
  function planEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">SUPER AGENT · TASK INBOX</div>
          <h1>任务箱</h1>
          <div class="vsw-head__desc">下午好，周予。2 个任务可领取，1 个门禁等待你回答。任务领取后会生成上下文包，并在 Copilot Chat 中可用。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已刷新任务箱">${ic("refresh")} 刷新</button><button class="btn btn--sm btn--primary" data-toast="已暂停接单">${ic("pause")} 暂停接单</button></div>
      </div>
      <div class="vsw-stats">
        <div class="vsw-stat"><span>可领取</span><b>2</b><em>按角色过滤</em></div>
        <div class="vsw-stat"><span>我的任务</span><b>1</b><em>租约 42s</em></div>
        <div class="vsw-stat"><span>等待我回答</span><b>1</b><em>G1 门禁</em></div>
        <div class="vsw-stat"><span>今日完成</span><b>3</b><em>平均 34m</em></div>
      </div>
      <div class="vsw-grid">
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>我的任务</h3><span class="pill pill--teal pill--live"><span class="dot"></span>进行中</span></div>
            <div class="card-body">
              <div class="vsw-task-card">
                <div class="vsw-task-card__head"><span class="vsw-task-card__id">T-8841</span><span class="tag tag--mono">z-sales</span><span class="grow"></span><span class="pill pill--teal">ABAP</span></div>
                <div class="vsw-task-card__title">实现开票清单导出服务</div>
                <div class="vsw-task-card__meta">${ic("layers")} R-2042 · 技术开发 · 租约剩余 42s</div>
                <div class="progress progress--thin" style="margin-top:8px"><span class="progress__bar progress__bar--teal" data-bar="64"></span></div>
                <div class="vsw-task-card__foot"><span class="xs mono" style="color:var(--teal-strong)">context.md 已写入</span><span class="grow"></span><button class="btn btn--sm btn--primary" data-toast="已在 VSCode 打开需求详情">${ic("external")} 打开任务</button><button class="btn btn--sm" data-toast="工件已提交，等待门禁">${ic("upload")} 提交工件</button></div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>可领取</h3><span class="sm">2 个匹配工作区</span></div>
            <div class="vsw-list">
              <div class="vsw-row">
                <span class="vsw-row__main"><span class="vsw-row__title">上线文档补充回滚步骤</span><span class="vsw-row__sub">T-8850 · R-2045 · z-fin · 未绑定工作区</span></span>
                <span class="pill pill--slate">文档</span>
                <button class="btn btn--sm" data-toast="已领取 T-8850，生成上下文包">${ic("inbox")} 领取</button>
              </div>
              <div class="vsw-row">
                <span class="vsw-row__main"><span class="vsw-row__title">功能设计评审：预算校验流程</span><span class="vsw-row__sub">T-8852 · R-2041 · z-fin · 需要 consultant 角色</span></span>
                <span class="pill pill--slate">评审</span>
                <button class="btn btn--sm" data-toast="已领取 T-8852">${ic("inbox")} 领取</button>
              </div>
            </div>
            <div class="card-foot" style="padding:8px 14px"><span class="xs">未绑定的任务会进入通用任务箱，按角色可见。</span></div>
          </div>
          <div class="card">
            <div class="card-head"><h3>等待我回答</h3><span class="pill pill--amber">1</span></div>
            <div class="card-body" style="padding:10px 14px">
              <div class="vsw-row" style="padding:4px 0;border:0;align-items:flex-start">
                ${avatar("林", "teal")}
                <span class="vsw-row__main"><span class="vsw-row__title">通过 G1 · R-2041 功能设计 v2</span><span class="vsw-row__sub">3 项检查 · 1 个未决问题 · 09:18 提交</span></span>
                <button class="btn btn--sm btn--primary" data-toast="已通过 G1 门禁">去处理</button>
              </div>
            </div>
          </div>
        </div>
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>执行器</h3><span class="pill pill--green">在线</span></div>
            <div class="card-body" style="padding:10px 14px">
              <div class="vsw-source">${ic("monitor")} laptop-fink · 周予</div>
              <div class="vsw-source">${ic("folder")} z-sales · feature/R-2041</div>
              <div class="vsw-source">${ic("clock")} 心跳 20s · 租约 60s · 并发 1/2</div>
              <div class="vsw-source">${ic("brain")} Copilot Chat 可用 · sap-dev skill v4</div>
              <div class="callout callout--blue" style="margin-top:8px;padding:8px 9px;font-size:9px">${ic("info")}<span>任务只在工作区匹配且在线时才会派发；离线不派单。</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>快捷命令</h3><span class="sm mono">⌘⇧P</span></div>
            <div class="vsw-list">
              <div class="vsw-row" data-toast="打开命令面板"><span class="vsw-row__main"><span class="vsw-row__title">连接控制平面</span><span class="vsw-row__sub">SAP Super Agent: Connect</span></span><span class="mono xs">${ic("chevron-right")}</span></div>
              <div class="vsw-row" data-toast="已绑定当前工作区"><span class="vsw-row__main"><span class="vsw-row__title">绑定当前工作区</span><span class="vsw-row__sub">Bind Workspace</span></span><span class="mono xs">${ic("chevron-right")}</span></div>
              <div class="vsw-row" data-toast="已打开任务上下文"><span class="vsw-row__main"><span class="vsw-row__title">打开任务</span><span class="vsw-row__sub">Open Task · worktree</span></span><span class="mono xs">${ic("chevron-right")}</span></div>
              <div class="vsw-row" data-toast="已生成上下文包"><span class="vsw-row__main"><span class="vsw-row__title">生成上下文包</span><span class="vsw-row__sub">context.md</span></span><span class="mono xs">${ic("chevron-right")}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div></div>`;
  }

  function taskEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">R-2041 · PDO 六阶段 · v4</div>
          <h1>采购申请审批流增加部门预算校验</h1>
          <div class="vsw-head__desc">需求从 SAP 同步，过程文档由 Super Agent 生成并在此同步。任务上下文已写入本地。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已打开浏览器中的需求详情">${ic("external")} 浏览器</button><button class="btn btn--sm btn--primary" data-toast="已生成 worktree 并打开任务">${ic("inbox")} 打开任务</button></div>
      </div>
      <div class="vsw-toolbar">
        <span class="pill pill--amber"><span class="dot"></span>待确认</span>
        <span class="pill pill--outline">高优先级</span>
        <span class="tag tag--mono">SAP-1187</span>
        <span class="sm mono">负责人 林桦、陈曦</span>
        <span class="grow"></span>
        <span class="xs mono" style="color:var(--ink-4)">同步于 12 分钟前</span>
      </div>
      <div class="vsw-stages">
        ${["需求澄清", "功能设计", "技术设计", "技术开发", "测试", "上线"].map((s, i) => `<span class="vsw-stage ${i < 1 ? "is-done" : i === 1 ? "is-current" : ""}"><i>${i < 1 ? ic("check") : i + 1}</i>${s}</span>`).join("")}
      </div>
      <div class="vsw-grid">
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>${ic("sparkles")} AI 摘要</h3><span class="pill pill--teal">已确认</span></div>
            <div class="card-body" style="font-size:10.5px;line-height:1.7">采购申请在保存时按「申请部门 + 费用类科目」校验预算余额；超预算申请允许提交但进入现有审批链，审批人不变。预算数据缺失时只记录警告，不阻断提交。</div>
          </div>
          <div class="card">
            <div class="card-head"><h3>过程文档</h3><span class="sm">3 份 · 1 份待确认</span></div>
            <div class="vsw-list">
              <div class="vsw-row" data-toast="已打开需求分析 v3"><span class="vsw-row__icon" style="color:var(--green)">${ic("check-circle")}</span><span class="vsw-row__main"><span class="vsw-row__title">需求分析 v3</span><span class="vsw-row__sub">G1 已通过 · 11-06 15:20 · 已同步本地</span></span><span class="pill pill--green">已同步</span></div>
              <div class="vsw-row" data-toast="已打开功能设计 v2"><span class="vsw-row__icon" style="color:var(--amber)">${ic("file-text")}</span><span class="vsw-row__main"><span class="vsw-row__title">功能设计 v2</span><span class="vsw-row__sub">本地有修改 · 等待你确认 · 09:18</span></span><span class="pill pill--amber">待确认</span></div>
              <div class="vsw-row"><span class="vsw-row__icon" style="color:var(--teal)">${ic("sparkles")}</span><span class="vsw-row__main"><span class="vsw-row__title">技术设计 v1 草稿</span><span class="vsw-row__sub">Super Agent 生成中 · 64%</span></span><span class="pill pill--teal pill--live">生成中</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>验收标准</h3><span class="sm mono">覆盖 4/4</span></div>
            <div class="card-body" style="padding:8px 14px">
              ${["提交时展示部门预算余额与占用额度", "超预算时阻止直接生成采购订单", "校验结果写入审批日志，可按申请号追溯", "预算数据缺失时记录警告"].map((t, i) => `<div class="vsw-doc-link"><span class="mono" style="color:var(--ink-4)">0${i + 1}</span><span class="grow">${t}</span><span class="pill pill--green">已覆盖</span></div>`).join("")}
            </div>
          </div>
        </div>
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>上下文包</h3><span class="pill pill--green">已生成</span></div>
            <div class="card-body" style="padding:10px 14px">
              <div class="vsw-source mono">${ic("file")} .sap-superagent/task/T-8841/context.md</div>
              <div class="vsw-source">需求 + 3 份上游工件 + 验收标准</div>
              <div class="vsw-source">Copilot 中用 <code style="font-size:8px">#context.md</code> 引用</div>
              <div style="display:flex;gap:5px;margin-top:8px"><button class="btn btn--sm" data-toast="已复制路径">${ic("copy")} 复制路径</button><button class="btn btn--sm" data-toast="已在编辑器中打开">${ic("external")} 打开</button></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>任务与租约</h3></div>
            <div class="card-body" style="padding:10px 14px">
              <div class="vsw-source">${ic("inbox")} T-8841 · 技术开发</div>
              <div class="vsw-source">${ic("monitor")} z-sales · feature/R-2041</div>
              <div class="vsw-source">${ic("clock")} 租约剩余 42s · 每 20s 续约</div>
              <div class="vsw-source">${ic("user")} 领取人 周予</div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>快速操作</h3></div>
            <div class="vsw-list">
              <div class="vsw-row" data-toast="已提交工件，等待门禁确认"><span class="vsw-row__main"><span class="vsw-row__title">提交工件</span><span class="vsw-row__sub">code_change · 需人工确认</span></span></div>
              <div class="vsw-row" data-toast="已上报进度 64%"><span class="vsw-row__main"><span class="vsw-row__title">上报进度</span><span class="vsw-row__sub">写入任务事件</span></span></div>
              <div class="vsw-row" data-toast="已释放任务，回池"><span class="vsw-row__main"><span class="vsw-row__title">释放任务</span><span class="vsw-row__sub">回池并通知派发人</span></span></div>
            </div>
          </div>
        </div>
      </div>
    </div></div>`;
  }

  function docsEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">DOC SYNC · 过程文档</div>
          <h1>文档同步</h1>
          <div class="vsw-head__desc">本地修改与服务端版本均可追溯。推送前会生成新版本，不覆盖历史。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已拉取 2 个更新">${ic("download")} 全部拉取</button><button class="btn btn--sm btn--primary" data-toast="已推送 1 个工件">${ic("upload")} 推送本地修改</button></div>
      </div>
      <div class="vsw-toolbar">
        <span class="sync-chip sync-chip--ok">${ic("check")} 4 已同步</span>
        <span class="sync-chip sync-chip--push">${ic("arrow-up")} 1 待推送</span>
        <span class="sync-chip sync-chip--pull">${ic("arrow-down")} 1 待拉取</span>
        <span class="sync-chip sync-chip--conflict">${ic("alert-triangle")} 1 冲突</span>
        <span class="grow"></span>
        <span class="xs mono" style="color:var(--ink-4)">最近同步 12s 前</span>
      </div>
      <div class="card">
        <div class="card-head"><h3>R-2041 · 文档</h3><span class="sm">6 份过程文档 · 2 份有本地副本</span></div>
        <div class="vsw-list">
          ${[
            ["需求分析 v3", "AI 生成 · 林桦确认 · 11-06", "已同步", "ok", "check"],
            ["功能设计 v2", "AI 生成 · 本地有 2 处修改", "待推送", "push", "file-text"],
            ["技术设计 v1", "服务端 v1 更新于 10:42", "待拉取", "pull", "file-text"],
            ["测试用例 v1", "尚未生成", "未生成", "", "file-text"],
            ["上线文档 v1", "服务端版本与本地均被修改", "冲突", "conflict", "alert-triangle"],
          ]
            .map(
              ([t, meta, chip, tone, icon]) => `
            <div class="vsw-row">
              <span class="vsw-row__icon" style="color:var(--${tone === "conflict" ? "red" : tone === "push" ? "amber" : tone === "pull" ? "blue" : "green"})">${ic(icon)}</span>
              <span class="vsw-row__main"><span class="vsw-row__title">${t}</span><span class="vsw-row__sub">${meta}</span></span>
              ${tone ? `<span class="sync-chip sync-chip--${tone}">${chip}</span>` : '<span class="pill pill--outline">' + chip + "</span>"}
              <button class="btn btn--sm" data-toast="${tone === "conflict" ? "打开冲突解决视图" : tone === "push" ? "已在编辑器中打开 diff" : "已应用最新版本"}">${tone === "conflict" ? "解决冲突" : tone === "push" ? "查看差异" : "打开"}</button>
            </div>`
            )
            .join("")}
        </div>
        <div class="card-foot" style="padding:8px 14px"><span class="xs">本地文件位于 <span class="mono">.sap-superagent/task/T-8841/</span>，该目录不进入版本控制。</span></div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-head"><h3>同步日志</h3><span class="sm mono">event log</span></div>
        <div class="card-body" style="padding:9px 14px">
          <div class="vsw-source mono" style="font-size:8.5px">10:42:18 · pull · 技术设计 v1 · 服务端更新 18 KB</div>
          <div class="vsw-source mono" style="font-size:8.5px">10:40:02 · push · 功能设计 v2 · 本地修改 2 处</div>
          <div class="vsw-source mono" style="font-size:8.5px">10:38:44 · conflict · 上线文档 v1 · 需人工合并</div>
          <div class="vsw-source mono" style="font-size:8.5px">10:35:11 · pull · 需求分析 v3 · 已同步</div>
        </div>
      </div>
    </div></div>`;
  }

  function agentsEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">AGENTS &amp; SKILLS · 同步</div>
          <h1>Agents &amp; Skills</h1>
          <div class="vsw-head__desc">与团队共享 Agent 与 Skill 版本；本地草稿可推送，服务端更新会提示合并。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已检查服务端更新">${ic("refresh")} 检查更新</button><button class="btn btn--sm btn--primary" data-toast="已同步全部 2 个更新">${ic("sync")} 同步全部</button></div>
      </div>
      <div class="tabs" style="margin-bottom:12px">
        <button class="tab is-active" data-vsw-tab="agents">Agents <span class="count">4</span></button>
        <button class="tab" data-vsw-tab="skills">Skills <span class="count">5</span></button>
      </div>
      <div data-vsw-panel="agents">
        ${[
          ["sap-developer", "v3 · 服务端", "服务端基座 Agent，内置任务上下文、进度上报与工件提交约束。", true, "已同步", "teal"],
          ["doc-reviewer", "v2 · 服务端", "读取上游工件并对输出做一致性检查，按 checklist 返回证据。", true, "已同步", "teal"],
          ["fin-dev", "v1 · 本地草稿", "本地改写的财务领域 agent：额外注入 PDO 历史需求检索策略。", false, "未同步", "amber"],
          ["test-runner", "v1 · 服务端", "在 VSCode 本地执行测试并回写证据；当前未启用。", false, "已停用", "slate"],
        ]
          .map(
            ([name, ver, desc, enabled, status, tone]) => `
          <div class="vsw-agent-card">
            <span class="vsw-agent-card__icon">${ic("bot")}</span>
            <span class="vsw-agent-card__main"><b>${name} <span class="pill pill--${tone}">${status}</span></b><em>${ver} · ${desc}</em></span>
            <button class="switch ${enabled ? "is-on" : ""}" aria-label="启用"></button>
          </div>`
          )
          .join("")}
      </div>
      <div data-vsw-panel="skills" hidden>
        ${[
          ["sap-dev", "v4 · 服务端", "固定流程：读上下文 → 改代码 → abap check → 提交工件", true],
          ["abap-cli-edit", "v2 · .agents/skills", "ABAP 对象编辑与激活命令集，来自仓库共享技能。", true],
          ["abap-cli-read", "v2 · .agents/skills", "ABAP 读取与语法检查只读能力。", true],
          ["doc-review", "v1 · 服务端", "文档结构、引用完整性与验收覆盖检查。", true],
          ["plannotator-review", "v2 · 服务端", "按批注逐条生成修订建议并回写版本。", false],
        ]
          .map(
            ([name, ver, desc, enabled]) => `
          <div class="vsw-agent-card">
            <span class="vsw-agent-card__icon" style="background:var(--teal-tint);color:var(--teal)">${ic("wand")}</span>
            <span class="vsw-agent-card__main"><b>${name}</b><em>${ver} · ${desc}</em></span>
            <button class="switch ${enabled ? "is-on" : ""}" aria-label="启用"></button>
          </div>`
          )
          .join("")}
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-head"><h3>同步来源与顺序</h3><span class="sm">服务端覆盖包优先</span></div>
        <div class="card-body" style="padding:9px 14px">
          <div class="vsw-source">${ic("cloud")} 服务端 Agent 市场 · 团队发布 baseline</div>
          <div class="vsw-source">${ic("folder")} 仓库 <span class="mono">.github/agents</span> · 随代码评审</div>
          <div class="vsw-source">${ic("folder")} 仓库 <span class="mono">.agents/skills</span> · 本地技能</div>
          <div class="vsw-source">${ic("user")} 用户覆盖层 · 仅本机，不参与评审</div>
        </div>
      </div>
    </div></div>`;
  }

  function charmEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">SOLMAN CHARM · 本机 SSO</div>
          <h1>ChaRM 变更</h1>
          <div class="vsw-head__desc">使用本机 Windows SSO 身份申请 Change Request；凭证仅在本地使用，不会上传服务端。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已刷新 ChaRM 状态">${ic("rotate-cw")} 刷新</button></div>
      </div>
      <div class="sso-card">
        <div class="sso-card__head"><span class="sso-card__icon">${ic("shield")}</span><span><b>本机 SSO 已检测</b><em>SAP Secure Login Client · Windows 会话</em></span><span class="grow"></span><span class="pill pill--green"><span class="dot"></span>可用</span></div>
        <div class="sso-grid">
          <div><span>SSO 用户</span><b>CHEN_XI</b></div>
          <div><span>系统 / 集团</span><b>FY2 · 200</b></div>
          <div><span>会话来源</span><b>Windows 集成认证</b></div>
          <div><span>凭证边界</span><b>仅本地 · 不上传</b></div>
        </div>
      </div>
      <div class="vsw-grid" style="margin-top:12px">
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>新建 Change Request</h3><span class="sm">CD-88213</span></div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div class="field"><span class="field__label" style="font-size:9px">目标系统</span><select class="select" style="height:28px;font-size:10px"><option>FY2 · 200 · 测试</option><option>FY2 · 300 · 生产</option></select></div>
                <div class="field"><span class="field__label" style="font-size:9px">变更类型</span><select class="select" style="height:28px;font-size:10px"><option>Normal Change</option><option>Urgent Change</option></select></div>
              </div>
              <div class="field" style="margin-top:8px"><span class="field__label" style="font-size:9px">变更描述</span><textarea class="textarea" style="font-size:10px;min-height:56px">月结重跑入口 — 权限角色与配置表调整</textarea></div>
              <div class="field" style="margin-top:8px"><span class="field__label" style="font-size:9px">传输请求</span><input class="input mono" style="height:28px;font-size:10px" value="FY2K900143" /></div>
              <div class="callout callout--violet" style="margin-top:9px;padding:8px 9px;font-size:8.5px;background:var(--violet-tint);border-color:var(--violet-line);color:#43369c">${ic("info")}<span>提交后等待 Basis 审批，通过后自动创建 Change Document。</span></div>
              <div style="display:flex;gap:6px;margin-top:10px"><button class="btn btn--sm btn--primary" data-toast="CR-44104 已创建，等待 Basis 审批">${ic("send")} 申请 Change Request</button><button class="btn btn--sm" data-toast="已保存草稿">保存草稿</button></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>审批时间线</h3><span class="live-dot">轮询 60s</span></div>
            <div class="card-body" style="padding:9px 14px">
              <div class="vsw-doc-link"><span style="color:var(--green)">${ic("check-circle")}</span><span class="grow"><b>CR-44102 通过 Basis 审批</b><em>今天 08:56 · 审批人 吴工</em></span><span class="pill pill--green">已通过</span></div>
              <div class="vsw-doc-link"><span style="color:var(--amber)">${ic("clock")}</span><span class="grow"><b>CR-44103 等待 Basis 审批</b><em>今天 16:40 提交 · 已等待 2h</em></span><span class="pill pill--amber">等待中</span></div>
              <div class="vsw-doc-link"><span style="color:var(--ink-4)">${ic("git-branch")}</span><span class="grow"><b>创建 Change Document</b><em>等待 CR-44103 审批通过</em></span><span class="pill pill--slate">未开始</span></div>
            </div>
          </div>
        </div>
        <div class="vsw-col">
          <div class="card">
            <div class="card-head"><h3>CD-88213</h3><span class="pill pill--amber">待 Basis 审批</span></div>
            <div class="card-body" style="padding:10px 14px">
              <div class="vsw-source">${ic("file-text")} 月结自动化任务增加失败重跑入口</div>
              <div class="vsw-source">${ic("layers")} 关联 R-2045 · CRQ-2026-0842</div>
              <div class="vsw-source">${ic("user")} 负责人 王栎 · FY2/200</div>
              <div class="vsw-source">${ic("git-branch")} 2 个 Change Request</div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>本机能力</h3></div>
            <div class="vsw-list">
              <div class="vsw-row"><span class="vsw-row__main"><span class="vsw-row__title">使用 SSO 申请 CR</span><span class="vsw-row__sub">仅写入本地日志</span></span><button class="switch is-on"></button></div>
              <div class="vsw-row"><span class="vsw-row__main"><span class="vsw-row__title">自动轮询审批状态</span><span class="vsw-row__sub">60 秒 / 次</span></span><button class="switch is-on"></button></div>
              <div class="vsw-row"><span class="vsw-row__main"><span class="vsw-row__title">审批通过后通知</span><span class="vsw-row__sub">VSCode 通知 + Teams</span></span><button class="switch is-on"></button></div>
            </div>
            <div class="card-foot" style="padding:8px 14px"><span class="xs">SSO 凭证可用不可见：扩展只持有本地会话句柄。</span></div>
          </div>
        </div>
      </div>
    </div></div>`;
  }

  function chatEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">COPILOT CHAT · SAP DEV SKILL</div>
          <h1>协作开发</h1>
          <div class="vsw-head__desc">扩展把任务上下文递进 Copilot Chat；模型通过 Extension Tools 读任务、报进度、提交工件。</div>
        </div>
        <div class="vsw-head__actions"><span class="pill pill--teal"><span class="dot"></span>Copilot 可用</span></div>
      </div>
      <div class="vsw-chat">
        <div class="vsw-chat__msg">
          <span class="vsw-chat__avatar vsw-chat__avatar--user">周</span>
          <div class="vsw-chat__body">
            <div class="vsw-chat__name">周予</div>
            <div class="vsw-chat__text">用 sap-dev skill 处理 R-2042：先读任务上下文，再给出发票导出服务的 ABAP 骨架，最后跑一次语法检查。</div>
          </div>
        </div>
        <div class="vsw-chat__msg">
          <span class="vsw-chat__avatar vsw-chat__avatar--ai">${ic("sparkles")}</span>
          <div class="vsw-chat__body">
            <div class="vsw-chat__name">Copilot · SAP Super Agent tools</div>
            <div class="vsw-chat__text">已读取任务 <code>T-8841</code> 的上下文包与 3 份上游文档。开发约束：必须走 abap-cli，写操作需人工确认；验收标准共 4 条。</div>
            <div class="vsw-chat__tools">
              <div class="vsw-tool"><span>${ic("check")}</span><span class="mono">sap_task_context</span><span class="grow">读取 T-8841 上下文 · 4.2 KB</span><span class="mono" style="color:var(--green)">200</span></div>
              <div class="vsw-tool"><span>${ic("check")}</span><span class="mono">file_search</span><span class="grow">functional-design.md · 2 处命中</span><span class="mono" style="color:var(--green)">200</span></div>
              <div class="vsw-tool"><span>${ic("check")}</span><span class="mono">sap_report_progress</span><span class="grow">上报 32% · 已写入任务事件</span><span class="mono" style="color:var(--green)">202</span></div>
            </div>
          </div>
        </div>
        <div class="vsw-chat__msg">
          <span class="vsw-chat__avatar vsw-chat__avatar--ai">${ic("sparkles")}</span>
          <div class="vsw-chat__body">
            <div class="vsw-chat__name">Copilot · SAP Super Agent tools</div>
            <div class="vsw-chat__text">建议在 <code>ZCL_VF05_EXPORT</code> 中新增 <code>EXPORT_TO_XLSX</code> 方法，复用现有字段目录；随后在 <code>ZVF05_EXPORT</code> 报表中增加导出按钮。以下为骨架：</div>
            <div class="vsw-chat__tools">
              <div class="vsw-tool"><span style="color:var(--blue)">${ic("code")}</span><span class="mono">edit_file</span><span class="grow">zcl_vf05_export.clas.abap · +38 行</span><span class="mono" style="color:var(--blue)">diff</span></div>
              <div class="vsw-tool"><span style="color:var(--amber)">${ic("clock")}</span><span class="mono">sap_abap_check</span><span class="grow">abap check syntax · 运行中</span><span class="spinner" style="color:var(--amber)"></span></div>
            </div>
            <div class="vsw-chat__cmd">
              <span class="chips"><span class="chip">#context.md</span><span class="chip">@SAP Super Agent</span></span>
              <input placeholder="继续提问，或输入 @ 引用上下文…" />
              <span class="icon-btn" style="width:24px;height:24px;background:var(--ink);color:#fff;border-radius:4px">${ic("send")}</span>
            </div>
          </div>
        </div>
      </div>
    </div></div>`;
  }

  function syncEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">SYNC &amp; CONFLICT</div>
          <h1>同步与冲突</h1>
          <div class="vsw-head__desc">服务端工件不可变；本地修改在推送时生成新版本。冲突需要显式选择保留哪一侧。</div>
        </div>
        <div class="vsw-head__actions"><button class="btn btn--sm" data-toast="已解决全部无冲突项">${ic("check")} 处理可自动合并项</button></div>
      </div>
      <div class="vsw-stats">
        <div class="vsw-stat"><span>已同步</span><b>4</b></div>
        <div class="vsw-stat"><span>待推送</span><b>1</b><em>本地修改</em></div>
        <div class="vsw-stat"><span>待拉取</span><b>1</b><em>服务端更新</em></div>
        <div class="vsw-stat"><span>冲突</span><b style="color:var(--red)">1</b><em>需人工</em></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic("alert-triangle")} 上线文档 v1 · 冲突</h3><span class="sync-chip sync-chip--conflict">2 处差异</span></div>
        <div class="card-body">
          <div class="vsw-conflict">
            <div class="vsw-conflict__pane">
              <div class="vsw-conflict__head">服务端版本 <span>v1 · 10:42</span></div>
              <div class="vsw-conflict__body">
                <div># 上线步骤</div>
                <div>1. 冻结月结任务</div>
                <div class="del">2. 导入传输 FY2K900142</div>
                <div class="add">2. 导入 FY2K900142 → FY2K900143</div>
                <div>3. 冒烟验证</div>
              </div>
            </div>
            <div class="vsw-conflict__pane">
              <div class="vsw-conflict__head">本地版本 <span>草稿 · 10:38</span></div>
              <div class="vsw-conflict__body">
                <div># 上线步骤</div>
                <div>1. 冻结月结任务</div>
                <div class="del">2. 导入传输 FY2K900142</div>
                <div class="add">2. 先导入权限角色，再导入配置</div>
                <div>3. 冒烟验证</div>
              </div>
            </div>
          </div>
          <div class="vsw-conflict__actions" style="border:1px solid var(--line);border-top:0;border-radius:0 0 7px 7px">
            <button class="btn btn--sm" data-toast="已保留服务端版本">使用服务端</button>
            <button class="btn btn--sm" data-toast="已推送本地版本，生成 v2">推送本地</button>
            <button class="btn btn--sm btn--primary" data-toast="已打开合并编辑器">手动合并</button>
            <span class="grow"></span>
            <span class="xs" style="color:var(--ink-4)">合并后生成新版本，不覆盖历史</span>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-head"><h3>最近同步</h3><a class="link sm" href="#/docs">查看全部 ${ic("arrow-right")}</a></div>
        <div class="vsw-list">
          <div class="vsw-row"><span class="vsw-row__icon" style="color:var(--blue)">${ic("download")}</span><span class="vsw-row__main"><span class="vsw-row__title">技术设计 v1</span><span class="vsw-row__sub">10:42 · 服务端更新 18 KB</span></span><span class="sync-chip sync-chip--pull">已拉取</span></div>
          <div class="vsw-row"><span class="vsw-row__icon" style="color:var(--amber)">${ic("upload")}</span><span class="vsw-row__main"><span class="vsw-row__title">功能设计 v2</span><span class="vsw-row__sub">10:40 · 本地修改 2 处</span></span><span class="sync-chip sync-chip--push">待推送</span></div>
          <div class="vsw-row"><span class="vsw-row__icon" style="color:var(--green)">${ic("check-circle")}</span><span class="vsw-row__main"><span class="vsw-row__title">需求分析 v3</span><span class="vsw-row__sub">10:35 · sha 9f2c…41d</span></span><span class="sync-chip sync-chip--ok">已同步</span></div>
        </div>
      </div>
    </div></div>`;
  }

  function statesEditor() {
    return `
    <div class="vsw"><div class="vsw__inner">
      <div class="vsw-head">
        <div>
          <div class="vsw-eyebrow">STATES &amp; COMMANDS</div>
          <h1>状态与命令</h1>
          <div class="vsw-head__desc">六个命令覆盖全部操作；状态栏与通知只在需要你处理时打断。</div>
        </div>
        <div class="vsw-head__actions"><span class="pill pill--outline">键盘优先</span></div>
      </div>
      <div class="vsw-states">
        <div class="vsw-state-box" style="grid-column:1 / -1">
          <h3>命令面板</h3>
          <div class="vsw-cmd">
            <div class="vsw-cmd__input">${ic("search")}<input value="SAP Super Agent" /><span class="mono" style="font-size:8px;color:var(--ink-4)">ESC</span></div>
            <div class="vsw-cmd__item is-active">${ic("plug")}SAP Super Agent: 连接控制平面<span class="mono">↵</span></div>
            <div class="vsw-cmd__item">${ic("folder")}SAP Super Agent: 绑定当前工作区</div>
            <div class="vsw-cmd__item">${ic("inbox")}SAP Super Agent: 领取任务</div>
            <div class="vsw-cmd__item">${ic("external")}SAP Super Agent: 打开任务（worktree）</div>
            <div class="vsw-cmd__item">${ic("upload")}SAP Super Agent: 提交工件</div>
            <div class="vsw-cmd__item">${ic("pause")}SAP Super Agent: 暂停接单</div>
          </div>
        </div>
        <div class="vsw-state-box">
          <h3>通知</h3>
          <div class="vsw-toast">${ic("bell")}<span>新任务可领取 · R-2045 上线文档补充回滚步骤</span></div>
          <div class="vsw-toast">${ic("alert-triangle")}<span>连接已断开 · 正在指数退避重连（4s）</span></div>
          <div class="vsw-toast">${ic("check-circle")}<span>已推送工件 · 功能设计 v2 → v3</span></div>
          <div class="xs" style="margin-top:8px">权限失败时清除 token 并提示重新授权，不静默重试。</div>
        </div>
        <div class="vsw-state-box">
          <h3>状态栏</h3>
          <div class="vsw-statusline"><span>${ic("git-branch")} feature/R-2041</span><span class="live-dot">SAP SA · 在线 · 2 待办</span><span>UTF-8</span></div>
          <div class="vsw-statusline" style="background:#5b6157"><span>${ic("pause")} 已暂停接单</span><span>0 待办</span><span>ABAP</span></div>
          <div class="vsw-statusline" style="background:#8a4b3a"><span>${ic("alert-triangle")} 控制平面离线</span><span>重连中</span><span>UTF-8</span></div>
          <div class="xs" style="margin-top:8px">点击状态栏切换接单状态；tooltip 显示待审批数量与下一步动作。</div>
        </div>
        <div class="vsw-state-box">
          <h3>首次连接 / 异常</h3>
          <div class="field"><span class="field__label" style="font-size:9px">控制平面地址</span><input class="input" style="height:27px;font-size:9.5px" value="https://superagent.sap.example" /></div>
          <div class="field" style="margin-top:7px"><span class="field__label" style="font-size:9px">访问令牌</span><input class="input" type="password" style="height:27px;font-size:9.5px" value="demo-token-9f2c" /></div>
          <div style="display:flex;gap:6px;margin-top:8px"><button class="btn btn--sm btn--primary" data-toast="已连接控制平面，待办已同步">连接</button><button class="btn btn--sm" data-toast="已打开帮助文档">帮助</button></div>
          <div class="callout callout--amber" style="margin-top:8px;padding:8px 9px;font-size:8.5px">${ic("alert-triangle")}<span>工作区未受信任：请先确认信任该工作区，再允许扩展执行 abap-cli 与 git。</span></div>
        </div>
        <div class="vsw-state-box" style="grid-column:1 / -1">
          <h3>空状态</h3>
          <div class="vsw-doc-link" style="padding:10px 0"><span class="grow" style="text-align:center"><b style="justify-content:center;display:block;text-align:center">没有可领取的任务</b><em style="text-align:center">保持在线，新的任务会实时出现。检查工作区是否匹配。</em></span></div>
        </div>
      </div>
    </div></div>`;
  }

  const VIEWS = {
    plan: { label: "任务箱", sidebar: () => taskSidebar(""), editor: planEditor, tabs: [{ title: "SAP Super Agent", icon: "sparkles", active: true }] },
    task: { label: "需求详情", sidebar: () => taskSidebar("T-8841"), editor: taskEditor, tabs: [{ title: "需求详情 · R-2041", icon: "sparkles", active: true }, { title: "需求分析.md", icon: "file" }, { title: "context.md", icon: "file", dirty: true }] },
    docs: { label: "文档同步", sidebar: () => docsSidebar(), editor: docsEditor, tabs: [{ title: "过程文档", icon: "file-text", active: true }, { title: "functional-design.md", icon: "file", dirty: true }] },
    agents: { label: "Agents & Skills", sidebar: () => agentsSidebar(), editor: agentsEditor, tabs: [{ title: "Agents & Skills", icon: "brain", active: true }] },
    charm: { label: "ChaRM & SSO", sidebar: () => charmSidebar(), editor: charmEditor, tabs: [{ title: "ChaRM 变更", icon: "git-branch", active: true }, { title: "CR-44103.log", icon: "file" }] },
    chat: { label: "Copilot 协作", sidebar: () => chatSidebar(), editor: chatEditor, tabs: [{ title: "Copilot Chat", icon: "message", active: true }, { title: "context.md", icon: "file" }] },
    sync: { label: "同步与冲突", sidebar: () => syncSidebar(), editor: syncEditor, tabs: [{ title: "同步与冲突", icon: "sync", active: true }] },
    states: { label: "状态与命令", sidebar: () => statesSidebar(), editor: statesEditor, tabs: [{ title: "状态与命令", icon: "command", active: true }] },
  };

  function renderStatus(view) {
    const status = document.getElementById("vs-status");
    const items =
      view === "charm"
        ? '<span class="vs-status__item">' + ic("shield") + " SSO 可用 · FY2/200</span>" +
          '<span class="vs-status__item">' + ic("git-branch") + " 2 CR · 1 待审批</span>"
        : view === "chat"
        ? '<span class="vs-status__item">' + ic("brain") + " sap-dev skill</span>" +
          '<span class="vs-status__item">' + ic("git-branch") + " feature/R-2042</span>"
        : '<span class="vs-status__item">' + ic("git-branch") + " feature/R-2041</span>" +
          '<span class="vs-status__item">' + ic("sync") + " 0↓ 1↑</span>" +
          '<span class="vs-status__item">' + ic("alert-triangle") + " 0  " + ic("info") + " 0</span>";
    status.innerHTML =
      items +
      '<span class="vs-status__grow"></span>' +
      '<span class="vs-status__item vs-status__sa"><span class="live-dot">SAP SUPER AGENT</span> 在线 · 2 待办</span>' +
      '<span class="vs-status__item">Copilot</span>' +
      '<span class="vs-status__item">ABAP</span>' +
      '<span class="vs-status__item">UTF-8</span>' +
      '<span class="vs-status__item">Ln 12, Col 8</span>';
  }

  function render(view) {
    const v = VIEWS[view] || VIEWS.plan;
    document.getElementById("vs-sidebar").innerHTML = v.sidebar();
    document.getElementById("vs-tabs").innerHTML = v.tabs
      .map(
        (t) =>
          '<div class="vs-tab ' + (t.active ? "is-active" : "") + '"><span class="vs-tab__icon">' +
          ic(t.icon) +
          "</span>" + t.title + (t.dirty ? '<span class="vs-tab__dot"></span>' : "") + '<span class="vs-tab__close">×</span></div>'
      )
      .join("");
    document.getElementById("vs-editor").innerHTML = v.editor();
    renderStatus(view);
    document.querySelectorAll("[data-view]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.view === view);
    });
    // scale progress bars immediately
    document.querySelectorAll("[data-bar]").forEach((el) => {
      setTimeout(() => (el.style.width = el.dataset.bar + "%"), 60);
    });
    // scroll top
    document.getElementById("vs-editor").scrollTop = 0;
  }

  function currentView() {
    const hash = location.hash.replace(/^#\/?/, "");
    return VIEWS[hash] ? hash : "plan";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = ic(el.dataset.icon);
    });
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        location.hash = "#/" + btn.dataset.view;
      });
    });
    document.addEventListener("click", (e) => {
      const toastEl = e.target.closest("[data-toast]");
      if (toastEl) {
        e.preventDefault();
        SA.toast(toastEl.dataset.toast);
        return;
      }
      const switchEl = e.target.closest(".switch");
      if (switchEl) {
        switchEl.classList.toggle("is-on");
        return;
      }
      const tabEl = e.target.closest("[data-vsw-tab]");
      if (tabEl) {
        document.querySelectorAll("[data-vsw-tab]").forEach((t) => t.classList.toggle("is-active", t === tabEl));
        document.querySelectorAll("[data-vsw-panel]").forEach((p) => (p.hidden = p.dataset.vswPanel !== tabEl.dataset.vswTab));
        return;
      }
    });
    window.addEventListener("hashchange", () => render(currentView()));
    render(currentView());
  });
})();
