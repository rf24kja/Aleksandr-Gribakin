# Start Telegram bot in background (no console window)
# Uses Start-Process to detach from current session
$botPath = Join-Path $PSScriptRoot "telegram-bot.js"
$logPath = Join-Path $PSScriptRoot "bot.log"
$pidFile = Join-Path $PSScriptRoot "bot.pid"

# Kill any existing bot process
if (Test-Path $pidFile) {
  $oldPid = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
  if ($oldPid) {
    Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }
}

Write-Host "Starting Telegram bot..."
Write-Host "Log: $logPath"
Write-Host "PID: (see bot.log after START line)"

# Start process in hidden window - survives terminal close
$p = Start-Process -FilePath "node" -ArgumentList $botPath -WindowStyle Hidden -PassThru -WorkingDirectory $PSScriptRoot

# Write PID to a file for easy stopping later
$p.Id | Out-File -FilePath $pidFile -Force

Write-Host "Bot started with PID $($p.Id)"
Write-Host "Stop with: Stop-Process -Id $($p.Id)"
