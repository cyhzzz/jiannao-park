# 规则架构自检（Windows + PowerShell 默认入口）
# 用法：在仓库根执行  powershell -File scripts/pre-commit-check.ps1
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $root
try {
    python scripts/check_rule_architecture.py
    if ($LASTEXITCODE -ne 0) {
        Write-Error '规则架构校验未通过，请先修复规则文件后再提交（不要放宽校验）。'
        exit 1
    }
    Write-Host '规则架构自检通过。' -ForegroundColor Green
} finally {
    Pop-Location
}
