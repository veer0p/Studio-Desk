---
name: fix-bugs
description: 4-agent pipeline — Agent 1 orchestrates with user, Agent 2 fixes code, Agent 3 writes tests, Agent 4 handles revisions. All run concurrently with unlimited revision rounds.
user_invocable: true
---

# /fix-bugs — 4-Agent Pipeline

You are **Agent 1 (Orchestrator)**. You interact with the user, collect decisions, dispatch tasks, show results, and collect revision feedback. You NEVER stop until all tasks are done and user approves each one.

## Step 1: Collect Inputs

Ask the user **everything at once** in a single AskUserQuestion:

1. **"Your name?"** (header: "Developer") — Options: "Nishi Avadhiya", "Viraj", "Abhi Patel"
2. **"Which workspace?"** (header: "Workspace") — Options: "Prod LegalPrime", "Easy Khata", "Prod Sahayak"
3. **"Which tag?"** (header: "Tag") — Options: "autofix (Recommended)", "bug"

## Step 2: Validate Against ClickUp

Validate all inputs in parallel:
1. `mcp__claude_ai_ClickUp__clickup_resolve_assignees` → get `userId`
2. `mcp__claude_ai_ClickUp__clickup_get_workspace_hierarchy` (max_depth: 2) → find list → get `listId`

If any input doesn't match, re-ask ONLY that input.

## Step 3: Fetch & Analyze All Tasks

1. `mcp__claude_ai_ClickUp__clickup_filter_tasks` (list_ids, statuses: ["to do"], tags, assignees)
2. If no tasks → inform user and stop
3. For EVERY task: `mcp__claude_ai_ClickUp__clickup_get_task` (detail_level: "detailed") to read description + attachments
4. If task has image attachments → fetch and view them (circles, highlights, arrows mark the problem)

Categorize each task:
- **Ready** — has enough context
- **Needs decisions** — missing info or feature needing design input

## Step 4: Pipeline Execution

Process tasks ONE AT A TIME. For each task, follow this cycle:

### 4a. Get Task Ready

If task is **Ready** → go to 4b immediately.

If task **Needs decisions** → ask user via AskUserQuestion for this task's missing info. Once answered → go to 4b.

### 4b. Dispatch Agent 2 (Fixer)

Set ClickUp status to "in progress" via `mcp__claude_ai_ClickUp__clickup_update_task`.

Spawn Agent 2 using the Agent tool (**foreground**, wait for result):

```
You are a bug fixer for the LegalPrime project at d:/Viraj/Projects/legalprime.

TASK: {task_name}
CLICKUP URL: {task_url}
CLICKUP TASK ID: {task_id}
DESCRIPTION: {full description}
USER DECISIONS: {decisions from user, or "N/A — task had full context"}
ATTACHMENTS: {describe screenshots and their annotations}

INSTRUCTIONS:
1. Find and fix the bug/feature:
   - Search codebase using Grep/Glob/Read
   - Read surrounding code for context
   - Apply fix using Edit
   - Follow all CLAUDE.md rules (permissions, Radix UI, Tailwind, responsive, etc.)

2. Run build check:
   Run: npm run build --prefix d:/Viraj/Projects/legalprime/Frontend
   - If fails: try to fix (max 2 attempts). If still failing, revert and report failure.

3. Return this JSON:
   {{
     "task_id": "{task_id}",
     "task_name": "{task_name}",
     "task_url": "{task_url}",
     "status": "fixed" or "failed",
     "files_changed": ["path1.tsx", "path2.tsx"],
     "what_was_fixed": "description of the fix applied",
     "failure_reason": null or "why it failed"
   }}
```

### 4c. Show Result & Ask for Revision

After Agent 2 returns, show the user:

```
## Task: {task_name}
**Status:** {Fixed / Failed}
**Files changed:** {list}
**What was done:** {description}

Any revision needed?
```

Ask via AskUserQuestion:
- **"Revision for: {task_name}?"** (header: "Revision")
- Options: "Looks good, move on", "Needs revision"

### 4d. Revision Loop (Agent 4)

If user selects **"Needs revision"** → they type their revision notes via "Other".

Spawn Agent 4 (Reviser) using the Agent tool (**foreground**, wait for result):

```
You are a code reviser for the LegalPrime project at d:/Viraj/Projects/legalprime.

ORIGINAL TASK: {task_name}
CLICKUP URL: {task_url}
ORIGINAL DESCRIPTION: {description}
PREVIOUS FIX: {what Agent 2 or previous Agent 4 did}
FILES ALREADY CHANGED: {list of files}

USER REVISION REQUEST:
{user's revision notes}

INSTRUCTIONS:
1. Read the files that were previously changed to understand the current state
2. Apply the user's requested revision
3. Follow all CLAUDE.md rules
4. Run build check: npm run build --prefix d:/Viraj/Projects/legalprime/Frontend
   - If fails: try to fix (max 2 attempts). If still failing, revert revision and report.

5. Return this JSON:
   {{
     "status": "revised" or "failed",
     "files_changed": ["path1.tsx"],
     "what_was_revised": "description of revision applied",
     "failure_reason": null or "why it failed"
   }}
```

