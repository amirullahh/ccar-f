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
[Learn](https://claudecertificationguide.com/learn)/[Claude Code Configuration & Workflows](https://claudecertificationguide.com/learn/3-claude-code-config)/3.5
Domain 3Task 3.5
Mark Complete
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


[Drill This Domain](https://claudecertificationguide.com/learn/drill?domain=3)[Quick Reference](https://claudecertificationguide.com/learn/quick-reference/domain-3)
Mark Complete
[Previous LessonPlan Mode vs Direct Execution](https://claudecertificationguide.com/learn/3-claude-code-config/3-4-plan-mode-execution)[Next LessonCI/CD Integration](https://claudecertificationguide.com/learn/3-claude-code-config/3-6-cicd-integration)
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
