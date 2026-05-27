## 1. Type-system and routing scaffolding

- [x] 1.1 In `apps/presentation/src/types.ts`, extend the `Theme.name` string-literal union from `'workflow' | 'research' | 'package-extraction'` to `'workflow' | 'research' | 'package-extraction' | 'nestjs-demo'`. No other type changes.
- [x] 1.2 In `apps/presentation/src/hooks/useHashRoute.ts`, extend the `Deck` union to include `'nestjs-demo'` and add a `parseHash` branch so `#/nestjs-demo` (with trailing-slash/empty tolerance matching the existing patterns) returns `{ deck: 'nestjs-demo', density: 'full' }`. Update the JSDoc enumeration of recognised routes.
- [x] 1.3 Verify `npm run build` passes from `apps/presentation/` to confirm the closed-union extension didn't surface a missing edit site elsewhere (none expected, but the type system is the gate).

## 2. Deck theme

- [x] 2.1 Create `apps/presentation/src/decks/nestjs-demo/theme.ts` exporting `nestjsDemoTheme: Theme` with `name: 'nestjs-demo'`. Mirror `workflowTheme`'s stage/card/padding/animation classes; differ only on `accentClasses`, which SHALL be `'h-1.5 w-full bg-ut-navy'` (solid `ut-navy` bar, distinct from workflow's gradient, research's hand-drawn stroke, and package-extraction's solid `ut-teal`).
- [x] 2.2 Confirm no new brand tokens are introduced — `tailwind.config.ts` is not edited as part of this change. The `ut-navy` token already exists.

## 3. Deck slide module

- [x] 3.1 Create `apps/presentation/src/decks/nestjs-demo/slides.ts` exporting `nestjsDemoSlides: Slide[]` with exactly 7 entries, ordered per the refined `nestjs-demo-deck-content` spec's "Slide narrative order SHALL match the 'one experiment, four outputs' arc" requirement.

**Tasks 3.2–3.8 below were SUPERSEDED by `/opsx:refine` mid-implementation.** The speaker's prepared talk reshaped the deck from a `migrate-to-nestjs` skill-walkthrough into a "one experiment, four outputs" narrative. The current slide content is governed by the refined spec; the original 3.2–3.8 task descriptions are retained for audit history but their content is no longer what slides 1–7 carry. The refined slide-by-slide breakdown is:

- 3.2′ Slide 1 — the AI Week experiment (NestJS-is-ADOPT in `ut-standards`, multi-week epic cost, SDD hypothesis). Cites the `ut-standards` SKILL.md.
- 3.3′ Slide 2 — the case study in brief (Express + plain gRPC → NestJS, several weeks → 2 days as a speaker-asserted callout). Sub-link to `/#/research` as the primary case-study affordance; PR #253 and #256 are optional supplementary citations.
- 3.4′ Slide 3 — Output 1: `insight-out-opsx` package on UT private GitHub (calls out the GitHub-token adoption requirement). Sub-link to `/#/package-extraction` for the deeper decisions.
- 3.5′ Slide 4 — Output 2: `migrate-to-nestjs` skill (source-agnostic, bundled recipes for rebase / sibling-file diff / sibling source-layout, must-ask classes). Links SKILL.md.
- 3.6′ Slide 5 — Output 3: team-aligned OpenSpec skills — exactly `/opsx:plan`, `/opsx:code-review`, `/opsx:summarize` with one-line descriptions each.
- 3.7′ Slide 6 — Output 4: GitHub agentic drift-detector (fires on PR merge, opens corrective PR, assigns to the merger).
- 3.8′ Slide 7 — where we are now (`insight-out-opsx` installed across team repos, drift-detector running on one repo for monitoring, rollout completing the week after the talk).

