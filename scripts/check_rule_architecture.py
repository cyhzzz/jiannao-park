#!/usr/bin/env python3
'''Read-only checks for a repository's rule architecture (single-source-of-truth pattern).

通用规则架构契约（单一权威源）：
  * 根目录镜像文件（默认 AGENTS.md / CLAUDE.md / .workbuddy/memory/MEMORY.md）必须两两字节一致。
  * 根 AGENTS.md 是瘦导航锚点（<= max_lines 行 / <= max_bytes 字节），细节下沉到 docs/rules/*。
  * 便携式 Prompt（docs/**/*prompt*.md）覆盖多平台 / 多 agent / 安全迁移。
  * 规则自检接入 pre-commit（Windows + PowerShell 默认）、CI、PR 模板。
  * version.json 承载动态版本，规则文件不得硬编码版本或发布日期。
  * docs/rules/ 内所有链接可解析（仓库内相对路径存在）。

项目定制：在仓库根 scripts/rule-arch-manifest.json 中覆盖以下键（缺省值面向最常见的
「AGENTS + CLAUDE + MEMORY 三向镜像」模式）：
  mirrors, max_lines, max_bytes, required, root_references, coverage,
  prompt_markers, integrations, prompt_glob

默认开发环境：Windows + PowerShell（脚本本身跨平台，纯 Python 3，无第三方依赖）。
'''

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
CHECKER = Path(__file__).resolve()
MANIFEST = ROOT / 'scripts' / 'rule-arch-manifest.json'
AGENTS = ROOT / 'AGENTS.md'
VERSION_JSON = ROOT / 'version.json'

DEFAULTS: dict = {
    'mirrors': ['AGENTS.md', 'CLAUDE.md', '.workbuddy/memory/MEMORY.md'],
    'max_lines': 220,
    'max_bytes': 18_000,
    'required': [
        'version.json',
        'docs/rules/README.md',
        'docs/rules/overview.md',
        'scripts/pre-commit-check.ps1',
        '.github/workflows/ci.yml',
        '.github/PULL_REQUEST_TEMPLATE.md',
    ],
    'root_references': ['version.json', 'docs/rules/README.md', 'docs/rules/overview.md'],
    'coverage': {},  # "docs/rules/overview.md": ["marker1", "marker2"]
    'prompt_markers': [
        'Windows/PowerShell', '单一权威源', '非破坏迁移', '可重复执行',
        '未经用户明确授权', 'AGENTS.md', 'CLAUDE.md', 'Cursor', 'Trae', 'GitHub Copilot',
    ],
    'integrations': {
        'scripts/pre-commit-check.ps1': 'python scripts/check_rule_architecture.py',
        '.github/workflows/ci.yml': 'python scripts/check_rule_architecture.py',
        '.github/PULL_REQUEST_TEMPLATE.md': 'python scripts/check_rule_architecture.py',
    },
    'prompt_glob': 'docs/**/*prompt*.md',
}


def load_manifest() -> dict:
    cfg = dict(DEFAULTS)
    if MANIFEST.is_file():
        try:
            data = json.loads(MANIFEST.read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError) as exc:
            print(f'[WARN] cannot parse {MANIFEST.name}: {exc}; using defaults')
            return cfg
        for key in ('mirrors', 'required', 'root_references', 'prompt_markers'):
            if key in data and isinstance(data[key], list):
                cfg[key] = [str(x) for x in data[key]]
        if 'max_lines' in data:
            cfg['max_lines'] = int(data['max_lines'])
        if 'max_bytes' in data:
            cfg['max_bytes'] = int(data['max_bytes'])
        if 'coverage' in data and isinstance(data['coverage'], dict):
            cfg['coverage'] = {str(k): [str(m) for m in v] for k, v in data['coverage'].items()}
        if 'integrations' in data and isinstance(data['integrations'], dict):
            cfg['integrations'] = {str(k): str(v) for k, v in data['integrations'].items()}
        if 'prompt_glob' in data:
            cfg['prompt_glob'] = str(data['prompt_glob'])
    return cfg


