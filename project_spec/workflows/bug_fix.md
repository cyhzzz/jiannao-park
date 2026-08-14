# Bug 修复流程（bug_fix）

先复现，再定位，最小改动，验证闭环。

## 1. 复现与描述

记录复现步骤、设备 / 系统、期望与实际；区分 Web 逻辑问题还是打包 / 原生问题。

## 2. 定位

- Web 逻辑：根 `js/`（尤其 `js/app.js` 与对应游戏），**不要在 `www/` 调试**。
- 打包 / 原生：`build-apk.ps1` 与 `post-sync-patch.ps1` 日志；原生改由补丁脚本承载。
- 持久化：`localStorage` 键 `best_${name}_${diff}`。

## 3. 最小改动

只改致缺陷代码；先读后写；模仿已有；保持补丁脚本幂等。

## 4. 验证

出包 + 真机复现确认消失且无回归；规则改动过 `check_rule_architecture.py`。

## 5. 沉淀

`tech_spec_template.md` §5 记 `BUG-N`；若暴露规则盲区，补 `docs/rules/*` 并同步根镜像。
