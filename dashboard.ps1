<#
.SYNOPSIS
    Phase B Dashboard - Live visual status of all tasks
.DESCRIPTION
    Shows task progress across all epics with visual indicators
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "e9f51260-db58-4e17-b0a8-7ad898206bf5",

    [Parameter(Mandatory=$false)]
    [string]$ApiBase = "http://127.0.0.1:63846/api",

    [Parameter(Mandatory=$false)]
    [switch]$Watch,

    [Parameter(Mandatory=$false)]
    [int]$RefreshSeconds = 30
)

function Get-Tasks {
    try {
        $response = Invoke-RestMethod -Uri "$ApiBase/tasks?project_id=$ProjectId" -Method GET
        return $response
    } catch {
        return @()
    }
}

function Show-ProgressBar {
    param(
        [int]$Done,
        [int]$Total,
        [int]$Width = 20
    )

    if ($Total -eq 0) { return "[" + ("-" * $Width) + "]" }

    $filled = [Math]::Floor(($Done / $Total) * $Width)
    $empty = $Width - $filled

    $bar = "[" + ("=" * $filled) + ("-" * $empty) + "]"
    return $bar
}

function Show-Dashboard {
    Clear-Host

    $tasks = Get-Tasks

    if ($tasks.Count -eq 0) {
        Write-Host "No tasks found or API unavailable" -ForegroundColor Red
        return
    }

    # Header
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║           HOLBAZA PHASE B - TASK DASHBOARD                   ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # Overall stats
    $todo = ($tasks | Where-Object { $_.status -eq "todo" }).Count
    $inProgress = ($tasks | Where-Object { $_.status -eq "in_progress" }).Count
    $review = ($tasks | Where-Object { $_.status -eq "review" }).Count
    $done = ($tasks | Where-Object { $_.status -eq "done" }).Count
    $total = $tasks.Count

    $progressBar = Show-ProgressBar -Done $done -Total $total -Width 30
    $percent = if ($total -gt 0) { [Math]::Round(($done / $total) * 100) } else { 0 }

    Write-Host "  OVERALL PROGRESS: $progressBar $percent% ($done/$total)" -ForegroundColor White
    Write-Host ""
    Write-Host "  [ ] Todo: $todo   [~] In Progress: $inProgress   [?] Review: $review   [x] Done: $done" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ─────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    # Group by epic
    $epics = @{
        "BRIDGE" = @{ name = "V4B Bridging"; color = "Magenta"; order = 1 }
        "DESIGN" = @{ name = "Design System"; color = "Cyan"; order = 2 }
        "TASK-PB-DB" = @{ name = "Database"; color = "Blue"; order = 3 }
        "TASK-PB-OPT" = @{ name = "Optimization"; color = "Green"; order = 4 }
        "TASK-PB-RT" = @{ name = "Real-Time"; color = "Yellow"; order = 5 }
        "TASK-PB-VAPI" = @{ name = "VAPI Voice"; color = "Red"; order = 6 }
        "TASK-PB-API" = @{ name = "Logistics APIs"; color = "DarkCyan"; order = 7 }
        "TASK-PB-MOB" = @{ name = "Mobile Apps"; color = "DarkGreen"; order = 8 }
        "TASK-PB-DASH" = @{ name = "Dashboard"; color = "DarkYellow"; order = 9 }
        "TASK-PB-FIN" = @{ name = "Financial"; color = "DarkMagenta"; order = 10 }
        "TASK-PB-CHARTER" = @{ name = "Charter"; color = "DarkBlue"; order = 11 }
        "TASK-PB-TEST" = @{ name = "Testing"; color = "Gray"; order = 12 }
    }

    foreach ($epicKey in $epics.Keys | Sort-Object { $epics[$_].order }) {
        $epic = $epics[$epicKey]
        $epicTasks = $tasks | Where-Object { $_.title -match "^$epicKey" }

        if ($epicTasks.Count -eq 0) { continue }

        $epicDone = ($epicTasks | Where-Object { $_.status -eq "done" }).Count
        $epicTotal = $epicTasks.Count
        $epicBar = Show-ProgressBar -Done $epicDone -Total $epicTotal -Width 15

        Write-Host ""
        Write-Host "  $($epic.name.ToUpper())" -ForegroundColor $epic.color -NoNewline
        Write-Host " $epicBar $epicDone/$epicTotal" -ForegroundColor Gray

        # Show individual tasks
        $epicTasks | Sort-Object title | ForEach-Object {
            $icon = switch ($_.status) {
                "todo" { "○" }
                "in_progress" { "◐" }
                "review" { "◑" }
                "done" { "●" }
                default { "?" }
            }
            $color = switch ($_.status) {
                "todo" { "DarkGray" }
                "in_progress" { "Yellow" }
                "review" { "Cyan" }
                "done" { "Green" }
                default { "Gray" }
            }

            # Truncate title for display
            $displayTitle = $_.title
            if ($displayTitle.Length -gt 55) {
                $displayTitle = $displayTitle.Substring(0, 52) + "..."
            }

            Write-Host "    $icon $displayTitle" -ForegroundColor $color
        }
    }

    Write-Host ""
    Write-Host "  ─────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    # In-progress highlight
    $inProgressTasks = $tasks | Where-Object { $_.status -eq "in_progress" }
    if ($inProgressTasks.Count -gt 0) {
        Write-Host ""
        Write-Host "  CURRENTLY IN PROGRESS:" -ForegroundColor Yellow
        $inProgressTasks | ForEach-Object {
            Write-Host "    ◐ $($_.title)" -ForegroundColor Yellow
        }
    }

    # Next recommended
    $todoTasks = $tasks | Where-Object { $_.status -eq "todo" }
    if ($todoTasks.Count -gt 0 -and $inProgressTasks.Count -lt 5) {
        $next = $todoTasks | Sort-Object title | Select-Object -First 1
        Write-Host ""
        Write-Host "  NEXT RECOMMENDED:" -ForegroundColor Green
        Write-Host "    → $($next.title)" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "  Last updated: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray

    if ($Watch) {
        Write-Host "  Refreshing every $RefreshSeconds seconds. Press Ctrl+C to exit." -ForegroundColor DarkGray
    }
}

# Main execution
if ($Watch) {
    while ($true) {
        Show-Dashboard
        Start-Sleep -Seconds $RefreshSeconds
    }
} else {
    Show-Dashboard
}