After Agent 4 returns, show result and ask **"Revision for: {task_name}?"** again.

**Repeat this loop unlimited times** until user says **"Looks good, move on"**.

### 4e. Dispatch Agent 3 (Tester) — Background

Once user approves (says "Looks good"), spawn Agent 3 using Agent tool with `run_in_background: true`:

```
You are a QA verification writer for the LegalPrime project at d:/Viraj/Projects/legalprime.

Today's date: {YYYY-MM-DD}
Verification file: d:/Viraj/Projects/legalprime/Frontend/testing_{YYYY-MM-DD}.md

COMPLETED TASK:
- Task: {task_name}
- Task URL: {task_url}
- Files changed: {all files from Agent 2 + Agent 4 revisions}
- What was fixed: {combined description of original fix + all revisions}
- Revision rounds: {number of revisions, and what each revision changed}

INSTRUCTIONS:
1. Read the changed files to understand exactly what was modified
2. If the file Frontend/testing_{YYYY-MM-DD}.md doesn't exist, create it with header:
   # Bug Fix Verification — {YYYY-MM-DD}
3. Each task entry must be clearly separated and numbered. Use this format:

---

&nbsp;

## ✅ Test #{incremental_number} — {task_name}

&nbsp;

| Field | Value |
|-------|-------|
| **ClickUp** | {task_url} |
| **Fixed in** | {file paths} |
| **Revisions** | {number of revision rounds} |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Navigate to `{specific page URL, e.g., /case-matter/service-order/new}`
>
> **Step 2:** {Exact UI action, e.g., "Click the 'Service *' dropdown"}
>
> **Step 3:** {What to check, e.g., "Verify dropdown shows scrollbar with max 6 visible items"}

&nbsp;

### ✔️ Expected result:
- {What should happen after fix}

&nbsp;

### ❌ Fail condition:
- {What broken behavior looks like — so tester knows if it regressed}

&nbsp;

---

&nbsp;

IMPORTANT:
- Every test entry MUST have a unique incremental number (Test #1, Test #2, etc.)
- Add blank lines (&amp;nbsp;) between every section for clear visual separation
- Use the table format for metadata so it's scannable
- Include "Status: 🔲 Not tested" so user can manually mark as ✅ Passed or ❌ Failed
- Be specific: URL paths, button names, form fields, exact steps
- Steps must be detailed enough for Claude browser extension to follow
- If task had screenshot annotations, reference what they showed
```

### 4f. Update ClickUp Status

Set task status to "update required" via `mcp__claude_ai_ClickUp__clickup_update_task`.

### 4g. Move to Next Task

Go back to **4a** for the next task. Continue until all tasks are processed.

## Step 5: Print Summary

After ALL tasks done and all Agent 3 instances complete, print:

```
## Fix Summary — {YYYY-MM-DD}

| # | Task | Status | Revisions | Files Changed |
|---|------|--------|-----------|---------------|
| 1 | [name] | Fixed | 0 | [files] |
| 2 | [name] | Fixed | 2 | [files] |
| 3 | [name] | Failed | 0 | — |

**Fixed:** X tasks
**Failed:** Y tasks
**Total revisions:** Z rounds
**Verification file:** Frontend/testing_{YYYY-MM-DD}.md
```

## Agent Summary

| Agent | Role | Mode | When |
|-------|------|------|------|
| **Agent 1** (You) | Orchestrator — user decisions, shows results, collects revisions | Main thread | Always running |
| **Agent 2** (Fixer) | First fix of each task | Foreground | Once per task |
| **Agent 3** (Tester) | Writes testing_{date}.md | Background | After user approves task |
| **Agent 4** (Reviser) | Applies user revision notes | Foreground | Per revision round (unlimited) |

## Rules

- **Process tasks ONE AT A TIME** — fix → show → revise → approve → test → next.
- **Agent 2 runs foreground** — wait for fix before showing user.
- **Agent 4 runs foreground** — wait for revision before showing user.
- **Agent 3 runs background** — don't wait, let it write tests while you move to next task.
- **Unlimited revision rounds** — keep looping until user says "Looks good".
- **NEVER skip a task** — every task must be attempted.
- **Never auto-complete** — always "update required" for human review.
- **Always run build check** in Agent 2 and Agent 4.
- **Testing file uses today's date** — `Frontend/testing_YYYY-MM-DD.md`
- **Consider images** — describe attachment annotations to Agent 2.
- **Follow CLAUDE.md rules** — permissions, design system, Radix UI, responsive, etc.
