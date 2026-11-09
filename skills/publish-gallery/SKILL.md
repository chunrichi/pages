---
name: publish-gallery
description: Validate and publish the static prototype gallery to project-level GitHub Pages using branch deployment (no GitHub Actions). Use when asked to ship, deploy, release, or update the live gallery after prototype or portal changes.
---

# 发布展厅

本仓库是纯静态站点，使用 **GitHub Pages 分支发布**：

> `main` 根目录 → Pages 自动构建 → `https://<owner>.github.io/<repo>/`

没有 GitHub Actions，也没有构建步骤。**不要新增 Actions 部署工作流**；Actions 只会多一层故障面，页面更新也不依赖它。

发布 = **本地校验 → 提交 → push `main` → 等 Pages 构建 → 验证线上**。

## 1. 发布前检查

```bash
git status
npm run validate
```

- 校验必须通过；有 warning 逐条判断，不要忽略「封面比例 / 未登记目录 / 根路径引用」。
- 检查 diff 范围：只包含预期原型和 `data/prototypes.js`；不要混入无关重构。
- 不提交：`node_modules/`、`.DS_Store`、密钥、`.env`、临时截图、>100 MB 的单个文件。
- 如果改了展厅本身（`index.html` / `assets/` / `scripts/`），必须回归所有已登记原型。
- 根目录必须保留 `.nojekyll`；没有它，Pages 会走 Jekyll，站点路径可能 404。

## 2. 本地冒烟

```bash
npm run dev
```

至少检查：

- `/` 首屏和卡片正常，封面加载，无横向滚动
- 打开舞台，切换入口，切手机宽度，Esc 关闭
- 深链接 `#p=<slug>&e=0` 直接打开
- 1440 和 390 宽度各看一遍
- 浏览器 console 无 error，Network 无 4xx

## 3. 提交

```bash
git add -A
git commit -m "feat(proto): add <slug>"
```

提交信息建议：

- `feat(proto): add <slug>` 新增原型
- `update(proto): refresh <slug>` 更新原型
- `feat(gallery): ...` / `fix(gallery): ...` 展厅本身
- `chore: ...` 脚本、文档、配置

## 4. Push 并等待 Pages 构建

```bash
git push origin main
```

- 分支发布会在后台构建，通常 30–120 秒完成。
- 有 `gh` 且已登录时可以查：

```bash
gh api repos/<owner>/<repo>/pages/builds/latest \
  --jq '{status:.status, commit:.commit, error:.error.message}'
```

`status` 从 `building` 变成 `queued` / `built` / `errored`；`built` 即可验证。

- 没有 `gh` 时：仓库 **Settings → Pages** 里有构建历史和当前状态。
- **不要**去 Actions 页面找部署记录，分支发布不经过 Actions。

## 5. 验证线上

```bash
curl -sL -o /dev/null -w '%{http_code}\n' https://<owner>.github.io/<repo>/
curl -sL -o /dev/null -w '%{http_code}\n' https://<owner>.github.io/<repo>/prototypes/<slug>/
```

- 打开首页、目标原型和封面，确认是新内容；必要时强刷缓存。
- 构建状态是 `errored` 时，看 `error.message`；常见原因是路径大小写、缺文件、单文件/站点超限。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| `npm run validate` 失败 | 本地修复后重新提交，不要先 push |
| 线上 404 | 确认 Settings → Pages 的 Source 是 `main` / `/(root)`，且 `.nojekyll` 在根目录；等构建完成 |
| 页面还是旧版 | Pages CDN 缓存，等 1–2 分钟或强刷；确认 `pages/builds/latest` 的 commit 是新提交 |
| 构建一直 `building` | 等 2 分钟；仍卡住可重新触发：`gh api --method POST repos/<owner>/<repo>/pages/builds` |
| 新文件 404、旧文件正常 | 通常是文件名大小写或路径问题；Pages 区分大小写 |
| Actions 页面有失败记录 | 本项目不依赖 Actions；这些是历史记录，不影响分支发布 |

## 回滚

```bash
git log --oneline -5
git revert <bad-commit>       # 生成一个反向提交，保留历史
git push origin main
```

不要用 `git reset --hard` + force push 处理线上问题。

## 首次设置

1. 建一个公开仓库（免费计划下 Pages 需要公开仓库）。
2. **Settings → Pages → Build and deployment → Source** 选 **Deploy from a branch**。
3. Branch 选 `main`，Folder 选 `/(root)`。
4. push 后访问 `https://<owner>.github.io/<repo>/`。
5. 确认根目录有 `.nojekyll`，且 `index.html` 在仓库根目录。

## 完成标准

- `npm run validate` 通过。
- 提交范围干净，push 成功。
- `pages/builds/latest` 为 `built`，线上 URL 可以打开展厅和至少一个原型。
- 汇报：提交号、Pages 构建状态、线上地址、仍存在的 warning。
