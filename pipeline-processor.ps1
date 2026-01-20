<#
.SYNOPSIS
    Phase B Pipeline Processor - Autonomous task processing
.DESCRIPTION
    Auto-detects completion, promotes tasks, coordinates with RALPHY
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "e9f51260-db58-4e17-b0a8-7ad898206bf5",

    [Parameter(Mandatory=$false)]
    [string]$ApiBase = "http://127.0.0.1:63846/api",

    [Parameter(Mandatory=$false)]
    [string]$RepoPath = "C:\Users\mathe\OneDrive\文档\SAMEDAYSUITS- Injest pipeline\KANBAN-BUILD\PRODUCTION",

    [Parameter(Mandatory=$false)]
    [int]$MaxConcurrent = 5,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO" { "White" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "ACTION" { "Cyan" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# API Helpers
function Invoke-Api {
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
        return Invoke-RestMethod @params
    } catch {
        Write-Log "API Error: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Get-Tasks {
    return Invoke-Api -Endpoint "tasks?project_id=$ProjectId"
}

function Set-TaskStatus {
    param([string]$TaskId, [string]$Status)

    if ($DryRun) {
        Write-Log "[DRY RUN] Would set task $TaskId to $Status" "ACTION"
        return @{ id = $TaskId; status = $Status }
    }

    return Invoke-Api -Endpoint "tasks/$TaskId" -Method "PATCH" -Body @{ status = $Status }
}

# Check if a task appears complete based on code artifacts
function Test-TaskCompletion {
    param([object]$Task)

    $title = $Task.title

    # Extract task type from title
    $completionIndicators = @()

    # BRIDGE tasks - check for schema/code changes
    if ($title -match "^BRIDGE-00[1-4]") {
        # Schema tasks - check prisma schema
        $schemaPath = Join-Path $RepoPath "prisma\schema.prisma"
        if (Test-Path $schemaPath) {
            $schema = Get-Content $schemaPath -Raw

            if ($title -match "BRIDGE-001" -and $schema -match "track\s+String") {
                $completionIndicators += "Order.track field found"
            }
            if ($title -match "BRIDGE-002" -and $schema -match "primaryTailorId") {
                $completionIndicators += "OrderItem.primaryTailorId found"
            }
            if ($title -match "BRIDGE-003" -and $schema -match "model Tailor") {
                $completionIndicators += "Tailor model found"
            }
            if ($title -match "BRIDGE-004" -and $schema -match "model Flight") {
                $completionIndicators += "Flight model found"
            }
        }
    }

    # BRIDGE state machine tasks
    if ($title -match "^BRIDGE-00[6-8]") {
        $stateMachinePath = Join-Path $RepoPath "src\lib\orders\state-machine.ts"
        if (Test-Path $stateMachinePath) {
            $stateCode = Get-Content $stateMachinePath -Raw

            if ($title -match "BRIDGE-006" -and $stateCode -match "S20_FLIGHT_MANIFEST") {
                $completionIndicators += "S20 state found in state-machine.ts"
            }
        }
    }

    # DESIGN tasks - check for component files
    if ($title -match "^DESIGN-") {
        $componentMap = @{
            "DESIGN-001" = "src\styles\theme.css"
            "DESIGN-004" = "src\components\md3\Button"
            "DESIGN-005" = "src\components\md3\Card"
            "DESIGN-006" = "src\components\md3\TextField"
            "DESIGN-013" = "src\components\holbaza\SuitCard"
            "DESIGN-014" = "src\components\holbaza\RiskBadge"
        }

        foreach ($key in $componentMap.Keys) {
            if ($title -match $key) {
                $checkPath = Join-Path $RepoPath $componentMap[$key]
                if (Test-Path $checkPath) {
                    $completionIndicators += "Component exists at $($componentMap[$key])"
                }
            }
        }
    }

    # Check for IMPLEMENTATION_SUMMARY.md (universal completion indicator)
    $taskIdMatch = [regex]::Match($title, "(BRIDGE-\d+|DESIGN-\d+|TASK-PB-[A-Z]+-\d+)")
    if ($taskIdMatch.Success) {
        $summaryPath = Join-Path $RepoPath "$($taskIdMatch.Value)_IMPLEMENTATION_SUMMARY.md"
        if (Test-Path $summaryPath) {
            $completionIndicators += "Implementation summary found"
        }
    }

    return @{
        Task = $Task
        Indicators = $completionIndicators
        LikelyComplete = $completionIndicators.Count -gt 0
    }
}

