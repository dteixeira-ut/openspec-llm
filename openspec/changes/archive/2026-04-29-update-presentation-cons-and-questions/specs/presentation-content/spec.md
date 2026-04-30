## MODIFIED Requirements

### Requirement: Slide 10 — Cons
This slide SHALL present the honest limitations and costs of the workflow.

**On screen:**
- Headline: "What We're Not Sure About"
- Bullets:
  - Overhead for small or urgent changes — not every fix needs the full workflow
  - Specs can drift from code at any stage — imprecise specs require mid-implementation fixes, and refinements before or after archive may not flow back into the spec library
  - Specs are substantially more verbose than the resulting code — difficult to review thoroughly without AI assistance
  - Even well-scoped changes may need code refinement post-generation — "it works" is not the same as "it works well"
  - Requires strong guardrails, code pattern guidelines, and feedback loops to maintain output quality over time
  - LLM outputs still need careful human review — trust but verify
  - Workflow has a learning curve; team buy-in required
  - Tooling is early-stage — rough edges exist

#### Scenario: Cons slide matches storyboard
- **WHEN** the user advances to the cons slide
- **THEN** the headline "What We're Not Sure About" and all eight bullet points are displayed

### Requirement: Slide 11 — Open Questions
This slide SHALL surface unresolved questions framed to invite discussion.

**On screen:**
- Headline: "Open Questions"
- Questions (numbered list):
  1. How do we keep specs in sync as code evolves post-archive?
  2. Who owns the spec review process — and what does approval look like?
  3. What's the right scope for a "change"? One PR? One epic?
  4. How do we handle hotfixes and urgent work that can't follow the full workflow?
  5. How do we measure whether this is actually improving velocity or quality?
  6. How do we maintain a healthy codebase instead of slop?
  7. What will code reviews look like?
  8. What should the limit on a commit be — do we go by tasks implemented?
  9. What will the end-to-end development flow look like?
     - **Propose:** How can we efficiently review specs before apply without becoming a bottleneck?
     - **Apply:** How can we efficiently auto-validate as much as possible? Can we include an [adversarial code-review](https://asdlc.io/patterns/adversarial-code-review/) step?
     - **Validation:** Human validation → refinement → archive — what is the correct approach? (e.g. after a PR comment, via `/opsx:refine`)
  10. Should we add branch protection rules to block unarchived changes from merging to main?
  11. (Hypothetical) How do we resolve git merge conflicts on spec archives when two changes modify the same capability?

**Note:** Question 9 has three phase-labeled sub-items (Propose / Apply / Validation). The rendering component SHALL support sub-items under a numbered question, displayed as indented bullets beneath the parent question.

#### Scenario: Open questions slide matches storyboard
- **WHEN** the user advances to the open questions slide
- **THEN** the headline and all eleven questions are displayed, with question 9 showing its three phase-labeled sub-items

<!-- Refined: original sub-item lacked a concrete example of when validation triggers refinement; clarified with "after a PR comment" example. -->

#### Scenario: Adversarial code review link is clickable
- **WHEN** the user clicks the adversarial code review link in question 9
- **THEN** it opens in a new browser tab
