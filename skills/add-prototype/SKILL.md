---
name: add-prototype
description: Add a new self-contained prototype to this project-level GitHub Pages gallery. Use when asked to add, import, publish, or showcase a new prototype, or to scaffold prototypes/<slug>/ and register it in data/prototypes.js.
---

# 新增一个原型

把一份新的可运行原型放进展厅：`prototypes/<slug>/` + 一条 `data/prototypes.js` 记录 + 封面。完成后它应该能在展厅里被打开、筛选、深链接，也能单独访问。

## 先确认

1. 读过 `AGENTS.md` 的约束。
2. 源文件可以是：
   - 纯静态 HTML/CSS/JS（直接放入即可）；
   - 已构建好的产物（`dist/`、`build/` 等；只放产物，不放 `node_modules`）；
   - 需要构建的框架项目：先在源项目里构建，再把产物放进 `prototypes/<slug>/`。
3. 原型是**静态可托管**的；需要后端、登录、实时接口的交互，先做静态演示版。
4. 所有链接、图片、字体、脚本都必须用**相对路径**，不能以 `/` 开头。

## 步骤

### 1. 起一个目录

```bash
npm run new -- <slug> "<标题>"
```

- `<slug>`：小写字母 / 数字 / 连字符，例如 `checkout-redesign`
- 脚本会创建 `prototypes/<slug>/`、替换模板占位符、在 registry 里追加一条记录，并立刻校验。
- 复制已有原型也可以：`cp -R prototypes/<existing>/ prototypes/<slug>/`，但要手动改 registry，并且不要把原型的旧截图/标题带过来。

### 2. 放入原型文件

```bash
# 静态原型
cp -R /path/to/prototype/. prototypes/<slug>/

# 构建产物
npm run build --prefix /path/to/source
cp -R /path/to/source/dist/. prototypes/<slug>/
```

- 入口通常是 `index.html`；不是的话记得在 registry 的 `entries` 里写正确路径。
- 保持自包含：不要把依赖指到仓库外层或绝对 URL。
- 如果原型使用 Vite / Webpack 等，构建时把 `base` 设为 `'./'`，否则 `/assets/...` 在项目级 Pages 下会 404。
- 使用 hash 路由（`#/home`）最稳；history 路由需要 GitHub Pages 的 404 回退，本项目不提供。
- 不要复制 `node_modules`、`.git`、`.DS_Store`、源项目 README（除非它对这个原型有价值）。

### 3. 封面

- 用真实界面截图，推荐 **1440×900（16:10）**，保存为 `prototypes/<slug>/cover.png`。
- 想要更丰富的首屏拼贴，再加 1–2 张截图到 `screenshots/`，写进 registry 的 `screens`（最多 3 张）。
- 没有截图时先保留模板 `cover.svg`，但发布前应该换掉。

### 4. 补 registry

打开 `data/prototypes.js`，找到 `<slug>` 的记录补全关键字段：

```js
{
  slug: "checkout-redesign",
  title: "结算页改版",
  summary: "把结算流程压缩成一步，减少地址和优惠券的往返。",
  category: "电商",
  status: "可交互",
  accent: "#0b8f7c",
  cover: "cover.png",
  screens: ["screenshots/home.png", "screenshots/cart.png"],
  updated: "2026-11-10",
  tags: ["Checkout", "Mobile"],
  entries: [
    { label: "原型", path: "index.html" },
    { label: "订单详情", path: "index.html#/order" }
  ]
}
```

- `entries[0]` 是卡片默认打开的入口。路径相对 `prototypes/<slug>/`，可带 `#hash`。
- `accent` 只影响卡片的状态点、编号等细节，不改变原型本身。
- 只有一个原型可以 `featured: true`；用户没要求精选时不要加。
- 不要为了录入方便把原型标题/截图硬编码到 `index.html`。

### 5. 校验和预览

```bash
npm run validate
npm run dev
```

检查：

- `http://localhost:4173/prototypes/<slug>/` 能独立打开，图片和交互正常。
- `http://localhost:4173/` 中出现卡片，封面、标题、标签、入口都对。
- 点开舞台后 iframe 正常；切换入口；切到手机宽度；Esc 关闭。
- 浏览器 console 无报错，Network 无 4xx。
- 1440 和 390 宽度都没有横向滚动。

### 6. 汇报

说明新增的 slug、标题、入口、封面来源，以及 `npm run validate` 的结果。不要顺手改其他原型或展厅样式。

## 完成标准

- `prototypes/<slug>/` 自包含、独立可开。
- `data/prototypes.js` 有一条完整记录，`npm run validate` 通过。
- 封面是真实界面截图（或明确说明仍是占位）。
- 展厅首页与舞台都能打开，深链接 `#p=<slug>&e=0` 可复现。
