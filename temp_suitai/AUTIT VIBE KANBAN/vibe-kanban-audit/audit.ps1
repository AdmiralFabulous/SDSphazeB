<# 
.SYNOPSIS
    Vibe Kanban Full Audit Tool - PowerShell Version

.DESCRIPTION
    Queries the Vibe Kanban API and scans worktrees to produce
    a comprehensive audit of all tasks across all states.

.PARAMETER ApiUrl
    The Vibe Kanban API base URL (default: http://127.0.0.1:63846)

.PARAMETER OutputFormat
    Output format: Text, Json, or Csv (default: Text)

.PARAMETER Verbose
    Include detailed information

.EXAMPLE
    .\audit.ps1
    
.EXAMPLE
    .\audit.ps1 -OutputFormat Json | Out-File audit.json

.EXAMPLE
    .\audit.ps1 -OutputFormat Csv | Out-File audit.csv
#>

param(
    [string]$ApiUrl = "http://127.0.0.1:63846",
    [ValidateSet("Text", "Json", "Csv")]
    [string]$OutputFormat = "Text",
    [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"

# Configuration
$Config = @{
    ApiBase = $ApiUrl
    WorktreesPath = Join-Path $env:LOCALAPPDATA "Temp\vibe-kanban\worktrees"
    DbPath = Join-Path $env:APPDATA "bloop\vibe-kanban\data\db.sqlite"
}

# Status labels and colors
$StatusLabels = @{
    "todo" = "To Do"
    "inprogress" = "In Progress"
    "inreview" = "In Review"
    "done" = "Done"
    "cancelled" = "Cancelled"
}

$StatusColors = @{
    "todo" = "Gray"
    "inprogress" = "Yellow"
    "inreview" = "Cyan"
    "done" = "Green"
    "cancelled" = "Red"
}

# API Request helper
function Invoke-VKApi {
    param([string]$Endpoint)
    
    try {
        $response = Invoke-RestMethod -Uri "$($Config.ApiBase)$Endpoint" -TimeoutSec 10
        return $response
    }
    catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Scan worktree for completion indicators
function Get-WorktreeInfo {
    param([string]$WorktreePath)
    
    $result = @{
        Exists = $false
        Files = @()
        CompletionIndicators = @()
        SummaryContent = $null
        HasTests = $false
        TestsPassing = $null
        LinesOfCode = 0
    }
    
    if (-not (Test-Path $WorktreePath)) {
        return $result
    }
    
    $result.Exists = $true
    
    $completionFiles = @(
        "IMPLEMENTATION_SUMMARY.md",
        "COMPLETION_CHECKLIST.md",
        "PROJECT_SUMMARY.txt",
        "APOSE_TASK_COMPLETION.txt"
    )
    
    $excludeDirs = @("node_modules", ".git", "__pycache__", "venv", ".venv", "dist", "build")
    
    Get-ChildItem -Path $WorktreePath -Recurse -File -ErrorAction SilentlyContinue | 
        Where-Object { 
            $exclude = $false
            foreach ($dir in $excludeDirs) {
                if ($_.FullName -like "*\$dir\*") { $exclude = $true; break }
            }
            -not $exclude
        } | 
        ForEach-Object {
            $relativePath = $_.FullName.Substring($WorktreePath.Length + 1)
            $result.Files += $relativePath
            
            # Check for completion files
            if ($completionFiles -contains $_.Name) {
                $result.CompletionIndicators += $_.Name
                
                if ($_.Name -eq "IMPLEMENTATION_SUMMARY.md" -and -not $result.SummaryContent) {
                    try {
                        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
                        $result.SummaryContent = $content.Substring(0, [Math]::Min(2000, $content.Length))
                        
                        if ($content -match "PASS|passed") {
                            $result.TestsPassing = $true
                        }
                        if ($content -match "FAIL|failed") {
                            $result.TestsPassing = $false
                        }
                    }
                    catch {}
                }
            }
            
            # Check for test files
            if ($_.Name -match "test|spec") {
                $result.HasTests = $true
            }
            
            # Count lines of code
            if ($_.Extension -in @(".py", ".js", ".ts", ".rs", ".go", ".java", ".sql")) {
                try {
                    $result.LinesOfCode += (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
                }
                catch {}
            }
        }
    
    return $result
}

# Parse acceptance criteria from description
function Get-AcceptanceCriteria {
    param([string]$Description)
    
    $items = @()
    
    if (-not $Description) {
        return @{ Total = 0; Completed = 0; Items = @() }
    }
    
    $lines = $Description -split "`n"
    
    foreach ($line in $lines) {
        if ($line -match '^\s*[-*]\s*\[\s*\]\s*(.+)') {
            $items += @{ Text = $Matches[1].Trim(); Completed = $false }
        }
        elseif ($line -match '^\s*[-*]\s*\[[xX]\]\s*(.+)') {
            $items += @{ Text = $Matches[1].Trim(); Completed = $true }
        }
    }
    
    return @{
        Total = $items.Count
        Completed = ($items | Where-Object { $_.Completed }).Count
        Items = $items
    }
}

# Calculate completion score
function Get-CompletionScore {
    param(
        [string]$Status,
        [array]$Attempts,
        [hashtable]$Criteria
    )
    
    if ($Status -eq "done") { return @{ Status = "complete"; Score = 100 } }
    if ($Status -eq "cancelled") { return @{ Status = "cancelled"; Score = 0 } }
    
    $score = 0
    
    # Has attempts
    if ($Attempts.Count -gt 0) { $score += 20 }
    
    # Has worktree with files
    $hasWorkingWorktree = $Attempts | Where-Object { $_.Worktree.Exists -and $_.Worktree.Files.Count -gt 10 }
    if ($hasWorkingWorktree) { $score += 20 }
    
    # Has completion indicators
    $hasCompletionFiles = $Attempts | Where-Object { $_.Worktree.CompletionIndicators.Count -gt 0 }
    if ($hasCompletionFiles) { $score += 30 }
    
    # Has tests
    $hasTests = $Attempts | Where-Object { $_.Worktree.HasTests }
    if ($hasTests) { $score += 15 }
    
    # Tests passing
    $testsPassing = $Attempts | Where-Object { $_.Worktree.TestsPassing -eq $true }
    if ($testsPassing) { $score += 15 }
    
    # Acceptance criteria
    if ($Criteria.Total -gt 0) {
        $criteriaScore = [Math]::Round(($Criteria.Completed / $Criteria.Total) * 100)
        $score = [Math]::Max($score, $criteriaScore)
    }
    
    $score = [Math]::Min($score, 99)
    
    $status = switch ($score) {
        { $_ -ge 80 } { "likely_complete" }
        { $_ -ge 50 } { "in_progress" }
        { $_ -ge 20 } { "started" }
        default { "not_started" }
    }
    
    return @{ Status = $status; Score = $score }
}

# Main audit function
function Invoke-Audit {
    $audit = @{
        Timestamp = (Get-Date -Format "o")
        Config = $Config
        Projects = @()
        Summary = @{
            TotalProjects = 0
            TotalTasks = 0
            ByStatus = @{}
            TotalAttempts = 0
            WorktreesFound = 0
            CompletionIndicators = 0
        }
    }
    
    Write-Host "`n🔍 Vibe Kanban Full Audit" -ForegroundColor Cyan
    Write-Host "========================`n" -ForegroundColor Cyan
    
    # Get all projects
    Write-Host "📁 Fetching projects..." -ForegroundColor Yellow
    $projectsResponse = Invoke-VKApi -Endpoint "/api/projects"
    
    if (-not $projectsResponse) {
        Write-Host "❌ Failed to fetch projects. Make sure Vibe Kanban is running." -ForegroundColor Red
        return $null
    }
    
    $projects = $projectsResponse.data
    $audit.Summary.TotalProjects = $projects.Count
    Write-Host "   Found $($projects.Count) projects`n" -ForegroundColor Green
    
    foreach ($project in $projects) {
        Write-Host "📋 Processing project: $($project.name)" -ForegroundColor Yellow
        
        $projectAudit = @{
            Id = $project.id
            Name = $project.name
            Repos = @()
            Tasks = @()
            TasksByStatus = @{}
        }
        
        # Get repos
        $reposResponse = Invoke-VKApi -Endpoint "/api/repos?project_id=$($project.id)"
        if ($reposResponse) {
            $projectAudit.Repos = $reposResponse.data | ForEach-Object {
                @{
                    Id = $_.id
                    Name = $_.name
                    Path = $_.path
                    DefaultBranch = $_.default_branch
                }
            }
            Write-Host "   📂 $($projectAudit.Repos.Count) repositories" -ForegroundColor Gray
        }
        
        # Get tasks
        $tasksResponse = Invoke-VKApi -Endpoint "/api/tasks?project_id=$($project.id)&limit=1000"
        if ($tasksResponse) {
            $tasks = $tasksResponse.data
            Write-Host "   📝 $($tasks.Count) tasks" -ForegroundColor Gray
            
            foreach ($task in $tasks) {
                $audit.Summary.TotalTasks++
                
                if (-not $audit.Summary.ByStatus.ContainsKey($task.status)) {
                    $audit.Summary.ByStatus[$task.status] = 0
                }
                $audit.Summary.ByStatus[$task.status]++
                
                # Parse acceptance criteria
                $criteria = Get-AcceptanceCriteria -Description $task.description
                
                # Get attempts
                $attempts = @()
                $attemptsResponse = Invoke-VKApi -Endpoint "/api/task-attempts?task_id=$($task.id)"
                if ($attemptsResponse -and $attemptsResponse.data) {
                    $attempts = $attemptsResponse.data
                    $audit.Summary.TotalAttempts += $attempts.Count
                }
                
                # Scan worktrees for each attempt
                $attemptDetails = @()
                foreach ($attempt in $attempts) {
                    $worktreePath = $attempt.container_ref
                    $worktreeScan = @{ Exists = $false }
                    
                    if ($worktreePath -and (Test-Path $worktreePath)) {
                        $worktreeScan = Get-WorktreeInfo -WorktreePath $worktreePath
                        if ($worktreeScan.Exists) {
                            $audit.Summary.WorktreesFound++
                            if ($worktreeScan.CompletionIndicators.Count -gt 0) {
                                $audit.Summary.CompletionIndicators++
                            }
                        }
                    }
                    
                    $attemptDetails += @{
                        Id = $attempt.id
                        Branch = $attempt.branch
                        CreatedAt = $attempt.created_at
                        UpdatedAt = $attempt.updated_at
                        Archived = $attempt.archived
                        Pinned = $attempt.pinned
                        Worktree = @{
                            Path = $worktreePath
                            Exists = $worktreeScan.Exists
                            Files = $worktreeScan.Files
                            CompletionIndicators = $worktreeScan.CompletionIndicators
                            HasTests = $worktreeScan.HasTests
                            TestsPassing = $worktreeScan.TestsPassing
                            LinesOfCode = $worktreeScan.LinesOfCode
                        }
                    }
                }
                
                # Calculate completion
                $completion = Get-CompletionScore -Status $task.status -Attempts $attemptDetails -Criteria $criteria
                
                $taskTitle = ($task.title -split "`n")[0]
                if ($taskTitle.Length -gt 100) {
                    $taskTitle = $taskTitle.Substring(0, 100)
                }
                
                $taskAudit = @{
                    Id = $task.id
                    Title = $taskTitle
                    Status = $task.status
                    CompletionStatus = $completion.Status
                    CompletionScore = $completion.Score
                    AcceptanceCriteria = $criteria
                    Attempts = $attemptDetails
                    AttemptCount = $attempts.Count
                    CreatedAt = $task.created_at
                    UpdatedAt = $task.updated_at
                }
                
                if ($VerboseOutput) {
                    $taskAudit.Description = if ($task.description.Length -gt 500) { 
                        $task.description.Substring(0, 500) 
                    } else { 
                        $task.description 
                    }
                }
                
                $projectAudit.Tasks += $taskAudit
                
                # Group by status
                if (-not $projectAudit.TasksByStatus.ContainsKey($task.status)) {
                    $projectAudit.TasksByStatus[$task.status] = @()
                }
                $projectAudit.TasksByStatus[$task.status] += $taskAudit
            }
        }
        
        $audit.Projects += $projectAudit
        Write-Host ""
    }
    
    return $audit
}

# Format text output
function Format-TextOutput {
    param([hashtable]$Audit)
    
    $output = @()
    
    $output += ""
    $output += "╔══════════════════════════════════════════════════════════════════════════════╗"
    $output += "║                        VIBE KANBAN FULL AUDIT REPORT                         ║"
    $output += "╠══════════════════════════════════════════════════════════════════════════════╣"
    $output += "║ Generated: $($Audit.Timestamp.PadRight(64))║"
    $output += "╚══════════════════════════════════════════════════════════════════════════════╝"
    $output += ""
    
    # Summary
    $output += "┌─ SUMMARY ─────────────────────────────────────────────────────────────────────┐"
    $output += "│ Total Projects: $($Audit.Summary.TotalProjects.ToString().PadRight(60))│"
    $output += "│ Total Tasks: $($Audit.Summary.TotalTasks.ToString().PadRight(63))│"
    $output += "│ Total Attempts: $($Audit.Summary.TotalAttempts.ToString().PadRight(60))│"
    $output += "│ Worktrees Found: $($Audit.Summary.WorktreesFound.ToString().PadRight(59))│"
    $output += "│ With Completion Files: $($Audit.Summary.CompletionIndicators.ToString().PadRight(53))│"
    $output += "├─ BY STATUS ────────────────────────────────────────────────────────────────────┤"
    
    $statusOrder = @("todo", "inprogress", "inreview", "done", "cancelled")
    foreach ($status in $statusOrder) {
        $count = if ($Audit.Summary.ByStatus.ContainsKey($status)) { $Audit.Summary.ByStatus[$status] } else { 0 }
        $label = $StatusLabels[$status]
        $icon = switch ($status) {
            "todo" { "📋" }
            "inprogress" { "🔄" }
            "inreview" { "👀" }
            "done" { "✅" }
            "cancelled" { "❌" }
        }
        $output += "│ $icon $($label): $($count.ToString().PadRight(63 - $label.Length))│"
    }
    $output += "└───────────────────────────────────────────────────────────────────────────────┘"
    $output += ""
    
    # Projects detail
    foreach ($project in $Audit.Projects) {
        $namePad = 64 - $project.Name.Length
        if ($namePad -lt 0) { $namePad = 0 }
        
        $output += "┏━━ PROJECT: $($project.Name) $("━" * $namePad)┓"
        $repoNames = ($project.Repos | ForEach-Object { $_.Name }) -join ", "
        if ($repoNames.Length -gt 60) { $repoNames = $repoNames.Substring(0, 57) + "..." }
        $output += "┃ Repositories: $($repoNames.PadRight(61))┃"
        $output += "┃ Total Tasks: $($project.Tasks.Count.ToString().PadRight(62))┃"
        $output += "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
        
        foreach ($status in $statusOrder) {
            if (-not $project.TasksByStatus.ContainsKey($status)) { continue }
            $tasks = $project.TasksByStatus[$status]
            if ($tasks.Count -eq 0) { continue }
            
            $label = $StatusLabels[$status]
            $icon = switch ($status) {
                "todo" { "📋" }
                "inprogress" { "🔄" }
                "inreview" { "👀" }
                "done" { "✅" }
                "cancelled" { "❌" }
            }
            
            $output += ""
            $output += "  $icon $label ($($tasks.Count))"
            $output += "  " + ("─" * 74)
            
            foreach ($task in $tasks) {
                $title = $task.Title
                if ($title.Length -gt 50) { $title = $title.Substring(0, 47) + "..." }
                $title = $title.PadRight(50)
                
                $filledBlocks = [Math]::Floor($task.CompletionScore / 10)
                $emptyBlocks = 10 - $filledBlocks
                $scoreBar = ("█" * $filledBlocks) + ("░" * $emptyBlocks)
                
                $criteria = if ($task.AcceptanceCriteria.Total -gt 0) {
                    "[$($task.AcceptanceCriteria.Completed)/$($task.AcceptanceCriteria.Total)]"
                } else { "" }
                
                $output += "  │ $title $scoreBar $($task.CompletionScore.ToString().PadLeft(3))% $criteria"
                
                if ($VerboseOutput -and $task.Attempts.Count -gt 0) {
                    foreach ($attempt in $task.Attempts) {
                        $indicators = if ($attempt.Worktree.CompletionIndicators.Count -gt 0) {
                            " [$($attempt.Worktree.CompletionIndicators -join ', ')]"
                        } else { "" }
                        $branch = if ($attempt.Branch) { $attempt.Branch } else { "no branch" }
                        $output += "  │   └─ $branch$indicators"
                    }
                }
            }
        }
        $output += ""
    }
    
    return $output -join "`n"
}

# Format CSV output
function Format-CsvOutput {
    param([hashtable]$Audit)
    
    $rows = @()
    $rows += "Project,Task ID,Title,Status,Completion Status,Completion Score,Attempts,Acceptance Criteria,Created,Updated"
    
    foreach ($project in $Audit.Projects) {
        foreach ($task in $project.Tasks) {
            $title = $task.Title -replace '"', '""'
            $rows += "`"$($project.Name)`",$($task.Id),`"$title`",$($task.Status),$($task.CompletionStatus),$($task.CompletionScore),$($task.AttemptCount),$($task.AcceptanceCriteria.Completed)/$($task.AcceptanceCriteria.Total),$($task.CreatedAt),$($task.UpdatedAt)"
        }
    }
    
    return $rows -join "`n"
}

# Main execution
$audit = Invoke-Audit

if ($audit) {
    switch ($OutputFormat) {
        "Json" {
            $audit | ConvertTo-Json -Depth 10
        }
        "Csv" {
            Format-CsvOutput -Audit $audit
        }
        default {
            Format-TextOutput -Audit $audit
        }
    }
}
