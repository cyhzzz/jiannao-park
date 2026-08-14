# 新需求开发流程（new_feature）

> 针对「健脑乐园」：Web 源码在仓库根（无构建步骤），经 Capacitor 打包为 Android APK。核心循环 = 改根源 → 出包 → 真机验证。五步漏斗只是「定位代码」的子技术，不是流程主干。

## 1. 需求拆解
明确「要做 / 不做」，填 `../templates/tech_spec_template.md` §1。对照 `../docs/rules/business-invariants.md` 与 `../red_lines.md`：是否触碰 `www/`、是否引入 Web 依赖、是否改构建入口。

## 2. 代码定位（五步漏斗，仅用于找文件）
1. 意图：Web 交互 / 新游戏 / 样式 / 原生 / 版本？
2. 模块：Web → 根 `index.html` / `css/` / `js/`；原生 / 打包 → `android/scripts/*.ps1` 或 `capacitor.config.ts`。
3. 关键词：`grep` 搜 `window.Games`、游戏名、`localStorage` 键 `best_${name}_${diff}`。
4. 调用链：只读相关片段（如 `js/app.js` 的导航 / 计时 / 弹窗）。
5. 确认改动点 + 理由。

## 3. 实现
- 先读后写；模仿 `js/app.js` 与现有 `js/games/*.js` 的 IIFE 风格。
- 新游戏三步：加 `js/games/<name>.js`（注册 `window.Games.<name>`，`start(canvas, diff, { onProgress, onComplete })`）→ `index.html` 加 `.game-card`(`data-game`) 与 `<script>` → `js/app.js` 的 `hintMap` 加提示语。
- **不动 `www/`**，由出包第一步覆盖。

## 4. 验证
- 规则有改动 → `python ../scripts/check_rule_architecture.py` PASS。
- 出包 → `powershell -File ../android/scripts/build-apk.ps1`，确认 `android/release/jiannao-v{version}.apk` 生成。
- 真机 / 模拟器跑：新功能 + 其余 4 游戏回归 + 最佳成绩 + 完成弹窗文案（必须长辈友好）。

## 5. 沉淀
- 更新 `../templates/tech_spec_template.md` §5 / §6。
- 规则有变 → 同步 `AGENTS.md` / `CLAUDE.md` / `MEMORY.md`（三向字节一致）与 `docs/rules/*`。
- 提 PR，勾选 `.github/PULL_REQUEST_TEMPLATE.md` 清单。
