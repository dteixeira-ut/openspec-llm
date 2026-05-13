## Why

The `openspec-llm` repo has a presentation deck pitching the OpenSpec + Claude workflow as a concept (`apps/presentation/`). What it lacks is the case study: we used the workflow to drive a real NestJS migration of two backend services in the `enriched-video-uploads-v2` repo, captured ~30 distinct findings about how SDD scales under real implementation pressure, and shipped two OpenSpec changes (`harden-opsx-workflow`, `add-domain-skills`) that mitigate the gaps the migration surfaced. That evidence — the experiment, the failures, the fixes, the learnings — is the strongest answer to the open question the existing deck poses ("does this approach work?") and it currently lives only in research notes inside the consuming repo. This change brings it into the presentation app as a second deck so the workflow pitch and the case study can be shown to different audiences from one source-of-truth React app.

## What Changes

- Introduce client-side routing in the presentation app (hash-based, no new dependencies) so the existing workflow deck moves to `/#/workflow` and the new research deck lives at `/#/research`. Add a root landing page at `/` linking to both decks.
- Add a new `research-deck-content` capability containing the slides for the case study: the migration scope, the research methodology, the findings (grouped by class), the two mitigation changes shipped, the open questions and what's next.
- Support **two density levels** for the research deck: `/#/research` (comprehensive, ~25–30 slides for an engineering audience) and `/#/research/summary` (lightning ~10–12 slides for leadership). Both render from one slide source with a `density: 'full' | 'summary'` discriminator per slide so content stays single-source.
- Apply a visually distinct treatment for the research deck — same UserTesting logo and same navy/blue/teal palette, but different slide-card shape, typography scale, and layout feel (research-journal aesthetic vs the workflow deck's pitch-card aesthetic). Theming centralizes in a per-deck config so the workflow deck's visuals are unchanged.
- Extend the existing slide schema (`types.ts`) with the new content types required for the case-study material (timeline, finding-card with severity, before/after-diff, metric box). Existing slides remain valid under the extended schema.

## Capabilities

### New Capabilities
- `research-deck-content`: the slide content and narrative arc for the migration research deck, both density levels, plus the slide-data conventions specific to research material (timeline, finding-card, before/after-diff, metric box).

### Modified Capabilities
- `presentation-shell`: gains routing, a landing page, per-deck theming, and an extended slide schema. Existing workflow deck content is unaffected; the modification is purely additive to the shell.
- `presentation-content`: the existing capability is renamed conceptually to "workflow deck content" but the spec name stays — its existing requirements remain valid and unchanged. A note is added clarifying its scope is now the `/#/workflow` route specifically.

## Impact

- **New files**: routing scaffolding under `apps/presentation/src/router/` (or inline in `App.tsx`), new components for the research-deck slide treatments (`ResearchSlideCard.tsx` or theme-aware extension of `SlideCard.tsx`), a new `apps/presentation/src/decks/research/slides.ts` data file, a landing component, theme config files per deck.
- **Modified files**: `apps/presentation/src/App.tsx` (routing), `apps/presentation/src/types.ts` (extended schema), `apps/presentation/src/slides.ts` (moved into `apps/presentation/src/decks/workflow/slides.ts` or kept in place with a re-export — design decision), README mentions (`apps/presentation/README.md`, root `README.md`).
- **No edits** to `.claude/`, `.github/workflows/`, `openspec/config.yaml`, or the two skills landed under `skills/`. This change is presentation-app-scoped.
- **Build / deploy**: presentation app is Vite + React; build produces `dist/` for static hosting. No build pipeline change; the new routes are client-side hash routing so static hosting still works without a server-side rewrite rule.
- **Non-code surfaces**:
  - Config load: N/A — slide content is bundled at build time.
  - Secrets: N/A — no runtime config, no API calls.
  - Container/deploy artifacts: presentation app deploys as static `dist/` to whatever host the team uses (no Dockerfile in the repo today).
  - CI workflows: existing lint/build CI for the presentation app continues to run; no changes needed.
  - Observability: N/A — static site.
- **Starting state**: brownfield. The presentation app exists; this change extends it.
- **Cutover**: in-place. Existing deck stays accessible at its new route (`/#/workflow`); a redirect from `/` to the landing page is added so users with the existing bookmark land somewhere sensible.
- **Out of scope**:
  - Migrating the case-study content into individually-archived OpenSpec changes — the deck references the existing `harden-opsx-workflow` and `add-domain-skills` archives as evidence, but doesn't re-author them.
  - Generalizing the research deck pattern into a reusable "case study" deck template — single use for now.

## Decisions made without consultation

Per the silent-decisions marker rule from `harden-opsx-workflow`, recording calls made while drafting this proposal:

1. **Hash-based routing** chosen over `react-router` or a History API approach. Reason: zero new dependencies, works on any static host without server-side rewrite rules, and the existing presentation has no router today so this is the lowest-impact addition. Alternative considered: `react-router-dom` (~25KB) — rejected as overkill for three routes.
2. **Single slide source with a `density` discriminator** chosen over two separate slide arrays. Reason: keeps content edits in one place, prevents the summary deck from drifting from the full deck as findings evolve. Alternative considered: two separate `slides.ts` files — rejected as a maintenance burden.
3. **The research deck's visual treatment will be a "research journal / lab notebook" aesthetic** — same logo and palette, but slide cards adopt a paper-on-desk feel (textured background, hand-annotation accents, monospace section markers) rather than the existing pitch-card glossy white card. This is one valid interpretation of "different look, same brand" and the design phase will detail it.
4. **The landing page** is a new minimal route at `/` listing both decks as cards with one-sentence descriptions, NOT a slide. Reason: a slide-shaped landing would imply navigation into a deck; a card-list makes the choice between decks explicit. Alternative considered: redirect `/` directly to `/#/workflow` — rejected because it hides the existence of the second deck.
5. **The research deck embeds artifact diffs from `harden-opsx-workflow` and `add-domain-skills`** as evidence (proposal/design snippets, the silent-decisions marker rule wording, the auditor specs). Reason: shows the workflow being used to fix problems the workflow itself surfaced — closes the loop the existing deck's "is this approach worth adopting?" question opens. Alternative considered: keep the deck abstract — rejected because the embedded evidence is the strongest argument for adoption.
6. **`presentation-content` is NOT renamed** to `workflow-deck-content` despite the conceptual narrowing. Reason: renaming a living-spec capability requires a `RENAMED Requirements` block plus updates to the existing spec file, the change archive, and the drift monitor's references — high friction for a cosmetic improvement. Instead, a note is added to the spec clarifying scope. Alternative considered: full rename — rejected as cost without proportionate benefit.
