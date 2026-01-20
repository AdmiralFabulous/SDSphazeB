#!/usr/bin/env node
/**
 * Vibe Kanban Full Audit Tool
 * 
 * Queries the Vibe Kanban API and scans worktrees to produce
 * a comprehensive audit of all tasks across all states.
 * 
 * Usage: node audit.js [--json] [--csv] [--verbose]
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiBase: process.env.VK_API_URL || 'http://127.0.0.1:63846',
  worktreesPath: process.env.VK_WORKTREES_PATH || 
    (process.platform === 'win32' 
      ? path.join(process.env.LOCALAPPDATA || '', 'Temp', 'vibe-kanban', 'worktrees')
      : '/tmp/vibe-kanban/worktrees'),
  dbPath: process.env.VK_DB_PATH ||
    (process.platform === 'win32'
      ? path.join(process.env.APPDATA || '', 'bloop', 'vibe-kanban', 'data', 'db.sqlite')
      : path.join(process.env.HOME || '', '.local', 'share', 'bloop', 'vibe-kanban', 'data', 'db.sqlite'))
};

// Parse command line args
const args = process.argv.slice(2);
const OPTIONS = {
  json: args.includes('--json'),
  csv: args.includes('--csv'),
  verbose: args.includes('--verbose'),
  help: args.includes('--help') || args.includes('-h')
};

if (OPTIONS.help) {
  console.log(`
Vibe Kanban Full Audit Tool

Usage: node audit.js [options]

Options:
  --json      Output as JSON
  --csv       Output as CSV
  --verbose   Include detailed information
  --help, -h  Show this help

Environment Variables:
  VK_API_URL        API base URL (default: http://127.0.0.1:63846)
  VK_WORKTREES_PATH Worktrees directory path
  VK_DB_PATH        SQLite database path
`);
  process.exit(0);
}

// HTTP request helper
function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.apiBase);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Scan worktree for completion indicators
function scanWorktree(worktreePath) {
  const results = {
    exists: false,
    files: [],
    completionIndicators: [],
    summaryContent: null,
    hasTests: false,
    testsPassing: null,
    linesOfCode: 0
  };
  
  if (!fs.existsSync(worktreePath)) {
    return results;
  }
  
  results.exists = true;
  
  // Files to look for that indicate completion
  const completionFiles = [
    'IMPLEMENTATION_SUMMARY.md',
    'COMPLETION_CHECKLIST.md',
    'PROJECT_SUMMARY.txt',
    'APOSE_TASK_COMPLETION.txt',
    'README.md'
  ];
  
  function scanDir(dir, depth = 0) {
    if (depth > 5) return; // Limit recursion
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip common non-essential directories
        if (entry.isDirectory() && 
            ['node_modules', '.git', '__pycache__', 'venv', '.venv', 'dist', 'build'].includes(entry.name)) {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else {
          results.files.push(path.relative(worktreePath, fullPath));
          
          // Check for completion files
          if (completionFiles.includes(entry.name)) {
            results.completionIndicators.push(entry.name);
            
            // Read summary content
            if (entry.name === 'IMPLEMENTATION_SUMMARY.md' && !results.summaryContent) {
              try {
                const content = fs.readFileSync(fullPath, 'utf8');
                results.summaryContent = content.substring(0, 2000);
                
                // Check for test results in summary
                if (content.includes('PASS') || content.includes('passed')) {
                  results.testsPassing = true;
                }
                if (content.includes('FAIL') || content.includes('failed')) {
                  results.testsPassing = false;
                }
              } catch (e) {}
            }
          }
          
          // Check for test files
          if (entry.name.includes('test') || entry.name.includes('spec')) {
            results.hasTests = true;
          }
          
          // Count lines of code (rough estimate)
          if (['.py', '.js', '.ts', '.rs', '.go', '.java', '.sql'].some(ext => entry.name.endsWith(ext))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              results.linesOfCode += content.split('\n').length;
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      // Directory might not be accessible
    }
  }
  
  scanDir(worktreePath);
  return results;
}

// Extract acceptance criteria status from task description
function parseAcceptanceCriteria(description) {
  if (!description) return { total: 0, completed: 0, items: [] };
  
  const items = [];
  const lines = description.split('\n');
  
  for (const line of lines) {
    // Match checkbox patterns: - [ ] or - [x] or - [X]
    const uncheckedMatch = line.match(/^\s*[-*]\s*\[\s*\]\s*(.+)/);
    const checkedMatch = line.match(/^\s*[-*]\s*\[[xX]\]\s*(.+)/);
    
    if (uncheckedMatch) {
      items.push({ text: uncheckedMatch[1].trim(), completed: false });
    } else if (checkedMatch) {
      items.push({ text: checkedMatch[1].trim(), completed: true });
    }
  }
  
  return {
    total: items.length,
    completed: items.filter(i => i.completed).length,
    items
  };
}

// Main audit function
async function runAudit() {
  const audit = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    projects: [],
    summary: {
      totalProjects: 0,
      totalTasks: 0,
      byStatus: {},
      totalAttempts: 0,
      worktreesFound: 0,
      completionIndicators: 0
    }
  };
  
  console.error('🔍 Vibe Kanban Full Audit');
  console.error('========================\n');
  
  // Step 1: Get all projects
  console.error('📁 Fetching projects...');
  let projects;
  try {
    const response = await apiRequest('/api/projects');
    projects = response.data || [];
    audit.summary.totalProjects = projects.length;
    console.error(`   Found ${projects.length} projects\n`);
  } catch (e) {
    console.error(`❌ Failed to fetch projects: ${e.message}`);
    console.error('   Make sure Vibe Kanban is running (npx vibe-kanban)\n');
    process.exit(1);
  }
  
  // Step 2: For each project, get tasks and repos
  for (const project of projects) {
    console.error(`📋 Processing project: ${project.name}`);
    
    const projectAudit = {
      id: project.id,
      name: project.name,
      repos: [],
      tasks: [],
      tasksByStatus: {}
    };
    
    // Get repos
    try {
      const reposResponse = await apiRequest(`/api/repos?project_id=${project.id}`);
      projectAudit.repos = (reposResponse.data || []).map(r => ({
        id: r.id,
        name: r.name,
        path: r.path,
        defaultBranch: r.default_branch
      }));
      console.error(`   📂 ${projectAudit.repos.length} repositories`);
    } catch (e) {
      console.error(`   ⚠️  Failed to fetch repos: ${e.message}`);
    }
    
    // Get all tasks
    try {
      const tasksResponse = await apiRequest(`/api/tasks?project_id=${project.id}&limit=1000`);
      const tasks = tasksResponse.data || [];
      console.error(`   📝 ${tasks.length} tasks`);
      
      for (const task of tasks) {
        audit.summary.totalTasks++;
        audit.summary.byStatus[task.status] = (audit.summary.byStatus[task.status] || 0) + 1;
        
        // Parse acceptance criteria
        const criteria = parseAcceptanceCriteria(task.description);
        
        // Get task attempts
        let attempts = [];
        try {
          const attemptsResponse = await apiRequest(`/api/task-attempts?task_id=${task.id}`);
          attempts = attemptsResponse.data || [];
          audit.summary.totalAttempts += attempts.length;
        } catch (e) {}
        
        // Scan worktrees for each attempt
        const attemptDetails = [];
        for (const attempt of attempts) {
          const worktreePath = attempt.container_ref || attempt.agent_working_dir;
          let worktreeScan = { exists: false };
          
          if (worktreePath) {
            // Try both the direct path and within the worktrees directory
            const possiblePaths = [
              worktreePath,
              path.join(CONFIG.worktreesPath, path.basename(worktreePath))
            ];
            
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                worktreeScan = scanWorktree(p);
                if (worktreeScan.exists) {
                  audit.summary.worktreesFound++;
                  if (worktreeScan.completionIndicators.length > 0) {
                    audit.summary.completionIndicators++;
                  }
                  break;
                }
              }
            }
          }
          
          attemptDetails.push({
            id: attempt.id,
            branch: attempt.branch,
            createdAt: attempt.created_at,
            updatedAt: attempt.updated_at,
            archived: attempt.archived,
            pinned: attempt.pinned,
            worktree: {
              path: worktreePath,
              ...worktreeScan
            }
          });
        }
        
        // Determine completion status
        let completionStatus = 'unknown';
        let completionScore = 0;
        
        if (task.status === 'done') {
          completionStatus = 'complete';
          completionScore = 100;
        } else if (task.status === 'cancelled') {
          completionStatus = 'cancelled';
          completionScore = 0;
        } else {
          // Estimate based on various factors
          let score = 0;
          
          // Has attempts
          if (attempts.length > 0) score += 20;
          
          // Has worktree with files
          const hasWorkingWorktree = attemptDetails.some(a => a.worktree.exists && a.worktree.files.length > 10);
          if (hasWorkingWorktree) score += 20;
          
          // Has completion indicators
          const hasCompletionFiles = attemptDetails.some(a => a.worktree.completionIndicators.length > 0);
          if (hasCompletionFiles) score += 30;
          
          // Has tests
          const hasTests = attemptDetails.some(a => a.worktree.hasTests);
          if (hasTests) score += 15;
          
          // Tests passing
          const testsPassing = attemptDetails.some(a => a.worktree.testsPassing === true);
          if (testsPassing) score += 15;
          
          // Acceptance criteria
          if (criteria.total > 0) {
            score = Math.max(score, Math.round((criteria.completed / criteria.total) * 100));
          }
          
          completionScore = Math.min(score, 99); // Cap at 99 if not explicitly done
          
          if (completionScore >= 80) completionStatus = 'likely_complete';
          else if (completionScore >= 50) completionStatus = 'in_progress';
          else if (completionScore >= 20) completionStatus = 'started';
          else completionStatus = 'not_started';
        }
        
        const taskAudit = {
          id: task.id,
          title: task.title?.split('\n')[0]?.substring(0, 100) || 'Untitled',
          status: task.status,
          completionStatus,
          completionScore,
          acceptanceCriteria: criteria,
          attempts: attemptDetails,
          attemptCount: attempts.length,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        };
        
        if (OPTIONS.verbose) {
          taskAudit.description = task.description?.substring(0, 500);
        }
        
        projectAudit.tasks.push(taskAudit);
        
        // Group by status
        if (!projectAudit.tasksByStatus[task.status]) {
          projectAudit.tasksByStatus[task.status] = [];
        }
        projectAudit.tasksByStatus[task.status].push(taskAudit);
      }
      
    } catch (e) {
      console.error(`   ⚠️  Failed to fetch tasks: ${e.message}`);
    }
    
    audit.projects.push(projectAudit);
    console.error('');
  }
  
  return audit;
}

// Format output
function formatOutput(audit) {
  if (OPTIONS.json) {
    return JSON.stringify(audit, null, 2);
  }
  
  if (OPTIONS.csv) {
    const rows = ['Project,Task ID,Title,Status,Completion Status,Completion Score,Attempts,Acceptance Criteria,Created,Updated'];
    
    for (const project of audit.projects) {
      for (const task of project.tasks) {
        rows.push([
          `"${project.name}"`,
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          task.status,
          task.completionStatus,
          task.completionScore,
          task.attemptCount,
          `${task.acceptanceCriteria.completed}/${task.acceptanceCriteria.total}`,
          task.createdAt,
          task.updatedAt
        ].join(','));
      }
    }
    
    return rows.join('\n');
  }
  
  // Default: formatted text output
  let output = [];
  
  output.push('╔══════════════════════════════════════════════════════════════════════════════╗');
  output.push('║                        VIBE KANBAN FULL AUDIT REPORT                         ║');
  output.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  output.push(`║ Generated: ${audit.timestamp.padEnd(64)}║`);
  output.push('╚══════════════════════════════════════════════════════════════════════════════╝');
  output.push('');
  
  // Summary
  output.push('┌─ SUMMARY ─────────────────────────────────────────────────────────────────────┐');
  output.push(`│ Total Projects: ${audit.summary.totalProjects.toString().padEnd(60)}│`);
  output.push(`│ Total Tasks: ${audit.summary.totalTasks.toString().padEnd(63)}│`);
  output.push(`│ Total Attempts: ${audit.summary.totalAttempts.toString().padEnd(60)}│`);
  output.push(`│ Worktrees Found: ${audit.summary.worktreesFound.toString().padEnd(59)}│`);
  output.push(`│ With Completion Files: ${audit.summary.completionIndicators.toString().padEnd(53)}│`);
  output.push('├─ BY STATUS ────────────────────────────────────────────────────────────────────┤');
  
  const statusOrder = ['todo', 'inprogress', 'inreview', 'done', 'cancelled'];
  const statusLabels = {
    todo: '📋 To Do',
    inprogress: '🔄 In Progress',
    inreview: '👀 In Review',
    done: '✅ Done',
    cancelled: '❌ Cancelled'
  };
  
  for (const status of statusOrder) {
    const count = audit.summary.byStatus[status] || 0;
    if (count > 0 || status !== 'cancelled') {
      const label = statusLabels[status] || status;
      output.push(`│ ${label}: ${count.toString().padEnd(63 - label.length)}│`);
    }
  }
  output.push('└───────────────────────────────────────────────────────────────────────────────┘');
  output.push('');
  
  // Projects detail
  for (const project of audit.projects) {
    output.push(`┏━━ PROJECT: ${project.name} ${'━'.repeat(Math.max(0, 64 - project.name.length))}┓`);
    output.push(`┃ Repositories: ${project.repos.map(r => r.name).join(', ').substring(0, 60).padEnd(61)}┃`);
    output.push(`┃ Total Tasks: ${project.tasks.length.toString().padEnd(62)}┃`);
    output.push('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
    
    // Group tasks by status
    for (const status of statusOrder) {
      const tasks = project.tasksByStatus[status] || [];
      if (tasks.length === 0) continue;
      
      const label = statusLabels[status] || status;
      output.push('');
      output.push(`  ${label} (${tasks.length})`);
      output.push('  ' + '─'.repeat(74));
      
      for (const task of tasks) {
        const scoreBar = '█'.repeat(Math.floor(task.completionScore / 10)) + 
                        '░'.repeat(10 - Math.floor(task.completionScore / 10));
        
        const title = task.title.substring(0, 50).padEnd(50);
        const criteria = task.acceptanceCriteria.total > 0 
          ? `[${task.acceptanceCriteria.completed}/${task.acceptanceCriteria.total}]`
          : '';
        
        output.push(`  │ ${title} ${scoreBar} ${task.completionScore.toString().padStart(3)}% ${criteria}`);
        
        if (OPTIONS.verbose && task.attempts.length > 0) {
          for (const attempt of task.attempts) {
            const indicators = attempt.worktree.completionIndicators.length > 0 
              ? ` [${attempt.worktree.completionIndicators.join(', ')}]`
              : '';
            output.push(`  │   └─ ${attempt.branch || 'no branch'}${indicators}`);
          }
        }
      }
    }
    output.push('');
  }
  
  return output.join('\n');
}

// Main execution
runAudit()
  .then(audit => {
    console.log(formatOutput(audit));
  })
  .catch(err => {
    console.error(`\n❌ Audit failed: ${err.message}`);
    if (OPTIONS.verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  });
