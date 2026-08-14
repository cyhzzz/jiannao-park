#!/usr/bin/env bash
# check_project_wiki_stale.sh —— 项目知识库（Spec）陈旧检测
# 来源：腾讯企微式「AI 项目 Spec 规则自动构建指令」阶段 1 自维护脚本
# 便携化说明：原版用 jq + bash 关联数组；本机 Git Bash 无 jq，且原生 Windows python
#   无法识别 Git Bash 的 POSIX 路径（/d/...），故改为：bash 仅解析 ROOT 并用 cygpath -w
#   转成 Windows 路径，sha256 计算 / JSON 读写 / 分诊全部交由一段内嵌 python 完成。
# 功能：
#   - 记录 Spec 知识库目录（默认 project_spec/）下每个 .md 文件的 SHA256 哈希
#   - 对比基线哈希，标出新增 / 删除 / 修改
#   - 输出三色分诊清单（新增 / 删除 / 大改）
#   - 可在 pre-commit hook 中调用（退出码 1 表示有变更需复核）
#
# 用法：
#   bash tools/check_project_wiki_stale.sh            # 检查并报告（不修改基线）
#   bash tools/check_project_wiki_stale.sh --update   # 用当前哈希刷新基线后退出
#
# 注意：本脚本只做"提示"，不直接阻塞提交；如需阻塞，pre-commit 中调用并判断退出码。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Spec 知识库目录：默认仓库根 project_spec/；若嵌套在 docs/rules/spec/ 则改此行。
WIKI_DIR="${ROOT}/project_spec"
# 基线文件：紧跟 Spec 目录，便于随知识库一起提交/评审。
STATE_FILE="${WIKI_DIR}/.wiki-baseline.json"

ROOT_WIN="$(cygpath -w "$ROOT")"
WIKI_WIN="$(cygpath -w "$WIKI_DIR")"
STATE_WIN="$(cygpath -w "$STATE_FILE")"
UPDATE_FLAG=""
[ "${1:-}" = "--update" ] && UPDATE_FLAG="--update"

python - "$ROOT_WIN" "$WIKI_WIN" "$STATE_WIN" "$UPDATE_FLAG" <<'PY'
import json, sys, os, hashlib

root = sys.argv[1]
wiki_dir = sys.argv[2]
state_file = sys.argv[3]
do_update = sys.argv[4] == "--update"

# 收集 Spec 目录下所有 .md 文件
targets = []
for dirpath, _, filenames in os.walk(wiki_dir):
    for fn in filenames:
        if fn.endswith(".md"):
            targets.append(os.path.join(dirpath, fn))
targets.sort()

current = {}
for f in targets:
    rel = os.path.relpath(f, root).replace("\\", "/")
    h = hashlib.sha256()
    with open(f, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    current[rel] = h.hexdigest()

# 读取基线（JSON）
base = {}
if os.path.isfile(state_file):
    try:
        with open(state_file, encoding="utf-8") as fh:
            d = json.load(fh)
        if isinstance(d, dict):
            base = d
    except Exception:
        base = {}

added = [k for k in current if k not in base]
removed = [k for k in base if k not in current]
modified = [k for k in current if k in base and base[k] != current[k]]

print("知识库陈旧分诊（新增 / 删除 / 大改）")
print("=====================================")
for k in added:
    print(f"[新增] {k}")
for k in removed:
    print(f"[删除] {k}")
for k in modified:
    print(f"[大改] {k}")
print("-------------------------------------")
print(f"新增={len(added)} 删除={len(removed)} 大改={len(modified)}")

if do_update:
    with open(state_file, "w", encoding="utf-8") as fh:
        json.dump(current, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print(f"[OK] 已更新基线哈希 -> {state_file}")
    sys.exit(0)

if added or removed or modified:
    sys.exit(1)
sys.exit(0)
PY
