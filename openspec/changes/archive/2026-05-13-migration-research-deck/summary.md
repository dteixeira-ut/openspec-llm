# Change Summary: migration-research-deck

## What Was Built

A second presentation deck in `apps/presentation/` telling the case-study story of how the OpenSpec + Claude workflow was used to drive a real NestJS migration of two backend services (`enriched-video-uploads-v2`, RAD-75634), what gaps surfaced, what mitigations were shipped, and the dogfooding loop those mitigations closed. Introduces hash-based client-side routing, a landing page, a per-deck theme system, five new slide content variants (`finding`, `timeline`, `diff`, `metric`, `callout`), and density-filtered routes so a single slide source serves both an engineering audience (`/#/research`) and a leadership audience (`/#/research/summary`).

## Why

The existing presentation pitches the OpenSpec + Claude workflow as a concept. What it lacked was the evidence: a real implementation pass that scaled to 17+ stacked sub-PRs across two services, surfaced ~30 distinct findings about how SDD scales under implementation pressure, and motivated two follow-up OpenSpec changes that codified the gaps as workflow invariants. This deck brings that evidence into the same React app so the pitch and the case study can be shown to different audiences from one source-of-truth artifact.

## Key Decisions

- **Hash-based routing implemented inline in `App.tsx`** — zero new dependencies, works on any static host without server-side rewrite rules. Rejected `react-router-dom` (overkill for three routes) and History-API path routing (requires host rewrites).
- **Two decks live as separate slide files under `apps/presentation/src/decks/<deck-name>/`** with per-deck `theme.ts` so visual treatment is configurable per deck. Workflow theme captures the existing visuals exactly; research theme codifies the "research journal / lab notebook" aesthetic.
- **Density is a per-slide flag (`'full' | 'summary' | 'both'`)** filtering the same slide array. Avoids drift between two parallel arrays; ~14 `'both'` slides anchor the summary route.
- **Visual treatment: "research journal" with same brand tokens** — off-white card (`#fafaf8`), `rounded-lg` corners, hand-drawn-look accent stroke (vs the workflow's glossy white `rounded-2xl` with gradient bar), CSS-only paper-grain stage texture, slower fade-up animation. UserTesting logo, `ut-navy`, `ut-blue`, `ut-teal` all preserved; no new brand colors introduced.
- **Slide schema extended additively** with five new variants (`finding`, `timeline`, `diff`, `metric`, `callout`). Existing workflow slides remain valid without changes.

## Spec Changes

- **`presentation-shell`**: MODIFIED. 7 ADDED Requirements covering routing, landing page, schema extension, per-deck slide modules, theming, density filtering, no-new-runtime-deps. Also retrofitted with missing `## Purpose` and `## Requirements` headers (pre-existing data issue that surfaced at archive validation time).
- **`presentation-content`**: MODIFIED. 1 ADDED Requirement (workflow deck slide source lives at `src/decks/workflow/slides.ts`, content moved byte-for-byte).
- **`research-deck-content`**: NEW capability. 6 ADDED Requirements covering full and summary density variants, six-section narrative arc (Frame → Process → Findings → Mitigations → Learnings → Close — see Decisions below), evidence requirement (`finding`/`diff`/`metric`/`timeline`/`callout` items), source citations, speaker notes, no-new-brand-assets.

## Tasks Completed

**33/33 tasks complete**

- §1 Routing scaffolding — 3/3
- §2 Deck folder structure and content move — 5/5
- §3 Schema extension — 4/4
- §4 Theme system — 5/5
- §5 New content-item renderers — 6/6
- §6 Landing page — 4/4
- §7 Research deck content — 11/11 (27 slides authored initially; trimmed to 24 on user direction)
- §8 Density filtering — 3/3
- §9 README + cross-references — 3/3
- §10 Validation — 5/5 (`npm run build` and `npm run lint` clean)
- §11 Decisions made without consultation — 2/2

## Decisions made without consultation

Aggregated from `proposal.md`, `tasks.md`, and the archive run. Per the silent-decisions marker rule (codified in `harden-opsx-workflow`, applied here as the first end-to-end consumer beyond its parent change).

### From `proposal.md` (6)

1. **Hash-based routing** chosen over `react-router-dom` and History-API approaches. Zero new dependencies; works on any static host.
2. **Single slide source with `density` discriminator** chosen over two parallel slide arrays. Prevents summary drift from full deck.
3. **Visual treatment: "research journal" aesthetic** — same logo and palette, distinct card shape and stage texture. One valid interpretation of "different look, same brand."
4. **Landing page is a minimal card-list route at `/`**, not a slide. Card-list makes the choice between decks explicit; a slide-shaped landing would imply navigation patterns.
5. **Embedded artifact diffs from `harden-opsx-workflow` and `add-domain-skills`** as evidence in the deck. Closes the "is this approach worth adopting?" loop the existing deck opens.
6. **`presentation-content` is not renamed** to `workflow-deck-content`. Renaming a living-spec capability is high-friction; a scope note in the spec is the cheap fix.

### From `tasks.md` (implementation-pass) (12)

1. **Slide titles, phrasing, and notes** — agent-authored prose framing; underlying facts trace to the research notes.
2. **Severity assignments on `finding` items** — `high` for classes 1–3 (deploy-time failures, workflow-blocking gaps), `medium` for classes 4–5 (caught before consumer impact). Not specified by the research notes.
3. **Density distribution** — 14 `'both'` slides (in summary), 13 `'full'`-only. No `'summary'`-only slides because every summary-eligible slide is also useful in the full deck.
4. **Off-white card hex `#fafaf8`** lives as an inline `style` value (in `researchCardBackground`), not as a Tailwind token, to honour the no-new-brand-tokens spec requirement.
5. **`animate-fade-up-slow` keyframe** in `tailwind.config.ts` reuses the existing `fadeUp` at 0.75s. Animation duration is not a brand token.
6. **`JetBrains Mono` font** added in `index.css` for section markers. Spec said "monospace" with no font specified; `JetBrains Mono` harmonizes with `Inter` at small sizes.
7. **`useHashRoute` parsing rules** — empty hash, `#/`, and unrecognized hashes all map to `landing`. Trailing slashes stripped. Not specified; chosen for user-friendliness.
8. **`DeckView` component extraction** (not in tasks.md). Keeps `App.tsx` under 30 lines and lets both decks share the chrome. Byte-equivalent to the original `App.tsx` body for the workflow deck.
9. **`current` state clamping** in `DeckView` — `Math.min(current, slides.length - 1)` during render, not `useEffect`. ESLint `react-hooks/set-state-in-effect` rule preferred pattern.
10. **"Back to landing" affordance** — small fixed-position `← home` link top-left of every deck view. Not in spec; hash routes don't get browser-back for free.
11. **`NOTES_URL` exported but not used inline** — placeholder for future slide edits to reference without re-typing the GitHub URL.
12. **Mitigation links in `finding` items use GitHub-tree URLs** of archived changes. Resolve once archives land on main; 404 until then (acceptable per design.md Decision 8).

### From the archive run (3)

13. **`presentation-content` delta operation corrected** from `MODIFIED Requirements` to `ADDED Requirements` mid-archive. The planning-time delta named a requirement that doesn't exist in the live spec ("Workflow deck slide source SHALL live at …"); it was a genuinely new requirement masquerading as a modification.
14. **`presentation-shell` live spec retrofitted with missing `## Purpose` and `## Requirements` headers** — pre-existing data issue on `main`, surfaced at archive validation time. Fix is in scope of this change because the archive cannot land without it; logged here because the fix was upstream of this change's planned scope.
15. **Archive performed via `openspec archive --yes` CLI** rather than the full `/opsx:archive` skill body's manual `mv` + subagent-dispatch sync. Same may-decide call as logged in `prefer-skill-over-cli` change. Hook content (`/opsx:summarize`) invoked separately via the Skill tool so the rule-bearing side effect (this `summary.md`) is honoured.

### From user direction (1)

16. **"What's next" section (3 slides) removed mid-implementation on user direction.** The deck now ends on Learnings → Close. Spec updated (six-section arc instead of seven); design.md Decision 7 mirrored. Follow-up work is captured in the OpenSpec change archive and tracked separately from the case-study record.

## Notes on the dogfooding outcome

This change is the **third** end-to-end consumer of the rules shipped in `harden-opsx-workflow` (after `add-domain-skills` and `prefer-skill-over-cli`), and the most substantial — 5 new files, 9 modified, ~777 lines of slide content authored by a background agent, build and lint clean throughout.

- **Silent-decisions marker rule** applied across `proposal.md` (6), `tasks.md` (12), the archive run (3), and one user-direction call (1). Aggregated here as 22 entries.
- **Ambiguity escalation contract** held — zero must-ask escalations triggered. The implementing agent flagged one interpretive ambiguity (Findings section #5 as 1 slide vs 2) and resolved it within the may-decide framing.
- **CLI/skill divergence** repeated the same pragmatic shape: CLI for atomic move+sync, skill for the post-archive hook content.

The deck closes the dogfooding loop visibly — its final slide (`close-dogfooding`) states that every silent decision the agent made while authoring the deck was logged in a `## Decisions made without consultation` section, citing the same marker rule the deck explains.

## Cross-references

- Living specs: `openspec/specs/presentation-shell/spec.md`, `openspec/specs/presentation-content/spec.md`, `openspec/specs/research-deck-content/spec.md`
- Archive: `openspec/changes/archive/2026-05-13-migration-research-deck/`
- Sibling changes: `2026-05-13-harden-opsx-workflow` (PR #9), `2026-05-13-add-domain-skills` (PR #10), `2026-05-13-prefer-skill-over-cli` (PR #11)
- Source research notes: `../enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md`
- App routes (post-merge): `/`, `/#/workflow`, `/#/research`, `/#/research/summary`
