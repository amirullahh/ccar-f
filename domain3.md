Domain 320%
# Claude Code Configuration & Workflows
Configure Claude Code for development workflows, manage settings, hooks, permissions, and integrate with CI/CD pipelines.
## Task Statements
[ 3.1CLAUDE.md Hierarchy, Scoping, and Modular Organisation ](https://claudecertificationguide.com/learn/3-claude-code-config/3-1-claude-md-hierarchy)[ 3.2Custom Slash Commands and Skills ](https://claudecertificationguide.com/learn/3-claude-code-config/3-2-slash-commands-skills)[ 3.3Path-Specific Rules for Conditional Convention Loading ](https://claudecertificationguide.com/learn/3-claude-code-config/3-3-path-specific-rules)[ 3.4Plan Mode vs Direct Execution ](https://claudecertificationguide.com/learn/3-claude-code-config/3-4-plan-mode-execution)[ 3.5Iterative Refinement Techniques ](https://claudecertificationguide.com/learn/3-claude-code-config/3-5-iterative-refinement)[ 3.6CI/CD Integration ](https://claudecertificationguide.com/learn/3-claude-code-config/3-6-cicd-integration)


---


Domain 3Task 3.1
# CLAUDE.md Hierarchy, Scoping, and Modular Organisation
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Claude Code reads configuration from CLAUDE.md files at three levels. Knowing which one applies where — and spotting when the wrong level was used — comes up again and again on the exam.
### The Three-Level Hierarchy
**User-level:`~/.claude/CLAUDE.md`**
This file applies only to you. It lives in your home directory, outside any repository, so it isn't version-controlled and never travels through git. Clone the repo as a new teammate and you won't get these instructions. Keep this level for strictly personal preferences: verbosity settings, a preferred output style, your own shortcuts.
**Project-level:`.claude/CLAUDE.md` or root `CLAUDE.md`**
This file applies to everyone on the project. It lives in the repository and is version-controlled, so every developer who clones or pulls the repo gets these instructions automatically. Team-wide standards belong here: naming conventions, error handling patterns, testing requirements, architecture decisions, code review checklists.
Both `.claude/CLAUDE.md` (inside the `.claude` directory) and a `CLAUDE.md` at the repository root are valid project-level locations. The exam may present either path.
**Directory-level: subdirectory`CLAUDE.md` files**
These apply when you're working in that specific directory. Use them for package-specific conventions that differ from the project root. A `/packages/api/CLAUDE.md`, say, might hold REST conventions that the frontend package never needs.
### Loading Order and Conflict Handling
CLAUDE.md files aren't a strict-precedence config. The Anthropic memory docs are explicit: "All discovered files are concatenated into context rather than overriding each other." Every applicable file loads into the same context window. None replaces another.
The docs describe a documented **load order** , not a precedence chain:
  1. Files are ordered from **broadest scope to most specific**. A project instruction appears in context _after_ a user instruction. Across the directory tree, "content is ordered from the filesystem root down to your working directory," so "instructions closer to where you launched Claude are read last."
  2. Within a directory, `CLAUDE.local.md` is appended after `CLAUDE.md`, so your personal notes are the last thing Claude reads at that level.


None of this makes it a winner-take-all hierarchy. The docs are blunt about it: **"if two rules contradict each other, Claude may pick one arbitrarily."** CLAUDE.md is delivered as a user message — not as part of the system prompt — and Anthropic says "there's no guarantee of strict compliance." Treat CLAUDE.md as guidance the model usually follows, not as a configuration layer with deterministic overrides.
The practical consequence: if a rule **must** hold on every run — a blocked tool, a required formatter, a permission policy — don't lean on CLAUDE.md scoping to enforce it. Encode it in `settings.json` (which the client enforces regardless of what Claude decides) or in a hook (which fires at a fixed lifecycle event). The Anthropic docs spell this out directly: "Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer."
Don't confuse CLAUDE.md with settings.json
`settings.json` has a strict precedence chain (managed policy > local > project > user, with managed always winning). CLAUDE.md does not — files are concatenated and conflicts may resolve arbitrarily. If a question asks "which CLAUDE.md wins on a conflict?", the docs-honest answer is "neither is guaranteed to — move the rule to `settings.json` or a hook." Watch for distractors that claim "more specific scope wins" or "user-level overrides project-level": both are paraphrases the official docs never make.
### Modular Organisation with @ path imports
Past a few hundred lines, one CLAUDE.md becomes a slog to maintain. The `@` syntax lets you split it across files and reference them from the main one. The directive is just `@` followed by a path. There is no `@import` keyword, even though half the docs you'll find online write it that way.
The syntax in your CLAUDE.md:
markdownCopy

```
# .claude/CLAUDE.md

Coding standards:

@./standards/naming-conventions.md
@./standards/error-handling.md
@./standards/testing-requirements.md

```

Each `@<path>` line gets that file inlined into the CLAUDE.md at load time. Per-package CLAUDE.md files can import only the standards that apply to them. The API package pulls in API conventions, the frontend pulls in component rules. No duplication.
One thing the docs are quiet about: imports load eagerly. The referenced file gets inlined the moment Claude reads your CLAUDE.md, exactly as if you'd pasted it in. So splitting a 600-line CLAUDE.md into six 100-line imports makes the source nicer to work in, but the context Claude actually sees is the same size. If you want to shrink per-session context, the tool for the job is `.claude/rules/` with path-scoped frontmatter (covered in Task Statement 3.3). Those files only load when Claude is working in matching paths.
### CLAUDE.local.md, local-only overrides
`CLAUDE.local.md` lives next to `CLAUDE.md` at any level in the hierarchy and loads the same way, with three small differences worth knowing:
  * **Loading order.** `CLAUDE.local.md` is appended after `CLAUDE.md` at the same level, so your personal notes are the last thing Claude reads there. That's load order, not precedence: reading last doesn't win a contradiction. If two instructions conflict, Claude may still pick either one.
  * **Gitignored by convention.** The `.local` suffix flags files you don't want committed. Most teams add `CLAUDE.local.md` to `.gitignore` so personal tweaks stay personal.
  * **What it's for.** The shared `CLAUDE.md` is the team's rules. The `CLAUDE.local.md` next to it is your own quirks for this repo: a favourite scratchpad path, a verbose explanation you keep needing to re-paste, a temporary debugging note you'll delete next week.


Think of `CLAUDE.local.md` as a project-scoped version of `~/.claude/CLAUDE.md`: same idea, narrower scope. If you find yourself reaching for it to express a team rule, that rule belongs in `CLAUDE.md` instead.
### The .claude/rules/ Directory
As an alternative to a single CLAUDE.md file, the `.claude/rules/` directory holds topic-specific rule files:
  * `testing.md` — test naming, assertion patterns, fixture usage
  * `api-conventions.md` — endpoint naming, request/response schemas
  * `deployment.md` — deployment checklist, environment configuration


Each file can optionally include YAML frontmatter with path scoping (covered in detail in Task Statement 3.3). Without frontmatter, rules files load for all sessions.
### Diagnosing What Loaded: /memory and /context
When behaviour drifts between sessions, or between developers, you need to see which memory files the session actually picked up. If Claude Code follows the team conventions for one teammate and ignores them for another, that answer settles it.
Current Claude Code splits the job across two commands. `/memory` lists your CLAUDE.md, CLAUDE.local.md and auto-memory locations, and opens any of them in your editor. `/context` reports what actually loaded into this session, under **Memory files** — so to confirm a file is live, run `/context` and read that list. The docs are explicit about it: "check the list under Memory files to verify your CLAUDE.md and CLAUDE.local.md files loaded". ([Claude Code memory docs](https://code.claude.com/docs/en/memory), verified August 2026.)
Key Concept
Neither command loads anything. They reveal which files are already loaded — configuration loads automatically based on its level and location. Use them to diagnose, not to activate. That is the part the exam tests, and it holds for `/memory` and `/context` alike.
On the exam, answer /memory
The exam guide (v1.0) predates the split and treats `/memory` as the command that shows which files are loaded. Give `/memory` as the keyed answer. Run `/context` at your actual keyboard.
### What Survives Compaction
When `/compact` summarises a long session, project-root `CLAUDE.md` comes back intact. Not because it sits somewhere privileged. Because Claude re-reads it from disk after compaction and re-injects it, and your instructions were never part of the conversation history to begin with, so there's nothing there for the summariser to compress.
Two things don't come back automatically: nested `CLAUDE.md` files in subdirectories, and `.claude/rules/` files with `paths:` frontmatter. Both load on demand, so they return the next time Claude reads a matching file rather than the moment compaction ends. When an instruction seems to vanish after `/compact`, that's usually why. The other candidate is an instruction that only ever existed in conversation, which compaction is free to summarise.
### The Critical Exam Scenario: New Team Member Not Receiving Instructions
This is the exam's favourite trap for Task Statement 3.1. It usually runs like this:
Developer A has been on the team for months. Claude Code follows all the team's conventions perfectly — API naming, test structure, error handling. Developer B joins the team, clones the repository, and Claude Code produces inconsistent results that ignore the conventions.
The root cause is always the same: the conventions are stored in Developer A's user-level config (`~/.claude/CLAUDE.md`) instead of the project-level config (`.claude/CLAUDE.md` or root `CLAUDE.md`). User-level config is not shared via git. Developer B never received the instructions.
The fix: move instructions from user-level to project-level configuration.
You need to diagnose this on sight. See "new team member" paired with "inconsistent behaviour"? Check where the configuration lives.
## Exam Traps
Exam Trap
New team member not receiving Claude Code instructions despite working on the same repo and branch
The instructions are in user-level config (~/.claude/CLAUDE.md) instead of project-level. User-level is not version-controlled or shared via git. Move to .claude/CLAUDE.md for team-wide application.
Exam Trap
Thinking /memory triggers configuration loading
/memory is a diagnostic command that shows which files are loaded. Configuration files load automatically based on their location in the hierarchy. /memory helps you debug — it does not activate anything.
Exam Trap
Assuming directory-level CLAUDE.md is the best solution for cross-directory conventions
Directory-level CLAUDE.md applies to one directory only. For conventions spanning many directories (like test files spread throughout a codebase), use path-specific rules in .claude/rules/ with glob patterns instead.
## Practice Scenario
Developer A's Claude Code follows the team's API naming conventions perfectly. Developer B, who joined last week, gets inconsistent naming from Claude Code. Both work on the same repo and branch. What is the most likely root cause?
Option ADeveloper B has not yet installed the MCP server that supplies the naming convention rules for the team to the Claude Code session running on their machine
Option BThe conventions are stored in a .claude/rules/ file that Developer B's local setup does not support, so the rules never load on their machine
Option CThe API naming conventions are stored in Developer A's user-level CLAUDE.md (~/.claude/CLAUDE.md) rather than the project-level configuration
Option DDeveloper B has not run /memory to load the configuration files into the session, so the project-level instructions have never entered the model context
Check Answer
## Build Exercise
Build Exercise
#### Build a Multi-Level CLAUDE.md Configuration
Difficulty
30 minutes
What you'll learn
  * Understand the three-level CLAUDE.md hierarchy (user, project, directory) and when to use each
  * Configure modular project standards using @ path imports
  * Use .claude/rules/ for topic-specific rule files
  * Diagnose configuration scoping issues with the /memory command
  * Identify root cause when a new team member does not receive instructions


  1. Create a project-level .claude/CLAUDE.md with universal coding standards: naming conventions, error handling patterns, and a code review checklist
Why: Project-level configuration is the foundation of team-wide standards. The exam tests whether you place shared conventions here rather than in user-level config, which is the most common misconfiguration scenario.
You should see: A .claude/CLAUDE.md file at the repository root containing at least three sections: naming conventions, error handling patterns, and a code review checklist. Running /context in the project root lists this file under Memory files.
Stuck? Get a nudge
  2. Create a directory-level CLAUDE.md in a /packages/api/ subdirectory with API-specific conventions (REST endpoint naming, request/response schema requirements)
Why: Directory-level configuration scopes conventions to a specific package. The exam tests whether you know that directory-level CLAUDE.md applies only within that directory, not across the entire project.
You should see: A CLAUDE.md file inside /packages/api/ containing REST-specific conventions. When you run /context while working in /packages/api/, both the project-level and directory-level files appear under Memory files.
Stuck? Get a nudge
  3. Create .claude/rules/testing.md with test-specific conventions (test naming pattern, assertion style, fixture usage)
Why: The .claude/rules/ directory holds topic-specific rule files that can optionally include YAML frontmatter for path scoping. Understanding this mechanism is tested alongside path-specific rules in Task Statement 3.3.
You should see: A testing.md file inside .claude/rules/ containing at least three test conventions. Running /context lists this rules file under Memory files.
Stuck? Get a nudge
  4. Use an @ path import in the project-level CLAUDE.md to reference a shared standards file at ./standards/naming.md
Why: The @ import syntax enables modular organisation of conventions. There is no @import keyword — a path prefixed with @ on its own line is the import. Each package can import only relevant standards, reducing duplication and drift in the source files. The exam tests whether you know the mechanism exists and how the syntax actually looks.
You should see: The project-level .claude/CLAUDE.md contains a line beginning with @ pointing to ./standards/naming.md. A separate file at .claude/standards/naming.md (or standards/naming.md relative to the CLAUDE.md) exists with naming conventions. Running /context confirms the imported content is loaded inline.
Stuck? Get a nudge
  5. Run /context in different directories to verify the correct files are loaded in each context
Why: The exam tests that the diagnostic command reveals loaded files but does not trigger loading — configuration loads automatically based on location. The guide names /memory for this; current Claude Code reports the loaded set under /context, so that is what you run here.
You should see: In the project root, /context shows the project-level CLAUDE.md and rules files under Memory files. In /packages/api/, it additionally shows the directory-level CLAUDE.md. The imported standards file content appears as part of the project-level configuration.
Stuck? Get a nudge
  6. Move one convention from project-level to user-level (~/.claude/CLAUDE.md) and verify that a different user session does NOT pick it up — confirming the scoping boundary
Why: This is the exam favourite trap scenario. When conventions live in user-level config, new team members who clone the repo do not receive them. Proving this boundary experimentally cements the concept.
You should see: After moving a convention to ~/.claude/CLAUDE.md, your own /context shows it loaded. A simulated second user session (or a fresh clone without your home directory config) does NOT show that convention. This confirms the scoping boundary.
Stuck? Get a nudge


## Sources
  * [How Claude remembers your project (CLAUDE.md and auto memory)](https://code.claude.com/docs/en/memory) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.1](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic


---


Domain 3Task 3.2
# Custom Slash Commands and Skills
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Custom commands and skills have been merged into a single unified system: the **Skills system**. The two locations, `.claude/skills/` and `.claude/commands/`, create `/commands` that behave the same way, but their file structures differ. A skill is a **directory containing a`SKILL.md` file** (`.claude/skills/deploy/SKILL.md`); a command is a **flat Markdown file** (`.claude/commands/deploy.md`). A flat file placed directly inside `.claude/skills/` does not create a command. The `.claude/skills/` path is the canonical location. `.claude/commands/` still works for backward compatibility.
### The Unified Skills System
Both paths produce the same result — a `/command` that developers can invoke:
  * `.claude/commands/deploy.md` creates `/deploy` — a flat file whose filename becomes the command name
  * `.claude/skills/deploy/SKILL.md` also creates `/deploy` — one directory per skill, named after the command, with `SKILL.md` as the required entrypoint inside it


The skills path is the recommended one because it adds features the commands alias does not: a supporting-files directory alongside the SKILL.md, automatic discovery so Claude can load a skill when it matches your intent, and precedence when a skill and a command share the same name (the skill wins). Both paths support the same YAML frontmatter (`context: fork`, `allowed-tools`, `argument-hint`) and both produce the same `/command`, so existing `.claude/commands/` files keep working unchanged.
### Two Scoping Levels
**Project-scoped (shared via git):**
Place skills in `.claude/skills/` (canonical) or `.claude/commands/` (alias) inside your repository. Both are version-controlled and shared via git. Every developer who clones or pulls the repository gets these commands automatically. Use for team-wide workflows: `/review`, `/deploy-check`, `/lint`, `/migration-guide`.
markdownCopy

```
<!-- .claude/commands/review.md — creates /review -->
Review the staged changes against our team checklist:
1. Check error handling patterns
2. Verify test coverage for new functions
3. Confirm API naming conventions
4. Flag any hardcoded credentials or secrets

```

**User-scoped (personal):**
Place skills in `~/.claude/skills/` (canonical) or `~/.claude/commands/` (alias). These are personal and not version-controlled or shared. Use for individual productivity workflows that other team members do not need.
Key Concept
The scoping pattern is consistent across Claude Code: project-level (`.claude/`) is shared via git; user-level (`~/.claude/`) is personal. This applies to CLAUDE.md, commands/skills, and rules. Memorise this pattern — it appears throughout Domain 3. Both `.claude/commands/` and `.claude/skills/` are project-scoped and create the same commands; `.claude/skills/` is the canonical, fuller-featured path. Keep the file shapes straight, though: skills are directories with a `SKILL.md` inside; commands are flat `.md` files.
### Skills Frontmatter: Optional Configuration
Skills in `.claude/skills/` with `SKILL.md` files support optional YAML frontmatter configuration. This frontmatter also works with `.claude/commands/` files, but `.claude/skills/` is the canonical location for configured skills. Skills are task-specific workflows invoked on demand — they aren't loaded automatically like CLAUDE.md.
The three critical frontmatter options:
**`context: fork`**
Runs the skill in an isolated sub-agent context. All the verbose output stays contained in the fork, and the main conversation stays clean. This is essential for:
  * Codebase analysis (produces extensive file listings and code excerpts)
  * Brainstorming (generates many alternatives and evaluations)
  * Any task that produces noisy, exploratory output


Without `context: fork`, skill output flows into the main conversation and consumes context window tokens. For verbose skills, this degrades the quality of subsequent responses.
The frontmatter sits at the top of the skill's `SKILL.md`. For a skill invoked as `/analyse-feature`, that file lives at `.claude/skills/analyse-feature/SKILL.md`:
yamlCopy

```
---
description: "Analyse a feature area of the codebase and report structure, patterns and risks"
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
argument-hint: "Provide a feature description or area of the codebase to analyse"
---

```

The `description` line isn't one of the three the exam tests. Leave it out of a real skill, though, and Claude has nothing to match your request against, so the skill only ever fires when you type `/analyse-feature` yourself.
**`allowed-tools`**
Pre-approves the listed tools so Claude can use them without a permission prompt while the skill is active. It does not restrict which tools are available: every other tool remains callable, and your normal permission settings still govern anything that is not listed. Use it to let a trusted workflow run without stopping to ask on each call.
Current state
The exam guide (v1.0) describes `allowed-tools` as restricting the skill's tool access, and that is the keyed answer: if a question asks what the field does, answer "restricts". The pre-approval behaviour above is what current Claude Code (September 2026) actually does. The Domain 3 quick reference and this lesson's Concept Check prompt carry the same two-part note.
yamlCopy

```
---
allowed-tools:
  - Read
  - Grep
  - Glob
---

```

To _remove_ tools from Claude's pool while a skill runs, which is the actual security boundary, list them in `disallowed-tools` instead, or add deny rules in your permission settings.
**`argument-hint`**
A hint shown during autocomplete to indicate the arguments the skill expects. Improves the developer experience by making inputs explicit rather than relying on the developer to remember what the skill needs. It is a label, not an interactive prompt: invoking the skill with no arguments does not stop and ask for them.
Current state
Exam guide v1.0 describes `argument-hint` as prompting developers for required parameters when they invoke the skill without arguments, and that is the expected exam answer. As of 14 August 2026 the [skills frontmatter reference](https://code.claude.com/docs/en/skills) defines it as a "Hint shown during autocomplete to indicate expected arguments." No bank or pack item keys on its behaviour, so the exercise above teaches the current behaviour.
yamlCopy

```
---
argument-hint: "Specify the module path to analyse (e.g., src/api/auth)"
---

```

Current state: description is the field that does the most work
Those three are the ones the exam guide (v1.0) names, and they're what a question will key on. The live field list is much longer, and the one you'll reach for first isn't on the guide's list at all: `description`. It's what Claude reads to decide whether a skill applies to what you just asked, so a skill without a useful one only ever runs when you type `/name` yourself. The docs mark it **Recommended** rather than required: leave it out and Claude Code falls back to the first paragraph of the skill body, which is usually a worse summary than one you'd write. Also live: `disallowed-tools`, `disable-model-invocation`, `model`, `effort` and `when_to_use`. ([Claude Code skills docs](https://code.claude.com/docs/en/skills), verified August 2026.)
### Skills vs CLAUDE.md: The Critical Distinction
This distinction is tested directly on the exam:
  * **Skills** = on-demand, task-specific workflows. Their descriptions are always in context so Claude knows they exist, but the full skill body loads only when invoked. Invocation can be explicit (`/skill-name`) or automatic: Claude picks up skills whose `description` matches the user's intent, or skills with a `paths` frontmatter field when you're working on matching files. Skills with `disable-model-invocation: true` require explicit user invocation.
  * **CLAUDE.md** = always-loaded, universal standards. Applied automatically to every session, with no invocation step.


The rule: do not put task-specific procedures in CLAUDE.md. Do not put always-on reference material in skills.
API naming conventions that must apply to every code generation task belong in CLAUDE.md (or `.claude/rules/`). A multi-step codebase analysis workflow that a developer runs occasionally belongs in a skill. For conventions that apply to a specific file type — like test files — path-scoped `.claude/rules/` are the best fit because they load as always-on context alongside matching files.
### Personal Skill Customisation
Create personal variants in `~/.claude/skills/` (or `~/.claude/commands/`) with different names to avoid affecting teammates. If the team has a standard `/analyse` skill but you prefer a more verbose version, create your own in `~/.claude/skills/` with a different name (e.g., `/deep-analyse`). Your personal skill doesn't override or conflict with the team version.
### Where to Place Custom Commands: Quick Reference  
| Need  | Canonical location  | Also works  | Scoping  |  
| --- | --- | --- | --- |  
| Team-wide command  | `.claude/skills/<name>/SKILL.md`  | `.claude/commands/<name>.md`  | Project (shared via git)  |  
| Team-wide command with frontmatter config  | `.claude/skills/<name>/SKILL.md`  | `.claude/commands/<name>.md`  | Project (shared via git)  |  
| Personal command  | `~/.claude/skills/<name>/SKILL.md`  | `~/.claude/commands/<name>.md`  | User (not shared)  |  
| Universal standards  |  `.claude/CLAUDE.md` or root `CLAUDE.md`  | —  | Project (always loaded)  |  
| Personal preferences  | `~/.claude/CLAUDE.md`  | —  | User (not shared)  |  
## Exam Traps
Exam Trap
Creating a flat Markdown file directly inside .claude/skills/ (e.g., .claude/skills/review.md) and expecting a /review command
The two paths create the same commands but have different file structures. A skill is a directory containing a SKILL.md entrypoint (.claude/skills/review/SKILL.md); a flat .md file only creates a command under .claude/commands/ (.claude/commands/review.md). A loose file dropped straight into .claude/skills/ is not picked up.
Exam Trap
Placing a team-shared command in a user-scoped path (~/.claude/commands/ or ~/.claude/skills/) instead of a project-scoped path
User-scoped paths (~/.claude/commands/ and ~/.claude/skills/) are personal and not version-controlled. Team commands that should be available to everyone on clone must go in a project-scoped path (.claude/skills/ or .claude/commands/) inside the repository. Both project-scoped paths create the same commands; .claude/skills/ is the canonical, fuller-featured location.
Exam Trap
Thinking skills behave like CLAUDE.md for always-on guidance
Skills load on-demand as task-style workflows, not as always-in-context guidance. Claude can auto-invoke a skill when the prompt matches the skill's description (or when a paths-scoped skill matches an edited file), but the skill still loads as a separate invocation-style unit rather than shaping every session by default. CLAUDE.md and .claude/rules/ load automatically into context for every session (or every matching file, for path-scoped rules). If the question asks about always-on conventions that apply to every edit, the answer is CLAUDE.md or .claude/rules/, not a skill.
Exam Trap
Not knowing when to use context: fork
context: fork isolates verbose skill output from the main conversation. Without it, brainstorming or codebase analysis output pollutes the context window. The exam will present scenarios where verbose output clutters the main conversation — the fix is context: fork.
Exam Trap
Putting task-specific workflows in CLAUDE.md
CLAUDE.md is for always-loaded universal standards. Task-specific procedures (code review workflows, analysis routines, brainstorming templates) belong in skills that are invoked on demand.
## Practice Scenario
A team wants a /review command available to everyone who clones the repository. A developer also wants a personal /brainstorm skill that produces verbose codebase analysis output without cluttering the main conversation. Where should each be created and what configuration does the skill need?
Option ABoth in ~/.claude/commands/ with a note in the README instructing every developer to copy the two files into their own local setup
Option BCreate both in .claude/commands/ so they ship with the repository, giving the brainstorm skill context: fork frontmatter for isolation
Option C/review in .claude/commands/ for team sharing; /brainstorm as ~/.claude/skills/brainstorm/SKILL.md with context: fork frontmatter
Option D/review in CLAUDE.md as a documented procedure, and /brainstorm in .claude/skills/ carrying only its own allowed-tools restrictions
Check Answer
## Build Exercise
Build Exercise
#### Create Custom Commands and Skills
Difficulty
30 minutes
What you'll learn
  * Distinguish between project-scoped and user-scoped command locations
  * Configure SKILL.md frontmatter with context: fork, allowed-tools, and argument-hint
  * Understand when to use skills vs CLAUDE.md for conventions vs workflows
  * Verify scoping boundaries between shared and personal configuration
  * Apply the context: fork pattern to isolate verbose output from the main conversation


  1. Create a project-scoped /review command in .claude/commands/review.md containing a team code review checklist
Why: Project-scoped commands are shared via git so every developer gets them on clone. The exam tests whether you place team commands in .claude/commands/ (project) vs ~/.claude/commands/ (personal).
You should see: A file at .claude/commands/review.md in the repository. Running /review in Claude Code triggers the code review checklist. The command appears when any developer clones the repository.
Stuck? Get a nudge
  2. Create a personal /brainstorm skill in ~/.claude/skills/brainstorm/SKILL.md with context: fork in the frontmatter
Why: The context: fork frontmatter option isolates verbose skill output from the main conversation. Without it, codebase analysis output fills the context window and degrades subsequent responses. The exam directly tests this concept.
You should see: A SKILL.md file at ~/.claude/skills/brainstorm/SKILL.md with YAML frontmatter containing context: fork. The skill is available only in your sessions, not shared with teammates.
Stuck? Get a nudge
  3. Add allowed-tools to the brainstorm skill, restricting it to Read, Grep, and Glob (read-only operations)
Why: The exam guide describes allowed-tools as restricting which tools a skill can access, and that is the expected exam answer. In current Claude Code it pre-approves the listed tools so they run without a permission prompt (disallowed-tools is the actual boundary), but the intent is the same: a read-only analysis skill should never be using Write or Bash.
You should see: The SKILL.md frontmatter now includes an allowed-tools list with exactly Read, Grep, and Glob. Under the exam-guide model the skill cannot use Write or Bash; in current Claude Code the list pre-approves those three tools for promptless use.
Stuck? Get a nudge
  4. Add argument-hint to the brainstorm skill: "Provide a feature description or codebase area to explore"
Why: The argument-hint is shown during autocomplete to indicate the arguments a skill expects. It improves developer experience and is one of the three SKILL.md frontmatter options tested on the exam.
You should see: The SKILL.md frontmatter now includes argument-hint. Typing /brainstorm at the prompt shows the hint text alongside the command in autocomplete, indicating what input it expects.
Stuck? Get a nudge
  5. Test that /review appears for all project users (shared via git) and /brainstorm only for you
Why: This verifies the scoping boundary that the exam repeatedly tests: .claude/ is project-scoped and shared via git, while ~/.claude/ is user-scoped and personal. Confirming this experimentally solidifies the concept.
You should see: Running /review works in any clone of the repository. Running /brainstorm works only in your session. A colleague or fresh clone without your home directory config does not see /brainstorm as an available command.
Stuck? Get a nudge
  6. Invoke the brainstorm skill and verify that its verbose output does not appear in the main conversation context
Why: The context: fork option runs the skill in an isolated sub-agent. The main conversation receives only the summary, not the full verbose output. This is critical for preserving context window tokens during exploratory tasks.
You should see: After invoking /brainstorm with a codebase area, the main conversation shows a concise summary of findings. The verbose file listings, code excerpts, and analysis notes are not visible in the main conversation history. Subsequent responses remain high quality because the context window is not filled with exploration output.
Stuck? Get a nudge


## Sources
  * [Claude Code Skills Documentation (custom slash commands are part of the unified Skills system)](https://code.claude.com/docs/en/skills) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.2](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic


---


Domain 3Task 3.3
# Path-Specific Rules for Conditional Convention Loading
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Path-specific rules apply conventions conditionally, based on which files you're editing. They solve something neither root CLAUDE.md nor directory-level CLAUDE.md handles well: conventions that must apply to one file type scattered across many directories.
### How Path-Specific Rules Work
Rule files live in the `.claude/rules/` directory. Each file carries YAML frontmatter with a `paths` field specifying glob patterns. The rules inside load only when you're editing files that match those patterns.
yamlCopy

```
---
paths: ["terraform/**/*"]
---
# Terraform Conventions

- Use snake_case for all resource names
- Tag every resource with environment and team labels
- Never hardcode AMI IDs — use data sources
- All modules must have a variables.tf, outputs.tf, and README.md

```

Edit a file matching `terraform/**/*` and these rules load automatically. Edit a React component or an API handler and they don't. The rules stay invisible until they're relevant.
### Glob Patterns Match Across the Entire Codebase
This is where they earn their keep. A glob like `**/*.test.tsx` catches every test file in the codebase, wherever it sits. Take a typical project structure:
Copy
```
src/
  components/
    Button.tsx
    Button.test.tsx
  api/
    auth.ts
    auth.test.ts
  utils/
    format.ts
    format.test.ts
  pages/
    dashboard/
      Dashboard.tsx
      Dashboard.test.tsx

```

Test files sit next to their source files across four directories. A path-specific rule with `paths: ["**/*.test.tsx", "**/*.test.ts"]` applies the same test conventions to every one of them, automatically.
### Why Not Directory-Level CLAUDE.md?
A directory-level CLAUDE.md applies to files in that one directory. To cover test files spread across 50+ directories, you'd have to drop a CLAUDE.md into every single directory that holds tests. That means:
  * 50+ copies of the same conventions
  * Every new directory with tests needs a new copy
  * Any convention change requires updating all 50+ files
  * Inevitable drift as some copies fall behind


Path-specific rules with glob patterns eliminate this entirely. One file, one pattern, universal coverage.
### Why Not Root CLAUDE.md?
Root CLAUDE.md loads for every session, regardless of which files you edit. Put your Terraform conventions in the root CLAUDE.md and they burn tokens even while you're editing React components. Put your test conventions there and they load while you're writing API handlers.
Key Concept
Path-scoped rules are more token-efficient than root CLAUDE.md because they load ONLY when editing matching files. This reduces irrelevant context and keeps the model focused on conventions that actually apply to the current work. In large projects with many convention categories, this efficiency gain is substantial.
### Practical Rule File Examples
**Test conventions across the entire codebase:**
yamlCopy

```
---
paths: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
---
# Test Conventions

- Use describe/it blocks with descriptive names that read as sentences
- Each test file must have at least one happy path and one error case
- Use factory functions for test data, not inline object literals
- Mock external services at the module boundary, not individual functions
- Assert behaviour, not implementation details

```

**API conventions for any route handler:**
yamlCopy

```
---
paths: ["src/api/**/*", "**/routes/**/*", "**/*.controller.ts"]
---
# API Conventions

- All endpoints return { data, error, metadata } response shape
- Use Zod schemas for request validation at the handler boundary
- Log request ID on every error response
- Rate limiting configuration must be explicit, not inherited from defaults

```

**Infrastructure-as-code conventions:**
yamlCopy

```
---
paths: ["terraform/**/*", "**/*.tf", "infrastructure/**/*"]
---
# Infrastructure Conventions

- State files must reference remote backends, never local
- Use workspaces for environment separation
- Every module must be versioned with a CHANGELOG

```

### When to Use Each Approach  
| Scenario  | Best approach  |  
| --- | --- |  
| Universal team standards that apply to all code  | Root CLAUDE.md  |  
| Conventions for one specific package directory  | Directory-level CLAUDE.md  |  
| Conventions for a file type spread across many directories  | Path-specific rules with glob patterns  |  
| Task-specific workflows invoked on demand  | Skills in .claude/skills/  |  
The exam frequently presents the scenario of test files co-located with source files across many directories. The answer is always path-specific rules with glob patterns.
## Exam Traps
Exam Trap
Choosing directory-level CLAUDE.md over path-specific rules for cross-directory conventions
When conventions must apply to files spread across 50+ directories (like co-located test files), path-specific rules with glob patterns are correct. Directory-level CLAUDE.md would require placing a file in every directory — a massive maintenance burden.
Exam Trap
Placing file-type-specific conventions in root CLAUDE.md
Root CLAUDE.md loads for every session regardless of which files you edit. Terraform conventions consume tokens when editing React components. Path-specific rules load only when editing matching files, preserving token budget.
Exam Trap
Confusing skills with path-specific rules for automatic convention application
Both skills and .claude/rules/ can auto-activate via a paths frontmatter, but they serve different purposes. Rules stay in context as background guidance — loaded when Claude reads a matching file — so they shape every edit. Skills load on-demand as task-style workflows, triggered either by the model's intent match or by explicit invocation. When the question asks about automatic, always-on convention loading for a file type, path-specific rules are the right answer.
## Practice Scenario
A codebase has test files co-located with source files throughout 50+ directories (e.g., Button.test.tsx next to Button.tsx). The team wants all tests to follow the same conventions regardless of location. What is the most maintainable approach?
Option AAdd all the test conventions to the root CLAUDE.md file so they are loaded into context for every session
Option BCreate a rule file in .claude/rules/ with YAML frontmatter paths: ["**/*.test.tsx", "**/*.test.ts"] holding the test conventions for the repo
Option CPlace a CLAUDE.md file in every directory that contains test files, each carrying a copy of the team test conventions
Option DCreate a skill in .claude/skills/ that includes the test conventions and instruct developers to invoke it before writing or editing any tests
Check Answer
## Build Exercise
Build Exercise
#### Configure Path-Specific Rules with Glob Patterns
Difficulty
30 minutes
What you'll learn
  * Write YAML frontmatter with glob patterns for conditional rule loading
  * Apply path-specific rules to files spread across many directories
  * Understand why path-specific rules are more token-efficient than root CLAUDE.md
  * Distinguish when to use path-specific rules vs directory-level CLAUDE.md
  * Verify conditional loading behaviour using the /context command


  1. Create .claude/rules/testing.md with YAML frontmatter paths: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"] and test conventions (naming, assertions, mocking patterns)
Why: Path-specific rules with glob patterns are the correct solution for conventions that apply to a file type spread across many directories. The exam favourite scenario is test files co-located with source files across 50+ directories.
You should see: A file at .claude/rules/testing.md with YAML frontmatter containing a paths array with glob patterns. The body contains at least three test conventions covering naming, assertions, and mocking.
Stuck? Get a nudge
  2. Create .claude/rules/api-conventions.md with paths: ["src/api/**/*", "**/routes/**/*"] and API conventions (response shape, validation, error handling)
Why: Separating API conventions into their own path-scoped rule means they only load when editing API files. This avoids consuming tokens with irrelevant context when working on frontend or infrastructure code.
You should see: A file at .claude/rules/api-conventions.md with YAML frontmatter paths targeting API directories. The body contains at least three API conventions.
Stuck? Get a nudge
  3. Create .claude/rules/terraform.md with paths: ["terraform/**/*", "**/*.tf"] and infrastructure conventions
Why: Infrastructure conventions are completely irrelevant when editing application code. Path-scoped rules ensure Terraform rules never consume tokens during React or API development sessions.
You should see: A file at .claude/rules/terraform.md with YAML frontmatter paths matching Terraform files. The body contains infrastructure-specific conventions.
Stuck? Get a nudge
  4. Edit a test file and use /context to verify that testing rules are loaded but API and Terraform rules are not
Why: This proves the conditional loading mechanism works. The exam tests whether you understand that path-specific rules load only for matching files, and /context is the diagnostic tool to verify this.
You should see: When editing a .test.ts file, /context output lists .claude/rules/testing.md as loaded. The .claude/rules/api-conventions.md and .claude/rules/terraform.md files do NOT appear in the /context output.
Stuck? Get a nudge
  5. Edit an API handler and verify that API rules load while testing and Terraform rules do not
Why: This is the complementary verification. Switching contexts should swap which rules are loaded, confirming that the glob patterns correctly scope each rule file.
You should see: When editing a file in src/api/, /context output lists .claude/rules/api-conventions.md as loaded. The testing and Terraform rule files do NOT appear.
Stuck? Get a nudge
  6. Compare the token footprint when all conventions are in root CLAUDE.md versus split into path-specific rules
Why: Token efficiency is a key exam concept. Root CLAUDE.md loads all conventions for every session regardless of relevance. Path-specific rules load only matching conventions, reducing irrelevant context and preserving token budget for actual work.
You should see: With all conventions in root CLAUDE.md, /context shows the full set of conventions loaded even when editing a simple utility file. With path-specific rules, /context shows only the relevant subset. The token count for loaded configuration is measurably smaller when using path-specific rules for targeted editing sessions.
Stuck? Get a nudge


## Sources
  * [Claude Code Memory and Rules Documentation](https://code.claude.com/docs/en/memory) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.3](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Sample Question 6](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic


---


Domain 3Task 3.4
# Plan Mode vs Direct Execution
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Claude Code works in two main modes: plan mode and direct execution. The exam tests whether you can pick the right one for a given task. It's not a matter of taste — there are clear criteria for when each mode fits.
### Plan Mode: When to Use It
Plan mode is for complex tasks where you need to explore the codebase, evaluate multiple approaches, and design a strategy before making changes. Use plan mode when:
  * **Large-scale changes are involved.** Restructuring a monolith into microservices, reorganising a module system, or refactoring a core abstraction all require understanding the existing structure before changing it.
  * **Multiple valid approaches exist.** When there are different ways to solve the problem (e.g., different integration architectures with different infrastructure requirements), you need to evaluate them before committing.
  * **Architectural decisions are required.** Service boundaries, module dependencies, API contracts — these decisions have downstream consequences. Planning prevents costly rework.
  * **Multi-file modifications are needed.** A library migration affecting 45+ files requires a consistent strategy. Without a plan, you risk applying the migration inconsistently across files.
  * **Codebase exploration is necessary.** When you need to understand dependencies, trace data flows, or map the existing structure before changing anything.


Plan mode enables safe exploration and design. Claude reads the codebase, analyses dependencies, and proposes an approach — all without modifying any files.
### Direct Execution: When to Use It
Direct execution is for well-understood changes with clear, limited scope. Use direct execution when:
  * **The change is well-scoped.** A single-file bug fix with a clear stack trace. Adding a date validation conditional. Updating a configuration value.
  * **The correct approach is already known.** You know what needs to change, where, and how. There is no design decision to make.
  * **The scope is limited.** One function, one file, one clear modification.


Direct execution skips the planning phase and makes changes straight away. For simple, well-defined tasks, planning adds nothing.
Key Concept
The decision is not about difficulty but about ambiguity. A difficult but well-defined bug fix (clear stack trace, single function, known cause) is direct execution. A seemingly simple feature request that could be implemented three different ways and affects multiple modules is plan mode.
### The Explore Subagent
The Explore subagent keeps verbose discovery output out of the main conversation. On multi-phase tasks, exploring the codebase throws off a lot: file listings, dependency graphs, code excerpts, analysis notes. Let all that flow into the main conversation and it fills the context window, which drags down the quality of later responses.
The Explore subagent:
  1. Runs the exploration in isolation
  2. Produces summaries of its findings
  3. Returns those summaries to the main conversation
  4. Keeps the main context window clean for the actual implementation work


Use the Explore subagent during multi-phase tasks where the discovery phase is verbose but the implementation phase needs focused context.
### The Hybrid Approach: Plan Then Execute
The combination of plan mode for investigation and direct execution for implementation is common in practice and tested on the exam. The pattern:
  1. **Plan phase:** Use plan mode to explore the codebase, understand dependencies, evaluate approaches, and design the implementation strategy.
  2. **Execute phase:** Switch to direct execution to implement the planned approach, file by file, with the strategy already decided.


For example, migrating from one logging library to another across 30 files:
  * **Plan:** Identify all files importing the old library, map the API differences between old and new, design the migration pattern, check for edge cases.
  * **Execute:** Apply the migration pattern to each file using the planned approach.


It's plan THEN direct, not plan OR direct. The exam expects you to spot the pattern.
### Decision Framework Summary  
| Task characteristics  | Mode  |  
| --- | --- |  
| Architectural restructuring  | Plan mode  |  
| Library migration (many files)  | Plan mode (then direct execution)  |  
| Multiple valid implementation approaches  | Plan mode  |  
| Codebase exploration needed  | Plan mode (with Explore subagent)  |  
| Single-file bug fix with clear stack trace  | Direct execution  |  
| Adding a validation check to one function  | Direct execution  |  
| Configuration value update  | Direct execution  |  
| Known fix, known location, known approach  | Direct execution  |  
### Recognising Complexity Upfront
A common exam trap: starting in direct execution and switching to plan mode only once complexity shows up. When the requirements already say the task is complex (e.g., "restructure the monolith into microservices"), reach for plan mode straight away. The complexity isn't going to emerge later — it's right there in the task description. Waiting for surprises is the wrong move.
## Exam Traps
Exam Trap
Defaulting to direct execution for multi-file architectural changes
Multi-file modifications with multiple valid approaches require plan mode. Direct execution risks costly rework when dependencies are discovered late. If the task involves architectural decisions or affects many files, plan first.
Exam Trap
Using plan mode for a single-file bug fix with a clear stack trace
A single-function fix with a known cause and clear stack trace is the textbook case for direct execution. Plan mode adds unnecessary overhead when the problem, location, and solution are all clear.
Exam Trap
Not recognising the plan-then-execute hybrid pattern
The exam tests whether you know to combine plan mode for investigation with direct execution for implementation. This is the correct approach for tasks like library migrations: plan the strategy, then execute it.
Exam Trap
Starting direct execution and switching to plan mode only when complexity emerges
When complexity is already stated in the requirements (e.g., monolith restructuring), plan mode should be chosen upfront. The complexity is known, not speculative. Do not wait for surprises.
## Practice Scenario
Your team faces three tasks: (1) restructure a monolith into microservices, (2) fix a null pointer exception in a single function with a clear stack trace, (3) migrate from one logging library to another across 30 files. Which mode should be used for each?
Option APlan mode for (1) and (3), and direct execution for (2)
Option BPlan mode for all three, since they all involve code changes
Option CDirect execution for all three with comprehensive upfront instructions
Option DPlan mode only for (1), direct execution otherwise
Check Answer
## Build Exercise
Build Exercise
#### Practice Plan Mode vs Direct Execution Decision-Making
Difficulty
45 minutes
What you'll learn
  * Apply the decision framework for choosing plan mode vs direct execution based on task ambiguity
  * Execute the hybrid plan-then-execute pattern for multi-file migrations
  * Use the Explore subagent to isolate verbose discovery output from the main conversation
  * Recognise complexity upfront rather than waiting for it to emerge
  * Distinguish task difficulty from task ambiguity when selecting execution mode


  1. Identify a complex multi-file task in a codebase (refactoring, migration, or restructuring) and use plan mode to explore dependencies and design an approach
Why: Plan mode is for tasks with multiple valid approaches, architectural decisions, or multi-file modifications. The exam tests whether you choose plan mode upfront when complexity is stated in the requirements rather than waiting for surprises.
You should see: Claude Code explores the codebase without modifying any files. The output includes: identified dependencies between modules, multiple possible approaches with tradeoffs, and a recommended implementation strategy. No files are changed during the planning phase.
Stuck? Get a nudge
  2. Identify a simple single-file bug and use direct execution to fix it — observe the efficiency gain over planning
Why: Direct execution is correct when the problem, location, and solution are all clear. The exam tests that you do not over-plan well-understood changes. The decision is about ambiguity, not difficulty.
You should see: Claude Code makes the fix immediately without a planning phase. The change is confined to a single file or function. The total time from prompt to fix is noticeably shorter than the plan mode task above.
Stuck? Get a nudge
  3. Use the hybrid approach: plan mode to design a migration strategy for a library change across multiple files, then switch to direct execution to implement the plan
Why: The plan-then-execute hybrid is a specific pattern tested on the exam. Plan mode designs the strategy; direct execution applies it consistently. This is the correct approach for tasks like library migrations affecting many files.
You should see: Phase 1 (plan): Claude identifies all files importing the old library, maps API differences, and produces a migration pattern. Phase 2 (execute): Claude applies the migration pattern file by file using the planned approach. The implementation is consistent across all files.
Stuck? Get a nudge
  4. Use the Explore subagent for a verbose codebase discovery task and observe how it keeps the main conversation context clean
Why: The Explore subagent isolates verbose discovery output so the main conversation context stays focused. Without isolation, extensive file listings and analysis fill the context window and degrade subsequent responses.
You should see: The Explore subagent runs the discovery task and returns a concise summary to the main conversation. The full verbose output (file listings, dependency graphs, code excerpts) is not visible in the main conversation. Subsequent responses in the main conversation remain high quality.
Stuck? Get a nudge
  5. Create a written decision framework: list your criteria for choosing plan mode vs direct execution, with examples for each
Why: Internalising the decision criteria is essential for the exam. The framework should cover the key distinction: ambiguity determines the mode, not difficulty. A difficult but well-defined fix is direct execution; a simple-sounding feature with multiple approaches is plan mode.
You should see: A clear decision framework with at least four criteria for plan mode and three for direct execution. Each criterion has a concrete example. The framework explicitly addresses the ambiguity-vs-difficulty distinction.
Stuck? Get a nudge


## Sources
  * [Claude Code Plan Mode Documentation](https://code.claude.com/docs/en/commands#plan) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.4](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Sample Question 5](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic


---


Domain 3Task 3.5
# Iterative Refinement Techniques
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Working with Claude Code is iterative. The first output is rarely the final one. The exam checks that you know the specific techniques for steering Claude Code toward the right result — and which one to reach for first in each situation.
### The Technique Hierarchy
Not all refinement techniques are equal. There's a clear pecking order:
**1. Concrete input/output examples (most effective for inconsistent interpretation)**
When you describe a code transformation in prose and Claude Code interprets it differently each time, the fix is not more prose. The fix is concrete examples.
Provide 2-3 examples showing the exact input and the exact expected output:
textCopy

```
Input:
  getUserData(userId: string): Promise<UserData>

Expected output:
  getUserData(userId: string): Promise<Result<UserData, ApiError>>

```

textCopy

```
Input:
  fetchOrders(customerId: string): Promise<Order[]>

Expected output:
  fetchOrders(customerId: string): Promise<Result<Order[], ApiError>>

```

The model generalises from these examples more reliably than from any prose description. Two or three concrete examples set the pattern, and the model applies it to new cases. This is the first technique to reach for when interpretation is inconsistent.
**2. Test-driven iteration (most effective for complex transformations)**
Write the tests first. Define the expected behaviour through test cases covering:
  * Happy path (the standard expected transformation)
  * Edge cases (null values, empty inputs, boundary conditions)
  * Performance requirements (if applicable)


Then share the test failures with Claude Code. The failures give concrete, unambiguous feedback about what needs fixing. There's no room for interpretation when the test output says "Expected X, got Y."
textCopy

```
FAIL: testMigrationHandlesNullValues
  Expected: null preserved in output JSON
  Actual: null replaced with empty string ""

```

This failure message tells Claude Code exactly what to fix. No prose explanation needed.
**3. Interview pattern (most effective for unfamiliar domains)**
When you're working in a domain where you lack expertise, have Claude ask questions before implementing. This surfaces considerations you'd otherwise miss.
Instead of prescribing a solution:
> "Build me a caching layer for the API"
Use the interview pattern:
> "I need a caching layer for the API. Before implementing, ask me questions about the requirements, edge cases, and constraints I should consider."
Claude might ask about cache invalidation strategies, TTL policies, consistency requirements, and failure modes — considerations that an expert would know to address but that you might overlook.
Key Concept
The interview pattern is for unfamiliar domains where the developer might miss important considerations. Concrete examples are for when the developer knows the exact transformation but the model interprets it inconsistently. Do not confuse the two — they solve different problems.
### Batch vs Sequential Feedback
How you deliver feedback matters. The rule:
**Single message (batch) when fixes interact with each other:**
If changing the error handling pattern also affects the logging format and the response structure, provide all three pieces of feedback in one message. The model needs to see all the interacting constraints at once to produce a coherent fix.
textCopy

```
Three changes needed (they interact with each other):
1. Error responses must include an error code field
2. Logging must include the error code in structured format
3. The client SDK type definitions must reflect the new error code field

```

**Sequential iteration when issues are independent:**
If the naming convention issue and the indentation issue don't affect each other, fix them one at a time. Batching independent issues can confuse the model about which feedback applies to which part of the code.
textCopy

```
First iteration: "Fix the function naming — use camelCase throughout"
[Wait for result]
Second iteration: "Now update the indentation to use 2 spaces"

```

### Example-Based Communication in Practice
When prose descriptions produce inconsistent results, the switch to examples follows a clear pattern:
  1. **Observe inconsistency:** You describe a transformation, Claude Code does it differently each time.
  2. **Switch to examples:** Provide 2-3 concrete before/after pairs showing the exact transformation.
  3. **Verify generalisation:** Test on a new case to confirm the model generalises the pattern correctly.
  4. **Add edge case examples if needed:** If the model handles the standard case but misses edge cases, add examples specifically showing edge case handling.


It's not about piling on more examples. Two or three well-chosen ones that cover the standard case and a key edge case are enough. The model generalises the pattern; you don't need to hand it every possible case.
### When Each Technique Applies  
| Situation  | Technique  |  
| --- | --- |  
| Prose description interpreted differently each time  | Concrete input/output examples  |  
| Complex transformation with many edge cases  | Test-driven iteration  |  
| Working in an unfamiliar domain  | Interview pattern  |  
| Multiple issues that affect each other  | Batch feedback (one message)  |  
| Multiple independent issues  | Sequential feedback  |  
## Exam Traps
Exam Trap
Choosing to refine prose descriptions when the model interprets them inconsistently
More precise prose still relies on interpretation. Concrete input/output examples eliminate interpretation ambiguity. The answer to inconsistent interpretation is always examples first, not better prose.
Exam Trap
Not recognising when to batch vs sequence feedback
If issues interact (fixing A affects B), provide all in one message so the model sees all constraints. If issues are independent, fix sequentially. The exam tests this distinction directly.
Exam Trap
Confusing the interview pattern with the examples technique
The interview pattern is for unfamiliar domains where you might miss considerations. Examples are for when you know the exact transformation but the model misinterprets it. Different problems, different solutions.
## Practice Scenario
A developer describes a code transformation in prose. Claude Code interprets it differently each time, producing inconsistent results. What technique should the developer try first?
Option AProvide 2-3 concrete input/output examples showing the exact before and after transformation
Option BWrite a comprehensive test suite and iterate by sharing test failures
Option CUse the interview pattern to have Claude ask clarifying questions before implementing
Option DRewrite the prose description with more precise language and technical terminology
Check Answer
## Build Exercise
Build Exercise
#### Practice Iterative Refinement Techniques
Difficulty
30 minutes
What you'll learn
  * Apply the technique hierarchy: concrete examples over prose for inconsistent interpretation
  * Use test-driven iteration to provide unambiguous feedback via test failures
  * Deploy the interview pattern for unfamiliar domains to surface hidden requirements
  * Distinguish when to batch feedback vs iterate sequentially based on issue interdependence
  * Recognise that 2-3 well-chosen examples are sufficient for pattern generalisation


  1. Describe a code transformation in prose and run it three times, noting how interpretation varies across runs
Why: This demonstrates the core problem that concrete examples solve. Prose descriptions rely on interpretation, and interpretation varies across runs. Observing this inconsistency firsthand makes the case for switching to examples.
You should see: Three different outputs from the same prose description. The variations may be subtle (different naming choices, different edge case handling) or significant (different structural approaches). This proves that prose alone produces inconsistent results.
Stuck? Get a nudge
  2. Provide 2-3 concrete input/output examples of the same transformation and run it three times — compare the consistency
Why: Concrete examples are the documented first-line technique for inconsistent interpretation. The model generalises from examples more reliably than from prose. This step proves the effectiveness difference experimentally.
You should see: Three outputs that are consistent with each other and match the pattern established by the examples. The variation observed in the prose-only step is eliminated or drastically reduced.
Stuck? Get a nudge
  3. Write a test suite for a function with happy path, edge cases, and error cases, then iterate by sharing test failures with Claude Code
Why: Test-driven iteration is the most effective technique for complex transformations. Test failures provide unambiguous feedback — "Expected X, got Y" leaves no room for interpretation. This technique complements examples for more complex scenarios.
You should see: After sharing test failures, Claude Code makes targeted fixes that address the specific failing assertions. Each iteration reduces the number of failing tests. The feedback loop is faster and more precise than prose-based corrections.
Stuck? Get a nudge
  4. Use the interview pattern for a task outside your expertise — ask Claude to pose questions before implementing and note what considerations surface
Why: The interview pattern is for unfamiliar domains where you might miss important requirements. It surfaces considerations an expert would know to address. The exam tests whether you can distinguish this from the examples technique — they solve different problems.
You should see: Claude asks 5-10 targeted questions about requirements, edge cases, and constraints you had not considered. The questions reveal considerations like cache invalidation strategies, consistency requirements, failure modes, or security implications that would have been missed.
Stuck? Get a nudge
  5. Practice batching: give Claude three interdependent issues in one message and observe whether the fix is coherent across all three
Why: When issues interact, batching them in one message lets the model see all constraints simultaneously. Sequential fixing of interdependent issues causes the model to fix one issue in a way that conflicts with the others. The exam tests this distinction.
You should see: A single coherent fix that addresses all three interdependent issues consistently. The error response shape, the logging format, and the type definitions all align with each other. Compare this to fixing them sequentially, where each fix might conflict with the next.
Stuck? Get a nudge


## Sources
  * [Claude Code Iterative Development Documentation](https://code.claude.com/docs/en/best-practices) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.5](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic


---


Domain 3Task 3.6
# CI/CD Integration
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Drop Claude Code into a CI/CD pipeline and it stops being an interactive developer tool and becomes an automated review and generation engine. The exam tests five concepts in this task statement, and the `-p` flag is the single most directly tested item (it's Question 10 in the sample question set).
### The -p Flag: Non-Interactive Mode
Claude Code defaults to interactive mode: it expects keyboard input and shows a conversational interface. A CI pipeline has no keyboard. Without the `-p` flag, the job hangs forever, waiting for input that never comes.
bashCopy

```
# WRONG — hangs in CI
claude "Analyse this pull request for security issues"

# CORRECT — runs non-interactively
claude -p "Analyse this pull request for security issues"

```

The `-p` flag (also `--print`) switches Claude Code to print mode: it processes the prompt, outputs the result to stdout, and exits. No interactive input required.
This one is pure memorisation. The exam shows a CI job hanging, logs of Claude waiting for input, and asks you to pick the fix. The answer is the `-p` flag. Not `CLAUDE_HEADLESS=true` (doesn't exist). Not `--batch` (doesn't exist). Not stdin redirection from `/dev/null` (doesn't properly address Claude Code's interactive mode).
Key Concept
The `-p` flag is the single most directly testable fact in Domain 3. It is Question 10 in the official sample questions. When you see a CI pipeline hanging and logs showing Claude waiting for input, the answer is always `-p`.
### Structured Output for CI
In CI, Claude Code's output has to be machine-parseable. No human is reading it. Automated systems process it to post inline PR comments, update dashboards, or trigger downstream workflows.
Two flags work together:
  * `--output-format json` — wraps the run in a JSON envelope (result text, session ID, cost and usage metadata) instead of human-readable text
  * `--json-schema` — validates the agent's final output against a JSON Schema (print mode only)


bashCopy

```
claude -p \
  --output-format json \
  --json-schema '{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"file":{"type":"string"},"line":{"type":"integer"},"severity":{"type":"string"},"message":{"type":"string"}}}}}}' \
  "Review this PR for security issues"

```

The schema-conforming data lands in the envelope's `structured_output` field — extract it with `jq '.structured_output'`, not from the top level. That gives automated systems validated findings they can:
  * Parse programmatically
  * Post as inline PR comments at the exact file and line
  * Filter by severity for different notification channels
  * Track across review runs


### Session Context Isolation
The same Claude session that generated code is less effective at reviewing its own changes. This isn't a theoretical worry; it's a measurable effect.
**Why self-review is weaker:**
When Claude generates code in a session, it builds up reasoning context: why it chose this approach, what tradeoffs it considered, what alternatives it rejected. Ask it to review the same code in the same session and it keeps all of that. It's less likely to question decisions it already justified to itself.
**The fix: independent review instances**
Use a separate Claude Code invocation for review — one that has no access to the generation session's reasoning context. The independent reviewer evaluates the code on its own merits, without the bias of prior justification.
bashCopy

```
# Step 1: Generate code (session A)
claude -p "Implement the authentication middleware"

# Step 2: Review code (session B — independent, no shared context)
claude -p "Review the authentication middleware for security issues, error handling gaps, and edge cases"

```

This concept connects to Domain 4 (multi-instance review architectures) and Domain 5 (context management). The exam tests it in CI/CD scenarios specifically.
### Incremental Review Context
Automated reviews run on every push. Without context about previous reviews, each run analyses the entire PR from scratch, so it re-derives the same findings every time. A genuinely fixed issue drops out on its own, because the changed code no longer triggers it. The ones that keep coming back are the issues the developer saw and deliberately chose not to change; a context-free re-scan cannot tell those apart from new problems, so it flags them again on every push.
The fix: include prior review findings in context and instruct Claude to report only new or still-unaddressed issues.
bashCopy

```
claude -p \
  --output-format json \
  "Review this PR. Here are the findings from the previous review:
  ${PREVIOUS_FINDINGS}

  Report ONLY:
  1. New issues not in the previous findings
  2. Issues from the previous findings that are still present

  Do NOT re-report previous findings the developer has already reviewed and chosen not to act on."

```

Duplicate comments erode developer trust. If every push generates the same five comments regardless of whether the developer fixed the issues, developers stop reading the comments. Incremental review context preserves the signal-to-noise ratio.
### CLAUDE.md for CI Context
When Claude Code runs in CI, it reads the project's CLAUDE.md files exactly as it does interactively. So CLAUDE.md is how you feed project-specific context to a CI-invoked run:
  * **Testing standards:** what makes a valuable test, what patterns to follow, what to avoid
  * **Available fixtures:** which test fixtures exist, how to use them, what data they contain
  * **Review criteria:** what constitutes a critical finding vs a minor style issue
  * **Existing test coverage:** what is already covered, to avoid suggesting duplicate tests


Without this context in CLAUDE.md, CI-invoked test generation produces low-value boilerplate. With it, generated tests follow the team's patterns and add genuine coverage.
textCopy

```
# .claude/CLAUDE.md — CI-relevant section
## Testing Standards

- Tests must use the factory pattern from test/factories/ for data creation
- Integration tests connect to the test database via test/setup/db.ts
- Do not test private implementation details — test public API contracts
- Coverage target: 80% branch coverage for new code
- Available fixtures: test/fixtures/users.json, test/fixtures/orders.json

```

### CLI Flags Reference
The `-p` flag is the most directly tested flag, but the exam also expects familiarity with the flags that shape a headless run: how output is formatted, which system prompt is used, and how permissions and tools are scoped. These flags work with `claude -p` in CI and with the interactive `claude` command.
**System prompt flags.** Claude Code provides four flags here, and the exam tests the append-versus-replace distinction:  
| Flag  | Effect  |  
| --- | --- |  
| `--system-prompt "<text>"`  | Replaces the entire default system prompt  |  
| `--system-prompt-file <path>`  | Replaces the default prompt with a file's contents  |  
| `--append-system-prompt "<text>"`  | Appends text to the default prompt  |  
| `--append-system-prompt-file <path>`  | Appends a file's contents to the default prompt  |  
Append when Claude should stay a coding assistant that also follows your extra rules. Appending keeps the default tool guidance, safety instructions, and coding conventions, so you only supply what differs. Replace when the identity or permission model differs from Claude Code's, like a non-coding agent in a pipeline no human watches. Replacing drops the entire default prompt, so you own everything the task still needs.
**Headless output and limits (print mode).**  
| Flag  | Effect  |  
| --- | --- |  
| `--output-format text|json|stream-json`  | Output shape for `-p`; `json` and `stream-json` are machine-parseable  |  
| `--input-format text|stream-json`  | Input shape for `-p`  |  
| `--json-schema '<schema>'`  | Schema-validated output for `-p`; with `--output-format json` it lands in the envelope's `structured_output` field  |  
| `--max-turns <n>`  | Cap the number of agentic turns, then exit  |  
**Permissions, tools, and context.**  
| Flag  | Effect  |  
| --- | --- |  
| `--permission-mode <mode>`  | Start in `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, or `manual` (an alias for `default`, v2.1.200+)  |  
| `--allowedTools "<rules>"`  | Tools that run without a permission prompt, e.g. `"Bash(git diff *)" "Read"`  |  
| `--disallowedTools "<rules>"`  | Deny rules; a bare tool name removes the tool from context entirely  |  
| `--tools "Bash,Edit,Read"`  | Restrict which built-in tools are available at all  |  
| `--add-dir <path>`  | Add a directory Claude may read and edit (grants file access, not configuration discovery)  |  
| `--model <alias|name>`  | Set the session model (`sonnet`, `opus`, or a full model name)  |  
**Session and start-up.** `-c` / `--continue` resumes the most recent conversation in the current directory, and `-r` / `--resume <id|name>` resumes a specific session. `--bare` is minimal mode: it skips auto-discovery of hooks, skills, plugins, MCP servers, auto memory, and CLAUDE.md so scripted calls start faster, leaving Claude with the Bash and file read/edit tools only. Reach for `--bare` when you want a fast, predictable scripted run and don't need project configuration loaded.
### Providing Existing Tests to Avoid Duplication
When running test generation in CI, include existing test files in context. Without them, Claude Code may suggest tests that already exist, wasting developer review time. Including existing tests enables Claude to identify coverage gaps rather than duplicating existing scenarios.
### Batch API vs Real-Time for CI Workflows
The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This creates a clear decision boundary:  
| Workflow type  | API choice  | Reason  |  
| --- | --- | --- |  
| Pre-merge checks (blocking)  | Real-time (synchronous)  | Developers wait for results  |  
| Overnight technical debt reports  | Batch API  | Not time-sensitive, 50% savings  |  
| Weekly code audit  | Batch API  | Scheduled, latency-tolerant  |  
| Nightly test generation  | Batch API  | Runs overnight, reviewed next morning  |  
Pre-merge checks are blocking workflows. Developers can't merge until the check completes. The Batch API is unsuitable here because it gives no latency guarantee. The exam tests this distinction directly (Sample Question 11).
## Exam Traps
Exam Trap
CI pipeline hanging because Claude Code is waiting for interactive input
The fix is the -p (--print) flag. Not CLAUDE_HEADLESS=true (does not exist), not --batch (does not exist), not stdin redirection. The -p flag is the documented method for non-interactive execution.
Exam Trap
Assuming self-review in the same session is as effective as independent review
The same session retains reasoning context from code generation, making it less likely to question its own decisions. An independent review instance without that context is more effective at finding issues.
Exam Trap
Using the Batch API for pre-merge CI checks
The Message Batches API has up to 24-hour processing time with no latency SLA. Pre-merge checks are blocking workflows where developers wait for results. Use real-time API for blocking checks; batch API for overnight or weekly non-blocking analysis.
Exam Trap
Not including prior review findings in subsequent review runs
Without prior context, each review run analyses from scratch and produces duplicate comments. Include previous findings and instruct Claude to report only new or unaddressed issues to maintain developer trust.
## Practice Scenario
A CI pipeline script runs claude with a prompt but the job hangs indefinitely. Logs show Claude Code is waiting for interactive input. What is the correct fix?
Option ASet the environment variable CLAUDE_HEADLESS=true before running the command
Option BAdd the --batch flag to enable batch processing mode
Option CAdd the -p flag so Claude Code runs in non-interactive print mode
Option DRedirect stdin from /dev/null to prevent interactive prompts
Check Answer
## Build Exercise
Build Exercise
#### Set Up a CI/CD Pipeline with Claude Code
Difficulty
45 minutes
What you'll learn
  * Use the -p flag for non-interactive Claude Code execution in CI pipelines
  * Configure structured JSON output with --output-format json and --json-schema
  * Implement session context isolation between code generation and review
  * Set up incremental review to eliminate duplicate findings across runs
  * Provide project context via CLAUDE.md for CI-invoked Claude Code


  1. Write a CI script that runs Claude Code with the -p flag for non-interactive PR analysis
Why: The -p flag is the single most directly testable fact in Domain 3. Without it, the CI job hangs indefinitely waiting for interactive input. This is Question 10 in the official sample questions.
You should see: A CI script (GitHub Actions YAML, GitLab CI, or similar) that invokes claude -p with a review prompt. The job completes successfully without hanging. The output is printed to stdout and captured by the CI system.
Stuck? Get a nudge
  2. Add --output-format json and --json-schema to produce structured findings with file, line, severity, and message fields
Why: CI output must be machine-parseable. Automated systems need structured JSON to post inline PR comments, filter by severity, and track findings across runs. Human-readable text output cannot be reliably parsed by downstream tools.
You should see: The Claude Code output is a JSON envelope whose structured_output field conforms to the specified schema. Each finding has file, line, severity, and message fields. Piping the output to jq .structured_output extracts the validated data without errors.
Stuck? Get a nudge
  3. Configure the pipeline to parse the JSON output and post findings as inline PR comments
Why: Inline PR comments at exact file and line numbers provide actionable feedback. Generic PR-level comments are ignored. Structured JSON output makes precise inline commenting possible.
You should see: Each finding from the JSON output appears as an inline comment on the PR at the exact file and line number. Severity levels are visible. Developers can see the finding in context alongside the code it references.
Stuck? Get a nudge
  4. Add a section to CLAUDE.md documenting testing standards, available fixtures, and review criteria for CI-invoked Claude Code
Why: Claude Code reads CLAUDE.md in CI just as in interactive mode. Without project context, CI-invoked test generation produces low-value boilerplate. With testing standards and fixture documentation, generated tests follow team patterns.
You should see: The CLAUDE.md file contains a clearly marked CI-relevant section with testing standards, available fixture paths, and review severity criteria. CI-invoked Claude Code produces tests using the documented factories and fixtures rather than generic boilerplate.
Stuck? Get a nudge
  5. Set up two separate Claude Code invocations: one for code generation and an independent one for review (no shared session context)
Why: The same session that generated code is less effective at reviewing it because it retains reasoning context that biases it toward its own decisions. Independent review instances evaluate code on its own merits without prior justification bias.
You should see: Two distinct claude -p invocations in the CI script: one for generation and one for review. They share no session context. The review invocation analyses the generated code independently. The review findings are more thorough than self-review in the same session.
Stuck? Get a nudge
  6. Implement incremental review: store previous findings, include them in the next review run, and instruct Claude to report only new or still-unaddressed issues
Why: Without incremental context, each review run analyses the entire PR from scratch and produces duplicate comments. Duplicate comments erode developer trust — when the same five issues appear on every push regardless of fixes, developers stop reading them.
You should see: The first review run produces findings and stores them (as a JSON artifact or file). Subsequent runs include the previous findings in context. The output contains only new issues or issues that remain unaddressed. Previously fixed issues do not reappear as comments.
Stuck? Get a nudge


## Sources
  * [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 3.6](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Claude Certified Architect Foundations Exam Guide — Sample Questions 10 and 11](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic Message Batches API Documentation](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — Anthropic