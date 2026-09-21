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
[Learn](https://claudecertificationguide.com/learn)/[Prompt Engineering & Structured Output](https://claudecertificationguide.com/learn/4-prompt-engineering)/4.3
Domain 4Task 4.3
Mark Complete
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


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=4)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-4)
Mark Complete
[Previous LessonFew-Shot Prompting](https://claudecertificationguide.com/learn/4-prompt-engineering/4-2-few-shot-prompting)[Next LessonValidation, Retry, and Feedback Loops](https://claudecertificationguide.com/learn/4-prompt-engineering/4-4-validation-retry-loops)
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
