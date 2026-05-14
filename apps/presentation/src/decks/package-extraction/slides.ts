import type { Slide } from '../../types'

/**
 * Package-extraction deck — current state of extracting `templates/opsx/` +
 * `bin/opsx-sync` into `@usertestingenterprise/insight-out-opsx`. Each slide
 * is either "what was done" or "what mitigates the remaining risk."
 */
const SINGLE_SOURCE_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/single-source-opsx-templates'
const TOOL_AGNOSTIC_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/tool-agnostic-opsx-templates'
const ORG_TF_PR_URL =
  'https://github.com/UserTestingEnterprise/github-org-management/pull/1136'

export const packageExtractionSlides: Slide[] = [
  {
    id: 'title',
    title: 'Package Extraction',
    body: [
      { type: 'subheading', content: 'One source of truth, properly versioned across UT repos.' },
      {
        type: 'text',
        content:
          'Status: foundations shipped in `openspec-llm`. Repo scaffolded locally. Terraform PR open. Bin port + publish next.',
      },
    ],
  },

  {
    id: 'what-was-done',
    title: 'What was done',
    body: [
      {
        type: 'bullets',
        items: [
          '**Mitigation #3** — collapsed three drifted workflow trees into one canonical `templates/opsx/` + `bin/opsx-sync` generator + CI drift gate. Archived.',
          '**Mitigation #4** — rewrote 7/11 templates tool-agnostic; HTML-comment affordance hints are the only Claude-specific surface. Archived.',
          '**Repo scaffolded** at `services/insight-out-opsx/`: `templates/opsx/` + `bin/opsx-sync` + `bin/opsx` (full-bootstrap wrapper) + `package.json` (private org registry, peer-dep on `openspec`).',
          '**Terraform PR open** — registers the GitHub repo under `group-insights/` (PR #1136, RAD-75634).',
        ],
      },
      {
        type: 'link',
        label: 'Mitigation #3 archive →',
        href: SINGLE_SOURCE_ARCHIVE_URL,
      },
      {
        type: 'link',
        label: 'Mitigation #4 archive →',
        href: TOOL_AGNOSTIC_ARCHIVE_URL,
      },
      {
        type: 'link',
        label: 'Terraform PR →',
        href: ORG_TF_PR_URL,
      },
    ],
  },

  {
    id: 'locked-decisions',
    title: 'Locked decisions',
    body: [
      {
        type: 'bullets',
        items: [
          'Name: `@usertestingenterprise/insight-out-opsx`. Bin: `opsx`.',
          'Registry: UserTesting private org registry. Consumers configure `.npmrc`.',
          '`opsx init` = full bootstrap: `openspec init --tools claude,cursor,codex` → `opsx sync` → write commented-out `openspec/config.yaml` stub.',
          'Codex prompts stay global at `$CODEX_HOME/prompts/` — matches upstream `openspec init`.',
          '`openspec` is a **hard peer dep**. README opens with the prerequisite.',
        ],
      },
    ],
  },

  {
    id: 'mitigation-drift',
    title: 'Drift — what mitigates the remaining risk',
    body: [
      {
        type: 'bullets',
        items: [
          '**Package repo CI**: `opsx sync --check` against an in-repo fixture tree on every PR. Catches "generator broke" and "Claude-ism slipped into a template" before publish.',
          '**Consumer repo CI** (including `openspec-llm` post-cutover): `npx opsx sync --check --scope claude,cursor` on every PR. Catches hand-edits to generated files.',
          '**Byte-for-byte equality**: post-extraction `opsx sync` must produce a no-op diff against today\'s `.claude/commands/opsx/` and `.cursor/commands/opsx/` trees. Load-bearing acceptance criterion.',
          '**Known gap**: Codex stays out of CI scope — runners can\'t write `$CODEX_HOME`. Local sync still covers it.',
        ],
      },
    ],
  },

  {
    id: 'adoption',
    title: 'Adoption — two commands per consumer repo',
    body: [
      {
        type: 'code',
        content: `# 1. Install (peer-dep openspec must be on $PATH first)
npm install --save-dev @usertestingenterprise/insight-out-opsx

# 2. Bootstrap
npx opsx init

# Subsequent bumps:
npm update @usertestingenterprise/insight-out-opsx && npx opsx sync`,
      },
      {
        type: 'text',
        content:
          '`openspec-llm` dogfoods first: package PR cuts v0.1.0, then `openspec-llm` adds it as devDependency and deletes the local `bin/opsx-sync`.',
      },
    ],
  },
]
