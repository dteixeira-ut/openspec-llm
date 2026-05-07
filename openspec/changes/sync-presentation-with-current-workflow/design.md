## Context

The presentation deck (`apps/presentation/src/slides.ts`) is a static React app whose content is derived from `presentation-content` capability requirements. The current spec defines exactly twelve slides; the proposal expands this to roughly nineteen slides while keeping the same `Slide` type and `ContentItem` union.

The deck's identity rests on two claims: that it accurately documents the workflow, and that it was itself produced by that workflow. Both claims are weakened today — the deck is missing five skills and one CI workflow, and the most recent edits have been ad-hoc rather than driven through OpenSpec.

Two prior archived changes set the precedent for how this kind of content update is shaped:
- `2026-04-23-openspec-claude-presentation` (initial deck)
- `2026-04-29-update-presentation-cons-and-questions` (cons + open questions revision)

This change continues that pattern.

## Goals / Non-Goals

**Goals:**
- Bring the deck content up to date with everything currently shipped under `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, and `.github/workflows/`.
- Tell a stronger narrative arc by grouping skills into three lifecycle phases instead of presenting them as a flat list of four.
- Honestly reframe open questions that have been partially answered, rather than removing them — so the deck reflects evolution, not erasure.
- Reinforce the dogfooding claim by running this change through the full propose → apply → review → archive → pr cycle.

**Non-Goals:**
- No visual or styling changes to the presentation (no new `ContentItem` variants, no new component CSS, no theme updates).
- No changes to the `presentation-shell` capability (navigation, progress indicator, accessibility, responsive behavior).
- No automation or test infrastructure changes — this is a content + spec update.
- Not promoting `/opsx:pr`'s `@cursor` integration as a permanent feature; the deck describes it as "AI PR reviewer integration" so the slide doesn't age when the integration changes.

## Decisions

### 1. Three-phase narrative structure (Plan / Build / Ship & Close)

Group skills under three section-divider slides rather than listing them flat:

```
Plan          Build          Ship & Close
  propose       apply           pr
  explore       refine          archive
  suggest       review          summarize
```

**Why:** A flat list of nine skills loses the audience. Three phases give a presenter natural pauses and a memorable mental model. The phase names map to how a real change actually moves through the system.

**Alternatives considered:**
- Keep four skill slides, append five new ones (Option B in explore). Rejected: deck balloons to nine consecutive skill slides with no narrative scaffolding.
- Replace per-skill slides with three phase-level summary slides (Option A). Rejected: loses the per-skill rhythm presenters use to cue the audience, and skills like `/opsx:suggest` and `/opsx:refine` deserve focused moments because they're the most novel.

### 2. Section dividers as plain slides (no new ContentItem type)

Section-divider slides (`phase-plan`, `phase-build`, `phase-ship-close`) reuse the existing `Slide` type with `subheading` and `text` body items only. No changes to `types.ts` or `SlideCard.tsx`.

**Why:** The "no styling changes" non-goal forces this. A title + subheading reads clearly enough as a phase marker given the deck's existing visual rhythm. We can revisit visual differentiation in a future change if it lands flat in practice.

### 3. Skill slide pattern is consistent for all nine skills

Every skill slide follows the same structure: skill-name title, one-line subheading, three to four bullets (input → behavior → output → variation), one code block showing the invocation.

**Why:** Consistency lets a presenter find a rhythm. The existing four slides already follow this pattern, so the five new slides match it.

### 4. New "Closing the loop in CI" slide

Place a single slide between the `Ship & Close` phase and the `pros` slide that covers the Code Review Gate (CLAUDE.md), the Spec Drift Monitor (gh-aw workflow), and the AI PR reviewer integration. Frame it as the "automated half" of what the skills do interactively.

**Why:** These pieces don't fit cleanly under any single skill, but they're load-bearing parts of the workflow. A dedicated slide also gives presenters a clean place to acknowledge that not everything is human-in-the-loop.

### 5. Open-questions reframing — three rewrites, no removals

Three of the eleven existing questions are now partially answered:

| Original (slide 11) | Rewrite |
|---|---|
| Q1 — "How do we keep specs in sync as code evolves post-archive?" | "Spec drift monitor flags it on merge. Open: who owns the fix and on what SLA?" |
| Q7 — "What will code reviews look like?" | "Code-review gate runs after every implementation; AI PR reviewer comments on the PR. Open: how adversarial should the AI review go?" |
| Q9.Propose subitem — "How can we efficiently review specs before apply without becoming a bottleneck?" | "/opsx:suggest surfaces risks and gaps before apply. Open: when is human review still required vs. when does suggest suffice?" |

**Why:** Removing partially-answered questions hides progress. Rewriting them shows the workflow evolving in response to its own surfaced questions — a stronger story than either pretending nothing changed or pretending everything is solved.

The other eight questions remain unchanged.

### 6. Resources-slide footer rewrite

Current footer: *"This deck was built using the workflow it describes."*

New footer: *"Built using the workflow it describes — including this update, which went propose → apply → review → archive → pr."*

**Why:** Concrete dogfood evidence beats a generic claim. It also sets up the presenter to optionally show the change folder live.

### 7. README workflow table expansion

Replace the four-row table with three sections matching the deck's phase structure (Plan / Build / Ship & Close), plus a paragraph describing the Code Review Gate and the Spec Drift Monitor. Drop the "four Claude Code skills" sentence.

**Why:** README and deck must say the same thing. The phase grouping translates well to a written table.

### 8. Slide 4 (`enter-openspec`) code block update

Current code block lists four commands. Update to show the lifecycle in a way that fits one slide without being a wall of text:

```
Plan         /opsx:propose   /opsx:explore   /opsx:suggest
Build        /opsx:apply     /opsx:refine    /opsx:review
Ship/Close   /opsx:pr        /opsx:archive   /opsx:summarize
```

Subheading updates to drop "four" — e.g., *"A CLI + a set of Claude Code skills covering the full lifecycle, plus CI automation that closes the loop."*

## Risks / Trade-offs

- **[Section-divider slides feel anemic without a unique visual treatment]** → Mitigation: the deck has strong typography and the title-only treatment with a subheading reads well. If feedback says they're flat after the first live presentation, we open a follow-up change to add a `phase-divider` content type.
- **[Deck length grows from 12 to ~19 slides — pacing risk]** → Mitigation: phase dividers are short (15–30 seconds spoken), and the three new skill slides are no denser than existing ones. Total run-time grows by ~5 minutes, which is acceptable for the audience this deck targets.
- **[Open-questions rewrites might read as defensive]** → Mitigation: every rewrite ends with a real follow-up question (the "Open:" half), so each item still invites discussion rather than declaring a topic closed.
- **[`/opsx:pr` description couples to `@cursor`]** → Mitigation: the slide describes the skill as "PR creation + AI reviewer integration" with `@cursor` mentioned as the current implementation. Replacing the reviewer later will be a one-line edit.
- **[The `presentation-content` spec gets large]** → Mitigation: this is unavoidable when the deck itself is the spec. The benefit (the spec is the source of truth) outweighs the cost (a long spec file).

## Migration Plan

Not applicable — content-only update. The deck is rebuilt and redeployed via the existing `deploy.yml` workflow; no rollout phasing or feature flag is needed. If the new content turns out to be wrong, we revert with a single PR.

## Open Questions

None blocking. The three substantive open questions surfaced during explore were all resolved before this design was written:
- Direct fix vs. OpenSpec change → **OpenSpec change**.
- Phase restructure vs. append-per-skill vs. hybrid → **Hybrid (Option C)**.
- Rewrite partially-answered questions vs. remove them → **Rewrite**.
