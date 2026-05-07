import type { Slide } from './types'

export const slides: Slide[] = [
  {
    id: 'title',
    title: 'OpenSpec + Claude',
    body: [
      { type: 'subheading', content: 'A Workflow Evaluation' },
      {
        type: 'text',
        content: 'Can spec-driven development + AI make us faster and more intentional?',
      },
    ],
    notes:
      "We're going to walk through a workflow that tries to make AI a more structured partner in software development — not just a code autocomplete, but something that understands why we're building what we're building. By the end, we want to have a clear picture of whether this approach is worth adopting and what questions we still need to answer.",
  },
  {
    id: 'problem',
    title: 'The Problem with AI-Assisted Development Today',
    body: [
      {
        type: 'bullets',
        items: [
          'LLMs are powerful but context-hungry — they need to know why, not just what',
          "Requirements live in Jira, Slack, and people's heads — not where Claude can read them",
          'Every new conversation starts from zero',
          'Code drifts from intent; specs, if they exist, drift from code',
        ],
      },
    ],
    notes:
      "Before we talk about solutions, let's agree on the problem. The typical workflow is: someone explains a feature in a ticket, the engineer explains it again to the LLM in a chat window, the LLM writes code, and the original intent is already two levels of telephone away. There's no durable, structured record of what we decided and why.",
  },
  {
    id: 'spec-driven-dev',
    title: 'Spec-Driven Development',
    body: [
      { type: 'subheading', content: 'Write the contract first. Let everything else follow.' },
      {
        type: 'bullets',
        items: [
          'Requirements are written as testable scenarios: WHEN ___ THEN ___',
          'Code is derived from specs — not the other way around',
          'Unlike TDD: specs are human-readable contracts, not code',
          'Unlike documentation: specs are normative (SHALL/MUST), not descriptive',
        ],
      },
      {
        type: 'link',
        label: 'Further reading: Specification by Example →',
        href: 'https://gojko.net/books/specification-by-example/',
      },
    ],
    notes:
      "Spec-driven development is not a new idea — it borrows from BDD, from formal methods, from API-first design. The core insight is simple: if you write a clear, testable statement of what a system should do before you write code, you get better code and better conversations. The WHEN/THEN format forces you to be specific. It's also exactly the kind of structured input that LLMs are good at working with.",
  },
  {
    id: 'enter-openspec',
    title: 'Enter OpenSpec',
    body: [
      {
        type: 'subheading',
        content:
          'A CLI + Claude Code skills covering the full lifecycle, plus CI automation that closes the loop',
      },
      {
        type: 'bullets',
        items: [
          'Installs as a CLI tool and a set of slash-command skills for Claude Code',
          'Each skill gives Claude the right context and instructions for that moment',
          'You stay in the chat — no terminal context-switching mid-thought',
        ],
      },
      {
        type: 'code',
        content:
          'Plan         /opsx:propose   /opsx:explore   /opsx:suggest\nBuild        /opsx:apply     /opsx:refine    /opsx:review\nShip/Close   /opsx:pr        /opsx:archive   /opsx:summarize',
      },
    ],
    notes:
      "OpenSpec has two parts. The CLI manages the artifact structure on disk. The Claude Code skills are what you actually interact with — they're slash commands that tell Claude which phase of the workflow you're in, fetch the right instructions from the CLI, and load the right context files. The result is that Claude always knows where you are in the process and what it should be doing. We'll walk through them grouped into three phases — Plan, Build, Ship & Close.",
  },
  {
    id: 'phase-plan',
    title: 'Plan',
    body: [
      {
        type: 'subheading',
        content: 'Decide what to build, and why, before writing code',
      },
      {
        type: 'text',
        content:
          'Three skills cover this phase. Propose turns an idea into a fully-specified change. Explore is the thinking-partner mode for when an idea isn\'t ready to commit yet. Suggest stress-tests an active change before you start building it. Different shapes of "figure out what we\'re actually doing" — all read-only with respect to your codebase.',
      },
    ],
    notes:
      "The Plan phase is where the hard thinking happens. The cost of a bad spec is paid every line of code afterward, so we treat this phase as cheap relative to what comes next. None of these three skills modify your codebase — they're shaping the change before you commit to it.",
  },
  {
    id: 'skill-propose',
    title: '/opsx:propose',
    body: [
      {
        type: 'subheading',
        content: 'Turn an idea into a fully-specified change in one conversation',
      },
      {
        type: 'bullets',
        items: [
          'You describe what you want to build — in plain language, no structure required',
          'Claude asks clarifying questions, then creates all planning artifacts in sequence',
          'Output: proposal.md (why) → design.md (how) → specs (what) → tasks.md (checklist)',
          'Each artifact feeds the next — context accumulates as Claude works through them',
        ],
      },
      { type: 'code', content: '/opsx:propose add-user-authentication' },
    ],
    notes:
      "This is the entry point. You don't need to know how to write a spec or structure a proposal — you just describe what you want. Claude drives the artifact creation, asking questions when context is unclear. By the end of one conversation you have a proposal that explains the why, a design doc with key decisions and trade-offs, specs with testable WHEN/THEN scenarios, and a task checklist ready for implementation. Nothing is thrown away — it all becomes context for the next steps.",
  },
  {
    id: 'skill-explore',
    title: '/opsx:explore',
    body: [
      {
        type: 'subheading',
        content: 'A thinking-partner mode for before — or during — a change',
      },
      {
        type: 'bullets',
        items: [
          'No code written, no artifacts created unless you ask — just structured thinking',
          'Claude investigates the codebase, maps architecture, surfaces hidden complexity',
          'Compares options, draws diagrams, challenges assumptions',
          'When insights crystallize, offers to capture them into the right artifact',
        ],
      },
      {
        type: 'code',
        content:
          '/opsx:explore\n# "I\'m thinking about adding real-time sync"\n# "The auth refactor is more complex than we thought"',
      },
    ],
    notes:
      "Explore mode is different from all the other skills — it's a stance, not a workflow. There are no required steps and no mandatory output. Use it when you're not sure what to build yet, when an approach has turned out to be more complex than expected mid-implementation, or when you want a second opinion before committing to a design decision. Claude reads existing change artifacts if they exist, so it can ground the conversation in what's already been decided.",
  },
  {
    id: 'skill-suggest',
    title: '/opsx:suggest',
    body: [
      {
        type: 'subheading',
        content: 'Stress-test the change before you start building',
      },
      {
        type: 'bullets',
        items: [
          'Reads proposal, design, specs, and tasks for an active change',
          'Produces a structured insights report: risks, gaps, improvements, open questions',
          'Hands off to explore mode pre-seeded with the findings',
          'Read-only — never modifies any artifact',
        ],
      },
      { type: 'code', content: '/opsx:suggest <change-name>' },
    ],
    notes:
      "Suggest is the bridge between propose and apply. After you've written a proposal, design, and specs, it's tempting to just start coding — but the most expensive bugs in spec-driven development are the ones that live in the spec itself. Suggest reads everything you wrote, looks for risks, gaps, and ambiguities, and pre-seeds an explore session so you can think through the issues before code locks them in. Use it whenever a change feels ambitious or touches code you don't fully control.",
  },
  {
    id: 'phase-build',
    title: 'Build',
    body: [
      {
        type: 'subheading',
        content: 'Implement with context, refine when reality diverges, review before shipping',
      },
      {
        type: 'text',
        content:
          'Three skills cover this phase. Apply works the task checklist with full artifact context. Refine handles the moments when implementation reveals the spec was wrong. Review audits the diff against specs and tasks before you open a PR. The methodical implementation loop.',
      },
    ],
    notes:
      "The Build phase is where the artifacts you wrote in Plan turn into working code. The key shift here is that Claude isn't guessing at intent — it's executing against a contract. When the contract is wrong, refine. When the work is done, review. Both are part of the build, not separate ceremonies.",
  },
  {
    id: 'skill-apply',
    title: '/opsx:apply',
    body: [
      {
        type: 'subheading',
        content: 'Implement with full context — not a blank chat window',
      },
      {
        type: 'bullets',
        items: [
          'Claude reads proposal, design, specs, and tasks before writing a single line',
          'Works through the task checklist one item at a time',
          'Marks each task done as it goes; pauses on blockers or ambiguity',
          'Can be run multiple times — picks up where it left off',
        ],
      },
      { type: 'code', content: '/opsx:apply\n# or resume mid-way\n/opsx:apply my-change-name' },
    ],
    notes:
      "This is where the payoff happens. When you run apply, Claude isn't starting from a blank chat — it has read everything. The why from the proposal, the architectural decisions from design, the requirements from the specs. It works methodically through the task list, marks each checkbox done, and stops if it hits something unclear rather than guessing. The quality difference compared to a context-free 'write me some code' is significant, especially for complex or cross-cutting changes.",
  },
  {
    id: 'skill-refine',
    title: '/opsx:refine',
    body: [
      {
        type: 'subheading',
        content: 'When implementation reveals a spec gap, refine instead of work around it',
      },
      {
        type: 'bullets',
        items: [
          'Use when the spec is wrong, ambiguous, or missing a case discovered during apply',
          'Updates the relevant delta spec and the implementing code in the same change',
          'Keeps the spec the source of truth — no silent code/spec divergence',
          'Logs the refinement so reviewers can see what shifted between propose and ship',
        ],
      },
      { type: 'code', content: '/opsx:refine' },
    ],
    notes:
      "Refine exists because no spec survives contact with implementation perfectly. The dangerous moment is when an engineer realizes the spec doesn't match reality and quietly works around it — now the code does what's needed, but the spec is fiction. Refine forces the inverse: you fix the spec first, the code follows, and the change record shows exactly what was learned during build. It's the cheapest way to keep specs honest.",
  },
  {
    id: 'skill-review',
    title: '/opsx:review',
    body: [
      {
        type: 'subheading',
        content: 'Catch drift between specs, tasks, and the code you just wrote',
      },
      {
        type: 'bullets',
        items: [
          "Reads the change's specs and tasks, then audits the git diff",
          'Flags missing scenarios, unimplemented tasks, and spec/code drift',
          'Returns a structured verdict — APPROVED or CHANGES REQUESTED',
          'Run before opening a PR; complements the mandatory code-review subagent gate',
        ],
      },
      { type: 'code', content: '/opsx:review' },
    ],
    notes:
      "Review is the moment of truth before the PR. It loads everything you wrote — specs, tasks, design — and asks one question of the diff: does the code actually do what the spec said? Missing scenarios, unfinished tasks, accidental drift — all surfaced before a human reviewer ever sees the PR. Pair it with the code-review subagent gate (which CLAUDE.md runs after every implementation) and most spec drift never makes it past your local branch.",
  },
  {
    id: 'phase-ship-close',
    title: 'Ship & Close',
    body: [
      {
        type: 'subheading',
        content: 'Open the PR, sync specs into the library, leave a summary for next time',
      },
      {
        type: 'text',
        content:
          'Three skills cover this phase. PR creates the pull request and kicks off AI review. Archive syncs delta specs into the living library so future changes can read them. Summarize leaves a human-readable record of what shipped. This is where each change becomes context for the next.',
      },
    ],
    notes:
      "The Ship & Close phase is where most of the compounding value of this workflow comes from. Skip it and you're back to starting from zero every time. The friction is intentionally low — three short steps — because if any of them feel expensive, teams will skip them under deadline pressure and the spec library will go stale.",
  },
  {
    id: 'skill-pr',
    title: '/opsx:pr',
    body: [
      {
        type: 'subheading',
        content: 'PR creation + AI reviewer integration in one step',
      },
      {
        type: 'bullets',
        items: [
          "Drafts a PR description from the change's proposal and design",
          'Opens the PR using the repository template',
          'Posts an AI reviewer comment and polls for the response (current implementation: @cursor)',
          "Decouples PR mechanics from the developer's flow so review can start immediately",
        ],
      },
      { type: 'code', content: '/opsx:pr' },
    ],
    notes:
      "PR is the handoff between local work and shared review. It writes a description by reading the proposal and design — so the PR body is grounded in the same artifacts the code is grounded in — opens the PR using the repository template, and immediately invokes an AI reviewer to start a parallel pass. The AI reviewer is currently `@cursor`, but the skill is reviewer-agnostic; swapping it out is a one-line change. The point is that human review never has to wait on the AI's first pass.",
  },
  {
    id: 'skill-archive',
    title: '/opsx:archive',
    body: [
      {
        type: 'subheading',
        content: 'Close the loop — make this change context for the next one',
      },
      {
        type: 'bullets',
        items: [
          'Reviews artifact and task completion; warns if anything is incomplete',
          'Syncs delta specs into the main spec library at openspec/specs/',
          'Moves the change to an archive folder with a datestamp',
          'Future changes can read these specs — your decisions compound over time',
        ],
      },
      { type: 'code', content: '/opsx:archive' },
    ],
    notes:
      "Archive is easy to skip — the code works, ship it. But this is where the compounding value of spec-driven development comes from. The specs you wrote get merged into a living library. Every future change Claude works on has access to the decisions this team made. Skip archive consistently and you're back to starting from zero every time. The friction is low — one command, one review, done.",
  },
  {
    id: 'skill-summarize',
    title: '/opsx:summarize',
    body: [
      {
        type: 'subheading',
        content: 'Leave a short, human-readable record of every archived change',
      },
      {
        type: 'bullets',
        items: [
          'Runs against an archived change folder',
          'Generates summary.md with the why, what changed, and how it shipped',
          'Optimized for skimming weeks or months later, not for compliance',
          'Compounding value: future explore sessions read these summaries for context',
        ],
      },
      { type: 'code', content: '/opsx:summarize' },
    ],
    notes:
      "Specs are precise but not fast to read. Summarize fills that gap. After archive, it produces a one-page narrative — why we did this, what changed, what we learned — that anyone can skim. Six months from now, when someone is debugging code that used to belong to this change, they'll find the summary first and the spec second. Both are useful for different questions.",
  },
  {
    id: 'closing-loop-ci',
    title: 'Closing the loop in CI',
    body: [
      {
        type: 'subheading',
        content: "What runs automatically, so the human loop doesn't have to",
      },
      {
        type: 'bullets',
        items: [
          'Code Review Gate — CLAUDE.md mandates a code-review subagent run after every implementation, before results are presented',
          'Spec Drift Monitor — a gh-aw workflow runs on merge to main; if code diverges from the living specs, it opens a GitHub issue assigned to the PR author',
          'AI PR Reviewer — invoked by /opsx:pr, posts a comment on the PR and is polled for response (current implementation: @cursor)',
          "Together: every change is reviewed before merge, drift is surfaced after merge, and the developer never has to remember to run any of it",
        ],
      },
    ],
    notes:
      "The skills we just walked through are interactive — a developer invokes them. These three pieces are the opposite: they run on their own, and their job is to catch the things humans skip under pressure. The Code Review Gate makes review non-optional inside Claude Code. The Spec Drift Monitor makes drift surfaceable after merge, so we can't quietly ship code that contradicts the specs. The AI PR Reviewer kicks off a fresh-eyes pass before a human even opens the PR. None of this replaces human judgment — it just removes the failure modes where the workflow gets skipped.",
  },
  {
    id: 'pros',
    title: 'What Works Well',
    body: [
      {
        type: 'bullets',
        items: [
          'Claude has rich, structured context — fewer hallucinations, better code',
          'Specs become a durable record of decisions, not just code comments',
          'Consistent artifact structure across features and teams',
          'Faster iteration on design before committing to code',
          'New team members can read the change history to understand why',
        ],
      },
    ],
    notes:
      "These are the genuine wins we've seen or expect. The biggest one is context quality — when Claude has a proposal, a design doc, and a spec, it produces dramatically better output than 'here's a Jira ticket, write me some code.' The artifact trail is also a gift to your future self and your teammates.",
  },
  {
    id: 'cons',
    title: "What We're Not Sure About",
    body: [
      {
        type: 'bullets',
        items: [
          'Overhead for small or urgent changes — not every fix needs the full workflow',
          'Specs can drift from code at any stage — imprecise specs require mid-implementation fixes, and refinements before or after archive may not flow back into the spec library',
          'Specs are substantially more verbose than the resulting code — difficult to review thoroughly without AI assistance',
          'Even well-scoped changes may need code refinement post-generation — "it works" is not the same as "it works well"',
          'Requires strong guardrails, code pattern guidelines, and feedback loops to maintain output quality over time',
          'LLM outputs still need careful human review — trust but verify',
          'Workflow has a learning curve; team buy-in required',
          'Tooling is early-stage — rough edges exist',
        ],
      },
    ],
    notes:
      "We want to be honest here. This workflow has real overhead. If your team is in firefighting mode, you will feel the cost of writing a proposal before fixing a bug. The archive step is easy to skip under pressure, and that's where the value degrades. These aren't dealbreakers, but they're things we need to plan for.",
  },
  {
    id: 'open-questions',
    title: 'Open Questions',
    body: [
      {
        type: 'numbered-with-subitems',
        items: [
          {
            question:
              'How do we keep specs in sync as code evolves post-archive? Partially answered: the spec drift monitor runs on merge to main and opens a GitHub issue when it detects drift. Open: who owns fixing flagged drift, and on what SLA?',
          },
          { question: 'Who owns the spec review process — and what does approval look like?' },
          { question: 'What\'s the right scope for a "change"? One PR? One epic?' },
          { question: "How do we handle hotfixes and urgent work that can't follow the full workflow?" },
          { question: 'How do we measure whether this is actually improving velocity or quality?' },
          { question: 'How do we maintain a healthy codebase instead of slop?' },
          {
            question:
              'What will code reviews look like? Partially answered: the code-review subagent gate runs after every implementation, and /opsx:pr posts an AI reviewer comment on the PR. Open: how adversarial should the AI review go, and where do humans still own the call?',
          },
          { question: 'What should the limit on a commit be — do we go by tasks implemented?' },
          {
            question: 'What will the end-to-end development flow look like?',
            subitems: [
              {
                label: 'Propose',
                content:
                  'Partially answered: /opsx:suggest surfaces risks and gaps before apply. Open: when does suggest suffice, and when is human spec review still required?',
              },
              {
                label: 'Apply',
                content:
                  'How can we efficiently auto-validate as much as possible? Can we include an adversarial code-review step?',
                link: { label: 'adversarial code-review', href: 'https://asdlc.io/patterns/adversarial-code-review/' },
              },
              {
                label: 'Validation',
                content:
                  'Human validation → refinement → archive — what is the correct approach? (e.g. after a PR comment, via /opsx:refine)',
              },
            ],
          },
          { question: 'Should we add branch protection rules to block unarchived changes from merging to main?' },
          { question: '(Hypothetical) How do we resolve git merge conflicts on spec archives when two changes modify the same capability?' },
        ],
      },
    ],
    notes:
      "These are the questions we need to answer as a team — not questions Claude can answer for us. Three of them are now partially answered by tooling we've added since the first version of this deck — drift monitor, code-review gate, suggest — but each still has a real open question attached. I'd love to spend the last part of this conversation on these, because how we answer them will determine whether this workflow helps us or becomes another process we abandon after three months.",
  },
  {
    id: 'resources',
    title: 'Resources',
    body: [
      {
        type: 'section',
        title: 'OpenSpec',
        links: [
          {
            label: 'OpenSpec GitHub Repository',
            href: 'https://github.com/openspec-ai/openspec',
          },
        ],
      },
      {
        type: 'section',
        title: 'Spec-Driven Development',
        links: [
          {
            label: 'Specification by Example — Gojko Adzic',
            href: 'https://gojko.net/books/specification-by-example/',
          },
          {
            label: 'BDD in Action — John Ferguson Smart',
            href: 'https://www.manning.com/books/bdd-in-action',
          },
        ],
      },
      {
        type: 'section',
        title: 'Claude + Anthropic',
        links: [
          { label: 'Anthropic API Documentation', href: 'https://docs.anthropic.com' },
          { label: 'Claude Code', href: 'https://claude.ai/code' },
        ],
      },
      {
        type: 'footer',
        content:
          'Built using the workflow it describes — including this update, which went propose → apply → review → archive → pr.',
      },
    ],
    notes:
      "Everything on this slide is a starting point. The footer note is intentional — we dogfooded this. Even this update — adding the new skills and CI automation to the deck — went through the full workflow: propose, apply, review, archive, pr. So you've just watched a live example.",
  },
]
