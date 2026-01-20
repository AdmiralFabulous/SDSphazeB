#!/usr/bin/env node
/**
 * RALPHY Phase B Executor - Task executor for Holbaza/Phase B
 *
 * Usage:
 *   node ralphy-phaseb.js --status          Show current task status
 *   node ralphy-phaseb.js --next            Get next task to work on
 *   node ralphy-phaseb.js --start TASK-ID   Start a task
 *   node ralphy-phaseb.js --complete TASK-ID Mark a task as done
 *   node ralphy-phaseb.js --review TASK-ID  Mark a task as in review
 *   node ralphy-phaseb.js --dashboard       Show visual dashboard
 */

const http = require("http");

// Configuration
const CONFIG = {
  PROJECT_ID: "e9f51260-db58-4e17-b0a8-7ad898206bf5",
  PROJECT_NAME: "SUIT AI Phase B - Holbaza",
  API_BASE: "http://127.0.0.1:63846/api",
  MAX_CONCURRENT: 5,
};

// Task priority order (lower = higher priority)
const PRIORITY_PATTERNS = [
  { pattern: /^BRIDGE-00[1-5]/, priority: 10, name: "Schema Extension" },
  { pattern: /^BRIDGE-00[6-8]/, priority: 20, name: "State Machine" },
  { pattern: /^BRIDGE-/, priority: 30, name: "Bridging" },
  { pattern: /^DESIGN-00[1-3]/, priority: 40, name: "Design Foundation" },
  { pattern: /^DESIGN-00[4-9]/, priority: 50, name: "MD3 Components" },
  { pattern: /^DESIGN-01/, priority: 55, name: "MD3 Components" },
  { pattern: /^DESIGN-/, priority: 60, name: "Design" },
  { pattern: /^TASK-PB-DB/, priority: 70, name: "Database" },
  { pattern: /^TASK-PB-OPT/, priority: 80, name: "Optimization" },
  { pattern: /^TASK-PB-RT/, priority: 90, name: "Real-Time" },
  { pattern: /^TASK-PB-VAPI/, priority: 100, name: "Voice AI" },
  { pattern: /^TASK-PB-API/, priority: 110, name: "APIs" },
  { pattern: /^TASK-PB-MOB/, priority: 120, name: "Mobile" },
  { pattern: /^TASK-PB-DASH/, priority: 130, name: "Dashboard" },
  { pattern: /^TASK-PB-FIN/, priority: 140, name: "Financial" },
  { pattern: /^TASK-PB-CHARTER/, priority: 150, name: "Charter" },
  { pattern: /^TASK-PB-TEST/, priority: 160, name: "Testing" },
];

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// HTTP request helper
function apiRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.API_BASE);

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || "{}") });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Get all tasks
async function getTasks() {
  const response = await apiRequest("GET", `/tasks?project_id=${CONFIG.PROJECT_ID}`);
  return response.data || [];
}

// Update task status
async function updateTaskStatus(taskId, status) {
  const response = await apiRequest("PATCH", `/tasks/${taskId}`, { status });
  return response;
}

// Get task priority
function getTaskPriority(title) {
  for (const { pattern, priority } of PRIORITY_PATTERNS) {
    if (pattern.test(title)) {
      return priority;
    }
  }
  return 999;
}

// Get task category name
function getTaskCategory(title) {
  for (const { pattern, name } of PRIORITY_PATTERNS) {
    if (pattern.test(title)) {
      return name;
    }
  }
  return "Other";
}

