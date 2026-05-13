Starting state: brownfield
Cutover: in-place
Ticket: RAD-75634

## Why

The research deck at `apps/presentation/src/decks/research/slides.ts` was
authored by the archived `migration-research-deck` change (2026-05-13). At
the time it shipped, only two mitigations existed for the case study —
`harden-opsx-workflow` and `add-domain-skills`. The deck reflects exactly
that state: a 2-slides-per-mitigation cadence in Section 4, a header doc
listing only those two, and a close-slide that names them as "the two
mitigations." Since then, two more mitigations have shipped under the
same RAD-75634 ticket — `single-source-opsx-templates` (PR #13,
canonical templates + generator + CI gate) and
`tool-agnostic-opsx-templates` (PR #14, prose rewrite + affordance-hint
pattern). The deck is now incomplete: its mitigation count is wrong, it
fails to cite two pieces of work that are arguably more interesting than
the first two, and the dogfooding-loop framing in the close slide is
weaker than it needs to be — the deck *itself* became evidence of its
own gap (the workflow kept revealing more issues after the case study
ended) and we haven't said so.

## What Changes

- **Add 4 new mitigation slides** to Section 4 of the research deck,
  matching the existing 2-slides-per-mitigation cadence:
  - `mitigation-single-source-overview` — what shipped, why, link to
    archive.
  - `mitigation-single-source-architecture` — the canonical-templates
    layer + Node generator + CI drift-check gate; the diagram of how
    `templates/opsx/<id>.md` fans out to three tool-specific paths.
  - `mitigation-tool-agnostic-overview` — what shipped, why, link to
    archive.
  - `mitigation-tool-agnostic-affordances` — the affordance-hint pattern
    in both shapes (single-line + block-level), with the
    augment-never-replace rule and the `pr.md` polling loop as the
    showcase.
- **Update the header doc block** (slides.ts L11–14) to enumerate
  mitigations 1–4 and add archive URLs for the two new ones.
- **Update the Section 4 comment** from "MITIGATIONS SHIPPED (4 slides)"
  to "MITIGATIONS SHIPPED (8 slides)".
- **Reframe the close slide** — replace "The two mitigations shipped
  before this deck was authored" with language that names all four,
  acknowledges the chronology (two before, two after), and uses the
  post-deck mitigations as the strongest evidence yet of the dogfooding
  loop closing on itself.
- **Add two new archive URL constants** at the top of `slides.ts` for
  the two new mitigations, mirroring the existing `HARDEN_ARCHIVE_URL`
  and `SKILLS_ARCHIVE_URL` constants.

## Capabilities

### New Capabilities
<!-- None. This change modifies an existing capability. -->

### Modified Capabilities

- `research-deck-content`: the "Mitigations section links to shipped
  changes" requirement names only two changes; expand to all four. The
  full-deck slide-count requirement (currently 20–30, target ~24) needs
  to lift to accommodate four new slides — proposed 24–34, target ~28.

## Impact

- `apps/presentation/src/decks/research/slides.ts` — 4 new slides
  appended to Section 4, 2 new archive URL constants, edits to the
  header doc, the Section 4 comment, and the close slide. No other
  slides touched.
- `openspec/specs/research-deck-content/spec.md` — modified-spec delta
  expands the mitigation-naming requirement to four changes and bumps
  the slide-count bounds.
- No changes to `apps/presentation/src/decks/workflow/` (the workflow
  deck) or to any other slide-array source.

## Non-code surfaces

- **Config load mechanics**: N/A — the presentation app already builds
  the deck from the static slide array; no config changes.
- **Secret sources**: N/A.
- **Container/deploy artifacts**: N/A — slide content updates only.
- **CI workflow scripts**: N/A — no new workflow needed; the existing
  `apps/presentation` build will catch TS errors if slide shape
  regresses.
- **Observability endpoints**: N/A.

## Out of scope

- Authoring slides about the package extraction phase
  (`@usertesting/insight-out-opsx`) — that phase has not shipped yet
  and belongs in a future deck update.
- Touching the workflow deck.
- Adding new slides outside Section 4 + the close slide + the header
  doc.

## Legacy preservation

The current research deck is brownfield in scope. Preservation rules:

- **Section 1 (Frame), Section 2 (Process), Section 3 (Findings), and
  Section 5 (Learnings) MUST be preserved verbatim** — the case-study
  narrative arc, the five finding classes, and the must-ask/may-decide
  lesson are unaffected by the new mitigations.
- **Slides `mitigation-harden-overview`, `mitigation-harden-marker`,
  `mitigation-skills-overview`, `mitigation-skills-graduation` MUST be
  preserved verbatim** — they accurately describe mitigations #1 and
  #2 and the addition of mitigations #3 and #4 does not change their
  content. The `mitigation-skills-overview` already contains a
  parenthetical noting that workflow skills "later folded into
  templates/opsx/ via the single-source-opsx-templates change" — keep
  the parenthetical; the new slides will cover that change explicitly.
- **The close slide's overall framing MUST be preserved** — it remains
  the dogfooding loop closer. Only the "two mitigations" copy is
  reworded; the structure, link target, and notes section are kept.
- **The slide-array TypeScript shape MUST stay valid** — every new
  slide MUST satisfy the existing `ResearchSlide` type, follow the
  `id`, `title`, `density`, `body`, and `notes` field conventions used
  by current slides, and respect the `body` content-item types
  (`text`, `subheading`, `bullets`, `callout`, `link`, `diff`).

No deletions. No reordering. Word-level diffs only outside the new-slide
inserts.
