## 1. Update Cons Slide (Slide 10)

- [x] 1.1 Replace the spec-drift bullet with: "Specs can drift from code at any stage — imprecise specs require mid-implementation fixes, and refinements before or after archive may not flow back into the spec library"
- [x] 1.2 Add bullet: "Specs are substantially more verbose than the resulting code — difficult to review thoroughly without AI assistance"
- [x] 1.3 Add bullet: "Even well-scoped changes may need code refinement post-generation — 'it works' is not the same as 'it works well'"
- [x] 1.4 Add bullet: "Requires strong guardrails, code pattern guidelines, and feedback loops to maintain output quality over time"

## 2. Update Data Model for Nested Questions

- [x] 2.1 Extend the `Slide` type in `apps/presentation/src/types.ts` to support a `numbered-with-subitems` content block type that allows sub-items (with optional label and optional link) under each numbered question
- [x] 2.2 Update the renderer component that handles numbered list blocks to render phase-labeled sub-items as indented bullets, with links opening in a new tab

## 3. Update Open Questions Slide (Slide 11)

- [x] 3.1 Convert question list on slide 11 from `type: 'numbered'` to `type: 'numbered-with-subitems'` in `apps/presentation/src/slides.ts`
- [x] 3.2 Add question 9 as a parent item "What will the end-to-end development flow look like?" with three sub-items:
  - Propose: "How can we efficiently review specs before apply without becoming a bottleneck?"
  - Apply: "How can we efficiently auto-validate as much as possible? Can we include an adversarial code-review step?" (link label "adversarial code-review" → https://asdlc.io/patterns/adversarial-code-review/)
  - Validation: "Human validation → refinement → archive — what is the correct approach? (e.g. /opsx:refine command)"
- [x] 3.3 Add question 10: "Should we add branch protection rules to block unarchived changes from merging to main?"
- [x] 3.4 Add question 11: "(Hypothetical) How do we resolve git merge conflicts on spec archives when two changes modify the same capability?"

## 4. Verify

- [x] 4.1 Start the dev server and visually verify the cons slide shows all 8 bullets correctly
- [x] 4.2 Verify the open questions slide shows all 11 questions, with question 9 displaying three phase-labeled sub-items
- [x] 4.3 Verify the adversarial code review link on question 9 opens in a new tab
