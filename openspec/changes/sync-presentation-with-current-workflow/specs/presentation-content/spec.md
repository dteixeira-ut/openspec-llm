## RENAMED Requirements

- FROM: `### Requirement: Slide 1 — Title`
  TO: `### Requirement: Title slide`

- FROM: `### Requirement: Slide 2 — The Problem`
  TO: `### Requirement: Problem slide`

- FROM: `### Requirement: Slide 3 — Spec-Driven Development`
  TO: `### Requirement: Spec-driven development slide`

- FROM: `### Requirement: Slide 4 — Enter OpenSpec`
  TO: `### Requirement: Enter OpenSpec slide`

- FROM: `### Requirement: Slide 5 — /opsx:propose`
  TO: `### Requirement: Propose skill slide`

- FROM: `### Requirement: Slide 6 — /opsx:explore`
  TO: `### Requirement: Explore skill slide`

- FROM: `### Requirement: Slide 7 — /opsx:apply`
  TO: `### Requirement: Apply skill slide`

- FROM: `### Requirement: Slide 8 — /opsx:archive`
  TO: `### Requirement: Archive skill slide`

- FROM: `### Requirement: Slide 9 — Pros`
  TO: `### Requirement: Pros slide`

- FROM: `### Requirement: Slide 10 — Cons`
  TO: `### Requirement: Cons slide`

- FROM: `### Requirement: Slide 11 — Open Questions`
  TO: `### Requirement: Open questions slide`

- FROM: `### Requirement: Slide 12 — Resources`
  TO: `### Requirement: Resources slide`

## MODIFIED Requirements

### Requirement: Enter OpenSpec slide
This slide SHALL introduce OpenSpec as a CLI plus a set of Claude Code skills covering the full development lifecycle, plus CI automation that closes the loop.

**On screen:**
- Headline: "Enter OpenSpec"
- Subheadline: "A CLI + Claude Code skills covering the full lifecycle, plus CI automation that closes the loop"
- Bullets:
  - Installs as a CLI tool and a set of slash-command skills for Claude Code
  - Each skill gives Claude the right context and instructions for that moment
  - You stay in the chat — no terminal context-switching mid-thought
- Code block: a three-line lifecycle map showing skills grouped by phase

```
Plan         /opsx:propose   /opsx:explore   /opsx:suggest
Build        /opsx:apply     /opsx:refine    /opsx:review
Ship/Close   /opsx:pr        /opsx:archive   /opsx:summarize
```

#### Scenario: Enter OpenSpec slide matches storyboard
- **WHEN** the user advances to the Enter OpenSpec slide
- **THEN** the slide displays the headline, subheadline, all three bullets, and the lifecycle code block grouped by phase

### Requirement: Propose skill slide
This slide SHALL walk through the propose skill showing what the user does and what Claude produces.

**On screen:**
- Headline: "/opsx:propose"
- Subheadline: "Turn an idea into a fully-specified change in one conversation"
- Bullets:
  - You describe what you want to build — in plain language, no structure required
  - Claude asks clarifying questions, then creates all planning artifacts in sequence
  - Output: proposal.md (why) → design.md (how) → specs (what) → tasks.md (checklist)
  - Each artifact feeds the next — context accumulates as Claude works through them
- Code block: `/opsx:propose add-user-authentication`

#### Scenario: Propose skill slide matches storyboard
- **WHEN** the user advances to the propose skill slide
- **THEN** the headline "/opsx:propose", subheadline, all four bullets, and the code block are displayed

### Requirement: Explore skill slide
This slide SHALL explain the explore skill as a free-form thinking-partner mode.

**On screen:**
- Headline: "/opsx:explore"
- Subheadline: "A thinking-partner mode for before — or during — a change"
- Bullets:
  - No code written, no artifacts created unless you ask — just structured thinking
  - Claude investigates the codebase, maps architecture, surfaces hidden complexity
  - Compares options, draws diagrams, challenges assumptions
  - When insights crystallize, offers to capture them into the right artifact

#### Scenario: Explore skill slide matches storyboard
- **WHEN** the user advances to the explore skill slide
- **THEN** the headline "/opsx:explore", subheadline, and all four bullets are displayed

### Requirement: Apply skill slide
This slide SHALL show how the apply skill uses accumulated context to implement work methodically.

