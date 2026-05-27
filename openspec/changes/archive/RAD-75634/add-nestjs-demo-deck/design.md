## Context

The presentation app under `apps/presentation/` is a Vite + React 19 + Tailwind static site that already hosts three decks behind a small hash-routed shell. Each deck is a `slides.ts` + `theme.ts` pair under `src/decks/<name>/`, consumed by a shared `DeckView` renderer that reads brand-token / shape decisions from the deck's `Theme`. Routing is a 35-line `useHashRoute` hook that parses `window.location.hash` into `{ deck, density }`.

The `migrate-to-nestjs` skill (in `skills/migrate-to-nestjs/SKILL.md`) is the artifact this deck is about. The skill was extracted from a real two-service NestJS migration tracked at `enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md`. The two open integration→main PRs (#253, #256) are the concrete output of that migration; the skill is the *reusable distillation* of what was learned doing it.

The deck's job is **narrative compression**: convey to engineers AND leadership in ~7 slides what the skill exists for, what it cost to extract, what's portable now, and where to dig deeper (PR URLs, SKILL.md, the research notes).

## Goals / Non-Goals

**Goals:**

- Add a fourth deck that opens at `/#/nestjs-demo`, themed distinctly from the other three but using only existing brand tokens.
- Ship 7 slides ordered story-first: provenance → numbers → the two PRs → the skill → procedure → build gate → what's portable.
- Surface the four "fed-back" artifacts: the build-gate model, the rebase recipe, the two sibling-inspection checklists, and the must-ask classes — so a reader leaves knowing what future migrations consume.
- Update the landing page so the new deck is a first-class entry point alongside the existing three.

**Non-Goals:**

- Re-tell the case study. The research deck already does that; the nestjs-demo deck cites it but does not duplicate it.
- Author summary/full density variants. The deck has a single length only (same posture as `package-extraction`).
- Touch the existing three decks' `slides.ts` / `theme.ts` content.
- Add a build step for slide-content-from-markdown or any new authoring tool. Slides remain hand-authored TS literals like the existing decks.
- Add or remove any runtime npm dependency.
- Generate slides from SKILL.md or the research notes automatically. The deck is a manual compression; automation would defeat the editorial point.

## Decisions

### Decision 1: Theme — solid `ut-navy` accent bar, otherwise mirrors the workflow card shape

Picked because the other three accents are claimed (workflow's gradient, research's hand-drawn stroke, package-extraction's solid `ut-teal`) and a fourth needs to be visually distinct without introducing a new brand color. Solid `ut-navy` reads as heavier / more sectional, which fits a "procedure-and-evidence" deck. Card shape, padding, and watermark mirror `workflowTheme` so the deck reads as a sibling of the existing pitches rather than its own visual family.

**Alternatives rejected:**

- `bg-gradient-to-r from-ut-blue to-ut-teal` — visually closer to workflow's gradient; risks reading as "workflow v2."
- Code-tinted card background — most narratively honest but a larger theme-work surface; not worth the cost for a 7-slide deck.

### Decision 2: Slide narrative order — story-first, not procedure-first

The deck opens with provenance (slide 1) and the by-the-numbers evidence (slide 2) before the skill is named (slide 4). Confirmed in explore after the user said *"the skill doesn't capture what was done, so this deck is a summary of more than just the skill."* This ordering also lets a leadership audience leave after slide 3 with the takeaway and lets engineers read slides 4–7 as the procedure framed by its provenance.

**Alternatives rejected:**

- Skill-first: title → when-to-use → procedure → PRs → numbers → lessons. Rejected because anyone who reads SKILL.md gets ~80% of that ordering for free; the deck's unique value is the journey.

### Decision 3: PR summaries are high-level only — one combined slide for #253 and #256

The two open PRs are the *integration→main* consolidation PRs (sub-PRs already merged, archive ran for BFF). Confirmed in explore that we don't walk the sub-PR chain. One slide with two metric blocks: PR number, sub-PR count, additions/deletions, key dependencies swapped. Deeper detail lives in the linked PR bodies.

**Alternatives rejected:**

- Per-sub-PR narrative (~13+14 sub-PRs as a stack timeline). Rejected as duplicating the research deck and busting the brief.
- PRs as appendix only. Rejected because the PR URLs ARE the load-bearing artifact for a reader who wants to verify the claims.

### Decision 4: Landing-page slot — fourth top-level card in a 2×2 / lg:4-col grid

Update `LandingPage.tsx` from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`. Header copy updates "Three decks. One workflow." → "Four decks. One workflow." Framing paragraph gains one sentence introducing the nestjs-demo card. Confirmed in explore.

**Alternatives rejected:**

- Sub-route under research (research/skill-walkthrough). Rejected because the new deck stands alone; nesting it under research would suggest dependency that doesn't exist.
- 2×2 only (`md:grid-cols-2`). Rejected because on wide screens the four cards in one row read as more deliberate.

### Decision 5: Slide-count bound — exactly 7 slides

Lower than `package-extraction-deck-content`'s 10–14 bound because this deck is explicitly "very brief." A 7-slide bound encodes the user's "very brief walk through" directive in the spec so future contributors can't drift to a 12-slide skill workshop.

**Alternatives rejected:**

- 6–9 bound (more flexibility). Rejected; the discipline of "exactly 7" forces editorial choices the deck needs to make.

### Decision 6: Content traceability requirement — every count, date, or behavioral claim cites a source

Every slide that makes a numerical claim ("17 stacked sub-PRs", "~18 rebases", "13 sub-PRs absorbed by #253") MUST cite one of: SKILL.md, a PR URL, or `sdd-exploration-notes.md`. This mirrors the research-deck rule that "every claim about counts, time, or behavior in the research deck must cite the research notes." The deck is "narrative compression" — that compression has to remain auditable.

**Alternatives rejected:**

- Implicit citation (links elsewhere in the deck). Rejected because slide-local traceability is what makes the deck verifiable when read out of order.

## Delivery shape

- **PR shape**: single PR. The change is small (one new deck + a handful of edit sites in 4 existing files), no cross-cutting infrastructure, no integration branch needed.
- **Base branch**: `main`.
- **Repo merge-method**: `squash` (per repo settings; no rebase recipe needed because the stack is one PR deep).
- **`/opsx:*` invocations**:
  - propose-end (now): `/opsx:propose` produces proposal, design, specs, tasks.
  - implementation: `/opsx:apply add-nestjs-demo-deck` runs `tasks.md` end-to-end.
  - capability-end (none — single capability): `/opsx:review` once at implementation end, before PR open.
  - PR open: `/opsx:pr`.
  - post-merge: `/opsx:archive add-nestjs-demo-deck`. The post-archive hook fires `/opsx:summarize` automatically (per `openspec/config.yaml`).

## Risks / Trade-offs

- **Risk**: the `Theme.name` union is a closed string-literal type. Forgetting to thread `'nestjs-demo'` through every type-narrowing site would surface as a TS build error. → **Mitigation**: tasks include an explicit `npm run build` gate; the type system catches it by construction.
- **Risk**: landing-page grid change at the `md` breakpoint could visually regress the existing three-card layout on tablets. → **Mitigation**: tasks include a manual viewport check at `md` (768px) and `lg` (1024px) before declaring done; if the 2×2 collapses awkwardly, fall back to `md:grid-cols-3 lg:grid-cols-4` (research card retains its current treatment as the visual outlier).
- **Risk**: slide content drift — counts cited in slides could become stale as the migration evolves. → **Mitigation**: the spec includes a content-traceability rule (cite SKILL.md / PR URL / research notes for every number) so a future contributor knows where to verify before editing.
- **Trade-off**: the 7-slide hard bound vs the deck's narrative ambition. We're encoding brevity at the expense of room to grow. If the deck proves valuable and the audience asks for more depth, the spec's bound is the place to revisit — not the slide module.
- **Trade-off**: hand-authored slides (TS literals) vs. some markdown-to-slides pipeline. We're keeping authoring identical to the other three decks, which preserves the editorial muscle the team already has but means slide edits are PRs against TS, not markdown.

## Migration Plan

Not applicable — this is an additive change with no data migration. The deploy is `npm run build && vite deploy` (whatever the host repo's pattern is); rollback is reverting the merged commit. No feature flag is needed because the new route does not affect the existing routes' behavior.

## Open Questions

None at write time. All four user-facing decisions were captured via `AskUserQuestion` in explore mode; remaining choices (slide-count bound, content-traceability rule, accent reuse vs new) are documented as design decisions above.
