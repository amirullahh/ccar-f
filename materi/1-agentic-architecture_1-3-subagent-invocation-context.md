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
[Learn](https://claudecertificationguide.com/learn)/[Agentic Architecture & Orchestration](https://claudecertificationguide.com/learn/1-agentic-architecture)/1.3
Domain 1Task 1.3
Mark Complete
# Subagent Invocation and Context Passing
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Task Statement 1.3 is about the mechanics of how a coordinator actually invokes subagents and passes information between them. If 1.2 taught you the architecture, 1.3 teaches you the wiring.
### The Task Tool
The **Task tool** is how a coordinator spawns subagents (the exam guide v0.2 uses this name). It's the actual API mechanism that makes multi-agent orchestration work in the Claude Agent SDK, not a naming convention you can skip past. Current Claude Code (v2.1.63, February 2026) renamed it to `Agent`; the name `Task` still works as an alias, and the Agent SDK emits `Agent` in tool-use blocks. Answer "Task tool" on the exam, and expect to see "Agent" in current code.
There is a critical configuration requirement: **the coordinator's`allowedTools` must include `"Task"`** (or `"Agent"`, its current name in Claude Code). Without it, the coordinator physically can't spawn subagents. It's a binary gate, not a soft preference. If neither `Task` nor `Agent` is in `allowedTools`, the coordinator has no way to invoke subagents at all.
Current state
The exam guide (v1.0) states the rule exactly as above, and that is the keyed answer. The current Agent SDK docs (September 2026) describe `allowedTools` as an auto-approve list: leaving `Agent` off it does not remove the tool, it sends every spawn through the permission callback, which denies it in an unattended run. Same outcome on the exam, different mechanism in production.
Each subagent is defined by an **AgentDefinition** that specifies three things:
  1. **Description** — what the subagent does (used by the coordinator to decide when to invoke it).
  2. **System prompt** — the instructions the subagent follows.
  3. **Tool restrictions** — which tools the subagent can access (scoped to its role).


Key Concept
The coordinator's `allowedTools` must include `"Task"` (or `"Agent"`, its current name) to spawn subagents. This is a hard requirement. Without it, the coordinator cannot invoke any subagent regardless of how they are defined.
### Context Passing: The Make-or-Break Detail
Context passing is where most multi-agent systems fall over. The principle from 1.2 carries straight across: subagents have isolated context. They get only what the coordinator writes into their prompt. Nothing else.
There are three rules for effective context passing:
**Rule 1: Include complete findings from prior agents.** If the synthesis subagent needs web search results and document analysis output, the coordinator must pass both — in full — in the synthesis subagent's prompt. Do not assume the synthesis agent can "look up" prior results. It cannot.
**Rule 2: Use structured data formats that separate content from metadata.** When passing research findings between agents, the data must include both the content (the claim, the fact, the analysis) and the metadata (source URL, document name, page number). If you pass content without metadata, the downstream agent cannot attribute claims to sources.
This is a specific exam pattern: a synthesis agent produces a report with unsourced claims. The web search and document analysis subagents are working correctly. The root cause is that the coordinator passed content without structured metadata — the synthesis agent literally had no source information to include.
**Rule 3: Design coordinator prompts that specify goals, not procedures.** The coordinator prompt should tell subagents what to achieve and what quality criteria to meet, not step-by-step instructions for how to do it. Goal-oriented prompts enable subagent adaptability. Procedural instructions constrain subagents and prevent them from adjusting their approach when they encounter unexpected situations.
Exam Trap
When a synthesis agent produces unsourced claims, the exam expects you to identify the context passing failure — specifically, missing structured metadata. Do not blame the synthesis agent's prompt or propose giving it direct tool access.
### Structured Metadata Format
The structured data format for inter-agent context passing should separate content from metadata cleanly. A practical format looks like this:
jsonCopy

```
{
  "findings": [
    {
      "claim": "Solar panel efficiency has increased 25% in the last decade",
      "source_url": "https://example.com/solar-report",
      "document_name": "Annual Solar Industry Report 2024",
      "page_number": 14,
      "confidence": "high",
      "retrieved_by": "web_search_agent"
    }
  ]
}

```

Each finding carries its source attribution as metadata. When the synthesis agent receives this structured data, it has everything it needs to produce a properly cited report.
### Parallel Spawning
When a coordinator needs to invoke multiple subagents for independent tasks, it should **emit multiple Task tool calls in a single response** rather than invoking them one at a time across separate turns.
Sequential spawning — one subagent per coordinator turn — adds latency for nothing. If the web search agent and document analysis agent work independently, there's no reason to make one wait for the other.
The exam tests latency awareness. When presented with independent subagent tasks, the correct answer involves parallel spawning. Look for answer options that mention "in a single response" or "simultaneously" — these signal the parallel pattern.
Key Concept
Spawn independent subagents in parallel by emitting multiple Task tool calls in a single coordinator response. This reduces latency compared to sequential invocation across separate turns.
### fork_session
`fork_session` creates **independent branches from a shared analysis baseline**. After a coordinator has completed an initial analysis (reading a codebase, understanding a problem), it can fork the session to explore divergent approaches.
Example: after analysing a codebase, the coordinator forks to compare two testing strategies. Each fork operates independently after the branching point — they do not see each other's results, and changes in one fork do not affect the other.
Both are Claude Code session controls. `--resume` is a CLI flag, with a matching `resume` option in the Agent SDK; `fork_session` is the SDK option (`forkSession` in TypeScript) and is also on the CLI as `--fork-session` next to `--resume`.
**fork_session is not the same as --resume.** Resume continues a specific named session. Fork creates a new independent branch. The exam tests this distinction. Use fork when you need divergent exploration from a shared starting point. Use resume when you want to continue the same line of investigation.
Current state
Exam guide v1.0 lists `--resume` and `fork_session` as two session controls, and that is how the exam frames them. In the Agent SDK ([sessions guide](https://code.claude.com/docs/en/agent-sdk/sessions), checked September 2026) fork is a modifier on resume, not an alternative to it. You pass both: `ClaudeAgentOptions(resume=session_id, fork_session=True)`. `resume` names the session to start from, and `fork_session` says branch off it instead of appending to it. Leave `fork_session` off and the same call appends to the original. The CLI pairs them the same way: `--fork-session` only does anything alongside `--resume` or `--continue`. So the distinction the exam tests is append versus branch, not one flag versus the other. On the exam, answer as the guide frames it: resume to continue a session, fork to branch from it.
### Practical Example: Attribution Failure
A multi-agent research system has three agents: web search, document analysis, and synthesis. The web search agent returns well-sourced results with URLs and titles. The document analysis agent returns detailed analysis with page references.
The coordinator passes the content from both agents to the synthesis agent but strips the metadata — it sends the claims and analysis text without source URLs, document names, or page numbers. The synthesis agent produces an excellent summary with no source attribution.
The fix is not to modify the synthesis agent's prompt (it cannot cite sources it does not have). The fix is to require the coordinator to pass structured metadata alongside content, preserving the source URL, document name, and page number for every finding.
## Exam Traps
Exam Trap
Assuming subagents automatically have access to the coordinator's conversation history or other subagents' outputs
Subagents have isolated context. Every piece of information they need must be explicitly included in their prompt by the coordinator. There is no automatic context inheritance.
Exam Trap
Blaming the synthesis agent for missing citations when the real issue is context passing without metadata
The synthesis agent can only cite sources it has been given. If the coordinator passes content without source URLs and document names, the synthesis agent literally cannot produce citations.
Exam Trap
Proposing sequential subagent invocation for tasks that can run independently
Sequential invocation introduces unnecessary latency. Independent tasks should be spawned in parallel using multiple Task tool calls in a single coordinator response.
Exam Trap
Confusing fork_session with --resume
fork_session branches: it starts a new session from a copy of the original's history. --resume appends: it continues the same session. In the SDK the fork flag is set beside resume, so the choice is append or branch, not two different commands. Fork to compare approaches, resume to carry on with the same work.
## Practice Scenario
A synthesis agent produces a report where several claims have no source attribution. The web search subagent correctly returns results with URLs, titles, and snippets. The document analysis subagent correctly returns analysis with page references. Both subagents are verified to be working properly. What is the most likely root cause?
Option AThe synthesis agent should be given direct access to the web search tool so it can re-run the queries and verify sources itself
Option BThe coordinator passes content to the synthesis agent without structured metadata — source URLs, document names, and page numbers are not included
Option CThe synthesis agent system prompt lacks explicit instructions to cite sources, so it summarises the research without carrying any attribution into the report
Option DThe web search subagent returns its results in a format the synthesis agent cannot parse, so the source URLs and document titles are dropped during synthesis
Check Answer
## Build Exercise
Build Exercise
#### Implement Context Passing with Structured Metadata
Difficulty
50 minutes
What you'll learn
  * Why the coordinator allowedTools must include Task (or Agent, its current name) to spawn subagents
  * How to design structured metadata that separates content from source attribution
  * Why context passing failures cause attribution errors in downstream agents
  * How to spawn independent subagents in parallel for reduced latency
  * The difference between fork_session and parallel Task tool invocation


  1. Create a coordinator agent with Task (or Agent) in its allowedTools
Why: Task is the hard gate for subagent spawning (renamed Agent in current Claude Code v2.1.63; Task still works as an alias). Without it in allowedTools, the coordinator cannot invoke any subagent. The exam tests this as a binary requirement — it is not optional or configurable at runtime.
You should see: A query() call whose options include allowedTools explicitly containing Agent (or Task) alongside any other tools the coordinator needs directly, plus the subagent definitions under options.agents.
Stuck? Get a nudge
  2. Define two subagents: a web search agent that returns results with source URLs and titles, and a document analysis agent that returns analysis with page references
Why: Each subagent needs scoped tool access matching its role. The exam tests whether you define subagents with proper AgentDefinition fields: description, system prompt, and tool restrictions.
You should see: Two AgentDefinition objects, each with a description, system prompt, and restricted tool set. The web search agent has search tools only; the document analysis agent has file reading tools only.
Stuck? Get a nudge
  3. Design a structured output format that separates content from metadata: each finding includes claim, source_url, document_name, page_number, and confidence
Why: The exam specifically tests the attribution failure pattern: when a synthesis agent produces unsourced claims, the root cause is that the coordinator passed content without structured metadata. Separating content from metadata is the fix.
You should see: A TypeScript interface or JSON schema defining the Finding type with both content fields (claim, analysis) and metadata fields (source_url, document_name, page_number, confidence, retrieved_by).
Stuck? Get a nudge
  4. Pass complete structured results from both subagents to a synthesis subagent, preserving all metadata
Why: This is the critical step the exam targets. Stripping metadata before passing to the synthesis agent is the root cause of attribution failures. The coordinator must pass the full structured output, not just the claim text.
You should see: The coordinator passes the complete findings array (with all metadata intact) to the synthesis agent prompt. No metadata fields are stripped or summarised away.
Stuck? Get a nudge
  5. Verify that the synthesis agent can attribute every claim in its output to a specific source with URL and page number
Why: This verification step confirms the context passing worked. If any claim lacks attribution, trace back to whether the metadata was actually passed — do not blame the synthesis agent prompt.
You should see: A synthesis report where every factual claim includes a citation with source URL and page number. No orphaned claims without attribution.
Stuck? Get a nudge
  6. Refactor the coordinator to spawn both research subagents in parallel using multiple Task tool calls in a single response
Why: The exam tests latency awareness. Sequential spawning of independent subagents wastes time. Parallel spawning via multiple Task tool calls in a single coordinator response is the correct pattern for independent tasks.
You should see: Both the web search and document analysis subagents invoked simultaneously via parallel Task tool calls, with the coordinator waiting for both to complete before proceeding to synthesis.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Agent SDK: Work with sessions](https://code.claude.com/docs/en/agent-sdk/sessions) — Anthropic
  * [MCP Specification](https://github.com/modelcontextprotocol) — Anthropic / MCP
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=1)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-1)
Mark Complete
[Previous LessonMulti-Agent Orchestration](https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns)[Next LessonWorkflow Enforcement and Handoff](https://claudecertificationguide.com/learn/1-agentic-architecture/1-4-workflow-enforcement-handoff)
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