**On screen:**
- Headline: "/opsx:apply"
- Subheadline: "Implement with full context — not a blank chat window"
- Bullets:
  - Claude reads proposal, design, specs, and tasks before writing a single line
  - Works through the task checklist one item at a time
  - Marks each task done as it goes; pauses on blockers or ambiguity
  - Can be run multiple times — picks up where it left off
- Code block: `/opsx:apply`

#### Scenario: Apply skill slide matches storyboard
- **WHEN** the user advances to the apply skill slide
- **THEN** the headline "/opsx:apply", subheadline, all four bullets, and the code block are displayed

### Requirement: Archive skill slide
This slide SHALL explain the archive skill as the step that makes the workflow compound in value over time.

**On screen:**
- Headline: "/opsx:archive"
- Subheadline: "Close the loop — make this change context for the next one"
- Bullets:
  - Reviews artifact and task completion; warns if anything is incomplete
  - Syncs delta specs into the main spec library at openspec/specs/
  - Moves the change to an archive folder with a datestamp
  - Future changes can read these specs — your decisions compound over time
- Code block: `/opsx:archive`

#### Scenario: Archive skill slide matches storyboard
- **WHEN** the user advances to the archive skill slide
- **THEN** the headline "/opsx:archive", subheadline, all four bullets, and the code block are displayed

### Requirement: Open questions slide
This slide SHALL surface unresolved questions framed to invite discussion. Items that have been partially answered by workflow additions SHALL be reframed to acknowledge what is now covered AND what is still open, rather than removed.

