Domain 218%
# Tool Design & MCP Integration
Design effective tool schemas, implement MCP servers and clients, and integrate external services into Claude-powered applications.
## Task Statements
[ 2.1Tool Interface Design ](https://claudecertificationguide.com/learn/2-tool-design-mcp/2-1-tool-schema-design)[ 2.2Structured Error Responses ](https://claudecertificationguide.com/learn/2-tool-design-mcp/2-2-structured-error-responses)[ 2.3Tool Distribution & Tool Choice ](https://claudecertificationguide.com/learn/2-tool-design-mcp/2-3-tool-distribution-choice)[ 2.4MCP Server Integration ](https://claudecertificationguide.com/learn/2-tool-design-mcp/2-4-mcp-server-integration)[ 2.5Built-in Tools ](https://claudecertificationguide.com/learn/2-tool-design-mcp/2-5-built-in-tools)


---


Domain 2Task 2.1
# Tool Interface Design
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Tool descriptions are the PRIMARY mechanism LLMs use for tool selection. Not supplementary metadata. Not an afterthought. The mechanism. When a model receives a set of tools, it reads the descriptions to decide which one to call — and if those descriptions are minimal, something like "Retrieves customer information", it has no way to tell apart tools that serve overlapping purposes.
### What Makes a Good Tool Description
A production-grade tool description includes five elements:
  1. **What the tool does** — its primary purpose, stated unambiguously
  2. **What inputs it expects** — data types, formats, constraints, and required versus optional fields
  3. **Example queries it handles well** — concrete use cases that anchor the model's understanding
  4. **Edge cases and limitations** — what the tool does NOT do, and what happens when inputs fall outside expected ranges
  5. **Explicit boundaries** — when to use THIS tool versus similar tools in the same toolkit


Here is the difference between a minimal and a production-grade description:
**Minimal (causes misrouting):**
textCopy

```
get_customer: "Retrieves customer information"
lookup_order: "Retrieves order details"

```

**Production-grade (reliable selection):**
textCopy

```
get_customer: "Looks up a customer account by email address,
phone number, or customer ID. Returns customer profile
(name, contact details, account status, loyalty tier).
Use this when you need to verify who the customer is.
Do NOT use for order-specific queries — use lookup_order
for those."

lookup_order: "Retrieves order details by order number
(format: #NNNNN) or tracking ID. Returns order status,
items, shipping details, and refund eligibility.
Use this when a customer asks about a specific order.
Do NOT use for customer identity verification —
use get_customer for that."

```

The second version gives the model explicit disambiguation. It knows which identifiers each tool accepts, what each returns, and crucially, when NOT to use each tool.
### The Misrouting Problem
Two tools with overlapping or near-identical descriptions cause selection confusion. The exam guide's sample Question 2 presents exactly this scenario: `get_customer` and `lookup_order` with minimal descriptions, causing the agent to route "check my order #12345" to the wrong tool.
The exam tests whether you can spot the correct fix. Four plausible options, three of them wrong:
  * **Expand descriptions** — correct. Low effort, high leverage, directly addresses the root cause.
  * **Few-shot examples** — wrong. Adds token overhead without fixing why the model is confused. You're treating symptoms, not the disease.
  * **Routing classifier** — wrong. Over-engineered as a first step. Bypasses the LLM's natural language understanding and adds infrastructure complexity.
  * **Tool consolidation** — wrong as a first step. It's a valid architectural choice long-term, but it costs far more effort than expanding descriptions.


The exam consistently favours low-effort, high-leverage fixes. Better descriptions before routing classifiers. Scoped access before full access. Community servers before custom builds.
### Tool Splitting
Generic tools with broad responsibilities create ambiguity. The fix: split them into purpose-specific tools with defined input/output contracts.
**Before splitting:**
textCopy

```
analyze_document: "Analyses a document and returns results"

```

**After splitting:**
textCopy

```
extract_data_points: "Extracts structured data fields
(dates, amounts, names) from a document"

summarize_content: "Produces a concise summary of a
document's key arguments and conclusions"

verify_claim_against_source: "Checks whether a specific
claim is supported by the source document, returning
supporting/contradicting evidence"

```

Each resulting tool does one narrow, clearly described job. The model can pick the right one based on what the user actually needs.
### Tool Renaming for Clarity
When two tools have confusingly similar names, renaming fixes the overlap at the interface level. Rename `analyze_content` to `extract_web_results`, give it a web-specific description, and the tool's purpose becomes unambiguous — without touching its implementation.
### System Prompt Interactions
Keyword-sensitive instructions in system prompts can create unintended tool associations that override well-written descriptions. If your system prompt says "always check customer details before proceeding", the model may route any customer-related query to `get_customer` no matter what the descriptions say.
So after updating tool descriptions, reread your system prompt for conflicts. It's a subtle failure mode, and the exam tests it.
Key Concept
Tool descriptions are the primary mechanism LLMs use for tool selection. When misrouting is caused by weak descriptions, improving them is the first fix — not few-shot examples, routing classifiers, or tool consolidation.
Read the condition on that, because the exam tests both halves. Descriptions are the fix when the agent has a workable number of tools and simply cannot tell two of them apart. They are **not** the fix when the toolkit itself is the problem: past roughly 4-5 tools per agent, selection degrades on decision complexity alone, and rewriting 22 descriptions leaves that untouched. Diagnose which one you are looking at before reaching for a remedy. Task Statement 2.3 covers the overload threshold and what to do instead.
## Exam Traps
Exam Trap
Choosing few-shot examples to fix tool misrouting caused by minimal descriptions
Few-shot examples add token overhead without addressing the root cause. The model is confused because descriptions do not differentiate the tools — fix the descriptions first.
Exam Trap
Implementing a routing classifier as the first step to fix tool selection
A routing classifier is over-engineered as a first response. It bypasses the LLM's natural language understanding and adds infrastructure the exam does not consider proportionate.
Exam Trap
Consolidating similar tools into one as the first step
Tool consolidation is a valid long-term architectural choice, but it requires more effort than expanding descriptions. The exam favours low-effort, high-leverage first steps.
Exam Trap
Ignoring system prompt wording after updating tool descriptions
Keyword-sensitive instructions in system prompts can silently override well-written tool descriptions, creating unintended tool associations.
## Practice Scenario
Production logs show an agent frequently calls get_customer when users ask about orders (e.g. 'check my order #12345'), instead of calling lookup_order. Both tools have minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and accept similar identifier formats. What is the most effective first step to improve tool selection reliability?
Option AAdd 5-8 few-shot examples to the system prompt demonstrating correct tool selection patterns for order-related queries.
Option BExpand each tool description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools.
Option CConsolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query.
Option DImplement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords.
Check Answer
## Build Exercise
Build Exercise
#### Design Tool Descriptions That Eliminate Misrouting
Difficulty
30 minutes
What you'll learn
  * Understand that tool descriptions are the primary mechanism LLMs use for tool selection
  * Write production-grade descriptions with purpose, inputs, examples, edge cases, and boundaries
  * Diagnose misrouting caused by ambiguous or overlapping descriptions
  * Identify system prompt conflicts that override well-written tool descriptions


  1. Create two MCP tools with intentionally ambiguous descriptions (e.g. get_customer: Retrieves customer information and lookup_order: Retrieves order details)
Why: Reproducing a misrouting scenario first-hand builds intuition for why minimal descriptions fail. The exam tests your ability to identify ambiguous descriptions as the root cause of tool selection errors.
You should see: Two tool definitions registered with your MCP server, each having a single-sentence description that does not mention input formats, example queries, or boundaries.
Stuck? Get a nudge
  2. Test with 10 queries covering different user intents and log which tool the model selects for each
Why: Quantifying selection accuracy before and after description changes gives you concrete evidence of the impact. The exam expects you to know that description quality directly affects selection reliability.
You should see: A log showing at least 2-3 misrouted queries where the model selected get_customer for order-related queries or vice versa, demonstrating the ambiguity problem.
Stuck? Get a nudge
  3. Rewrite both descriptions to include: purpose, expected inputs with formats, example queries, edge cases, and explicit boundaries against the other tool
Why: This is the core exam skill — the lowest-effort, highest-leverage fix for misrouting. Production-grade descriptions include all five elements: purpose, inputs, examples, edge cases, and boundaries.
You should see: Each tool description is 3-5 sentences long, explicitly states accepted identifier formats, gives example queries, and includes a boundary statement like "Do NOT use for order-specific queries — use lookup_order for those."
Stuck? Get a nudge
  4. Re-run the same 10 queries and compare selection accuracy before and after
Why: Measuring improvement validates that description quality is the root cause. The exam expects you to understand that better descriptions produce measurably better selection without any architectural changes.
You should see: Selection accuracy improves to 9/10 or 10/10 correct, with previously misrouted queries now hitting the correct tool. A clear before/after comparison showing the improvement.
Stuck? Get a nudge
  5. Review your system prompt for keyword-sensitive instructions that could override the improved descriptions
Why: System prompt conflicts are a subtle failure mode the exam tests. Keywords like "always check customer details" can create unintended tool associations that override even well-written descriptions.
You should see: A list of any keyword-sensitive phrases in your system prompt that could trigger incorrect tool associations, along with rewritten versions that avoid the conflict.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 2, Task Statement 2.1](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Tool use — Anthropic API Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — Anthropic
  * [Model Context Protocol Specification — Tools](https://modelcontextprotocol.io/docs/concepts/tools) — Model Context Protocol


---


Domain 2Task 2.2
# Structured Error Responses
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
When an MCP tool fails, the error response it returns determines whether the agent can recover intelligently or fail blindly. Generic messages like "Operation failed" are useless to an LLM. No signal about what went wrong, whether to retry, or what to try instead.
The MCP protocol provides the `isError` flag specifically for communicating tool failures back to the agent. Set it and the model knows the execution failed, so it can reason about recovery instead of treating the error text as a normal successful result.
### The Four Error Categories
Every tool failure falls into one of four categories. Each demands a different recovery strategy, and the agent needs structured metadata to distinguish them.
One shape note before the examples. `errorCategory`, `isRetryable` and `description` are an **application-level convention** , not part of the MCP envelope: the protocol's `CallToolResult` defines only `content`, `structuredContent` and `isError`. The examples below carry the metadata in `structuredContent`, which is where structured data belongs. The exam guide names these four categories and the `isRetryable` boolean, so know them by name; just do not expect to find them in the MCP specification.
**1. Transient Errors** Timeouts, service unavailability, rate limits. The underlying system is temporarily unreachable but the request itself is valid. Recovery: retry after a brief delay.
jsonCopy

```
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Service temporarily unavailable"
  }],
  "structuredContent": {
    "errorCategory": "transient",
    "isRetryable": true,
    "description": "The order database is experiencing high load. The request is valid and should succeed on retry."
  }
}

```

**2. Validation Errors** Invalid input format, missing required fields, out-of-range values. The request itself is malformed. Recovery: fix the input, then send a corrected call.
jsonCopy

```
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Invalid order ID format"
  }],
  "structuredContent": {
    "errorCategory": "validation",
    "isRetryable": false,
    "description": "Order ID must be in format #NNNNN (e.g. #12345). Received: 'order-abc'. Reformat the ID and call again."
  }
}

```

`isRetryable: false` here is not "give up". It means resending _this_ call is pointless: `order-abc` fails the same format check every time. The agent still recovers, just by correcting the input first — and the description tells it exactly how. The boolean says whether to resend; `errorCategory` says what to do instead.
**3. Business Errors** Policy violations, limit exceedances, business rule conflicts. The request is technically valid but violates a business constraint. Recovery: do NOT retry — the same request will always fail. The agent needs an alternative workflow.
jsonCopy

```
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Refund exceeds policy limit"
  }],
  "structuredContent": {
    "errorCategory": "business",
    "isRetryable": false,
    "description": "Refund amount of £750 exceeds the £500 automatic refund limit. This requires manager approval. Please escalate to a human agent with the refund details."
  }
}

```

Note the `isRetryable: false` flag. Business errors never resolve through retrying — the same policy violation applies every time. The agent has to take a fundamentally different path, usually escalation or an alternative workflow, and a customer-friendly explanation in the description lets it communicate that properly.
**4. Permission Errors** Access denied, insufficient credentials, authorisation failures. The tool cannot execute because the caller lacks the required permissions. Recovery: escalate or use different credentials.
jsonCopy

```
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Access denied"
  }],
  "structuredContent": {
    "errorCategory": "permission",
    "isRetryable": false,
    "description": "The current service account does not have permission to access financial records. Escalate to a senior agent with financial system access."
  }
}

```

### What isRetryable Really Signals
`isRetryable` answers one narrow question: will resending this exact request work? Only transient errors get `true` — the call was valid, the system was briefly not. Everything else is `false`, because something has to change first: the input (validation), the request itself (business), or the caller (permission).
Read `isRetryable` to decide whether to resend as-is, then read `errorCategory` to decide what to do when you can't:  
| Category  | `isRetryable`  | Recovery  |  
| --- | --- | --- |  
| `transient`  | `true`  | Resend the same call after a delay  |  
| `validation`  | `false`  | Correct the input, send a new call  |  
| `business`  | `false`  | Take an alternative path or escalate  |  
| `permission`  | `false`  | Retry as a principal with the right access  |  
The distinction that matters most is between the three `false` rows. Validation is recoverable by the agent alone. Business and permission are not — a policy limit applies no matter how the request is worded, and a permission error needs a different account, not a better call. `false` means "not this call again", not "stop".
Current state: where this table comes from
The exam guide (v1.0) states `retriable: false` for business rule violations and never assigns a value to validation. The `false` above is the convention the wider ecosystem uses — gRPC treats `INVALID_ARGUMENT` as non-retryable, and AWS-style retry metadata does the same — applied to a gap the guide leaves open. Expect the exam to test which _category_ a failure belongs to and what recovery it needs, which the guide does specify. If a question turns on the boolean for validation, reason from "will resending this exact call work" and you will land on `false`. (Verified against the exam guide, August 2026.)
### Access Failure vs Valid Empty Result
Of everything in this domain, this is the distinction to nail. The exam tests it directly.
**Access failure** : The tool couldn't reach the data source. A timeout occurred, authentication failed, or the service was down. The data might exist, but the tool couldn't check. The agent needs to decide whether to retry.
**Valid empty result** : The tool successfully queried the data source and found no matches. The query executed correctly — there simply is no data matching the criteria. The agent should NOT retry. The answer is "no results found."
Confusing the two breaks recovery logic entirely. Here's how that plays out:
> A tool returns an empty array after a customer lookup. The agent retries 3 times, then escalates to a human. Analysis reveals the customer's account simply does not exist.
The tool succeeded. It queried the database, found no matching customer, and correctly returned an empty result. But because the response doesn't distinguish between "I couldn't reach the database" and "I reached the database and found nothing", the agent treats both the same way — as a failure worth retrying.
The fix: structure your tool responses so a successful query with no results looks nothing like a failed query.
jsonCopy

```
// Valid empty result — NOT an error
{
  "isError": false,
  "content": [{
    "type": "text",
    "text": "No customer found matching email 'john@example.com'. The query executed successfully but returned no matches."
  }],
  "structuredContent": {
    "resultCount": 0
  }
}

// Access failure — IS an error
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Could not reach customer database"
  }],
  "structuredContent": {
    "errorCategory": "transient",
    "isRetryable": true,
    "description": "Connection to the customer database timed out after 5 seconds. The query did not execute."
  }
}

```

### Error Propagation in Multi-Agent Systems
In multi-agent architectures, error handling follows a principle of local recovery with selective propagation:
  1. **Subagents implement local recovery for transient failures.** If a web search times out, the search subagent retries before bothering the coordinator.
  2. **Only propagate errors that cannot be resolved locally.** If all retries fail, the subagent reports the failure upward.
  3. **Include partial results and what was attempted.** The coordinator needs context: "I searched 3 of 5 sources successfully. Sources 4 and 5 timed out. Here are partial results from the 3 successful sources."


This prevents two anti-patterns: silently suppressing errors (returning empty results as success) and terminating entire workflows on a single failure. Both leave the coordinator making decisions blind.
Key Concept
The distinction between access failures (tool could not reach the data source) and valid empty results (tool successfully queried and found nothing) is critical. Confusing the two causes wasted retries and incorrect escalations. The exam tests this directly.
## Exam Traps
Exam Trap
Retrying when a tool returns an empty result from a successful query
An empty result from a successful query means 'no data matches your criteria.' Retrying will produce the same empty result. The agent should accept the result and respond accordingly.
Exam Trap
Using generic error messages like 'Operation failed' without structured metadata
Without errorCategory, isRetryable, and a description, the agent cannot distinguish transient failures from business rule violations. It cannot make appropriate recovery decisions.
Exam Trap
Treating business errors as retryable
Business errors (e.g. refund exceeds policy limit) will never resolve through retry. The same policy violation applies every time. The agent must take an alternative path such as escalation.
Exam Trap
Marking a validation error isRetryable: true because the agent can recover from it
isRetryable answers whether resending this exact call can work. A malformed order ID fails the same check every time, so validation is isRetryable: false. The agent still recovers — by correcting the input and issuing a new call — but errorCategory carries that instruction, not the boolean.
Exam Trap
Reading isRetryable: false as 'abandon the task'
Three categories are non-retryable and only two of them are dead ends. Validation is false because the input must change first, and the agent fixes it unaided. Business and permission are the ones that need an alternative path or a different principal.
Exam Trap
Silently suppressing subagent errors by returning empty results as success
This hides failure information from the coordinator, preventing intelligent recovery. The coordinator cannot distinguish 'found nothing' from 'could not search' and may produce incomplete or inaccurate output.
## Practice Scenario
A tool returns an empty array after a customer lookup. The agent retries 3 times, then escalates to a human agent. Analysis shows the customer's account simply does not exist. What is the root cause of this wasted effort?
Option AThe retry limit is too low. Raising it to 5 attempts would give the lookup enough chances to return the account before escalation triggers.
Option BThe system prompt should instruct the agent never to retry a customer lookup, so that every failed search escalates to a human immediately.
Option CThe escalation threshold is too aggressive. The agent should exhaust more retries before involving a human in the loop.
Option DThe tool does not distinguish between access failures and valid empty results, so the agent treats no matches as a retriable failure.
Check Answer
## Build Exercise
Build Exercise
#### Build Structured Error Responses for All Four Categories
Difficulty
45 minutes
What you'll learn
  * Implement structured error responses with errorCategory, isRetryable, and description metadata
  * Distinguish between access failures (isError: true) and valid empty results (isError: false)
  * Categorise tool failures into transient, validation, business, and permission types
  * Build agent recovery logic that takes different actions based on error metadata


  1. Create an MCP tool that queries a mock customer database with simulated failure modes
Why: Simulating failure modes in a controlled environment lets you observe how agents behave when errors lack structure. The exam tests your understanding of how poor error responses cause wasted retries and incorrect escalations.
You should see: An MCP server running with a customer_lookup tool that accepts a customer identifier and a failure_mode parameter to trigger specific error conditions on demand.
Stuck? Get a nudge
  2. Implement four error response types: transient (simulated timeout), validation (invalid input format), business (refund exceeds policy limit), and permission (access denied)
Why: Each error category demands a different recovery strategy. The exam tests whether you can identify which category an error belongs to and what recovery action is appropriate. Transient errors are retryable; business errors never are.
You should see: Four distinct error responses, each with isError: true, a specific errorCategory value, the correct isRetryable boolean, and a descriptive message explaining what went wrong and what to do next.
Stuck? Get a nudge
  3. Include structured metadata in each error: errorCategory, isRetryable boolean, and a human-readable description
Why: Structured metadata is what enables intelligent recovery. Without these fields, the agent cannot distinguish a transient timeout from a permanent policy violation. The exam specifically tests whether you know that isRetryable: false means the agent must take an alternative path, not retry.
You should see: Each error response parses to a JSON object containing exactly three fields: errorCategory (one of transient, validation, business, permission), isRetryable (boolean), and description (a sentence explaining the error and suggesting recovery).
Stuck? Get a nudge
  4. Implement a valid empty result response (isError: false, resultCount: 0) clearly distinguished from an access failure
Why: This is one of the most critical distinctions in Domain 2. Confusing access failures with valid empty results causes wasted retries and incorrect escalations. The exam tests this directly — an agent retrying a successful empty query is the canonical anti-pattern.
You should see: Two structurally different responses: a valid empty result with isError: false and resultCount: 0 (indicating the query ran successfully but found nothing), and an access failure with isError: true, errorCategory: transient, and isRetryable: true.
Stuck? Get a nudge
  5. Write an agent loop that reads the error metadata and takes appropriate action: retry for transient, fix input for validation, escalate for business, and request credentials for permission
Why: The agent loop demonstrates the practical outcome of structured error metadata. Each error category maps to a specific recovery action, and the loop must branch correctly. This is exactly the kind of decision logic the exam expects you to design.
You should see: An agent loop that parses the error metadata, branches on errorCategory, retries transient errors up to 3 times with backoff, reformats input for validation errors, escalates business errors to a human, and requests elevated credentials for permission errors.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 2, Task Statement 2.2](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [MCP Specification — Tool Results](https://modelcontextprotocol.io/docs/concepts/tools) — Model Context Protocol
  * [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents) — Anthropic


---


Domain 2Task 2.3
# Tool Distribution & Tool Choice
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
The number of tools you give an agent directly affects how reliably it selects the right one. That sounds like an implementation detail. It isn't — it's an architectural decision that determines whether your multi-agent system works in production.
### The Tool Overload Problem
Giving a single agent 18 tools degrades selection reliability. Every additional tool adds decision complexity, and error rates climb as the toolkit grows. The optimal range is **4-5 tools per agent** , scoped to that agent's specific role.
Quantity isn't the whole story, though — relevance matters just as much. A synthesis agent should NOT have web search tools. A web search agent should NOT have document analysis tools. Give an agent tools outside its specialisation and it will tend to misuse them: a synthesis agent with access to `web_search` might run its own searches instead of using the results already handed to it, duplicating work and wasting context.
The principle: each agent gets only the tools it needs for its defined role. Nothing more.
### Consolidating Near-Duplicate Tools
Splitting by role is the obvious answer to tool overload. It's the wrong one when the tools all do the same kind of work.
Take a data platform server with 22 tools: three query tools, one per data source, and 19 transformations — `pivot_table`, `calculate_percentile`, `normalise_currency`, on down the list. Split that by role and you hand a transformation agent 19 tools, which is the original problem moved one level down. The agent still can't choose reliably.
Those 19 collapse instead, because they share a shape. Data in, an operation, data out:
jsonCopy

```
{
  "name": "transform_data",
  "description": "Apply a transformation to a dataset. Use transform_type to select the operation.",
  "input_schema": {
    "type": "object",
    "properties": {
      "dataset": { "type": "string" },
      "transform_type": {
        "type": "string",
        "enum": ["pivot", "percentile", "normalise_currency", "..."]
      },
      "options": { "type": "object" }
    },
    "required": ["dataset", "transform_type"]
  }
}

```

Twenty-two tools become four. Nothing is lost: every transformation is still reachable, now as an enum value the model picks inside a single call rather than a tool it has to find among nineteen near-identical descriptions. Selection accuracy improves because the hard choice got smaller, not because the capability did.
So which fix applies?  
| The tools are...  | The fix  |  
| --- | --- |  
| Few enough to handle, but two of them read alike  | Sharpen the descriptions (Task Statement 2.1)  |  
| Different jobs (query, transform, export)  | Split by role, 4-5 tools each  |  
| Variations on one job, sharing a shape  | Consolidate into one parameterised tool  |  
| Doing more than the agent should be able to do  | Constrain them (next section)  |  
The first row is the one candidates trip on. Task Statement 2.1 teaches descriptions as the fix for misrouting, and it is right when the toolkit is small enough to reason about. An agent choosing `get_customer` over `lookup_order` from a set of five is a description problem. The same symptom from a set of 22 is not: the agent is past the point where any description quality rescues selection, and rewriting all 22 leaves the decision complexity exactly where it was. Same symptom, different disease. **Count the tools before you pick the remedy.**
Watch the third row: it pulls the other way, and the exam likes that tension. Consolidation reduces how many tools an agent chooses between. Constraining reduces what any one tool can reach. Collapsing 19 transformations into `transform_data` doesn't hand the agent new powers, so it doesn't undo least privilege. Replacing `fetch_url` with `load_document` does the opposite job and both can be right in the same system.
One fix that isn't a fix: moving tools onto a second MCP server. Server boundaries are invisible to the model. A client hands it every tool from every connected server as one flat list, so a 22-tool problem split across two servers is still a 22-tool problem.
### The tool_choice Configuration
The `tool_choice` parameter controls how the model interacts with available tools. Three settings, three distinct jobs.
**`"auto"`(default)** The model decides whether to call a tool or return text. Use this for general operation where the model needs flexibility to respond conversationally when no tool call is appropriate.
jsonCopy

```
{
  "tool_choice": { "type": "auto" }
}

```

**`"any"`**The model MUST call a tool but chooses which one. Use this when you need guaranteed structured output from one of multiple schemas — the model will always produce a tool call, never plain text.
jsonCopy

```
{
  "tool_choice": { "type": "any" }
}

```

Extraction pipelines are where this earns its keep. If you have multiple extraction schemas (one for invoices, one for receipts, one for contracts) and the document type is unknown, `"any"` guarantees the model picks one and produces structured output rather than returning a conversational response.
**Forced selection** The model MUST call a specific named tool. Use this to enforce mandatory first steps — the model cannot skip or reorder the required operation.
jsonCopy

```
{
  "tool_choice": { "type": "tool", "name": "extract_metadata" }
}

```

This is the tool for enforcing workflow ordering. If metadata extraction must happen before any enrichment tools run, forced selection guarantees it. The model can't decide to skip `extract_metadata` and jump straight to enrichment. After the forced call completes, subsequent turns can use `"auto"` for the remaining steps.
### Scoped Cross-Role Tools
Sometimes an agent needs occasional access to a capability that belongs to another role. The naive approach is to route every such request through the coordinator. The problem: this adds 2-3 round trips per request and can increase latency by 40% or more.
The solution is a **scoped cross-role tool** : a constrained version of the capability, given directly to the agent that needs it.
Say a synthesis agent needs to verify simple facts constantly during report generation. The naive design routes every verification back to the coordinator, which delegates to the search agent, waits for results, and returns them. For 85% of verifications — simple lookups that take milliseconds — that round trip is pure waste.
The fix: give the synthesis agent a scoped `verify_fact` tool that handles simple lookups directly. Complex verifications (requiring multiple sources, cross-referencing, or real judgement) still route through the coordinator. The 85% simple case is handled locally; the 15% complex case uses the full pipeline.
The exam guide's sample Question 9 tests this pattern directly.
### Replacing Generic Tools with Constrained Alternatives
Instead of giving a subagent `fetch_url` (which can fetch anything from anywhere), give it `load_document` that validates document URLs only. The constrained tool:
  * Prevents misuse (the agent cannot fetch arbitrary URLs)
  * Makes the tool's purpose clearer (the description is specific, not generic)
  * Reduces the risk of unintended side effects (no fetching of non-document resources)


This is **least privilege applied to tool design**. Each tool does exactly what the agent needs and nothing more.
### Role-Specific Tool Scoping in Practice
Here is how tool distribution looks in a well-designed multi-agent research system:  
| Agent  | Tools (4-5 each)  |  
| --- | --- |  
| Web Search  |  `search_web`, `fetch_page`, `extract_links`, `save_snippet`  |  
| Document Analysis  |  `extract_metadata`, `extract_data_points`, `summarize_content`, `verify_claim`  |  
| Synthesis  |  `compile_report`, `verify_fact` (scoped), `format_citation`, `assess_coverage`  |  
| Coordinator  |  `Agent` (formerly `Task`, used to spawn subagents), `review_output`, `request_revision`  |  
Each agent has exactly the tools it needs. The synthesis agent has a scoped `verify_fact` for simple lookups. The coordinator runs the workflow without holding any domain-specific tools itself.
Key Concept
The optimal range is 4-5 tools per agent, scoped to its role. For high-frequency simple operations, add a scoped cross-role tool directly to the agent that needs it — this avoids coordinator round-trip latency for the common case.
## Exam Traps
Exam Trap
Routing all simple verification requests through the coordinator when 85% are simple lookups
Coordinator round-trips add 2-3 extra hops per request. A scoped verify_fact tool on the synthesis agent handles the 85% simple case directly, cutting latency by up to 40%.
Exam Trap
Using tool_choice 'auto' when structured output is required
With 'auto', the model may return conversational text instead of calling a tool. Use 'any' to guarantee a tool call, or forced selection to guarantee a specific tool call.
Exam Trap
Giving an agent 18 tools and expecting reliable selection
Tool selection reliability degrades as the number of tools increases. The optimal range is 4-5 tools per agent. More tools means more decision complexity and more selection errors.
Exam Trap
Giving a subagent a generic fetch_url tool when a constrained load_document would suffice
Generic tools enable misuse. Constrained alternatives (load_document that validates document URLs only) enforce the principle of least privilege and make the tool's purpose clearer.
## Practice Scenario
A synthesis agent frequently returns control to the coordinator for simple fact verification, adding 2-3 round trips per task and 40% latency. Analysis shows 85% of verifications are simple lookups. What is the most effective solution?
Option AGive the synthesis agent a scoped verify_fact tool for simple lookups, routing only complex verifications through the coordinator.
Option BRemove the fact verification step from the synthesis workflow entirely so no task ever pays the round-trip latency.
Option CCache all verification results at the coordinator level so that repeated lookups return instantly without a second round trip to any subagent.
Option DIncrease the coordinator parallelism so that verification requests are processed concurrently and the queueing delay disappears entirely.
Check Answer
## Build Exercise
Build Exercise
#### Configure Tool Distribution Across a Multi-Agent System
Difficulty
45 minutes
What you'll learn
  * Scope tools to agent roles using the 4-5 tools per agent guideline
  * Implement scoped cross-role tools to avoid coordinator round-trip latency
  * Configure tool_choice modes (auto, any, forced) for different workflow requirements
  * Apply least-privilege tool design by replacing generic tools with constrained alternatives
  * Verify that tool distribution prevents cross-role misuse in multi-agent systems


  1. Design three agent roles (web search, document analysis, synthesis) and assign 4-5 tools to each, scoped to its role
Why: Tool overload degrades selection reliability. The exam tests the principle that each agent should have 4-5 tools scoped to its specific role. Giving a single agent 18 tools is a known anti-pattern that causes misrouting.
You should see: A configuration object or table listing three agents, each with exactly 4-5 tools. No tool appears in more than one agent role (except scoped cross-role tools added later). Tool names clearly indicate their purpose and scope.
Stuck? Get a nudge
  2. Add a scoped verify_fact tool to the synthesis agent that handles simple lookups directly
Why: Routing every fact verification through the coordinator adds 2-3 round trips and up to 40% latency. The exam tests the scoped cross-role tool pattern — give the agent a constrained version of a capability for the 85% simple case, routing only complex cases to the coordinator.
You should see: A verify_fact tool added to the synthesis agent toolset with a description that explicitly limits it to simple single-source lookups and states that complex multi-source verifications should be escalated to the coordinator.
Stuck? Get a nudge
  3. Configure tool_choice forced selection on the document analysis agent to ensure extract_metadata runs as the mandatory first step
Why: Forced selection enforces workflow ordering. The exam tests your knowledge of all three tool_choice modes: auto lets the model choose freely, any guarantees a tool call, and forced selection guarantees a specific tool call. This prevents the model from skipping mandatory steps.
You should see: A document analysis agent configuration where the first API call uses tool_choice with type: tool and name: extract_metadata, and subsequent calls switch to tool_choice: auto for the remaining analysis steps.
Stuck? Get a nudge
  4. Replace a generic fetch_url tool with a constrained load_document that validates document URLs only
Why: This applies the principle of least privilege to tool design. A generic fetch_url tool can fetch anything from anywhere, enabling misuse. A constrained load_document that validates URLs prevents the agent from fetching arbitrary resources. The exam tests this pattern directly.
You should see: A load_document tool definition that includes URL validation logic (checking for document file extensions or trusted domains) and rejects non-document URLs with a clear error message.
Stuck? Get a nudge
  5. Test with a query that requires all three agents and verify that no cross-role tool misuse occurs
Why: End-to-end testing validates that your tool distribution works in practice. Cross-role misuse — such as a synthesis agent running its own web searches instead of using provided results — is a common failure the exam expects you to prevent through proper scoping.
You should see: A test run log showing: the web search agent using only its tools, the document analysis agent starting with extract_metadata (forced), and the synthesis agent using compile_report plus verify_fact for simple checks. No agent calls a tool outside its assigned set.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 2, Task Statement 2.3](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Tool use — Anthropic API Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — Anthropic
  * [Claude Agent SDK — Tool Configuration](https://platform.claude.com/docs/en/agent-sdk/overview) — Anthropic


---


Domain 2Task 2.4
# MCP Server Integration
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
MCP (Model Context Protocol) servers extend Claude's capabilities by connecting it to external systems — databases, APIs, development tools, issue trackers. Configuring them correctly determines whether your team shares a consistent toolset or descends into configuration chaos.
### The Scoping Hierarchy
MCP server configuration lives at two levels, and mixing them up is where most setup problems start.
**Project-level:`.mcp.json`** Lives in the project repository root. Version-controlled. Shared with every team member who clones or pulls the repository. Use this for servers that the entire team needs — your Jira integration, your GitHub tools, your internal API connectors.
jsonCopy

```
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "atlassian": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/mcp/authv2"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${WORKSPACE_ROOT:-.}"]
    }
  }
}

```

Note the two entry shapes. A remote server declares `"type": "http"` and a `url`. A local one declares a `command` and `args`, and speaks over stdio. An entry with a `url` but no `type` is a configuration error — Claude Code reads it as a stdio server, skips it, and tells you to add the `type`. Both GitHub and Atlassian ship official **remote** servers now, which is why neither is an `npx` line.
**User-level:`~/.claude.json`** Lives in the user's home directory. Personal. NOT version-controlled. NOT shared with teammates. Use this for experimental servers, personal integrations, or servers you're testing before proposing them to the team.
Current state
Exam guide v1.0 describes MCP configuration at **two** levels, project and user, and that is the expected exam answer. As of 14 August 2026 the [MCP documentation](https://code.claude.com/docs/en/mcp) documents **three** scopes — `local` (the default), `project` and `user` — selected with `-s` / `--scope`, with `~/.claude.json` holding both the local and user entries. On the exam, answer with the two-level project-vs-user split.
**Key principle** : all tools from all configured servers (both project-level and user-level) are discovered at connection time and available simultaneously. There's no manual activation step — if a server is configured and reachable, its tools appear in the agent's toolkit.
### Environment Variable Expansion
The `.mcp.json` file supports `${VARIABLE_NAME}` syntax for environment variable expansion. This is how you keep credentials out of version control whilst still sharing server configuration with your team.
jsonCopy

```
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}

```

Each developer sets their own tokens locally (in their shell profile, `.env` file, or secrets manager). The `.mcp.json` file references the variable names, not the values. This means:
  * The configuration file is safe to commit to version control
  * Each developer authenticates with their own credentials
  * Token rotation does not require config file changes
  * No secrets leak through repository history


There is a second form worth knowing: `${VAR:-default}` expands to `VAR` when it is set and falls back to `default` when it is not. Use it for machine-specific paths that have a sensible fallback, as in the `${WORKSPACE_ROOT:-.}` argument above. As of 14 August 2026, an unset variable with no default does not stop the rest of the configuration loading. Claude Code warns and carries on, so do not rely on a missing token failing loudly.
### MCP Resources
MCP resources expose content catalogues to agents without requiring exploratory tool calls. Instead of calling a tool to discover what data exists, the agent gets that information upfront.
That is the exam guide's framing and the keyed answer. One precision from the MCP specification (September 2026): resources are application-controlled. The server lists them, but the client decides when to attach one to the model's context, so the agent sees a resource only when the host surfaces it. Claude Code does that through `@server:resource` mentions and a resource-listing tool.
Examples of what to expose as resources:
  * **Issue summaries** — a list of current Jira issues with titles and statuses
  * **Documentation hierarchies** — a table of contents for your internal docs
  * **Database schemas** — table names, column types, and relationships


The payoff is fewer wasted calls. Without resources, an agent might call `list_tables`, then `describe_table` for every table, burning tool calls just to get its bearings. With a database schema resource, it knows immediately.
Resources show agents what data is available. Tools let them act on it.
### The Build-vs-Use Decision
This decision comes up constantly, in the exam and in real work. Your team needs to integrate with an external system: build a custom MCP server, or use an existing community one?
**Use community servers for standard integrations:**
  * Jira, GitHub, Slack, Linear, Notion — these all have maintained community MCP servers
  * They cover standard use cases, are tested by the community, and receive updates
  * Using them saves development time and maintenance burden


**Build custom servers only when:**
  * Your team has specific workflows that community servers cannot handle
  * You need custom business logic embedded in the tool layer
  * You require integration with proprietary internal systems that have no community server


The exam consistently favours the pragmatic choice. "Evaluate community servers first" is always correct when a standard integration is involved. "Build custom" is only correct when the scenario explicitly describes team-specific requirements that community servers cannot meet.
### Enhancing MCP Tool Descriptions
Here's a subtle one: when an MCP tool has a sparse description, the agent may prefer built-in tools (like Grep) even when the MCP tool is more capable. The model simply has better context about built-in tools — their descriptions are rich and detailed.
The fix: enhance your MCP tool descriptions to explain capabilities and outputs in detail. Instead of:
Copy
```
search_codebase: "Searches code"

```

Write:
Copy
```
search_codebase: "Performs semantic code search across the
entire repository using AST-aware indexing. Returns matching
functions, classes, and methods with full context including
file path, line numbers, and surrounding code. More accurate
than text-based grep for finding code by intent rather than
exact string match. Use this instead of Grep when searching
for code by what it does rather than what it contains."

```

The enhanced description gives the model enough context to prefer the MCP tool when it's genuinely more capable than the built-in alternative.
Key Concept
Project-level `.mcp.json` is version-controlled and shared with the team. User-level `~/.claude.json` is personal and not shared. Use `${ENV_VAR}` syntax to keep credentials out of version control.
## Exam Traps
Exam Trap
Building a custom MCP server for a standard integration like Jira
Community MCP servers exist for standard integrations and should be evaluated first. Custom builds are only justified for team-specific workflows that community servers cannot handle.
Exam Trap
Putting team-wide MCP server configuration in ~/.claude.json
~/.claude.json is user-level and personal — it is not version-controlled or shared. Team-wide servers belong in .mcp.json at the project root.
Exam Trap
Committing credentials directly in .mcp.json instead of using environment variable expansion
Credentials in version control are a security risk. Use ${GITHUB_TOKEN} syntax so each developer sets tokens locally and secrets never enter repository history.
Exam Trap
Leaving MCP tool descriptions sparse, causing the agent to prefer built-in tools
The model defaults to tools it understands best. Sparse MCP descriptions lose out to detailed built-in tool descriptions. Enhance MCP descriptions to explain capabilities and outputs fully.
## Practice Scenario
A team needs to integrate with Jira for issue tracking in their Claude Code workflow. A developer proposes building a custom MCP server. What is the correct first step?
Option AEvaluate existing community MCP servers for Jira and only build custom if they cannot handle team-specific workflows.
Option BAdd the Jira integration to ~/.claude.json so that each developer can configure their own connection to Jira independently.
Option CUse the Jira REST API directly from Bash commands instead of MCP, which avoids the whole server setup and its configuration.
Option DBuild a custom MCP server exposing exactly the Jira API endpoints the team needs, so the integration matches their workflow precisely.
Check Answer
## Build Exercise
Build Exercise
#### Configure MCP Servers with Scoping and Environment Variables
Difficulty
30 minutes
What you'll learn
  * Configure project-level MCP servers in .mcp.json for team-wide sharing
  * Use environment variable expansion to keep credentials out of version control
  * Distinguish between project-level and user-level MCP configuration scoping
  * Expose MCP resources to reduce unnecessary exploratory tool calls
  * Write enhanced MCP tool descriptions that compete with built-in tool descriptions


  1. Create a .mcp.json file in your project root configuring an official MCP server (e.g. the GitHub remote endpoint)
Why: Project-level .mcp.json is version-controlled and shared with every team member who clones the repository. The exam tests whether you know that team-wide servers belong here, not in ~/.claude.json. Using community servers for standard integrations is always the correct first choice.
You should see: A .mcp.json file at the project root containing an mcpServers object with at least one server entry. A remote server needs "type": "http" and a url; a local one needs command and args.
Stuck? Get a nudge
  2. Use ${GITHUB_TOKEN} environment variable expansion for authentication credentials
Why: Committing credentials directly in .mcp.json is a security risk the exam penalises. The ${VARIABLE_NAME} syntax lets the configuration file reference environment variables without containing the actual values, keeping secrets out of repository history.
You should see: The headers section of your server configuration contains ${GITHUB_TOKEN} (not an actual token value). Running git diff confirms no secrets are staged for commit. Each developer sets their own token locally.
Stuck? Get a nudge
  3. Add a personal or experimental MCP server to ~/.claude.json for user-level configuration
Why: User-level configuration in ~/.claude.json is personal, not version-controlled, and not shared with teammates. The exam tests whether you know the scoping hierarchy: .mcp.json for team servers, ~/.claude.json for personal or experimental servers.
You should see: A ~/.claude.json file with an mcpServers entry for a personal server (e.g. an experimental integration you are testing). This file is NOT in your project repository and NOT in version control.
Stuck? Get a nudge
  4. Expose a content catalogue (e.g. a documentation hierarchy or database schema) as an MCP resource
Why: MCP resources give agents visibility into available data without requiring exploratory tool calls. Without resources, an agent might call list_tables then describe_table for every table, wasting multiple tool calls. A schema resource makes that information available immediately.
You should see: An MCP resource definition that exposes structured data (e.g. a list of database tables with column types, or a documentation table of contents) accessible at a URI like db://schema/main. The resource should have a name, description, and mimeType.
Stuck? Get a nudge
  5. Enhance the tool descriptions for your configured MCP server to explain capabilities and outputs in detail, preventing the agent from preferring built-in tools
Why: When an MCP tool has a sparse description, the agent prefers built-in tools like Grep because their descriptions are richer and more detailed. The exam tests whether you know that enhanced MCP descriptions are required to compete with built-in tools for selection priority.
You should see: Tool descriptions that are 3-5 sentences long, explaining what the tool does, what it returns, when to use it, and how it compares to built-in alternatives. For example, a search_codebase tool description that explicitly states it is more accurate than Grep for semantic searches.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 2, Task Statement 2.4](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [MCP Server Configuration — Claude Code Documentation](https://code.claude.com/docs/en/mcp) — Anthropic
  * [Model Context Protocol — Resources](https://modelcontextprotocol.io/docs/concepts/resources) — Model Context Protocol


---


Domain 2Task 2.5
# Built-in Tools
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Claude Code provides six built-in tools for working with codebases: Read, Write, Edit, Bash, Grep, and Glob. Each has a specific purpose, and using the wrong tool for a task wastes time, context tokens, or both. The exam deliberately presents scenarios where confusing these tools leads to incorrect answers.
### Grep vs Glob: The Core Distinction
This is the distinction that matters most in this task statement. Get it wrong and you'll lose marks.
**Grep searches file CONTENTS for patterns.** Use Grep when you need to find text inside files. Function callers. Error messages. Import statements. Variable assignments. Any time you are searching for what files contain, Grep is the tool.
Copy
```
// Find all files that call processLegacyOrder()
Grep: "processLegacyOrder"

// Find all error messages containing "timeout"
Grep: "timeout"

// Find all files that import a specific module
Grep: "import.*from 'utils/auth'"

```

**Glob matches file PATHS by naming patterns.** Use Glob when you need to find files by name, extension, or directory structure. Test files. Configuration files. All TypeScript files in a specific directory. Any time you are searching for files based on their path, Glob is the tool.
Copy
```
// Find all test files
Glob: "**/*.test.tsx"

// Find all configuration files
Glob: "**/config.*"

// Find all MDX files in the domains directory
Glob: "content/domains/**/*.mdx"

```

**The distinction in one sentence:** Grep finds what is INSIDE files. Glob finds files by their NAMES.
The exam presents scenarios where a developer uses the wrong tool. Use Glob to find function callers and it fails — Glob matches paths, not contents. Use Grep to find test files by naming pattern and it works technically (by searching for "test" in filenames via content), but it's the wrong tool, and the exam expects you to identify the correct one.
### Read, Write, and Edit
These three tools handle file operations, each optimised for a different use case.
**Edit** performs targeted modifications using unique text matching. You specify the exact text to find and its replacement. It's fast and precise because it touches only the specific text you identify.
Copy
```
Edit:
  old_string: "function processOrder(id: string)"
  new_string: "function processOrder(id: string, validate: boolean = true)"

```

**When Edit fails:** Edit requires unique text matching. If the text you specify appears in multiple places in the file, Edit can't tell which occurrence you mean, so it fails. That's a safety mechanism, not a bug — it stops you changing text you never meant to touch.
**When Edit can't find a unique anchor: the exam's answer.** The exam guide names one fallback, Read + Write. Read the full file, then Write the complete modified version back. It works every time, because you're no longer asking Edit to guess. It also spends a file's worth of tokens on what was usually a one-line change, which is why it's the fallback and not the default.
**When Edit can't find a unique anchor: current Claude Code.** The [Edit tool docs](https://code.claude.com/docs/en/tools-reference#edit-tool-behavior) now give you a cheaper move first: **widen`old_string` with more surrounding context until it pins down one location**, or set `replace_all: true` if you actually want every occurrence updated. Both keep you on Edit and cost almost no extra context. In real work, do that before you reach for Read + Write.
The ordering in real work:
  1. Try Edit with the shortest anchor that's plausibly unique.
  2. On a non-unique match, **widen`old_string`** until it matches one location, or use `replace_all: true` if you want every occurrence changed.
  3. Fall back to Read + Write when neither of those can disambiguate the target.


The ordering on the exam has two steps: Edit first, Read + Write when Edit fails. Both orderings agree on the first step. Don't default to Read + Write for every modification. The exam penalises that because it burns context tokens.
Current state
Exam guide v1.0 frames Read + Write as **the** documented fallback when Edit cannot find unique anchor text ("Using Read to load full file contents followed by Write when Edit cannot find unique anchor text"). As of 14 August 2026 the [Edit tool reference](https://code.claude.com/docs/en/tools-reference#edit-tool-behavior) documents widening `old_string` or setting `replace_all: true` as the behaviour on a non-unique match. **On the exam, answer Read + Write.** In real work, widen the anchor first — it is cheaper and the practice above still holds.
### Incremental Codebase Understanding
How you explore a codebase matters as much as which tools you use. There's a right way and a wrong way.
**Wrong: Read all files upfront.** Loading every file into context before you know what you need is a context-budget killer. A 200-file codebase read in full swallows your entire context window, mostly on files that have nothing to do with your task. No other exploration mistake costs you more.
**Right: Incremental discovery.** Start narrow. Expand only as needed.
  1. **Grep to find entry points.** Search for the function name, class name, or error message that anchors your investigation. This tells you which files are relevant.
  2. **Read to follow imports and trace flows.** Once you know which files matter, Read them to understand the code structure. Follow import statements to discover related files.
  3. **Grep again to trace usage.** The files you read in step 2 may expose the function under another name: a wrapper (`submitOrder()` that calls `processOrder()` inside it) or a barrel file that re-exports it (`export { processOrder as submitOrder }`). Callers of the new name never mention the original, so your first Grep never saw them. Grep for each new name, across the whole codebase, to get the full list of consumers. The next section works through an example.
  4. **Read only what you need.** Each file you read should be justified by what you discovered in the previous step.


That's minimal context for maximum understanding. You map the codebase progressively, spending tokens only on files that matter to the task.
### Tracing Function Usage Across Wrapper Modules
A common codebase pattern: a function is defined in one module, re-exported through a wrapper, and consumed through the wrapper's name. A simple Grep for the original name misses every consumer who imports through the wrapper.
The correct approach:
  1. **Grep for the function definition** to find where it is defined
  2. **Read the defining file** to identify exported names
  3. **Grep for each exported name** across the codebase to find all consumers
  4. If the function is re-exported through a barrel file (e.g. `index.ts`), **Grep for the barrel file's module name** to find consumers who import from it


Concretely: `processOrder` is defined in `orders.ts`. The barrel `utils/index.ts` re-exports it as `submitOrder`, and three of its five consumers import `submitOrder` from `utils`. A Grep for `processOrder` finds the definition, the barrel line and the two consumers that import the original name. It cannot find the other three, because the string `processOrder` never appears in their files. Read the barrel, spot the rename, Grep for `submitOrder`, and the three turn up.
The multi-step trace catches indirect consumers a single Grep would miss.
### The Deprecation Scenario
This one turns up constantly in exam prep: find every file that calls a deprecated function AND the test files that exercise it. The correct sequence:
  1. **Grep for the function name** — finds every file whose contents reference the function, including any tests that import it directly (content search)
  2. **Glob for sibling test files** — finds the test file that pairs with each caller by naming convention, e.g. `OrderProcessor.ts` → `OrderProcessor.test.tsx`, even when the test exercises the function indirectly through the source module (path matching)
  3. **Grep again for wrapper names** — when a caller exposes the function through a wrapper (e.g. `applyLegacyOrder` calls `processLegacyOrder` internally), Grep for the wrapper name to find tests that cover the function transitively through it


Say Grep reveals that `OrderProcessor.ts` and `RefundHandler.ts` call the deprecated function. Glob for `**/OrderProcessor.test.*` and `**/RefundHandler.test.*` to pull in their sibling test files, even if those tests never mention `processLegacyOrder` by name. And if either source file wraps the function under a new name, Grep for the wrapper to catch any remaining tests.
This is Grep, then Glob, then Grep again — content search for direct references, path matching for adjacent tests, content search for indirect coverage. Not Glob first.
Key Concept
Grep searches file contents. Glob matches file paths. Edit is the default for modifications. On a non-unique match the exam's answer is Read + Write. Current Claude Code widens the anchor or uses `replace_all: true` first, and that is the better move in real work. Build codebase understanding incrementally. Never read all files upfront.
## Exam Traps
Exam Trap
Using Glob to find function callers (it searches paths, not contents)
Glob matches file paths by naming pattern. It cannot search inside files for function calls. Use Grep to search file contents for function names, import statements, or error messages.
Exam Trap
Using Grep to find files by extension or naming pattern
While Grep could technically find filenames mentioned in content, Glob is the purpose-built tool for matching file paths. Use Glob for **/*.test.tsx, **/config.*, and similar path-based searches.
Exam Trap
Reading all source files upfront before understanding what is relevant
Loading every file into context is a context-budget killer. The correct approach is incremental: Grep to find entry points, then Read to trace flows from those specific entry points.
Exam Trap
Defaulting to Read + Write for every file modification instead of trying Edit first
Edit is faster and uses less context because it only touches the specific text. Read + Write loads the entire file. Try Edit first. Read + Write is the fallback for when Edit cannot find a unique anchor, not the standard response.
Exam Trap
Answering 'widen old_string or set replace_all' when a question asks what to do after Edit reports a non-unique match
That is what current Claude Code does, and it is the cheaper move in real work. The exam guide names Read + Write as the fallback when Edit cannot find unique anchor text, and every keyed answer follows the guide. Read the full file, then Write the complete modified version.
## Practice Scenario
A developer needs to find all files that call a deprecated function processLegacyOrder() and also find all test files for those callers. Which tool sequence is correct?
Option ABash with find and xargs grep for both steps, since a single shell pipeline can locate the callers and their test files in one pass without switching between built-in tools.
Option BGlob for **/*processLegacyOrder* to find caller files, then Grep inside that result set for test files. Glob resolves the file list first, so the content search runs over fewer files and stays inside the context budget.
Option CGrep for processLegacyOrder to find callers (this also surfaces tests that import the function directly), then Glob for the sibling test file of each caller (e.g. **/OrderProcessor.test.*) to catch tests that exercise the function through the source module without naming it.
Option DRead all the source files to search for the function manually, then Read all the test files to pair them with their callers. Reading every file gives complete visibility of each call site and test, so no caller can be missed by a naming mismatch, and the full contents remain available in context for the later refactoring steps.
Check Answer
## Build Exercise
Build Exercise
#### Trace and Refactor a Deprecated Function Using Built-in Tools
Difficulty
30 minutes
What you'll learn
  * Apply Grep for content search and Glob for path matching in the correct sequence
  * Use incremental codebase discovery instead of reading all files upfront
  * Select Edit as the primary modification tool and widen the anchor (or use replace_all) when Edit reports a non-unique match
  * Trace function usage across wrapper modules and barrel files
  * Follow the Grep-then-Glob pattern for finding callers and their test files


  1. Use Grep to search for all callers of a target function (e.g. processLegacyOrder) across the codebase
Why: Grep searches file contents — it is the correct tool for finding function callers. Using Glob here would fail because Glob matches file paths, not contents. The exam tests this distinction directly and penalises candidates who confuse the two.
You should see: A list of file paths containing calls to processLegacyOrder, with line numbers and matching lines showing the exact call sites. For example: src/OrderProcessor.ts:42: await processLegacyOrder(orderId).
Stuck? Get a nudge
  2. Use Glob to find test files matching the caller filenames (e.g. **/*.test.tsx)
Why: Glob matches file paths by naming pattern — it is the correct tool for finding test files by extension or naming convention. This completes the Grep-then-Glob pattern: content search to find callers, then path matching to find their tests.
You should see: A list of test file paths matching the pattern, such as src/OrderProcessor.test.tsx and src/RefundHandler.test.tsx. These correspond to the caller files found by Grep in the previous step.
Stuck? Get a nudge
  3. Use Read to examine each caller file and understand the usage pattern and context
Why: Reading files incrementally — only after Grep identifies which files matter — is the correct approach. Reading all source files upfront is a context-budget killer that the exam explicitly penalises. Each Read should be justified by what you discovered in the previous step.
You should see: The full contents of each caller file, showing how processLegacyOrder is called, what parameters are passed, how the return value is used, and whether the function is imported directly or through a wrapper module.
Stuck? Get a nudge
  4. Use Edit to replace the deprecated function call with the new API in each caller file
Why: Edit is the preferred modification tool because it targets specific text and uses less context than Read + Write. The exam penalises defaulting to Read + Write for every modification. Always try Edit first — it is faster and more precise.
You should see: Each caller file updated with the new API call replacing the deprecated one. For example, processLegacyOrder(orderId) replaced with processOrder(orderId, { validate: true }). The Edit tool confirms the replacement was made successfully.
Stuck? Get a nudge
  5. When Edit fails with a non-unique match, widen old_string with more surrounding lines until it pins down one location (or set replace_all: true if you actually want every occurrence updated). Only fall back to Read + Write if neither option can disambiguate the target
Why: Edit fails when the target text appears multiple times in the file — this is a safety mechanism, not a bug. Per the Edit tool documentation, the documented recovery is to expand the anchor with more surrounding context until it matches one place, or to use replace_all for global replacements. Both keep you on Edit and cost almost nothing in context. Read + Write loads the entire file for what is usually a single-line change — keep it as a last resort. That is the practice answer. On the exam, the guide names Read + Write as the fallback, so answer that.
You should see: On the first try, Edit fails with an error like: old_string matches 3 locations. On the retry with a wider old_string that includes the surrounding function name or unique adjacent line, Edit succeeds and changes exactly one occurrence. If replace_all: true was the right call, every occurrence is updated atomically.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 2, Task Statement 2.5](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Claude Code Documentation — Built-in Tools](https://code.claude.com/docs/en/tools) — Anthropic
  * [Building with Claude API — Anthropic](https://platform.claude.com/docs/en/build-with-claude) — Anthropic