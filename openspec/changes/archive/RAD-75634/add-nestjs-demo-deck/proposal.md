Starting state: brownfield
Cutover: in-place

## Why

The `migrate-to-nestjs` skill (in `skills/migrate-to-nestjs/`) captures the *procedure* extracted from a real two-service NestJS migration but not its *provenance* — anyone reading `SKILL.md` cold gets the steps without learning what migration produced them, what cost the team paid to extract them, or what reusable artifacts (recipes, must-ask classes) came out the other side. The presentation app already hosts a workflow pitch, a research case study, and a package-extraction pitch; it needs a fourth, narrowly-scoped deck that does the **narrative compression** the skill file cannot — a ~7-slide walkthrough that lands for both engineers (procedure detail) and leadership (story, numbers, what's portable now). The two open integration PRs in `enriched-video-uploads-v2` (#253 `migrate-bff-foundation`, #256 `migrate-service-foundation`) are the concrete artifacts the deck points at as evidence.

## What Changes

- Add a new deck `nestjs-demo` to the presentation app — slide module + theme file under `apps/presentation/src/decks/nestjs-demo/`.
- Extend the `Theme.name` string-literal union in `apps/presentation/src/types.ts` to include `'nestjs-demo'`.
- Extend the `Deck` type and `parseHash` in `apps/presentation/src/hooks/useHashRoute.ts` to recognize `/#/nestjs-demo`.
- Route `nestjs-demo` to `DeckView` in `apps/presentation/src/App.tsx`.
- Add a fourth deck card to the landing page (`apps/presentation/src/components/LandingPage.tsx`), changing the grid from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4` and updating the header copy ("Three decks." → "Four decks.") and the framing paragraph.
- Visual treatment: solid `ut-navy` accent bar (distinct from workflow's gradient, research's hand-drawn stroke, and package-extraction's solid `ut-teal`); no new brand tokens.
- Deck content: 7 slides ordered story-first (provenance → numbers → the two PRs → the skill → procedure → build gate → what's portable). Slide bodies cite SKILL.md, PR URLs, and `sdd-exploration-notes.md` for traceability.

No content in the existing workflow, research, or package-extraction decks changes. No new runtime dependencies are added.

## Capabilities

### New Capabilities

- `nestjs-demo-deck-content`: Authoring rules for the new deck's slide module — file location, export shape, slide-count bound, content-traceability requirement (every count/claim cites SKILL.md, a PR URL, or `sdd-exploration-notes.md`), and the deck's narrative-order contract (story-first ordering: provenance before procedure).

### Modified Capabilities

- `presentation-shell`: The hash-routing requirement, landing-page requirement, and themability requirement currently enumerate exactly three decks. Each grows by one (`nestjs-demo`), the landing grid class changes, the header copy changes, and the `Theme.name` union extends. No existing scenario for workflow/research/package-extraction is altered in behavior — they keep rendering identically.

## Impact

- **Code**: `apps/presentation/src/types.ts`, `apps/presentation/src/hooks/useHashRoute.ts`, `apps/presentation/src/App.tsx`, `apps/presentation/src/components/LandingPage.tsx`, new files under `apps/presentation/src/decks/nestjs-demo/`.
- **Tests / build**: `npm run build` (tsc + vite build) must remain green; the closed `Theme.name` union will surface a type error at any edit site that forgets to thread the new value.
- **Specs**: one new `specs/nestjs-demo-deck-content/spec.md`; one delta against `specs/presentation-shell/spec.md`.
- **Dependencies**: none added or removed.
- **External systems**: none. The deck references two GitHub PRs (#253, #256) as external links and `sdd-exploration-notes.md` as a relative path within a sibling repo — content-only references, no integration.

## Non-code surfaces

- **Config load mechanics**: N/A — the presentation app is a static Vite build with no runtime config; deck content is compiled into the bundle.
- **Secret sources**: N/A — no secrets; the deck displays only public-facing content (PR numbers, file paths, counts from the research notes).
- **Container/deploy artifacts**: N/A — the presentation app is shipped as a static asset bundle; no Dockerfile / helm / argocd change accompanies this deck.
- **CI workflow scripts**: `npm run build` and `npm run lint` in `apps/presentation/` must remain green. No CI workflow file changes are required; the existing presentation-app gates exercise the new files automatically.
- **Observability endpoints**: N/A — the app emits no telemetry.

## Legacy preservation

This change is **purely additive** for behavior — workflow, research, and package-extraction decks must continue to render identically. The files in scope and the preservation contract for each:

- `apps/presentation/src/types.ts` — extend the `Theme.name` union; **preserve**: existing `'workflow' | 'research' | 'package-extraction'` members and every other type export in the file. No behavior change.
- `apps/presentation/src/hooks/useHashRoute.ts` — extend `Deck` union and `parseHash`; **preserve**: existing route resolution for `/#/workflow`, `/#/research`, `/#/research/summary`, `/#/package-extraction`, and the landing fallback. Add a new branch only.
- `apps/presentation/src/App.tsx` — add a route branch for `nestjs-demo`; **preserve**: every existing render path including the research density filter logic.
- `apps/presentation/src/components/LandingPage.tsx` — add a fourth card and change grid class; **preserve**: the existing three cards' visual content (titles, blurbs, accent bars, hrefs) byte-for-byte. **Diverge**: grid class (`md:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-4`), header copy ("Three decks." → "Four decks."), and the framing paragraph (add one sentence naming the new deck). The hero-zoom animation logic stays unchanged.
- `apps/presentation/src/components/SlideCard.tsx` — **no preservation required**; the theme-driven renderer already consumes whatever `Theme` shape it's given. No edits expected.
- `apps/presentation/src/components/DeckView.tsx` — **no preservation required**; consumes `Slide[]` and `Theme` polymorphically. No edits expected.

The existing decks' `slides.ts` and `theme.ts` files are **not touched** by this change.

## Decisions made without consultation

- **Slide count target: 7.** Confirmed in explore as "~7 slides (Recommended)" via `AskUserQuestion`. Captured here for traceability, not as a unilateral call.
- **Accent treatment: solid `ut-navy` bar.** Confirmed in explore via `AskUserQuestion` preview. Captured here for traceability.
- **PR scope: high-level summary of #253 + #256 only, not the sub-PR chain.** Confirmed in explore via `AskUserQuestion`.
- **Landing slot: fourth top-level card in a 2×2/4-col grid.** Confirmed in explore via `AskUserQuestion`.
- **Slide narrative order: story-first (provenance → numbers → PRs → skill → procedure → build gate → what's portable), not procedure-first.** Discussed in explore after the user pushed back on a skill-first ordering ("the skill doesn't capture what was done, so this deck is a summary of more than just the skill"). Captured here so the ordering survives implementation.