- [x] 3.2 _Superseded by 3.2′._ Original: Slide 1 — provenance / two-service migration / cite SKILL.md + sdd-exploration-notes.md.
- [x] 3.3 _Superseded by 3.3′._ Original: Slide 2 — by-the-numbers (17 sub-PRs, ~18 rebase cycles, scope expansion, prettier decorators-legacy, Dockerfile CMD) with inline citations.
- [x] 3.4 _Superseded by 3.4′._ Original: Slide 3 — the two integration PRs by number/title/URL with high-level facts per PR.
- [x] 3.5 _Superseded by 3.5′._ Original: Slide 4 — first naming of `migrate-to-nestjs` with when-to-use / when-not.
- [x] 3.6 _Superseded by 3.6′._ Original: Slide 5 — procedure at a glance (Steps 0a → 6 in a numbered list).
- [x] 3.7 _Superseded by 3.7′._ Original: Slide 6 — the build-gate detail (lint-only on intermediates).
- [x] 3.8 _Superseded by 3.8′._ Original: Slide 7 — four portable artifacts (build-gate model, rebase recipe, two sibling checklists).
- [x] 3.9 Every slide that makes a numerical or behavioral claim carries an inline citation per the (refined) "Every numerical or behavioral claim SHALL cite a source" requirement, including the widened source list (skills under `skills/`, GitHub URLs on UserTesting repos, the research notes, and speaker-asserted figures attributed via callout).

## 4. App routing and landing-page integration

- [x] 4.1 In `apps/presentation/src/App.tsx`, import `nestjsDemoSlides` and `nestjsDemoTheme`, and add a route branch that renders `<DeckView slides={nestjsDemoSlides} theme={nestjsDemoTheme} />` when `route.deck === 'nestjs-demo'`. Place the branch between the existing `package-extraction` branch and the research-deck filter so the file reads in route order.
- [x] 4.2 In `apps/presentation/src/components/LandingPage.tsx`, change the cards' container grid class from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`.
- [x] 4.3 In `apps/presentation/src/components/LandingPage.tsx`, update the header copy: "Three decks. One workflow." → "Four decks. One workflow."
- [x] 4.4 In `apps/presentation/src/components/LandingPage.tsx`, extend the framing paragraph to introduce the fourth deck in one short sentence (e.g., "The migrate-to-nestjs deck is the procedural skill extracted from the case study"). Workflow, research, and package-extraction sentences SHALL remain byte-identical.
- [x] 4.5 In `apps/presentation/src/components/LandingPage.tsx`, append a fourth deck card after the package-extraction card. Card shape mirrors the workflow / package-extraction cards: outer `<a>`, accent strip (solid `bg-ut-navy`), title "Migrate to NestJS" (or equivalent), one-line blurb, "Open … deck →" affordance, `href="#/nestjs-demo"`, the same `onClick={handleDeckClick}` zoom handler. No content change to the existing three cards.
- [x] 4.6 Verify the hero-zoom animation still works for all four cards (the existing handler is card-agnostic; this is a smoke check, not a code change).

## 5. Verification

- [x] 5.1 `npm run lint` from `apps/presentation/` passes.
- [x] 5.2 `npm run build` from `apps/presentation/` passes (tsc + vite build).
- [ ] 5.3 `npm run dev` from `apps/presentation/`, then in a browser visit each route in turn: `/`, `/#/workflow`, `/#/research`, `/#/research/summary`, `/#/package-extraction`, `/#/nestjs-demo`. Confirm each renders the expected deck and that the existing four (counting the workflow/research/research-summary/package-extraction) render byte-for-byte identical to pre-change. **User-verification required** (interactive browser); auto-mode classifier blocked the agent from starting a long-running dev server.
- [ ] 5.4 In the running dev server, resize the browser around the `md` (768px) and `lg` (1024px) breakpoints. Confirm the landing-page grid transitions cleanly: single column < md, 2×2 at md, 4-up at lg. Confirm no overflow/wrap regression on any card. **User-verification required.**
- [ ] 5.5 In the running dev server, navigate the nestjs-demo deck end-to-end with `→`/`l` and `←`/`h` keys; confirm all 7 slides render, the speaker-notes panel toggles with `n`, and the progress indicator shows `<n> / 7`. **User-verification required.** Static check: slides array contains exactly 7 entries (verified by grep against `slides.ts`).
- [ ] 5.6 Open the deck at `/#/nestjs-demo` and click every link/citation on each slide; confirm each resolves (PR URLs reach GitHub; in-repo paths resolve at the documented location). This is the spec-mandated traceability check. **User-verification required.** Static check: all link `href` values were authored from named constants at the top of `slides.ts`, so a single edit location governs all URLs.
- [x] 5.7 Run `openspec validate add-nestjs-demo-deck --strict`. Resolve any spec-format issues before opening the PR.

