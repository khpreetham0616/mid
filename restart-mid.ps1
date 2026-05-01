param()
$ErrorActionPreference = "SilentlyContinue"

$ESC = [char]27
$R  = "$ESC[31m"; $G  = "$ESC[32m"; $Y  = "$ESC[33m"; $C  = "$ESC[36m"
$B  = "$ESC[34m"; $M  = "$ESC[35m"; $D  = "$ESC[2m";  $BO = "$ESC[1m"; $RS = "$ESC[0m"

$ROOT     = $PSScriptRoot
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$LOGS     = Join-Path $BACKEND "logs"
$beLog    = "$LOGS\backend.log"
$feLog    = "$LOGS\frontend.log"

# Load DB password from .env if present
$PGPASS = "postgres"
$envFile = Join-Path $BACKEND ".env"
if (Test-Path $envFile) {
    $m = Select-String -Path $envFile -Pattern '^DB_PASSWORD=(.+)' | Select-Object -First 1
    if ($m) { $PGPASS = $m.Matches[0].Groups[1].Value.Trim() }
}

function Pad { Write-Host "" }

function Status($label, $msg, $colour) {
    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "  $D[$ts]$RS  $colour${BO}[ $label ]$RS  $msg"
}

function Kill-Port($port) {
    $pids = @()
    $lines = netstat -ano 2>$null | Select-String ":$port\s"
    foreach ($line in $lines) {
        if ($line -match '\s+(\d+)$') {
            $p = [int]$Matches[1]
            if ($p -gt 0 -and $pids -notcontains $p) { $pids += $p }
        }
    }
    foreach ($p in $pids) {
        taskkill /PID $p /F 2>$null | Out-Null
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    return $pids.Count
}

function WaitForPortClosed($port, $timeoutSec = 10) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        $inUse = netstat -ano 2>$null | Select-String ":$port\s"
        if (-not $inUse) { return $true }
        Start-Sleep -Milliseconds 400
    }
    return $false
}

function WaitForPort($port, $label, $timeoutSec = 90) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.ConnectAsync("127.0.0.1", $port).Wait(400) | Out-Null
            if ($tcp.Connected) { $tcp.Close(); return $true }
            $tcp.Close()
        } catch { }
        $ts = (Get-Date).ToString("HH:mm:ss")
        Write-Host -NoNewline "`r  $D[$ts]$RS  ${Y}${BO}[ WAIT ]$RS  Waiting for ${C}$label$RS on :$port ...   "
        Start-Sleep -Milliseconds 600
    }
    return $false
}

function StartHidden($logFile, [string]$cmd) {
    $null = New-Item -ItemType Directory -Force -Path $LOGS
    Clear-Content $logFile -ErrorAction SilentlyContinue
    $escaped = $cmd -replace '"', '\\"'
    $proc = Start-Process powershell.exe `
        -ArgumentList "-ExecutionPolicy Bypass -NoProfile -Command `"$escaped`"" `
        -WindowStyle Hidden -PassThru
    return $proc
}

function TailLogs($logEntries) {
    Pad
    Write-Host "  ${D}-- Live logs  |  Ctrl+C stops tail, services keep running --$RS"
    Pad
    $positions = @{}
    foreach ($e in $logEntries) { $positions[$e.Tag] = 0 }
    try {
        while ($true) {
            foreach ($e in $logEntries) {
                if (-not (Test-Path $e.File)) { continue }
                try {
                    $stream  = [System.IO.File]::Open($e.File, 'Open', 'Read', 'ReadWrite')
                    $stream.Seek($positions[$e.Tag], 'Begin') | Out-Null
                    $reader  = New-Object System.IO.StreamReader($stream)
                    $newText = $reader.ReadToEnd()
                    $positions[$e.Tag] = $stream.Position
                    $reader.Close(); $stream.Close()
                    if ($newText.Trim()) {
                        foreach ($line in ($newText -split "`r?`n")) {
                            if ($line.Trim()) {
                                $ts = (Get-Date).ToString("HH:mm:ss")
                                Write-Host -NoNewline "  $D[$ts]$RS  "
                                Write-Host -NoNewline "[$($e.Tag)]" -ForegroundColor $e.Color
                                Write-Host "  $line"
                            }
                        }
                    }
                } catch { }
            }
            Start-Sleep -Milliseconds 300
        }
    } catch {
        # Ctrl+C
    } finally {
        Pad
        Write-Host "  ${Y}Log tail stopped. Services are still running.$RS"
        Write-Host "  ${D}Logs : $LOGS$RS"
        Pad
    }
}

