# 功能开发工作流（feature）

> 五步漏斗：需求拆解 → 代码定位 → 实现 → 验证 → 沉淀。

## 1. 需求拆解

- 明确「要做 / 不做」边界，写入 [`../templates/tech-spec.md`](../templates/tech-spec.md) 的 §1。
- 对照 [`business-invariants.md`](../business-invariants.md)：是否触碰生成产物（`www/`）、是否改构建入口、是否引入 Web 依赖（默认不允许）。

## 2. 代码定位（五步漏斗）

1. 是 Web 交互 / 新游戏 / 样式？→ 根 `index.html` / `css/` / `js/`。
2. 是新增游戏？→ `js/games/<name>.js` + `index.html` 的 `.game-card` 与 `<script>` + `js/app.js` 的 `hintMap`。
3. 是导航 / 计时 / 成绩？→ `js/app.js`。
4. 是原生 / 打包 / 图标？→ `android/scripts/*.ps1` 或 `capacitor.config.ts`（不要手改 `android/android/` 原生文件）。
5. 是版本 / 命名？→ `version.json`（唯一源）。

## 3. 实现

- 先读后写：改任何文件前完整读取。
- 模仿已有：新游戏严格按 [`frontend.md`](../frontend.md) 的 `window.Games` 注册约定。
- 不越界：只改需求范围内的文件，不顺手优化无关代码。

## 4. 验证

- 规则文件有改动 → `python scripts/check_rule_architecture.py` 须 PASS。
- 出包验证 → `powershell -File android/scripts/build-apk.ps1`，确认 `android/release/jiannao-v{version}.apk` 生成。
- 真机 / 模拟器跑一遍手动清单（见 [`testing-and-delivery.md`](../testing-and-delivery.md)）。

## 5. 沉淀

- 更新 [`../templates/tech-spec.md`](../templates/tech-spec.md) 的 §5 演进事件 / §6 产物清单。
- 如改动影响规则，同步 `AGENTS.md` / `CLAUDE.md`（字节一致）与 `docs/rules/*`。
- 提交 PR，勾选 PULL_REQUEST_TEMPLATE 的 Validation 清单。
