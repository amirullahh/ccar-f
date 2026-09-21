Domain 420%
# Prompt Engineering & Structured Output
Craft effective prompts, implement structured output patterns, and apply prompt engineering techniques for production Claude applications.
## Task Statements
[ 4.1System Prompts with Explicit Criteria ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-1-system-prompts)[ 4.2Few-Shot Prompting ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-2-few-shot-prompting)[ 4.3Structured Output with Tool Use ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-3-structured-output)[ 4.4Validation, Retry, and Feedback Loops ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-4-validation-retry-loops)[ 4.5Batch Processing Strategies ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-5-batch-processing)[ 4.6Multi-Instance and Multi-Pass Review ](https://claudecertificationguide.com/learn/4-prompt-engineering/4-6-multi-pass-review)


---


Domain 4Task 4.1
# System Prompts with Explicit Criteria
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
The single biggest mistake in production prompt engineering is relying on vague instructions. "Be conservative." "Only report high-confidence findings." "Use your best judgement." None of these give the model an actionable decision boundary. They sound reasonable, which is exactly why the exam uses them as distractors.
The correct approach is **explicit categorical criteria** that define precisely what the model should flag and what it should skip. Compare these two system prompts for a CI/CD code review pipeline:
**Wrong approach:**
Copy
```
Review this code. Be conservative. Only report high-confidence findings.

```

**Correct approach:**
Copy
```
Flag comments only when claimed behaviour contradicts actual code behaviour.
Report bugs and security vulnerabilities.
Skip minor style preferences and local patterns.

```

The first gives the model no criteria to apply. "Conservative" means different things in different contexts, and "high-confidence" is a subjective threshold the model cannot calibrate. The second provides concrete categories: what to report (bugs, security), what to skip (style, local patterns), and a specific trigger for comment flags (claimed vs actual behaviour contradiction).
### The False Positive Trust Problem
High false positive rates in one category destroy developer trust in **all** categories. The exam leans on this hard. If your "documentation mismatch" findings are wrong 40% of the time, developers stop reading your "security vulnerability" findings too, even when those run at 98% accuracy. Trust isn't category-specific. It bleeds across the whole output.
The fix feels backwards: **temporarily disable the high false-positive categories** while you rework their prompts. Trust in the categories that already work comes back straight away. Then you iterate on the broken category with concrete code examples, switching it back on only once precision improves.
You're not abandoning the category. You're putting system-wide trust ahead of category completeness.
### Severity Calibration with Code Examples
Defining severity levels requires **concrete code examples** , not prose descriptions. Compare:
**Prose description (insufficient):**
Copy
```
Critical: Issues that could cause system failures or data loss
Minor: Issues that affect code readability but not functionality

```

**Code example approach (correct):**
Copy
```
Critical — Unsanitised user input in SQL query:
  query = f"SELECT * FROM users WHERE id = {user_input}"

Minor — Inconsistent variable naming:
  userName vs user_name in the same module

```

The prose description forces the model to interpret what "could cause system failures" means. The code example removes ambiguity entirely. When the model sees actual code patterns classified at each severity level, it produces consistent classification across invocations.
Key Concept
Explicit categorical criteria always outperform vague instructions. Define what to flag (bugs, security vulnerabilities) and what to skip (style preferences, local patterns) using concrete code examples for each severity level. Never rely on "be conservative" or confidence-based filtering.
### Why Confidence-Based Filtering Fails
The exam frequently presents "only report high-confidence findings" as a tempting answer. It sounds like good engineering: filter by confidence, keep only the strong signals. But LLM self-reported confidence is poorly calibrated. The model is often sure about wrong findings and hesitant about right ones. Confidence scores earn their keep in routing (sending low-confidence findings to human review, as covered in Task Statement 4.6), but they're no substitute for explicit criteria that define what counts as a valid finding in the first place.
The hierarchy is: **explicit criteria first** , confidence-based routing second. Never skip the first step.
## Exam Traps
Exam Trap
Choosing 'be conservative' or 'only report high-confidence findings' as valid prompt improvements
Vague instructions do not improve precision. The model has no actionable interpretation of 'conservative.' Specific categorical criteria defining exactly what to flag and what to skip are the correct approach.
Exam Trap
Assuming confidence thresholds fix false positive problems
LLM self-reported confidence is poorly calibrated. Explicit criteria with concrete code examples produce better results than confidence-based filtering. Confidence routing is useful but only after criteria are defined.
Exam Trap
Keeping all review categories active while iterating on high false-positive categories
High false positive rates in one category destroy trust in ALL categories. Temporarily disabling problematic categories while improving their prompts restores system-wide trust.
## Practice Scenario
Your CI/CD code review pipeline has a 40% false positive rate on 'documentation mismatch' findings, causing developers to ignore ALL review categories including accurate security findings. What is the most effective fix?
Option ATemporarily disable the documentation mismatch category while refining its prompts with explicit criteria and code examples
Option BIncrease the model temperature to produce more varied review runs, then filter out findings that appear only once
Option CAdd a second model pass that re-examines each documentation finding and discards any it cannot verify before the report reaches developers
Option DAdd "only report high-confidence documentation issues" to the system prompt so the model filters its own weaker findings
Check Answer
## Build Exercise
Build Exercise
#### Build an Explicit Criteria Code Review Prompt
Difficulty
45 minutes
What you'll learn
  * Understand why vague instructions (be conservative, high-confidence only) fail in production prompts
  * Design explicit categorical criteria that define what to flag and what to skip
  * Calibrate severity levels using concrete code examples rather than prose descriptions
  * Measure false positive rates and apply the trust recovery strategy of disabling problematic categories
  * Recognise the hierarchy: explicit criteria first, confidence-based routing second


  1. Write a system prompt with vague instructions (be conservative, only flag important issues) and test it against 5 code snippets containing known bugs, security issues, and style nitpicks
Why: Establishing a baseline with vague instructions demonstrates the false positive problem the exam tests. You need empirical evidence that phrases like be conservative give the model no actionable decision boundary.
You should see: Inconsistent classification across the 5 snippets: some style nitpicks flagged as critical, some genuine bugs missed or marked minor, and different results if you run the same snippets twice.
Stuck? Get a nudge
  2. Rewrite the prompt with explicit categorical criteria: define exactly which issues to report (bugs, security vulnerabilities) and which to skip (style preferences, local patterns)
Why: Explicit categorical criteria are the correct approach tested on the exam. This step demonstrates that concrete categories eliminate the ambiguity that causes false positives.
You should see: The rewritten prompt has clear categories: report bugs and security vulnerabilities, skip style preferences and local patterns, flag comments only when claimed behaviour contradicts actual code behaviour.
Stuck? Get a nudge
  3. Add concrete code examples for each severity level — critical, major, minor — showing actual code patterns, not prose descriptions
Why: The exam specifically tests that code examples outperform prose descriptions for severity calibration. Prose like issues that could cause system failures forces the model to interpret, while code examples remove ambiguity entirely.
You should see: Your prompt now contains at least one code snippet per severity level, each showing the actual pattern that defines that severity, not a prose description of what that severity means.
Stuck? Get a nudge
  4. Compare false positive rates between the two versions on the same test set and document which approach produces more consistent classification
Why: Quantifying the improvement validates the explicit criteria approach and builds the evaluation skill the exam expects. You should be able to articulate why one approach outperforms the other with data, not intuition.
You should see: A clear reduction in false positives with the explicit criteria version. The vague prompt should produce 30-50% inconsistency while the explicit criteria version should be below 15%. Classification should be stable across repeated runs.
Stuck? Get a nudge
  5. Temporarily disable any category with above 25% false positive rate and document the criteria refinements needed before re-enabling
Why: The trust recovery strategy is a key exam concept: high false positive rates in one category destroy developer trust in ALL categories. Disabling problematic categories restores system-wide trust while you iterate on their criteria.
You should see: A document listing which categories exceed the 25% threshold, what specific criteria refinements are needed (e.g., add code examples for edge cases), and a re-enablement plan with target false positive rates.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.1](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 4Task 4.2
# Few-Shot Prompting
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Few-shot examples are the most effective technique for achieving consistent, well-formatted output from Claude. Not more instructions. Not confidence thresholds. Not temperature adjustments. When your output is inconsistent, few-shot examples are the first tool to reach for.
This is a direct exam principle. The exam presents scenarios where detailed instructions produce inconsistent results and tests whether you choose "add more instructions" or "add few-shot examples." The correct answer is almost always the latter.
### When to Deploy Few-Shot Examples
Three specific triggers tell you few-shot examples are needed:
**1. Detailed instructions alone produce inconsistent formatting.** You have written a thorough prompt specifying the output format, but the model produces different structures across invocations — sometimes a bulleted list, sometimes a table, sometimes prose. More instructions will not fix this. A few examples showing the exact format you want will.
**2. The model makes inconsistent judgement calls on ambiguous cases.** For a code review tool, the model flags variable shadowing as "critical" in one file and "minor" in another. For a tool selection agent, it routes "check my order" to different tools depending on phrasing. These ambiguous cases need examples demonstrating the correct judgement, with reasoning.
**3. Extraction tasks produce empty/null fields for information that exists in the document.** The information is present but in an unexpected format — embedded in narrative text rather than a structured table, or split across multiple paragraphs. Few-shot examples showing extraction from varied document structures resolve this.
### How to Construct Effective Examples
The rules are tight:
**Use 2-4 targeted examples.** Fewer than 2 doesn't establish a pattern. More than 4 wastes tokens without proportional benefit. Point your examples at the specific ambiguous scenarios causing problems.
**Each example must show reasoning.** Don't just show input-output pairs. Show why one action was chosen over plausible alternatives. That teaches the model to generalise its judgement to novel patterns, not just match the specific cases in your examples.
Copy
```
Example: Tool selection for "check my order #12345"
Input: "check my order #12345"
Selected tool: lookup_order
Reasoning: The user provides an order number (#12345), indicating
they want order-specific information. Even though this could be
interpreted as a general customer query, the specific order
identifier makes lookup_order the correct choice over get_customer.

```

Without the reasoning, the model learns only "queries mentioning order numbers go to lookup_order." With the reasoning, the model learns the general principle: specific identifiers route to specific lookup tools.
**Cover the failing scenarios.** If your extraction works on tables but fails on narrative text, your examples should show correct extraction from narrative text. If your code review is inconsistent on variable shadowing, your examples should classify variable shadowing scenarios at different severity levels with reasoning.
### The Hallucination Reduction Effect
Few-shot examples have a useful side effect: they cut hallucination in extraction tasks. When the model sees examples of correct extraction from varied document structures — inline citations vs bibliographies, narrative descriptions vs structured tables, headers vs embedded text — it learns to handle structural variety without inventing data.
This matters most for documents with inconsistent formatting. A financial report might list expenses in a table on one page and bury them in a paragraph on the next. Without examples, the model often nails the table but returns empty fields for the narrative section, or worse, fabricates values. Show it both structures and extraction quality climbs.
### Few-Shot for Reducing False Positives
In code review and analysis, few-shot examples pull double duty: they show both what to flag and what to ignore. Examples that separate acceptable code patterns from genuine issues cut false positives while still catching the real problems.
textCopy

```
Example: Variable shadowing assessment
Code: function process(items) {
  const result = items.map(item => {
    const result = transform(item);  // shadows outer 'result'
    return result;
  });
  return result;
}
Severity: minor
Reasoning: The inner 'result' shadows the outer variable but
within a limited scope (arrow function). The code is still readable
and the shadow does not cause a bug. This is a style preference,
not a defect. Flag as minor only if style consistency is in scope.

```

This example teaches the model to distinguish genuine bugs from benign patterns, reducing false positives while preserving the ability to generalise to genuinely problematic shadowing cases.
Key Concept
Few-shot examples are the most effective technique for consistency. Use 2-4 targeted examples that include reasoning for decisions, not just input-output pairs. Deploy them when instructions alone produce inconsistent results, ambiguous judgements, or empty extraction fields for data that exists.
### Few-Shot vs Other Techniques
The exam tests whether you can distinguish when few-shot examples are the right solution versus when another technique applies:  
| Problem  | Correct Technique  |  
| --- | --- |  
| Inconsistent output formatting  | Few-shot examples  |  
| Malformed JSON output  | tool_use with JSON schemas  |  
| Fabricated values for missing fields  | Optional/nullable schema fields  |  
| Wrong tool selection  | Better tool descriptions (first), then few-shot  |  
| Model misses information in narrative text  | Few-shot examples showing narrative extraction  |  
| Extraction sum does not match total  | Validation-retry loop  |  
## Exam Traps
Exam Trap
Choosing 'add more detailed instructions' when output formatting is inconsistent
If detailed instructions already exist and output is still inconsistent, adding more instructions will not fix the problem. Few-shot examples demonstrating the exact desired format are more effective for consistency.
Exam Trap
Thinking few-shot examples only teach literal pattern-matching
When examples include reasoning for why decisions were made, they teach the model to generalise to novel patterns. The model learns the decision principle, not just the specific case.
Exam Trap
Using confidence thresholds to fix inconsistent judgement calls
Confidence thresholds are poorly calibrated and do not address the root cause. Few-shot examples showing the correct judgement for ambiguous cases directly teach consistent decision-making.
## Practice Scenario
Your extraction pipeline correctly identifies research data in structured tables but returns empty fields when the same information appears in narrative paragraphs. Detailed instructions already specify all required fields and their formats. What should you try first?
Option AAdd a pre-processing step to convert all narrative text into structured tables before extraction
Option BIncrease the model context window to process more of each document
Option CAdd few-shot examples showing correct extraction from both structured tables and narrative paragraphs
Option DAdd a post-processing retry that re-extracts any fields returned as empty
Check Answer
## Build Exercise
Build Exercise
#### Build a Few-Shot Enhanced Extraction Prompt
Difficulty
45 minutes
What you'll learn
  * Identify the three triggers for deploying few-shot examples: inconsistent formatting, ambiguous judgement calls, and empty fields for existing data
  * Construct effective few-shot examples with reasoning, not just input-output pairs
  * Use 2-4 targeted examples covering the specific failing scenarios
  * Distinguish when few-shot examples are the right technique versus schema changes or validation loops
  * Measure the impact of few-shot examples on empty field rates and format consistency


  1. Create a base extraction prompt with detailed instructions but no examples and test it against 10 documents with varied structures: tables, narrative paragraphs, mixed formats
Why: Establishing a baseline without examples demonstrates the consistency problem the exam tests. Detailed instructions alone produce inconsistent output across varied document structures, which is the exact trigger for deploying few-shot examples.
You should see: Inconsistent extraction results across the 10 documents: fields extracted correctly from tables but empty or wrong from narrative paragraphs, different output formats across runs, and inconsistent handling of edge cases.
Stuck? Get a nudge
  2. Record which fields are consistently empty or inconsistent across document structures
Why: Identifying the specific failure patterns tells you exactly what your few-shot examples need to demonstrate. The exam tests whether you can diagnose the problem before prescribing the solution.
You should see: A table or log showing which fields fail on which document types. Typical pattern: dates extracted correctly from tables but missed in narrative text, amounts inconsistent when written in words rather than digits, line items empty when embedded in paragraphs.
Stuck? Get a nudge
  3. Create 3 few-shot examples targeting the failing patterns — each must include reasoning explaining why the extraction was done that way
Why: Examples with reasoning teach the model to generalise to novel patterns, not just match specific cases. Without reasoning, the model learns only surface-level pattern matching. The exam specifically tests that reasoning-included examples outperform input-output pairs.
You should see: Three examples, each showing a different document structure (table, narrative, mixed), with the correct extraction AND a reasoning section explaining how the data was located and why the extraction decisions were made.
Stuck? Get a nudge
  4. Re-run the same 10 documents with the few-shot enhanced prompt and compare: empty field rate, format consistency, and extraction accuracy
Why: Quantifying the improvement demonstrates the effectiveness of few-shot examples as the first-choice technique for consistency problems. The exam expects you to know that few-shot examples outperform additional instructions for this class of problem.
You should see: A measurable reduction in empty fields (especially on narrative documents), improved format consistency across document types, and higher overall extraction accuracy. The improvement should be most dramatic on the document types that previously failed.
Stuck? Get a nudge
  5. Document which structural patterns benefit most from few-shot examples and which require different techniques like schema changes
Why: The exam tests whether you can match the right technique to the right problem. Few-shot examples fix consistency and structural variety issues, but malformed JSON needs tool_use, fabricated values need nullable schemas, and sum discrepancies need validation loops.
You should see: A decision matrix showing which problem types improved with few-shot examples and which still need other interventions. Narrative extraction and format consistency should improve. Fabrication of missing data should not improve and needs schema changes instead.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.2](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 4Task 4.3
# Structured Output with Tool Use
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
When you need guaranteed schema-compliant structured output from Claude, there is a clear reliability hierarchy:
  1. **`tool_use`with JSON schemas** — eliminates JSON syntax errors entirely
  2. **Prompt-based JSON** — model can produce malformed JSON


Commit this hierarchy to memory. The exam builds on it. With tool use, the tool's JSON schema constrains the shape of what Claude returns, eliminating syntax issues like missing brackets, trailing commas, or unquoted keys. The separate `tool_choice` parameter is what forces the model to call the tool at all. Prompt-based extraction (asking the model to output JSON in a text response) gives you no structural guarantees and will periodically produce unparseable output in production.
Current state
Exam guide v1.0 frames the hierarchy as the two tiers above, and that is the expected exam answer. As of 14 August 2026 the API adds two controls the guide predates. `strict: true` on a tool definition is one; the guide's appendix names it as "strict mode for syntax error elimination". `output_config.format` is the other, and it constrains the response itself rather than a tool call. The current docs also list a fourth `tool_choice` mode, `{"type": "none"}`, which blocks tool calls and is the default when you pass no tools; the guide names three, so answer three. **On the exam, answer with the tool_use-over-prompt-based hierarchy.**
### tool_choice: The Three Modes
The `tool_choice` parameter controls whether and how the model calls tools. Understanding the three modes is critical for the exam:
**`"auto"`(default):** The model decides whether to call a tool or return text. It may choose to respond with a text message instead of calling the extraction tool. Use this when the model legitimately needs the option to respond conversationally.
**`"any"`:** The model MUST call a tool but chooses which one. Use this when you have multiple extraction schemas (e.g., `extract_invoice`, `extract_receipt`, `extract_contract`) and the document type is unknown. The model selects the appropriate tool and returns structured output. Guaranteed structured output, flexible tool selection.
**`{"type": "tool", "name": "extract_metadata"}`:** The model MUST call the specific named tool. Use this to force a mandatory first step — for example, ensuring metadata extraction runs before enrichment steps. No flexibility, maximum control.
`extract_metadata` here is a tool you defined yourself; the name is arbitrary. `tool_choice` also applies per request, not per conversation. Once the forced call returns, send the next request with `auto` (or leave the parameter out), otherwise the model is obliged to call the same tool again and you loop.
typescriptCopy

```
// Force guaranteed structured output with unknown document type
const response = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 4096,
  tool_choice: { type: "any" },
  tools: [extractInvoiceTool, extractReceiptTool, extractContractTool],
  messages: [{ role: "user", content: documentText }]
});

// Force a specific extraction step
const response = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 4096,
  tool_choice: { type: "tool", name: "extract_metadata" },
  tools: [extractMetadataTool],
  messages: [{ role: "user", content: documentText }]
});

```

### What tool_use Does NOT Prevent
This is where the exam gets sneaky. `tool_use` with JSON schemas eliminates **syntax** errors but does NOT prevent **semantic** errors:
  * **Sum discrepancies:** Line items that do not sum to the stated total
  * **Field placement errors:** Values placed in the wrong fields (e.g., a date in an amount field when both are strings)
  * **Fabrication:** The model invents values for required fields when the source document lacks the information


The schema guarantees structure. It doesn't guarantee correctness. Semantic validation needs additional logic (covered in Task Statement 4.4).
### Schema Design for Production
Effective schema design prevents entire classes of errors at the structural level:
**Optional/nullable fields** — When source documents may not contain certain information, make those fields optional or nullable. This is the primary defence against fabrication. If a field is required, the model is pressured to produce a value even when the source has none. If the field is nullable, the model can honestly return `null`.
jsonCopy

```
{
  "type": "object",
  "properties": {
    "invoice_number": { "type": "string" },
    "vendor_name": { "type": "string" },
    "payment_terms": { "type": ["string", "null"] },
    "purchase_order": { "type": ["string", "null"] }
  },
  "required": ["invoice_number", "vendor_name"]
}

```

**"unclear" enum value** — For ambiguous cases where the source is genuinely unclear, add an explicit "unclear" option to enum fields. This prevents the model from forcing a classification when the evidence is ambiguous.
**"other" + detail string** — For extensible categorisation, include an "other" enum value paired with a freeform detail string field. This captures edge cases that your predefined categories do not cover.
jsonCopy

```
{
  "category": {
    "type": "string",
    "enum": ["invoice", "receipt", "contract", "unclear", "other"]
  },
  "category_detail": {
    "type": ["string", "null"],
    "description": "Freeform detail when category is 'other'"
  }
}

```

**Format normalisation rules** — Include format normalisation instructions in the prompt alongside the schema. The schema enforces structure. The prompt enforces formatting consistency (e.g., "All dates in ISO 8601 format," "All currency amounts as decimal numbers without currency symbols").
Key Concept
tool_use with JSON schemas eliminates syntax errors but not semantic errors. Make fields optional/nullable when source documents may lack information — this prevents the model from fabricating values. Use tool_choice "any" for guaranteed structured output when the document type is unknown.
## Exam Traps
Exam Trap
Believing tool_use with JSON schemas prevents all extraction errors
tool_use eliminates JSON syntax errors only. Semantic errors — values that do not sum correctly, data placed in wrong fields, fabricated values for missing information — still occur and require separate validation.
Exam Trap
Confusing tool_choice 'auto' with 'any'
'auto' allows the model to return text instead of calling a tool — no guarantee of structured output. 'any' guarantees a tool call but lets the model choose which tool. For guaranteed structured output with unknown document types, use 'any'.
Exam Trap
Making all schema fields required to ensure data completeness
Required fields pressure the model to fabricate values when information is absent from the source. Optional/nullable fields allow honest null responses, which is always preferable to plausible-looking fabricated data.
## Practice Scenario
Your extraction system uses tool_use with a strict JSON schema where all fields are required. Testers report the model invents plausible-looking dates and monetary amounts when processing documents that lack this information. What is the best fix?
Option AMake fields optional or nullable when source documents may not contain the information
Option BSwitch from tool_use to prompt-based JSON extraction, which gives more flexibility in the output
Option CAdd an instruction to the prompt telling the model that it must not hallucinate any values at all
Option DAdd a post-extraction validation step that checks all values against the source document
Check Answer
## Build Exercise
Build Exercise
#### Build a Structured Extraction Tool with JSON Schema
Difficulty
45 minutes
What you'll learn
  * Design JSON schemas with optional/nullable fields to prevent fabrication of missing data
  * Understand the three tool_choice modes (auto, any, forced) and when to use each
  * Recognise that tool_use eliminates syntax errors but not semantic errors
  * Apply schema design patterns: unclear enum values, other + detail string, format normalisation


  1. Define an extraction tool with a JSON schema: 3 required fields, 3 optional/nullable fields, an enum with unclear and other options, and a detail string field for the other category
Why: Schema design directly prevents fabrication. Required fields pressure the model to invent values when information is absent. Optional/nullable fields allow honest null responses. This is the root cause fix for hallucinated extraction data.
You should see: A valid JSON schema with required array containing only the 3 always-present fields, nullable type definitions for optional fields, and an enum array including unclear and other alongside the standard categories.
Stuck? Get a nudge
  2. Test with tool_choice auto and observe cases where the model returns text instead of calling the tool
Why: The exam tests the distinction between auto, any, and forced tool_choice. Auto allows the model to respond conversationally instead of calling a tool, which means no guaranteed structured output. You need to see this failure mode firsthand.
You should see: At least one response where the model returns a text message describing the document contents instead of calling the extraction tool. This demonstrates why auto is unsuitable when you need guaranteed structured output.
Stuck? Get a nudge
  3. Switch to tool_choice any and verify the model always returns structured output via a tool call
Why: tool_choice any guarantees a tool call while letting the model choose which tool. This is the correct setting for guaranteed structured output when the document type is unknown, a key exam distinction from auto.
You should see: Every response has stop_reason of tool_use and contains a valid tool call with structured output conforming to your schema. No text-only responses.
Stuck? Get a nudge
  4. Force a specific tool with tool_choice {type: tool, name: extract_metadata} and verify the mandatory extraction step runs
Why: Forced tool selection ensures a mandatory first step executes regardless of the model decision. The exam tests this for scenarios like metadata extraction that must run before enrichment steps.
You should see: The response always calls the exact tool you specified, even when the document content might suggest a different tool would be more appropriate. The model has no flexibility in tool selection.
Stuck? Get a nudge
  5. Process 5 documents — 3 with complete data and 2 with missing fields — and verify nullable fields return null rather than fabricated values
Why: This validates the most important schema design principle: optional/nullable fields prevent fabrication. The exam specifically tests the scenario where required fields pressure the model to invent plausible-looking data for absent information.
You should see: For the 3 complete documents, all fields populated with correct values. For the 2 documents missing information, the nullable fields return null instead of fabricated values. No invented dates, amounts, or identifiers.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.3](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Tool Use (Function Calling)](https://platform.claude.com/docs/en/build-with-claude/tool-use) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 4Task 4.4
# Validation, Retry, and Feedback Loops
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
Production extraction systems fail. Documents arrive in unexpected formats, numerical values don't add up, and fields end up in the wrong places. The question isn't whether failures happen but how your system responds. The validation-retry pattern turns those failures into self-correcting workflows.
### Retry-with-Error-Feedback
The correct retry pattern sends three pieces of information back to the model:
  1. **The original document** — so the model has the source to re-examine
  2. **The failed extraction** — so the model can see what it produced
  3. **The specific validation error** — so the model knows exactly what went wrong


typescriptCopy

```
// Retry with error feedback
const retryMessages = [
  {
    role: "user",
    content: `Original document:\n${originalDocument}\n\n` +
      `Your extraction:\n${JSON.stringify(failedExtraction)}\n\n` +
      `Validation error: Line items sum to £450 but stated_total is £500. ` +
      `Please re-extract, ensuring all line items are captured.`
  }
];

```

This beats a naive retry by a wide margin. Without the specific error, the model has no guidance for what to fix and usually reproduces the same mistake. With it, the model can target its self-correction: re-examining the document for missed line items, checking field placement, recalculating the total.
### The Retry Effectiveness Boundary
This is the concept the exam tests most aggressively in this task statement. Retries have a clear effectiveness boundary:
**Retries ARE effective for:**
  * Format mismatches (wrong date format, inconsistent currency notation)
  * Structural output errors (values in wrong fields, incorrect nesting)
  * Misplaced values (data that exists in the document but was extracted into the wrong field)
  * Mathematical errors (the model missed a line item affecting the total)


**Retries are NOT effective for:**
  * Information genuinely absent from the source document
  * Data that exists only in an external document not provided to the model
  * Fields requiring knowledge the model does not have


The exam presents both scenarios and expects you to identify which is fixable. If a document genuinely doesn't contain a department name, no amount of retrying will produce a correct value. Flag the extraction for human review, or return null if the schema allows it.
### Self-Correction Flow Design
Rather than relying solely on external validation logic, you can build self-correction into the extraction schema itself:
**calculated_total vs stated_total:** Extract both the sum the model calculates from individual line items and the total stated in the document. When these differ, you have an automatic discrepancy flag without external logic.
jsonCopy

```
{
  "line_items": [
    { "description": "Widget A", "amount": 150.00 },
    { "description": "Widget B", "amount": 300.00 }
  ],
  "calculated_total": 450.00,
  "stated_total": 500.00,
  "total_discrepancy": true
}

```

**conflict_detected booleans:** Add boolean fields that flag when the source document contains contradictory information. For example, if a document states "payment due: 30 days" in one section but "payment terms: net 60" in another, the model should extract both and set `conflict_detected: true` rather than silently picking one.
### detected_pattern Fields
For code review and analysis pipelines, add `detected_pattern` fields to structured findings. This tracks which specific code construct triggered each finding.
jsonCopy

```
{
  "finding": "Potential SQL injection vulnerability",
  "severity": "critical",
  "detected_pattern": "string concatenation in SQL query",
  "file": "user_service.py",
  "line": 42
}

```

When developers dismiss findings, you can analyse dismissal patterns by `detected_pattern`. If developers consistently dismiss findings triggered by "variable shadowing in nested scope," that pattern likely needs prompt refinement. This creates a systematic improvement loop: extract, validate, collect dismissal data, refine prompts, repeat.
### Schema Syntax Errors vs Semantic Validation Errors
The exam distinguishes between these two error categories:
**Schema syntax errors** — Malformed JSON, missing required fields, wrong data types. **Eliminated entirely** by `tool_use` with JSON schemas (covered in Task Statement 4.3).
**Semantic validation errors** — Correct JSON structure but incorrect values. Line items that do not sum, dates that precede each other incorrectly, values in wrong fields. These require **validation logic** outside the schema and are the focus of retry loops.
The overlap between these task statements is intentional. The exam tests whether you understand that `tool_use` solves the first category but not the second.
### Pydantic as the Validation Layer
The exam guide names Pydantic alongside JSON Schema in its hands-on exercise for this task statement: "when Pydantic or JSON schema validation fails, send a follow-up request including the document, the failed extraction, and the specific validation error." In a Python pipeline, Pydantic is the layer that turns "validation failed" into the specific, per-field error messages the retry loop needs.
A Pydantic model does two jobs at once. Parsing enforces structure — types, required fields, enums. Validators enforce semantics — the rules a JSON schema cannot express, like cross-field arithmetic or date ordering. Both failure kinds surface through one `ValidationError`, with machine-readable errors naming the field and the broken rule:
pythonCopy

```
import json
from pydantic import BaseModel, ValidationError, model_validator

class LineItem(BaseModel):
    description: str
    amount: float

class Invoice(BaseModel):
    line_items: list[LineItem]
    stated_total: float

    @model_validator(mode="after")
    def totals_must_match(self):
        calculated = round(sum(i.amount for i in self.line_items), 2)
        if abs(calculated - self.stated_total) > 0.01:
            raise ValueError(
                f"line items sum to {calculated} but stated_total is {self.stated_total}"
            )
        return self

try:
    invoice = Invoice.model_validate(tool_input)  # the tool_use input from the response
except ValidationError as e:
    errors = "\n".join(
        f"{'.'.join(map(str, err['loc'])) or 'invoice'}: {err['msg']}" for err in e.errors()
    )
    retry_message = (
        f"Original document:\n{original_document}\n\n"
        f"Your extraction:\n{json.dumps(tool_input)}\n\n"
        f"Validation errors:\n{errors}\n\n"
        f"Please re-extract, fixing the identified errors."
    )

```

The `except` branch is the retry-with-error-feedback pattern from the top of this lesson — Pydantic simply supplies the third ingredient (the specific error) in a form you can format straight into the prompt. The retry-effectiveness boundary applies unchanged: a validator that fails because information is absent from the source document still means human review, not a retry.
Current state: SDK-level parsing and strict tool use
As of July 2026, the Python SDK's `client.messages.parse(..., output_format=Invoice)` returns validated Pydantic instances via `parsed_output`, and `strict: true` on a tool definition guarantees schema-conformant inputs server-side ([Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)). Neither removes the semantic layer: the platform enforces the schema, your validators enforce the business rules, and the retry loop consumes whichever one fails.
Key Concept
Retry-with-error-feedback works by sending the original document, the failed extraction, and the specific validation error. Retries fix format and structural errors but cannot create information absent from the source document. Always identify whether a failure is fixable before retrying.
## Exam Traps
Exam Trap
Assuming retries always work for extraction failures
Retries fix format mismatches, structural errors, and misplaced values. They cannot produce information genuinely absent from the source document. The exam presents both fixable and unfixable scenarios — you must distinguish them.
Exam Trap
Implementing retries without including the specific validation error
Naive retries without error feedback produce the same mistakes. The model needs to see exactly what went wrong (e.g., 'line items sum to £450 but stated total is £500') to self-correct effectively.
Exam Trap
Relying on schema validation alone without semantic checks
Schema validation (via tool_use) catches syntax errors. Semantic errors — wrong sums, misplaced values, fabricated data — require validation logic and retry loops.
Exam Trap
Treating Pydantic as redundant once tool_use enforces a JSON schema
Schemas eliminate syntax errors but cannot express cross-field semantic rules — sums that must match, dates that must be ordered. Pydantic validators encode those rules and produce the specific, per-field error messages the retry loop feeds back to the model.
## Practice Scenario
Your extraction pipeline validates that line item amounts sum to the stated total. For Document A, the calculated sum is £450 but the stated total is £500. For Document B, the 'department' field is missing entirely from the source text. Which retry strategy is correct?
Option ARetry both documents with the validation errors, instructing the model to re-extract all fields
Option BSkip retries for both documents and flag them all for human review to ensure accuracy
Option CRetry Document A with the discrepancy error; flag Document B for human review since the information is absent from the source
Option DRetry both documents with the same prompt, since extraction is non-deterministic and may succeed on a second attempt
Check Answer
## Build Exercise
Build Exercise
#### Build a Validation-Retry Loop for Document Extraction
Difficulty
60 minutes
What you'll learn
  * Implement the retry-with-error-feedback pattern: original document + failed extraction + specific validation error
  * Distinguish fixable errors (format, structural, mathematical) from unfixable errors (absent information)
  * Design self-correction schemas with calculated_total vs stated_total and conflict_detected booleans
  * Build systematic improvement loops using detected_pattern fields and dismissal tracking
  * Understand the boundary between schema syntax errors (eliminated by tool_use) and semantic validation errors (require retry loops)


  1. Define an extraction tool with calculated_total and stated_total fields, a conflict_detected boolean, and detected_pattern fields for tracking which constructs trigger findings
Why: Self-correction fields like calculated_total vs stated_total enable automatic discrepancy detection without external logic. conflict_detected booleans and detected_pattern fields create the data foundation for systematic prompt improvement.
You should see: A JSON schema with separate calculated_total and stated_total number fields, a total_discrepancy boolean, a conflict_detected boolean, and a detected_pattern string field on each finding in the line_items array.
Stuck? Get a nudge
  2. Implement validation logic that checks: field completeness, numerical consistency (calculated sum matches stated total), enum validity, and date ordering
Why: Semantic validation catches errors that tool_use cannot. The exam distinguishes schema syntax errors (eliminated by tool_use) from semantic errors (wrong sums, misplaced values) that require validation logic and retry loops.
You should see: A validation function that returns an array of specific, actionable error messages. Each error should state what was expected versus what was found, not just that validation failed.
Stuck? Get a nudge
  3. Build the retry loop: on validation failure, construct a follow-up message containing the original document, the failed extraction, and the specific validation error
Why: Retry-with-error-feedback is dramatically more effective than naive retries. Without the specific error, the model has no guidance and typically reproduces the same mistake. With the error, the model can target its self-correction.
You should see: A retry message that includes all three elements: the original document text, the JSON of the failed extraction, and the specific validation error string. The model should produce a corrected extraction on retry.
Stuck? Get a nudge
  4. Test with 5 documents: 2 with fixable errors (misplaced values, wrong totals) and 3 with unfixable errors (absent information) — verify the loop retries only fixable cases
Why: The retry effectiveness boundary is the most aggressively tested concept in this task statement. Retries fix format mismatches and structural errors but cannot create information absent from the source. The exam presents both scenarios and expects you to identify which is fixable.
You should see: The 2 fixable documents succeed after 1-2 retries with corrected totals or field placements. The 3 unfixable documents are correctly identified as having absent information and flagged for human review rather than retried.
Stuck? Get a nudge
  5. Log detected_pattern data for each finding and analyse which patterns are most frequently dismissed to identify prompt refinement priorities
Why: detected_pattern fields create a systematic improvement loop. When developers consistently dismiss findings triggered by a specific pattern, that pattern likely needs prompt refinement. This turns dismissal data into actionable prompt improvement priorities.
You should see: A log or table showing each detected_pattern, its frequency, its dismissal rate, and a prioritised list of patterns needing prompt refinement. Patterns with high dismissal rates should be at the top.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.4](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Tool Use (Function Calling)](https://platform.claude.com/docs/en/build-with-claude/tool-use) — Anthropic
  * [Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — Anthropic
  * [Pydantic documentation](https://docs.pydantic.dev/latest/) — Pydantic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 4Task 4.5
# Batch Processing Strategies
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
The Message Batches API is a cost optimisation tool with hard constraints that the exam tests directly. Understanding when to use it — and when not to — is the core of this task statement.
### Message Batches API: The Facts
The constraints are fixed, and you have to design around them:
  * **50% cost savings** compared to synchronous API calls
  * **Up to 24-hour processing window** — results may arrive in minutes or take up to 24 hours
  * **No guaranteed latency SLA** — you cannot rely on results arriving within any specific timeframe
  * **No multi-turn tool calling** within a single batch request — the model cannot execute tools mid-request and use the results to continue processing
  * **`custom_id`fields** for correlating request/response pairs — each request in a batch gets a unique identifier used to match it with its response


### The Matching Rule
This is the single most tested concept from this task statement:
**Synchronous API:** For blocking workflows where someone or something is waiting for the result. Pre-merge checks in CI/CD, real-time code review feedback, any workflow where developers are blocked pending completion.
**Batch API:** For latency-tolerant workflows where results are consumed later. Overnight technical debt reports, weekly code audit summaries, nightly test generation runs, batch document extraction.
The exam specifically presents a scenario (Question 11 in the sample questions) where a manager proposes switching everything to batch processing for the cost savings. The correct answer keeps blocking workflows synchronous and only moves latency-tolerant workflows to batch.
typescriptCopy

```
// Synchronous — developer is waiting for this
const preMergeReview = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 4096,
  messages: [{ role: "user", content: prDiffContent }]
});

// Batch — results consumed tomorrow morning
const batchRequest = await client.messages.batches.create({
  requests: technicalDebtDocuments.map((doc, i) => ({
    custom_id: `debt-report-${i}`,
    params: {
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: doc }]
    }
  }))
});

```

### SLA Calculation
When designing batch processing schedules, you must account for the 24-hour maximum processing window. If your organisation requires a 30-hour SLA for a report:
  * The 24 hours is a **maximum window, not a delivery guarantee**. A batch that does not finish inside it comes back `expired`, so size the schedule against that worst case and treat an expired batch as a resubmission
  * 30 hours total SLA minus the 24-hour worst case = 6 hours of buffer for collecting requests, validating inputs, or absorbing operational delays
  * Submit batches every **4 hours** within that buffer window so a fresh batch is always in flight. A 6-hour cadence leaves no margin at all


The exam may present a scheduling question where you need to work backwards from the SLA to determine submission frequency.
### Batch Failure Handling
Not all documents in a batch succeed. The correct failure handling pattern has three steps:
**1. Identify failures by`custom_id`.** Each request has a unique identifier. Parse the batch results to find which `custom_id` values failed.
**2. Resubmit only failures with modifications.** Do not resubmit the entire batch. Common modifications include:
  * Chunking oversized documents that exceeded context limits
  * Simplifying extraction prompts for documents with unusual structures
  * Adding format-specific few-shot examples for documents that failed due to structural variety


**3. Refine prompts on a sample set BEFORE batch processing.** This is the proactive step that maximises first-pass success and reduces resubmission costs. Test your prompts against a representative sample (5-10 documents covering the range of formats and edge cases) before processing the full batch.
typescriptCopy

```
// Poll until the batch has finished before reading results
let batch = await client.messages.batches.retrieve(batchId);
while (batch.processing_status !== "ended") {
  await new Promise(r => setTimeout(r, 60_000));
  batch = await client.messages.batches.retrieve(batchId);
}

// results() returns a JSONL async iterable, not an array — accumulate it.
// Treat `expired` as a failure too: that is what an overrun batch returns.
const failedIds: string[] = [];
for await (const result of client.messages.batches.results(batchId)) {
  if (result.result.type === "errored" || result.result.type === "expired") {
    failedIds.push(result.custom_id);
  }
}

// Resubmit only failures with modifications
const retryRequests = failedIds.map(id => {
  const originalDoc = documentsById[id];
  return {
    custom_id: `${id}-retry-1`,
    params: {
      model: "claude-sonnet-5",
      max_tokens: 8192,  // increased for oversized docs
      messages: [{
        role: "user",
        content: chunkIfNeeded(originalDoc)
      }]
    }
  };
});

```

### Multi-Turn Tool Calling Limitation
The batch API doesn't support multi-turn tool calling within a single request. This means you cannot:
  * Define tools and have the model call them mid-request
  * Process tool results and continue the conversation within the same batch item
  * Run agentic loops within a single batch request


If your workflow requires tool execution mid-processing, you must use the synchronous API. This limitation is a direct exam test point — if a scenario describes a batch workflow that needs to call external tools during processing, the correct answer is to use the synchronous API for that step.
Current state
Exam guide v1.0 states the limitation exactly as above, and that is the keyed answer. Anthropic's [batch processing docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing) (checked September 2026) now split it by tool type. Server tools (web search, web fetch, code execution, MCP connectors, tool search) run the same server-side agentic loop inside a batch request as they do synchronously, and a batch result can come back with `stop_reason: "pause_turn"` for you to continue in a follow-up request. Client tools, the ones your own code executes, still cannot complete a loop inside a batch item: the request ends at `tool_use`, you run the tool after retrieving the result, then submit a follow-up request. When a question names a tool your own code runs (an internal lookup, a database query), the guide's rule and the current docs give the same answer. On the exam, answer per the guide: no multi-turn tool calling in a batch request, so a step that needs tool execution mid-processing runs on the synchronous API.
Key Concept
The Message Batches API provides 50% cost savings with an up to 24-hour processing window and no latency SLA. Use it only for latency-tolerant workflows (overnight reports, weekly audits). Blocking workflows (pre-merge checks) must remain synchronous. Always refine prompts on a sample set before submitting large batches.
### Prompt Optimisation Before Batch Submission
The most cost-effective batch processing strategy is to invest time in prompt refinement before submitting large volumes:
  1. **Sample set testing:** Take 5-10 representative documents covering the range of formats, edge cases, and document types in your batch
  2. **Iterate on the sample:** Refine your extraction prompts, add few-shot examples, adjust schema design until the sample set achieves high accuracy
  3. **Submit the full batch:** With refined prompts, your first-pass success rate will be significantly higher
  4. **Handle failures:** Resubmit only the failed documents with targeted modifications


This workflow slashes total cost. A 90% first-pass success rate on 1,000 documents means only 100 retries. A 60% first-pass rate means 400 retries, four times the resubmission cost, plus the batch processing cost for those retries.
## Exam Traps
Exam Trap
Switching all workflows to batch processing for cost savings
Blocking workflows where developers wait for results (pre-merge checks, real-time reviews) must remain synchronous. The batch API has no guaranteed latency SLA and can take up to 24 hours. Only latency-tolerant workflows should use batch.
Exam Trap
Assuming batch results arrive quickly because they often do
The batch API has no latency SLA. Results often arrive faster than 24 hours, but you cannot design blocking workflows around best-case timing. Design around the 24-hour maximum.
Exam Trap
Using batch API for workflows requiring multi-turn tool calling
The batch API does not support multi-turn tool calling within a single request. If your workflow needs to execute tools and use results mid-processing, you must use the synchronous API.
## Practice Scenario
Your team wants to reduce API costs for automated analysis. You have two workflows: (1) a blocking pre-merge check that must complete before developers merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for 50% cost savings. How should you evaluate this proposal?
Option AUse batch processing for the technical debt reports only; keep real-time calls for pre-merge checks
Option BSwitch both workflows to batch processing, with a timeout fallback to real-time if the batch takes too long
Option CKeep real-time calls for both workflows to avoid batch result ordering issues
Option DSwitch both to batch processing with status polling to check for completion
Check Answer
## Build Exercise
Build Exercise
#### Design a Batch Processing Strategy
Difficulty
45 minutes
What you'll learn
  * Classify workflows as blocking (synchronous) or latency-tolerant (batch-eligible) based on latency requirements
  * Use the Message Batches API with custom_id fields for request-response correlation
  * Implement failure handling that resubmits only failed documents with targeted modifications
  * Calculate batch submission frequency against SLA constraints accounting for the 24-hour processing window
  * Apply the prompt refinement workflow: sample set testing before full batch submission


  1. List 5 workflows in a hypothetical organisation and categorise each as blocking (synchronous) or latency-tolerant (batch-eligible) with justification
Why: The matching rule between synchronous and batch API is the most tested concept in this task statement. The exam presents a scenario where a manager proposes switching everything to batch for cost savings, and you must identify which workflows cannot tolerate the 24-hour processing window.
You should see: A table with 5 workflows, each clearly categorised with justification. Blocking workflows have someone or something waiting for the result. Batch-eligible workflows consume results later with no real-time dependency.
Stuck? Get a nudge
  2. Define a batch submission for 20 documents using the Message Batches API format with unique custom_id fields for each document
Why: custom_id fields are the mechanism for correlating request-response pairs in batch results. Without unique identifiers, you cannot determine which documents succeeded or failed, making failure handling impossible.
You should see: A valid batch request object with 20 entries, each containing a unique custom_id, model specification, max_tokens, and a messages array with the document content.
Stuck? Get a nudge
  3. Implement failure handling: parse batch results, identify failures by custom_id, and construct a retry batch containing only failed documents with increased max_tokens
Why: Resubmitting only failures with targeted modifications is the correct batch failure pattern. Resubmitting the entire batch wastes cost on already-successful documents. The exam tests that you understand custom_id correlation and targeted retry.
You should see: A failure handler that filters results by error status, extracts the custom_id values of failures, looks up the original documents, and creates a retry batch with modifications like increased max_tokens or chunked content.
Stuck? Get a nudge
  4. Calculate the batch submission frequency needed to guarantee a 30-hour SLA given the 24-hour maximum processing window
Why: SLA calculation with the 24-hour batch processing window is a direct exam test point. You must work backwards from the SLA deadline to determine when to submit, accounting for the maximum processing time plus a safety margin.
You should see: A calculation showing: 30-hour SLA minus 24-hour maximum processing window equals 6 hours of buffer. The latest safe submission is 24 hours before the deadline, with batches submitted every 4 hours so a fresh batch is always in flight.
Stuck? Get a nudge
  5. Create a 5-document sample set and refine extraction prompts iteratively before submitting the full batch of 20 documents
Why: Prompt refinement on a sample set before batch submission is the most cost-effective batch processing strategy. A 90% first-pass success rate means 2 retries on 20 documents. A 60% first-pass rate means 8 retries, four times the resubmission cost.
You should see: A sample set covering the range of document types and edge cases, 2-3 prompt iterations improving accuracy on the sample, and then the full batch submission achieving a high first-pass success rate.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.5](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic


---


Domain 4Task 4.6
# Multi-Instance and Multi-Pass Review
Learn this interactively|Concept Check|Exam Sim|Build Coach
## What You Need to Know
When Claude reviews its own output, it starts at a disadvantage: it still carries the reasoning it used to generate that output. The model remembers why it made each decision and is less likely to question it. That's not a bug. It's just how self-review works inside a single session. The job is to design around it.
### The Self-Review Limitation
A model reviewing its own output in the same conversation session retains its original reasoning chain. It already "knows" why it chose each approach, classified each finding at a particular severity, or selected certain values. When asked to review, it tends to confirm rather than challenge those decisions.
An **independent instance** — a separate Claude invocation without the prior reasoning context — approaches the output fresh. It judges the code, findings, or extraction on what it sees alone, without the bias of "I chose this because..." That's what makes independent review so much better at catching subtle issues.
The exam tests this directly. When presented with options for improving review quality, the correct answer involves using a separate model instance, not adding "please review carefully" instructions to the same session or relying on extended thinking within the generating session.
typescriptCopy

```
// Anti-pattern: self-review in the same session
const generation = await client.messages.create({
  messages: [
    { role: "user", content: "Write a function to process orders" },
    { role: "assistant", content: generatedCode },
    { role: "user", content: "Now review your code for bugs" }
    // Model retains its reasoning — less likely to find its own mistakes
  ]
});

// Correct: independent review instance
const review = await client.messages.create({
  messages: [
    {
      role: "user",
      content: `Review this code for bugs, security issues, and edge cases:\n\n${generatedCode}`
    }
    // Fresh instance — no prior reasoning context
  ]
});

```

### Multi-Pass Review Architecture
Large reviews (multi-file PRs, complex extraction pipelines, broad code audits) suffer from **attention dilution** when processed in a single pass. The symptoms are specific and recognisable:
  * Detailed feedback on some files, superficial comments on others
  * Obvious bugs missed in the middle of the review
  * Contradictory findings — flagging a pattern as problematic in one file while approving identical code elsewhere


The fix is to split the review into focused passes:
**Pass 1: Per-file local analysis.** Analyse each file individually with a focused review prompt. This ensures consistent depth across all files. Each invocation examines only one file, so the model gives it full attention.
**Pass 2: Cross-file integration.** After all per-file analyses are complete, run a separate pass that receives all per-file findings and checks for cross-file issues: data flow between modules, consistent API usage across services, dependency conflicts, and contradictions in the per-file findings themselves.
typescriptCopy

```
// Pass 1: Per-file analysis
const perFileFindings = await Promise.all(
  files.map(file =>
    client.messages.create({
      messages: [{
        role: "user",
        content: `Review this file for local issues (bugs, security, logic errors):\n\n${file.content}`
      }]
    })
  )
);

// Pass 2: Cross-file integration
const integrationReview = await client.messages.create({
  messages: [{
    role: "user",
    content: `Given these per-file findings, identify cross-file issues:\n` +
      `- Data flow inconsistencies between modules\n` +
      `- Contradictory patterns flagged in different files\n` +
      `- API contract violations across service boundaries\n\n` +
      `Findings:\n${JSON.stringify(perFileFindings)}`
  }]
});

```

This architecture directly addresses the three symptoms of attention dilution. Per-file passes ensure consistent depth. The integration pass catches cross-file issues that no single-file review would identify. And the separation prevents contradictory findings from appearing in the same output.
### Why Larger Context Windows Do Not Fix This
The exam includes a specific distractor: "switch to a higher-tier model with a larger context window." This sounds reasonable — if the model can't handle 14 files at once, give it more capacity. But the problem isn't context size. It's attention quality. A bigger context window won't stop the model from spreading its attention unevenly across files. Only focused, per-file passes ensure consistent depth.
### Confidence-Based Routing
For findings that are uncertain, the model can self-report confidence alongside each finding. This enables a routing strategy:
  * **High confidence findings:** Report directly to developers
  * **Low confidence findings:** Route to human review for validation
  * **Threshold calibration:** Use labelled validation sets to calibrate what confidence score correlates with actual accuracy


jsonCopy

```
{
  "finding": "Potential race condition in order processing",
  "severity": "major",
  "confidence": 0.65,
  "reasoning": "The lock acquisition pattern appears correct but the unlock timing depends on an async callback whose ordering I cannot fully verify.",
  "route": "human_review"
}

```

The confidence score isn't self-reported accuracy. It's the model's read on its own certainty. Calibrate it by running labelled examples (where you already know the answer) through the system and measuring how reported confidence tracks actual accuracy. Then adjust routing thresholds from that data.
The exam distinguishes between raw confidence scores (uncalibrated, unreliable for automated decisions) and calibrated confidence thresholds (validated against labelled sets, suitable for routing). Using uncalibrated confidence for automated decisions is an anti-pattern.
Key Concept
A model reviewing its own output in the same session retains reasoning context and is less likely to question its decisions. Use independent instances for review. Split large reviews into per-file local passes plus a cross-file integration pass to prevent attention dilution. Calibrate confidence thresholds using labelled validation sets before using them for routing.
### Putting It All Together
A production review architecture combines all three concepts:
  1. **Generation:** First instance generates code, extraction, or analysis
  2. **Per-file review:** Independent instances review each output unit individually
  3. **Integration review:** Separate instance checks cross-unit consistency
  4. **Confidence routing:** Low-confidence findings go to human review
  5. **Calibration loop:** Labelled validation sets continuously calibrate confidence thresholds


This architecture is more expensive than single-pass review. The trade-off is worth it when review quality directly affects production reliability — CI/CD pipelines, financial extraction, compliance analysis, and any system where missed issues have downstream consequences.
## Exam Traps
Exam Trap
Choosing self-review in the same session as a viable review strategy
The model retains its reasoning context from generation and is less likely to question its own decisions. An independent instance without prior context is significantly more effective at catching subtle issues.
Exam Trap
Using a single pass for large multi-file reviews
Single-pass multi-file reviews produce inconsistent depth, miss bugs, and generate contradictory findings due to attention dilution. Split into per-file local passes plus a cross-file integration pass.
Exam Trap
Switching to a larger context window model to fix attention dilution
Larger context windows do not solve attention quality issues. The model can hold more text but still gives uneven attention across files. Focused per-file passes are the correct fix.
Exam Trap
Using uncalibrated confidence scores for automated review routing
Raw self-reported confidence is poorly calibrated. Calibrate thresholds using labelled validation sets before relying on confidence for routing decisions.
## Practice Scenario
A pull request modifying 14 files receives inconsistent review: detailed feedback on some files, superficial comments on others, obvious bugs missed, and contradictory findings — the same pattern is flagged as problematic in one file but approved in another. How should you restructure the review?
Option ASwitch to a higher-tier model with a much larger context window so that all 14 files receive adequate attention within a single review pass
Option BSplit into per-file local analysis passes for consistent depth, then run a separate cross-file integration pass for data flow issues
Option CRun three independent review passes over the full PR and only flag those issues that at least two of the three separate runs agree on
Option DRequire developers to split large pull requests into smaller submissions of 3-4 files before the automated review runs
Check Answer
## Build Exercise
Build Exercise
#### Build a Multi-Pass Code Review System
Difficulty
60 minutes
What you'll learn
  * Understand why self-review in the same session retains reasoning context and is less effective than independent review
  * Design multi-pass review architectures with per-file local analysis and cross-file integration passes
  * Identify and mitigate attention dilution in large multi-file reviews
  * Implement confidence-based routing with calibrated thresholds from labelled validation sets
  * Distinguish uncalibrated raw confidence from calibrated thresholds suitable for automated routing


  1. Create a single-pass review prompt and run it against a 10-file mock PR — document instances of inconsistent depth, missed issues, and contradictory findings
Why: Establishing the single-pass baseline demonstrates the three symptoms of attention dilution: inconsistent depth across files, missed bugs in the middle of the review, and contradictory findings flagging the same pattern differently in different files.
You should see: Detailed feedback on some files (typically first and last) but superficial comments on others, at least one obvious bug missed in a middle file, and at least one contradictory finding where the same code pattern is flagged as problematic in one file but approved in another.
Stuck? Get a nudge
  2. Implement per-file local analysis: iterate over each file with a focused review prompt that examines only that file for bugs, security issues, and logic errors
Why: Per-file analysis ensures every file receives consistent, focused attention. Each invocation examines only one file, eliminating the attention dilution that causes inconsistent depth and missed bugs in single-pass reviews.
You should see: Consistent review depth across all 10 files. Bugs that were missed in the single-pass review should now be caught, especially those in the middle files. Each review should be focused and thorough.
Stuck? Get a nudge
  3. Implement a cross-file integration pass: feed all per-file findings into a separate prompt that checks for data flow inconsistencies, contradictory findings across files, and API contract violations
Why: Per-file analysis catches local issues but misses cross-file concerns: data flow between modules, consistent API usage, and contradictions in per-file findings. The integration pass is a separate invocation that receives all findings and checks for systemic issues.
You should see: A synthesis output identifying cross-file issues that no single-file review could catch: data passed between modules in incompatible formats, contradictory findings from per-file reviews, and API contracts violated across service boundaries.
Stuck? Get a nudge
  4. Add confidence scoring to each finding (0.0-1.0) and implement routing: high confidence findings go directly to the developer, low confidence findings go to a human review queue
Why: Confidence-based routing directs limited human reviewer attention to the findings that need it most. The exam distinguishes raw uncalibrated confidence from calibrated thresholds validated against labelled sets.
You should see: Each finding annotated with a confidence score, reasoning for the score, and a routing decision (direct_report or human_review). The routing threshold should separate clear-cut findings from uncertain ones.
Stuck? Get a nudge
  5. Use a separate Claude instance (fresh session, no prior context) to review a subset of the generated findings and compare its assessment to the original confidence scores for calibration
Why: Independent review instances approach output fresh without the bias of I chose this because reasoning. This step calibrates confidence thresholds by comparing self-reported confidence against independent assessment, the method the exam identifies as the correct approach.
You should see: A calibration dataset showing the relationship between reported confidence scores and independent verification results. Some high-confidence findings may be overturned, revealing calibration gaps that adjust your routing thresholds.
Stuck? Get a nudge


## Sources
  * [Claude Certified Architect Foundations Exam Guide — Task Statement 4.6](https://anthropic-partners.skilljar.com/page/partner-certifications) — Anthropic
  * [Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) — Anthropic
  * [Building with Claude API (Skilljar)](https://anthropic.skilljar.com/claude-with-the-anthropic-api) — Anthropic