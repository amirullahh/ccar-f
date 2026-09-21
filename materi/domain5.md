Domain 515%
# Context Management & Reliability
Manage context windows effectively, implement caching strategies, handle long conversations, and build reliable production systems.
## Task Statements
[ 5.1Context Window Management ](https://claudecertificationguide.com/learn/5-context-management/5-1-context-window-management)[ 5.2Escalation & Ambiguity Resolution ](https://claudecertificationguide.com/learn/5-context-management/5-2-escalation-ambiguity)[ 5.3Error Propagation in Multi-Agent Systems ](https://claudecertificationguide.com/learn/5-context-management/5-3-error-propagation)[ 5.4Codebase Exploration & Context Degradation ](https://claudecertificationguide.com/learn/5-context-management/5-4-codebase-exploration)[ 5.5Human Review & Confidence Calibration ](https://claudecertificationguide.com/learn/5-context-management/5-5-human-review-calibration)[ 5.6Information Provenance & Multi-Source Synthesis ](https://claudecertificationguide.com/learn/5-context-management/5-6-information-provenance)


---


Domain 5Task 5.1
# Context Window Management
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Context window management is the foundation of reliable Claude-based systems. Every multi-turn conversation, every multi-agent pipeline, every long-document extraction task depends on what you let into the context window. Get it wrong and the failures are concrete: your support agent forgets refund amounts, your research pipeline drops citations, your extraction system loses precision on the fields that matter most.
### The Progressive Summarisation Trap
When conversations grow long, a common strategy is to summarise earlier turns to free up token budget. This is a trap. Progressive summarisation systematically destroys the most critical information in customer-facing and data-processing systems: numerical values, dates, percentages, and customer-stated expectations.
Here is how it plays out. A customer contacts support about a refund:
Copy
```
Turn 3: "I'd like a refund of $247.83 for order #8891 placed on March 3rd"

```

After summarisation, this becomes:
Copy
```
Summary: "Customer wants a refund for a recent order"

```

The amount, order number, and date — the three facts the agent needs to process the refund — are gone. And that is not a fringe case. It is what summarisation does to transactional data by default.
**The fix: persistent case facts blocks.** Extract transactional facts (amounts, dates, order numbers, statuses) into a structured block that is included in every prompt, outside the summarised history. This block is never summarised. It persists across every turn regardless of what happens to the conversation history.
jsonCopy

```
{
  "caseFactsBlock": {
    "customerId": "C-4421",
    "issues": [
      {
        "orderId": "#8891",
        "orderDate": "2024-03-03",
        "refundAmount": "$247.83",
        "status": "pending_refund",
        "itemDescription": "Wireless headphones — defective"
      }
    ]
  }
}

```

For multi-issue sessions where a customer raises several problems in one conversation, extract and persist structured issue data into a separate context layer. Each issue gets its own entry with order IDs, amounts, and statuses. This prevents cross-contamination between issues during summarisation.
### The "Lost in the Middle" Effect
Models process information at the beginning and end of long inputs reliably. Findings buried in the middle of a long context may be missed or given less weight. This is a well-documented phenomenon in large language models and it directly affects how you structure aggregated inputs.
**The fix is structural, not prompt-based.** Place key findings summaries at the beginning of aggregated inputs. Organise detailed results with explicit section headers throughout. If you are feeding a synthesis agent the output of three research subagents, start with a "Key Findings Summary" section, then provide the detailed outputs with clear section boundaries.
Copy
```
## Key Findings Summary
- Source A: 12% market growth in renewable sector (2023)
- Source B: Patent filings increased 34% year-on-year
- Source C: Regulatory framework delayed until Q3 2025

## Detailed Findings

### Source A: Market Analysis Report
[Full details here...]

### Source B: Patent Database Analysis
[Full details here...]

### Source C: Regulatory Review
[Full details here...]

```

### Tool Result Trimming
Tool results are a silent context budget killer. An order lookup might return 40+ fields: internal audit timestamps, warehouse codes, shipping carrier IDs, fulfilment centre identifiers, and dozens of other fields irrelevant to the customer's refund request. You need 5 fields. Those other 35 fields consume tokens in every subsequent turn as the conversation history grows.
**Trim verbose tool outputs to only relevant fields before they accumulate in context.** Skip it and multi-turn systems slowly drown in stale tool output. It is not a nice-to-have.
pythonCopy

```
def trim_order_result(raw_result, relevant_fields=None):
    if relevant_fields is None:
        relevant_fields = [
            "order_id", "order_date", "total_amount",
            "return_eligible", "item_description"
        ]
    return {k: v for k, v in raw_result.items() if k in relevant_fields}

```

This trimming should happen in a `PostToolUse` hook or in the tool implementation itself, before the result enters the conversation history. Once verbose data is in the context, it stays there for every subsequent turn.
### Full Conversation History
The Claude API is stateless. Each request must include the complete conversation history. Omit earlier messages and the model loses conversational coherence. There's no session state on the server side, so every turn has to carry everything the model needs to follow the conversation.
This creates a tension with context limits: you need the full history for coherence, but the history grows with every turn. The persistent case facts block resolves this by separating critical facts from summarisable narrative, letting you summarise the conversation flow while preserving every transactional detail.
### Upstream Agent Optimisation
In multi-agent systems, upstream agents often return verbose reasoning chains and raw content that downstream agents do not need. When a research subagent sends its full thought process to a synthesis agent with a limited context budget, the synthesis agent wastes tokens on reasoning it cannot use.
**Modify upstream agents to return structured data** — key facts, citations, relevance scores — instead of verbose content and reasoning chains. Require subagents to include metadata (dates, source locations, methodological context) in structured outputs to support accurate downstream synthesis.
jsonCopy

```
{
  "findings": [
    {
      "claim": "Renewable energy investment grew 12% in 2023",
      "source": "IEA World Energy Report 2024",
      "sourceUrl": "https://example.com/report",
      "relevanceScore": 0.92,
      "publicationDate": "2024-01-15"
    }
  ]
}

```

Tokens aren't the only win here. Structured outputs from upstream agents let downstream agents process findings without re-parsing verbose prose.
Key Concept
The persistent case facts block is the single most important pattern in context window management. Extract transactional facts (amounts, dates, order numbers) into a structured block that is included in every prompt and never summarised. This is the fix for progressive summarisation and the foundation for reliable multi-turn systems.
### Prompt Caching
Prompt caching is the other half of context economics. Instead of trimming what the model sees, you avoid paying to reprocess the parts that don't change. Mark a stable prefix with a `cache_control` breakpoint and the API stores that processed prefix, then reuses it on the next request, charging a fraction of the input cost for the cached tokens.
Caching matches from the start of the prompt, prefix by prefix, so layout decides whether you get a hit. Put the content that stays constant first: system instructions, tool definitions, long reference documents. Place the `cache_control` breakpoint at the end of that static block. Put the volatile content, the user's latest message and anything that changes per request, after the breakpoint.
The static block belongs in the top-level `system` parameter, not in `messages`. There is no `"system"` role for input messages in the Messages API — `messages` takes `"user"` and `"assistant"` turns only.
pythonCopy

```
response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=4096,
    system=[
        {"type": "text", "text": LONG_STATIC_INSTRUCTIONS},
        {"type": "text", "text": REFERENCE_DOC,
         "cache_control": {"type": "ephemeral"}},
    ],
    messages=[
        {"role": "user", "content": dynamic_user_message},
    ],
)

```

Get the order wrong and you lose the benefit entirely. If dynamic content sits before the static block, the prefix changes on every request, nothing matches, and every call pays full price. An `ephemeral` breakpoint lasts about five minutes since last use; a `{"type": "ephemeral", "ttl": "1h"}` breakpoint lasts an hour at a higher write cost. A request may carry at most four breakpoints.
Scope
The guide's out-of-scope list excludes "prompt caching implementation details (beyond knowing it exists)", so nothing beyond the existence and purpose of caching is tested. The mechanics above are here for real work, not for the exam.
## Exam Traps
Exam Trap
Thinking progressive summarisation is safe for transactional data
Summarisation systematically destroys numerical values, dates, and specific identifiers. A persistent case facts block must hold these outside summarised history.
Exam Trap
Assuming the 'lost in the middle' effect is solved by telling the model to pay attention to everything
The fix is structural: place key findings at the beginning of inputs and use explicit section headers. Prompt-based reminders are unreliable for position effects.
Exam Trap
Keeping full tool results in context because 'the model might need them later'
Untrimmed tool results from 40+ field lookups exhaust the token budget across turns. Trim to relevant fields before results enter the conversation history.
Exam Trap
Believing conversation history can be selectively truncated without consequences
The API is stateless. Each request needs complete conversation history. Selective truncation breaks conversational coherence. Use case facts blocks and summarisation instead of truncation.
## Practice Scenario
A customer support agent handles a multi-issue session. After several turns, the agent refers to 'your recent refund request' instead of the specific $247.83 refund for order #8891. The conversation history is being summarised between turns to manage context length. What is the most effective fix?
Option AInstruct the model to preserve all numerical values verbatim whenever it summarises the conversation history
Option BExtract transactional facts (amounts, dates, order numbers) into a persistent case facts block included in every prompt, outside summarised history
Option CStore the full conversation history in an external database and retrieve the relevant turns on demand whenever the agent needs to recall an earlier detail
Option DIncrease the context window size so the full conversation history fits and summarisation never needs to run
Check Answer
## Build Exercise
Build Exercise
#### Build a Persistent Case Facts Context Manager
Difficulty
45 minutes
What you'll learn
  * Implement the persistent case facts block pattern to protect transactional data from summarisation
  * Trim verbose tool results to relevant fields before they accumulate in context
  * Recognise and mitigate the progressive summarisation trap for numerical values, dates, and identifiers
  * Apply the lost-in-the-middle mitigation by placing key findings at the beginning of aggregated inputs
  * Understand that the Claude API is stateless and each request must include complete conversation history


  1. Create a case facts extractor that identifies transactional data (amounts, dates, order numbers, statuses) from tool results
Why: The persistent case facts block is the single most important pattern in context window management. Extracting transactional facts into a structured block that is never summarised prevents the progressive summarisation trap from destroying critical numerical values and identifiers.
You should see: A function that takes raw tool output and returns a structured object containing only the transactional facts: customer ID, order numbers, amounts, dates, and statuses. Non-transactional narrative content should be excluded.
Stuck? Get a nudge
  2. Implement a persistent case facts block that is prepended to every prompt, outside summarised history
Why: The case facts block must persist across every turn regardless of what happens to the conversation history. It sits outside the summarised portion of the context, ensuring amounts, dates, and order numbers survive even when earlier conversation turns are compressed.
You should see: A prompt construction function that always includes the case facts block at the top of every message, followed by any summarised history, followed by the current turn. The case facts block should be clearly delimited with a section header.
Stuck? Get a nudge
  3. Build a tool result trimmer that filters order lookup responses from 40+ fields to only the 5 relevant return-related fields
Why: Untrimmed tool results are a silent context budget killer. An order lookup returning 40+ fields consumes tokens in every subsequent turn as conversation history grows. Trimming to relevant fields before results enter context is essential, not optional.
You should see: A trimming function that takes a raw tool result object and returns only the fields needed for the current task. The trimmed result should be 80-90% smaller than the original.
Stuck? Get a nudge
  4. Test with a multi-turn conversation where summarisation occurs and verify that transactional facts survive intact across all turns
Why: This validates that the persistent case facts pattern actually works. The exam tests whether you understand that progressive summarisation destroys specific amounts and dates, and the case facts block is the fix. You need to verify this empirically.
You should see: A 6-8 turn conversation where summarisation occurs after turn 4. After summarisation, the agent should still reference the exact refund amount ($247.83), order number (#8891), and date (March 3rd) from the case facts block. Without the block, these values would be lost to summarisation.
Stuck? Get a nudge
  5. Add key findings placement logic that positions summaries at the beginning of aggregated inputs to mitigate the lost-in-the-middle effect
Why: Models process information at the beginning and end of long inputs reliably, but findings buried in the middle may be missed. Placing key findings summaries at the start of aggregated inputs is a structural fix for this well-documented phenomenon.
You should see: An aggregation function that places a Key Findings Summary section at the top of combined inputs, followed by detailed results with explicit section headers. The key findings should be concise bullet points drawn from the detailed content.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.1](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic API Documentation — Messages](https://platform.claude.com/docs/en/api/messages) — Anthropic
  * [Anthropic Prompt Engineering — Long Context Tips](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) — Anthropic


---


Domain 5Task 5.2
# Escalation & Ambiguity Resolution
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Escalation calibration is a make-or-break capability for customer support agents. Miscalibrated escalation directly destroys first-contact resolution rates. The exam tests your understanding of when to escalate, when to resolve autonomously, and which commonly proposed escalation triggers are unreliable.
### The Three Valid Escalation Triggers
There are exactly three valid reasons for a support agent to escalate to a human:
**1. Customer explicitly requests a human.** When a customer says "I want to speak to a person" or "Transfer me to a human agent," honour this immediately. Do NOT attempt to resolve the issue first. Do not say "Let me see if I can help you with that first." The customer has made a clear request and the agent must respect it without delay.
This is an absolute rule with no exceptions. The moment the customer explicitly asks for a human, the escalation happens.
**2. Policy exceptions or gaps.** The request falls outside documented policy. For example, a customer asks for competitor price matching when the policy only covers own-site price adjustments. The agent cannot make policy on the fly — this requires human judgement about whether to make an exception.
Policy gaps are distinct from policy violations. A violation (e.g., requesting a refund outside the return window) has a documented answer ("no"). A gap means the policy is silent on the specific situation. Gaps require escalation; violations do not.
**3. Inability to make meaningful progress.** The agent has attempted resolution and cannot advance. Perhaps the tools returned errors that local retry logic cannot resolve, the customer's situation requires system access the agent does not have, or the issue involves a technical bug that needs engineering intervention.
This is the catch-all, but only after a genuine attempt. "I might not be able to handle this" isn't sufficient — the agent has to show it tried and failed.
### The Two Unreliable Triggers
The exam specifically tests whether you can identify these as anti-patterns:
**Sentiment-based escalation.** Using frustration detection or negative sentiment scores to trigger escalation is unreliable because frustration does not correlate with case complexity. A customer furious about a simple late delivery is easy to resolve (apologise, offer compensation, reship). A calm, polite customer asking about competitor price matching requires human judgement on a policy gap. Sentiment measures emotional state, not case difficulty.
**Self-reported confidence scores.** Having the model output a confidence score (1-10) and escalating when it falls below a threshold is unreliable because LLM self-reported confidence is poorly calibrated. The model is often incorrectly confident on hard cases (it does not know what it does not know) and unnecessarily uncertain on straightforward cases (it hedges when the answer is clear). This is the exact failure mode described in the exam scenario: the agent escalates simple cases while attempting complex ones.
### The Frustration Nuance
The exam tests a specific nuance about customer frustration:
  * **If the issue is straightforward and the customer is frustrated:** Acknowledge the frustration, offer the resolution. "I understand this is frustrating. I can process your replacement right now." Do not escalate.
  * **If the customer reiterates their preference for a human after you offer help:** Now escalate. They have been given an opportunity to accept agent resolution and declined.
  * **If the customer explicitly says "I want a human" from the start:** Escalate immediately. No investigation, no offer to help first.


The distinction is between "frustrated customer with a resolvable issue" (resolve it) and "customer who explicitly wants a human" (escalate immediately). Two situations, two responses.
### Ambiguous Customer Matching
When a tool returns multiple customer matches for a search query (say a name search turns up three "John Smith" records), the agent must ask for additional identifiers: email address, phone number, order number, or other disambiguating information.
The agent must NOT:
  * Select the most recent customer record
  * Select the most active customer record
  * Select based on any heuristic


Selecting the wrong customer can lead to privacy violations (exposing one customer's data to another) or incorrect actions (processing a refund on the wrong account). The only safe response to ambiguous matches is to ask for clarification.
### Explicit Escalation Criteria in System Prompts
The most effective way to calibrate escalation is to add explicit escalation criteria with few-shot examples to the system prompt. These examples should demonstrate:
  * When to escalate (explicit human request, policy gap, inability to progress)
  * When to resolve autonomously (straightforward case, frustrated but resolvable)
  * The exact format of escalation (structured handoff with customer ID, root cause, recommended action)


This is the proportionate first response before adding infrastructure like classifier models or sentiment analysis. Prompt optimisation should always precede architectural changes.
Key Concept
Three valid escalation triggers: explicit human request (honour immediately), policy gaps (not just violations), and inability to progress. Two unreliable triggers: sentiment-based escalation and self-reported confidence scores. Sentiment does not correlate with complexity; confidence scores are poorly calibrated.
## Exam Traps
Exam Trap
Sentiment-based escalation seems reasonable but is fundamentally unreliable
Frustration does not correlate with case complexity. A furious customer with a simple late delivery is easy to resolve. A calm customer with a policy gap needs escalation.
Exam Trap
Self-reported confidence scores provide a reliable escalation signal
LLM self-confidence is poorly calibrated — the model is often incorrectly confident on hard cases and uncertain on easy ones. This is exactly the failure mode the exam tests.
Exam Trap
Attempting to resolve before honouring an explicit human request
When a customer says 'I want a human', escalate immediately. No investigation, no 'let me try first.' This is an absolute rule.
Exam Trap
Selecting from ambiguous customer matches using the most recent or most active record
Heuristic selection risks privacy violations and incorrect actions. The only safe response is to ask for additional identifiers to disambiguate.
## Practice Scenario
A customer support agent achieves only 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward damage replacement cases while attempting to autonomously handle complex policy exception requests. What is the most effective improvement?
Option AAdd explicit escalation criteria to the system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously
Option BDeploy a separate classifier model trained on historical tickets to predict which requests need escalation
Option CImplement sentiment analysis to detect customer frustration and automatically escalate when negative sentiment exceeds a threshold
Option DHave the agent self-report a confidence score (1-10) and automatically route to humans when confidence falls below a threshold
Check Answer
## Build Exercise
Build Exercise
#### Build an Escalation Decision Engine
Difficulty
40 minutes
What you'll learn
  * Implement the three valid escalation triggers: explicit human request, policy exceptions/gaps, and inability to progress
  * Identify and avoid the two unreliable triggers: sentiment-based escalation and self-reported confidence scores
  * Handle the frustration nuance: frustrated customer with resolvable issue vs explicit human request
  * Design ambiguous customer matching that requests additional identifiers rather than selecting heuristically
  * Add explicit escalation criteria with few-shot examples to system prompts as the proportionate first response


  1. Create a system prompt with explicit escalation criteria covering all three valid triggers: explicit human request, policy exceptions/gaps, and inability to make progress
Why: Explicit escalation criteria in the system prompt are the proportionate first response before adding infrastructure like classifier models or sentiment analysis. The exam tests that prompt optimisation should always precede architectural changes for escalation calibration.
You should see: A system prompt with three clearly defined escalation triggers, each with a description and decision rule. The prompt should also explicitly list the two anti-patterns (sentiment-based and confidence-based escalation) as things to avoid.
Stuck? Get a nudge
  2. Add few-shot examples showing: immediate escalation for explicit human request, autonomous resolution for a frustrated customer with a straightforward issue, and escalation for a policy gap
Why: Few-shot examples demonstrating when to escalate versus when to resolve autonomously directly address unclear decision boundaries. This is the exact technique the exam identifies as the correct improvement for a support agent with poor first-contact resolution rates.
You should see: Three examples in the system prompt, each showing a different scenario with the correct decision and reasoning. The frustrated-but-resolvable example should show the agent acknowledging frustration and offering the resolution directly.
Stuck? Get a nudge
  3. Implement ambiguous customer matching logic that requests additional identifiers (email, phone, order number) instead of selecting heuristically
Why: Selecting from ambiguous matches using heuristics (most recent, most active) risks privacy violations and incorrect actions. The exam tests that the only safe response to multiple customer matches is to ask for additional identifiers to disambiguate.
You should see: A matching function that detects when multiple records are returned and immediately asks for disambiguation rather than applying any selection heuristic. The disambiguation request should suggest specific identifier types.
Stuck? Get a nudge
  4. Test with four scenarios: frustrated customer with simple issue, calm customer requesting policy exception, customer explicitly requesting a human, and ambiguous customer match
Why: These four scenarios cover all critical decision boundaries the exam tests: the frustration nuance, policy gap versus violation distinction, absolute rule for explicit human requests, and privacy-safe disambiguation.
You should see: Correct handling of all four scenarios: resolution offered for the frustrated customer, escalation for the policy gap, immediate escalation for the explicit human request (no investigation first), and disambiguation request for the ambiguous match.
Stuck? Get a nudge
  5. Verify the agent never attempts investigation before honouring an explicit human request and never selects from ambiguous matches using heuristics
Why: These are the two absolute rules the exam tests with no exceptions. Any attempt to investigate before escalating on an explicit human request, or any heuristic selection from ambiguous matches, is a critical failure that would cost marks on the exam.
You should see: For explicit human requests: the escalation happens in the very first response with zero investigation steps. For ambiguous matches: the response always asks for additional identifiers, never selects a record. Both rules should hold across multiple phrasings and edge cases.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.2](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic Agent SDK Documentation — Human-in-the-loop](https://code.claude.com/docs/en/agent-sdk/user-input) — Anthropic
  * [Anthropic Customer Support Best Practices](https://platform.claude.com/docs/en/docs/about-claude/use-case-guides/customer-support-chat) — Anthropic


---


Domain 5Task 5.3
# Error Propagation in Multi-Agent Systems
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Error propagation determines whether a multi-agent system recovers gracefully or fails silently. When a subagent encounters a failure — a timeout, a permission error, an invalid query — how that failure information flows back to the coordinator dictates the system's reliability. The exam tests your understanding of structured error context, the two critical anti-patterns, and the distinction that most developers get wrong: access failures versus valid empty results.
### Structured Error Context
When a subagent fails, it must return structured error context that enables the coordinator to make intelligent recovery decisions. This context must include four elements:
**1. Failure type.** Categorise the failure: transient (timeout, rate limit — may succeed on retry), validation (bad input — fix the query), business (rule violation — escalate or find alternative), or permission (access denied — cannot be retried without authorisation changes).
**2. What was attempted.** The specific query, parameters used, and target system. "Searched academic database for 'renewable energy policy' with date range 2022-2024" is actionable. "Search failed" is not.
**3. Partial results gathered before failure.** If the subagent retrieved three of five sources before timing out, those three results are valuable. Discarding them because the overall operation failed is wasteful.
**4. Potential alternative approaches.** The subagent knows its domain. If an academic database is down, it might suggest trying a different database, broadening the search terms, or checking cached results. These suggestions help the coordinator decide on recovery strategy.
jsonCopy

```
{
  "status": "partial_failure",
  "failureType": "transient",
  "attemptedAction": {
    "tool": "search_academic_db",
    "query": "renewable energy policy",
    "dateRange": "2022-2024"
  },
  "partialResults": [
    {
      "title": "EU Renewable Energy Directive 2023",
      "source": "EUR-Lex",
      "retrieved": true
    }
  ],
  "alternativeApproaches": [
    "Retry with narrower date range (2023-2024)",
    "Search alternative database: government_publications",
    "Use cached results from previous research session"
  ]
}

```

This structure gives the coordinator everything it needs to decide: retry the same query, try an alternative, proceed with partial results, or escalate.
### The Two Anti-Patterns
The exam tests these explicitly. Both are catastrophic in different ways:
**Silent suppression: returning empty results marked as success.** This is the worst anti-pattern. The subagent encounters a timeout but returns `{ "results": [], "status": "success" }`. The coordinator believes the search ran and found nothing. It won't retry, won't try alternatives, and produces a synthesis that silently omits an entire research area. The final output looks complete. It is missing critical content.
Silent suppression is especially dangerous because it's invisible. The output looks correct — it just has gaps that nobody can detect. In a customer support context, it might mean the agent reports "no orders found" when the order lookup system was actually down, leading the agent to tell the customer they have no account.
**Workflow termination: killing the entire pipeline on a single failure.** One subagent times out and the entire research pipeline crashes. The other four subagents completed successfully, but their results are thrown away. This is a disproportionate response that wastes completed work and provides no recovery path.
The correct middle ground is structured error propagation: the failing subagent reports what happened, the coordinator assesses the damage, and the system continues with partial results or targeted recovery.
### Access Failure vs Valid Empty Result
This distinction is critical and the exam tests it directly:
**Access failure:** The tool could not reach the data source. A timeout, a connection error, a permission denial. The search did not execute. Consider retry with the same or modified parameters.
**Valid empty result:** The tool reached the source and executed the query. It found no matches. This IS the answer. No retry is needed because the system worked correctly — there simply are no results for this query.
Conflating these leads to two problems:
  * Treating access failures as valid empty results means you never retry when you should.
  * Treating valid empty results as access failures means you waste time retrying a query that will always return nothing.


pythonCopy

```
# Access failure — consider retry
{
    "status": "error",
    "failureType": "transient",
    "message": "Connection timeout after 30s",
    "shouldRetry": True
}

# Valid empty result — no retry needed
{
    "status": "success",
    "results": [],
    "message": "Query executed successfully. No matching records found.",
    "shouldRetry": False
}

```

### Coverage Annotations
When a synthesis agent combines findings from multiple subagents, the output should note which topic areas are well-supported and which have gaps. If one subagent failed to retrieve sources on geothermal energy, the synthesis should say:
> "Section on geothermal energy is limited due to unavailable journal access during research."
This is far better than silently omitting the topic. Coverage annotations let the consumer know what the report covers fully and where there are known limitations. Without them, a gap in the synthesis looks like the topic was not relevant rather than the source being unavailable.
### Local Recovery for Transient Failures
Subagents should implement local recovery for transient failures — retry logic, fallback sources, degraded responses — before propagating errors to the coordinator. Only propagate errors the subagent can't resolve locally. When propagating, always include what was attempted and any partial results gathered.
This reduces coordinator complexity. The coordinator doesn't need to manage retry logic for every possible transient failure across every subagent. Each subagent handles its own transient failures and escalates only the persistent ones.
Key Concept
Structured error context (failure type, attempted action, partial results, alternatives) enables intelligent coordinator recovery. The two anti-patterns are silent suppression (empty results as success) and workflow termination (killing the pipeline on one failure). Access failures need retry consideration; valid empty results do not.
## Exam Traps
Exam Trap
Catching a timeout and returning empty results marked as successful
Silent suppression prevents all recovery. The coordinator believes the search succeeded and found nothing, so it will never attempt alternatives. This is the worst anti-pattern.
Exam Trap
Terminating the entire research pipeline when one subagent times out
Workflow termination wastes partial results from other subagents that completed successfully. The coordinator should assess the failure and decide on targeted recovery.
Exam Trap
Returning a generic 'search unavailable' status after retry exhaustion
Generic errors hide the query, partial results, and alternative approaches from the coordinator. Structured error context enables informed recovery; generic statuses prevent it.
Exam Trap
Retrying a valid empty result because it looks like a failure
A valid empty result means the query executed successfully and found no matches. This IS the answer. Retrying wastes time and resources on a query that will always return nothing.
## Practice Scenario
A web search subagent in a multi-agent research system times out while researching a complex topic. You need to design how this failure information flows back to the coordinator. Which approach best enables intelligent recovery?
Option ACatch the timeout and return an empty result set marked as successful, so the rest of the workflow carries on regardless of the failure
Option BPropagate the timeout exception to a top-level handler that terminates the entire research workflow at once, discarding everything
Option CReturn structured error context including failure type, attempted query, partial results, and potential alternative approaches
Option DImplement automatic retry with exponential backoff, returning a generic search unavailable status only after all retries are exhausted
Check Answer
## Build Exercise
Build Exercise
#### Build a Structured Error Propagation System
Difficulty
50 minutes
What you'll learn
  * Design structured error context with the four required elements: failure type, attempted action, partial results, and alternative approaches
  * Distinguish access failures (timeout, connection error) from valid empty results (successful query, no matches)
  * Identify and avoid the two anti-patterns: silent suppression and workflow termination
  * Implement local retry logic for transient failures before propagating to the coordinator
  * Add coverage annotations to synthesis output for transparency about information gaps


  1. Define a structured error schema with fields: failureType (transient/validation/business/permission), attemptedAction (tool, query, parameters), partialResults (array of any retrieved data), and alternativeApproaches (suggested recovery strategies)
Why: Structured error context enables intelligent coordinator recovery. The four elements give the coordinator everything it needs to decide: retry, try an alternative, proceed with partial results, or escalate. Generic error messages like search unavailable prevent all informed recovery.
You should see: A TypeScript interface or JSON schema with failureType as an enum of the four categories, attemptedAction as an object with tool/query/parameters, partialResults as an array, and alternativeApproaches as a string array. Each field should have a description explaining its purpose.
Stuck? Get a nudge
  2. Implement a subagent that distinguishes access failures (timeout, connection error) from valid empty results (successful query, no matches) in its error reporting
Why: Conflating access failures with valid empty results is a critical error the exam tests directly. Access failures mean the query did not execute and should be retried. Valid empty results mean the query succeeded and found nothing, which IS the answer. Treating them the same leads to either never retrying when you should or wasting time retrying queries that will always return nothing.
You should see: A subagent function that catches exceptions (timeouts, connection errors) and reports them as access failures with shouldRetry: true, while successful queries returning no results are reported as success with an empty results array and shouldRetry: false.
Stuck? Get a nudge
  3. Build local retry logic for transient failures within the subagent (3 retries with exponential backoff) before propagating to the coordinator
Why: Subagents should handle their own transient failures locally before escalating. This reduces coordinator complexity as the coordinator does not need to manage retry logic for every possible transient failure across every subagent. Only persistent failures that survive local retry should propagate.
You should see: A retry wrapper with exponential backoff (e.g., 1s, 2s, 4s) that attempts the operation up to 3 times before propagating the structured error to the coordinator. Partial results gathered before failure should be preserved across retries.
Stuck? Get a nudge
  4. Create a coordinator that receives structured errors and decides between retry with modified query, alternative approach, or proceed with partial results
Why: The coordinator is the intelligent recovery decision-maker. With structured error context, it can make informed choices rather than applying blanket policies. This is the correct middle ground between silent suppression (ignoring failures) and workflow termination (killing the pipeline on one failure).
You should see: A coordinator function that examines the failure type, checks partial results, evaluates alternative approaches, and selects the appropriate recovery strategy. It should handle all four failure types differently and never silently suppress errors.
Stuck? Get a nudge
  5. Add coverage annotations to synthesis output noting which findings are well-supported versus which topic areas have gaps due to unavailable sources
Why: Coverage annotations let the consumer know what the report covers fully and where there are known limitations. Without them, a gap looks like the topic was not relevant rather than the source being unavailable. This transparency is far better than silently omitting topics.
You should see: A synthesis output that includes a coverage section listing each topic area with its data quality status: well-supported, limited (with reason), or unavailable (with reason). Failed subagent topics should be explicitly noted, not silently omitted.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.3](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic Multi-Agent Patterns](https://www.anthropic.com/engineering/built-multi-agent-research-system) — Anthropic


---


Domain 5Task 5.4
# Codebase Exploration & Context Degradation
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Large codebase exploration is one of the most context-intensive tasks a Claude-based agent performs. Whether an agent is exploring an unfamiliar repository, tracing dependency chains, or understanding legacy systems, extended sessions create a specific failure mode: context degradation. It has nothing to do with running out of tokens. The model simply loses its grip on earlier findings as the context fills with verbose discovery output.
### Context Degradation
Context degradation manifests as a specific, observable behaviour: the model starts referencing "typical patterns" instead of the specific classes, methods, and dependency chains it discovered earlier in the session. After investigating several modules, the agent might say "this follows the typical repository pattern" instead of "the `OrderRepository` class at `src/repos/order.ts` implements the base `Repository<T>` interface with custom caching in the `findById` method."
This happens because:
  1. Each exploration step generates verbose output (file contents, search results, directory listings).
  2. This output accumulates in the conversation context.
  3. Earlier, precise discoveries are pushed further into the context while more recent verbose output dominates.
  4. The model's attention shifts to recent output and it loses specific references to earlier findings.


The critical insight: context degradation is not a token limit problem. Increasing the context window doesn't fix it. The model isn't running out of space. It's losing track of specific details as they get buried under newer, more verbose output.
### Scratchpad Files
The primary mitigation for context degradation is scratchpad files. The agent writes key findings to a file and references it for subsequent questions. This persists knowledge outside the conversation context, making it immune to context degradation.
markdownCopy

```
# Exploration Scratchpad — Order Service

## Key Classes
- `OrderRepository` (src/repos/order.ts) — implements Repository<T>, custom findById caching
- `OrderService` (src/services/order.ts) — orchestrates OrderRepository + PaymentGateway
- `RefundProcessor` (src/services/refund.ts) — depends on OrderService.getOrderWithItems()

## Dependency Chain
RefundProcessor → OrderService → OrderRepository → PostgreSQL
RefundProcessor → PaymentGateway → Stripe API

## Critical Findings
- RefundProcessor has no retry logic for Stripe API failures
- OrderRepository caches by orderId but cache invalidation on status change is missing
- Test coverage: OrderService has 87% coverage, RefundProcessor has 12%

```

When the agent needs to reference earlier discoveries, it reads the scratchpad file instead of relying on conversation context. Treat this as a deliberate strategy from the outset, not a rescue move once things degrade — agents should be instructed to maintain scratchpad files from the start of any extended exploration session.
### Subagent Delegation
Spawning subagents for specific investigation tasks is the second major mitigation strategy. Instead of the main agent doing all exploration directly (filling its context with verbose output from every file read and search), delegate specific questions to subagents:
  * "Find all test files for the order service and report their coverage status"
  * "Trace the refund flow from API endpoint to database and list all intermediate services"
  * "Identify all external API integrations and their error handling patterns"


Each subagent operates with its own isolated context. It can explore verbosely without polluting the main agent's context. It returns a structured summary to the coordinator, which keeps only the key findings.
Parallelisation is the obvious read; the real value is context isolation. The main agent's context stays clean for high-level coordination while subagents handle the verbose exploration.
### Summary Injection Between Phases
When exploration happens in phases (Phase 1: understand the architecture, Phase 2: investigate specific components), summarise key findings from Phase 1 before spawning Phase 2 subagents. Inject these summaries into the initial context of Phase 2 subagents.
This prevents the "cold start" problem where Phase 2 subagents duplicate Phase 1 exploration because they were not given the previous findings. It also ensures that Phase 2 agents have the architectural understanding needed to ask the right questions.
Copy
```
Phase 1 Summary (injected into Phase 2 subagent prompts):
- The system follows a layered architecture: Controllers → Services → Repositories → Database
- The refund flow passes through: RefundController → RefundProcessor → OrderService → PaymentGateway
- Key concern: RefundProcessor has no retry logic for external API failures
- Phase 2 objective: Investigate error handling in RefundProcessor and PaymentGateway

```

### The /compact Command
Claude Code provides a `/compact` command specifically for reducing context usage during extended sessions. When context fills with verbose discovery output — file contents, search results, directory listings — `/compact` summarises the conversation to free up space while preserving key information.
Use `/compact` proactively during extended exploration sessions, not just when you hit context limits. It's there to protect context quality, not only quantity.
### Crash Recovery via Structured State Manifests
Extended exploration sessions can fail due to session crashes, network interruptions, or context exhaustion. Without recovery mechanisms, all exploration progress is lost.
The fix is structured state persistence. Each agent exports its current state to a known file location (a manifest). This manifest includes:
  * What has been explored (files read, searches performed)
  * Key findings discovered so far
  * Current phase and next steps
  * Any pending questions or unresolved issues


jsonCopy

```
{
  "sessionId": "explore-order-service-001",
  "phase": 2,
  "exploredPaths": [
    "src/repos/order.ts",
    "src/services/order.ts",
    "src/services/refund.ts"
  ],
  "keyFindings": {
    "architecture": "Layered: Controllers → Services → Repositories → DB",
    "criticalIssue": "RefundProcessor has no retry logic for Stripe API failures",
    "testCoverage": {"OrderService": "87%", "RefundProcessor": "12%"}
  },
  "nextSteps": [
    "Investigate PaymentGateway error handling",
    "Review RefundProcessor test files",
    "Check cache invalidation logic in OrderRepository"
  ]
}

```

On resume, the coordinator loads this manifest and injects it into agent prompts. The agent picks up where it left off without repeating earlier exploration.
Key Concept
Context degradation is not a token limit problem — it is the model losing grip on specific findings as verbose output accumulates. Scratchpad files persist key discoveries outside the context. Subagent delegation isolates verbose exploration. Crash recovery manifests prevent progress loss across sessions.
## Exam Traps
Exam Trap
Increasing the context window to solve context degradation
Context degradation is not about running out of tokens. It is about the model losing track of specific details as verbose output accumulates. A larger window still fills with verbose output.
Exam Trap
Assuming subagent delegation is only about parallelisation
The primary benefit of subagent delegation for codebase exploration is context isolation — keeping the main agent's context clean while subagents handle verbose exploration.
Exam Trap
Restarting a session to fix context degradation without saving state
Restarting loses all accumulated knowledge. Use scratchpad files and state manifests to persist findings before restarting, then inject them into the new session.
Exam Trap
Using /compact only when hitting context limits
/compact should be used proactively during extended sessions to maintain context quality, not just as a last resort when context is exhausted.
## Practice Scenario
A developer productivity agent is exploring an unfamiliar codebase. After investigating several modules, it starts referencing 'typical repository patterns' instead of the specific class names and dependency chains it discovered earlier. What is the most effective mitigation?
Option AIncrease the model context window so that far more of the discovery output can be retained throughout the whole exploration
Option BHave the agent maintain scratchpad files recording key findings and reference them for subsequent questions
Option CRestart the session with a fresh context and ask the agent to explore the codebase more efficiently this time
Option DPre-load the entire codebase structure into the initial context so exploration has less to rediscover
Check Answer
## Build Exercise
Build Exercise
#### Build a Context-Resilient Codebase Explorer
Difficulty
60 minutes
What you'll learn
  * Recognise context degradation as an attention quality problem, not a token limit problem
  * Implement scratchpad files to persist key findings outside the conversation context
  * Use subagent delegation for context isolation, not just parallelisation
  * Design crash recovery via structured state manifests for session resilience
  * Apply summary injection between exploration phases to prevent cold start duplication


  1. Create a coordinator agent that delegates specific codebase exploration tasks to subagents (e.g., find test files, trace dependency chains, identify external integrations)
Why: Subagent delegation is primarily about context isolation, not parallelisation. The main agent context stays clean for high-level coordination while subagents handle verbose exploration. This directly prevents context degradation by keeping verbose file contents and search results out of the coordinator context.
You should see: A coordinator function that spawns subagents with specific, focused investigation prompts. Each subagent returns a structured summary (key findings, file paths, class names) rather than raw verbose output. The coordinator context should remain clean.
Stuck? Get a nudge
  2. Implement scratchpad file management: agents write key findings (class names, file paths, dependency chains) to a known file and read it before subsequent exploration steps
Why: Scratchpad files are the primary mitigation for context degradation. They persist knowledge outside the conversation context, making it immune to the attention shift that causes the model to reference typical patterns instead of specific class names and file paths it discovered earlier.
You should see: An agent that writes structured findings to a scratchpad file after each exploration step and reads the scratchpad at the start of each subsequent step. The scratchpad should contain specific class names, file paths, and dependency chains, not summaries.
Stuck? Get a nudge
  3. Build summary injection logic: after Phase 1 exploration, summarise findings and inject the summary into Phase 2 subagent prompts
Why: Summary injection prevents the cold start problem where Phase 2 subagents duplicate Phase 1 exploration because they were not given previous findings. It ensures Phase 2 agents have the architectural understanding needed to ask the right questions without rediscovering the system structure.
You should see: A Phase 1 summary document that captures the high-level architecture, key concerns, and specific investigation targets for Phase 2. This summary is injected into the initial prompt of every Phase 2 subagent.
Stuck? Get a nudge
  4. Implement crash recovery: each agent exports structured state (explored paths, key findings, next steps) to a manifest file that the coordinator loads on resume
Why: Extended exploration sessions can fail from crashes, network interruptions, or context exhaustion. Without recovery mechanisms, all progress is lost. Structured state manifests enable the coordinator to resume from the last checkpoint rather than restarting from scratch.
You should see: A manifest file in JSON format containing the session ID, current phase, explored paths, key findings, and next steps. On resume, the coordinator loads this manifest and injects it into agent prompts so exploration continues from where it left off.
Stuck? Get a nudge
  5. Test context degradation by running an extended exploration session across multiple modules and verify that scratchpad files preserve specific class names and file paths that would otherwise degrade to generic descriptions
Why: This validates that the scratchpad mitigation actually works against context degradation. The observable symptom is the model referencing typical patterns instead of specific classes and paths. You need to confirm that scratchpad files prevent this degradation.
You should see: Two comparison runs: one without scratchpad files where the agent degrades to generic references after exploring 4-5 modules, and one with scratchpad files where the agent maintains specific class names and file paths throughout the entire session.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.4](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Claude Code Documentation — Context Management](https://code.claude.com/docs/en/context-window) — Anthropic
  * [Claude Code Documentation — Commands](https://code.claude.com/docs/en/commands) — Anthropic


---


Domain 5Task 5.5
# Human Review & Confidence Calibration
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Human review is the safety net for automated extraction and classification systems. The exam tests your understanding of when and how to deploy human reviewers effectively. The core challenge is not whether to use human review, but how to allocate limited reviewer capacity to maximise accuracy while minimising cost. This requires understanding confidence calibration, the trap of aggregate metrics, and stratified sampling strategies.
### The Aggregate Metrics Trap
This is the most dangerous misconception in production extraction systems. A system reports 97% overall accuracy. The team celebrates. Management approves full automation for all high-confidence extractions.
The problem: that 97% hides catastrophic failure rates on specific document types. The system extracts dates from standard invoices at 99.5% accuracy. But handwritten receipts? 60%. Scanned PDFs with poor OCR? 72%. International documents with non-standard formatting? 45%.
The aggregate masks the segments where the system fails most. And those segments are often the ones where errors have the highest business impact — handwritten receipts from field staff, international invoices from new suppliers, scanned historical documents for compliance audits.
**The rule: always validate accuracy by document type AND field segment before automating.** Never make automation decisions based on aggregate metrics alone.  
| Document Type  | Date Accuracy  | Amount Accuracy  | Name Accuracy  |  
| --- | --- | --- | --- |  
| Standard invoices  | 99.5%  | 98.2%  | 97.8%  |  
| Handwritten receipts  | 60.1%  | 55.3%  | 71.2%  |  
| Scanned PDFs  | 72.4%  | 69.8%  | 80.1%  |  
| International formats  | 45.2%  | 52.1%  | 63.4%  |  
| **Aggregate**  | **97.0%**  | **96.1%**  | **95.8%**  |  
The aggregate looks excellent because standard invoices dominate the volume. But three document types have unacceptable accuracy, hidden by the volume-weighted average.
### Stratified Random Sampling
Even after validating by document type and field, you need ongoing verification. Stratified random sampling means selecting a representative sample from each stratum (document type, confidence band, field type) and having humans verify it.
The critical insight is that you must sample high-confidence extractions, not just low-confidence ones. Low-confidence items are already routed to human review. High-confidence items are automated. If the model develops a novel error pattern that affects high-confidence extractions, only stratified sampling will catch it.
Stratified sampling serves two purposes:
  1. **Ongoing accuracy measurement** — confirm that each segment maintains its validated accuracy rate.
  2. **Novel error pattern detection** — discover new failure modes that did not exist in the original validation set.


Without stratified sampling, you're flying blind on your automated extractions. The system could develop a systematic error on a new document format and you wouldn't know until downstream business processes fail.
### Field-Level Confidence Calibration
The model can output confidence scores per field. For an invoice extraction, it might report:
jsonCopy

```
{
  "vendorName": {"value": "Acme Corp", "confidence": 0.98},
  "invoiceDate": {"value": "2024-03-15", "confidence": 0.95},
  "totalAmount": {"value": "$1,247.83", "confidence": 0.72},
  "lineItems": {"value": [...], "confidence": 0.61}
}

```

But raw model confidence scores are not calibrated. A model that reports 0.95 confidence might actually be correct 88% of the time on certain field types. Or 99% of the time on others. The confidence score is relative, not absolute.
**Calibration requires labelled validation sets (ground truth data).** You take a set of documents with known correct extractions, run the model, compare its confidence scores to actual accuracy, and build a calibration curve. This tells you: "When the model reports 0.90 confidence on date fields, it's actually correct 94% of the time. When it reports 0.90 on amount fields, it's actually correct 82% of the time."
Calibrated thresholds then drive routing:
  * Fields above the calibrated threshold → automated (with stratified sampling)
  * Fields below the calibrated threshold → human review
  * Fields in the ambiguous zone → prioritised human review


### Reviewer Capacity Prioritisation
Human reviewers are expensive and limited. The exam tests whether you understand how to allocate their capacity effectively.
**Route the highest-uncertainty items to reviewers first.** This means:
  * Low model confidence fields
  * Extractions from ambiguous or contradictory source documents
  * Document types with historically poor accuracy
  * Fields where the model expresses uncertainty (e.g., multiple possible interpretations)


Do NOT spread reviewer capacity evenly across all extractions. An even distribution wastes time reviewing high-confidence items that the model handles well while leaving insufficient capacity for the uncertain items that actually need human judgement.
The prioritisation should be dynamic, not static. As the system processes documents, the queue of items awaiting human review should be ordered by uncertainty. When a reviewer finishes one item, the next item in their queue should be the highest-uncertainty item remaining, not simply the next in chronological order.
### Validation Before Automation
The sequence matters:
  1. **Measure accuracy by document type and field segment** — not aggregate.
  2. **Calibrate confidence scores** using labelled validation sets.
  3. **Set calibrated thresholds** for automation versus human review.
  4. **Implement stratified random sampling** for ongoing verification of automated extractions.
  5. **Only then reduce human review** on segments that demonstrate consistent, validated accuracy.


Skipping to step 5 based on aggregate metrics is the trap. Every step in this sequence exists to prevent a specific failure mode.
Key Concept
97% aggregate accuracy can hide 40% error rates on specific document types. Validate accuracy by document type AND field segment. Calibrate confidence scores using labelled validation sets. Sample high-confidence extractions through stratified sampling. Prioritise limited reviewer capacity on the highest-uncertainty items.
## Exam Traps
Exam Trap
Using aggregate accuracy (e.g., 97%) to justify automating all high-confidence extractions
Aggregate metrics hide per-type performance. 97% overall can mean 40% accuracy on specific document types. Validate by document type and field segment before automating.
Exam Trap
Only sampling low-confidence extractions for human review
High-confidence extractions are automated. If a novel error pattern affects them, only stratified random sampling of high-confidence items will detect it.
Exam Trap
Using raw model confidence scores without calibration
Raw confidence scores are not calibrated. 0.90 confidence on dates might mean 94% actual accuracy, while 0.90 on amounts might mean only 82%. Calibrate using labelled validation sets.
Exam Trap
Spreading reviewer capacity evenly across all extractions
Even distribution wastes time on high-confidence items. Prioritise limited reviewer capacity on the highest-uncertainty items where human judgement adds the most value.
## Practice Scenario
A structured data extraction system achieves 97% overall accuracy across all document types. The team proposes automating all extractions where model confidence exceeds 95% to reduce human review costs. What is the critical risk in this approach?
Option AAutomated extractions should always receive human review regardless of the confidence score, which makes the proposal fundamentally flawed no matter where the threshold is set
Option BThe 95% confidence threshold is too low for automation and should be raised to 99% before any extractions bypass human review
Option CThe model will become overconfident as it processes more documents over time, so the system will require regular retraining to stay calibrated
Option DAggregate accuracy may mask poor performance on specific document types or fields, and confidence scores need calibration against labelled validation sets before use
Check Answer
## Build Exercise
Build Exercise
#### Build a Confidence-Calibrated Review Router
Difficulty
50 minutes
What you'll learn
  * Recognise the aggregate metrics trap: 97% overall accuracy can hide 40% error rates on specific document types
  * Implement accuracy tracking broken down by document type AND field segment
  * Calibrate raw confidence scores using labelled validation sets to produce reliable routing thresholds
  * Design stratified random sampling that includes high-confidence extractions for ongoing verification
  * Prioritise limited reviewer capacity on the highest-uncertainty items with dynamic queue ordering


  1. Create a mock extraction system that outputs field-level confidence scores for different document types (invoices, receipts, scanned PDFs, international documents)
Why: Field-level confidence scores are the foundation of intelligent review routing. The exam tests that raw model confidence is not calibrated and must be validated against ground truth before use. Building the mock system gives you data to calibrate against.
You should see: An extraction function that returns each field with its value and a confidence score between 0.0 and 1.0. The system should process at least 4 document types with noticeably different confidence distributions per type.
Stuck? Get a nudge
  2. Implement accuracy tracking broken down by document type and field segment — not just aggregate metrics
Why: The aggregate metrics trap is the most dangerous misconception in production extraction systems. 97% overall accuracy can hide catastrophic failure rates on specific document types because standard invoices dominate the volume. The exam tests that you must validate by document type AND field segment before automating.
You should see: An accuracy table showing each document type and field combination separately. Standard invoices should show 95%+ accuracy while handwritten receipts and international documents show 40-70%. The aggregate should look excellent (90%+) despite the poor per-type numbers.
Stuck? Get a nudge
  3. Build a calibration module that takes a labelled validation set (ground truth) and produces calibrated confidence thresholds per field type per document type
Why: Raw model confidence scores are not calibrated. A model reporting 0.90 confidence might actually be correct 94% of the time on date fields but only 82% on amount fields. Calibration using labelled validation sets is required before confidence scores can drive automated routing decisions.
You should see: A calibration curve for each field type per document type, mapping reported confidence ranges to actual accuracy percentages. The curve should reveal that the same confidence score means different things for different field-document combinations.
Stuck? Get a nudge
  4. Implement stratified random sampling that selects high-confidence extractions for ongoing verification, sampling proportionally across all document types
Why: High-confidence extractions are automated and not reviewed. If the model develops a novel error pattern affecting high-confidence items, only stratified sampling will catch it. Sampling only low-confidence items leaves you blind to systematic errors in automated extractions.
You should see: A sampling function that selects a representative subset from each stratum (document type and confidence band), including samples from the high-confidence automated extractions. The sample should be proportional to the volume in each stratum.
Stuck? Get a nudge
  5. Build a review router that prioritises limited reviewer capacity on the highest-uncertainty items, dynamically reordering the review queue as new extractions arrive
Why: Human reviewers are expensive and limited. Spreading capacity evenly across all extractions wastes time on high-confidence items while leaving insufficient capacity for uncertain items that need human judgement. Dynamic priority ordering ensures the most uncertain items are always reviewed first.
You should see: A priority queue that orders items by uncertainty (lowest confidence first), dynamically reorders as new extractions arrive, and serves the next-highest-uncertainty item to each available reviewer. The queue should never serve items in chronological order.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.5](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic Structured Data Extraction Guide](https://code.claude.com/docs/en/agent-sdk/structured-outputs) — Anthropic
  * [Anthropic Human-in-the-Loop Patterns](https://code.claude.com/docs/en/agent-sdk/user-input) — Anthropic


---


Domain 5Task 5.6
# Information Provenance & Multi-Source Synthesis
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Information provenance — knowing where every claim comes from and how confident you should be in it — is the difference between a research system that produces trustworthy outputs and one that produces plausible-sounding fiction. The exam tests your understanding of how attribution survives (or dies) through multi-agent synthesis pipelines, how to handle conflicting sources, and how temporal context prevents false contradictions.
### Structured Claim-Source Mappings
Every finding in a multi-agent research system must carry its provenance. This isn't optional metadata. It's the structural guarantee that the final output can be traced back to specific sources. Each finding must include:
  * **Claim:** The specific assertion being made
  * **Source URL:** Where the information was found
  * **Document name:** The title of the source document
  * **Relevant excerpt:** The specific passage that supports the claim
  * **Publication date:** When the source was published or data was collected


jsonCopy

```
{
  "claim": "Global renewable energy investment reached $495 billion in 2023",
  "sourceUrl": "https://example.com/iea-report-2024",
  "documentName": "IEA World Energy Investment Report 2024",
  "relevantExcerpt": "Total investment in renewable energy technologies reached approximately $495 billion in calendar year 2023, representing a 17% increase over 2022.",
  "publicationDate": "2024-06-15"
}

```

The critical challenge is that attribution dies during summarisation. When a synthesis agent combines findings from multiple subagents, it naturally compresses and paraphrases. Without explicit instructions to preserve claim-source mappings, the synthesis produces statements like "Investment in renewable energy has grown significantly" — no amount, no source, no date.
**Downstream agents must explicitly preserve and merge claim-source mappings through synthesis.** This requires:
  1. Subagents output findings in the structured claim-source format.
  2. The synthesis agent is instructed to maintain these mappings when combining findings.
  3. The final output includes inline citations or a structured reference section that traces each claim to its source.


### Conflict Handling
When two credible sources report different statistics for the same measure, the synthesis agent faces a critical decision. The wrong approach — and the one the exam tests for — is to arbitrarily select one value.
**Example:** Source A reports 12% market growth. Source B reports 8% market growth. Both are credible publications.
**Wrong approach:** Select the more recent source, or average the values, or pick the one from the more authoritative publisher.
**Correct approach:** Annotate with both values and full source attribution. Let the consumer decide.
markdownCopy

```
Market growth estimates vary by source:
- **12% growth** — IEA World Energy Report (published June 2024, using 2023 calendar year data)
- **8% growth** — Bloomberg NEF Annual Review (published March 2024, using July 2022–June 2023 data)

The difference may reflect different reporting periods and methodological approaches.

```

This preserves the full picture. The consumer can see both values, understand the sources, and make their own judgement about which is more relevant to their needs. Arbitrarily selecting one value destroys information and presents a false certainty.
### Temporal Awareness
Different publication dates explain different numbers. That's not a contradiction. It's temporal context, and it has to be preserved.
Consider two sources:
  * Source A (published 2023): reports 8% growth
  * Source B (published 2024): reports 12% growth


Without publication dates, these look contradictory. With dates, they tell a story: growth accelerated from 8% to 12% over the measured period. The "conflict" is actually a trend.
**Require publication/data collection dates in all structured outputs.** This isn't housekeeping; it's what makes correct interpretation possible. Without temporal context, valid trends get misread as data quality issues, and the synthesis agent may incorrectly flag or suppress findings that are actually consistent.
Subagents must include these dates in their structured outputs. The synthesis agent must preserve them through the merging process. And the final output must present them alongside the data they describe.
### Content-Appropriate Rendering
Different types of content demand different presentation formats. The exam tests whether you understand that synthesis should not flatten everything into a uniform format:
**Financial data → Tables.** Numbers, comparisons, and trends are most readable in tabular format. Forcing financial data into prose paragraphs makes it harder to compare values and spot patterns.  
| Year  | Investment ($B)  | Growth (%)  |  
| --- | --- | --- |  
| 2021  | 366  | 12%  |  
| 2022  | 423  | 16%  |  
| 2023  | 495  | 17%  |  
**News and current events → Prose.** Narrative context, cause-and-effect relationships, and chronological developments read naturally as paragraphs.
**Technical findings → Structured lists.** Architectural patterns, API specifications, and configuration options are clearest as bulleted or numbered lists with clear hierarchy.
Forcing all content into a single format — all tables, or all prose, or all lists — degrades readability and comprehension. The synthesis agent should select the appropriate rendering format based on the content type.
### Attribution Preservation Through Multi-Step Synthesis
In a multi-agent pipeline, attribution must survive every step:
  1. **Research subagent** collects findings with claim-source mappings.
  2. **Analysis subagent** evaluates findings and adds assessment, preserving original mappings.
  3. **Synthesis subagent** combines findings from multiple agents, merging mappings.
  4. **Report generation** produces the final output with inline citations.


At each step, there is a risk of attribution loss. The most common failure point is step 3, where the synthesis agent combines and paraphrases findings without carrying the source mappings forward. The synthesis agent's prompt must explicitly require that every claim in its output is traceable to a specific source.
Reports should include explicit sections distinguishing well-established findings from contested ones, preserving original source characterisations and methodological context. A finding supported by three independent sources is different from a finding based on a single report, even if both are presented with equal confidence in the text.
### Completing Analysis with Conflicts Intact
When document analysis encounters conflicting values, the analysis agent must complete its work with the conflicts included and explicitly annotated. It should not resolve the conflict — that decision belongs to the coordinator or the consumer.
jsonCopy

```
{
  "field": "annualRevenue",
  "conflictDetected": true,
  "values": [
    {
      "value": "$4.2M",
      "source": "Annual Report 2023",
      "context": "Audited financial statements, fiscal year ending December 2023"
    },
    {
      "value": "$3.8M",
      "source": "SEC Filing Q4 2023",
      "context": "Preliminary unaudited figures, calendar year 2023"
    }
  ],
  "possibleExplanation": "Difference may reflect audited vs preliminary figures and fiscal vs calendar year reporting periods"
}

```

The coordinator can then decide how to handle the conflict: present both values, investigate further, or escalate to a human analyst.
Key Concept
Every claim needs a structured mapping: claim + source URL + document name + excerpt + publication date. Attribution dies during summarisation unless explicitly preserved. Conflicting sources should be annotated with both values and attribution — never arbitrarily pick one. Different dates explain different numbers. Render content appropriately: financial data as tables, news as prose, technical findings as lists.
## Exam Traps
Exam Trap
Selecting the most recent source when two credible sources conflict
Arbitrarily selecting one value destroys information. Annotate both values with source attribution and publication dates. Let the consumer decide.
Exam Trap
Assuming different numbers from different sources are contradictions
Different publication or data collection dates often explain different numbers. Require dates in structured outputs to enable correct temporal interpretation.
Exam Trap
Allowing the synthesis agent to paraphrase without preserving claim-source mappings
Attribution dies during summarisation. The synthesis agent must explicitly preserve and merge claim-source mappings. Without this, the output is untraceable.
Exam Trap
Rendering all content types in a uniform format (all prose, all tables, or all lists)
Financial data is best as tables, news as prose, technical findings as structured lists. Flattening to a single format degrades readability and comprehension.
## Practice Scenario
A multi-agent research system produces a synthesis report on market trends. Two credible sources report different growth rates: Source A reports 12% growth (2023 data) and Source B reports 8% growth (2024 data). The synthesis agent currently selects the more recent value. What is the correct approach?
Option AFlag the conflict and escalate it to a human researcher for resolution before including either of the two figures in the final report
Option BAverage the two values and report 10% growth, with a footnote recording the variance between the two sources
Option CAlways use the most recent source, since the later publication date makes it the more reliable reflection of current market conditions
Option DAnnotate both values with source attribution and publication dates, letting the consumer decide how to interpret the difference
Check Answer
## Build Exercise
Build Exercise
#### Build a Provenance-Preserving Synthesis Pipeline
Difficulty
60 minutes
What you'll learn
  * Design structured claim-source mappings with claim, source URL, document name, excerpt, and publication date
  * Preserve attribution through multi-step synthesis pipelines without loss during summarisation
  * Handle conflicting sources by annotating both values rather than arbitrarily selecting one
  * Use temporal awareness (publication dates) to distinguish trends from contradictions
  * Apply content-appropriate rendering: tables for financial data, prose for news, lists for technical findings


  1. Define a structured claim-source mapping schema with fields: claim, sourceUrl, documentName, relevantExcerpt, publicationDate
Why: Every finding in a multi-agent research system must carry its provenance. Without structured claim-source mappings, attribution dies during summarisation and the final output becomes untraceable plausible-sounding text with no verifiable sources.
You should see: A TypeScript interface or JSON schema with all five required fields: claim (the assertion), sourceUrl (where found), documentName (title), relevantExcerpt (supporting passage), and publicationDate (when published or data collected). Each field should be required, not optional.
Stuck? Get a nudge
  2. Implement two research subagents that output findings using the claim-source mapping schema, including publication dates
Why: Subagents must output in the structured format from the start. If subagents return unstructured prose, attribution is already lost before synthesis begins. Requiring structured output at the subagent level is the foundation of end-to-end provenance.
You should see: Two subagent functions that each return an array of ClaimSourceMapping objects with all fields populated, including publication dates. Each subagent should research a different aspect of the same topic.
Stuck? Get a nudge
  3. Build a synthesis agent that merges findings from both subagents while explicitly preserving all claim-source mappings through the merge process
Why: Step 3 (synthesis) is the most common failure point for attribution. The synthesis agent naturally compresses and paraphrases, destroying claim-source mappings unless explicitly instructed to preserve them. The exam tests whether you understand that attribution must be explicitly maintained through every synthesis step.
You should see: A synthesis output where every claim is traceable to its source. The synthesis should combine related findings but maintain inline citations or a reference section linking each claim to its original source URL, document name, and publication date.
Stuck? Get a nudge
  4. Handle conflicting sources by annotating both values with full attribution and possible explanations, without arbitrarily selecting one value
Why: When two credible sources report different statistics, arbitrarily selecting one destroys information and presents false certainty. The exam tests that the correct approach is to annotate both values with source attribution and let the consumer decide. Different publication dates often explain different numbers as trends, not contradictions.
You should see: A conflict handling function that detects overlapping claims with different values, preserves both with full attribution, and adds a possible explanation noting temporal or methodological differences. The output should never silently pick one value.
Stuck? Get a nudge
  5. Implement content-appropriate rendering in the final output: format financial data as tables, news findings as prose, and technical findings as structured lists
Why: The exam tests that synthesis should not flatten everything into a uniform format. Financial data is most readable as tables, news context reads naturally as prose, and technical findings are clearest as structured lists. Forcing all content into one format degrades readability.
You should see: A rendering function that detects the content type of each section and applies the appropriate format. Financial data should appear in tables with columns for year, value, and source. News should be prose paragraphs. Technical findings should be bulleted lists.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Domain 5, Task Statement 5.6](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Anthropic Multi-Agent Research Patterns](https://www.anthropic.com/engineering/built-multi-agent-research-system) — Anthropic
  * [Anthropic Prompt Engineering — Citation and Attribution](https://platform.claude.com/docs/en/build-with-claude/citations) — Anthropic