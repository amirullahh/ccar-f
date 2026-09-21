Domain 127%
# Agentic Architecture & Orchestration
Design and implement agentic systems using Claude's API, including loop management, orchestration patterns, guardrails, and the Claude Agent SDK.
## Task Statements
[ 1.1Agentic Loops ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops)[ 1.2Multi-Agent Orchestration ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns)[ 1.3Subagent Invocation and Context Passing ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-3-subagent-invocation-context)[ 1.4Workflow Enforcement and Handoff ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-4-workflow-enforcement-handoff)[ 1.5Agent SDK Hooks ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-5-agent-sdk-hooks)[ 1.6Task Decomposition Strategies ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-6-task-decomposition)[ 1.7Session State and Resumption ](https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption)


---


Domain 1Task 1.1
# Agentic Loops
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
An agentic loop is the core execution cycle behind every Claude-based agent. It's deterministic control flow, defined in code. Not a prompt trick, not a retry loop, not a chatbot turn. Get this lifecycle right and most of Domain 1 falls into place; get it wrong and your agent stops halfway through a task in production.
### The Agentic Loop Lifecycle
The loop follows four steps, repeated until completion:
  1. **Send a request** to Claude via the Messages API. This includes the conversation history (system prompt, prior messages, and any tool results from the previous iteration).
  2. **Inspect the`stop_reason` field** in the response. This field is the authoritative signal for what happens next. It has two values relevant to agentic loops:
     * `"tool_use"` — Claude wants to call one or more tools. The loop continues.
     * `"end_turn"` — Claude has finished its work. The loop terminates.
  3. **If`stop_reason` is `"tool_use"`**: execute the requested tool(s), append the tool results to the conversation history as a new message, and send the updated conversation back to Claude.
  4. **If`stop_reason` is `"end_turn"`**: the agent has finished. Present the final response to the user.


