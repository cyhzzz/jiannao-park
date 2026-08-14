# 缺陷修复工作流（bugfix）

> 先复现，再定位，最小改动，验证闭环。

## 1. 复现与描述

- 记录复现步骤、设备 / 系统、期望与实际表现。
- 区分：是 Web 逻辑问题，还是打包 / 原生 / 图标问题。

## 2. 定位

- Web 逻辑：在根 `js/`（尤其 `js/app.js` 与对应 `js/games/*.js`）用日志 / 断点定位；**不要在 `www/` 里调试**（生成产物）。
- 打包 / 原生：`build-apk.ps1` 与 `post-sync-patch.ps1` 的日志；原生文件改由补丁脚本承载，不直接手改。
- 成绩 / 持久化：`localStorage` 键（`best_${name}_${diff}`）。

## 3. 最小改动

- 只改导致缺陷的代码，不顺手重构。
- 先读后写；模仿项目已有模式。
- 若修复需要改 `post-sync-patch.ps1`，保持其幂等（重复运行结果一致）。

## 4. 验证

- 出包：`powershell -File android/scripts/build-apk.ps1`。
- 真机 / 模拟器复现原步骤，确认缺陷消失且无回归（尤其其他 4 个游戏、最佳成绩、弹窗文案）。
- 规则文件有改动须过 `python scripts/check_rule_architecture.py`。

## 5. 沉淀

- 在 [`tech-spec.md`](../templates/tech-spec.md) §5 记 `BUG-N` 行（日期 / 描述 / Commit）。
- 若该缺陷揭示规则盲区，补充 `docs/rules/*` 并同步根镜像。
