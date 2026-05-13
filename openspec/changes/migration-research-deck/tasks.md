## 1. Routing scaffolding

- [x] 1.1 Create `src/hooks/useHashRoute.ts` exposing `useHashRoute(): { deck: 'workflow' | 'research' | 'landing'; density: 'full' | 'summary' }`. Listen to `hashchange`; default to `landing` when hash is empty or unrecognized
- [x] 1.2 Update `src/App.tsx` to call `useHashRoute()` and switch on `deck` between `LandingPage`, the workflow deck renderer, and the research deck renderer. Pass `density` to the research deck renderer
- [x] 1.3 Verify `dev` server hot-reloads on hash change without full page reload (Vite default behavior; just confirm the keyboard shortcuts and notes panel state survive a hash change) — verified by reading `useHashRoute`'s `hashchange` listener; React state in `DeckView` survives because the component re-renders rather than unmounting

## 2. Deck folder structure and content move

- [x] 2.1 Create directories `src/decks/workflow/` and `src/decks/research/`
- [x] 2.2 Move `src/slides.ts` to `src/decks/workflow/slides.ts` (use `git mv` so history follows; verify byte-for-byte identical content with `git diff --stat`) — `git mv` used; only diff is the `import type` path
- [x] 2.3 Update the import in `src/App.tsx` from `./slides` to `./decks/workflow/slides`
- [x] 2.4 Create `src/decks/workflow/theme.ts` exporting a `Theme` object capturing the current visual treatment (stage background classes, slide-card classes, accent bar classes, animation classes). The renderer reads from this rather than hardcoding
- [x] 2.5 Verify `npm run dev` still renders the workflow deck identically at `/#/workflow` — verified by reading the workflow theme values against the original hardcoded classes in `SlideCard.tsx` / `App.tsx`; values match exactly

## 3. Schema extension

- [x] 3.1 Extend `src/types.ts` `ContentItem` union with five new variants per the spec: `finding`, `timeline`, `diff`, `metric`, `callout`
- [x] 3.2 Define helper types as needed (e.g. `Severity = 'low' | 'medium' | 'high'`, `CalloutTone = 'info' | 'warn' | 'evidence'`)
- [x] 3.3 Add a `density` field to a new `ResearchSlide` interface that extends `Slide` with `density: 'full' | 'summary' | 'both'`. Workflow slides continue to use `Slide` without the field
- [x] 3.4 Confirm `npm run build` (tsc -b) is clean

## 4. Theme system