// Show status
async function showStatus() {
  console.log(colorize("\n=== PHASE B STATUS ===\n", "cyan"));

  const tasks = await getTasks();

  const counts = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const total = tasks.length;
  const percent = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  console.log(`Project: ${colorize(CONFIG.PROJECT_NAME, "green")}`);
  console.log(`Total Tasks: ${total}`);
  console.log(`Progress: ${colorize(`${percent}%`, "yellow")} (${counts.done}/${total})`);
  console.log("");
  console.log(`  ${colorize("[ ]", "white")} Todo:        ${counts.todo}`);
  console.log(`  ${colorize("[~]", "yellow")} In Progress: ${counts.in_progress}`);
  console.log(`  ${colorize("[?]", "cyan")} Review:      ${counts.review}`);
  console.log(`  ${colorize("[x]", "green")} Done:        ${counts.done}`);
  console.log("");

  // Slots
  const available = CONFIG.MAX_CONCURRENT - counts.in_progress;
  if (available > 0) {
    console.log(colorize(`Slots Available: ${available}/${CONFIG.MAX_CONCURRENT}`, "green"));
  } else {
    console.log(colorize(`No slots available (${counts.in_progress}/${CONFIG.MAX_CONCURRENT})`, "yellow"));
  }

  // In progress tasks
  if (counts.in_progress > 0) {
    console.log(colorize("\nIn Progress:", "yellow"));
    tasks.filter(t => t.status === "in_progress").forEach(t => {
      console.log(`  ${colorize("◐", "yellow")} ${t.title}`);
    });
  }

  // Review tasks
  if (counts.review > 0) {
    console.log(colorize("\nReady for Review:", "cyan"));
    tasks.filter(t => t.status === "review").forEach(t => {
      console.log(`  ${colorize("◑", "cyan")} ${t.title}`);
    });
  }
}

// Get next task
async function getNextTask() {
  const tasks = await getTasks();
  const inProgress = tasks.filter(t => t.status === "in_progress").length;

  if (inProgress >= CONFIG.MAX_CONCURRENT) {
    console.log(colorize("\nNo slots available!", "yellow"));
    console.log(`Complete some in-progress tasks first (${inProgress}/${CONFIG.MAX_CONCURRENT})`);
    return null;
  }

  const todoTasks = tasks.filter(t => t.status === "todo");

  if (todoTasks.length === 0) {
    console.log(colorize("\nNo tasks in todo status!", "yellow"));
    return null;
  }

  // Sort by priority
  todoTasks.sort((a, b) => {
    const priorityA = getTaskPriority(a.title);
    const priorityB = getTaskPriority(b.title);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.title.localeCompare(b.title);
  });

  const next = todoTasks[0];

  console.log(colorize("\n=== NEXT TASK ===\n", "cyan"));
  console.log(`Title:    ${colorize(next.title, "green")}`);
  console.log(`ID:       ${colorize(next.id, "gray")}`);
  console.log(`Category: ${colorize(getTaskCategory(next.title), "blue")}`);
  console.log(`Priority: ${getTaskPriority(next.title)}`);

  if (next.description) {
    console.log("\nDescription:");
    // Show first 500 chars
    const desc = next.description.substring(0, 500);
    console.log(colorize(desc, "gray"));
    if (next.description.length > 500) console.log("...");
  }

  console.log(colorize(`\nTo start: node ralphy-phaseb.js --start ${next.id}`, "yellow"));

  return next;
}

// Start a task
async function startTask(taskId) {
  if (!taskId) {
    console.log(colorize("Error: Task ID required", "red"));
    return;
  }

  const response = await updateTaskStatus(taskId, "in_progress");

  if (response.status === 200) {
    console.log(colorize(`\nTask started: ${response.data.title || taskId}`, "green"));
    console.log("\nNow execute the task and mark complete when done:");
    console.log(colorize(`  node ralphy-phaseb.js --complete ${taskId}`, "yellow"));
  } else {
    console.log(colorize(`\nFailed to start task: ${JSON.stringify(response.data)}`, "red"));
  }
}

// Complete a task
async function completeTask(taskId) {
  if (!taskId) {
    console.log(colorize("Error: Task ID required", "red"));
    return;
  }

  const response = await updateTaskStatus(taskId, "done");

  if (response.status === 200) {
    console.log(colorize(`\nTask completed: ${response.data.title || taskId}`, "green"));

    // Show next task
    console.log("\nFetching next task...");
    await getNextTask();
  } else {
    console.log(colorize(`\nFailed to complete task: ${JSON.stringify(response.data)}`, "red"));
  }
}

