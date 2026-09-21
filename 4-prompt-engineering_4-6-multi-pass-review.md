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
[Learn](https://claudecertificationguide.com/learn)/[Prompt Engineering & Structured Output](https://claudecertificationguide.com/learn/4-prompt-engineering)/4.6
Domain 4Task 4.6
Mark Complete
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


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=4)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-4)
Mark Complete
[Previous LessonBatch Processing Strategies](https://claudecertificationguide.com/learn/4-prompt-engineering/4-5-batch-processing)[Next LessonContext Window Management](https://claudecertificationguide.com/learn/5-context-management/5-1-context-window-management)
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
