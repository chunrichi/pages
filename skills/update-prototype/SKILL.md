---
name: update-prototype
description: Update an existing prototype in this GitHub Pages gallery without touching the rest of the exhibition. Use when asked to refresh, replace, fix, or re-publish a prototype already registered in data/prototypes.js.
---

# 更新已有原型

只改目标原型和它的 registry 记录，不动其他展品、不动展厅样式（除非任务本身就是改展厅）。

## 1. 定位

```bash
# 在 registry 中找到目标记录
grep -n 'slug' data/prototypes.js

# 确认目录和入口
ls prototypes/<slug>/
cat data/prototypes.js
```

先看 `entries` 和 `cover`，记下当前入口路径；改完之后要保持一致，或者同步更新 registry。

## 2. 替换内容

- 静态原型：直接覆盖 `prototypes/<slug>/` 内的同名文件。
- 构建产物：重新构建后同步产物；确认入口仍然是 registry 里写的路径。
- 不要为了适配展厅去改原型的内部样式/路由；展厅用 iframe 隔离，不需要它适配。
- 不要删除仍在使用的截图和资源；无引用的旧文件可以清理，但先确认。

```bash
# 只覆盖目标目录，不碰其他原型
rsync -a --delete /path/to/new-build/ prototypes/<slug>/
```

> `rsync --delete` 会删掉目标目录里多余的文件，执行前确认目标路径正确。

## 3. 更新 registry

必改：

- `updated`: 今天，`YYYY-MM-DD`

按需改：

- `summary` / `status` / `tags`：内容或阶段变化时
- `cover` / `screens`：视觉变化明显时重截
- `entries`：入口文件或标签变了
- `accent`：原型主色变化时（可选）
- `featured`：不要随意改；需要换精选时先和用户确认

如果原型 slug 改名：新建/重命名目录，更新 registry 的 `slug`，并提醒用户旧深链接会失效。不要保留两个同内容目录。

## 4. 校验范围

```bash
npm run validate
git status --short
git diff --stat
```

确认 diff 只涉及：

- `prototypes/<slug>/` 内目标文件
- `data/prototypes.js` 的对应记录
- 需要时新增/替换的截图

如果 diff 里出现了其他原型或 `assets/site.css` / `assets/site.js`，先停下来说明原因。

## 5. 预览

```bash
npm run dev
```

检查：

- 直接打开 `/prototypes/<slug>/`
- 展厅首页卡片与封面
- 舞台：默认入口、每个 tab、手机宽度
- 深链接 `#p=<slug>&e=<n>` 可复现
- 控制台无报错；旧的原型没有被影响

## 完成标准

- 目标原型独立可开，展厅内可开。
- registry 的 `updated` 已更新，入口路径一致。
- `npm run validate` 通过，diff 范围可控。
- 不回归任何既有展品或展厅能力。
