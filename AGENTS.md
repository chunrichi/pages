# Rules

## For Frontend

- Avoid unnecessary secondary labels and descriptions. Let the layout do the explainning.

## For all

- Each modification must take into account user experience, development experience, and the usage experience of AI Agent. All three aspects need to be improved, and existing functions must not be damaged.

---

# Prototype Gallery · Agent Guide

本仓库是一个**项目级 GitHub Pages** 静态原型展厅：

- 线上地址形如 `https://<owner>.github.io/<repo>/`
- 展厅入口：根目录 `index.html`
- 原型目录：`prototypes/<slug>/`，每个原型都是可以单独打开的静态站点
- 数据登记：`data/prototypes.js`（唯一数据源）
- 部署：`.github/workflows/deploy.yml`（push `main` 自动发布）

## 开工前先读

| 任务 | 先读 |
| --- | --- |
| 新增一个原型 | `skills/add-prototype/SKILL.md` |
| 更新已有原型 | `skills/update-prototype/SKILL.md` |
| 校验、提交、发布 | `skills/publish-gallery/SKILL.md` |
| 本地运行、部署细节 | `README.md` |

## 目录地图

```text
.
├── index.html                  # 展厅入口（不要改名为别的文件）
├── assets/
│   ├── site.css                # 展厅样式
│   ├── site.js                 # 展厅逻辑（数据驱动渲染、舞台、筛选）
│   └── favicon.svg
├── data/
│   └── prototypes.js           # 原型登记表 —— 新增/更新时改这里
├── prototypes/
│   ├── _template/              # 新原型脚手架，不登记、不展示
│   └── <slug>/                 # 一个原型一个目录，自包含
│       ├── index.html
│       ├── cover.png           # 封面，推荐 1440×900
│       └── ...
├── skills/                     # 给 Agent 的操作手册
├── scripts/
│   ├── serve.mjs               # 零依赖本地服务器（npm run dev）
│   ├── validate.mjs            # 校验（npm run validate）
│   └── new-prototype.mjs       # 脚手架（npm run new）
├── .github/workflows/deploy.yml
├── .nojekyll
├── README.md
└── AGENTS.md
```

## 不可破坏的约束

1. **只用相对路径。** 这是项目级 Pages，站点运行在 `/<repo>/` 子路径下。不要写 `/assets/...`、`src="/..."`，也不要在原型里引用站点根路径。`npm run validate` 会检查。
2. **保持零构建、零依赖。** 展厅是原生 HTML/CSS/JS；`npm run dev` / `npm run validate` 只用 Node 内置模块。不要给根目录加框架、打包器或 CDN 依赖。
3. **展厅和原型解耦。** 改展厅时不要动 `prototypes/<slug>/` 的内部样式；改原型时不要为了适配展厅去改原型内部 CSS。舞台通过 iframe 隔离，原型的风格必须原样保留。
4. **每个原型必须登记。** `prototypes/` 下除 `_template/` 外的每个目录都应在 `data/prototypes.js` 中有一条记录；改完跑 `npm run validate`。
5. **registry 是唯一数据源。** 卡片、首屏、筛选、舞台都从它渲染；不要在 `index.html` 里硬编码某个原型的标题或截图。
6. **颜色只作为元数据。** 原型卡片强调色来自 registry 的 `accent`；展厅本身保持中性、明亮，不为单个原型改主题。
7. **不要回归已有能力。** 包括：舞台打开/关闭、入口 tab、桌面/平板/手机预览、深链接、Esc、focus 管理、筛选、滚动 reveal、`prefers-reduced-motion`、无横向滚动。
8. **不要把原型改成外链或截图代替。** 原型展示的是可运行的 iframe 实时页面；封面只是入口。
9. **不引入外部字体或跟踪脚本。** 展厅没有 CDN 请求，保持可离线打开。
10. **提交前验证。** `npm run validate` 必须通过；涉及 UI 的改动要在 1440 和 390 宽度各看一遍。
11. **原型更新后改 `updated`。** 日期用 `YYYY-MM-DD`；状态从 `进行中 / 可交互 / 设计稿` 中选一个最贴近的。
12. **大文件克制。** GitHub Pages 单文件上限 100 MB，整站建议 < 1 GB；截图优先 PNG/WebP，不要把原始素材、视频源文件塞进来。

## 工作流

### 新增

```bash
npm run new -- my-prototype "我的原型"
# 替换 prototypes/my-prototype/index.html，换 cover，补 registry 字段
npm run validate
npm run dev            # http://localhost:4173/
```

### 更新

```bash
# 直接替换 prototypes/<slug>/ 内的文件；入口路径变化时同步 registry.entries
npm run validate
git diff --stat        # 确认只动了目标原型 / registry
```

### 发布

```bash
npm run validate
git add -A
git commit -m "feat(proto): add my-prototype"
git push origin main   # Actions 发布到 GitHub Pages
```

## 完成标准

- 原型能在 `prototypes/<slug>/index.html` 直接打开，也能在展厅舞台里打开。
- 所有入口、图片、样式、脚本都 200，浏览器 console 没有报错。
- 1440 宽度和 390 宽度都没有横向滚动；卡片、舞台、筛选正常。
- 深链接 `#p=<slug>&e=<n>&v=mobile` 可以复现同一视图。
- `npm run validate` 通过，`git status` 里没有意外文件。
