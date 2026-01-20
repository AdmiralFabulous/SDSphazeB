# Create GitHub Issues from Vibe Kanban tasks
$ErrorActionPreference = "Continue"

# Create labels first
$labels = @(
    @{name='todo'; desc='Task to be done'; color='0052cc'},
    @{name='in-progress'; desc='Work in progress'; color='fbca04'},
    @{name='in-review'; desc='Ready for review'; color='5319e7'},
    @{name='done'; desc='Completed'; color='0e8a16'},
    @{name='api'; desc='API module'; color='c5def5'},
    @{name='db'; desc='Database module'; color='d4c5f9'},
    @{name='fe'; desc='Frontend module'; color='bfdadc'},
    @{name='admin'; desc='Admin module'; color='f9d0c4'},
    @{name='runner'; desc='Runner module'; color='fef2c0'},
    @{name='vis'; desc='Vision module'; color='d93f0b'},
    @{name='voice'; desc='Voice module'; color='006b75'},
    @{name='fin'; desc='Finance module'; color='b60205'},
    @{name='infra'; desc='Infrastructure module'; color='1d76db'},
    @{name='test'; desc='Test module'; color='e99695'}
)

Write-Host "Creating labels..." -ForegroundColor Cyan
foreach ($label in $labels) {
    & 'C:\Program Files\GitHub CLI\gh.exe' label create $label.name --description $label.desc --color $label.color --force 2>$null
    Write-Host "  + $($label.name)" -ForegroundColor Green
}

# Load issues from JSON
$issues = Get-Content -Raw "github-issues.json" | ConvertFrom-Json

Write-Host "`nCreating $($issues.Count) issues..." -ForegroundColor Cyan
Write-Host "This will take several minutes...`n" -ForegroundColor Yellow

$created = 0
$failed = 0

foreach ($issue in $issues) {
    $title = $issue.title
    $body = $issue.body
    if ($body.Length -gt 65000) {
        $body = $body.Substring(0, 65000)
    }
    
    $labelStr = ($issue.labels -join ',')
    
    # Create temp file for body
    $bodyFile = [System.IO.Path]::GetTempFileName()
    $body | Out-File -FilePath $bodyFile -Encoding utf8
    
    try {
        if ($labelStr) {
            $result = & 'C:\Program Files\GitHub CLI\gh.exe' issue create --title $title --body-file $bodyFile --label $labelStr 2>&1
        } else {
            $result = & 'C:\Program Files\GitHub CLI\gh.exe' issue create --title $title --body-file $bodyFile 2>&1
        }
        
        if ($LASTEXITCODE -eq 0) {
            $created++
            if ($created % 20 -eq 0) {
                Write-Host "  Created $created/$($issues.Count) issues..." -ForegroundColor Green
            }
        } else {
            $failed++
            Write-Host "  X Failed: $($title.Substring(0, [Math]::Min(50, $title.Length)))..." -ForegroundColor Red
        }
    } catch {
        $failed++
    }
    
    Remove-Item $bodyFile -ErrorAction SilentlyContinue
    
    # Rate limiting
    if (($created + $failed) % 10 -eq 0) {
        Start-Sleep -Seconds 1
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPLETE: Created $created issues, $failed failed" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
