Now tracking all four Claude certifications. Architect (Foundations) stays free and fully open. The Professional, Associate, and Developer tracks are on their way — each has a new page covering what its exam tests. Send feedback on what to build first. Thanks, Walter
Dismiss
Toggle menu[Claude Certified](https://claudecertificationguide.com/)
[Curriculum](https://claudecertificationguide.com/learn)[Practice](https://claudecertificationguide.com/mock-exam)[Reference](https://claudecertificationguide.com/resources)[Journal](https://claudecertificationguide.com/blog)
CCAR-F
[Take Mock Exam](https://claudecertificationguide.com/mock-exam)
Study Tools
[Progress Dashboard](https://claudecertificationguide.com/learn/progress)[Drill Mode](https://claudecertificationguide.com/learn/drill)
Curriculum
01Agentic Architecture & Orchestration
02Tool Design & MCP Integration
03Claude Code Configuration & Workflows
04Prompt Engineering & Structured Output
05Context Management & Reliability
Practice
[Build Exercises](https://claudecertificationguide.com/learn/exercises)[Diagnostic Test](https://claudecertificationguide.com/learn/diagnostic)
Look Up
[Quick Reference](https://claudecertificationguide.com/learn/quick-reference)[Glossary](https://claudecertificationguide.com/learn/glossary)
[Learn](https://claudecertificationguide.com/learn)/[Claude Code Configuration & Workflows](https://claudecertificationguide.com/learn/3-claude-code-config)/3.6
Domain 3Task 3.6
Mark Complete
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


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=3)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-3)
Mark Complete
[Previous LessonIterative Refinement Techniques](https://claudecertificationguide.com/learn/3-claude-code-config/3-5-iterative-refinement)[Next LessonSystem Prompts with Explicit Criteria](https://claudecertificationguide.com/learn/4-prompt-engineering/4-1-system-prompts)
Claude Certified Architect© 2026 claudecertificationguide.com
[Exam Guide](https://claudecertificationguide.com/architect-foundations)[Curriculum](https://claudecertificationguide.com/learn)[Practice](https://claudecertificationguide.com/mock-exam)[Reference](https://claudecertificationguide.com/resources)[Anthropic Docs](https://docs.anthropic.com)[MCP Spec](https://github.com/modelcontextprotocol)[About](https://claudecertificationguide.com/about)[Changelog](https://claudecertificationguide.com/changelog)[Privacy](https://claudecertificationguide.com/privacy)
CCAR-F domains:[Agentic Architecture](https://claudecertificationguide.com/learn/1-agentic-architecture)[Tool Design & MCP](https://claudecertificationguide.com/learn/2-tool-design-mcp)[Claude Code](https://claudecertificationguide.com/learn/3-claude-code-config)[Prompt Engineering](https://claudecertificationguide.com/learn/4-prompt-engineering)[Context Management](https://claudecertificationguide.com/learn/5-context-management)
[Curriculum](https://claudecertificationguide.com/learn)[Practice](https://claudecertificationguide.com/mock-exam)[Reference](https://claudecertificationguide.com/resources)[Journal](https://claudecertificationguide.com/blog)
[Take Mock Exam](https://claudecertificationguide.com/mock-exam)
Study Tools
[Progress Dashboard](https://claudecertificationguide.com/learn/progress)[Drill Mode](https://claudecertificationguide.com/learn/drill)
Curriculum
01Agentic Architecture & Orchestration
02Tool Design & MCP Integration
03Claude Code Configuration & Workflows
04Prompt Engineering & Structured Output
05Context Management & Reliability
Practice
[Build Exercises](https://claudecertificationguide.com/learn/exercises)[Diagnostic Test](https://claudecertificationguide.com/learn/diagnostic)
Look Up
[Quick Reference](https://claudecertificationguide.com/learn/quick-reference)[Glossary](https://claudecertificationguide.com/learn/glossary)
