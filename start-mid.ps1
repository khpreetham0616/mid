param()
$ErrorActionPreference = "SilentlyContinue"

$ESC = [char]27
$R  = "$ESC[31m"; $G  = "$ESC[32m"; $Y  = "$ESC[33m"; $C  = "$ESC[36m"
$B  = "$ESC[34m"; $M  = "$ESC[35m"; $D  = "$ESC[2m";  $BO = "$ESC[1m"; $RS = "$ESC[0m"

$ROOT     = $PSScriptRoot
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$PGBIN    = "C:\Program Files\PostgreSQL\17\bin"
$PGUSER   = "postgres"
$DBNAME   = "mid_db"
$LOGS     = Join-Path $BACKEND "logs"

$beLog    = "$LOGS\backend.log"
$feLog    = "$LOGS\frontend.log"

function Pad { Write-Host "" }

function Status($label, $msg, $colour) {
    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "  $D[$ts]$RS  $colour${BO}[ $label ]$RS  $msg"
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
    $escaped = $cmd -replace '"', '\"'
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
        Write-Host "  ${D}Stop : close backend + frontend windows, or kill ports 8080 3000$RS"
        Pad
    }
}

# ============================================================
#  BOOT
# ============================================================
Clear-Host
Pad
Write-Host "  $C$BO+--------------------------------------------------------------+$RS"
Write-Host "  $C$BO|                                                              |$RS"
Write-Host "  $C$BO|    ##   ##  ######  ######                                  |$RS"
Write-Host "  $C$BO|    ### ###    ##    ##   ##                                  |$RS"
Write-Host "  $C$BO|    ## # ##    ##    ##   ##                                  |$RS"
Write-Host "  $C$BO|    ##   ##    ##    ##   ##                                  |$RS"
Write-Host "  $C$BO|    ##   ##  ######  ######   Medical ID System               |$RS"
Write-Host "  $C$BO|                                                              |$RS"
Write-Host "  $C$BO|        Local Development Environment -- Launcher             |$RS"
Write-Host "  $C$BO+--------------------------------------------------------------+$RS"
Pad
Write-Host "  ${M}${BO}JARVIS online.$RS  All services will run in the background."
Pad
Start-Sleep -Milliseconds 600

# ---- 1. PostgreSQL ------------------------------------------
Status "BOOT" "Verifying ${C}PostgreSQL$RS service..." $Y

