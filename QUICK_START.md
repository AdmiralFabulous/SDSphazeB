# Phase B - Quick Start Guide

## Get Running in 5 Minutes

### Prerequisites
- PowerShell 5.1+ (Windows) or PowerShell Core (cross-platform)
- Vibe Kanban running at http://127.0.0.1:63846
- Node.js 18+ for RALPHY executor

### 1. Start Vibe Kanban
```powershell
npx vibe-kanban
```

### 2. Check System Status
```powershell
cd "C:\Users\mathe\OneDrive\文档\SAMEDAYSUITS- Injest pipeline\KANBAN-BUILD\PHAZE-B"

# Health check
.\orchestrator.ps1 -Action HealthCheck

# Visual dashboard
.\dashboard.ps1
```

### 3. View Task Progress
```powershell
# List all tasks grouped by epic
.\orchestrator.ps1 -Action ListTasks

# See next recommended task
.\orchestrator.ps1 -Action NextTask
```

### 4. Start Working on Tasks
```powershell
# Start next recommended task
.\orchestrator.ps1 -Action StartTask

# Or start a specific task
.\orchestrator.ps1 -Action StartTask -TaskId "your-task-id"
```

### 5. Run RALPHY Autonomous Executor
```powershell
# Check status
node ralphy-executor.js --status

# Get next task
node ralphy-executor.js --next

# Start a task
node ralphy-executor.js --start TASK-ID

# Mark complete
node ralphy-executor.js --complete TASK-ID
```

### 6. Live Dashboard (Auto-Refresh)
```powershell
# Watch mode - refreshes every 30 seconds
.\dashboard.ps1 -Watch

# Custom refresh interval
.\dashboard.ps1 -Watch -RefreshSeconds 15
```

---

## Task Execution Order

The orchestrator respects dependencies:

```
1. BRIDGE-001 to 005  → Schema extension (Prisma)
2. BRIDGE-006 to 008  → State machine extension
3. BRIDGE-009 to 018  → API & Dashboard bridging
4. DESIGN-001 to 003  → Theme, fonts, icons
5. DESIGN-004 to 012  → MD3 base components
6. DESIGN-013 to 017  → Holbaza components
7. DESIGN-018 to 025  → App shells & screens
8. TASK-PB-DB-*       → Database tables
9. TASK-PB-OPT-*      → Optimization algorithms
10. TASK-PB-*         → Everything else
```

---

## Project IDs

| Project | ID |
|---------|-----|
| Phase B | `e9f51260-db58-4e17-b0a8-7ad898206bf5` |

---

## Common Commands

```powershell
# Status overview
.\orchestrator.ps1

# Full task list
.\orchestrator.ps1 -Action ListTasks

# Check available slots (default max: 5)
.\orchestrator.ps1 -Action CheckSlots

# Run pipeline processor (auto-detect completion)
.\pipeline-processor.ps1

# Dry run (no changes)
.\pipeline-processor.ps1 -DryRun
```

---

## File Locations

| File | Purpose |
|------|---------|
| `orchestrator.ps1` | Task management & slot control |
| `dashboard.ps1` | Visual progress dashboard |
| `pipeline-processor.ps1` | Auto-completion detection |
| `ralphy-executor.js` | Node.js task executor |
| `HOLBAZA-DESIGN-SYSTEM.md` | Brand & UI guidelines |
| `V4B-PHASEB-UNIFICATION.md` | Integration strategy |

---

## Troubleshooting

### API Not Responding
```powershell
# Check if Vibe Kanban is running
curl http://127.0.0.1:63846/api/projects

# Restart Vibe Kanban
npx vibe-kanban
```

### Tasks Not Updating
```powershell
# Force refresh task list
.\orchestrator.ps1 -Action HealthCheck
```

### Wrong Project
```powershell
# Specify project ID explicitly
.\orchestrator.ps1 -ProjectId "e9f51260-db58-4e17-b0a8-7ad898206bf5" -Action Status
```
