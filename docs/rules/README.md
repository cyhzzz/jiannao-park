# 规则体系（单一权威源）

本仓库采用「单一权威源」规则架构：所有项目规则只在 `docs/rules/` 定义一次，根目录的 `AGENTS.md` 与 `CLAUDE.md` 仅作为**字节一致的导航锚点**（同一份内容两份镜像），不承载细节，避免多份副本互相漂移。

## 文件职责

| 文件 | 职责 |
|------|------|
| `AGENTS.md` / `CLAUDE.md` | 根锚点（导航 + 核心不变式），两文件字节一致 |
| `docs/rules/README.md` | 本说明（单一权威源架构） |
| `docs/rules/overview.md` | 项目定位、模块地图、三种姿态 |
| `docs/rules/business-invariants.md` | 关键约束 / 红线（构建入口、生成产物、版本源、UI 不变式、已知漂移） |
| `docs/rules/frontend.md` | Web 前端（vanilla JS）编码约定 |
| `docs/rules/toolchain.md` | 工具链：Node / Capacitor / JDK / Gradle / 图标 |
| `docs/rules/testing-and-delivery.md` | 构建与交付流程、验证要求 |
| `docs/rules/workflows/feature.md` | 新功能开发工作流（五步漏斗） |
| `docs/rules/workflows/bugfix.md` | 缺陷修复工作流 |
| `docs/rules/templates/tech-spec.md` | 技术规格模板 |
| `docs/jiannao_rule_build_prompt.md` | 便携式规则构建 Prompt（多平台 / 多 Agent） |

## 不自洽即失败

规则架构由 `scripts/check_rule_architecture.py` 校验：

- 根镜像 `AGENTS.md` / `CLAUDE.md` 必须字节一致；
- `AGENTS.md` 行数 ≤ 220、字节 ≤ 18000，且不得硬编码版本号；
- `docs/rules/` 内所有相对链接必须可解析；
- 便携 Prompt 必须覆盖多平台 / 多 Agent / 安全迁移要点；
- 自检脚本已接入 `scripts/pre-commit-check.ps1`、`.github/workflows/rule-architecture.yml`、`.github/PULL_REQUEST_TEMPLATE.md`。

出现 FAIL 时**先修复规则文件，不得放宽校验或删除检查项**。

## 与 WorkBuddy 记忆的关系

本仓库同时使用 WorkBuddy 项目记忆（`.workbuddy/memory/`）。为避免把记忆文件变成规则镜像而失去记忆职责，规则只镜像到 `AGENTS.md` / `CLAUDE.md` 两份；`.workbuddy/memory/MEMORY.md` 保留为项目记忆，仅指向本规则体系（详见该文件）。
