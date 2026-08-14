# 生成 Android 应用图标 —— 委托给 Python Pillow（避免 System.Drawing 的 .flat/PNG 文件锁）
# 方案（无自适应 anydpi-v26，启动器直接用位图）：
#   ic_launcher.png        = 方形全幅（LOGO_square.png，启动器自行套 squircle 蒙版）
#   ic_launcher_round.png  = 圆形（LOGO_round.png，透明圆角）
#   ic_launcher_foreground = 透明前景（备用，若日后启用自适应图标）
# 具体像素逻辑见项目根 make_logo.py（生成 LOGO 三变体）+ make_mipmap_icons.py（铺到各 mipmap）

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # android/scripts → 仓库根（阿兹海默）

# 解析可用的 Python（优先托管 venv，含 Pillow）
$pyCandidates = @(
    "C:\Users\cyhzz\.workbuddy\binaries\python\envs\default\Scripts\python.exe",
    "python"
)
$python = $null
foreach ($p in $pyCandidates) {
    try { & $p -c "import PIL" 2>$null; if ($LASTEXITCODE -eq 0) { $python = $p; break } } catch { }
}
if (-not $python) { throw "未找到带 Pillow 的 Python，无法生成图标" }

$mipmapScript = Join-Path $projectRoot "make_mipmap_icons.py"
Write-Output "[info] generating icons via Python: $mipmapScript"
& $python $mipmapScript
if ($LASTEXITCODE -ne 0) { throw "make_mipmap_icons.py 失败 (exit $LASTEXITCODE)" }

# 清理旧的 drawable-v24/ic_launcher_foreground.xml（Capacitor 默认机器人 vector，会覆盖位图）
$resDir = Join-Path $PSScriptRoot "..\android\app\src\main\res"
$oldVectorPath = Join-Path $resDir "drawable-v24\ic_launcher_foreground.xml"
if (Test-Path $oldVectorPath) {
    Remove-Item $oldVectorPath -Force
    Write-Output "[clean] removed drawable-v24/ic_launcher_foreground.xml (default robot vector)"
}

Write-Output "[complete] icons regenerated via Python (square/round/foreground)"
