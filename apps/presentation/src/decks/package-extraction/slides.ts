import type { Slide } from '../../types'

/**
 * Package-extraction deck — the forward-looking pitch for extracting
 * `templates/opsx/` + `bin/opsx-sync` into the `@usertesting/insight-out-opsx`
 * npm package. Every load-bearing claim cites either user-memory
 * `opsx-package-extraction-open-questions`, user-memory
 * `codex-placement-matches-upstream`, or an archived change under
 * `openspec/changes/archive/RAD-75634/`. This deck is a pitch, not a case
 * study — the work has not shipped yet.
 */
const SINGLE_SOURCE_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/single-source-opsx-templates'
const TOOL_AGNOSTIC_ARCHIVE_URL =
  'https://github.com/dteixeira-ut/openspec-llm/tree/main/openspec/changes/archive/RAD-75634/tool-agnostic-opsx-templates'

export const packageExtractionSlides: Slide[] = [
  // ─────────────────── Section 1 — FRAME (2 slides) ───────────────────
  {
    id: 'frame-title',
    title: 'Package Extraction',
    body: [
      {
        type: 'subheading',
        content: 'One source of truth, properly versioned across UT repos',
      },
      {
        type: 'text',
        content:
          "We collapsed three drifting workflow trees into one canonical `templates/opsx/` directory in this repo (mitigation #3) and rewrote it tool-agnostic so the same body drives Claude, Cursor, and Codex (mitigation #4). This deck is the next phase: extracting that work into an installable npm package so every UserTesting repo consumes the same versioned source.",
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Foundation: archived RAD-75634 changes `single-source-opsx-templates` and `tool-agnostic-opsx-templates` in this repo.',
      },
    ],
    notes:
      "Open by framing this as the third beat of the same loop, not a new initiative. The hard architectural work is done — what's left is packaging it so other repos can pin a version.",
  },
  {
    id: 'frame-problem',
    title: 'The problem packaging solves',
    body: [
      {
        type: 'bullets',
        items: [
          'Templates are canonical in `openspec-llm`, but a consumer repo can only copy-paste or submodule them — both reintroduce drift.',
          'No way to pin a version, no way to bump intentionally, no changelog signal when the workflow contract changes.',
          'The drift-check gate works inside this repo only — every other consumer is on their own.',
          'Adoption stalls because "use the templates" means "manually mirror them and hope they stay in sync."',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Sources: archived `single-source-opsx-templates` (collapsed three trees in one repo) and `tool-agnostic-opsx-templates` (made the source not be silently Claude-flavored). Together they make a publishable package possible; on their own they only solve the single-repo case.',
      },
    ],
    notes:
      "Don't oversell. The problem isn't broken — the templates work. The problem is that the single-source guarantee stops at this repo's edge, and there's no mechanism to extend it.",
  },

  // ───────────────── Section 2 — LOCKED DECISIONS (3 slides) ─────────────────
  {
    id: 'decisions-identity',
    title: 'Locked decisions — identity & distribution',
    body: [
      {
        type: 'bullets',
        items: [
          'npm scope: `@usertesting/` — org-scoped, not personal.',
          'Package name: `insight-out-opsx` (working). Full id: `@usertesting/insight-out-opsx`. The "insight out" prefix reflects UT product branding; final name confirm before publishing.',
          'Registry: UserTesting private (org) registry — not public npm, not GitHub Packages. Consumers need a `.npmrc` configured for the org registry.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: user-memory `opsx-package-extraction-open-questions` — decisions 1, 2, and 3, locked 2026-05-13.',
      },
    ],
    notes:
      "These three are 'name and where' — they don't constrain the implementation, but they do constrain the install instructions in the README. Working name `insight-out-opsx` survives a rename because the bin (`opsx`) is the user-facing surface.",
  },
  {
    id: 'decisions-init-scope',
    title: 'Locked decision — `opsx init` is full bootstrap',
    body: [
      {
        type: 'text',
        content:
          "Consumers run one command on a fresh repo. The wrapper runs `openspec init --tools claude,cursor,codex`, runs `opsx sync` to fan templates out to per-tool command paths, AND writes a starter `openspec/config.yaml` with hook + reviewer defaults stubbed (commented-out, so consumers opt in by uncommenting).",
      },
      {
        type: 'bullets',
        items: [
          'Stubbed defaults to seed: `hooks.post-archive: [/opsx:summarize]` and `agents.pr-reviewers: [cursor]`.',
          'If `openspec/config.yaml` already exists, `opsx init` preserves it byte-for-byte and prints a notice.',
          'No interactive flow. No flag forks of upstream `openspec init`. The wrapper layers exactly two things on top of upstream: the `opsx sync` call and the config stub.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: user-memory `opsx-package-extraction-open-questions` — decision 4, locked 2026-05-13.',
      },
    ],
    notes:
      "The alternative was a thin wrapper (`opsx init` just runs `openspec init`). Rejected because consumers would still have a two-step adoption (init then sync) and the most common config defaults would still be unset. One command is the right ergonomic.",
  },
  {
    id: 'decisions-codex-global',
    title: 'Locked decision — Codex prompts stay global',
    body: [
      {
        type: 'text',
        content:
          "Codex command prompts are written to `$CODEX_HOME/prompts/` only — not to a project-local path. This matches upstream `openspec init` behavior exactly; the package does not fork that choice.",
      },
      {
        type: 'bullets',
        items: [
          'Consequence: the CI drift-check gate cannot cover the Codex scope (CI runners can\'t write to `$CODEX_HOME`).',
          'Local re-sync still covers Codex — the gap is CI-only, not contributor-local.',
          'A consumer who wants project-local Codex prompts is on a path divergent from upstream — out of scope.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Source: user-memory `codex-placement-matches-upstream` — verified twice against upstream openspec behavior.',
      },
    ],
    notes:
      "Call out the CI gap explicitly so it doesn't go silent. This is the same scope gap the in-repo drift gate ships with today — packaging doesn't change the shape of it.",
  },

  // ───────────────────── Section 3 — THE BIN (3 slides) ─────────────────────
  {
    id: 'bin-overview',
    title: 'One bin, two subcommands',
    body: [
      {
        type: 'bullets',
        items: [
          '`opsx init` — full bootstrap on a fresh consumer repo (locked above).',
          '`opsx sync` — fan templates out to per-tool command paths. Same input/output contract as the current in-repo `bin/opsx-sync`.',
          '`opsx sync --check` — the CI gate variant. Non-zero exit on any divergence from canonical templates.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          '`openspec` is a hard peer dependency. Every generated workflow shells out to the `openspec` CLI; without it, `opsx init` and `opsx sync` exit before mutating any files. The README opens with a Prerequisites section.',
      },
    ],
    notes:
      "Peer-dep gap surfaced during the design pass — call it out here. The package's README MUST say 'install openspec first' as the first sentence after the title.",
  },
  {
    id: 'bin-init-diff',
    title: '`opsx init` on a fresh repo',
    body: [
      {
        type: 'text',
        content:
          'A consumer with a configured private `.npmrc` runs one command and the repo gains an OpenSpec workspace, per-tool command directories, and a commented-out config stub.',
      },
      {
        type: 'diff',
        before:
          '# fresh consumer repo (before)\nmy-service/\n├─ package.json\n├─ src/\n└─ tsconfig.json\n# no openspec/, no .claude/, no .cursor/',
        after:
          '# after: npx opsx init\nmy-service/\n├─ package.json\n├─ src/\n├─ tsconfig.json\n├─ openspec/\n│  ├─ config.yaml      # stubbed, commented-out\n│  ├─ specs/\n│  └─ AGENTS.md\n├─ .claude/commands/opsx/<11 files>\n└─ .cursor/commands/opsx-<11 files>\n# + $CODEX_HOME/prompts/opsx-<11 files>',
        language: 'text',
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'Codex prompts land globally at `$CODEX_HOME/prompts/` per the locked decision above; the rest are project-local.',
      },
    ],
    notes:
      "Use the diff as the centerpiece. The visual contrast does more than any prose about what the bootstrap does.",
  },
  {
    id: 'bin-sync',
    title: '`opsx sync` — the existing generator, repackaged',
    body: [
      {
        type: 'bullets',
        items: [
          'Reads templates from `node_modules/@usertesting/insight-out-opsx/templates/opsx/` (not the consumer\'s working tree).',
          'Writes to per-tool command paths exactly as today\'s in-repo `bin/opsx-sync` does: `.claude/commands/opsx/`, `.cursor/commands/`, and `$CODEX_HOME/prompts/`.',
          'Identical CLI flags: `--check`, `--scope`. No behavior change visible to consumers who used the in-repo script.',
          'Banner comment on every generated file names the package as the source so manual editors are warned.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'The byte-for-byte equality test against this repo\'s current outputs is the load-bearing acceptance criterion: post-extraction `opsx sync` MUST produce a no-op diff against the existing `.claude/commands/opsx/` and `.cursor/commands/opsx/` trees in `openspec-llm`.',
      },
    ],
    notes:
      "Reiterate: this is a port, not a rewrite. The generator's behavior is fixed by the existing in-repo test; the package just changes where the templates live.",
  },

  // ───────────────────── Section 4 — DRIFT (1 slide) ─────────────────────
  {
    id: 'drift-gate',
    title: 'Drift — two CI surfaces, one per repo',
    body: [
      {
        type: 'bullets',
        items: [
          '**Package repo**: `opsx sync --check` runs against an in-repo fixture tree on every PR. Catches "the generator broke" and "a template grew a Claude-ism" before publish.',
          '**Consumer repos** (including this repo post-cutover): the existing drift workflow installs the package and runs `npx opsx sync --check --scope claude,cursor`. Catches direct hand-edits to generated files in the consumer tree.',
          'Both surfaces exclude Codex from `--scope` — CI can\'t write to `$CODEX_HOME`. Contributor-local sync still covers Codex.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'The drift gate\'s structural guarantee — "a hand-edit to a generated file fails CI" — is preserved exactly. Source: opsx-template-sync living spec, drift-check requirement.',
      },
    ],
    notes:
      "Two surfaces, identical failure semantics. The contributor still sees 'edit the canonical template and re-run sync' as the remediation — the only thing that changes is the canonical-template path (now under node_modules).",
  },

  // ───────────────────── Section 5 — ADOPTION (2 slides) ─────────────────────
  {
    id: 'adoption-self-consumer',
    title: 'Adoption — `openspec-llm` is the first consumer',
    body: [
      {
        type: 'text',
        content:
          'This repo dogfoods the package before any external consumer adopts it. The cutover is two PRs, in order, across two repos:',
      },
      {
        type: 'numbered',
        items: [
          'Package repo PR — scaffold, port `bin/opsx-sync` → `bin/opsx.js`, ship `templates/opsx/` byte-for-byte, cut v0.1.0 to the private registry.',
          '`openspec-llm` PR — add the package as a devDependency, repoint the drift-check workflow to consume from `node_modules`, delete the local `bin/opsx-sync`, mark the local `templates/opsx/` deprecated for one release.',
        ],
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'A third follow-up change in this repo (out of scope for v0.1) deletes the local `templates/opsx/` once the package version proves stable.',
      },
    ],
    notes:
      "Two-PR stack across two repos. The parallel-run window is one release long — kept that way by the drift gate, which enforces byte-for-byte equality across both trees during the window.",
  },
  {
    id: 'adoption-external',
    title: 'Adoption — external UT repos in one line',
    body: [
      {
        type: 'text',
        content:
          'Once the package is published, any UT repo with the private registry configured can adopt the full opsx workflow with two commands.',
      },
      {
        type: 'code',
        content: `# 1. Install (peer-dep openspec must be on $PATH first)
npm install --save-dev @usertesting/insight-out-opsx

# 2. Bootstrap
npx opsx init

# Subsequent bumps:
npm update @usertesting/insight-out-opsx && npx opsx sync`,
      },
      {
        type: 'callout',
        tone: 'evidence',
        content:
          'No copy-paste, no submodule, no per-repo customization step. The package IS the source of truth; the consumer\'s tree is generated output.',
      },
    ],
    notes:
      "The pitch in two commands. If the audience takes one image away from this deck, it's this code block.",
  },

  // ───────────────────────── Section 6 — CLOSE (1 slide) ─────────────────────────
  {
    id: 'close-foundation',
    title: 'The foundation this builds on',
    body: [
      {
        type: 'subheading',
        content: 'Two shipped mitigations made this packageable.',
      },
      {
        type: 'bullets',
        items: [
          'Mitigation #3 (`single-source-opsx-templates`) collapsed three drifted workflow trees into one canonical directory + generator + CI gate. Without it, there was no single thing to package.',
          'Mitigation #4 (`tool-agnostic-opsx-templates`) rewrote the bodies in tool-agnostic prose with HTML-comment affordance hints as the only Claude-specific surface. Without it, the package would be silently Claude-only despite the cross-tool fan-out.',
          'Both shipped under RAD-75634 in this repo. The package extraction continues the same ticket and the same dogfooding loop.',
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
    ],
    notes:
      "Close by anchoring the deck's credibility in the two archives. Anything the audience wants to question lives there in full detail.",
  },
]
