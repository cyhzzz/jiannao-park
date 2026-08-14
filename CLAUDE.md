> 单一权威源锚点。完整细则在 [`docs/rules/`](./docs/rules/README.md)；项目 Spec 知识库在 [`project_spec/`](./project_spec/overview.md)。本文件与 [`CLAUDE.md`](./CLAUDE.md) **字节一致**，任何修改先改此处再同步镜像。

# 健脑乐园（阿兹海默脑力训练）

为认知退化长辈（如奶奶辈）设计的移动端认知训练小游戏：舒尔特方格、数字划消、翻牌配对、连线、找不同。Web 层是无框架、无构建步骤的原生 HTML/CSS/JS，经 Capacitor 7 封装为 Android APK。

## 产品定位

自研移动端 App。技术基座为 Capacitor 7 + 原生 Android（Gradle）；Web 层为 vanilla JS（无打包器、无 npm 运行时依赖）。Capacitor 是被内化的外壳，不是产品身份；不存在「原始基座模式 / 本产品模式」分支。

## 提交前验证（本地闭环）

改完任何文件，先跑规则自检确认 PASS：`python scripts/check_rule_architecture.py`。涉及出包的改动，必须用 `android/scripts/build-apk.ps1` 产出 APK，并在真机 / 模拟器验证（截图优先，其次说明无法运行的原因 + 复现步骤）。若推送到远程并开 PR，勾选 `.github/PULL_REQUEST_TEMPLATE.md` 的 Validation 清单。

## 编码规范

- **语言 / 包管理**：Web 层 vanilla JS（ES5 风格 IIFE，无打包器、无 Web 依赖）；Android 封装层用 Node + Capacitor CLI + Gradle。
- **默认开发环境**：Windows + PowerShell（命令行窗口最终隐藏，不弹黑窗）。

---

## 业务专属规则

> 项目特有的硬约束、禁止项、构建入口、UI 不变式下沉到 `docs/rules/*`。

### 项目定位与约定
完整说明见 [`docs/rules/overview.md`](./docs/rules/overview.md)。

### 关键约束（红线）
详见 [`docs/rules/business-invariants.md`](./docs/rules/business-invariants.md)。

### Web 前端约定
详见 [`docs/rules/frontend.md`](./docs/rules/frontend.md)。

### 构建 / 工具链 / 交付
- 工具链：[`docs/rules/toolchain.md`](./docs/rules/toolchain.md)
- 测试与交付：[`docs/rules/testing-and-delivery.md`](./docs/rules/testing-and-delivery.md)

### 工作流
- 功能开发：[`docs/rules/workflows/feature.md`](./docs/rules/workflows/feature.md)
- 缺陷修复：[`docs/rules/workflows/bugfix.md`](./docs/rules/workflows/bugfix.md)
- 技术规格模板：[`docs/rules/templates/tech-spec.md`](./docs/rules/templates/tech-spec.md)

---

## 规则架构自检

- 本文件（`AGENTS.md`）与 `CLAUDE.md` 必须字节一致，由 `scripts/check_rule_architecture.py` 校验。
- 当前版本号只存在于 [`version.json`](./version.json)，规则文件不得硬编码。
- 本地自检（Windows + PowerShell 默认）：`python scripts/check_rule_architecture.py` 或 `scripts/pre-commit-check.ps1`。
- 项目 Spec 知识库：[`project_spec/`](./project_spec/overview.md)。