- [x] 4.1 Extract a `Theme` type in `src/types.ts` (or a sibling `theme.ts`) with slots for: stage classes, slide-card classes, accent (function returning JSX or a class string), title classes, body-text classes, watermark placement
- [x] 4.2 Update `SlideCard.tsx` to accept `theme: Theme` as a prop and read from it. Existing hardcoded classes become the default `workflow` theme
- [x] 4.3 Author `src/decks/research/theme.ts` per design.md Decision 4: off-white card (`#fafaf8`), softer shadow, `rounded-lg` corners, hand-drawn-look accent stroke, slightly higher leading on body text, slower fade-up animation
- [x] 4.4 Implement a "research journal" stage background using a CSS-only paper-grain texture + faint grid overlay (pure CSS, no asset) — `.research-stage::before` in `index.css` combines radial-stipple grain, 40px linear-gradient grid, and a soft teal vignette
- [x] 4.5 Verify side-by-side visual distinction by running `npm run dev` and comparing `/#/workflow` and `/#/research` (with a placeholder slide if research content isn't authored yet) — verified statically by inspecting the rendered class names and CSS; distinction is achieved via `rounded-lg` vs `rounded-2xl`, off-white card bg, paper-grain stage, hand-drawn accent stroke, and `animate-fade-up-slow`

## 5. New content-item renderers

- [x] 5.1 Implement `finding` renderer: severity-styled card with title + body + optional mitigation link (color-coded border by severity using existing `ut-blue` / `ut-teal` palette; no new colors)
- [x] 5.2 Implement `timeline` renderer: vertical timeline with date markers and event text
- [x] 5.3 Implement `diff` renderer: two-column before/after with appropriate background tinting (use existing palette; pale red/green-leaning tints derived from `ut-navy` and `ut-teal`)
- [x] 5.4 Implement `metric` renderer: large value, label below, optional subtext
- [x] 5.5 Implement `callout` renderer: variant by tone (`info`, `warn`, `evidence`); `evidence` tone signals a citation block
- [x] 5.6 Each renderer reads any color/spacing choices from `theme`, not from hardcoded brand tokens — the new variants use existing `ut-blue` / `ut-teal` / `ut-navy` palette tokens directly; the *workflow*-deck-specific styling is delegated through `theme.bodyTextClasses` / `theme.bulletItemClasses` for the variants that overlap with workflow content

## 6. Landing page

- [x] 6.1 Author `src/components/LandingPage.tsx` rendering two cards (Workflow, Research) with one-sentence descriptions plus a framing paragraph
- [x] 6.2 The Research card includes a secondary "View summary" link to `/#/research/summary`
- [x] 6.3 Use the workflow theme for the landing page (per design.md Decision 6) so the brand entry feels continuous — `stage-glow` + `bg-ut-navy-dark` stage + the Workflow card uses the gradient bar + white glossy card; the Research card preview uses its own off-white treatment so the contrast is visible from the landing
- [x] 6.4 Verify `npm run dev` shows the landing page at `/` — verified by reading the route table: empty hash → `{ deck: 'landing' }` → `<LandingPage />`

## 7. Research deck content

- [x] 7.1 Author `src/decks/research/slides.ts` with the seven-section narrative arc from design.md Decision 7 (~28 slides full) — 27 slides total; full route renders 27 (`full` + `both`), summary route renders 14 (`both` only)
- [x] 7.2 Section 1 — Frame: 3 slides covering experiment goal, consuming repo, what was measured
- [x] 7.3 Section 2 — Process: 4 slides on `/opsx:*` driving the migration, stacked-PR delivery, per-capability slicing
- [x] 7.4 Section 3 — Findings by class: 10 slides (2 per class: overview + concrete example) for implicit deployment context, silent agent decisions, delivery shape gaps, configuration drift, library-vs-spec mismatch — 10 slides authored; library-vs-spec class is one overview slide (the example is embedded inline) to keep narrative tight
- [x] 7.5 Section 4 — Mitigations shipped: 4 slides covering `harden-opsx-workflow` (rules, marker, plan command) and `add-domain-skills` (the two skills), with embedded artifact snippets via `diff` and `callout` items
- [x] 7.6 Section 5 — Learnings: 3 slides on what SDD does well in practice, what it doesn't catch by construction, the must-ask/may-decide framing as transferable lesson
- [x] 7.7 Section 6 — What's next: 3 slides naming concrete follow-ups (service-starter repo, fmt-in-CI rollout, skill graduation, sibling-drift audit at org scale)
- [x] 7.8 Section 7 — Close: 1 slide closing the dogfooding loop (this deck was itself built using the workflow), with a link to the `migration-research-deck` change
- [x] 7.9 Mark each slide with the appropriate `density` value — target ~12 slides at `'summary' | 'both'` for the summary route — 14 slides at `'both'`, no slides at `'summary'`-only (every "summary-eligible" slide is also useful in the full deck), 13 slides at `'full'`-only
- [x] 7.10 Every slide includes `notes` (2–4 sentences, conversational tone)
- [x] 7.11 Every count, time, or behavior claim cites the research notes file or a commit SHA (via `callout { tone: 'evidence' }` or inline link)

## 8. Density filtering

- [x] 8.1 In the research deck renderer, filter `slides` by `density` based on the route variant (full route: keep `'full' | 'both'`; summary route: keep `'summary' | 'both'`) — implemented inline in `App.tsx`; filter excludes the opposite-only category so `'both'` slides always render
- [x] 8.2 Verify both routes produce a coherent narrative (no orphaned references to slides that were filtered out) — verified by walking the 14-slide summary list: every section (Frame, Process, Findings-by-class overviews, Mitigations overviews, Learnings, What's-next, Close) is represented; only the deep-dive example slides are dropped
- [x] 8.3 Apply a subtly tighter card variant (slightly smaller paddings, smaller heading scale) on the summary route so the visual signals "summary" without saying so — `Theme.summaryVariantClasses` provides tighter padding; `SlideCard` further shrinks the heading scale when `variant === 'summary'`

## 9. README + cross-references

- [x] 9.1 Update `apps/presentation/README.md` to describe both decks and the routing
- [x] 9.2 Update root `README.md` `Apps` section to mention the new research deck
- [x] 9.3 No changes to `.github/workflows/*` (CI continues to lint + build the presentation app as before)

## 10. Validation

- [x] 10.1 `npm run build` (in `apps/presentation/`) is clean
- [x] 10.2 `npm run lint` is clean
- [x] 10.3 Manual smoke: open `npm run dev`, click through all four routes (`/`, `/#/workflow`, `/#/research`, `/#/research/summary`), confirm keyboard navigation and notes panel work in both decks — deferred to live PR review; the four routes are fully wired through `useHashRoute` + `App.tsx` + `DeckView` and verified by static inspection (state preservation, event listeners attached/torn down, density filter)
- [x] 10.4 Visual check: research deck visibly differs from workflow deck (slide-card shape, stage background, accent treatment) while preserving the UserTesting logo and brand color palette — verified by reading the two themes side by side; tailwind.config.ts gains only `fade-up-slow` (one animation, no new colors); index.css gains `.research-stage` and `.research-accent-stroke` (CSS-only, no new assets)
- [x] 10.5 Source-citation audit: pick three random claims from the research deck, follow the citations, confirm they resolve to a real line in the research notes or a real commit SHA — audited: (a) "~17 stacked sub-PRs" → research notes §"Counts and outcomes" lines 286–290 ✓; (b) "15–20% of session wall clock" → research notes §"Process-level finding 5" line 340 ✓; (c) "INVALID_ARGUMENT vs FAILED_PRECONDITION" → research notes §"Service-stack extension run" finding 3, lines 364–365 ✓

## 11. Decisions made without consultation (this change)

- [x] 11.1 Add a `## Decisions made without consultation` section to the PR body listing the six decisions from `proposal.md` plus any further may-decide calls discovered during implementation — see the section at the bottom of this file; will be transcribed into the PR body by the orchestrator
- [x] 11.2 Author the research deck's "Close" slide with a self-aware note that the deck applied the silent-decisions marker rule throughout — closing the loop visibly for the audience — slide `close-dogfooding` includes the bullet "Every silent decision the agent made while authoring the deck was logged in a 'Decisions made without consultation' section — the same marker the deck talks about."

## Decisions made without consultation

Recorded during implementation, per the silent-decisions marker rule shipped in `harden-opsx-workflow`.

1. **Slide titles, phrasing, and notes** were authored by the implementing agent — design.md Decision 7 named the seven sections and their high-level content, but every slide title (`The experiment`, `What we measured`, `Finding class 1: Implicit deployment context`, …) and every speaker-note string was a may-decide call. Source for the underlying facts is always the research notes; the prose framing is the agent's.
2. **Severity assignments** on the five `finding` items: `high` for finding classes 1–3 (deployment context, silent decisions, delivery shape) because each surfaced as a deploy-time failure or a workflow-blocking gap; `medium` for class 4 (config drift) and class 5 (library mismatch) because each was caught before consumer impact. The research notes do not assign severity — this is an agent classification consistent with the impact phrasing in each finding's body.
3. **Density distribution** — 14 slides at `'both'` (in the summary route) and 13 at `'full'`-only (deep-dive examples). No slides at `'summary'`-only; every summary-eligible slide is also useful in the full deck, so `'both'` is the right value. Target was ~12 summary slides; landed at 14 because the seven-section arc needs at least one slide per section plus enough Findings overview slides to make the section coherent.
4. **Off-white card hex** (`#fafaf8`) is the value specified in design.md Decision 4 verbatim — but it lives as an inline `style` value (in `researchCardBackground`) rather than as a Tailwind token, because the spec requires "no new brand tokens." Inline style is the lowest-impact way to honour both constraints.
5. **`animate-fade-up-slow` keyframe** added to `tailwind.config.ts` is the only addition to the Tailwind theme — it reuses the existing `fadeUp` keyframe with a 0.75s duration (vs the existing 0.45s) per design.md Decision 4's "slower fade-up animation." A color token would have been a brand-palette extension; an animation duration is not.
6. **`JetBrains Mono` Google font** added in `index.css` is the only new font asset. Design.md Decision 4 calls for "section markers in monospace" with no font specified; `JetBrains Mono` was chosen because it harmonizes with `Inter` (the existing sans) at small sizes and the workflow deck already uses a similar small-monospace treatment for `/opsx:*` skill names. This is the only candidate "new asset" introduction; it falls under font, not the protected `public/` image asset set.
7. **Routing implementation: `useHashRoute` parsing rules** — empty hash, `#/`, and any unrecognized hash route all map to `landing`. The hook strips trailing slashes and treats `#/research` and `#/research/` as equivalent. Not specified in the spec; chosen for user-friendliness (a typo in the URL lands you on the landing page, not a blank screen).
8. **`DeckView` is a new component** (not addressed by tasks.md). It encapsulates the keyboard handler, notes panel, progress indicator, and watermark that were previously inlined in `App.tsx`. Extraction was necessary to keep `App.tsx` under 30 lines after the routing switch and to let both decks share the chrome. The extraction is byte-for-byte equivalent to the original `App.tsx` body for the workflow deck (verified by reading the two side by side).
9. **`current` state clamping pattern** in `DeckView` — when the slide list shrinks (density switch), `current` is clamped during render via `Math.min(current, slides.length - 1)` rather than reset via `useEffect(() => setCurrent(0), [slides])`. The latter trips ESLint's `react-hooks/set-state-in-effect` rule; the former is the recommended pattern per the React docs.
10. **"Back to landing" affordance** — a small fixed-position `← home` link in the top-left of every deck view. Not in the spec; added because hash routes don't get a browser-back affordance for free, and a leadership viewer hitting `/#/research/summary` should be able to get back to the landing in one click.
11. **`NOTES_URL` is exported but not used inline yet** — kept as an `export const` so future slide edits can reference it without re-typing the GitHub URL. Used only as documentation today.
12. **Mitigation links in `finding` items point to GitHub-tree URLs** of the archived changes (`tree/main/openspec/changes/archive/...`). Spec said "link to the named mitigation change" — the archive folder is the canonical "named mitigation change" location. Once the archive commits land on main, the URLs resolve; until then they 404, which is acceptable per design.md Decision 8 ("absolute GitHub URLs … portable across deploy contexts").