# Get priority score for a task (lower = higher priority)
function Get-TaskPriority {
    param([object]$Task)

    $title = $Task.title

    # Priority order
    if ($title -match "^BRIDGE-00[1-5]") { return 10 }  # Schema first
    if ($title -match "^BRIDGE-00[6-8]") { return 20 }  # State machine
    if ($title -match "^BRIDGE-") { return 30 }         # Other bridging
    if ($title -match "^DESIGN-00[1-3]") { return 40 }  # Design foundation
    if ($title -match "^DESIGN-") { return 50 }         # Other design
    if ($title -match "^TASK-PB-DB") { return 60 }      # Database
    if ($title -match "^TASK-PB-OPT") { return 70 }     # Optimization
    if ($title -match "^TASK-PB-RT") { return 80 }      # Real-time
    if ($title -match "^TASK-PB-API") { return 90 }     # APIs
    if ($title -match "^TASK-PB-VAPI") { return 100 }   # Voice
    if ($title -match "^TASK-PB") { return 110 }        # Everything else

    return 999
}

# Main pipeline processing
function Invoke-Pipeline {
    Write-Log "Starting pipeline processor..." "INFO"
    Write-Log "Project ID: $ProjectId" "INFO"
    Write-Log "Repo Path: $RepoPath" "INFO"
    if ($DryRun) { Write-Log "DRY RUN MODE - No changes will be made" "WARN" }

    $tasks = Get-Tasks
    if (-not $tasks) {
        Write-Log "Failed to fetch tasks" "ERROR"
        return
    }

    Write-Log "Fetched $($tasks.Count) tasks" "INFO"

    # Categorize tasks
    $todo = $tasks | Where-Object { $_.status -eq "todo" }
    $inProgress = $tasks | Where-Object { $_.status -eq "in_progress" }
    $review = $tasks | Where-Object { $_.status -eq "review" }
    $done = $tasks | Where-Object { $_.status -eq "done" }

    Write-Log "Status: Todo=$($todo.Count) InProgress=$($inProgress.Count) Review=$($review.Count) Done=$($done.Count)" "INFO"

    # STEP 1: Check in-progress tasks for completion
    Write-Log "Checking in-progress tasks for completion..." "INFO"

    foreach ($task in $inProgress) {
        $completion = Test-TaskCompletion -Task $task

        if ($completion.LikelyComplete) {
            Write-Log "Task appears complete: $($task.title)" "SUCCESS"
            foreach ($indicator in $completion.Indicators) {
                Write-Log "  - $indicator" "INFO"
            }

            # Promote to review
            Write-Log "Promoting to review: $($task.title)" "ACTION"
            $result = Set-TaskStatus -TaskId $task.id -Status "review"
            if ($result) {
                Write-Log "Promoted successfully" "SUCCESS"
            }
        } else {
            Write-Log "Task still in progress: $($task.title)" "INFO"
        }
    }

    # STEP 2: Fill available slots with todo tasks
    $currentInProgress = ($tasks | Where-Object { $_.status -eq "in_progress" }).Count
    $availableSlots = $MaxConcurrent - $currentInProgress

    if ($availableSlots -gt 0) {
        Write-Log "Available slots: $availableSlots" "INFO"

        # Sort todo tasks by priority
        $prioritizedTodo = $todo | Sort-Object { Get-TaskPriority -Task $_ }

        $toStart = $prioritizedTodo | Select-Object -First $availableSlots

        foreach ($task in $toStart) {
            Write-Log "Starting task: $($task.title)" "ACTION"
            $result = Set-TaskStatus -TaskId $task.id -Status "in_progress"
            if ($result) {
                Write-Log "Started successfully" "SUCCESS"
            }
        }
    } else {
        Write-Log "No slots available (max $MaxConcurrent)" "INFO"
    }

    # STEP 3: Summary
    Write-Log "Pipeline processing complete" "SUCCESS"

    # Re-fetch for final counts
    $tasks = Get-Tasks
    $finalInProgress = ($tasks | Where-Object { $_.status -eq "in_progress" }).Count
    $finalReview = ($tasks | Where-Object { $_.status -eq "review" }).Count

    Write-Log "Final status: $finalInProgress in progress, $finalReview in review" "INFO"

    if ($finalReview -gt 0) {
        Write-Log "Tasks ready for review:" "INFO"
        $tasks | Where-Object { $_.status -eq "review" } | ForEach-Object {
            Write-Log "  - $($_.title)" "INFO"
        }
    }
}

# Run the pipeline
Invoke-Pipeline
