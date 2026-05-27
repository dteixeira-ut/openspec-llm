## Change Summary: add-nestjs-demo-deck

### What Was Built

A fourth slide deck (`nestjs-demo`) was added to the presentation app under `apps/presentation/src/decks/nestjs-demo/`, structured as a ~7-slide walkthrough of the AI Week experiment that produced the team's NestJS-migration tooling. The landing page grew from three to four deck cards (grid changed from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`), a new `ut-navy`-accented theme was registered, and the `Theme.name` / `Deck` unions and `parseHash` route table were extended for the new `/#/nestjs-demo` destination.

### Why

The `migrate-to-nestjs` skill captures the *procedure* extracted from a real two-service NestJS migration but not its *provenance* — and the presentation app had no deck that connected the AI Week experiment to the four artifacts it shipped (the `insight-out-opsx` package, the migration skill, the team-aligned `/opsx:*` skills, and the GitHub agentic drift-detector). The deck does the narrative compression that the skill file cannot — for both engineers and leadership.

### Key Decisions

- **Story-first slide ordering.** The deck opens with the experiment and the case study before naming any artifact, so a leadership audience leaves after slide 3 with the takeaway. Engineers read slides 4–7 as the artifacts framed by their provenance. Mid-implementation `/opsx:refine` reshaped the spine from "skill walkthrough" to "one experiment, four outputs" once the speaker's prepared talk landed.
- **Solid `ut-navy` accent bar.** The three existing accents (workflow's gradient, research's hand-drawn stroke, package-extraction's solid `ut-teal`) were claimed; `ut-navy` is visually distinct without introducing a new brand token. Alternative rejected: code-tinted card background (more narratively honest but a larger theme-work surface for a 7-slide deck).
- **High-level PR summary only.** The two integration PRs (#253, #256) are cited as supplementary evidence on the case-study slide; the per-sub-PR narrative was left to the research deck to avoid duplication and busted brief. PRs ARE the load-bearing artifact for a reader who wants to verify the claims, so the URLs stay.
- **Single-PR delivery, squash merge.** No integration branch; the change is small (one new deck + a handful of edit sites in four existing files). `/opsx:apply`, then `/opsx:review`, then `/opsx:pr`, then `/opsx:archive` — no cascading-branch rebase needed.
- **Citation requirement widened during refine.** Original spec restricted valid citation sources to the migrate-to-nestjs skill + PR URLs + research notes; the reshaped deck cites a broader set (insight-out-opsx, `ut-standards`, `/opsx:*` skill docs, drift-detector). Speaker-asserted figures (e.g., "weeks → 2 days") got a carve-out — they MAY stand alone if attributed to the speaker via a callout.

### Spec Changes

- **`nestjs-demo-deck-content`**: NEW capability — 6 added requirements (module shape, exactly-7-slides bound, slide-narrative-order arc, citation rule, case-study sub-link, four-shipped-outputs structure, no new brand tokens).
- **`presentation-shell`**: MODIFIED — hash-routing requirement now enumerates 5 destinations (added `/#/nestjs-demo`); landing-page requirement updates card list (4 cards, new grid class), header copy, and framing paragraph; themability requirement extends the `Theme.name` union to include `'nestjs-demo'`.

### Tasks Completed

**24/28 tasks complete** (4 interactive browser smoke checks marked user-verification-required; auto-mode classifier blocked the agent from running a long-lived `npm run dev` server)

- **Section 1** — type-system + routing scaffolding (3 tasks)
- **Section 2** — deck theme (2 tasks)
- **Section 3** — slide module (1 baseline task + 7 slide-content tasks, the last seven superseded by `/opsx:refine` mid-implementation but retained for audit history; 1 citation-rule check task)
- **Section 4** — App routing + landing-page integration (6 tasks)
- **Section 5** — lint, build, strict-validate green; dev-server interactive walk remains for the user (3 of 7 tasks)
- **Section 6** — code-review gate (CHANGES REQUESTED on first pass → 5 fixes → APPROVED on re-review)

### Decisions made without consultation

**From `proposal.md`**

- **Slide count target: 7.** Confirmed in explore as "~7 slides (Recommended)" via `AskUserQuestion`. Captured here for traceability, not as a unilateral call.
- **Accent treatment: solid `ut-navy` bar.** Confirmed in explore via `AskUserQuestion` preview. Captured here for traceability.
- **PR scope: high-level summary of #253 + #256 only, not the sub-PR chain.** Confirmed in explore via `AskUserQuestion`.
- **Landing slot: fourth top-level card in a 2×2/4-col grid.** Confirmed in explore via `AskUserQuestion`.
- **Slide narrative order: story-first (provenance → numbers → PRs → skill → procedure → build gate → what's portable), not procedure-first.** Captured at propose time. **Superseded mid-implementation by `/opsx:refine`** — the final shipped ordering is "one experiment, four outputs" (experiment → case-study brief → four output slides → adoption status). See the tasks.md marker below.

**From `tasks.md`**

- **Mid-implementation `/opsx:refine` reshape.** The speaker provided a prepared talk after the initial slides landed; the deck was restructured from a `migrate-to-nestjs` skill-walkthrough into a "one experiment, four outputs" narrative. Tasks 3.2–3.8 carry "superseded by 3.N′" annotations rather than being unchecked, so the audit trail shows both what was originally planned and what was actually shipped.
- **`insight-out-opsx` canonical URL chosen as `https://github.com/UserTestingEnterprise/insight-out-opsx` unverified.** The repo is UT-private (Terraform PR #1136 registers it); an unauthenticated HEAD returns 404 — the same response as "exists but private." The deck's surrounding copy mentions the GitHub-token requirement so the slide parses even if the URL is currently inaccessible. **Speaker should confirm the live URL while logged in before the talk.**
- **`/opsx:*` skill URLs sourced from `templates/opsx/*.md` rather than `skills/`.** Both surfaces document the same commands but the template form is the authoritative prompt source. Alternative rejected: linking to the SKILL.md files (those describe the skills themselves rather than the OpenSpec command bindings).
- **Re-running code-review under task 6.1 rather than adding 6.2.** Task 6.1 was annotated to record both the first-pass (CHANGES REQUESTED → 5 fixes) and the post-refine pass (APPROVED). No new task line was added for the re-review.
- **Card position in the four-card sequence: rightmost / fourth.** Alternative: insert between research and package-extraction so the visual reading order tells the chronology better. Rationale for as-written: chronological / "newest-on-the-right" matches the existing landing pattern; rearranging the existing three breaks the proposal's "byte-for-byte identical" promise.
- **Card title wording: "Migrate to NestJS".** Alternative: `migrate-to-nestjs` (skill name verbatim, monospace). Rationale: human-readable title parallels the other three cards' titles; the skill name is referenced inside the card blurb and slide 4 with code formatting where exactness matters.
- **Slide 4 named the skill rather than slide 1.** **Superseded by `/opsx:refine`** — the migrate-to-nestjs skill is now named on slide 4 of the refined "one experiment, four outputs" arc (Output 2), with the AI Week experiment framed on slide 1.
