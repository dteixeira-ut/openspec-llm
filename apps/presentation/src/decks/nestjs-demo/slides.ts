import type { Slide } from '../../types'

/**
 * nestjs-demo deck — the AI Week experiment, reshaped as "one experiment,
 * four outputs." Slide order:
 *
 *   1. The experiment           (AI Week, NestJS is ADOPT, hypothesis)
 *   2. The case study, briefly  (Express + plain gRPC → NestJS; sub-link → /#/research)
 *   3. Output 1 — insight-out-opsx package
 *   4. Output 2 — migrate-to-nestjs skill
 *   5. Output 3 — team-aligned OpenSpec skills (/opsx:plan, code-review, summarize)
 *   6. Output 4 — GitHub agentic drift-detector
 *   7. Where we are now
 *
 * Every numerical or behavioral claim cites at least one of: a skill file
 * under `skills/`, a GitHub URL on a UserTesting repo, the research notes,
 * or — for speaker-asserted figures — an attributed callout.
 */

// SHA-pinned because the research notes currently live on the integration
// branch behind PR #256, not yet on `main`. Pinning to the commit SHA keeps
// the citation stable regardless of branch lifecycle.
const RESEARCH_NOTES_URL =
  'https://github.com/UserTestingEnterprise/enriched-video-uploads/blob/0687f0e68ea18f04e661222ddeed6710202bce56/openspec/research/sdd-exploration-notes.md'
const PR_253_URL = 'https://github.com/UserTestingEnterprise/enriched-video-uploads/pull/253'
const PR_256_URL = 'https://github.com/UserTestingEnterprise/enriched-video-uploads/pull/256'
const SKILL_URL =
  'https://github.com/dteixeira-ut/openspec-llm/blob/main/skills/migrate-to-nestjs/SKILL.md'
const UT_STANDARDS_SKILL_URL =
  'https://github.com/dteixeira-ut/openspec-llm/blob/main/skills/ut-standards/SKILL.md'
const INSIGHT_OUT_OPSX_REPO_URL =
  'https://github.com/UserTestingEnterprise/insight-out-opsx'
const OPSX_PLAN_SKILL_URL =
  'https://github.com/dteixeira-ut/openspec-llm/blob/main/templates/opsx/plan.md'
const OPSX_CODE_REVIEW_SKILL_URL =
  'https://github.com/dteixeira-ut/openspec-llm/blob/main/templates/opsx/code-review.md'
const OPSX_SUMMARIZE_SKILL_URL =
  'https://github.com/dteixeira-ut/openspec-llm/blob/main/templates/opsx/summarize.md'

