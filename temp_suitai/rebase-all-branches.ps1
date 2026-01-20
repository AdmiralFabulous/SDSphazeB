# Rebase all vk/* branches onto main
$ErrorActionPreference = "Stop"

Write-Host "Fetching latest..." -ForegroundColor Cyan
git fetch origin

Write-Host "`nGetting list of vk/* branches..." -ForegroundColor Cyan
$branches = git branch --list 'vk/*' | ForEach-Object { $_.Trim().TrimStart('* ').TrimStart('+ ') }

Write-Host "Found $($branches.Count) branches to rebase`n" -ForegroundColor Yellow

$success = 0
$failed = 0
$uptodate = 0

foreach ($branch in $branches) {
    Write-Host "Rebasing $branch..." -NoNewline
    
    # Checkout the branch
    git checkout $branch 2>$null
    
    # Check if behind main
    $behind = git rev-list --count "HEAD..main" 2>$null
    
    if ($behind -eq 0) {
        Write-Host " up-to-date" -ForegroundColor Green
        $uptodate++
        continue
    }
    
    # Try to rebase
    $result = git rebase main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK (+$behind commits)" -ForegroundColor Green
        $success++
    } else {
        Write-Host " CONFLICT" -ForegroundColor Red
        git rebase --abort 2>$null
        $failed++
    }
}

# Return to main
git checkout main 2>$null

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Rebased: $success" -ForegroundColor Green
Write-Host "Up-to-date: $uptodate" -ForegroundColor Green  
Write-Host "Failed (conflicts): $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "Some branches have conflicts that need manual resolution." -ForegroundColor Yellow
}

# Push all rebased branches
$push = Read-Host "Push all rebased branches to origin? (y/n)"
if ($push -eq 'y') {
    Write-Host "`nPushing all branches (force with lease)..." -ForegroundColor Cyan
    git push origin --all --force-with-lease
    Write-Host "Done!" -ForegroundColor Green
}
