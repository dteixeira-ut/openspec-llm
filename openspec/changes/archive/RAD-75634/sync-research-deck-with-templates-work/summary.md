## Change Summary: sync-research-deck-with-templates-work

### What Was Built
Extended the research deck at `apps/presentation/src/decks/research/slides.ts` from 24 to 28 slides by inserting four new mitigation slides covering `single-source-opsx-templates` (#3) and `tool-agnostic-opsx-templates` (#4), each at the existing 2-slides-per-mitigation cadence (overview + drill-down). Updated the header doc block, the Section 4 banner comment, and the close slide so the dogfooding-loop framing names all four shipped mitigations and the before/after chronology.

### Why
The research deck was authored when only two mitigations existed for the case study; two more shipped after it landed. The deck was wrong on count, missed the two arguably more interesting pieces of work, and the dogfooding-loop close was weaker than it needed to be — the deck itself had become evidence of its own gap.

### Key Decisions
- **Two slides per mitigation matching existing cadence** — adding only one slide each for #3 and #4 would have read as "the new ones were less important," which is the opposite of true.
- **Drill-down for #3 uses bullets + callout (architecture focus); drill-down for #4 uses a `diff` content item (affordance pattern)** — `diff` lands the affordance-hint pattern faster than any bullets could; #3's architecture is bullet-shaped, no punchy before/after at slide scale.
- **Living-spec slide-count bounds bumped wider than 4 new slides require** (24–34, not 24–32) — leaves headroom for an eventual package-extraction slide without re-litigating the spec.
- **Close-slide reframe is surgical, not structural** — only the "two mitigations" bullet was rewritten; title, callout, link, and notes preserved. The self-referential framing got stronger, not different.
- **`skills-overview` parenthetical kept** — it remains factually correct and explains why the skills-mitigation framing references `.claude/skills/`.

### Spec Changes
- **research-deck-content**: modified — slide-count bounds widened (full 24–34 target ~28; summary 9–17 target ~13), mitigation-naming requirement expanded to all four shipped changes, close-slide scenario reworded to acknowledge before/after chronology.

### Tasks Completed
**15/15 tasks complete**
- Section 1 — Slide additions and edits (8 tasks): archive URL constants, header doc, Section 4 banner, four new mitigation slides, close-slide bullet
- Section 2 — Verification (7 tasks): build, slide counts (28 total / 16 summary), close-slide spot-check, strict + all-specs validate, opsx-sync clean

### Decisions made without consultation
**From `design.md`**
- Drill-down topic choice per mitigation (architecture for #3, affordance pattern for #4) — Alternative: a different drill-down per mitigation (e.g., drift-check gate for #3; generator warn for #4). Rationale: the chosen drill-downs are the most pedagogically interesting facets and they parallel the existing drill-downs (the silent-decisions marker for #1 is also "the most interesting bit" rather than "the broadest bit").
