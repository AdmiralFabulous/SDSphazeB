<#
.SYNOPSIS
    Vibe Kanban Task Orchestrator - Manages autonomous task processing
.DESCRIPTION
    Health checks, slot management, and pipeline coordination for SUIT AI Phase B
.PARAMETER Action
    HealthCheck, StartTask, CheckSlots, Status
.PARAMETER ProjectId
    The Vibe Kanban project ID
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("HealthCheck", "StartTask", "CheckSlots", "Status", "ListTasks", "NextTask")]
    [string]$Action = "Status",

    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "e9f51260-db58-4e17-b0a8-7ad898206bf5",

    [Parameter(Mandatory=$false)]
    [string]$TaskId,

    [Parameter(Mandatory=$false)]
    [int]$MaxConcurrent = 5,

    [Parameter(Mandatory=$false)]
    [string]$ApiBase = "http://127.0.0.1:63846/api"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($msg) Write-Host "[STATUS] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# API Helper
function Invoke-VibeApi {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body
    )

    $uri = "$ApiBase/$Endpoint"
    $params = @{
        Uri = $uri
        Method = $Method
        ContentType = "application/json"
    }

    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Err "API call failed: $($_.Exception.Message)"
        return $null
    }
}

# Get all tasks for project
function Get-ProjectTasks {
    $tasks = Invoke-VibeApi -Endpoint "tasks?project_id=$ProjectId"
    return $tasks
}

# Get tasks by status
function Get-TasksByStatus {
    param([string]$Status)
    $allTasks = Get-ProjectTasks
    return $allTasks | Where-Object { $_.status -eq $Status }
}

# Health Check
function Invoke-HealthCheck {
    Write-Status "Running health check..."

    # Check Vibe Kanban API
    try {
        $projects = Invoke-VibeApi -Endpoint "projects"
        Write-Success "Vibe Kanban API: Online"
    } catch {
        Write-Err "Vibe Kanban API: Offline"
        return $false
    }

    # Get task counts
    $tasks = Get-ProjectTasks
    $todo = ($tasks | Where-Object { $_.status -eq "todo" }).Count
    $inProgress = ($tasks | Where-Object { $_.status -eq "in_progress" }).Count
    $review = ($tasks | Where-Object { $_.status -eq "review" }).Count
    $done = ($tasks | Where-Object { $_.status -eq "done" }).Count

    Write-Host ""
    Write-Host "=== PHASE B TASK STATUS ===" -ForegroundColor Magenta
    Write-Host "Todo:        $todo" -ForegroundColor White
    Write-Host "In Progress: $inProgress" -ForegroundColor Yellow
    Write-Host "Review:      $review" -ForegroundColor Cyan
    Write-Host "Done:        $done" -ForegroundColor Green
    Write-Host "Total:       $($tasks.Count)" -ForegroundColor White
    Write-Host ""

    # Check slot availability
    $slotsAvailable = $MaxConcurrent - $inProgress
    if ($slotsAvailable -gt 0) {
        Write-Success "Slots available: $slotsAvailable of $MaxConcurrent"
    } else {
        Write-Warn "No slots available ($inProgress/$MaxConcurrent in progress)"
    }

    # Check for in-progress tasks
    if ($inProgress -gt 0) {
        Write-Status "In-progress tasks:"
        $tasks | Where-Object { $_.status -eq "in_progress" } | ForEach-Object {
            Write-Host "  - $($_.title)" -ForegroundColor Yellow
        }
    }

    return $true
}

# Check available slots
function Get-AvailableSlots {
    $inProgress = (Get-TasksByStatus -Status "in_progress").Count
    $available = $MaxConcurrent - $inProgress

    Write-Host ""
    Write-Host "=== SLOT STATUS ===" -ForegroundColor Magenta
    Write-Host "Max Concurrent: $MaxConcurrent"
    Write-Host "In Progress:    $inProgress"
    Write-Host "Available:      $available"
    Write-Host ""

    return $available
}

# Update task status
function Set-TaskStatus {
    param(
        [string]$Id,
        [string]$Status
    )

    $body = @{
        status = $Status
    }

    $result = Invoke-VibeApi -Endpoint "tasks/$Id" -Method "PATCH" -Body $body
    return $result
}

# Start a task
function Start-Task {
    param([string]$Id)

    if (-not $Id) {
        Write-Err "Task ID required"
        return
    }

    $result = Set-TaskStatus -Id $Id -Status "in_progress"

    if ($result) {
        Write-Success "Task started: $($result.title)"
    }
}

