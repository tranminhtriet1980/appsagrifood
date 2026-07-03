# Build lại file APK Android cho Sagri Chấm công.
# Dùng: .\build-apk.ps1 -Url "https://ten-mien-cua-ban"
#   (bỏ -Url thì lấy URL đang cấu hình trong capacitor.config.ts)
param([string]$Url = $env:CAP_SERVER_URL)

$ErrorActionPreference = "Stop"

# --- Đường dẫn toolchain (chỉnh nếu bạn cài nơi khác) ---
$env:JAVA_HOME   = "C:\Users\EDUPATH\hrm-toolchain\jdk-extract\jdk-17.0.19+10"
$env:ANDROID_HOME = "C:\Users\EDUPATH\hrm-toolchain\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

if ($Url) {
  $env:CAP_SERVER_URL = $Url
  Write-Host "==> Server URL: $Url" -ForegroundColor Cyan
} else {
  Write-Host "==> Dùng URL mặc định trong capacitor.config.ts" -ForegroundColor Yellow
}

Write-Host "==> Đồng bộ cấu hình Capacitor..." -ForegroundColor Cyan
npx cap copy android

Write-Host "==> Build APK (Gradle)..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\android"
.\gradlew.bat assembleDebug --no-daemon
Set-Location $PSScriptRoot

New-Item -ItemType Directory -Force -Path "$PSScriptRoot\installer" | Out-Null
Copy-Item "$PSScriptRoot\android\app\build\outputs\apk\debug\app-debug.apk" `
          "$PSScriptRoot\installer\Sagri-ChamCong.apk" -Force

Write-Host "`n✔ XONG! File: installer\Sagri-ChamCong.apk" -ForegroundColor Green
