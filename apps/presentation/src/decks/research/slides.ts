import type { ResearchSlide } from '../../types'

/**
 * Canonical sources cited throughout this deck. The research notes file in
 * `enriched-video-uploads-v2` is the single-source-of-truth for counts, time
 * figures, and behavior claims. Where the deck makes a code-level claim, a
 * commit SHA or PR number is cited so the assertion is auditable.
 *
 * - Research notes: `openspec/research/sdd-exploration-notes.md` in
 *   `enriched-video-uploads-v2` (~418 lines).
 * - Mitigation #1: `openspec/changes/archive/2026-05-13-harden-opsx-workflow/`
 *   in this repo.
 * - Mitigation #2: `openspec/changes/archive/2026-05-13-add-domain-skills/`
 *   in this repo.
 */
// Canonical research-notes URL — referenced in callout text bodies as a string
// so individual `evidence` callouts can name the section/line range. Kept as an
// exported constant so future slides can build inline links without retyping.
export const NOTES_URL =
  'https://github.com/dteixeira-ut/enriched-video-uploads-v2/blob/main/openspec/research/sdd-exploration-notes.md'
const HARDEN_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-claude/tree/main/openspec/changes/archive/2026-05-13-harden-opsx-workflow'
const SKILLS_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-claude/tree/main/openspec/changes/archive/2026-05-13-add-domain-skills'
const SELF_CHANGE_URL =
  'https://github.com/dteixeira-ut/openspec-claude/tree/main/openspec/changes/migration-research-deck'