**On screen:**
- Headline: "Open Questions"
- Questions (numbered list):
  1. **How do we keep specs in sync as code evolves post-archive?** *Partially answered: the spec drift monitor runs on merge to main and opens a GitHub issue when it detects drift. Open: who owns fixing flagged drift, and on what SLA?*
  2. Who owns the spec review process — and what does approval look like?
  3. What's the right scope for a "change"? One PR? One epic?
  4. How do we handle hotfixes and urgent work that can't follow the full workflow?
  5. How do we measure whether this is actually improving velocity or quality?
  6. How do we maintain a healthy codebase instead of slop?
  7. **What will code reviews look like?** *Partially answered: the code-review subagent gate runs after every implementation, and `/opsx:pr` posts an AI reviewer comment on the PR. Open: how adversarial should the AI review go, and where do humans still own the call?*
  8. What should the limit on a commit be — do we go by tasks implemented?
  9. What will the end-to-end development flow look like?
     - **Propose:** *Partially answered: `/opsx:suggest` surfaces risks, gaps, and improvements before apply. Open: when does suggest suffice and when is human spec review still required?*
     - **Apply:** How can we efficiently auto-validate as much as possible? Can we include an [adversarial code-review](https://asdlc.io/patterns/adversarial-code-review/) step?
     - **Validation:** Human validation → refinement → archive — what is the correct approach? (e.g. after a PR comment, via `/opsx:refine`)
  10. Should we add branch protection rules to block unarchived changes from merging to main?
  11. (Hypothetical) How do we resolve git merge conflicts on spec archives when two changes modify the same capability?

**Note:** Question 9 has three phase-labeled sub-items (Propose / Apply / Validation). The rendering component SHALL support sub-items under a numbered question, displayed as indented bullets beneath the parent question.

#### Scenario: Open questions slide matches storyboard
- **WHEN** the user advances to the open questions slide
- **THEN** the headline and all eleven questions are displayed, with question 9 showing its three phase-labeled sub-items, and questions 1, 7, and 9.Propose displaying the partial-answer reframing

#### Scenario: Adversarial code review link is clickable
- **WHEN** the user clicks the adversarial code review link in question 9
- **THEN** it opens in a new browser tab

### Requirement: Resources slide
The final slide SHALL list curated resources organized by category and SHALL reinforce the dogfooding claim by referencing the workflow phases this deck itself went through.

**On screen:**
- Headline: "Resources"
- Section: "OpenSpec" — OpenSpec GitHub repository
- Section: "Spec-Driven Development" — at least two references
- Section: "Claude + Anthropic" — Anthropic API docs and Claude Code page
- Footer note: "Built using the workflow it describes — including this update, which went propose → apply → review → archive → pr."

#### Scenario: Resources slide is the last slide
- **WHEN** the user advances to the final slide
- **THEN** it is the resources slide and the Next button is disabled

#### Scenario: Resources slide matches storyboard
- **WHEN** the user reaches the resources slide
- **THEN** the headline, all three resource sections, and the dogfooding footer note are displayed

#### Scenario: All resource links open in a new tab
- **WHEN** the user clicks any link on the resources slide
- **THEN** it opens in a new browser tab with `target="_blank"` and `rel="noopener noreferrer"`

## ADDED Requirements

### Requirement: Slide ordering
The deck SHALL present slides in this order, grouped into a problem-framing intro, three lifecycle phases (Plan, Build, Ship & Close), a CI-automation slide, and a closing reflection:

1. Title slide
2. Problem slide
3. Spec-driven development slide
4. Enter OpenSpec slide
5. Plan phase divider slide
6. Propose skill slide
7. Explore skill slide
8. Suggest skill slide
9. Build phase divider slide
10. Apply skill slide
11. Refine skill slide
12. Review skill slide
13. Ship & Close phase divider slide
14. PR skill slide
15. Archive skill slide
16. Summarize skill slide
17. Closing the loop in CI slide
18. Pros slide
19. Cons slide
20. Open questions slide
21. Resources slide

#### Scenario: Total slide count
- **WHEN** the deck is rendered
- **THEN** the progress indicator shows a total of 21 slides

#### Scenario: Slides appear in the documented order
- **WHEN** the user advances from the first slide to the last
- **THEN** the slides appear in the exact order listed in this requirement

### Requirement: Plan phase divider slide
The deck SHALL include a section-divider slide introducing the Plan phase before the planning skills.

**On screen:**
- Headline: "Plan"
- Subheadline: "Decide what to build, and why, before writing code"
- Supporting text: one short paragraph framing the three planning skills (propose, explore, suggest) as different ways of arriving at a clear shared understanding before implementation.

#### Scenario: Plan phase divider slide matches storyboard
- **WHEN** the user advances to the Plan phase divider slide
- **THEN** the headline "Plan", subheadline, and supporting text are displayed
- **AND** the slide is rendered using the standard slide layout without a Claude Code skill badge

### Requirement: Suggest skill slide
This slide SHALL walk through the `/opsx:suggest` skill as a pre-implementation review pass that pre-seeds explore mode.

**On screen:**
- Headline: "/opsx:suggest"
- Subheadline: "Stress-test the change before you start building"
- Bullets:
  - Reads proposal, design, specs, and tasks for an active change
  - Produces a structured insights report: risks, gaps, improvements, open questions
  - Hands off to explore mode pre-seeded with the findings
  - Read-only — never modifies any artifact
- Code block: `/opsx:suggest <change-name>`

#### Scenario: Suggest skill slide matches storyboard
- **WHEN** the user advances to the suggest skill slide
- **THEN** the headline "/opsx:suggest", subheadline, all four bullets, and the code block are displayed

### Requirement: Build phase divider slide
The deck SHALL include a section-divider slide introducing the Build phase before the implementation skills.

**On screen:**
- Headline: "Build"
- Subheadline: "Implement with context, refine when reality diverges, review before shipping"
- Supporting text: one short paragraph framing the three build-phase skills (apply, refine, review) as the methodical implementation loop.

#### Scenario: Build phase divider slide matches storyboard
- **WHEN** the user advances to the Build phase divider slide
- **THEN** the headline "Build", subheadline, and supporting text are displayed
- **AND** the slide is rendered using the standard slide layout without a Claude Code skill badge

### Requirement: Refine skill slide
This slide SHALL walk through the `/opsx:refine` skill as the way to update specs and code mid-implementation when reality diverges from the original plan.

**On screen:**
- Headline: "/opsx:refine"
- Subheadline: "When implementation reveals a spec gap, refine instead of work around it"
- Bullets:
  - Use when the spec is wrong, ambiguous, or missing a case discovered during apply
  - Updates the relevant delta spec and the implementing code in the same change
  - Keeps the spec the source of truth — no silent code/spec divergence
  - Logs the refinement so reviewers can see what shifted between propose and ship
- Code block: `/opsx:refine`

#### Scenario: Refine skill slide matches storyboard
- **WHEN** the user advances to the refine skill slide
- **THEN** the headline "/opsx:refine", subheadline, all four bullets, and the code block are displayed

### Requirement: Review skill slide
This slide SHALL walk through the `/opsx:review` skill as a pre-PR check of implementation against specs and tasks.

**On screen:**
- Headline: "/opsx:review"
- Subheadline: "Catch drift between specs, tasks, and the code you just wrote"
- Bullets:
  - Reads the change's specs and tasks, then audits the git diff
  - Flags missing scenarios, unimplemented tasks, and spec/code drift
  - Returns a structured verdict — APPROVED or CHANGES REQUESTED
  - Run before opening a PR; complements the mandatory code-review subagent gate
- Code block: `/opsx:review`

#### Scenario: Review skill slide matches storyboard
- **WHEN** the user advances to the review skill slide
- **THEN** the headline "/opsx:review", subheadline, all four bullets, and the code block are displayed

### Requirement: Ship & Close phase divider slide
The deck SHALL include a section-divider slide introducing the Ship & Close phase before the shipping and archival skills.

**On screen:**
- Headline: "Ship & Close"
- Subheadline: "Open the PR, sync specs into the library, leave a summary for next time"
- Supporting text: one short paragraph framing the three ship/close skills (pr, archive, summarize) as the steps that turn a finished change into durable context.

#### Scenario: Ship & Close phase divider slide matches storyboard
- **WHEN** the user advances to the Ship & Close phase divider slide
- **THEN** the headline "Ship & Close", subheadline, and supporting text are displayed
- **AND** the slide is rendered using the standard slide layout without a Claude Code skill badge

### Requirement: PR skill slide
This slide SHALL walk through the `/opsx:pr` skill as PR creation plus AI-reviewer integration.

**On screen:**
- Headline: "/opsx:pr"
- Subheadline: "PR creation + AI reviewer integration in one step"
- Bullets:
  - Drafts a PR description from the change's proposal and design
  - Opens the PR using the repository template
  - Posts an AI reviewer comment and polls for the response (current implementation: `@cursor`)
  - Decouples PR mechanics from the developer's flow so review can start immediately
- Code block: `/opsx:pr`

#### Scenario: PR skill slide matches storyboard
- **WHEN** the user advances to the PR skill slide
- **THEN** the headline "/opsx:pr", subheadline, all four bullets, and the code block are displayed

### Requirement: Summarize skill slide
This slide SHALL walk through the `/opsx:summarize` skill as the final step that produces a human-readable record of an archived change.

**On screen:**
- Headline: "/opsx:summarize"
- Subheadline: "Leave a short, human-readable record of every archived change"
- Bullets:
  - Runs against an archived change folder
  - Generates `summary.md` with the why, what changed, and how it shipped
  - Optimized for skimming weeks or months later, not for compliance
  - Compounding value: future explore sessions read these summaries for context
- Code block: `/opsx:summarize`

#### Scenario: Summarize skill slide matches storyboard
- **WHEN** the user advances to the summarize skill slide
- **THEN** the headline "/opsx:summarize", subheadline, all four bullets, and the code block are displayed

### Requirement: Closing the loop in CI slide
The deck SHALL include a slide between the Ship & Close phase and the Pros slide that documents the automated half of the workflow — guards that run without human invocation.

**On screen:**
- Headline: "Closing the loop in CI"
- Subheadline: "What runs automatically, so the human loop doesn't have to"
- Bullets:
  - **Code Review Gate** — `CLAUDE.md` mandates a `code-review` subagent run after every implementation, before results are presented
  - **Spec Drift Monitor** — a gh-aw workflow runs on merge to main; if code diverges from the living specs, it opens a GitHub issue assigned to the PR author
  - **AI PR Reviewer** — invoked by `/opsx:pr`, posts a comment on the PR and is polled for response (current implementation: `@cursor`)
  - Together: every change is reviewed before merge, drift is surfaced after merge, and the developer never has to remember to run any of it

#### Scenario: Closing the loop in CI slide matches storyboard
- **WHEN** the user advances to the Closing the loop in CI slide
- **THEN** the headline, subheadline, and all four bullets are displayed
