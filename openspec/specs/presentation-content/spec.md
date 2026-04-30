### Requirement: Slide 1 — Title
The opening slide SHALL introduce the presentation with a clear title and set the tone for what follows.

**On screen:**
- Headline: "OpenSpec + Claude"
- Subheadline: "A Workflow Evaluation"
- Supporting line: "Can spec-driven development + AI make us faster and more intentional?"

**Speaker notes:** "We're going to walk through a workflow that tries to make AI a more structured partner in software development — not just a code autocomplete, but something that understands why we're building what we're building. By the end, we want to have a clear picture of whether this approach is worth adopting and what questions we still need to answer."

#### Scenario: Title slide matches storyboard
- **WHEN** the app loads
- **THEN** the first slide displays the headline "OpenSpec + Claude", the subheadline "A Workflow Evaluation", and the supporting line exactly as specified

### Requirement: Slide 2 — The Problem
The second slide SHALL frame the problem the workflow is trying to solve before introducing any solution.

**On screen:**
- Headline: "The Problem with AI-Assisted Development Today"
- Bullets:
  - LLMs are powerful but context-hungry — they need to know *why*, not just *what*
  - Requirements live in Jira, Slack, and people's heads — not where Claude can read them
  - Every new conversation starts from zero
  - Code drifts from intent; specs, if they exist, drift from code

#### Scenario: Problem slide matches storyboard
- **WHEN** the user advances to slide 2
- **THEN** the slide displays the headline and all four bullet points as specified

### Requirement: Slide 3 — Spec-Driven Development
This slide SHALL explain the concept of spec-driven development in plain terms.

**On screen:**
- Headline: "Spec-Driven Development"
- Subheadline: "Write the contract first. Let everything else follow."
- Bullets:
  - Requirements are written as testable scenarios: WHEN ___ THEN ___
  - Code is derived from specs — not the other way around
  - Unlike TDD: specs are human-readable contracts, not code
  - Unlike documentation: specs are normative (SHALL/MUST), not descriptive
- Resource link: "Further reading: Specification by Example →"

#### Scenario: Spec-driven dev slide matches storyboard
- **WHEN** the user advances to slide 3
- **THEN** the slide displays the headline, subheadline, all four bullets, and the resource link

#### Scenario: Resource link is clickable
- **WHEN** the user clicks the resource link on slide 3
- **THEN** it opens in a new browser tab

### Requirement: Slide 4 — Enter OpenSpec
This slide SHALL introduce OpenSpec as a CLI plus four Claude Code skills.

**On screen:**
- Headline: "Enter OpenSpec"
- Subheadline: "A CLI + four Claude Code skills that cover the full development lifecycle"
- Bullets:
  - Installs as a CLI tool and a set of slash-command skills for Claude Code
  - Each skill gives Claude the right context and instructions for that moment
  - You stay in the chat — no terminal context-switching mid-thought
- Code block: four commands at a glance

#### Scenario: Enter OpenSpec slide matches storyboard
- **WHEN** the user advances to slide 4
- **THEN** the slide displays the headline, subheadline, all three bullets, and the four-command code block

### Requirement: Slide 5 — /opsx:propose
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
- **WHEN** the user advances to slide 5
- **THEN** the headline "/opsx:propose", subheadline, all four bullets, and the code block are displayed

### Requirement: Slide 6 — /opsx:explore
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
- **WHEN** the user advances to slide 6
- **THEN** the headline "/opsx:explore", subheadline, and all four bullets are displayed

### Requirement: Slide 7 — /opsx:apply
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
- **WHEN** the user advances to slide 7
- **THEN** the headline "/opsx:apply", subheadline, all four bullets, and the code block are displayed

### Requirement: Slide 8 — /opsx:archive
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
- **WHEN** the user advances to slide 8
- **THEN** the headline "/opsx:archive", subheadline, all four bullets, and the code block are displayed

### Requirement: Slide 9 — Pros
This slide SHALL present the concrete benefits of the OpenSpec + Claude workflow.

**On screen:**
- Headline: "What Works Well"
- Bullets:
  - Claude has rich, structured context — fewer hallucinations, better code
  - Specs become a durable record of decisions, not just code comments
  - Consistent artifact structure across features and teams
  - Faster iteration on design before committing to code
  - New team members can read the change history to understand *why*

#### Scenario: Pros slide matches storyboard
- **WHEN** the user advances to the pros slide
- **THEN** the headline "What Works Well" and all five bullet points are displayed

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

#### Scenario: Adversarial code review link is clickable
- **WHEN** the user clicks the adversarial code review link in question 9
- **THEN** it opens in a new browser tab

### Requirement: Slide 12 — Resources
The final slide SHALL list curated resources organized by category.

**On screen:**
- Headline: "Resources"
- Section: "OpenSpec" — OpenSpec GitHub repository
- Section: "Spec-Driven Development" — at least two references
- Section: "Claude + Anthropic" — Anthropic API docs and Claude Code page
- Footer note: "This deck was built using the workflow it describes."

#### Scenario: Resources slide is the last slide
- **WHEN** the user advances to the final slide
- **THEN** it is slide 12 and the Next button is disabled

#### Scenario: Resources slide matches storyboard
- **WHEN** the user reaches the resources slide
- **THEN** the headline, all three resource sections, and the footer note are displayed

#### Scenario: All resource links open in a new tab
- **WHEN** the user clicks any link on the resources slide
- **THEN** it opens in a new browser tab with `target="_blank"` and `rel="noopener noreferrer"`

### Requirement: Speaker notes visible per slide
Every slide SHALL have speaker notes accessible via a toggle.

#### Scenario: Notes toggle shows and hides notes
- **WHEN** the presenter presses `n` or clicks the notes toggle button
- **THEN** the speaker notes for the current slide appear below the slide card

#### Scenario: Notes persist across slide navigation
- **WHEN** notes are visible and the presenter advances to the next slide
- **THEN** notes remain visible and display the new slide's notes
