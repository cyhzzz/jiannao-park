<#
.SYNOPSIS
  健脑乐园 Android APK 一键编译脚本

.DESCRIPTION
  流程：
    1. 复制 Web 源（index.html/css/js）到 www/
    2. cap sync android（把 www 同步进 APK assets）
    3. post-sync-patch（竖屏/全屏/图标/中文名/镜像源/Java17）
    4. gradlew assembleDebug
        - JAVA_HOME 指向 省心投BI/tools/jdk17
        - GRADLE_USER_HOME 指向 省心投BI/android/gradle-home（复用已缓存的 gradle）
    5. 复制产物到 release/ 并重命名为 jiannao-v{version}.apk
#>
$ErrorActionPreference = 'Stop'

$repoRoot      = Resolve-Path "$PSScriptRoot\..\.."
$androidRoot   = Join-Path $repoRoot 'android'
$gradleRoot    = Join-Path $androidRoot 'android'
$apkSrcDir     = Join-Path $gradleRoot 'app\build\outputs\apk\debug'
$releaseDir    = Join-Path $androidRoot 'release'
$jdkPath       = Join-Path $repoRoot '..\省心投BI\tools\jdk17'
$gradleHome    = Join-Path $repoRoot '..\省心投BI\android\gradle-home'
$webSrcDir     = $repoRoot

Write-Host '[1/5] 复制 Web 源到 www ...' -ForegroundColor Cyan
$wwwDir = Join-Path $repoRoot 'www'
if (-not (Test-Path $wwwDir)) { New-Item -ItemType Directory -Path $wwwDir | Out-Null }
Copy-Item "$webSrcDir\index.html" $wwwDir -Force
Copy-Item "$webSrcDir\css"        $wwwDir -Recurse -Force
Copy-Item "$webSrcDir\js"         $wwwDir -Recurse -Force
Write-Host "  www/ 已更新" -ForegroundColor Green

Write-Host '[2/5] cap sync android ...' -ForegroundColor Cyan
Push-Location $androidRoot
try {
    npx cap sync android
    if ($LASTEXITCODE -ne 0) { throw "cap sync 失败" }
} finally { Pop-Location }

Write-Host '[3/5] post-sync-patch ...' -ForegroundColor Cyan
Push-Location $androidRoot
try {
    npm run post-sync-patch
    if ($LASTEXITCODE -ne 0) { throw "post-sync-patch 失败" }
} finally { Pop-Location }

Write-Host '[4/5] gradlew assembleDebug ...' -ForegroundColor Cyan
if (-not (Test-Path $jdkPath)) { throw "JDK17 未找到：$jdkPath" }
$env:JAVA_HOME = $jdkPath
$env:GRADLE_USER_HOME = $gradleHome
Write-Host "  JAVA_HOME=$jdkPath" -ForegroundColor DarkGray
Write-Host "  GRADLE_USER_HOME=$gradleHome" -ForegroundColor DarkGray
Push-Location $gradleRoot
try {
    # PowerShell 5.1 会把 gradlew 的 stderr 输出（如 javac 提示）当致命错误中断，
    # 故临时关闭 ErrorActionPreference，只靠退出码判断成败
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & .\gradlew.bat assembleDebug
    $ec = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP
    if ($ec -ne 0) { throw "gradlew assembleDebug 失败 (exit $ec)" }
} finally { Pop-Location }

Write-Host '[5/5] 复制产物到 release ...' -ForegroundColor Cyan
$versionJson = Get-Content (Join-Path $repoRoot 'version.json') -Raw | ConvertFrom-Json
$version = $versionJson.version
$apkName = "jiannao-v$version.apk"
$apkSrc = Join-Path $apkSrcDir $apkName
if (-not (Test-Path $apkSrc)) {
    $apkSrc = (Get-ChildItem -Path $apkSrcDir -Filter '*.apk' | Select-Object -First 1).FullName
    if (-not $apkSrc) { throw "未找到编译产物 APK" }
}
if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir | Out-Null }
$apkDst = Join-Path $releaseDir "jiannao-v$version.apk"
Copy-Item -Path $apkSrc -Destination $apkDst -Force
$size = (Get-Item $apkDst).Length / 1MB

Write-Host ''
Write-Host 'BUILD SUCCESS' -ForegroundColor Green
Write-Host "  产物: $apkDst"
Write-Host "  大小: $([math]::Round($size, 2)) MB"
Write-Host "  版本: v$version"
