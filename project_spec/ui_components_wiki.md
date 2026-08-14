# UI 组件百科（ui_components_wiki）

> 本仓库无组件库 / UI 框架，UI 由原生 HTML + CSS + 少量 JS 状态切换构成。以下列出页面结构与样式约定。

## 页面结构（index.html）

- `#page-home`：首页游戏选择卡片网格 `.game-grid` + `.game-card`（含 `data-game`）；底部 `为奶奶设计的认知训练小游戏`。
- `#page-game`：游戏页，`#game-title`、难度面板 `#difficulty-panel`、信息栏 `#game-info-bar`、画布 `#game-canvas`、操作区 `#game-controls`。
- `#complete-modal`：完成弹窗（`.modal` 隐藏态由 `.hidden` 控制），含 `#modal-title` / `#modal-message` / `#modal-time` / `#modal-best` / 按钮。

## 关键 CSS 约定（css/style.css）

- 主题底色 `#f7f8fa`；标题区 `#theme-color` 同色。
- 卡片 `.game-card`：大点按区，含图标 + 标题 + 描述三行。
- 按钮：`.action-btn.primary`（主操作）/ `.action-btn.secondary`（次操作）；`.diff-btn` 选中态 `.selected`。
- 状态切换：`.hidden`（`display:none`）控制页面 / 面板 / 弹窗显隐，由 `js/app.js` 增删 class。
- 布局：竖屏单栏；大字号、大间距，适配长辈单手操作。

## 主题 / 颜色 Token

| Token | 值 | 用途 |
|-------|-----|------|
| 背景 | `#f7f8fa` | 全局底色 |
| 强调（主按钮） | 主色（见 style.css 变量区） | 开始 / 主操作 |
| 次操作 | 次级灰 | 返回 / 重新开始 |

## 交互状态

- 难度未选：开始按钮 `disabled` + `opacity:0.5`；选中后启用。
- 计时：200ms 轮询更新 `#timer`；最佳成绩从 localStorage 读取显示 `--:--` 占位。
- 完成：停表 → 写最佳（更小则更新）→ 弹窗（新纪录用不同标题 / 文案）。