export const nestjsDemoSlides: Slide[] = [
  // Slide 1 — the experiment. AI Week. NestJS is ADOPT. Every new service is
  // NestJS. Epics take weeks. Hypothesis: SDD via OpenSpec compresses that.
  {
    id: 'the-experiment',
    title: 'The experiment',
    body: [
      {
        type: 'subheading',
        content: 'AI Week. What if SDD could compress a multi-week NestJS migration?',
      },
      {
        type: 'bullets',
        items: [
          '**NestJS is ADOPT** in `ut-standards` — the canonical framework for new TS/Node backend services in the team.',
          '**Every new service we create** gets bootstrapped with NestJS. The pattern is the standard, not the exception.',
          '**These epics take weeks.** Migrating a legacy Express or hand-rolled-gRPC service to NestJS is expensive — scoping, slicing, reviewing, and rolling out add up to multiple sprints.',
          '**Hypothesis**: leverage Spec-Driven Development through OpenSpec as the planning + delivery harness, and the same epic shrinks dramatically.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        content:
          'This deck reports what came out of that AI Week experiment — the case study in brief, then the four artifacts we shipped to make the pattern repeatable.',
      },
      {
        type: 'link',
        label: 'ut-standards skill — NestJS adoption rule →',
        href: UT_STANDARDS_SKILL_URL,
      },
    ],
    notes:
      'Slide 1 frames the why. NestJS-is-ADOPT is the precondition; the multi-week epic cost is the pain; the SDD hypothesis is the bet. Keep it short — the rest of the deck is the answer.',
  },

  // Slide 2 — the case study in brief. Express HTTP + plain gRPC → NestJS via
  // OpenSpec. Several weeks → 2 days. Sub-link to /#/research for specifics.
  {
    id: 'case-study-brief',
    title: 'The case study, briefly',
    body: [
      {
        type: 'subheading',
        content:
          'We ran the experiment against a real two-service migration. Several weeks of typical effort, compressed to 2 days.',
      },
      {
        type: 'bullets',
        items: [
          '**Source**: an Express HTTP service + a plain hand-rolled gRPC server. Two services, parallel migrations.',
          '**Target**: NestJS end-to-end — `@nestjs/microservices` for gRPC, `nestjs-zod` for validation, `nestjs-pino` for logging.',
          '**Planning + delivery harness**: OpenSpec. We carefully planned both migrations, then implemented through the workflow.',
          '**Documented as we went** — research bullets capturing validity, accuracy, quality, and gaps of the SDD approach in real use.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          '"Several weeks → 2 days" is a speaker-asserted figure from the team\'s lived experience running the migration. The full research notes, the per-capability sub-PR chain, and the two integration→main PRs (#253, #256) all live in the research deck — see the link below for specifics.',
      },
      {
        type: 'link',
        label: 'Open the research deck — full case study →',
        href: '#/research',
      },
      {
        type: 'link',
        label: 'Research notes (sdd-exploration-notes.md) →',
        href: RESEARCH_NOTES_URL,
      },
      {
        type: 'link',
        label: 'PR #253 — migrate-bff-foundation →',
        href: PR_253_URL,
      },
      {
        type: 'link',
        label: 'PR #256 — migrate-service-foundation →',
        href: PR_256_URL,
      },
    ],
    notes:
      'Speak this slide briefly — the audience can drill in via the research-deck sub-link if they want specifics. The "2 days" claim is speaker-asserted; the deck attributes it via callout so a reviewer knows it is lived experience, not a document citation.',
  },

  // Slide 3 — Output 1: insight-out-opsx package on UT private GitHub.
  {
    id: 'output-insight-out-opsx',
    title: 'Output 1 — `insight-out-opsx`',
    body: [
      {
        type: 'subheading',
        content:
          'The OpenSpec framework, extended with our team\'s conventions, packaged for our org.',
      },
      {
        type: 'bullets',
        items: [
          '**Package**: `@usertestingenterprise/insight-out-opsx` on the UserTesting private GitHub org. Adoption requires a GitHub token to authenticate against the private registry.',
          '**Bootstrap**: `npx opsx init` installs the `/opsx:*` skills, the workflow templates, and a stub config — consuming repos pin a version and stay in sync.',
          '**Drift gate**: a CI check (`opsx sync --check`) catches local edits to generated files before they land.',
          '**Status**: installed across all our team repos.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'This deck\'s sibling — the package-extraction deck — covers the locked decisions (name, registry, peer-dep on `openspec`) and the byte-for-byte equality criterion that gates the cutover.',
      },
      {
        type: 'link',
        label: 'insight-out-opsx repo →',
        href: INSIGHT_OUT_OPSX_REPO_URL,
      },
      {
        type: 'link',
        label: 'Package-extraction deck →',
        href: '#/package-extraction',
      },
    ],
    notes:
      'Lead with the package name. Mention the GitHub-token requirement — adoption friction is real and worth flagging up front. The package-extraction deck is the deep dive; this slide is the named-output beat.',
  },

  // Slide 4 — Output 2: migrate-to-nestjs skill, source-agnostic.
  {
    id: 'output-migrate-to-nestjs',
    title: 'Output 2 — `migrate-to-nestjs`',
    body: [
      {
        type: 'subheading',
        content:
          'A source-agnostic NestJS migration skill, bundled with recipes for the gnarly bits.',
      },
      {
        type: 'bullets',
        items: [
          '**Source-agnostic**: Express, hapi, Mali, hand-rolled `@grpc/grpc-js`, ApolloServer, or non-Node (Rails, Django, Spring, Go) when the org is consolidating onto TS/Node.',
          '**Target is always TS/Node + NestJS** — the migration is from-scratch, not strangler.',
          '**Bundled recipes**: the squash-merge stacked-PR rebase recipe, the sibling-file diff checklist (`.prettierrc`, `tsconfig.build.json`, `Dockerfile`, CI), the sibling source-layout checklist (`src/` shape, config / logger / exception-filter conventions).',
          '**Must-ask classes** baked in: library-vs-spec surface mismatch, transitive→direct dep promotion, dangling Dockerfile `CMD`, audience prefix on HTTP-flavor migrations.',
        ],
      },
      {
        type: 'link',
        label: 'migrate-to-nestjs SKILL.md →',
        href: SKILL_URL,
      },
    ],
    notes:
      'Two beats on this slide: "source-agnostic" (the procedure travels) and "bundled recipes" (the gotchas are codified, not relearned). Recipes earned their place through specific moments in the case study — call that out if asked.',
  },

  // Slide 5 — Output 3: team-aligned OpenSpec skills (/opsx:plan, code-review,
  // summarize).
  {
    id: 'output-team-aligned-skills',
    title: 'Output 3 — team-aligned OpenSpec skills',
    body: [
      {
        type: 'subheading',
        content:
          'Three OpenSpec skills shaped by what the team\'s actual process needed.',
      },
      {
        type: 'numbered-with-subitems',
        items: [
          {
            question:
              '`/opsx:plan` — emit a delivery-plan artifact before `/opsx:apply`.',
            subitems: [
              {
                content:
                  'Captures PR shape, merge-method, cascading-branch order, and intermediate-PR build gates so the implementing agent does not improvise the delivery shape.',
                link: { label: 'plan.md template →', href: OPSX_PLAN_SKILL_URL },
              },
            ],
          },
          {
            question:
              '`/opsx:code-review` — review the implementation after `/opsx:apply`.',
            subitems: [
              {
                content:
                  'Checks task coverage, design alignment, and code quality. Returns APPROVED or CHANGES REQUESTED before the PR is opened.',
                link: { label: 'code-review.md template →', href: OPSX_CODE_REVIEW_SKILL_URL },
              },
            ],
          },
          {
            question:
              '`/opsx:summarize` — human-readable synopsis of spec + tasks + design.',
            subitems: [
              {
                content:
                  'Gives reviewers a parity-check artifact: read the synopsis, then read the diff, then decide if the code matches the spec without unrolling every file.',
                link: { label: 'summarize.md template →', href: OPSX_SUMMARIZE_SKILL_URL },
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        content:
          'Each of these three skills came out of a specific friction the case study surfaced — planning cascading branches without re-deriving the shape, gating implementation completion against spec, and giving reviewers an executive summary before the diff.',
      },
    ],
    notes:
      'These are the team-process skills, distinct from migrate-to-nestjs which is domain-specific. Mention them by their /opsx:* name so the audience can invoke them; the templates link to the prompt sources.',
  },

  // Slide 6 — Output 4: GitHub agentic drift-detector.
  {
    id: 'output-drift-detector',
    title: 'Output 4 — GitHub agentic drift-detector',
    body: [
      {
        type: 'subheading',
        content:
          'An automated flow that closes the spec ↔ code feedback loop on every PR merge.',
      },
      {
        type: 'bullets',
        items: [
          '**Trigger**: every PR merge into the protected branch.',
          '**Job**: compare the merged code against the relevant OpenSpec spec for drift — code that does not match its spec, or spec that does not reflect the merged code.',
          '**On drift**: the agent opens a corrective PR. The PR is assigned back to the developer who merged the originating change, so the loop closes with the person who has the context.',
          '**Status**: running on one repo today for monitoring; full rollout completing the week after this talk.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'This is the agent that makes SDD self-correcting — without it, code-spec drift accumulates silently. With it, every merge is an opportunity to re-align.',
      },
    ],
    notes:
      'Frame the drift-detector as "the agent that keeps SDD honest." The single-repo monitoring phase is intentional — we want to observe a few cycles before turning it on everywhere.',
  },

  // Slide 7 — where we are now. Adoption status + rollout completion.
  {
    id: 'where-we-are',
    title: 'Where we are now',
    body: [
      {
        type: 'subheading',
        content: 'The experiment shipped. Adoption is in flight.',
      },
      {
        type: 'bullets',
        items: [
          '**`insight-out-opsx`** — installed across all our team repos. Every new service initialises with the workflow + skills already in place.',
          '**`migrate-to-nestjs`** — available alongside the package; future migrations consume it instead of re-deriving the procedure.',
          '**Team-aligned `/opsx:*` skills** — `/opsx:plan`, `/opsx:code-review`, and `/opsx:summarize` ship as part of `insight-out-opsx`; the team uses them on every change.',
          '**Agentic drift-detector** — running on one repo for monitoring; rollout to the remaining repos completes the week after this talk.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        content:
          'AI Week was the experiment. The outputs are now production tooling. The pattern — careful SDD planning + a stacked-PR delivery harness + automation that detects drift — is what every future NestJS migration in the team will follow.',
      },
    ],
    notes:
      'Closing beat: the experiment is over, the artifacts are alive in our codebase, and the loop is closing. Leave the audience with "this is how we ship NestJS migrations now" rather than "this is what we tried once."',
  },
]
