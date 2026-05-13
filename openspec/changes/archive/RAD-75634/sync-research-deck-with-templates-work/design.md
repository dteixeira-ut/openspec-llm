## Context

The research deck was authored before two of the four mitigations
existed. The narrative arc, the finding classes, and the existing
mitigation slides are all accurate; only Section 4 is incomplete and the
header doc + close slide reference an outdated count. This change adds
two-slide treatments for `single-source-opsx-templates` and
`tool-agnostic-opsx-templates` matching the existing cadence, plus three
small surgical edits (header doc, section comment, close slide) to
reflect the new mitigation count.

## Goals / Non-Goals

**Goals:**
- Cover mitigations #3 and #4 with the same 2-slide depth as #1 and #2.
- Keep the existing narrative arc, finding classes, and other mitigation
  slides untouched.
- Update the living spec so the deck's contract matches its new shape.
- Strengthen the dogfooding-loop framing in the close slide using the
  fact that two more mitigations shipped AFTER the deck was authored.

**Non-Goals:**
- Reframing or reorganizing the deck.
- Touching the workflow deck.
- Authoring slides for the package-extraction phase (`@usertesting/insight-out-opsx`)
  — that work hasn't shipped yet.
- Changing the slide rendering shell or theme.

## Decisions

### 1. Two slides per mitigation, matching the existing cadence

Mitigations #1 and #2 each get an overview slide and a drill-down slide
(harden gets the silent-decisions marker; skills gets the graduation
criteria). Adding only one summary slide for #3 and #4 would be
lopsided. The drill-downs we choose are:
- **#3 single-source-opsx-templates** — drill-down on the
  canonical-templates + generator + CI-gate architecture. The
  pedagogically interesting bit is that three drifted trees collapsed
  to one source, with a generator that fans out and a CI gate that
  catches regressions.
- **#4 tool-agnostic-opsx-templates** — drill-down on the affordance-hint
  pattern in two shapes (single-line + block-level), with the
  augment-never-replace rule and the `pr.md` polling loop preservation
  as the showcase. This is the more novel pattern of the two; it
  warrants the explicit drill-down.

**Alternative considered:** one slide per mitigation (minimal patch).
Rejected — Section 4 would be 4 + 1 + 1 = 6 slides total, with #1 and
#2 still getting two slides each and #3 and #4 getting one. The
inconsistency reads as "the new ones were less important," which is the
opposite of true.

### 2. Drill-down for #4 uses `diff` content type to show the affordance pattern

The affordance-hint pattern is best shown by example. The drill-down
slide uses the existing `diff` content variant (already used by other
slides like `mitigation-harden-marker`) with `before` showing a
Claude-flavored step and `after` showing the same step with the
HTML-comment affordance hint + tool-agnostic prose. This communicates
the pattern faster than bullets would.

### 3. Drill-down for #3 uses `bullets` and `callout`, no diff

The single-source change is architecturally significant but doesn't
have a punchy before/after diff at the slide level (the diffs are
across hundreds of lines and three trees). Bullets covering the
architecture + a `callout` quoting the spec's "no other location SHALL
contain hand-authored opsx workflow bodies" requirement land better.

### 4. Living-spec slide-count bounds bump

Current bounds: full deck 20–30 (target ~24), summary 9–16 (target ~12).
Adding 4 slides shifts those:
- Full deck: 24–34 (target ~28).
- Summary: 9–17 (target ~13) — assumes one of the four new slides is
  marked `density: 'both'` and the others `'full'`. The summary deck
  gains at most one or two slides.

The 4-slide-wide bound on the upper end stays (so 24–34 not 24–32) to
leave room for the eventual package-extraction slide(s) without
re-bumping the spec.

### 5. Close-slide reframe is surgical, not structural

The close slide keeps its title, callout, and notes section. Only the
"two mitigations" bullet is rewritten and one additional bullet is
appended that names the post-deck mitigations and uses them as the
strongest possible evidence of the dogfooding loop. The self-reference
joke ("a deck about itself") still lands — arguably harder, since now
the deck is *also* evidence of its own gap.

### 6. New archive-URL constants follow the existing naming convention

Add `SINGLE_SOURCE_ARCHIVE_URL` and `TOOL_AGNOSTIC_ARCHIVE_URL` at the
top of `slides.ts` next to `HARDEN_ARCHIVE_URL` and
`SKILLS_ARCHIVE_URL`. Point at `openspec/changes/archive/RAD-75634/`
subdirectories (not `2026-05-13-...` flat layout — both new mitigations
are under the ticket-scoped archive tree introduced by
`harden-opsx-workflow`).

## Delivery shape

- **PR shape**: one PR. Scope is bounded.
- **Base branch**: `main`.
- **Repo merge-method**: `squash`.
- **Named `/opsx:*` invocations per boundary:**
  - propose-end: `/opsx:propose` (this run)
  - capability-start: `/opsx:apply sync-research-deck-with-templates-work`
  - capability-end: `/opsx:review` then `/opsx:pr`
  - archive: `/opsx:archive sync-research-deck-with-templates-work` (after merge)

## Risks / Trade-offs

- **[Risk] A future fifth mitigation requires another bound bump.**
  Mitigation: the upper bound is intentionally set wider than 4 new
  slides require (we go to 34, not 32), leaving 2 slides of headroom.
  When the package extraction ships, one more slide can land without
  re-litigating the bound.
- **[Risk] The drill-down for #4 over-explains affordance hints to an
  audience that may not care.** Mitigation: the slide uses the
  density-based show/hide pattern; if too detailed, the slide can be
  flipped to `density: 'full'` only so the summary deck shows just the
  overview.
- **[Trade-off] We're documenting the workflow's own iteration cycle as
  part of the research deck.** This makes the deck slightly more
  introspective. Accepted — it's the strongest evidence for the
  dogfooding claim the deck makes.

## Open Questions

- Whether to backfill the existing `mitigation-skills-overview`
  parenthetical (which mentions `templates/opsx/` was a later
  consolidation) to remove the parenthetical now that #3 has its own
  slide. Recommendation: leave it — the parenthetical is still factually
  correct and explains why the skills mitigation's framing references
  `.claude/skills/`.

## Decisions made without consultation

- **Drill-down topic choice per mitigation** (architecture for #3,
  affordance pattern for #4) is established here in this design and
  applied in tasks. Alternative: pick a different drill-down (e.g.,
  for #3 the drift-check gate as a stand-alone topic; for #4 the
  generator warn rather than the hint pattern). Rationale: the chosen
  drill-downs are the most pedagogically interesting facets and they
  parallel the existing drill-downs (silent-decisions marker for #1
  is also "the most interesting bit" rather than "the broadest bit").
