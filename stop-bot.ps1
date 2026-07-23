# Stop Telegram bot by PID file or by process name
$pidFilePath = Join-Path $PSScriptRoot "bot.pid"
$stopped = $false

# Try PID file first
if (Test-Path $pidFilePath) {
    $pidStr = Get-Content $pidFilePath -Raw -ErrorAction SilentlyContinue
    if ($pidStr -and $pidStr -match '\d+') {
        $pidVal = [int]$pidStr
        try {
            $p = Get-Process -Id $pidVal -ErrorAction Stop
            if ($p.ProcessName -eq 'node') {
                Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped bot (PID $pidVal)"
                $stopped = $true
            }
        } catch { }
    }
    Remove-Item $pidFilePath -Force -ErrorAction SilentlyContinue
}

# Fallback: kill any node process running telegram-bot.js
if (-not $stopped) {
    $procs = Get-Process -Name 'node' -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
        try {
            $cmd = Get-CimInstance Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction SilentlyContinue
            if ($cmd -and $cmd.CommandLine -like '*telegram-bot*') {
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped bot (PID $($p.Id))"
                $stopped = $true
            }
        } catch { }
    }
}

if (-not $stopped) {
    Write-Host "No running bot instance found."
}
