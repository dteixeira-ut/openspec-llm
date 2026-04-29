## ADDED Requirements

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

---

### Requirement: Slide 2 — The Problem
The second slide SHALL frame the problem the workflow is trying to solve before introducing any solution.

**On screen:**
- Headline: "The Problem with AI-Assisted Development Today"
- Bullets:
  - LLMs are powerful but context-hungry — they need to know *why*, not just *what*
  - Requirements live in Jira, Slack, and people's heads — not where Claude can read them
  - Every new conversation starts from zero
  - Code drifts from intent; specs, if they exist, drift from code

**Speaker notes:** "Before we talk about solutions, let's agree on the problem. The typical workflow is: someone explains a feature in a ticket, the engineer explains it again to the LLM in a chat window, the LLM writes code, and the original intent is already two levels of telephone away. There's no durable, structured record of what we decided and why."

#### Scenario: Problem slide matches storyboard
- **WHEN** the user advances to slide 2
- **THEN** the slide displays the headline and all four bullet points as specified

---

### Requirement: Slide 3 — What is Spec-Driven Development?
This slide SHALL explain the concept of spec-driven development in plain terms, contrasting it with approaches the audience already knows.

**On screen:**
- Headline: "Spec-Driven Development"
- Subheadline: "Write the contract first. Let everything else follow."
- Bullets:
  - Requirements are written as testable scenarios: WHEN ___ THEN ___
  - Code is derived from specs — not the other way around
  - Unlike TDD: specs are human-readable contracts, not code
  - Unlike documentation: specs are normative (SHALL/MUST), not descriptive
- Resource link: "Further reading: Specification by Example →"

**Speaker notes:** "Spec-driven development is not a new idea — it borrows from BDD, from formal methods, from API-first design. The core insight is simple: if you write a clear, testable statement of what a system should do before you write code, you get better code and better conversations. The WHEN/THEN format forces you to be specific. It's also exactly the kind of structured input that LLMs are good at working with."

#### Scenario: Spec-driven dev slide matches storyboard
- **WHEN** the user advances to slide 3
- **THEN** the slide displays the headline, subheadline, all four bullets, and the resource link

#### Scenario: Resource link is clickable
- **WHEN** the user clicks the resource link on slide 3
- **THEN** it opens in a new browser tab

---

### Requirement: Slide 4 — Enter OpenSpec
This slide SHALL introduce OpenSpec as a CLI plus four Claude Code skills, framing the skill-based walkthrough that follows.

**On screen:**
- Headline: "Enter OpenSpec"
- Subheadline: "A CLI + four Claude Code skills that cover the full development lifecycle"
- Bullets:
  - Installs as a CLI tool and a set of slash-command skills for Claude Code
  - Each skill gives Claude the right context and instructions for that moment
  - You stay in the chat — no terminal context-switching mid-thought
- Code block showing the four commands at a glance:
  ```
  /opsx:propose  →  plan the change
  /opsx:explore  →  investigate before committing
  /opsx:apply    →  implement with full context
  /opsx:archive  →  close the loop
  ```

**Speaker notes:** "OpenSpec has two parts. The CLI manages the artifact structure on disk. The Claude Code skills are what you actually interact with — they're slash commands that tell Claude which phase of the workflow you're in, fetch the right instructions from the CLI, and load the right context files. The result is that Claude always knows where you are in the process and what it should be doing."

#### Scenario: Enter OpenSpec slide matches storyboard
- **WHEN** the user advances to slide 4
- **THEN** the slide displays the headline, subheadline, all three bullets, and the four-command code block

---

### Requirement: Slide 5 — /opsx:propose
This slide SHALL walk through the propose skill in concrete terms, showing what the user does and what Claude produces.

**On screen:**
- Headline: "/opsx:propose"
- Subheadline: "Turn an idea into a fully-specified change in one conversation"
- Bullets:
  - You describe what you want to build — in plain language, no structure required
  - Claude asks clarifying questions, then creates all planning artifacts in sequence
  - Output: proposal.md (why) → design.md (how) → specs (what) → tasks.md (checklist)
  - Each artifact feeds the next — context accumulates as Claude works through them
- Code block: `/opsx:propose add-user-authentication`

**Speaker notes:** "This is the entry point. You don't need to know how to write a spec or structure a proposal — you just describe what you want. Claude drives the artifact creation, asking questions when context is unclear. By the end of one conversation you have a proposal that explains the why, a design doc with key decisions and trade-offs, specs with testable WHEN/THEN scenarios, and a task checklist ready for implementation. Nothing is thrown away — it all becomes context for the next steps."

#### Scenario: Propose skill slide matches storyboard
- **WHEN** the user advances to slide 5
- **THEN** the headline "/opsx:propose", subheadline, all four bullets, and the code block are displayed

---

### Requirement: Slide 6 — /opsx:explore
This slide SHALL explain the explore skill as a free-form thinking-partner mode, distinct from the other skills.

**On screen:**
- Headline: "/opsx:explore"
- Subheadline: "A thinking-partner mode for before — or during — a change"
- Bullets:
  - No code written, no artifacts created unless you ask — just structured thinking
  - Claude investigates the codebase, maps architecture, surfaces hidden complexity
  - Compares options, draws diagrams, challenges assumptions
  - When insights crystallize, offers to capture them into the right artifact
- Code block showing two example invocations

**Speaker notes:** "Explore mode is different from all the other skills — it's a stance, not a workflow. There are no required steps and no mandatory output. Use it when you're not sure what to build yet, when an approach has turned out to be more complex than expected mid-implementation, or when you want a second opinion before committing to a design decision. Claude reads existing change artifacts if they exist, so it can ground the conversation in what's already been decided."