// Mark for review
async function reviewTask(taskId) {
  if (!taskId) {
    console.log(colorize("Error: Task ID required", "red"));
    return;
  }

  const response = await updateTaskStatus(taskId, "review");

  if (response.status === 200) {
    console.log(colorize(`\nTask marked for review: ${response.data.title || taskId}`, "cyan"));
  } else {
    console.log(colorize(`\nFailed to update task: ${JSON.stringify(response.data)}`, "red"));
  }
}

// Visual dashboard
async function showDashboard() {
  const tasks = await getTasks();

  console.log("\n");
  console.log(colorize("╔══════════════════════════════════════════════════════════════╗", "cyan"));
  console.log(colorize("║           HOLBAZA PHASE B - TASK DASHBOARD                   ║", "cyan"));
  console.log(colorize("╚══════════════════════════════════════════════════════════════╝", "cyan"));
  console.log("");

  // Overall progress
  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const barWidth = 30;
  const filled = Math.floor((done / total) * barWidth);
  const bar = "[" + "=".repeat(filled) + "-".repeat(barWidth - filled) + "]";

  console.log(`  OVERALL: ${bar} ${percent}% (${done}/${total})`);
  console.log("");

  // Group by category
  const categories = {};
  for (const task of tasks) {
    const cat = getTaskCategory(task.title);
    if (!categories[cat]) {
      categories[cat] = { total: 0, done: 0, tasks: [] };
    }
    categories[cat].total++;
    if (task.status === "done") categories[cat].done++;
    categories[cat].tasks.push(task);
  }

  // Sort categories by priority
  const sortedCats = Object.entries(categories).sort((a, b) => {
    const prioA = getTaskPriority(a[1].tasks[0]?.title || "");
    const prioB = getTaskPriority(b[1].tasks[0]?.title || "");
    return prioA - prioB;
  });

  for (const [cat, data] of sortedCats) {
    const catBar = "[" + "=".repeat(Math.floor((data.done / data.total) * 10)) +
                   "-".repeat(10 - Math.floor((data.done / data.total) * 10)) + "]";
    console.log(`  ${colorize(cat.toUpperCase(), "magenta")} ${catBar} ${data.done}/${data.total}`);

    // Show tasks
    data.tasks.sort((a, b) => a.title.localeCompare(b.title)).forEach(task => {
      const icon = {
        todo: colorize("○", "gray"),
        in_progress: colorize("◐", "yellow"),
        review: colorize("◑", "cyan"),
        done: colorize("●", "green"),
      }[task.status] || "?";

      let title = task.title;
      if (title.length > 50) title = title.substring(0, 47) + "...";

      console.log(`    ${icon} ${title}`);
    });
    console.log("");
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const taskId = args[1];

  try {
    switch (command) {
      case "--status":
        await showStatus();
        break;
      case "--next":
        await getNextTask();
        break;
      case "--start":
        await startTask(taskId);
        break;
      case "--complete":
        await completeTask(taskId);
        break;
      case "--review":
        await reviewTask(taskId);
        break;
      case "--dashboard":
        await showDashboard();
        break;
      default:
        console.log(`
RALPHY Phase B Executor - Holbaza Task Management

Usage:
  node ralphy-phaseb.js --status          Show current task status
  node ralphy-phaseb.js --next            Get next task to work on
  node ralphy-phaseb.js --start TASK-ID   Start a task
  node ralphy-phaseb.js --complete TASK-ID Mark a task as done
  node ralphy-phaseb.js --review TASK-ID  Mark a task as in review
  node ralphy-phaseb.js --dashboard       Show visual dashboard

Project: ${CONFIG.PROJECT_NAME}
Max Concurrent: ${CONFIG.MAX_CONCURRENT}
        `);
    }
  } catch (error) {
    console.log(colorize(`\nError: ${error.message}`, "red"));
    console.log("Make sure Vibe Kanban is running at http://127.0.0.1:63846");
  }
}

main();