Step 3 is where loops break. Tool results **must** be appended to conversation history. Miss that, and Claude can't reason about the new information on the next iteration — the model never sees what the tool returned, so it has nothing new to act on.
Key Concept
The `stop_reason` field is the **only** reliable signal for loop control. It is deterministic and unambiguous. Never use natural language parsing, text content checks, or arbitrary iteration caps as your primary stopping mechanism.
Current state: beyond the two exam values
The exam guide (v1.0) keys `tool_use` and `end_turn`, the two values a basic loop branches on. The live Messages API returns others that a production loop must handle: `pause_turn` (continue a long-running server-tool turn), `max_tokens`, `stop_sequence`, `refusal` (current models such as Fable 5 can decline on an otherwise-normal 200 response), and `model_context_window_exceeded` (the response filled the model's context window; handle it like `max_tokens` truncation). Treat any value other than `end_turn` as "not finished, check why" rather than assuming `tool_use`. (Verified against the Messages API docs, July 2026.)
### Model-Driven Decision-Making
In an agentic loop, Claude decides which tool to call from the current context. That's **model-driven decision-making** — the model reads the task, weighs the available tools, and picks one. Compare that to **pre-configured decision trees** or **fixed tool sequences** , where the developer hard-codes which tool runs when.
The exam favours model-driven approaches because they flex. Claude adapts to situations the developer never mapped out, handles edge cases, and chains tools in orders nobody planned. There's one exception worth memorising: when business logic demands deterministic compliance — financial operations, security checks, regulatory requirements — programmatic enforcement overrides that flexibility. Task Statement 1.4 covers this in detail.
### The Three Anti-Patterns
Three anti-patterns show up again and again for loop termination. Learn to spot all three.
**Anti-Pattern 1: Parsing natural language signals.** Checking if Claude said "I'm done" or "task complete" to determine whether the loop should end. This is wrong because natural language is inherently ambiguous. Claude might say "I've finished analysing the first file" while intending to continue with more files. The `stop_reason` field exists precisely to eliminate this ambiguity.
**Anti-Pattern 2: Arbitrary iteration caps as the primary stopping mechanism.** Setting "stop after 10 loops" as the main way to terminate the agent. This is wrong because it either cuts off useful work (if the task genuinely needs 12 iterations) or runs unnecessary iterations (if the task finishes in 3). The model signals completion via `stop_reason` — use that signal. Iteration caps are acceptable as a safety net (a maximum bound to prevent runaway agents), but never as the primary control mechanism.
**Anti-Pattern 3: Checking for assistant text content as a completion indicator.** Using `response.content[0].type == "text"` to decide the loop is finished. This is wrong because Claude can return text alongside `tool_use` blocks. A response might contain explanatory text ("I'll now search for the customer's order history") immediately followed by a tool call. Checking for text presence does not tell you whether the agent is finished.
Common Exam Distractor
The exam frequently presents iteration caps as a plausible fix for premature termination. Reject these answers. Caps address runaway loops, not premature exits. The fix for premature termination is always to check `stop_reason` correctly.
### Practical Example: The Premature Termination Bug
A developer builds a customer support agent. It works for simple queries but sometimes stops mid-task on complex requests. The code checks `if response.content[0].type == "text"` to determine completion.
The bug: Claude returns a text explanation ("Let me look up your order") alongside a `tool_use` block requesting the `lookup_order` tool. The code sees text in position [0], concludes the agent is finished, and returns the incomplete response to the user.
The fix: replace the content-type check with a `stop_reason` check. Continue the loop when `stop_reason == "tool_use"`, terminate when `stop_reason == "end_turn"`. This works regardless of what content types appear in the response.
## Exam Traps
Exam Trap
Using response.content[0].type == 'text' to determine loop completion
Claude can return text alongside tool_use blocks in the same response. Text presence does not indicate completion. The stop_reason field is the authoritative signal.
Exam Trap
Setting arbitrary iteration caps (e.g., 'stop after 10 loops') as the primary stopping mechanism
Iteration caps either cut off useful work or run unnecessary iterations. They are acceptable as a safety net, not as the primary loop control. Use stop_reason instead.
Exam Trap
Parsing natural language phrases like 'I'm done' or 'task complete' to decide loop termination
Natural language is ambiguous and unreliable. The stop_reason field provides a deterministic, unambiguous signal for loop control.
Exam Trap
Forcing tool_choice to 'any' to prevent the agent from returning text
This forces tool use even when the agent is genuinely finished, creating an infinite loop. The correct approach is to let the model signal completion naturally via stop_reason.
## Practice Scenario
A developer's agent sometimes terminates prematurely when Claude returns text alongside a tool call. Their loop checks response.content[0].type == 'text' to determine if the agent is finished. Users report incomplete responses on complex queries. What should the developer change?
Option AAdd an iteration cap of 15 loops to ensure the agent runs long enough for complex queries
Option BCheck the stop_reason field instead of content type — continue when stop_reason is tool_use, terminate when end_turn
Option CSet tool_choice to any so Claude always calls a tool instead of returning text
Option DParse the assistant text for completion phrases like I have finished before terminating the loop
Check Answer
## Build Exercise
Build Exercise
#### Build a Multi-Tool Agent Loop
Difficulty
45 minutes
What you'll learn
  * How the agentic loop lifecycle works with the Messages API
  * Why stop_reason is the authoritative signal for loop control
  * How to handle tool_use and end_turn stop_reason values correctly
  * How to append tool results to conversation history for multi-turn execution
  * When safety iteration caps are appropriate versus inappropriate as stopping mechanisms


  1. Set up a Claude API client with two tools: a calculator tool (accepts expression, returns result) and a web search stub (accepts query, returns mock results)
Why: Multi-tool setups expose model-driven decision-making — Claude must select the right tool based on context, which is core to agentic architecture.
You should see: Two tool definitions registered with proper JSON Schema input_schema, each with name, description, and parameters.
Stuck? Get a nudge
  2. Implement the agentic loop that sends requests to Claude and inspects stop_reason after each response
Why: The agentic loop is the core execution pattern — the exam tests whether you use stop_reason (deterministic) versus content-type checks or natural language parsing (unreliable).
You should see: A while loop that calls client.messages.create() and checks response.stop_reason after each iteration.
Stuck? Get a nudge
  3. Handle the tool_use stop_reason by executing the requested tool, creating a tool result message, and appending it to conversation history
Why: This is the critical handoff in the loop — the exam specifically tests whether you correctly extract tool calls, execute them, and return results in the right message format.
You should see: When Claude requests a tool, your code extracts the tool_use block, runs the corresponding function, and appends both the assistant response and a user message with tool_result to the conversation.
Stuck? Get a nudge
  4. Handle the end_turn stop_reason by extracting and returning the final response
Why: end_turn is Claude signal that it has completed the task — extracting the final text response correctly closes the loop and returns the result to the user.
You should see: When stop_reason is end_turn, your loop exits and returns the text content from the final response.
Stuck? Get a nudge
  5. Test with a prompt that requires multiple sequential tool calls (e.g., search for a value then calculate something with it) and verify the loop continues correctly through all iterations
Why: Sequential tool calls test the full loop lifecycle — the agent must complete one tool call, receive the result, reason about it, and decide to call another tool before finally returning.
You should see: At least two tool call iterations before end_turn. The agent searches first, uses the search result in a calculation, then returns the combined answer.
Stuck? Get a nudge
  6. Add a safety iteration cap of 20 as a maximum bound (not the primary stopping mechanism) and log a warning if it triggers
Why: The exam distinguishes safety caps (acceptable as a fallback) from using caps as the primary stopping mechanism (an anti-pattern). Your cap should never trigger in normal operation.
You should see: A MAX_ITERATIONS constant, a counter that increments each loop, and a warning log if the cap is hit. Normal queries should terminate via stop_reason well before reaching 20.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Messages API Reference](https://docs.anthropic.com/en/api/messages) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 1Task 1.2
# Multi-Agent Orchestration
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Multi-agent orchestration is how you get several Claude agents working together on one complex task. The exam isn't loose about the shape this takes. It tests one pattern: **hub-and-spoke** , with a coordinator at the centre.
### Hub-and-Spoke Architecture
The architecture has two roles:
  * **Coordinator agent** : sits at the centre. Receives the initial task, decomposes it, decides which subagents to invoke, passes context to them, aggregates their results, handles errors, and routes information between them.
  * **Subagents** : the spokes. Each one handles a specialised task (web search, document analysis, synthesis, report generation). They receive instructions from the coordinator and return results to it.


The cardinal rule: **ALL communication flows through the coordinator.** Subagents never communicate directly with each other. Never. Not for efficiency, not for convenience, not for any reason. Every piece of information that moves between subagents passes through the coordinator.
Current state
This strict hub-and-spoke model is what the exam tests. In current Claude Code a sub-agent can itself spawn sub-agents (nested parent-child delegation), so the "never, for any reason" absolute is an exam simplification rather than a hard product limit. On the exam, treat direct subagent-to-subagent communication as the wrong answer.
This centralisation provides three things the exam cares about:
  1. **Observability** — you can log and monitor every message in one place.
  2. **Consistent error handling** — the coordinator applies uniform error recovery policies.
  3. **Controlled information flow** — the coordinator decides what context each subagent receives.


Key Concept
All inter-subagent communication flows through the coordinator. Subagents never communicate directly with each other. This is the foundational architectural constraint of hub-and-spoke orchestration.
### The Critical Isolation Principle
This is the single most misunderstood idea in multi-agent systems, and the exam leans on that confusion hard.
**Subagents do NOT automatically inherit the coordinator's conversation history.** When the coordinator spawns a subagent, that subagent starts with only what the coordinator explicitly includes in its prompt. It has no access to:
  * The coordinator's system prompt (unless explicitly included)
  * Previous messages in the coordinator's conversation
  * Results from other subagents (unless the coordinator passes them)
  * Any "shared memory" or global state


**Subagents do NOT share memory between invocations.** If the coordinator calls the web search subagent twice, the second invocation has no knowledge of the first. Every invocation is independent.
So the coordinator has to be deliberate about context. Every piece of information a subagent needs goes in its prompt, explicitly. If the synthesis agent needs web search results, the coordinator passes those results — the synthesis agent can't "look them up" from a shared store. There's no shared store.
Exam Trap
When a multi-agent system produces incomplete or incorrect output, the exam expects you to trace the failure to its origin. Do not blame the subagent that produced the output — check whether the coordinator gave it the right input.
### Coordinator Responsibilities
The coordinator has four key responsibilities that the exam tests:
**1. Dynamic subagent selection.** The coordinator analyses query requirements and dynamically selects which subagents to invoke. It does NOT always route through the full pipeline. A simple factual question might only need the web search subagent, not the full research-analysis-synthesis chain. Routing every query through every subagent wastes time and resources.
**2. Research scope partitioning.** When delegating to multiple subagents, the coordinator partitions the research scope to minimise duplication. It assigns distinct subtopics or source types to each agent. For example, one agent searches academic papers while another searches news articles — they do not both search the same sources.
**3. Iterative refinement loops.** The coordinator evaluates synthesis output for gaps. If the synthesis is incomplete, it re-delegates to search and analysis subagents with targeted queries. It re-invokes synthesis until coverage is sufficient. This is not a single-shot process — it is an iterative cycle.
**4. Centralised communication routing.** All subagent communication routes through the coordinator for observability, consistent error handling, and controlled information flow.
### The Narrow Decomposition Failure
This is a specific exam pattern you must recognise. The exam guide's sample set includes a question (Question 7) where a coordinator decomposes "impact of AI on creative industries" into only visual arts subtopics, missing music, writing, and film entirely.
The root cause is **the coordinator's task decomposition** , not any downstream agent. The web search agent searched thoroughly for what it was assigned. The synthesis agent synthesised everything it received. But the coordinator only assigned visual arts topics, so music, writing, and film were never researched.
The exam expects you to **trace failures to their origin**. When a multi-agent system produces a report that misses entire categories, do not blame the subagents — check the coordinator's decomposition.
This pattern applies broadly: if the output is incomplete in scope (not depth), the coordinator's decomposition is almost always the root cause.
### Practical Example: Research System Coverage Gap
A multi-agent research system is tasked with "renewable energy technologies." The coordinator decomposes this into "solar panel efficiency" and "wind turbine design." Each subagent produces thorough, well-sourced research on its assigned topic.
The final report is comprehensive on solar and wind but says nothing about geothermal, tidal, biomass, or nuclear fusion. The coverage gap is not because the search was poor or the synthesis was weak — it is because the coordinator never assigned those subtopics.
The fix is not better search queries, not a more capable synthesis agent, and not more subagents. The fix is better coordinator decomposition that covers the full breadth of the topic.
## Exam Traps
Exam Trap
Blaming downstream subagents for coverage gaps when the coordinator's task decomposition was too narrow
Subagents research what they are assigned. If the coordinator only assigns solar and wind as subtopics for renewable energy, no subagent can cover geothermal or tidal. Trace failures to their origin — the coordinator's decomposition.
Exam Trap
Assuming subagents share memory or inherit the coordinator's conversation history
Subagents have completely isolated context. They do not automatically inherit anything from the coordinator. Every piece of information must be explicitly passed in the subagent's prompt.
Exam Trap
Proposing direct inter-subagent communication as an efficiency improvement
Direct communication breaks observability, consistent error handling, and controlled information flow. All communication must flow through the coordinator, regardless of perceived efficiency gains.
Exam Trap
Adding more subagents to fix a decomposition problem
If the coordinator decomposes a topic too narrowly, adding more subagents does not help — they will receive equally narrow assignments. The fix is improving the coordinator's decomposition logic.
## Practice Scenario
A multi-agent research system produces a report on 'renewable energy technologies' that only covers solar and wind power. Each subagent produced thorough, well-sourced coverage of its assigned topic. The web search subagent returned relevant results for every query it received. The synthesis subagent accurately combined all research it was given. What is the most likely root cause of the coverage gap?
Option AThe document analysis subagent had no access to sources covering the other renewable energy categories, so none of those sections were ever written
Option BThe synthesis subagent failed to identify gaps in the research it received and request additional coverage of the missing technology categories from the coordinator
Option CThe web search subagent used queries that were too narrow, so geothermal, tidal, biomass and fusion sources never appeared anywhere in its results
Option DThe coordinator decomposed the topic into only solar and wind subtopics, never assigning geothermal, tidal, biomass, or fusion to any subagent
Check Answer
## Build Exercise
Build Exercise
#### Build a Hub-and-Spoke Research Coordinator
Difficulty
60 minutes
What you'll learn
  * How hub-and-spoke architecture centralises all communication through a coordinator
  * Why subagent isolation means every piece of context must be explicitly passed
  * How to implement broad task decomposition that avoids the narrow decomposition failure
  * How iterative refinement loops detect and fill coverage gaps
  * Why tracing failures to the coordinator decomposition is the correct diagnostic approach


  1. Create a coordinator agent that accepts a broad research topic as input
Why: The coordinator is the central hub in hub-and-spoke architecture. The exam tests whether you understand that the coordinator owns task decomposition, subagent selection, and result aggregation — not the subagents.
You should see: A coordinator function that accepts a topic string and returns a structured research report. It should have a system prompt defining its role as the orchestrating hub.
Stuck? Get a nudge
  2. Implement task decomposition logic that breaks the topic into at least 5 distinct subtopics covering the full breadth of the subject
Why: Narrow decomposition is a specific exam failure pattern. The coordinator that only assigns solar and wind for renewable energy misses entire categories. The exam expects you to recognise that incomplete output traces back to the coordinator decomposition.
You should see: A decomposition function that produces 5 or more subtopics for any broad topic. For renewable energy, it should cover solar, wind, geothermal, tidal, biomass, and fusion at minimum.
Stuck? Get a nudge
  3. Spawn two subagents (web search and document analysis) with explicit context passing — include all relevant information in each subagent prompt
Why: Subagent isolation means no shared memory and no inherited context. The exam heavily tests this: if a subagent produces poor results, check whether the coordinator gave it sufficient context, not whether the subagent itself is flawed.
You should see: Two subagent invocations where each receives the full assigned subtopic, the research goal, and any relevant context from prior agents — all explicitly included in the prompt.
Stuck? Get a nudge
  4. Aggregate results from both subagents and evaluate coverage completeness
Why: The coordinator must evaluate whether the combined results cover the full breadth of the original topic. This is where iterative refinement starts — gaps detected here trigger re-delegation.
You should see: An aggregation function that combines results from both subagents and produces a coverage assessment listing which subtopics are well-covered, partially covered, or missing.
Stuck? Get a nudge
  5. Implement an iterative refinement loop: if the coordinator identifies coverage gaps, re-delegate to subagents with targeted queries and re-invoke until coverage is sufficient
Why: Iterative refinement is a core coordinator responsibility the exam tests. A single-shot delegation is not enough — the coordinator must evaluate output and re-delegate for gaps. This distinguishes a coordinator from a simple dispatcher.
You should see: A loop that checks coverage, identifies gaps, sends targeted follow-up queries to subagents for the missing subtopics, and re-evaluates until a coverage threshold is met or a maximum iteration count is reached.
Stuck? Get a nudge
  6. Test with the topic renewable energy technologies and verify that the final output covers solar, wind, geothermal, tidal, biomass, and fusion
Why: This specific test case maps to the exam narrow decomposition failure pattern. If your output only covers solar and wind, the root cause is the coordinator decomposition — the exact diagnostic the exam expects you to make.
You should see: A final research report with substantive sections on all six energy types: solar, wind, geothermal, tidal, biomass, and fusion. The coverage evaluation should show 100% completeness.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Building with Claude API, including the Multi-Agent Research System scenario (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 1Task 1.3
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


---


Domain 1Task 1.4
# Workflow Enforcement and Handoff
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Task Statement 1.4 draws a hard line between two approaches to controlling agent behaviour: prompt-based guidance and programmatic enforcement. The exam tests this distinction repeatedly, and getting it wrong on high-stakes scenarios will cost you marks.
### The Enforcement Spectrum
There are two very different ways to enforce workflow ordering in an agentic system:
**Prompt-based guidance** means putting instructions in the system prompt. For example: "Always verify the customer's identity before processing a refund." It works most of the time — perhaps 90-95% of cases. But it carries a **non-zero failure rate**. The model is probabilistic. Sometimes it'll skip steps, reorder them, or read the instruction loosely. For low-stakes operations, that failure rate is fine.
**Programmatic enforcement** means implementing hooks, prerequisite gates, or code-level checks that physically block downstream tools until prerequisites complete. For example: the `process_refund` tool cannot execute until `get_customer` has returned a verified customer ID. This works **every time**. It is deterministic, not probabilistic. No matter what the model decides to do, the gate prevents the wrong execution order.
Key Concept
Prompt-based guidance is probabilistic — it works most of the time. Programmatic enforcement is deterministic — it works every time. The exam decision rule: if a single failure would cause financial loss, security breach, or compliance violation, use programmatic enforcement.
### The Exam Decision Rule
The exam applies a consistent decision rule across multiple scenarios:
  * **Financial operations** (refunds, transfers, payments): programmatic enforcement. A single unverified refund to the wrong account is a financial loss.
  * **Security operations** (identity verification, access control): programmatic enforcement. A single bypass of identity verification is a security breach.
  * **Compliance operations** (AML checks, regulatory requirements): programmatic enforcement. A single missed compliance check can result in legal penalties.
  * **Low-stakes operations** (formatting preferences, style guidelines, output ordering): prompt-based guidance is acceptable. A formatting inconsistency is not a business risk.


The exam will present prompt-based solutions as answer options for high-stakes scenarios. **Reject them.** Enhanced system prompts, few-shot examples, and stronger instructions all improve accuracy but none provide deterministic guarantees. When the scenario involves money, security, or compliance, the answer is always programmatic enforcement.
Exam Trap
The exam consistently presents "add stronger instructions to the system prompt" or "include few-shot examples showing the correct workflow" as distractors for high-stakes scenarios. These answers improve probability but do not eliminate the failure rate. For financial, security, and compliance operations, only programmatic enforcement is correct.
### Prerequisite Gates in Practice
A prerequisite gate is a programmatic check that blocks a tool from executing until a prior condition is met. In a customer support agent:
  1. The agent has access to `get_customer`, `lookup_order`, and `process_refund` tools.
  2. A prerequisite gate checks: has `get_customer` returned a verified customer ID for this session?
  3. If yes, `process_refund` executes normally.
  4. If no, `process_refund` returns an error message: "Cannot process refund — customer identity not verified. Please call get_customer first."


The gate is code, not a prompt instruction. The model can't bypass it by deciding to skip verification. Even if the model attempts to call `process_refund` directly, the gate blocks the call and returns an error that forces the model to verify identity first.
### Subagent Lifecycle Hooks: SubagentStart and SubagentStop
Beyond the guide
Task Statement 1.4 covers programmatic enforcement, prerequisite gates and structured handoff, and the guide's appendix scopes Agent SDK hooks to PostToolUse and tool-call interception. The subagent lifecycle events below are useful background rather than tested material. Verified against the hooks reference on 14 August 2026.
The Claude Agent SDK provides lifecycle hook events specifically for subagent management. These complement the PreToolUse and PostToolUse hooks covered in Task Statement 1.5.
**SubagentStart** fires when a subagent is spawned via the Task tool (renamed Agent in current Claude Code). It is observational: the hook receives the subagent's type and id, and can log the spawn. Its documented output fields are `systemMessage` and `terminalSequence`, so it cannot block the invocation, and it cannot inject context into the subagent's run. To enforce rules on spawning itself — rate limits, or checking that the coordinator passed required context — attach a PreToolUse hook to the Agent tool instead, which can deny or rewrite the outgoing invocation before the subagent starts.
**SubagentStop** fires when a subagent finishes execution and returns its results to the coordinator. The hook receives the subagent's id and final message, so it can validate output and log completion for performance monitoring. If validation fails — say the output does not conform to the expected schema — the hook **exits with code 2** , which prevents the subagent from stopping and sends it back to keep working. Exit code 2 is the documented blocking mechanism; there is no `decision` field for this event. SubagentStop does not transform the returned output, and the hooks reference documents no field on any event that rewrites a tool result in place, so treat output reshaping as something the coordinator does after the fact rather than something a hook does for you.
**Subagent-scoped hooks:** Subagents can define their own hooks in their frontmatter. All hook events are supported there, including PreToolUse and PostToolUse, and they are scoped to the component's lifetime — they only intercept tool calls made by that specific subagent, not the coordinator or other subagents. This enables per-subagent policy enforcement (for example, a billing subagent might have a PreToolUse hook that blocks refunds above a threshold, while a technical support subagent has no such restriction).
**Stop hook auto-conversion:** When a subagent's frontmatter defines Stop hooks, these are automatically converted to SubagentStop events, because SubagentStop is the event that fires when a subagent completes. You can therefore define cleanup or validation logic in the subagent's own configuration and rely on it running at completion.
Key Concept
SubagentStart observes subagent spawning and cannot block it. SubagentStop gates completion by exiting with code 2, which sends the subagent back to work. Neither hook rewrites subagent output. Subagents can define hooks in their own frontmatter, scoped to their execution, and Stop hooks there auto-convert to SubagentStop.
### Multi-Concern Request Handling
Customers frequently submit requests with multiple issues: "I want to return my order, update my shipping address, and ask about my loyalty points." The exam tests how agents should handle these compound requests.
The correct approach:
  1. **Decompose** the request into distinct items (return, address update, loyalty inquiry).
  2. **Investigate each in parallel** using shared context (the customer's account information is relevant to all three).
  3. **Synthesise a unified resolution** that addresses all items in a single response.


The wrong approach is to handle them sequentially with separate conversations, or to address only the first item and forget the rest.
### Structured Handoff Protocols
When an agent can't resolve an issue and must escalate to a human agent, the handoff must follow a structured protocol. The critical constraint: **the human agent does NOT have access to the conversation transcript.** They can't scroll through the chat history to understand the issue.
A proper handoff summary must be self-contained and include:
  * **Customer ID** — so the human agent can pull up the account.
  * **Conversation summary** — what the customer asked for and what has been attempted.
  * **Root cause analysis** — the agent's assessment of the underlying issue.
  * **Refund amount** (if applicable) — the specific financial figure, not a vague reference.
  * **Recommended action** — what the agent believes the human agent should do.


This summary is the only information the human agent receives. If it is incomplete, the human agent must ask the customer to repeat everything, creating a poor experience.
### Practical Example: The 8% Failure Rate
Production data shows a customer support agent processes refunds without verifying account ownership in 8% of cases. The system prompt instructs: "Always verify the customer's identity before processing any refund." The prompt works 92% of the time but fails 8% of the time.
The 8% failure rate has already resulted in refunds processed on wrong accounts. This is a financial operation with real monetary consequences.
The fix is a programmatic prerequisite gate. Before `process_refund` can execute, the system checks that `get_customer` has returned a verified customer ID in the current session. This eliminates the 8% failure rate entirely — not by improving the prompt, but by physically preventing the incorrect execution order.
## Exam Traps
Exam Trap
Enhanced system prompt instructions as the fix for high-stakes compliance failures
If the current prompt already instructs the correct workflow but fails 8% of the time, a stronger prompt might reduce failures to 3-4% but will never reach 0%. Financial, security, and compliance operations require programmatic enforcement for deterministic guarantees.
Exam Trap
Few-shot examples as sufficient for guaranteed compliance
Few-shot examples improve model behaviour but are still probabilistic. They cannot provide the 100% enforcement required for financial and compliance operations. Use programmatic prerequisite gates.
Exam Trap
Routing classifiers proposed to fix per-agent compliance issues
A routing classifier determines which agent handles a request. The compliance failure occurs within the agent execution sequence, not at the routing level. Classifiers handle routing, not per-agent workflow enforcement.
Exam Trap
Handoff summaries that omit critical fields like customer ID or recommended action
Human agents do not have access to the conversation transcript. The handoff summary must be self-contained with all required fields: customer ID, conversation summary, root cause analysis, refund amount, and recommended action.
## Practice Scenario
Production data reveals that in 8% of cases, a customer support agent processes refunds without verifying account ownership, occasionally leading to refunds on wrong accounts. The system prompt clearly states 'always verify customer identity before processing refunds.' What is the most appropriate fix?
Option AAdd few-shot examples demonstrating the correct verification-then-refund workflow sequence
Option BImplement a programmatic prerequisite gate that blocks process_refund until get_customer has returned a verified customer ID
Option CAdd stronger instructions to the system prompt emphasising the critical importance of verification before any refund processing
Option DImplement a routing classifier that sends all refund requests to a specialised verification-first pipeline
Check Answer
## Build Exercise
Build Exercise
#### Build a Prerequisite Gate for Financial Operations
Difficulty
60 minutes
What you'll learn
  * Why programmatic enforcement is required for financial operations instead of prompt-based guidance
  * How prerequisite gates physically block tool execution until preconditions are met
  * The difference between the 8% prompt failure rate and 0% gate failure rate
  * How to implement structured handoff protocols with all required fields
  * How multi-concern requests should be decomposed and handled in parallel


  1. Create a customer support agent with three tools: get_customer (returns customer ID and verification status), lookup_order (returns order details), and process_refund (processes a refund for a given amount)
Why: These three tools create the exact scenario the exam uses for the 8% failure rate question. The workflow dependency between get_customer and process_refund is where programmatic enforcement becomes essential.
You should see: Three tool definitions with proper JSON Schema input_schema. get_customer accepts a name or email, lookup_order accepts an order ID, and process_refund accepts a customer ID and amount.
Stuck? Get a nudge
  2. Implement a programmatic prerequisite gate that blocks process_refund from executing until get_customer has returned a verified customer ID in the current session
Why: This is the core exam concept: prompt instructions work 92% of the time but fail 8%. A prerequisite gate provides 100% deterministic enforcement. The exam always rejects prompt-based solutions for financial operations.
You should see: A session-level state tracker that records whether get_customer has returned a verified customer. The process_refund handler checks this state before executing and returns an error if verification has not occurred.
Stuck? Get a nudge
  3. Test that the gate works by prompting the agent to skip verification and process a refund directly — verify the gate blocks the attempt
Why: Testing the bypass attempt demonstrates the difference between prompt-based and programmatic enforcement. Even when the model decides to skip verification, the gate blocks the action — which is the entire point of deterministic enforcement.
You should see: The agent attempts to call process_refund without prior verification. The gate returns a blocked error message. The agent then calls get_customer before retrying the refund successfully.
Stuck? Get a nudge
  4. Implement a structured handoff protocol: when the agent cannot resolve an issue, it compiles a self-contained summary with customer ID, conversation summary, root cause analysis, refund amount, and recommended action
Why: Human agents do NOT have access to the conversation transcript. The handoff summary is the only information they receive. The exam tests whether you include all five required fields: customer ID, summary, root cause, amount, and recommended action.
You should see: A handoff function that produces a structured object with all five fields populated. No field should be empty or contain placeholder text.
Stuck? Get a nudge
  5. Test the handoff with a multi-concern request (return plus billing dispute plus account update) and verify the handoff summary is complete and self-contained
Why: Multi-concern requests test whether the agent decomposes the request into distinct items and addresses all of them. The exam expects decomposition, parallel investigation, and unified resolution — not sequential handling or forgetting items.
You should see: The agent identifies all three concerns, investigates each one, and produces a handoff summary that covers all three issues with specific details for each. No concern is omitted.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Hooks Reference](https://code.claude.com/docs/en/hooks) — Anthropic (source for the subagent lifecycle section)
  * [Building with Claude API, including the Customer Support Resolution Agent scenario (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 1Task 1.5
# Agent SDK Hooks
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Agent SDK hooks inject deterministic behaviour into an otherwise probabilistic system. They sit right at the boundary between the model's decisions and the real world, intercepting tool calls and results to enforce business rules and normalise data. Remember the enforcement spectrum from 1.4? Hooks are how you implement its programmatic side in practice.
### Two Types of Hooks
The Agent SDK provides hooks at two points in the tool execution lifecycle:
**PostToolUse hooks** run **after** a tool executes but **before** the model processes the result. They intercept tool results and transform them before the model sees them. The model receives clean, normalised data regardless of which tool produced it.
**PreToolUse hooks** (sometimes described as tool-call interception) run **before** a tool executes. They intercept the outgoing tool call and can block it, modify it, or redirect it to an alternative workflow. The tool never runs if the hook decides to block it.
**What each hook returns.** In the Agent SDK a PreToolUse hook answers with a `permissionDecision` of `allow`, `deny`, `ask` or `defer`, plus an optional `updatedInput` that rewrites the tool's arguments before it runs. A PostToolUse hook can set `updatedToolOutput` to replace what the model sees, for built-in and MCP tools alike. The older `updatedMCPToolOutput` covered MCP tools only and is deprecated. One thing neither field changes: by the time PostToolUse fires the tool has already run, so blocking there stops the loop but does not undo the side effect. (Agent SDK hooks guide, checked September 2026.)
Key Concept
PostToolUse hooks transform data **after** execution. PreToolUse hooks enforce policy **before** execution. Know which direction each hook operates in — the exam tests this distinction.
### PostToolUse Hooks: Data Normalisation
Different MCP tools return data in different formats. A customer database might return Unix timestamps (1710489600). An order management system might return ISO 8601 dates ("2024-03-15T12:00:00Z"). A status API might return numeric codes (200, 404, 500) while another returns strings ("active", "cancelled", "pending").
Without normalisation, the model has to interpret these mixed formats on every single iteration. That breeds inconsistency. It might parse a Unix timestamp correctly one time and misread it the next.
A PostToolUse hook solves this by normalising all formats before the model processes them:
  * Unix timestamps → ISO 8601 dates
  * Numeric status codes → human-readable strings
  * Currency values → consistent decimal format with currency code
  * Date strings in various regional formats → a single standard format


The model receives clean, consistent data every time, regardless of which tool or backend system produced it.
### PreToolUse Hooks: Policy Enforcement
PreToolUse hooks are the implementation mechanism for the prerequisite gates described in 1.4. They intercept outgoing tool calls before execution and apply business rules:
**Use case: Refund threshold enforcement.** A hook intercepts all calls to `process_refund`. If the refund amount exceeds $500, the hook blocks the call and redirects to a human escalation workflow. The refund tool never executes — the hook prevents it before it can run.
**Use case: Compliance prerequisite gates.** A hook intercepts calls to `transfer_funds`. If the required anti-money laundering (AML) check has not been completed for this session, the hook blocks the call and returns an error message directing the agent to complete the AML check first.
**Use case: Manager approval workflow.** A hook intercepts calls to `approve_discount` for discounts above 20%. The hook pauses execution and routes the request to a manager approval queue. Only after manager approval does the tool execute.
Exam Trap
The exam will present PostToolUse hooks as a solution for blocking policy-violating actions. This is wrong. PostToolUse runs **after** execution — by the time it fires, the non-compliant action has already occurred. Use PreToolUse hooks (pre-execution) to block actions before they happen.
### The Decision Framework
This framework is the core mental model for the exam:  
| Requirement  | Mechanism  | Guarantee  |  
| --- | --- | --- |  
| Must be followed 100% of the time  | Hooks  | Deterministic  |  
| Preferred but occasional deviation is acceptable  | Prompts  | Probabilistic  |  
**If the business would lose money from a single failure** → use a hook. **If the business would face legal risk from a single failure** → use a hook. **If it is a formatting preference or style guideline** → prompt-based guidance is fine.
The exam consistently presents prompt-based solutions as distractors for scenarios requiring deterministic enforcement. The decision is not about whether prompts are "good enough" — it's about whether the consequence of a single failure justifies deterministic guarantees.
### Hooks vs Prompts: Side-by-Side Comparison
**Scenario: International transfers must pass AML checks.**
  * Prompt approach: "Always complete AML verification before processing international transfers." Works 95% of the time. The 5% failure rate means some transfers skip AML checks — a regulatory violation.
  * Hook approach: A PreToolUse hook blocks `transfer_funds` until `aml_check` returns a pass. Works 100% of the time. No transfer can execute without AML verification.


**Scenario: Responses should be formatted in markdown.**
  * Prompt approach: "Format all responses using markdown with headers and bullet points." Works most of the time. Occasional plain-text responses are not a business risk.
  * Hook approach: Unnecessary overhead. Formatting preferences do not require deterministic enforcement.


**Scenario: Refunds above $500 require human approval.**
  * Prompt approach: "For refunds above $500, escalate to a human agent." Works most of the time. A single failure means a large refund processed without approval.
  * Hook approach: Intercept `process_refund`, check the amount, block if above $500 and route to human escalation. Works 100% of the time.


### Practical Example: Data Format Chaos
A customer support agent uses three MCP tools:
  1. `get_customer` returns dates as Unix timestamps and status as numeric codes.
  2. `lookup_order` returns dates as ISO 8601 strings and status as English strings.
  3. `check_shipping` returns dates as "DD/MM/YYYY" and status as single-character codes ("S" for shipped, "P" for pending).


Without a PostToolUse hook, the model must interpret three different date formats and three different status representations on every iteration. Sometimes it correctly converts a Unix timestamp; sometimes it confuses the day/month order in "DD/MM/YYYY"; sometimes it misinterprets "P" as "processed" instead of "pending."
With a PostToolUse hook, all tool results are normalised before the model sees them:
  * All dates → ISO 8601 ("2024-03-15T12:00:00Z")
  * All status codes → human-readable strings ("shipped", "pending", "delivered")


The model always receives consistent data, eliminating interpretation errors entirely.
## Exam Traps
Exam Trap
Using PostToolUse hooks to block policy-violating actions
PostToolUse hooks run after tool execution. By the time the hook fires, the non-compliant action has already been processed. Use PreToolUse hooks (pre-execution) to block actions before they happen.
Exam Trap
Enhanced prompt instructions as the solution for 100% compliance requirements
Prompts provide probabilistic compliance. If the business requires 100% enforcement (financial operations, regulatory compliance, security checks), only hooks provide deterministic guarantees.
Exam Trap
Suggesting model-side data transformation instead of PostToolUse hooks for normalisation
Relying on the model to normalise heterogeneous data formats introduces inconsistency. PostToolUse hooks ensure clean, consistent data reaches the model every time, regardless of which tool produced it.
Exam Trap
Confusing the direction of hooks — PostToolUse runs after execution, PreToolUse runs before
PostToolUse transforms results after a tool runs. PreToolUse blocks or modifies calls before a tool runs. Using the wrong hook direction means either missing the opportunity to prevent an action or unnecessarily blocking completed work.
## Practice Scenario
An agent occasionally processes international transfers without required compliance checks. The compliance team requires 100% enforcement of anti-money laundering (AML) checks before any international transfer is executed. The current system uses prompt instructions that work approximately 95% of the time. What is the correct approach?
Option AImplement a PreToolUse hook that blocks the transfer_funds tool from executing until aml_check returns a verified pass result
Option BAdd detailed AML check instructions to the system prompt with examples of correct behaviour and explicit warnings about penalties for non-compliance
Option CAdd a PostToolUse hook that flags any completed transfer which skipped its AML check and queues it for manual review by the compliance team
Option DTrain the agent with few-shot examples demonstrating the correct AML verification workflow before every transfer
Check Answer
## Build Exercise
Build Exercise
#### Implement Agent SDK Hooks for Normalisation and Policy Enforcement
Difficulty
60 minutes
What you'll learn
  * The distinction between PostToolUse hooks (after execution, data normalisation) and PreToolUse hooks (before execution, policy enforcement)
  * Why hooks provide deterministic guarantees that prompts cannot match
  * How to normalise heterogeneous data formats from multiple MCP tools into a consistent schema
  * How to implement threshold-based and prerequisite-based policy enforcement using pre-execution hooks
  * The decision framework: hooks for 100% requirements, prompts for preferences


  1. Create an agent with three MCP tools that return data in different formats: Tool A returns Unix timestamps and numeric status codes, Tool B returns ISO 8601 dates and string statuses, Tool C returns DD/MM/YYYY dates and single-character status codes
Why: This recreates the data format chaos example from the exam. Without normalisation, the model must interpret three different date formats and three different status representations, leading to inconsistent parsing across iterations.
You should see: Three tool implementations that each return data with distinct date and status formats. Tool A uses epoch seconds and numeric codes, Tool B uses ISO strings and English statuses, Tool C uses DD/MM/YYYY and single characters.
Stuck? Get a nudge
  2. Implement a PostToolUse hook that intercepts all tool results and normalises dates to ISO 8601 format and status codes to human-readable English strings
Why: PostToolUse hooks run after execution but before the model processes the result. This is the correct hook direction for data normalisation — the exam tests whether you know that PostToolUse transforms data after execution, not before.
You should see: A HookCallback registered under PostToolUse that reads tool_response and rewrites it: Unix timestamps and DD/MM/YYYY dates to ISO 8601, numeric and single-character status codes to English strings. The rewritten object comes back as updatedToolOutput inside hookSpecificOutput.
Stuck? Get a nudge
  3. Verify the model receives consistent data by testing with queries that require results from all three tools
Why: Consistent data eliminates interpretation errors. Without normalisation, the model might confuse day/month order in DD/MM/YYYY or misinterpret status code P as processed instead of pending. Verification proves the hook works across all tool outputs.
You should see: Three tool results that all use ISO 8601 dates and English status strings, whichever tool produced them. The model response should reference dates and statuses consistently.
Stuck? Get a nudge
  4. Add a PreToolUse hook that blocks process_refund when the amount exceeds $500 and redirects to a human escalation workflow
Why: A PreToolUse hook runs before execution — the refund never processes. The exam specifically warns against using PostToolUse for blocking, because by that point the action has already occurred. Pre-execution interception is the only correct hook direction for policy enforcement.
You should see: A PreToolUse callback that inspects the refund amount and denies anything above $500, returning permissionDecision deny with a permissionDecisionReason. The refund tool never executes for denied calls.
Stuck? Get a nudge
  5. Add a second PreToolUse hook that blocks transfer_funds until aml_check has returned a pass result in the current session
Why: This is the AML compliance scenario from the exam. Prompt instructions achieve 95% compliance, but regulatory requirements demand 100%. The hook provides deterministic enforcement that no prompt can match — a single missed AML check can result in legal penalties.
You should see: Two callbacks: a PreToolUse hook on transfer_funds that denies until session state records a passing AML check, and a PostToolUse hook on aml_check that sets that state.
Stuck? Get a nudge
  6. Test both hooks by attempting to trigger the blocked operations and verify they are prevented before execution
Why: Testing confirms that the hooks provide deterministic enforcement. The key verification is that blocked tools never execute — the hook prevents the call, not just logs a warning after the fact.
You should see: Both denied operations leave their tool handlers untouched, and the model receives the permissionDecisionReason. Once the prerequisites are met, the same operations run.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Claude Agent SDK Hooks Documentation](https://platform.claude.com/docs/en/agent-sdk/hooks) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 1Task 1.6
# Task Decomposition Strategies
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Task decomposition is how you break complex work into pieces an agentic system can actually handle. The exam tests two patterns and expects you to pick the right one for the task in front of you. Pick wrong and the work suffers in predictable ways. It also tests one specific failure mode — attention dilution — that shows up when decomposition is too shallow.
### Pattern 1: Fixed Sequential Pipelines (Prompt Chaining)
Fixed sequential pipelines break work into predetermined steps that execute in order. Each step takes the output of the previous step as input.
**How it works:** The workflow is defined in advance. Step 1 runs, its output feeds into Step 2, Step 2's output feeds into Step 3, and so on. The sequence does not change based on intermediate results.
**Example — Code review pipeline:**
  1. For each file, run a local analysis pass (style, bugs, complexity).
  2. After all local passes, run a cross-file integration pass (data flow, API consistency, import chains).
  3. Compile results into a unified review report.


**Best for:** Predictable, structured tasks where the steps are known in advance. Code reviews, document processing, data extraction pipelines, and compliance checks all fit this pattern.
**Advantages:** Consistent and reliable. The same input always follows the same path. Easy to debug — you know exactly which step produced which output. Easy to monitor — you can log the output of each step.
**Limitations:** Cannot adapt to unexpected findings. If Step 2 discovers something that should change the approach for Step 3, the pipeline can't adjust. The steps are fixed regardless of what turns up along the way.
Key Concept
Fixed sequential pipelines (prompt chaining) are best for predictable, structured tasks. They provide consistency and reliability but cannot adapt to unexpected findings during execution.
### Pattern 2: Dynamic Adaptive Decomposition
Dynamic adaptive decomposition generates subtasks based on what is discovered at each step. The plan evolves as the agent learns more about the problem.
**How it works:** The agent starts with a high-level goal, performs initial investigation, and generates a plan based on what it finds. As it executes the plan, it discovers new information that may change the remaining steps. The agent adapts the plan accordingly.
**Example — Adding tests to a legacy codebase:**
  1. Map the codebase structure (directories, modules, dependencies).
  2. Identify high-impact areas (most-used modules, modules with the most bugs, untested critical paths).
  3. Create a prioritised test plan based on the mapping.
  4. Start writing tests. Discover that Module A depends on Module B, which has no tests.
  5. Reprioritise: test Module B first so Module A's tests can rely on it.
  6. Continue adapting as new dependencies and issues emerge.


**Best for:** Open-ended investigation tasks where the full scope is not known at the start. Legacy system exploration, security audits, research projects, and debugging unfamiliar codebases all benefit from this pattern.
**Advantages:** Adapts to the problem. Can discover and respond to unexpected complexity. Produces more thorough results for open-ended tasks because it does not force-fit a predetermined plan.
**Limitations:** Less predictable. Execution time varies depending on what is discovered. Harder to estimate completion time or resource usage. More difficult to debug when things go wrong.
### Selecting the Right Pattern
The exam tests your ability to match the pattern to the task:  
| Task Characteristics  | Pattern  | Reasoning  |  
| --- | --- | --- |  
| Steps known in advance, structured input  | Fixed pipeline  | Consistency and reliability outweigh adaptability  |  
| Open-ended, unknown scope  | Dynamic decomposition  | Adaptability is essential when the problem is not fully defined  |  
| Multi-file code review  | Fixed pipeline  | Per-file analysis + cross-file integration is predictable  |  
| Legacy codebase exploration  | Dynamic decomposition  | Dependencies and issues emerge during investigation  |  
| Document extraction  | Fixed pipeline  | Fields and format are predetermined  |  
| Debugging an unfamiliar system  | Dynamic decomposition  | Root cause is unknown; investigation must adapt  |  
Exam Trap
The exam may present a fixed pipeline as the solution for an open-ended investigation task, or dynamic decomposition for a structured processing task. Match the pattern to the task characteristics, not to what sounds more sophisticated.
### The Attention Dilution Problem
Attention dilution is a specific failure mode that occurs when an agent processes too many items in a single pass. The result is inconsistent depth — the agent produces thorough analysis for some items and misses obvious issues in others.
**The telltale symptoms:**
  * Detailed feedback for the first few files, increasingly shallow analysis for later files.
  * A pattern flagged as problematic in one file while identical code is approved in another file.
  * Obvious bugs missed in some files while minor style issues are caught in others.


**Why it happens:** The model allocates attention across all items in the context. When there are too many items, attention per item decreases. Early items get disproportionate attention; later items get skimmed.
**The fix: Multi-pass architecture.** Split the work into two layers:
  1. **Per-item local analysis passes** : analyse each file (or document, or module) individually in its own pass. Each pass has the full attention budget focused on a single item.
  2. **Cross-item integration pass** : after all local passes complete, run a separate pass that looks across all items for cross-cutting concerns (data flow issues, inconsistent pattern usage, cross-file dependencies).


The per-item passes catch local issues consistently because each item gets dedicated attention. The integration pass catches cross-item issues because it focuses specifically on relationships between items rather than trying to do everything at once.
### Practical Example: The 14-File Code Review
A code review agent processes 14 files in a single pass. The results:
  * Files 1-5: detailed feedback with specific line references, bug identification, and improvement suggestions.
  * Files 6-9: moderate feedback with some issues identified but less thorough analysis.
  * Files 10-14: superficial feedback that misses obvious null pointer bugs and SQL injection vulnerabilities.
  * A `forEach` loop flagged as inefficient in File 3, while identical code in File 11 receives no comment.


This is attention dilution. The fix is not a better model, a larger context window, or a more detailed prompt. The fix is structural: split into 14 per-file analysis passes (each focused on one file) plus a cross-file integration pass (checking for data flow issues and pattern consistency across all files).
The multi-pass approach catches the null pointer bugs in Files 10-14 (because each file gets its own dedicated pass) and identifies the inconsistent `forEach` evaluation (because the integration pass specifically checks for cross-file pattern consistency).
## Exam Traps
Exam Trap
Suggesting a more powerful model or larger context window as the fix for attention dilution
Attention dilution is an architectural problem, not a model capability problem. Processing too many items in a single pass produces inconsistent depth regardless of model power or context size. The fix is multi-pass architecture.
Exam Trap
Proposing a single-pass review with better prompts as equivalent to multi-pass architecture
Better prompts improve average quality but do not solve the fundamental attention allocation problem. Multi-pass architecture ensures each item receives dedicated attention, which a single-pass approach cannot guarantee.
Exam Trap
Applying fixed pipelines to open-ended investigation tasks
Open-ended tasks require adaptability. Fixed pipelines cannot respond to unexpected findings. Dynamic adaptive decomposition is the correct pattern when the full scope is unknown at the start.
Exam Trap
Batching files into groups without adding a cross-file integration pass
Batching reduces attention dilution within each batch but misses cross-batch issues. Without a dedicated cross-file integration pass, data flow issues and pattern inconsistencies across batches go undetected.
## Practice Scenario
A code review agent processes 14 files and produces detailed feedback for the first 5 files but misses obvious bugs in files 10-14. It also flags a forEach loop as inefficient in one file while approving identical code in another. What is the root cause and the most appropriate solution?
Option AReduce the number of files per review to 5 and process in sequential batches of 5 files each
Option BThe model context window is too small to hold all 14 files — upgrade to a model with a larger context window
Option CAdd a stronger system prompt emphasising the importance of reviewing all files with equal thoroughness
Option DSplit the review into per-file local analysis passes plus a separate cross-file integration pass to avoid attention dilution
Check Answer
## Build Exercise
Build Exercise
#### Build a Multi-Pass Code Review Pipeline
Difficulty
60 minutes
What you'll learn
  * Why attention dilution produces inconsistent analysis depth across files in single-pass reviews
  * How multi-pass architecture (per-item + cross-item) solves the structural attention allocation problem
  * The difference between fixed sequential pipelines and dynamic adaptive decomposition
  * Why batching without a cross-file integration pass still misses cross-cutting issues
  * How to identify attention dilution artefacts: same pattern flagged in one file, approved in another


  1. Create a code review agent that accepts a directory path containing at least 10 source files
Why: The 10+ file threshold is where attention dilution becomes observable. The exam uses a 14-file example where detailed feedback for early files degrades to superficial analysis for later files. Your setup must replicate this scale.
You should see: A code review function that reads all files in a directory and prepares them for analysis. It should handle at least 10 TypeScript or JavaScript source files.
Stuck? Get a nudge
  2. Implement a single-pass review that processes all files at once and record the results
Why: The single-pass approach is the baseline that demonstrates attention dilution. The exam expects you to recognise the symptoms: thorough analysis for early files, shallow analysis for later files, and contradictory pattern evaluation.
You should see: A review result where early files receive detailed feedback with specific line references and bug identification, while later files receive increasingly brief or missing feedback. This is the attention dilution pattern.
Stuck? Get a nudge
  3. Implement per-file local analysis passes that produce structured feedback for each file individually (bug count, severity, specific line references)
Why: Per-file passes give each file the full attention budget. This is the first layer of multi-pass architecture. The exam contrasts this with single-pass to show that structural decomposition solves attention dilution, not better prompts or larger context windows.
You should see: Consistent analysis depth across all files. The last file receives the same level of detail as the first. Each review includes bug count, severity ratings, and specific line references in a structured format.
Stuck? Get a nudge
  4. Implement a cross-file integration pass that checks for data flow issues, API consistency, and pattern usage consistency across all files
Why: Per-file passes catch local issues but miss cross-cutting concerns. The exam tests whether you include a cross-file integration pass — batching without it still misses data flow issues and pattern inconsistencies across files.
You should see: A separate analysis that takes the per-file summaries and checks for cross-file issues: inconsistent API usage, data flow problems between modules, and patterns used differently across files.
Stuck? Get a nudge
  5. Compare results: document which issues the single-pass review caught versus the multi-pass approach, paying special attention to consistency of analysis depth across all files
Why: This comparison demonstrates the exam argument quantitatively. Attention dilution is not a model capability problem — it is an architectural problem. The same model produces better results with multi-pass architecture, proving the fix is structural.
You should see: A comparison table showing: more total issues found by multi-pass, consistent issue counts across files (no drop-off for later files), and cross-file issues caught only by the integration pass.
Stuck? Get a nudge
  6. Record any cases where the single-pass review flagged a pattern in one file but approved identical code in another — these are attention dilution artefacts
Why: Contradictory pattern evaluation is the clearest symptom of attention dilution. The exam uses the forEach example: flagged as inefficient in File 3, approved without comment in File 11. Documenting these artefacts proves the structural nature of the problem.
You should see: At least one case where the single-pass review treated identical code patterns differently across files. The multi-pass review should treat the same pattern consistently.
Stuck? Get a nudge


## Sources
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Claude Code in Action (Skilljar)](https://anthropic.skilljar.com/claude-code-in-action) — Anthropic
  * [Anthropic Prompt Engineering Guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) — Anthropic


---


Domain 1Task 1.7
# Session State and Resumption
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Session management determines how an agent maintains continuity across work sessions. In long-running tasks — debugging a complex system, reviewing a large codebase, conducting multi-day research — the agent's context accumulates tool results, file analyses, and reasoning chains. Task Statement 1.7 covers how to manage this accumulated state: when to continue it, when to branch it, and when to start fresh.
### Three Session Management Options
The Agent SDK and Claude Code give you three approaches to session management. Each does a different job, and the exam expects you to pick the right one for the scenario in front of you.
**Option 1:`--resume <session-name>`**
Resume continues a specific named session from where it left off. The entire conversation history — including all tool results, analyses, and reasoning — is restored.
**When to use:** The prior context is mostly still valid. Files have not changed significantly since the last session. You want to pick up exactly where you stopped.
**When NOT to use:** Files have been modified since the last session. Tool results in the conversation history no longer reflect the current state of the codebase. This leads to the stale context problem (covered below).
Current state: how sessions get their names
`--resume` only resumes sessions that already exist — it accepts a session ID or name, or opens an interactive picker, but it never creates a session. In the current CLI you name a session when you start it with `--name` / `-n` (or mid-session with `/rename`), then continue it later with `claude --resume <name>`. There's also `-c` / `--continue`, which resumes the most recent conversation in the current directory without naming anything. (Verified against the Claude Code CLI reference, July 2026.)
**Option 2:`fork_session`**
Fork creates an independent branch from a shared analysis baseline. After the fork, each branch operates independently — changes in one branch do not affect the other, and branches cannot see each other's results.
In the SDK you set it beside `resume`, not instead of it: `resume` picks the session, and `fork_session: true` starts a new session from a copy of that history rather than appending to it. The CLI pairs `--fork-session` with `--resume` the same way. (Agent SDK sessions guide, checked September 2026. [Lesson 1.3](https://claudecertificationguide.com/learn/1-agentic-architecture/1-3-subagent-invocation-context#fork_session) has the full note.)
**When to use:** You have completed an initial analysis and want to explore divergent approaches from that shared starting point. For example, after analysing a codebase, you fork to compare two refactoring strategies. Each fork builds on the same initial understanding but takes a different direction.
**When NOT to use:** You simply want to continue the same line of investigation. Fork is for divergence, not continuation. If you are not comparing alternatives, use resume.
**Option 3: Fresh start with summary injection**
Start a completely new session but inject a structured summary of the prior session's findings into the initial context. The new session has no stale tool results — only the curated summary you provide.
**When to use:** Tool results from the prior session are stale (files have changed, APIs have been updated, dependencies have shifted). Context has degraded over a long session (too many irrelevant tool results cluttering the history). You need a clean baseline with preserved knowledge.
**When NOT to use:** The prior context is still valid and you want to maintain the full conversation history. In this case, resume is more efficient.
Key Concept
Three session management options serve three distinct purposes: **resume** for continuation, **fork** for divergent exploration, and **fresh start with summary injection** for when prior tool results are stale. The exam tests your ability to select the right option for each scenario.
### The Stale Context Problem
The stale context problem is the central concept of this task statement. It occurs when an agent resumes a session after code modifications and reasons from cached tool results that no longer reflect the current state of files.
**How it manifests:** A developer works with Claude Code to analyse a codebase. They make changes to 3 files and resume the session. Claude gives contradictory advice about those files — recommending changes that were already made, or referencing code that no longer exists — because it is reasoning from the old tool results still in its conversation history.
**Why it happens:** When you resume a session, the entire conversation history is restored, including every tool result from the previous session. If a file was read during the previous session and has since been modified, the old file contents are still in the conversation as a tool result. The model reasons from that stale data alongside any new data, leading to contradictions.
**The naive fix (and why it is insufficient):** Simply resuming the session and asking the agent to re-read the modified files. This is better than nothing, but the stale tool results remain in the conversation history. The model may still reference old information from earlier in the context, especially for tangential decisions that do not directly involve the modified files.
**The correct fix:** Start a fresh session with a structured summary of prior findings. Specify which files have changed so the agent can perform targeted re-analysis of those files. The fresh session has no stale tool results, and the injected summary preserves the knowledge from the prior session without the outdated data.
Exam Trap
The exam tests whether you recognise that resuming after file changes can lead to stale context. Simply resuming and asking the agent to re-read changed files is not the best answer — the stale results remain in history and can still influence reasoning. A fresh start with summary injection is more reliable.
### Targeted Re-Analysis vs Full Re-Exploration
When files have changed, the agent doesn't need to re-analyse the whole codebase. That's wasteful. Re-reading 50 files because 3 of them changed is time you don't get back.
The correct approach is **targeted re-analysis** : inform the agent about the specific files that changed and let it re-analyse only those files. The summary from the prior session covers everything that has not changed.
**What targeted re-analysis looks like in practice:**
  1. Start a fresh session.
  2. Inject a structured summary: "Prior analysis found X, Y, and Z across the codebase. The following 3 files have been modified since: auth.ts, database.ts, and api-routes.ts."
  3. The agent re-reads and re-analyses only the 3 modified files.
  4. It combines the fresh analysis of changed files with the preserved summary of unchanged files.


This is faster than full re-exploration and more reliable than resuming with stale context.
### When to Use Each Option: Decision Matrix  
| Scenario  | Best Option  | Reasoning  |  
| --- | --- | --- |  
| Continuing work from yesterday, no files changed  | `--resume`  | Prior context is valid, full history is useful  |  
| Comparing two refactoring approaches  | `fork_session`  | Divergent exploration from shared baseline  |  
| Resuming after modifying 3 of 50 files  | Fresh start + summary  | Stale tool results for modified files would cause contradictions  |  
| Long session with cluttered history  | Fresh start + summary  | Degraded context benefits from a clean baseline  |  
| Exploring a testing strategy vs a documentation strategy  | `fork_session`  | Two independent approaches from the same analysis  |  
| Resuming after dependency updates  | Fresh start + summary  | Multiple files may have changed indirectly  |  
### Practical Example: The Contradictory Advice Bug
A developer uses Claude Code to analyse a 50-file codebase over two days. On Day 1, they analyse the authentication module and identify three issues. Overnight, they fix all three issues by modifying `auth.ts`, `session.ts`, and `middleware.ts`.
On Day 2, they resume the session. Claude recommends fixing the three issues that were already fixed — because the old tool results showing the unfixed code are still in the conversation history. Worse, when asked about the current state of auth.ts, Claude gives contradictory answers: sometimes referencing the old code (from the stale tool result) and sometimes referencing the new code (from a fresh read).
The fix: start a fresh session with a summary. "Prior analysis identified three authentication issues in auth.ts, session.ts, and middleware.ts. All three have been fixed. Please re-analyse these three files to verify the fixes and check for any new issues introduced by the changes."
The fresh session has no stale tool results. The agent reads the current files, verifies the fixes, and provides consistent advice based on the actual current state.
## Exam Traps
Exam Trap
Suggesting full re-exploration of a 50-file codebase when only 3 files changed
Full re-exploration is wasteful. Inform the agent about the specific 3 files that changed for targeted re-analysis. The prior summary covers everything else.
Exam Trap
Recommending --resume after files have been modified
Resuming preserves stale tool results in the conversation history. The agent may reason from outdated file contents, leading to contradictory advice. A fresh start with summary injection avoids this.
Exam Trap
Confusing fork_session with --resume
fork_session starts a new session from a copy of the existing history, so the original is left as it was. --resume appends to the same session. Fork for divergence, resume for continuation. In the SDK fork_session is set beside resume, so the choice is append or branch, not one option or the other.
Exam Trap
Using fork_session to handle stale context after file changes
fork_session branches from the existing session, which still contains stale tool results. The fork inherits the stale context. A fresh start with summary injection is the correct approach for stale data.
## Practice Scenario
A developer resumes a Claude Code session after modifying 3 files in a 50-file codebase. The agent gives contradictory advice about the modified files — recommending changes that were already made and referencing code that no longer exists. What is the most appropriate approach?
Option AResume the existing session and ask the agent to re-read the 3 modified files, keeping the rest of the conversation history available for continuity
Option BStart a completely new session with no carried-over context and re-analyse the entire 50-file codebase from scratch before continuing the work
Option CStart a fresh session with an injected summary of prior findings and inform the agent about the specific 3 file changes for targeted re-analysis
Option DUse fork_session to branch the existing session so the file changes can be incorporated in a separate line of work
Check Answer
## Build Exercise
Build Exercise
#### Implement Session Management Strategies
Difficulty
45 minutes
What you'll learn
  * The three session management options: resume, fork_session, and fresh start with summary injection
  * Why resuming after file changes leads to the stale context problem
  * How structured summary injection preserves knowledge without stale tool results
  * When targeted re-analysis is more efficient than full re-exploration
  * The difference between fork_session (divergent exploration) and resume (continuation)


  1. Create a Claude Code session that analyses a 10-file codebase and name it with --name for later resumption
Why: Named sessions resumed with --resume enable continuation of work across breaks. The exam tests when resume is appropriate (no files changed) versus when it creates the stale context problem (files have been modified since the last session).
You should see: A named Claude Code session that reads and analyses 10 source files. The session name should be memorable for later resumption. The agent should produce findings about each file.
Stuck? Get a nudge
  2. Record the key findings from the initial analysis as a structured summary (file names, issues found, recommendations)
Why: This structured summary is the knowledge you will inject into the fresh session later. The exam tests whether you preserve prior findings without carrying stale tool results. A good summary captures conclusions without raw tool output.
You should see: A structured document listing each file name, the issues found in it, severity ratings, and specific recommendations. This should be concise enough to inject into a prompt but complete enough to preserve all key findings.
Stuck? Get a nudge
  3. Modify 3 files in the codebase to fix some of the identified issues
Why: Modifying files after a session creates the conditions for stale context. The old file contents remain as tool results in the session history while the actual files now contain different code. This is the exact scenario that triggers the contradictory advice bug.
You should see: Three files modified with fixes for the issues identified in the initial analysis. The changes should be substantive enough that the old and new versions would produce different analysis results.
Stuck? Get a nudge
  4. Attempt to resume the session with --resume and observe any stale context issues (contradictory advice, references to old code)
Why: This demonstrates the stale context problem. The resumed session contains old tool results showing the unfixed code. The agent may recommend fixing issues that are already fixed, or give contradictory advice by referencing both old and new file contents.
You should see: The agent giving contradictory advice: recommending fixes for issues already resolved, referencing code that no longer exists, or providing inconsistent guidance about the modified files. These are the hallmarks of stale context.
Stuck? Get a nudge
  5. Start a fresh session with the structured summary injected into the initial prompt, specifying the 3 changed files for targeted re-analysis
Why: Fresh start with summary injection is the correct approach when files have changed. The exam specifically tests this: no stale tool results, preserved knowledge from the prior session, and targeted re-analysis of only the changed files instead of wasteful full re-exploration.
You should see: A clean session that knows about the prior findings (from the injected summary), targets only the 3 changed files for re-analysis, and produces consistent advice without contradictions.
Stuck? Get a nudge
  6. Compare the quality and consistency of advice between the stale resume and the fresh start with targeted re-analysis
Why: This comparison demonstrates why the exam favours fresh start with summary injection over naive resume after file changes. The fresh start produces consistent, accurate advice while the resume produces contradictions from stale context.
You should see: A clear quality difference: the resume session gives contradictory or outdated advice about the modified files, while the fresh session gives accurate, consistent analysis based on the current file contents.
Stuck? Get a nudge


## Sources
  * [Claude Code Documentation](https://code.claude.com/docs/en) — Anthropic
  * [Claude Code in Action (Skilljar)](https://anthropic.skilljar.com/claude-code-in-action) — Anthropic
  * [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic
  * [Agent SDK: Work with sessions](https://code.claude.com/docs/en/agent-sdk/sessions) — Anthropic