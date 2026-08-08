# run.ps1
# Automated local build and start script for Freelance Platform (Java + Thymeleaf + MongoDB)

$MavenVersion = "3.9.6"
$MavenDir = Join-Path $PSScriptRoot ".maven"
$MavenZip = Join-Path $PSScriptRoot "apache-maven-$MavenVersion-bin.zip"
$MavenHome = Join-Path $MavenDir "apache-maven-$MavenVersion"
$MvnPath = Join-Path $MavenHome "bin\mvn.cmd"
$JavaHome = "C:\Program Files\Java\jdk-26.0.1"

# Verify JDK path exists
if (-not (Test-Path $JavaHome)) {
    Write-Host "[WARNING] JDK 26.0.1 not found at default path '$JavaHome'." -ForegroundColor Yellow
    # Look for any JDK in Program Files
    $alternatives = Get-ChildItem -Path "C:\Program Files\Java" -Filter "jdk-*" -Directory -ErrorAction SilentlyContinue
    if ($alternatives) {
        $JavaHome = $alternatives[0].FullName
        Write-Host "[INFO] Using alternative JDK path: '$JavaHome'" -ForegroundColor Cyan
    } else {
        Write-Host "[ERROR] No JDK found under C:\Program Files\Java. Please verify installation." -ForegroundColor Red
        exit 1
    }
}

# Ensure Maven is downloaded locally
if (-not (Test-Path $MvnPath)) {
    Write-Host "Maven not found. Downloading Apache Maven $MavenVersion..." -ForegroundColor Cyan
    if (-not (Test-Path $MavenDir)) {
        New-Item -ItemType Directory -Path $MavenDir | Out-Null
    }
    $Url = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
    Write-Host "Downloading from $Url ..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $Url -OutFile $MavenZip
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $MavenZip -DestinationPath $MavenDir -Force
    Remove-Item -Path $MavenZip -Force
    Write-Host "Maven downloaded and extracted successfully." -ForegroundColor Green
}

# Run Maven command
$argsStr = $args -join " "
if ($argsStr -eq "") {
    $argsStr = "spring-boot:run"
}

# Free port 8080 if occupied when launching Spring Boot
if ($argsStr -like "*spring-boot:run*") {
    $occupied = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidToKill in $occupied) {
        if ($pidToKill -gt 0) {
            Write-Host "Freeing occupied port 8080 (PID: $pidToKill)..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
}

# Configure environment variables for this process
$env:JAVA_HOME = $JavaHome
$env:PATH = "$JavaHome\bin;" + $env:PATH

Write-Host "Starting Maven with JDK: $JavaHome" -ForegroundColor Green
Write-Host "Command: mvn $argsStr" -ForegroundColor Yellow

# Execute
& $MvnPath $argsStr.Split(" ")
