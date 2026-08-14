# 红线规则（red_lines）

> 本文件由「健脑乐园」真实架构推导，不是通用模板。权威源仍是 `../docs/rules/business-invariants.md`；下方「通用工程纪律」仅作兜底，非头条。

## 项目专属 Critical 红线（触发即停）

| 编号 | 红线 | 真实依据 |
|------|------|----------|
| RL-01 | 禁止手改 `www/` | `www/` 是 `cap sync` 从仓库根 Web 源复制的生成镜像，手改下次 sync 即被覆盖 |
| RL-02 | 只跑 `build-apk.ps1` 出包 | `android/package.json` 的 `npm run build` 指向不存在的 `frontend-react`，是「省心投 BI」遗留，不可用 |
| RL-03 | 版本只改 `version.json` | APK 命名 `jiannao-v{version}.apk`、应用名随其走；禁止在脚本 / 规则硬编码版本号 |
| RL-04 | Web 源码只在仓库根 | 改交互 / 样式 / 逻辑只动 `index.html` / `css/` / `js/`；新增游戏按 `window.Games` 注册约定 |
| RL-05 | 不引入 Web 依赖 | Web 层零运行时依赖、零打包器；新功能不加 npm 包、不加构建步骤 |
| RL-06 | 原生改动走补丁 / 配置 | `android/android/` 由 Capacitor 生成，持久改动经 `post-sync-patch.ps1` 或 `capacitor.config.ts`，勿直接长期手改 |
| RL-07 | 长辈 UI 不变式 | 大字号、竖屏、正向鼓励文案；禁用挫败性表达、小点按区、需要精准操作的交互 |

## 已知漂移（已推断，请确认后清理）

- `android/package.json` 残留「省心投 BI」描述与失效 `build` 脚本。
- `post-sync-patch.ps1` 残留「省心投 / shengxintou」字样与无效 SQLite DB 打包步骤；APK 命名 `shengxintou` 与 `jiannao` 冲突。
- `build-apk.ps1` 的 `JAVA_HOME` / `GRADLE_USER_HOME` 硬编码 `..\省心投BI\...`，换机需改。

## 通用工程纪律（兜底，非头条）

- 先读后写；模仿项目已有 vanilla JS（ES5 IIFE）模式；构建退出码 0 = 唯一判据；不越界顺手优化；commit 以 `git log -1` 确认。
- 涉及规则架构文件（AGENTS / CLAUDE / MEMORY）→ 三向字节一致并跑通 `check_rule_architecture.py`。
- 外部副作用（推送 / 删除 / 发布 / 改原生文件）→ 未经用户明确授权不执行。

## 红线触发模板

```
⛔ 触发红线 RL-XX：<标题>
当前情形：<具体说明>
建议处理：<回退到哪步 / 需要用户确认什么>
```
