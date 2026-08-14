# 测试与交付（testing-and-delivery）

## 现状：无自动化测试

Web 层是 vanilla JS，无单测框架、无 CI 测试环节。质量靠：① 规则架构自检；② 真机 / 模拟器手动验证。

## 构建即验证（红线 RL-01）

- 唯一判据：构建脚本退出码 0 = 通过；自修复上限 3 轮。
- 标准出包命令（Windows + PowerShell）：

```powershell
powershell -File android/scripts/build-apk.ps1
```

- 该脚本五步：① 复制根 Web 源→`www/`；② `cap sync android`；③ `post-sync-patch`；④ `gradlew assembleDebug`（设 `JAVA_HOME` / `GRADLE_USER_HOME`）；⑤ 复制产物到 `android/release/jiannao-v{version}.apk`。

## 手动验证清单（每次改动后）

- [ ] `python scripts/check_rule_architecture.py` 结果为 PASS（改了规则文件时必跑）。
- [ ] 出包成功：`android/release/jiannao-v{version}.apk` 存在且大小合理。
- [ ] 首页 5 个游戏卡片可进入、可选难度、可开始、可完成、弹窗正常。
- [ ] 最佳成绩（`localStorage`）在重开后保留。
- [ ] 真机竖屏、沉浸式全屏、图标为「健脑乐园」、应用名正确。

## 交付物

- APK 落盘：`android/release/jiannao-v{version}.apk`（命名随 `version.json`）。
- 不要把 `android/android/app/build/` 等构建中间产物当交付物。

## 提交前自查（红线）

- `git diff` 逐行确认：不提交调试代码、不手改 `www/`、不把版本号硬编码进脚本。
- 规则文件变更必须过自检；FAIL 先修规则，不删检查项。

## 已知环境绑定（已推断，请确认）

`build-apk.ps1` 中 `JAVA_HOME` 与 `GRADLE_USER_HOME` 指向 `..\省心投BI\...` 兄弟目录，强依赖特定机器布局，换机需改为本机实际路径或参数化。