# ============================================================
#  RESTART
# ============================================================
Clear-Host
Pad
Write-Host "  $C$BO+--------------------------------------------------------------+$RS"
Write-Host "  $C$BO|    ##   ##  ######  ######   Medical ID System               |$RS"
Write-Host "  $C$BO|    ##   ##  ######  ######   RESTART                         |$RS"
Write-Host "  $C$BO+--------------------------------------------------------------+$RS"
Pad

# ---- 1. Kill Backend (8080) ---------------------------------
Status "KILL" "Stopping backend on port ${C}8080$RS..." $Y
$killed = Kill-Port 8080
if ($killed -gt 0) {
    $closed = WaitForPortClosed 8080 10
    if ($closed) {
        Status "KILL" "${G}Backend stopped$RS  ($killed process(es) killed)" $G
    } else {
        Status "KILL" "${R}Port 8080 still in use after kill — trying again...$RS" $R
        Kill-Port 8080
        Start-Sleep -Seconds 2
    }
} else {
    Status "KILL" "${D}No backend process found on :8080$RS" $D
}

# ---- 2. Kill Frontend (3000) --------------------------------
Status "KILL" "Stopping frontend on port ${M}3000$RS..." $Y
$killed = Kill-Port 3000
if ($killed -gt 0) {
    WaitForPortClosed 3000 8 | Out-Null
    Status "KILL" "${G}Frontend stopped$RS  ($killed process(es) killed)" $G
} else {
    Status "KILL" "${D}No frontend process found on :3000$RS" $D
}
Pad

# ---- 3. Verify PostgreSQL still up --------------------------
$pgUp = (Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded
if (-not $pgUp) {
    # Try to start it
    $pgService = Get-Service | Where-Object { $_.Name -match "postgresql" } | Select-Object -First 1
    if ($pgService) {
        Start-Service $pgService.Name -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        $pgUp = (Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded
    }
}
if ($pgUp) {
    Status "PGQL" "${G}ONLINE$RS  --  localhost:5432" $G
} else {
    Status "PGQL" "${R}PostgreSQL not reachable! Run start-mid.bat first.$RS" $R
    Pad; exit 1
}
Pad

# ---- 4. Restart Backend -------------------------------------
Status "BOOT" "Starting ${B}Backend$RS (port 8080)..." $Y
$beCmd  = "Set-Location '$BACKEND'; `$env:PGPASSWORD='$PGPASS'; `$env:GOMODCACHE='$env:USERPROFILE\go\pkg\mod'; `$env:GOSUMDB='off'; go run ./cmd/main.go *>> '$beLog'"
$beProc = StartHidden $beLog $beCmd

$ok = WaitForPort 8080 "Backend" 90
Write-Host ""
if ($ok) {
    Status "API" "${G}ONLINE$RS  --  http://localhost:8080/api/v1  ${D}(PID $($beProc.Id))$RS" $G
} else {
    Status "API" "${R}Backend failed to start -- check logs\backend.log$RS" $R
    Pad; exit 1
}
Pad

# ---- 5. Restart Frontend ------------------------------------
Status "BOOT" "Starting ${M}Frontend$RS (port 3000)..." $Y
$feCmd  = "Set-Location '$FRONTEND'; npm start *>> '$feLog'"
$feProc = StartHidden $feLog $feCmd

$ok = WaitForPort 3000 "Frontend" 60
Write-Host ""
if ($ok) {
    Status "UI" "${G}ONLINE$RS  --  http://localhost:3000  ${D}(PID $($feProc.Id))$RS" $G
} else {
    Status "UI" "${Y}Still starting... check logs\frontend.log$RS" $Y
}
Pad

# ---- Summary ------------------------------------------------
Write-Host "  $G${BO}+--------------------------------------------------+$RS"
Write-Host "  $G${BO}|   RESTART COMPLETE                               |$RS"
Write-Host "  $G${BO}+--------------------------------------------------+$RS"
Pad
Write-Host "  ${B}${BO}  *  Backend$RS     http://localhost:8080/api/v1"
Write-Host "  ${M}${BO}  *  Frontend$RS    http://localhost:3000"
Pad
Write-Host "  ${C}${BO}Showing live logs below...$RS"

TailLogs @(
    @{ Tag = "API"; File = $beLog; Color = [ConsoleColor]::Blue    }
    @{ Tag = "UI";  File = $feLog; Color = [ConsoleColor]::Magenta }
)