export const researchSlides: ResearchSlide[] = [
  // ───────────────────────── Section 1 — FRAME (3 slides) ─────────────────────────
  {
    id: 'frame-title',
    title: 'Migration Case Study',
    density: 'both',
    body: [
      { type: 'subheading', content: 'OpenSpec + Claude, applied to a real two-service NestJS rewrite' },
      {
        type: 'text',
        content:
          'We took the workflow shown in the pitch deck and ran it against a production codebase. This is what happened: the experiment design, the findings, the mitigations shipped back into the workflow, and what we want to test next.',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Every count and time figure in this deck cites enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md (~418 lines).',
      },
    ],
    notes:
      "Open by framing this as evidence, not a pitch. We deliberately picked a real migration with real deployment stakes so the failure modes would surface. The findings live in the consuming repo's research notes file; this deck is the curation, not the source.",
  },
  {
    id: 'frame-the-experiment',
    title: 'The experiment',
    density: 'both',
    body: [
      {
        type: 'bullets',
        items: [
          'Goal: migrate two backend services (BFF + gRPC) from Express/@grpc-js to NestJS, from-scratch, in a v2 repo.',
          'Constraint: use /opsx:* end-to-end — proposals, designs, specs, tasks, applies, reviews, PRs, archives.',
          'Hypothesis: SDD with a knowledgeable user as orchestrator scales to a real two-service refactor.',
          'Measurement: every "the spec didn\'t say…" moment, every silent decision, every drift catch.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"What we set out to do" — sdd-exploration-notes.md lines 5–13.',
      },
    ],
    notes:
      "We didn't go in trying to break the workflow — we went in trying to ship the migration. The findings are a side-effect of doing real work with the framework, which makes them more credible than a synthetic eval.",
  },
  {
    id: 'frame-what-we-measured',
    title: 'What we measured',
    density: 'full',
    body: [
      {
        type: 'bullets',
        items: [
          'Stacked sub-PR count per service (delivery throughput).',
          'Rebase cycles forced by the squash-merge × stacked-PR collision.',
          'Distinct findings: planning-phase gaps, silent decisions, drift catches.',
          'Wall-clock cost of rebase ceremony as a percentage of session time.',
        ],
      },
      {
        type: 'metric',
        label: 'Stacked sub-PRs',
        value: '~17',
        subtext: '8 BFF + 9 service; one orchestrator session',
      },
      {
        type: 'metric',
        label: 'Rebase cycles',
        value: '~18',
        subtext: '~15–20% of session wall clock',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Counts and outcomes" (lines 286–290) and §"Stacked sub-PRs + repo-mandated squash merge" (lines 305–351).',
      },
    ],
    notes:
      "Calling out the rebase cost up front sets up the delivery-shape findings later in the deck. The 15–20% number is the most-cited figure when people ask 'was the framework actually fast in practice?' — be honest, it was fast for planning, slow for delivery ceremony.",
  },

  // ───────────────────────── Section 2 — PROCESS (4 slides) ─────────────────────────
  {
    id: 'process-opsx-driving',
    title: 'How /opsx:* drove the migration',
    density: 'both',
    body: [
      {
        type: 'numbered',
        items: [
          '/opsx:explore — slicing strategy and stack choices (zod, NestJS-native gRPC, per-feature modules).',
          '/opsx:propose — proposal → design → 8 BFF capability specs + 9 service capability specs + tasks.',
          '/opsx:apply — ticked tasks per capability, one capability per PR, stacked.',
          '/opsx:review and /opsx:pr — verification + PR creation per stacked capability.',
          '/opsx:archive — once integration → main landed, archive both changes and sync living specs.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Process timeline" (lines 16–51) and §"What worked well" (lines 53–89).',
      },
    ],
    notes:
      "Walk through this as a workflow, not a checklist — the explore-then-propose separation was load-bearing because it kept the artifacts from being polluted by half-baked thinking.",
  },
  {
    id: 'process-per-capability-slicing',
    title: 'Per-capability slicing made review tractable',
    density: 'both',
    body: [
      {
        type: 'bullets',
        items: [
          'BFF foundation: 8 capabilities (bff-bootstrap, bff-config, bff-logger, bff-validation, bff-grpc-client, bff-uploadcare-controller, bff-uploadcare-use-case, bff-test-scaffolding).',
          'Service foundation: 9 capabilities (service-bootstrap, service-config, service-logger, service-database, service-kafka-module, service-grpc-server, service-uploadcare-domain, service-uploadcare-controller, service-test-scaffolding).',
          'Each spec → one PR. Each PR reviewable in 5–10 minutes.',
          'OpenSpec\'s specs/<capability>/spec.md structure mapped 1:1 to PR boundaries.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Per-capability spec subdivision made review effort tractable" (lines 55–61).',
      },
    ],
    notes:
      "The capability boundaries were not invented by the planner — they came from the existing service shape. The framework just gave us a place to put them and a parse target for /opsx:apply.",
  },
  {
    id: 'process-stacked-delivery',
    title: 'Stacked-PR delivery, one branch per capability',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'Each capability landed on its own branch, stacked on the prior capability. The integration branch held them in order; the final integration → main PR collapsed the chain.',
      },
      {
        type: 'code',
        content: `main
└─ migrate-bff-foundation (integration)
   ├─ bff-bootstrap            ← PR #226
   ├─ bff-config               ← PR #227
   ├─ bff-logger               ← PR #228
   ├─ bff-validation           ← PR #230
   ├─ bff-grpc-client          ← PR #231
   ├─ bff-uploadcare-use-case  ← PR #232
   ├─ bff-uploadcare-controller← PR #235
   └─ bff-test-scaffolding     ← PR #238`,
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Counts and outcomes" (lines 288–290) — BFF stack ending at #238, service stack at #242 + extension PRs #246–#251.',
      },
    ],
    notes:
      "This diagram is hand-drawn from the actual PR numbers. The service stack has the same shape with nine layers. Each PR's body had to say 'Stacked on top of #X; merge in order' — no GitHub UI affordance for this.",
  },
  {
    id: 'process-explore-vs-propose',
    title: 'Explore-then-Propose prevented premature commitment',
    density: 'full',
    body: [
      {
        type: 'bullets',
        items: [
          '/opsx:explore produced rough thinking — diagrams, trade-offs, recommendations — with zero artifacts written.',
          'Only after four open decisions were pinned (zod stack, transport, cutover, module shape) did /opsx:propose commit them.',
          'When the config gap surfaced mid-implementation, we re-entered explore mode tangentially without polluting the propose-mode artifacts.',
          'The two-phase shape is load-bearing — fusing them rushes the artifacts or pads the explore.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Explore → Propose separation prevented premature commitment" (lines 63–66).',
      },
    ],
    notes:
      "This is the single most-cited 'this is why the framework works' moment. If you take one process lesson away from the case study: keep explore and propose separate.",
  },

  // ───────────────────────── Section 3 — FINDINGS BY CLASS (10 slides) ─────────────

  // Class 1: implicit deployment context
  {
    id: 'finding-deploy-overview',
    title: 'Finding class 1: Implicit deployment context',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'Templates did not surface the load-bearing operational contract',
        body:
          'CLAUDE.md said configuration "mirrors HELM." The proposals echoed it back. The actual contract — config/config.json baked into Docker, argocd-apps mounts a ConfigMap over it, env-var overlay only for secrets — was nowhere in the templates\' prompts. The user had to ask "is there any mention of how we treat config?" to expose the gap.',
        mitigation: {
          changeName: 'harden-opsx-workflow',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content: 'Source: research notes §"Gap 1" (lines 93–101).',
      },
    ],
    notes:
      "Lead with the highest-impact gap. The mitigation is direct: harden-opsx-workflow added a 'Non-code surfaces' section to the proposal template that lists config, secrets, deployment artifacts, CI workflows, observability — each must be filled or marked N/A.",
  },
  {
    id: 'finding-deploy-example',
    title: 'Concrete example: the argocd-apps gap',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'An implementing agent reading the unrefined proposal could plausibly have built an env-only @nestjs/config setup. That would have broken the argocd-apps ConfigMap flow silently — same code, wrong load semantics.',
      },
      {
        type: 'diff',
        before:
          '// proposal (original)\n"ConfigModule mirrors HELM, no new HELM keys."\n// → ambiguous: env-only? file-based? ConfigMap mounted?',
        after:
          '// proposal (after the gap-closing update)\n"Load config/config.json at boot.\nargocd-apps mounts a ConfigMap at\n/app/config/config.json over the baked file.\nEnv-var overlay applies to secrets only."',
        language: 'text',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"5. /opsx:explore config — argocd-apps bootstrap" (lines 38–46).',
      },
    ],
    notes:
      "Show the before/after of the proposal text — the original was technically true and totally useless. The mitigation forces the planner to enumerate these surfaces or mark them N/A with a reason, which makes the omission visible.",
  },

  // Class 2: silent agent decisions
  {
    id: 'finding-silent-overview',
    title: 'Finding class 2: Silent agent decisions',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'Specs contradicted legacy; agents picked silently',
        body:
          'Multiple specs disagreed with legacy code on details that matter — error codes, action types, field names. Without an ambiguity escalation contract, agents either improvised (risky) or asked about everything (slow). The implicit rule "legacy wins" was nowhere in writing.',
        mitigation: {
          changeName: 'harden-opsx-workflow',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Service-stack extension run" findings 3 + 4 (lines 364–366).',
      },
    ],
    notes:
      "This class is subtle: the spec was wrong, but the agent dutifully implemented it. Without 'legacy wins' as a documented precedence rule, the agent would have shipped a behavior change disguised as a refactor.",
  },
  {
    id: 'finding-silent-example',
    title: 'Concrete example: error-code mismatch',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'The service-studies-controller spec said "rejects with FAILED_PRECONDITION (or the legacy-mapped status)". The legacy create-study.ts rejects with INVALID_ARGUMENT. With "match legacy exactly" elsewhere in the directive, INVALID_ARGUMENT wins — but a less careful agent could have shipped FAILED_PRECONDITION and broken every consumer that pattern-matches the gRPC code.',
      },
      {
        type: 'diff',
        before:
          '// spec scenario\n"WHEN duplicate ids THEN rejects with\nFAILED_PRECONDITION (or legacy-mapped\nstatus) and a message naming the\nduplicate IDs"',
        after:
          '// legacy create-study.ts (authoritative)\nthrow new RpcException({\n  code: Status.INVALID_ARGUMENT,\n  message: "Duplicate video IDs: ..."\n})',
        language: 'text',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Service-stack extension run" finding 3 (lines 364–365).',
      },
    ],
    notes:
      "There's a second example in the notes — logAction(CREATED) vs addVideoLogUploaded(UPLOADED). Same pattern. Same fix: spec says one thing, code says another, only the legacy code reflects what consumers actually depend on.",
  },

  // Class 3: delivery shape
  {
    id: 'finding-delivery-overview',
    title: 'Finding class 3: Delivery shape was never an artifact',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'OpenSpec planned the work but not how it reaches main',
        body:
          'Proposal, design, specs, tasks — none describe the PR shape, base branch, merge order, or which /opsx:* skills run at which boundary. We designed the stacked-sub-PRs strategy in conversation and captured it in a research/execution-plan.md outside OpenSpec. A reader of the change alone could not tell whether it ships as one PR or twenty.',
        mitigation: {
          changeName: 'harden-opsx-workflow (/opsx:plan)',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Gap 3" (lines 111–117) and §"Gap 10" (lines 158–172).',
      },
    ],
    notes:
      "This is the single biggest framework gap we hit. The mitigation is a whole new command (/opsx:plan) plus a 'Delivery shape' section enforced on design.md.",
  },
  {
    id: 'finding-delivery-rebase-cost',
    title: 'Concrete example: stacked PRs × squash-only = rebase loop',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'The plan assumed merge-commits would preserve per-capability history. The org-managed repo enforces squash. Every downstream PR diverged on every merge, requiring a full rebase against the new integration HEAD.',
      },
      {
        type: 'metric',
        label: 'Rebase cycles total',
        value: '~18',
        subtext: 'BFF: 8 across 9 PRs; service: 9+ across 14 PRs (5 of ~18 were auto-clean)',
      },
      {
        type: 'metric',
        label: 'Session wall-clock spent on rebases',
        value: '15–20%',
        subtext: '~1.5–2 hours across the run',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Process-level finding 5" (lines 307–351). Conflict volume table at lines 336–338.',
      },
    ],
    notes:
      "The figure I always lead with: 15–20% of session time was pure rebase ceremony. That's the entire deficit between 'SDD makes planning fast' and 'SDD makes delivery fast' — the framework didn't catch the squash-vs-stack interaction up front.",
  },

  // Class 4: configuration drift
  {
    id: 'finding-config-drift-overview',
    title: 'Finding class 4: Configuration drift across sibling services',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'medium',
        title: 'Sibling .prettierrc divergence was inert until NestJS landed',
        body:
          'The BFF\'s .prettierrc had `importOrderParserPlugins: ["typescript", "decorators-legacy"]` since day one. The service\'s did not — fine, because no decorators existed in the service. The NestJS migration introduced @Injectable, @Module, @GrpcMethod etc., and npm run fmt instantly failed on 27 files with a SyntaxError. No CI fmt gate existed to catch this on any of the 14 sub-PRs.',
        mitigation: {
          changeName: 'add-domain-skills (service-config-drift)',
          href: SKILLS_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Prettier wasn\'t running on the service stack" (lines 374–397).',
      },
    ],
    notes:
      "The lesson here isn't 'prettier was misconfigured.' It's that convention parity ≠ tooling parity. Two services with the same code style can have drifting quality gates that only fail when one of them grows a new syntax class.",
  },
  {
    id: 'finding-config-drift-dockerfile',
    title: 'Concrete example: Dockerfile not migrated, caught on deploy',
    density: 'both',
    body: [
      {
        type: 'text',
        content:
          'None of the 14 sub-PRs touched the service Dockerfile. The migration deleted src/index.ts; the Dockerfile\'s CMD still ran node dist/index.js. The container started, looked for dist/index.js, and exited.',
      },
      {
        type: 'diff',
        before:
          '# Dockerfile (legacy, untouched)\nCOPY package*.json tsconfig.json ./\n...\nCMD ["node", "dist/index.js"]',
        after:
          '# Dockerfile (post-migration fix)\nCOPY package*.json tsconfig.json \\\n  tsconfig.build.json nest-cli.json ./\n...\nCMD ["node", "dist/main.js"]',
        language: 'dockerfile',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Dockerfile wasn\'t migrated alongside the source" (lines 398–418).',
      },
    ],
    notes:
      "This is the deploy-time failure that made the cost of the gap visceral. The mitigation is two-pronged: harden-opsx-workflow now requires a 'reference cleanup' task when files are deleted, and add-domain-skills ships service-config-drift with a Dockerfile-entry-point auditor.",
  },

  // Class 5: library-vs-spec mismatch
  {
    id: 'finding-library-overview',
    title: 'Finding class 5: Library vs spec surface mismatch',
    density: 'full',
    body: [
      {
        type: 'finding',
        severity: 'medium',
        title: 'Spec required a method the library does not expose',
        body:
          'Spec task 6.5 said "disconnect the producer and consumer cleanly." @usertestingenterprise/kafka-client\'s Producer has no disconnect() method. The agent shipped stopProducer as a log-only no-op to honor intent while reflecting the surface — and flagged it for /opsx:refine.',
        mitigation: {
          changeName: 'harden-opsx-workflow (ambiguity contract)',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Service — service-kafka-module" (line 279).',
      },
    ],
    notes:
      "This is the cleanest 'agent did the right thing' story in the run — but only because we had a paused-on-ambiguity culture. Without the contract, a less conservative agent could have npm-installed kafkajs and rewired the producer, which would have been a worse local choice.",
  },

  // ───────────────────────── Section 4 — MITIGATIONS SHIPPED (4 slides) ─────────────
  {
    id: 'mitigation-harden-overview',
    title: 'Mitigation #1 — harden-opsx-workflow',
    density: 'both',
    body: [
      {
        type: 'bullets',
        items: [
          'Adds proposal-level required sections: non-code surfaces, starting state, cutover style.',
          'Adds a design-level required section: delivery shape (PR shape, base branch, merge-method, skill invocations).',
          'Codifies the ambiguity escalation contract: must-ask vs may-decide classes, applied across propose/apply/refine/pr.',
          'Promotes the "Decisions made without consultation" marker to a first-class workflow rule on every agent-authored artifact.',
          'Ships /opsx:plan — a new command that emits an execution plan with named /opsx:* invocations and a repo-merge-method preflight.',
        ],
      },
      {
        type: 'link',
        label: 'Read the archived change →',
        href: HARDEN_ARCHIVE_URL,
      },
    ],
    notes:
      "Frame this as 'the workflow now requires what the migration forced us to derive in conversation.' Every bullet maps back to a specific gap in section 3.",
  },
  {
    id: 'mitigation-harden-marker',
    title: 'The silent-decisions marker, made first-class',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'During the migration, the orchestrator informally adopted a rule: any decision the agent made without asking gets logged at the bottom of the artifact. harden-opsx-workflow promotes that to a workflow invariant, enforced at review time.',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'From the opsx-workflow living spec: agent-authored artifacts SHALL include a "## Decisions made without consultation" section when silent calls have been made, surfaced in the PR body and promoted to summary.md at /opsx:archive.',
      },
      {
        type: 'diff',
        before:
          '// proposal.md (pre-rule)\n// agent picks defaults silently\n// reviewer cannot tell which calls\n// were explicit vs. assumed',
        after:
          '// proposal.md (post-rule)\n## Decisions made without consultation\n1. Hash-based routing chosen over react-router (zero deps).\n2. Single slide source with density flag (vs two arrays).\n...',
        language: 'text',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content: 'This very deck applies the rule — see proposal.md §"Decisions made without consultation" (six entries).',
      },
    ],
    notes:
      "This slide is the loop-closer in microcosm: the rule we adopted during the migration is now policing the deck about the migration. Point that out — audiences enjoy the self-reference.",
  },
  {
    id: 'mitigation-skills-overview',
    title: 'Mitigation #2 — add-domain-skills',
    density: 'both',
    body: [
      {
        type: 'bullets',
        items: [
          'Creates skills/ at the repo root (separate from .claude/skills/ — domain skills vs workflow skills).',
          'Ships skills/migrate-to-nestjs/ — the migration procedure generalized: Step-0 sibling-file inspection, the per-PR build gate, stacked-PR conventions, must-ask classes specific to NestJS migrations.',
          'Ships skills/service-config-drift/ — one skill, three auditors: prettierrc parser plugins, Dockerfile entry-point references, CI fmt gate presence.',
          'Each skill is captured as a living spec under openspec/specs/skill-*/ so the drift monitor watches them.',
        ],
      },
      {
        type: 'link',
        label: 'Read the archived change →',
        href: SKILLS_ARCHIVE_URL,
      },
    ],
    notes:
      "Two skills, both repo-agnostic by design — they describe file categories, not paths from any one codebase. They live in this repo temporarily until they earn a home.",
  },
  {
    id: 'mitigation-skills-graduation',
    title: 'Domain-skill graduation criteria',
    density: 'full',
    body: [
      {
        type: 'text',
        content:
          'The skills/README documents up front when a skill should move out — avoiding the failure mode where a temporary home becomes permanent by inertia.',
      },
      {
        type: 'bullets',
        items: [
          'Skill body is repo-agnostic (no paths from one codebase in the procedure).',
          'Skill has been invoked successfully on at least two consumer repos.',
          'A natural home exists (org plugin, shared skills repo, dedicated MCP server).',
          'Living spec under openspec/specs/skill-*/ keeps drift monitor coverage during the transition.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: add-domain-skills proposal §"What Changes" + skills/README.md graduation criteria.',
      },
    ],
    notes:
      "If anyone in the room runs a plugin registry or shared-skills home, this is the slide to invite them to take ownership. The skills are designed to move.",
  },

  // ───────────────────────── Section 5 — LEARNINGS (3 slides) ─────────────
  {
    id: 'learning-what-sdd-does-well',
    title: 'What SDD does well in practice',
    density: 'both',
    body: [
      {
        type: 'bullets',
        items: [
          'Forces explicit naming of capabilities — kebab-case identifiers become natural PR boundaries.',
          'Templates enforce rigor (WHEN/THEN scenarios) that ad-hoc planning skips.',
          'Granular artifacts make iterative refinement cheap — config gap update touched 4 localized files, no cascading edits.',
          'tasks.md checkboxes give /opsx:apply a parse target for progress tracking across long runs.',
          '/opsx status --change <name> --json converts "are we done planning?" from judgment call to a check.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"What worked well" (lines 53–89). Five items, all corroborated by the run.',
      },
    ],
    notes:
      "Don't undersell the wins. The five items here are the reason we'd recommend SDD even with the gaps — the gaps are addressable, the wins are structural.",
  },
  {
    id: 'learning-what-sdd-doesnt-catch',
    title: 'What SDD does NOT catch by construction',
    density: 'full',
    body: [
      {
        type: 'bullets',
        items: [
          'Deployment surface — config load, ConfigMaps, Dockerfile, helm. Not in any template prompt by default.',
          'Repo merge-policy interactions — squash-only × stacked branches is a known-bad combo, not flagged.',
          'Sibling-service config drift — when one service grows a new syntax class, the other\'s tooling breaks invisibly.',
          'Auxiliary infra files — Dockerfiles, CI workflows, .prettierrc — are not "code" so tasks.md doesn\'t list them.',
          'Spec-vs-legacy contradictions — agents need an explicit "legacy wins" precedence rule to resolve them safely.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Each item maps to a gap in the research notes: Gap 1, Process-finding 5, the prettier/Dockerfile sections, and the silent-decisions findings.',
      },
    ],
    notes:
      "Be honest about the failure surface. The framework is not a substitute for an experienced engineer holding the operational context — it's a force multiplier when one is present.",
  },
  {
    id: 'learning-must-ask-may-decide',
    title: 'The transferable lesson: must-ask vs may-decide',
    density: 'both',
    body: [
      {
        type: 'subheading',
        content: 'Make the ambiguity contract part of the workflow, not a personality trait of the agent.',
      },
      {
        type: 'bullets',
        items: [
          'Must-ask: spec vs legacy conflicts on brownfield changes, missing operational surfaces, decisions affecting external consumers.',
          'May-decide: phrasing, slide titles, severity assignments when traceable to source, default values within a documented range.',
          'Must-log: every may-decide call goes into a "Decisions made without consultation" section so reviewers can audit.',
          'Defaults silently picked + no marker = a review finding, not a green PR.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: harden-opsx-workflow opsx-workflow living spec, "Build skills SHALL apply an ambiguity escalation contract" requirement.',
      },
    ],
    notes:
      "This is the lesson that travels beyond OpenSpec. Any human/AI workflow benefits from a documented must-ask/may-decide split — without it, agents either stall or improvise.",
  },

  // ───────────────────────── Section 6 — CLOSE (1 slide) ─────────────
  {
    id: 'close-dogfooding',
    title: 'The dogfooding loop, closed',
    density: 'both',
    body: [
      {
        type: 'subheading',
        content: 'This deck was itself built using the workflow.',
      },
      {
        type: 'bullets',
        items: [
          'migration-research-deck — proposal, design, three capability specs, tasks.md — all authored under the harden-opsx-workflow rules.',
          'Every silent decision the agent made while authoring the deck was logged in a "Decisions made without consultation" section — the same marker the deck talks about.',
          'The two mitigations shipped before this deck was authored. The author was a /opsx:apply agent reading the artifacts.',
          'If you spotted a gap in the deck, the framework now has a verb for it: /opsx:refine.',
        ],
      },
      {
        type: 'link',
        label: 'View the change that built this deck →',
        href: SELF_CHANGE_URL,
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Sources: this deck\'s proposal.md, design.md, and three specs/ — all available at the link above.',
      },
    ],
    notes:
      "Close with the loop closed: the workflow built a deck about itself, and the rules the workflow ships caught its own silent calls. If a future audience pushes back on any number or claim in the deck, the answer is: cite a source or /opsx:refine.",
  },
]