# List tasks with filtering
function Show-Tasks {
    $tasks = Get-ProjectTasks

    Write-Host ""
    Write-Host "=== PHASE B TASKS ===" -ForegroundColor Magenta
    Write-Host ""

    # Group by prefix
    $groups = $tasks | Group-Object {
        if ($_.title -match "^(BRIDGE|DESIGN|TASK-PB)") { $matches[1] }
        else { "OTHER" }
    }

    foreach ($group in $groups | Sort-Object Name) {
        $groupTodo = ($group.Group | Where-Object { $_.status -eq "todo" }).Count
        $groupDone = ($group.Group | Where-Object { $_.status -eq "done" }).Count
        Write-Host "[$($group.Name)] - $groupDone/$($group.Count) complete" -ForegroundColor Cyan

        $group.Group | Sort-Object status, title | ForEach-Object {
            $statusColor = switch ($_.status) {
                "todo" { "White" }
                "in_progress" { "Yellow" }
                "review" { "Cyan" }
                "done" { "Green" }
                default { "Gray" }
            }
            $statusIcon = switch ($_.status) {
                "todo" { "[ ]" }
                "in_progress" { "[~]" }
                "review" { "[?]" }
                "done" { "[x]" }
                default { "[?]" }
            }
            Write-Host "  $statusIcon $($_.title)" -ForegroundColor $statusColor
        }
        Write-Host ""
    }
}

# Get next task to start (respects dependencies)
function Get-NextTask {
    $todoTasks = Get-TasksByStatus -Status "todo"

    if ($todoTasks.Count -eq 0) {
        Write-Warn "No tasks in todo status"
        return $null
    }

    # Priority order: BRIDGE > DESIGN-foundation > TASK-PB-DB > others
    # BRIDGE tasks must be done first (schema/state machine)
    # DESIGN-001 to 003 before other DESIGN tasks
    # TASK-PB-DB before other TASK-PB tasks

    $priorityPatterns = @(
        "^BRIDGE-00[1-5]",    # Schema first
        "^BRIDGE-00[6-8]",    # State machine
        "^BRIDGE-",           # Other bridging
        "^DESIGN-00[1-3]",    # Design foundation
        "^DESIGN-00[4-9]",    # MD3 components
        "^DESIGN-01",         # More components
        "^DESIGN-",           # Other design
        "^TASK-PB-DB",        # Database tasks
        "^TASK-PB-OPT",       # Optimization
        "^TASK-PB-RT",        # Real-time
        "^TASK-PB-VAPI",      # Voice
        "^TASK-PB-API",       # APIs
        "^TASK-PB"            # Everything else
    )

    foreach ($pattern in $priorityPatterns) {
        $candidates = $todoTasks | Where-Object { $_.title -match $pattern }
        if ($candidates.Count -gt 0) {
            return $candidates | Sort-Object title | Select-Object -First 1
        }
    }

    # Fallback to first todo task
    return $todoTasks | Select-Object -First 1
}

# Show next recommended task
function Show-NextTask {
    $slots = Get-AvailableSlots

    if ($slots -le 0) {
        Write-Warn "No slots available. Complete some in-progress tasks first."
        return
    }

    $next = Get-NextTask
    if ($next) {
        Write-Host ""
        Write-Host "=== NEXT RECOMMENDED TASK ===" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Title: $($next.title)" -ForegroundColor Green
        Write-Host "ID:    $($next.id)" -ForegroundColor Gray
        Write-Host ""

        if ($next.description) {
            Write-Host "Description:" -ForegroundColor Cyan
            Write-Host $next.description.Substring(0, [Math]::Min(500, $next.description.Length))
            if ($next.description.Length -gt 500) { Write-Host "..." }
        }

        Write-Host ""
        Write-Host "To start: .\orchestrator.ps1 -Action StartTask -TaskId $($next.id)" -ForegroundColor Yellow
    }
}

# Main execution
switch ($Action) {
    "HealthCheck" {
        Invoke-HealthCheck
    }
    "CheckSlots" {
        Get-AvailableSlots
    }
    "StartTask" {
        if ($TaskId) {
            Start-Task -Id $TaskId
        } else {
            $slots = Get-AvailableSlots
            if ($slots -gt 0) {
                $next = Get-NextTask
                if ($next) {
                    Write-Status "Next recommended task: $($next.title)"
                    $confirm = Read-Host "Start this task? (y/n)"
                    if ($confirm -eq "y") {
                        Start-Task -Id $next.id
                    }
                }
            } else {
                Write-Warn "No slots available. Complete some in-progress tasks first."
            }
        }
    }
    "ListTasks" {
        Show-Tasks
    }
    "NextTask" {
        Show-NextTask
    }
    "Status" {
        Invoke-HealthCheck
        Write-Host ""
        $next = Get-NextTask
        if ($next) {
            Write-Status "Next recommended: $($next.title)"
            Write-Host "Run: .\orchestrator.ps1 -Action NextTask for details" -ForegroundColor Gray
        }
    }
}
