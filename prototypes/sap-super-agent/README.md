# SAP Super Agent · 交付工作台界面重构

> 为现有 SAP 交付产品做的一次完整界面重构：**HTML + 动画的高保真原型 + 设计文档 + VSCode 扩展设计**。  
> 风格统一、浅色、克制；把「业务提需求 → AI 澄清与文档 → IT 开发 → CRQ / ChaRM → 上线审批」放进同一条可追溯的界面链路。
> 账号只属于一个小群组；文档格式当前只支持 Markdown，批注可交给 AI 二次生成新版本。

## 打开方式

不需要安装依赖、不需要构建，双击即可浏览：

| 入口 | 文件 | 内容 |
| --- | --- | --- |
| **设计总览** | [`index.html`](index.html) | 重构叙事、设计原则、全部界面索引、设计系统、文档入口 |
| **Web 工作台** | [`app.html`](app.html) | 可交互 SPA：注册绑定、需求、AI 澄清、文档评审、CRQ、ChaRM、队列、Agent、设置 |
| **VSCode 插件** | [`vscode.html`](vscode.html) | 8 个插件视图，独立 HTML；产品界面中不提供入口 |

推荐先打开 `index.html`，从总览进入各原型；也可以直接打开 `app.html#/home`。

- 支持 `⌘K` 命令面板、通知抽屉、Tab / 路由切换、弹窗与流程演示。
- `?shot=1` 为静态截图模式（关闭动画、立即完成计数），方便文档与截图工具使用。
- 遵循 `prefers-reduced-motion`；无外部字体、图片或 CDN 依赖。

## 目录

```text
.
├── index.html                 # 设计总览 / 展示页
├── app.html                   # Web 工作台原型（hash 路由）
├── vscode.html                # VSCode 扩展原型（hash 路由）
├── assets/
│   ├── tokens.css            # 设计 token
│   ├── base.css              # reset / 排版 / 基础布局
│   ├── components.css        # 通用组件
│   ├── app.css               # Web 应用外壳与页面样式
│   ├── vscode.css            # VSCode 模拟器与 Webview 样式
│   ├── index.css             # 展示页样式
│   ├── icons.js              # 内联 SVG 图标集
│   ├── app.js                # 路由、浮层、命令面板、演示数据
│   └── vscode.js             # 插件视图切换与内容
├── screens/                  # Web 原型页面模块（按路由注册）
├── screenshots/              # 33 张原型截图（1440 × 900）
└── docs/                     # 设计文档（本目录）
```

## 设计文档

1. [重构方案与信息架构](docs/00-重构方案.md)
2. [设计系统](docs/01-设计系统.md)
3. [关键流程](docs/02-关键流程.md)
4. [界面逐页说明](docs/03-界面说明.md)
5. [VSCode 插件设计](docs/04-vscode-plugin.md)
6. [数据模型与接口](docs/05-数据与接口.md)

## 参考与边界

- 整体产品思路参考 DeepSeek Harness 的 **super-agent** 分层：需求在 SAP、编排在控制平面、执行在 VSCode；但本原型只覆盖界面与交互，不绑定具体实现。
- 文档评审的批注 / 版本 / 门禁交互参考 [Plannotator](https://docs.plannotator.ai/) 的「plan & document review」，做了更轻量的取舍。
- 与现有 `sap_super_agent` 后端契约（需求、阶段、任务、工件、门禁、Hook）保持术语一致；新增的账号绑定、CRQ 模板、ChaRM、队列可视化、Agent Run、批注等对象在 [数据模型与接口](docs/05-数据与接口.md) 中给出建议模型。
- 所有截图中的用户、需求、工单、接口返回均为演示数据。

## 状态

可交互原型 · 设计评审版 v2.0（2026-11）。  
不是最终产品 UI；视觉、文案、流程仍可随评审调整。
