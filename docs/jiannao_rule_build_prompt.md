# AI 项目 Spec 规则构建 Prompt（便携式）

> 可移植规则构建提示词：把本仓库根规则初始化为「单一权威源」架构。本文件不被任何规则文件硬编码版本号引用；具体版本见仓库 `version.json`。

## 适用平台 / 默认开发环境

- **默认开发环境：Windows + PowerShell**（命令行窗口最终隐藏，不弹黑窗）。
- 跨平台兼容：**Windows/PowerShell** 与 **macOS/Linux/WSL** 均可运行自检脚本（纯 Python 3，无第三方依赖）。

## 支持的 AI 编码 Agent

本规则架构对以下 agent 统一生效（根规则镜像确保字节一致）：

- **AGENTS.md** —— 本仓库 / WorkBuddy 入口。
- **CLAUDE.md** —— Claude / Claude Code 入口（与 `AGENTS.md` 字节一致）。
- **Cursor** —— 通过根规则镜像获得同一份约束。
- **Trae** —— 同上。
- **GitHub Copilot** —— 同上。

## 核心原则

1. **单一权威源**：规则只在 `docs/rules/` 定义一次；根 `AGENTS.md` / `CLAUDE.md` 仅做导航锚点，禁止多份副本漂移。
2. **非破坏迁移**：拆分 / 重命名规则文件时，保留旧路径的引用或归档，不破坏既有链接与 CI。
3. **可重复执行**：规则自检 `python scripts/check_rule_architecture.py` 可重复运行，结果稳定（PASS / FAIL 可复现）。
4. **未经用户明确授权，不执行破坏性操作**：删除 / 覆盖 / 强制推送等外部副作用动作，必须先取得用户显式确认。

## 构建步骤（给 agent 的指令）

1. 在仓库根建立三向字节一致镜像：先写 `AGENTS.md`，再复制生成 `CLAUDE.md` 与 `.workbuddy/memory/MEMORY.md`（三文件内容必须完全相同）。
2. 把详细规则下沉到 `docs/rules/`：`README.md`（单一权威源说明）、`overview.md`、以及项目特有的 `business-invariants.md` / `frontend.md` / `toolchain.md` / `testing-and-delivery.md` / `workflows/feature.md` / `workflows/bugfix.md` / `templates/tech-spec.md`。
3. 根锚点只保留导航 + 核心不变式（≤ 220 行 / ≤ 18000 字节），并链接到上述主题文件与 `version.json`、`project_spec/`。
4. 由 `version.json` 承载动态版本号；规则文件不得硬编码版本或发布日期。
5. 接入自检：写 `scripts/check_rule_architecture.py`，并接入 `scripts/pre-commit-check.ps1`（Windows + PowerShell 默认）、`.github/workflows/rule-architecture.yml`、`.github/PULL_REQUEST_TEMPLATE.md`。
6. 运行自检确保全 PASS；若有 FAIL，先修复规则文件而非放宽校验。

## 安全边界

- 任何涉及文件系统、原生工程、打包产物、外部依赖的改动，默认以终端用户身份驱动验证，而非「写代码然后祈祷」。
- 外部副作用（推送、删除、发布、改 `android/` 原生文件）必须 **未经用户明确授权** 不执行。