$pgService = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
if (-not $pgService) {
    $pgService = Get-Service | Where-Object { $_.Name -match "postgresql" } | Select-Object -First 1
}
if ($pgService -and $pgService.Status -ne "Running") {
    Status "PGQL" "Service stopped -- starting..." $Y
    Start-Service $pgService.Name -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

$pgUp = (Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded
if (-not $pgUp) {
    Status "PGQL" "${R}PostgreSQL not reachable on :5432. Start it and retry.$RS" $R
    Pad; exit 1
}
Status "PGQL" "${G}ONLINE$RS  --  localhost:5432" $G
Pad

# ---- 2. Resolve PG password ---------------------------------
Status "BOOT" "Resolving ${C}PostgreSQL$RS credentials..." $Y

function Test-PgPass($pwd) {
    $env:PGPASSWORD = $pwd
    $out = & "$PGBIN\psql.exe" -U $PGUSER -tc "SELECT 1;" 2>&1
    return ($out -match "1")
}

$PGPASS    = $null
$connected = $false

# Try password already saved in .env
$envFile = Join-Path $BACKEND ".env"
if (Test-Path $envFile) {
    $m = Select-String -Path $envFile -Pattern '^DB_PASSWORD=(.+)' | Select-Object -First 1
    if ($m) {
        $candidate = $m.Matches[0].Groups[1].Value.Trim()
        if (Test-PgPass $candidate) { $PGPASS = $candidate; $connected = $true }
    }
}

# Try common defaults
if (-not $connected) {
    foreach ($candidate in @("postgres", "admin", "password", "12345", "")) {
        if (Test-PgPass $candidate) { $PGPASS = $candidate; $connected = $true; break }
    }
}

# Interactive prompt
if (-not $connected) {
    Status "PGQL" "${Y}Cannot connect with common passwords -- please enter it.$RS" $Y
    $tries = 0
    while (-not $connected -and $tries -lt 3) {
        $tries++
        $sec   = Read-Host "  Password for PostgreSQL user '$PGUSER'" -AsSecureString
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                     [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
        if (Test-PgPass $plain) { $PGPASS = $plain; $connected = $true }
        else { Status "PGQL" "${R}Wrong password ($tries/3)$RS" $R }
    }
}

if (-not $connected) {
    Status "PGQL" "${R}Could not authenticate. Aborting.$RS" $R
    Pad; exit 1
}
Status "PGQL" "${G}Authenticated$RS  --  user: $PGUSER" $G
Pad

# ---- 3. Database --------------------------------------------
Status "BOOT" "Ensuring database ${C}$DBNAME$RS exists..." $Y
$env:PGPASSWORD = $PGPASS
$dbCheck = & "$PGBIN\psql.exe" -U $PGUSER -tc "SELECT 1 FROM pg_database WHERE datname='$DBNAME';" 2>&1
if ($dbCheck -match "1") {
    Status "PGQL" "${G}Database '$DBNAME' exists$RS" $G
} else {
    & "$PGBIN\psql.exe" -U $PGUSER -c "CREATE DATABASE $DBNAME;" 2>&1 | Out-Null
    Status "PGQL" "${G}Database '$DBNAME' created$RS" $G
}
Pad

# Write/update .env
$envExample = Join-Path $BACKEND ".env.example"
if (-not (Test-Path $envFile)) { Copy-Item $envExample $envFile }
$envContent = Get-Content $envFile
$envContent = $envContent -replace '^DB_PASSWORD=.*', "DB_PASSWORD=$PGPASS"
$envContent = $envContent -replace '^DB_USER=.*',     "DB_USER=$PGUSER"
$envContent = $envContent -replace '^DB_NAME=.*',     "DB_NAME=$DBNAME"
$envContent | Set-Content $envFile

# ---- 4. Redis -----------------------------------------------
$redisRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.ConnectAsync("127.0.0.1", 6379).Wait(600) | Out-Null
    $redisRunning = $tcp.Connected
    $tcp.Close()
} catch { }

if ($redisRunning) {
    Status "REDIS" "${G}Already running$RS  --  127.0.0.1:6379" $G
} else {
    # Native Windows executable
    $redisPaths = @(
        "C:\Program Files\Redis\redis-server.exe",
        "C:\Redis\redis-server.exe",
        "$env:LOCALAPPDATA\Redis\redis-server.exe",
        "C:\ProgramData\chocolatey\bin\redis-server.exe"
    )
    $redisExe = $null
    foreach ($p in $redisPaths) { if (Test-Path $p) { $redisExe = $p; break } }
    if (-not $redisExe) {
        $rc = Get-Command "redis-server" -ErrorAction SilentlyContinue
        if ($rc) { $redisExe = $rc.Source }
    }

    if ($redisExe) {
        Status "BOOT" "Starting ${C}Redis$RS (native)..." $Y
        Start-Process -FilePath $redisExe -WindowStyle Hidden
        $ok = WaitForPort 6379 "Redis" 15
        Write-Host ""
        if ($ok) { Status "REDIS" "${G}ONLINE$RS  --  127.0.0.1:6379" $G; $redisRunning = $true }
    } else {
        # WSL fallback
        $wslCmd = Get-Command "wsl" -ErrorAction SilentlyContinue
        if ($wslCmd) {
            $wslCheck = wsl -- which redis-server 2>&1
            if ($wslCheck -match "/redis-server") {
                Status "BOOT" "Starting ${C}Redis$RS via WSL..." $Y
                Start-Process wsl -ArgumentList "redis-server", "--daemonize", "yes", "--port", "6379", "--bind", "0.0.0.0" -WindowStyle Hidden
                $ok = WaitForPort 6379 "Redis" 20
                Write-Host ""
                if ($ok) {
                    Status "REDIS" "${G}ONLINE$RS  --  127.0.0.1:6379  (WSL)" $G
                    $redisRunning = $true
                } else {
                    # Try WSL IP in .env
                    $wslIp = (wsl -- hostname -I 2>&1).Trim().Split(" ")[0]
                    if ($wslIp -match '^\d+\.\d+\.\d+\.\d+$') {
                        $envContent = Get-Content $envFile
                        $envContent = $envContent -replace '^REDIS_ADDR=.*', "REDIS_ADDR=${wslIp}:6379"
                        $envContent | Set-Content $envFile
                        Status "REDIS" "${Y}Bound to WSL IP $wslIp:6379$RS" $Y
                        $redisRunning = $true
                    }
                }
            } else {
                Status "REDIS" "${Y}Not found in WSL -- run: wsl -- sudo apt-get install -y redis-server$RS" $Y
            }
        }
    }
}

if (-not $redisRunning) {
    Status "REDIS" "${Y}Unavailable -- backend runs without caching (non-fatal)$RS" $Y
}
Pad

# ---- 5. go mod tidy (once or when go.mod changes) -----------
$tidyMarker = Join-Path $ROOT ".mid_tidy"
$goMod      = Join-Path $BACKEND "go.mod"
$goModTime  = (Get-Item $goMod -ErrorAction SilentlyContinue).LastWriteTime.Ticks
$prevTidy   = if (Test-Path $tidyMarker) { Get-Content $tidyMarker } else { "0" }

if ($prevTidy -ne "$goModTime") {
    Status "BOOT" "Running ${C}go mod tidy$RS..." $Y
    Push-Location $BACKEND
    $tidyOut = go mod tidy 2>&1
    Pop-Location
    if ($LASTEXITCODE -eq 0) {
        "$goModTime" | Set-Content $tidyMarker
        Status "DEPS" "${G}Go dependencies resolved$RS" $G
    } else {
        Status "DEPS" "${R}go mod tidy failed -- $tidyOut$RS" $R
        Pad; exit 1
    }
} else {
    Status "DEPS" "${G}Go dependencies up to date$RS" $G
}
Pad

# ---- 6. npm install (once or when package.json changes) -----
$npmMarker  = Join-Path $ROOT ".mid_npm"
$pkgJson    = Join-Path $FRONTEND "package.json"
$pkgTime    = (Get-Item $pkgJson -ErrorAction SilentlyContinue).LastWriteTime.Ticks
$prevNpm    = if (Test-Path $npmMarker) { Get-Content $npmMarker } else { "0" }
$nodeModules = Join-Path $FRONTEND "node_modules"

if ($prevNpm -ne "$pkgTime" -or -not (Test-Path $nodeModules)) {
    Status "BOOT" "Running ${M}npm install$RS..." $Y
    Push-Location $FRONTEND
    npm install --legacy-peer-deps 2>&1 | Out-Null
    $npmExit = $LASTEXITCODE
    Pop-Location
    if ($npmExit -eq 0) {
        "$pkgTime" | Set-Content $npmMarker
        Status "DEPS" "${G}npm packages installed$RS" $G
    } else {
        Status "DEPS" "${R}npm install failed -- check frontend/package.json$RS" $R
        Pad; exit 1
    }
} else {
    Status "DEPS" "${G}npm packages up to date$RS" $G
}
Pad

# ---- 7. Backend ---------------------------------------------
Status "BOOT" "Starting ${B}Backend$RS in background (port 8080)..." $Y
$beCmd  = "Set-Location '$BACKEND'; `$env:PGPASSWORD='$PGPASS'; go run ./cmd/main.go *>> '$beLog'"
$beProc = StartHidden $beLog $beCmd

$ok = WaitForPort 8080 "Backend" 90
Write-Host ""
if ($ok) { Status "API"  "${G}ONLINE$RS  --  http://localhost:8080/api/v1  ${D}(PID $($beProc.Id))$RS" $G }
else      { Status "API"  "${Y}Still compiling... check logs\backend.log$RS" $Y }
Pad

# ---- 8. Seed data (once) ------------------------------------
$seedMarker = Join-Path $ROOT ".mid_seeded"
if (-not (Test-Path $seedMarker) -and $ok) {
    Status "BOOT" "Loading ${C}seed data$RS (doctors, hospitals, symptoms)..." $Y
    Push-Location $BACKEND
    $env:PGPASSWORD = $PGPASS
    $seedOut = go run ./cmd/seed/main.go 2>&1
    Pop-Location
    if ($LASTEXITCODE -eq 0) {
        New-Item -ItemType File -Path $seedMarker -Force | Out-Null
        Status "SEED" "${G}Seed data loaded$RS" $G
    } else {
        Status "SEED" "${Y}Non-fatal seed warning -- $seedOut$RS" $Y
    }
    Pad
}

# ---- 9. Frontend --------------------------------------------
Status "BOOT" "Starting ${M}Frontend$RS in background (React :3000)..." $Y
$feCmd  = "Set-Location '$FRONTEND'; npm start *>> '$feLog'"
$feProc = StartHidden $feLog $feCmd

$ok = WaitForPort 3000 "Frontend" 60
Write-Host ""
if ($ok) { Status "UI"   "${G}ONLINE$RS  --  http://localhost:3000  ${D}(PID $($feProc.Id))$RS" $G }
else      { Status "UI"   "${Y}Starting... check logs\frontend.log$RS" $Y }
Pad

# ---- Summary ------------------------------------------------
Write-Host "  $G${BO}+--------------------------------------------------+$RS"
Write-Host "  $G${BO}|   ALL SYSTEMS RUNNING                            |$RS"
Write-Host "  $G${BO}+--------------------------------------------------+$RS"
Pad
Write-Host "  ${G}${BO}  *  PostgreSQL$RS  localhost:5432  /  db: $DBNAME"
if ($redisRunning) {
    Write-Host "  ${G}${BO}  *  Redis$RS        127.0.0.1:6379"
} else {
    Write-Host "  ${Y}${BO}  *  Redis$RS        unavailable  (caching disabled)"
}
Write-Host "  ${B}${BO}  *  Backend$RS     http://localhost:8080/api/v1"
Write-Host "  ${M}${BO}  *  Frontend$RS    http://localhost:3000"
Pad
Write-Host "  ${C}${BO}JARVIS standing by. Showing live logs below...$RS"

# ---- Live tail ----------------------------------------------
TailLogs @(
    @{ Tag = "API"; File = $beLog; Color = [ConsoleColor]::Blue    }
    @{ Tag = "UI";  File = $feLog; Color = [ConsoleColor]::Magenta }
)
