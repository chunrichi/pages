/* ============================================================
   Prototype registry / 原型登记表
   ------------------------------------------------------------
   展厅唯一的数据来源。新增或更新原型时只改这个文件。

   字段说明：
   - slug       目录名，小写字母 / 数字 / 连字符，对应 prototypes/<slug>/
   - title      展台标题
   - summary    一句话介绍（不写营销话术）
   - category   用于筛选的分类
   - status     展台状态标签，如 可交互 / 设计稿 / 进行中
   - accent     该原型的强调色（16 进制），只影响展台卡片细节
   - cover      封面图路径，相对该原型目录（推荐 1440×900，16:10）
   - screens     首屏拼贴用图，最多 3 张，相对该原型目录；不填则使用 cover
   - updated    YYYY-MM-DD
   - tags       卡片上的小标签
   - entries    原型入口，path 相对该原型目录，可带 #hash
   - featured   true 的原型会成为首屏精选（最多一个）

   修改后运行：npm run validate
   ============================================================ */
window.SHOWCASE = {
  site: {
    name: "AI Space",
    tagline: "原型展厅",
    // GitHub 仓库地址；填了之后页头图标和文档链接会指向仓库
    github: "https://github.com/chunrichi/pages"
  },

  prototypes: [
    // @registry:start
    {
      slug: "sap-super-agent",
      title: "SAP Super Agent",
      summary:
        "把 SAP 交付的每一个过程放在同一条线上：需求、AI 澄清、过程文档、CRQ / ChaRM、上线审批，以及角色权限与管理控制台；另附一套 VSCode 插件。",
      category: "企业应用",
      status: "可交互",
      accent: "#2d5be3",
      cover: "screenshots/home.png",
      screens: [
        "screenshots/home.png",
        "screenshots/vscode-chat.png",
        "screenshots/admin-groups.png"
      ],
      updated: "2026-11-10",
      tags: ["SAP", "AI Agent", "角色权限", "设计系统"],
      entries: [
        { label: "设计总览", path: "index.html" },
        { label: "Web 工作台", path: "app.html#/home" },
        { label: "管理控制台", path: "app.html#/admin?tab=groups" },
        { label: "VSCode 插件", path: "vscode.html" }
      ],
      featured: true
    },
    // @registry:end
  ]
};
