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
[Learn](https://claudecertificationguide.com/learn)/[Prompt Engineering & Structured Output](https://claudecertificationguide.com/learn/4-prompt-engineering)/4.4
Domain 4Task 4.4
Mark Complete
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


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=4)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-4)
Mark Complete
[Previous LessonStructured Output with Tool Use](https://claudecertificationguide.com/learn/4-prompt-engineering/4-3-structured-output)[Next LessonBatch Processing Strategies](https://claudecertificationguide.com/learn/4-prompt-engineering/4-5-batch-processing)
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
