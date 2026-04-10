#!/usr/bin/env pwsh
# Ralph Wiggum Loop — GitHub Copilot CLI + OpenSpec
#
# Vereisten:
#   winget install GitHub.Copilot
#   npm install -g @fission-ai/openspec@latest
#
# Gebruik:
#   .\loop.ps1          # onbeperkt (Ctrl+C om te stoppen)
#   .\loop.ps1 10       # max 10 iteraties

param([int]$MaxIterations = 0)

function Get-NextTask {
    $taskFiles = Get-ChildItem -Path "openspec/changes" -Filter "tasks.md" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\archive\\" }
    foreach ($file in $taskFiles) {
        $next = Get-Content $file.FullName | Where-Object { $_ -match '^\s*-\s+\[ \]' } | Select-Object -First 1
        if ($next) { return @{ Task = $next.Trim(); File = $file.FullName } }
    }
    return $null
}

function Get-PendingCount {
    $count = 0
    Get-ChildItem -Path "openspec/changes" -Filter "tasks.md" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\archive\\" } |
        ForEach-Object { $count += (Get-Content $_.FullName | Where-Object { $_ -match '^\s*-\s+\[ \]' }).Count }
    return $count
}

$branch = git branch --show-current 2>$null
$i = 0

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🐣 Ralph Wiggum Loop" -ForegroundColor Cyan
Write-Host "   Branch: $branch" -ForegroundColor Cyan
if ($MaxIterations -gt 0) { Write-Host "   Max: $MaxIterations iteraties" -ForegroundColor Cyan }
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (-not (Test-Path "openspec/changes")) {
    Write-Host "`n⚠️  Geen openspec map gevonden. Volg eerst Stap 1 in README.md." -ForegroundColor Yellow
    exit 1
}

while ($true) {
    if ($MaxIterations -gt 0 -and $i -ge $MaxIterations) {
        Write-Host "`n🏁 Max iteraties bereikt: $MaxIterations" -ForegroundColor Yellow; break
    }

    $next = Get-NextTask
    if (-not $next) {
        Write-Host "`n🎉 Alle taken klaar! Vergeet niet te archiveren." -ForegroundColor Green; break
    }

    $remaining = Get-PendingCount
    Write-Host "`n══════════ LOOP $($i+1)  ($remaining taken resterend) ══════════" -ForegroundColor Green
    Write-Host "📋 Volgende taak:" -ForegroundColor Cyan
    Write-Host "   $($next.Task)" -ForegroundColor White
    Write-Host ""

    copilot --experimental --agent ralph --prompt "implement the next task"

    Write-Host "`n📤 Pushen..." -ForegroundColor Cyan
    git push origin $branch 2>$null
    if ($LASTEXITCODE -ne 0) { git push -u origin $branch }

    $i++
    $remaining = Get-PendingCount
    if ($remaining -eq 0) {
        Write-Host "`n🎉 Alle taken klaar!" -ForegroundColor Green; break
    }
}

Write-Host "`n✅ Ralph loop klaar na $i iteratie(s)." -ForegroundColor Cyan