CFG = load_manifest()
MIRRORS = [ROOT / m for m in CFG['mirrors']]
MAX_LINES = CFG['max_lines']
MAX_BYTES = CFG['max_bytes']
REQUIRED = [ROOT / r for r in CFG['required']]
ROOT_REFERENCES = CFG['root_references']
COVERAGE = {ROOT / k: list(v) for k, v in CFG['coverage'].items()}
PROMPT_MARKERS = CFG['prompt_markers']
INTEGRATIONS = {ROOT / k: v for k, v in CFG['integrations'].items()}
PROMPT_GLOB = CFG['prompt_glob']
RULES = ROOT / 'docs' / 'rules'

HISTORY_RE = re.compile(
    r'^#{1,6}\s+(?:v?\d+\.\d+\.\d+\b.*|.*(?:版本历史|已落地).*)$',
    re.MULTILINE | re.IGNORECASE,
)
LINK_RE = re.compile(r'(?<!!)\[[^\]]+\]\(([^)]+)\)')


def relative(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def read_text(path: Path, errors: list[str]) -> str:
    try:
        raw = path.read_bytes()
    except OSError as exc:
        errors.append(f'cannot read {relative(path)}: {exc}')
        return ''
    if raw.startswith(b'\xef\xbb\xbf'):
        errors.append(f'UTF-8 BOM found: {relative(path)}')
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError as exc:
        errors.append(f'invalid UTF-8 in {relative(path)}: {exc}')
        return ''


def find_prompt_file() -> Path | None:
    for p in ROOT.glob(PROMPT_GLOB):
        return p
    for p in ROOT.glob('docs/**/*.md'):
        if 'prompt' in p.name.lower():
            return p
    return None


def check_files_and_root(passes: list[str], errors: list[str]) -> None:
    required_all = list(REQUIRED) + list(MIRRORS) + [CHECKER, VERSION_JSON]
    seen: set[Path] = set()
    req: list[Path] = []
    for p in required_all:
        rp = p.resolve()
        if rp not in seen:
            seen.add(rp)
            req.append(p)
    missing = sorted({relative(p) for p in req if not p.is_file()})
    if missing:
        errors.append('missing required files: ' + ', '.join(missing))
    else:
        passes.append(f'required files present ({len(req)})')

    if all(m.is_file() for m in MIRRORS):
        first = MIRRORS[0].read_bytes()
        bad = [relative(m) for m in MIRRORS if m.read_bytes() != first]
        if bad:
            errors.append('mirror files differ: ' + ', '.join(bad))
        else:
            digest = hashlib.sha256(first).hexdigest()
            passes.append(f'root mirrors match ({digest[:12]}...)')
    else:
        missing_mirrors = [relative(m) for m in MIRRORS if not m.is_file()]
        errors.append('some mirror files missing: ' + ', '.join(missing_mirrors))

    if not AGENTS.is_file():
        errors.append('AGENTS.md missing')
        return
    text = read_text(AGENTS, errors)
    if not text:
        return
    line_count = len(text.splitlines())
    byte_count = len(text.encode('utf-8'))
    if line_count > MAX_LINES:
        errors.append(f'AGENTS.md has {line_count} lines; limit is {MAX_LINES}')
    else:
        passes.append(f'root rule lines controlled ({line_count}/{MAX_LINES})')
    if byte_count > MAX_BYTES:
        errors.append(f'AGENTS.md has {byte_count} bytes; limit is {MAX_BYTES}')
    else:
        passes.append(f'root rule bytes controlled ({byte_count}/{MAX_BYTES})')

    missing_refs = [item for item in ROOT_REFERENCES if item not in text]
    if missing_refs:
        errors.append('root rule missing references: ' + ', '.join(missing_refs))
    else:
        passes.append('root rule navigation is complete')
    if HISTORY_RE.search(text):
        errors.append('version history heading found in root rule')
    else:
        passes.append('root rule has no version history headings')

    check_version_not_hardcoded(text, passes, errors)


def check_version_not_hardcoded(text: str, passes: list[str], errors: list[str]) -> None:
    try:
        data = json.loads(VERSION_JSON.read_text(encoding='utf-8'))
        version = str(data['version'])
        release_date = str(data.get('release_date') or '')
        version_re = re.compile(rf'(?<![\d.])v?{re.escape(version)}(?![\d.])')
        if version_re.search(text) or (release_date and release_date in text):
            errors.append('root rule hard-codes the current version or release date')
        else:
            passes.append('root rule does not copy dynamic version data')
    except (OSError, json.JSONDecodeError, KeyError) as exc:
        errors.append(f'cannot read version.json: {exc}')


def check_links(passes: list[str], errors: list[str]) -> None:
    broken: list[str] = []
    checked = 0
    markdown_files = sorted(RULES.rglob('*.md'))
    if AGENTS.is_file():
        markdown_files.append(AGENTS)
    for markdown in markdown_files:
        text = read_text(markdown, errors)
        for match in LINK_RE.finditer(text):
            target = match.group(1).strip()
            if not target or target.startswith(('#', 'http://', 'https://', 'mailto:')):
                continue
            target = unquote(target.split('#', 1)[0])
            resolved = (markdown.parent / target).resolve()
            try:
                resolved.relative_to(ROOT.resolve())
            except ValueError:
                broken.append(f'{relative(markdown)} -> {target} (outside repo)')
                continue
            checked += 1
            if not resolved.exists():
                broken.append(f'{relative(markdown)} -> {target}')
    if broken:
        errors.append('broken rule links: ' + '; '.join(broken))
    else:
        passes.append(f'rule links valid ({checked} checked)')


def check_content(passes: list[str], errors: list[str]) -> None:
    missing: list[str] = []
    for path, markers in COVERAGE.items():
        text = read_text(path, errors)
        missing.extend(
            f'{relative(path)} missing {marker}' for marker in markers if marker not in text
        )
    if missing:
        errors.append('rule migration coverage incomplete: ' + '; '.join(missing))
    elif COVERAGE:
        passes.append('critical rules migrated to topic files')

    prompt_path = find_prompt_file()
    if not prompt_path:
        errors.append(f'portable prompt missing (expected {PROMPT_GLOB})')
    else:
        prompt_text = read_text(prompt_path, errors)
        prompt_missing = [m for m in PROMPT_MARKERS if m not in prompt_text]
        if prompt_missing:
            errors.append(
                f'{relative(prompt_path)} missing markers: ' + ', '.join(prompt_missing)
            )
        else:
            passes.append('portable prompt covers platforms, agents, and safe migration')

    integration_missing = []
    for path, marker in INTEGRATIONS.items():
        if marker not in read_text(path, errors):
            integration_missing.append(f'{relative(path)} missing {marker}')
    if integration_missing:
        errors.append('rule checks not fully integrated: ' + '; '.join(integration_missing))
    else:
        passes.append('rule checks integrated into pre-commit, CI, and PR')

    try:
        current_version = str(json.loads(VERSION_JSON.read_text(encoding='utf-8'))['version'])
        version_re = re.compile(rf'(?<![\d.])v?{re.escape(current_version)}(?![\d.])')
    except (OSError, json.JSONDecodeError, KeyError):
        version_re = None
    history_files: list[str] = []
    dynamic_version_files: list[str] = []
    for markdown in sorted(RULES.rglob('*.md')):
        text = read_text(markdown, errors)
        if HISTORY_RE.search(text):
            history_files.append(relative(markdown))
        if version_re and version_re.search(text):
            dynamic_version_files.append(relative(markdown))
    if history_files:
        errors.append('version history headings found in: ' + ', '.join(history_files))
    else:
        passes.append('topic rules have no version history headings')
    if dynamic_version_files:
        errors.append('current version copied into topic rules: ' + ', '.join(dynamic_version_files))
    else:
        passes.append('topic rules do not copy the current version')


def main() -> int:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    passes: list[str] = []
    errors: list[str] = []
    check_files_and_root(passes, errors)
    check_links(passes, errors)
    check_content(passes, errors)

    print('Project rule architecture check')
    print('=' * 38)
    for message in passes:
        print(f'[PASS] {message}')
    for message in errors:
        print(f'[FAIL] {message}')
    result_label = 'FAIL' if errors else 'PASS'
    print(f'\nResult: {result_label}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