#### Scenario: Explore skill slide matches storyboard
- **WHEN** the user advances to slide 6
- **THEN** the headline "/opsx:explore", subheadline, and all four bullets are displayed

---

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

**Speaker notes:** "This is where the payoff happens. When you run apply, Claude isn't starting from a blank chat — it has read everything. The why from the proposal, the architectural decisions from design, the requirements from the specs. It works methodically through the task list, marks each checkbox done, and stops if it hits something unclear rather than guessing. The quality difference compared to a context-free 'write me some code' is significant, especially for complex or cross-cutting changes."

#### Scenario: Apply skill slide matches storyboard
- **WHEN** the user advances to slide 7
- **THEN** the headline "/opsx:apply", subheadline, all four bullets, and the code block are displayed

---

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

**Speaker notes:** "Archive is easy to skip — the code works, ship it. But this is where the compounding value of spec-driven development comes from. The specs you wrote get merged into a living library. Every future change Claude works on has access to the decisions this team made. Skip archive consistently and you're back to starting from zero every time. The friction is low — one command, one review, done."

#### Scenario: Archive skill slide matches storyboard
- **WHEN** the user advances to slide 8
- **THEN** the headline "/opsx:archive", subheadline, all four bullets, and the code block are displayed

---

### Requirement: Slide 9 — Pros
This slide SHALL present the concrete benefits of the OpenSpec + Claude workflow honestly and specifically.

**On screen:**
- Headline: "What Works Well"
- Bullets:
  - Claude has rich, structured context — fewer hallucinations, better code
  - Specs become a durable record of decisions, not just code comments
  - Consistent artifact structure across features and teams
  - Faster iteration on design before committing to code
  - New team members can read the change history to understand *why*

**Speaker notes:** "These are the genuine wins we've seen or expect. The biggest one is context quality — when Claude has a proposal, a design doc, and a spec, it produces dramatically better output than 'here's a Jira ticket, write me some code.' The artifact trail is also a gift to your future self and your teammates."

#### Scenario: Pros slide matches storyboard
- **WHEN** the user advances to the pros slide
- **THEN** the headline "What Works Well" and all five bullet points are displayed

---

### Requirement: Slide 10 — Cons
This slide SHALL present the honest limitations and costs of the workflow without downplaying them.

**On screen:**
- Headline: "What We're Not Sure About"
- Bullets:
  - Overhead for small or urgent changes — not every fix needs the full workflow
  - Specs can drift from code if the archive step is skipped
  - LLM outputs still need careful human review — trust but verify
  - Workflow has a learning curve; team buy-in required
  - Tooling is early-stage — rough edges exist

**Speaker notes:** "We want to be honest here. This workflow has real overhead. If your team is in firefighting mode, you will feel the cost of writing a proposal before fixing a bug. The archive step is easy to skip under pressure, and that's where the value degrades. These aren't dealbreakers, but they're things we need to plan for."

#### Scenario: Cons slide matches storyboard
- **WHEN** the user advances to the cons slide
- **THEN** the headline "What We're Not Sure About" and all five bullet points are displayed

---

### Requirement: Slide 11 — Open Questions
This slide SHALL present the unresolved questions the team needs to answer before adopting the workflow, framed to invite discussion.

**On screen:**
- Headline: "Open Questions"
- Subheadline: "Things we need to resolve before committing"
- Questions:
  1. How do we keep specs in sync as code evolves post-archive?
  2. Who owns the spec review process — and what does approval look like?
  3. What's the right scope for a "change"? One PR? One epic?
  4. How do we handle hotfixes and urgent work that can't follow the full workflow?
  5. How do we measure whether this is actually improving velocity or quality?
  6. How do we maintain a healthy codebase instead of slop?
  7. What will code reviews look like?
  8. What should the limit on a commit be — do we go by tasks implemented?

**Speaker notes:** "These are the questions we need to answer as a team — not questions Claude can answer for us. I'd love to spend the last part of this conversation on these, because how we answer them will determine whether this workflow helps us or becomes another process we abandon after three months."

#### Scenario: Open questions slide matches storyboard
- **WHEN** the user advances to the open questions slide
- **THEN** the headline, subheadline, and all five questions are displayed as specified

---

### Requirement: Slide 12 — Resources
The final slide SHALL give the audience a curated list of links to explore further, organized by category.

**On screen:**
- Headline: "Resources"
- Section: "OpenSpec" — OpenSpec GitHub repository
- Section: "Spec-Driven Development" — at least two references
- Section: "Claude + Anthropic" — Anthropic API docs and Claude Code page
- Footer note: "This deck was built using the workflow it describes."

**Speaker notes:** "Everything on this slide is a starting point. The footer note is intentional — we dogfooded this. The proposal, design, specs, and tasks for this presentation were all generated through the OpenSpec + Claude workflow. So you've just watched a live example."

#### Scenario: Resources slide is the last slide
- **WHEN** the user advances to the final slide
- **THEN** it is slide 12 and the Next button is disabled

#### Scenario: Resources slide matches storyboard
- **WHEN** the user reaches the resources slide
- **THEN** the headline, all three resource sections, and the footer note are displayed

#### Scenario: All resource links open in a new tab
- **WHEN** the user clicks any link on the resources slide
- **THEN** it opens in a new browser tab with `target="_blank"` and `rel="noopener noreferrer"`

---

### Requirement: Speaker notes visible per slide
Every slide SHALL have speaker notes accessible via a toggle so the presenter can refer to talking points during the presentation.

#### Scenario: Notes toggle shows and hides notes
- **WHEN** the presenter presses `n` or clicks the notes toggle button
- **THEN** the speaker notes for the current slide appear below the slide card

#### Scenario: Notes persist across slide navigation
- **WHEN** notes are visible and the presenter advances to the next slide
- **THEN** notes remain visible and display the new slide's notes
