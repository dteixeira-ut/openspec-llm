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
        content: 'A CLI + four Claude Code skills that cover the full development lifecycle',
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
          '/opsx:propose  →  plan the change\n/opsx:explore  →  investigate before committing\n/opsx:apply    →  implement with full context\n/opsx:archive  →  close the loop',
      },
    ],
    notes:
      "OpenSpec has two parts. The CLI manages the artifact structure on disk. The Claude Code skills are what you actually interact with — they're slash commands that tell Claude which phase of the workflow you're in, fetch the right instructions from the CLI, and load the right context files. The result is that Claude always knows where you are in the process and what it should be doing.",
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
          { question: 'How do we keep specs in sync as code evolves post-archive?' },
          { question: 'Who owns the spec review process — and what does approval look like?' },
          { question: 'What\'s the right scope for a "change"? One PR? One epic?' },
          { question: "How do we handle hotfixes and urgent work that can't follow the full workflow?" },
          { question: 'How do we measure whether this is actually improving velocity or quality?' },
          { question: 'How do we maintain a healthy codebase instead of slop?' },
          { question: 'What will code reviews look like?' },
          { question: 'What should the limit on a commit be — do we go by tasks implemented?' },
          {
            question: 'What will the end-to-end development flow look like?',
            subitems: [
              {
                label: 'Propose',
                content: 'How can we efficiently review specs before apply without becoming a bottleneck?',
              },
              {
                label: 'Apply',
                content: 'How can we efficiently auto-validate as much as possible? Can we include an adversarial code-review step?',
                link: { label: 'adversarial code-review', href: 'https://asdlc.io/patterns/adversarial-code-review/' },
              },
              {
                label: 'Validation',
                content: 'Human validation → refinement → archive — what is the correct approach? (e.g. after a PR comment, via /opsx:refine)',
              },
            ],
          },
          { question: 'Should we add branch protection rules to block unarchived changes from merging to main?' },
          { question: '(Hypothetical) How do we resolve git merge conflicts on spec archives when two changes modify the same capability?' },
        ],
      },
    ],
    notes:
      "These are the questions we need to answer as a team — not questions Claude can answer for us. I'd love to spend the last part of this conversation on these, because how we answer them will determine whether this workflow helps us or becomes another process we abandon after three months.",
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
        content: 'This deck was built using the workflow it describes.',
      },
    ],
    notes:
      "Everything on this slide is a starting point. The footer note is intentional — we dogfooded this. The proposal, design, specs, and tasks for this presentation were all generated through the OpenSpec + Claude workflow. So you've just watched a live example.",
  },
]
