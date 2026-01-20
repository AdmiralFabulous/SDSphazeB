# Vibe Kanban Full Audit Tool

A comprehensive audit tool that queries the Vibe Kanban API and scans worktrees to produce a detailed report of all tasks across all states.

## Features

- Queries all projects, tasks, and task attempts via the Vibe Kanban API
- Scans worktree directories to find completion indicators
- Calculates completion scores based on multiple factors
- Parses acceptance criteria checkboxes from task descriptions
- Outputs in Text, JSON, or CSV format
- Works on Windows (PowerShell) and cross-platform (Node.js)

## Requirements

**Make sure Vibe Kanban is running** before using this tool:
```bash
npx vibe-kanban
```

### Windows
- PowerShell 5.1+ (included in Windows 10/11)
- OR Node.js 14+

### Cross-Platform
- Node.js 14+

## Quick Start

### Windows

```powershell
# Run the PowerShell version
.\audit.ps1

# Or use the batch file
audit.bat
```

### Node.js (Any Platform)

```bash
node audit.js
```

## Usage Options

### PowerShell

```powershell
# Default text output
.\audit.ps1

# JSON output
.\audit.ps1 -OutputFormat Json

# CSV output (for Excel)
.\audit.ps1 -OutputFormat Csv

# Verbose mode (shows branch details)
.\audit.ps1 -VerboseOutput

# Save to file
.\audit.ps1 -OutputFormat Json | Out-File audit-report.json
.\audit.ps1 -OutputFormat Csv | Out-File audit-report.csv
```

### Node.js

```bash
# Default text output
node audit.js

# JSON output
node audit.js --json

# CSV output
node audit.js --csv

# Verbose mode
node audit.js --verbose

# Save to file
node audit.js --json > audit-report.json
node audit.js --csv > audit-report.csv
```

## Output Example

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        VIBE KANBAN FULL AUDIT REPORT                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Generated: 2026-01-20T15:30:00.000Z                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─ SUMMARY ─────────────────────────────────────────────────────────────────────┐
│ Total Projects: 2                                                             │
│ Total Tasks: 45                                                               │
│ Total Attempts: 38                                                            │
│ Worktrees Found: 32                                                           │
│ With Completion Files: 28                                                     │
├─ BY STATUS ────────────────────────────────────────────────────────────────────┤
│ 📋 To Do: 5                                                                   │
│ 🔄 In Progress: 8                                                             │
│ 👀 In Review: 12                                                              │
│ ✅ Done: 18                                                                   │
│ ❌ Cancelled: 2                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┏━━ PROJECT: SUIT AI v4.b ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Repositories: SUIT AI v4.b                                                    ┃
┃ Total Tasks: 45                                                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  👀 In Review (12)
  ──────────────────────────────────────────────────────────────────────────────
  │ DB-E01-S01-T02: Create sessions Table                  ████████░░  85% [4/5]
  │ VIS-E02-S01-T02: SAM-Body4D Implementation             ██████████ 100% [6/6]
```

## Completion Score Calculation

The tool calculates a completion score (0-100%) based on:

| Factor | Points |
|--------|--------|
| Has task attempts | +20 |
| Worktree has >10 files | +20 |
| Has completion indicator files | +30 |
| Has test files | +15 |
| Tests passing (detected in summary) | +15 |
| Acceptance criteria (if present) | % of checked items |

### Completion Indicator Files

The tool looks for these files in worktrees:
- `IMPLEMENTATION_SUMMARY.md`
- `COMPLETION_CHECKLIST.md`
- `PROJECT_SUMMARY.txt`
- `APOSE_TASK_COMPLETION.txt`
- `README.md`

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VK_API_URL` | `http://127.0.0.1:63846` | Vibe Kanban API URL |
| `VK_WORKTREES_PATH` | `%LOCALAPPDATA%\Temp\vibe-kanban\worktrees` | Worktrees directory |
| `VK_DB_PATH` | `%APPDATA%\bloop\vibe-kanban\data\db.sqlite` | SQLite database path |

### Custom API URL

```powershell
$env:VK_API_URL = "http://localhost:8080"
.\audit.ps1
```

```bash
VK_API_URL=http://localhost:8080 node audit.js
```

## Output Formats

### JSON Schema

```json
{
  "timestamp": "2026-01-20T15:30:00.000Z",
  "config": { ... },
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "repos": [...],
      "tasks": [
        {
          "id": "uuid",
          "title": "Task Title",
          "status": "inreview",
          "completionStatus": "likely_complete",
          "completionScore": 85,
          "acceptanceCriteria": {
            "total": 5,
            "completed": 4,
            "items": [...]
          },
          "attempts": [
            {
              "id": "uuid",
              "branch": "vk/xxxx-task-name",
              "worktree": {
                "exists": true,
                "completionIndicators": ["IMPLEMENTATION_SUMMARY.md"],
                "hasTests": true,
                "testsPassing": true
              }
            }
          ]
        }
      ]
    }
  ],
  "summary": {
    "totalProjects": 2,
    "totalTasks": 45,
    "byStatus": { "todo": 5, "inprogress": 8, ... },
    "totalAttempts": 38,
    "worktreesFound": 32,
    "completionIndicators": 28
  }
}
```

### CSV Columns

- Project
- Task ID
- Title
- Status
- Completion Status
- Completion Score
- Attempts
- Acceptance Criteria (completed/total)
- Created
- Updated

## Troubleshooting

### "Failed to fetch projects"
- Make sure Vibe Kanban is running (`npx vibe-kanban`)
- Check the API URL is correct
- Try accessing http://127.0.0.1:63846 in your browser

### Empty worktree results
- Worktrees are created when task attempts start
- If no attempts exist for a task, there won't be a worktree
- Check if the worktrees path is correct

### PowerShell execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\audit.ps1
```

## License

MIT
