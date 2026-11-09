---
name: publish-gallery
description: Validate and publish the prototype gallery to project-level GitHub Pages. Use when asked to ship, deploy, release, or update the live gallery after prototype or portal changes.
---

# 发布展厅

发布 = **校验静态站点 → 提交 → push 到 main → GitHub Actions 部署到项目级 Pages**。不要手动改 `main` 历史，不要 force push。

## 前置

- 仓库已初始化，远端为 `origin`，主分支为 `main`。
- 仓库 Settings → Pages → Source 已选 **GitHub Actions**（首次发布需要）。
- 当前环境没有 GitHub 凭据时，只做到提交/推送前，然后把需要用户执行的命令和检查项列清楚。

## 1. 发布前检查

```bash
git status
npm run validate
```

- 校验必须通过；有 warning 逐条判断，不要直接忽略「封面比例 / 未登记目录 / 根路径引用」这类问题。
- 检查 diff 范围：只包含预期原型和 `data/prototypes.js`；不要混入无关重构。
- 不提交：`node_modules/`、`.DS_Store`、密钥、`.env`、临时截图、>100 MB 的单个文件。
- 如果改了展厅本身（`index.html` / `assets/` / `scripts/`），必须回归所有已登记原型。

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

## 4. 推送并等待部署

```bash
git push origin main
```

- 正常情况下 push 会触发 `.github/workflows/deploy.yml`。
- 有 `gh` 且已登录时可以看：

```bash
gh run list --workflow=deploy.yml --limit 3
gh run watch
```

- 没有 `gh` 时，把 Actions 页面地址交给用户检查：
  `https://github.com/<owner>/<repo>/actions/workflows/deploy.yml`
- 部署成功后检查：
  `https://<owner>.github.io/<repo>/`
- 第一次发布或在 Pages 未启用时，需要先到 Settings → Pages 把 Source 选成 **GitHub Actions**；否则 workflow 会失败。

## 5. 失败处理

| 现象 | 处理 |
| --- | --- |
| `Validate registry` 失败 | 本地跑 `npm run validate` 复现，修好再推 |
| Pages 未启用 / `Get Pages site failed` | 让用户到 Settings → Pages 选择 GitHub Actions，再重新 run workflow |
| 发布成功但页面 404 | 确认访问的是 `https://<owner>.github.io/<repo>/`，且仓库 Pages Source 正确 |
| 图片 / 入口 404 | 检查 registry 路径和文件大小写；Pages 区分大小写 |
| 页面更新延迟 | Pages 有缓存，等 1–2 分钟；必要时强制刷新 |

## 回滚

```bash
git log --oneline -5
git revert <bad-commit>       # 生成一个反向提交，保留历史
git push origin main
```

不要用 `git reset --hard` + force push 处理线上问题。

## 完成标准

- `npm run validate` 通过。
- 提交范围干净，push 成功。
- Actions 部署成功（或已明确告知用户需要手动启用 Pages）。
- 线上 URL 可以打开展厅和至少一个原型。
- 汇报：提交号、部署地址、校验结果、仍存在的 warning。

首次发布的完整 GitHub 设置步骤见 `README.md` 的「部署到项目级 GitHub Pages」。