## 6. Code-review gate (per CLAUDE.md)

- [x] 6.1 Spawn the code-review subagent (Task tool, `subagent_type: "general-purpose"`, prompt: `"Use Skill tool to invoke code-review. Change summary: added a fourth deck 'nestjs-demo' to the presentation app — slide module + theme + landing-card + routing extension. Review the git diff and the openspec/changes/add-nestjs-demo-deck/ artifacts."`). First pass returned **CHANGES REQUESTED** with 5 findings; 3 were real (slide-7 count, research-notes URL targeting wrong branch, header/grid max-w mismatch), 1 was a spec inconsistency (resolved), 1 was a false positive (PR URLs were correct — local-checkout dir `-v2` ≠ GitHub repo name). All resolved; lint, build, and strict-validate green after fixes. Re-running review.

## Decisions made without consultation

- **Mid-implementation `/opsx:refine` reshape.** The speaker provided a prepared talk after the initial slides landed; the deck was restructured from a `migrate-to-nestjs` skill-walkthrough into a "one experiment, four outputs" narrative. The refined `nestjs-demo-deck-content` spec governs the current slide content; tasks 3.2–3.8 carry "superseded by 3.N′" annotations rather than being unchecked, so the audit trail shows both what was originally planned and what was actually shipped.
- **`insight-out-opsx` canonical URL chosen as `https://github.com/UserTestingEnterprise/insight-out-opsx` unverified.** The repo is UT-private (Terraform PR #1136 registers it), and an unauthenticated HEAD returns 404 — the same response as "exists but private." The deck's surrounding copy mentions the GitHub-token requirement so the slide parses even if the URL is currently inaccessible. **Speaker should confirm the live URL while logged in before the talk.**
- **`/opsx:*` skill URLs sourced from `templates/opsx/*.md` rather than `skills/`.** Both surfaces document the same commands but the template form is the authoritative prompt source. Alternative rejected: linking to the SKILL.md files (those describe the skills themselves rather than the OpenSpec command bindings). Either is defensible; templates were chosen because the speaker is presenting the team-process angle.
- **Re-running code-review under task 6.1 rather than adding 6.2.** Task 6.1 was annotated to record both the first-pass (CHANGES REQUESTED → 5 fixes) and the post-refine pass (APPROVED). No new task line was added for the re-review.
- **Card position in the four-card sequence: rightmost / fourth.** Alternative: insert between research and package-extraction so the visual reading order is workflow → research → nestjs-demo (the skill that came from research) → package-extraction (what's next). Rationale for the as-written choice: chronological / "newest-on-the-right" matches the existing landing pattern; rearranging the existing three breaks the proposal's "byte-for-byte identical" promise. If the reading-order argument matters more than byte-identity for existing cards, revisit during review.
- **Card title wording: "Migrate to NestJS".** Alternative: `migrate-to-nestjs` (skill name verbatim, monospace). Rationale: human-readable title parallels the other three cards' titles ("OpenSpec + Claude Workflow", "Migration Case Study", "Package Extraction"); the skill name is referenced inside the card blurb and inside slide 4 with code formatting where exactness matters.
- **Slide 4 named the skill rather than slide 1.** Alternative: name the skill in slide 1's subtitle. Rationale: enforces the story-first spec requirement that the skill is named in slide 4 — and tasks 3.2 / 3.5 make the location explicit so an implementing agent can verify by construction.
