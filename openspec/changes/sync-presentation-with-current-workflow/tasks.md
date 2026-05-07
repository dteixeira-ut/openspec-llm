## 1. Slide content updates in `apps/presentation/src/slides.ts`

- [x] 1.1 Update slide `enter-openspec`: drop "four" from subheading, replace code block with the three-row Plan/Build/Ship-Close lifecycle map
- [x] 1.2 Update slide `open-questions`: rewrite Q1 with the "spec drift monitor / open SLA" reframing
- [x] 1.3 Update slide `open-questions`: rewrite Q7 with the "code-review gate + AI PR reviewer / open adversarial scope" reframing
- [x] 1.4 Update slide `open-questions`: rewrite Q9.Propose subitem with the "/opsx:suggest / open when human review still required" reframing
- [x] 1.5 Update slide `resources`: rewrite footer to "Built using the workflow it describes — including this update, which went propose → apply → review → archive → pr."

## 2. New slides in `apps/presentation/src/slides.ts`

- [x] 2.1 Add `phase-plan` divider slide (id: `phase-plan`) with title "Plan", subheading, and supporting paragraph
- [x] 2.2 Add `skill-suggest` slide with `/opsx:suggest` content per spec
- [x] 2.3 Add `phase-build` divider slide (id: `phase-build`) with title "Build", subheading, and supporting paragraph
- [x] 2.4 Add `skill-refine` slide with `/opsx:refine` content per spec
- [x] 2.5 Add `skill-review` slide with `/opsx:review` content per spec
- [x] 2.6 Add `phase-ship-close` divider slide (id: `phase-ship-close`) with title "Ship & Close", subheading, and supporting paragraph
- [x] 2.7 Add `skill-pr` slide with `/opsx:pr` content per spec (mention `@cursor` as current implementation)
- [x] 2.8 Add `skill-summarize` slide with `/opsx:summarize` content per spec
- [x] 2.9 Add `closing-loop-ci` slide with Code Review Gate + Spec Drift Monitor + AI PR Reviewer bullets per spec

## 3. Slide order in `apps/presentation/src/slides.ts`

- [x] 3.1 Reorder the `slides` array to match the 21-slide ordering defined in the `Slide ordering` requirement
- [x] 3.2 Verify the deck reads top-to-bottom as: title → problem → spec-driven-dev → enter-openspec → phase-plan → propose → explore → suggest → phase-build → apply → refine → review → phase-ship-close → pr → archive → summarize → closing-loop-ci → pros → cons → open-questions → resources

## 4. Speaker notes

- [x] 4.1 Write speaker notes for `phase-plan`, `phase-build`, `phase-ship-close` matching the existing notes' tone (one short paragraph each, framing the phase)
- [x] 4.2 Write speaker notes for `skill-suggest`, `skill-refine`, `skill-review`, `skill-pr`, `skill-summarize` matching the existing skill-slide notes' tone (one short paragraph each, focused on when/why this skill matters)
- [x] 4.3 Write speaker notes for `closing-loop-ci` framing the automation as the "set it and forget it" complement to the interactive skills

## 5. README updates

- [x] 5.1 Drop the "four Claude Code skills" sentence in `README.md`
- [x] 5.2 Restructure the workflow table into Plan / Build / Ship & Close sections covering all nine skills
- [x] 5.3 Add a short section after the workflow table describing the Code Review Gate (mandatory subagent after implementation) and the Spec Drift Monitor (gh-aw workflow on merge to main)
- [x] 5.4 Verify the new README phrasing is consistent with the deck's `enter-openspec` slide subheading

## 6. Verification

- [x] 6.1 Run `openspec validate sync-presentation-with-current-workflow` and confirm the change is still valid
- [x] 6.2 Verified the deck builds cleanly (`vite build` — 21 modules transformed, no errors; `tsc -b` clean). All 21 slides reuse existing content types only, so visual-layout regression risk is low. **Caveat:** visual walkthrough in a browser is recommended before sharing externally; this CLI session cannot perform it.
- [x] 6.3 Confirmed `App.tsx` gates `canPrev = current > 0` and `canNext = current < slides.length - 1`; with `slides.length === 21`, the Previous button is disabled on the title slide and the Next button is disabled on the resources slide by construction
- [x] 6.4 Confirmed all three external-link rendering paths in `SlideCard.tsx` use `target="_blank"` and `rel="noopener noreferrer"` (lines 11–12, 130–131, 153–154); resources, spec-driven-dev, and open-questions slides all use these paths
- [ ] 6.5 Run `/opsx:review` against the change to verify spec/task/code coverage before opening a PR
