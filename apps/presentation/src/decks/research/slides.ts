import type { ResearchSlide } from '../../types'

/**
 * Migration case study — findings paired tightly with the mitigations that
 * shipped back into the workflow. Every figure cites
 * enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md.
 */
export const NOTES_URL =
  'https://github.com/dteixeira-ut/enriched-video-uploads-v2/blob/main/openspec/research/sdd-exploration-notes.md'
const HARDEN_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-claude/tree/main/openspec/changes/archive/2026-05-13-harden-opsx-workflow'
const SKILLS_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-claude/tree/main/openspec/changes/archive/2026-05-13-add-domain-skills'
const SINGLE_SOURCE_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/single-source-opsx-templates'
const TOOL_AGNOSTIC_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/tool-agnostic-opsx-templates'

export const researchSlides: ResearchSlide[] = [
  {
    id: 'title',
    title: 'Migration Case Study',
    density: 'both',
    body: [
      {
        type: 'subheading',
        content: 'OpenSpec + Claude, applied to a real two-service NestJS rewrite.',
      },
      {
        type: 'text',
        content:
          'Two backend services (BFF + gRPC) migrated from Express/@grpc-js to NestJS from scratch, driven end-to-end by `/opsx:*`. This deck: what was found, what shipped to mitigate it.',
      },
    ],
  },

  {
    id: 'measured',
    title: 'What was measured',
    density: 'both',
    body: [
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
        subtext: '15–20% of session wall clock (~1.5–2h)',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Counts and outcomes" (lines 286–290).',
      },
    ],
  },

  {
    id: 'finding-deploy',
    title: 'Finding 1 — Implicit deployment context',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'Templates did not surface the load-bearing operational contract',
        body:
          'CLAUDE.md said config "mirrors HELM." The actual contract — `config/config.json` baked into Docker, argocd-apps mounts a ConfigMap over it, env-var overlay only for secrets — was nowhere in the prompts. An agent could have shipped env-only and broken the ConfigMap flow silently.',
        mitigation: {
          changeName: 'harden-opsx-workflow — required "Non-code surfaces" section on every proposal (config, secrets, deploy, CI, observability — fill or N/A)',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content: 'Source: research notes §"Gap 1" (lines 93–101).',
      },
    ],
  },

  {
    id: 'finding-silent',
    title: 'Finding 2 — Silent agent decisions',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'Specs contradicted legacy; agents picked silently',
        body:
          'Spec said reject with `FAILED_PRECONDITION`; legacy code rejects with `INVALID_ARGUMENT`. Consumers depend on the legacy code. No documented precedence rule meant agents either improvised or asked about everything.',
        mitigation: {
          changeName: 'harden-opsx-workflow — must-ask/may-decide ambiguity contract + first-class "Decisions made without consultation" marker on every agent artifact',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Service-stack extension run" findings 3+4 (lines 364–366).',
      },
    ],
  },

  {
    id: 'finding-delivery',
    title: 'Finding 3 — Delivery shape was never an artifact',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'high',
        title: 'OpenSpec planned the work but not how it reaches main',
        body:
          'Proposal/design/specs/tasks describe none of: PR shape, base branch, merge order, which `/opsx:*` skill runs at which boundary. The squash-only × stacked-PRs collision cost ~18 rebase cycles — 15–20% of session wall clock.',
        mitigation: {
          changeName: 'harden-opsx-workflow — new `/opsx:plan` command + required "Delivery shape" section on design.md (PR shape, base branch, merge-method preflight, named skill invocations)',
          href: HARDEN_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Gap 3" + §"Process-level finding 5" (lines 111–117, 307–351).',
      },
    ],
  },

  {
    id: 'finding-config-drift',
    title: 'Finding 4 — Sibling-service config drift',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'medium',
        title: 'Convention parity ≠ tooling parity',
        body:
          'BFF `.prettierrc` had `decorators-legacy` parser plugin; service did not (fine until NestJS introduced decorators, then `npm run fmt` failed on 27 files). Separately, the service Dockerfile still ran `node dist/index.js` after the migration deleted `index.ts` — container started, exited. None of the 14 sub-PRs caught either.',
        mitigation: {
          changeName: 'add-domain-skills — skills/service-config-drift with three auditors (prettierrc plugins, Dockerfile entry-points, CI fmt gate presence)',
          href: SKILLS_ARCHIVE_URL,
        },
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: research notes §"Prettier wasn\'t running" + §"Dockerfile wasn\'t migrated" (lines 374–418).',
      },
    ],
  },

  {
    id: 'finding-library',
    title: 'Finding 5 — Library vs spec surface mismatch',
    density: 'both',
    body: [
      {
        type: 'finding',
        severity: 'medium',
        title: 'Spec required a method the library does not expose',
        body:
          'Spec said "disconnect the producer cleanly." `@usertestingenterprise/kafka-client` Producer has no `disconnect()`. Agent shipped `stopProducer` as a log-only no-op and flagged for `/opsx:refine` — only because a paused-on-ambiguity culture existed.',
        mitigation: {
          changeName: 'harden-opsx-workflow — ambiguity escalation contract makes "pause and flag" the documented default, not a personality trait',
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
  },

  {
    id: 'mitigation-templates',
    title: 'Follow-on mitigations — template hygiene',
    density: 'both',
    body: [
      {
        type: 'text',
        content:
          'Two further mitigations shipped after the case-study deck surfaced gaps the original run missed:',
      },
      {
        type: 'bullets',
        items: [
          '**Mitigation #3 — single-source-opsx-templates**: three drifted workflow trees (Claude/Cursor/Codex) collapsed into one `templates/opsx/` + `bin/opsx-sync` generator + CI drift-check gate.',
          '**Mitigation #4 — tool-agnostic-opsx-templates**: 7/11 templates rewritten in tool-agnostic prose; 28 Claude-specific tool refs removed; HTML-comment affordance hints are the only Claude-specific surface.',
        ],
      },
      { type: 'link', label: 'Mitigation #3 archive →', href: SINGLE_SOURCE_ARCHIVE_URL },
      { type: 'link', label: 'Mitigation #4 archive →', href: TOOL_AGNOSTIC_ARCHIVE_URL },
    ],
  },

  {
    id: 'transferable-lesson',
    title: 'The transferable lesson',
    density: 'both',
    body: [
      {
        type: 'subheading',
        content: 'Make the ambiguity contract part of the workflow, not a personality trait of the agent.',
      },
      {
        type: 'bullets',
        items: [
          '**Must-ask**: spec vs legacy conflicts, missing operational surfaces, external-consumer-affecting calls.',
          '**May-decide**: phrasing, severity assignments, defaults within documented ranges.',
          '**Must-log**: every may-decide call goes into "Decisions made without consultation" so reviewers can audit.',
          'Defaults silently picked + no marker = review finding, not a green PR.',
        ],
      },
    ],
  },
]
