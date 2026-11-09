# __TITLE__

这是一个独立原型目录，由展厅 `index.html` 通过 iframe 装载。

## 约定

- 入口：`index.html`（也可以是 `dist/index.html` 或其他文件，在 registry 的 `entries` 里登记）。
- 自包含：所有资源放在本目录内，使用相对路径，不要以 `/` 开头。
- 无需构建：可以是静态 HTML/CSS/JS，也可以放已经构建好的产物；GitHub Pages 只分发文件。
- 封面：`cover.svg`（建议换成 1440×900 的真实界面截图）。
- 截图：放在 `screenshots/`，可选，用于首屏拼贴。

## 替换

1. 删除模板文件，把原型文件放进本目录。
2. 用真实截图替换 `cover.svg`。
3. 在本目录 `index.html` 能独立打开后，回到根目录运行 `npm run validate`。
4. `npm run dev` 预览：`http://localhost:4173/prototypes/__SLUG__/`。

原型内部的样式、脚本、框架都不受展厅影响，也不会影响展厅。
