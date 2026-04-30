## Context

The presentation is a React/TypeScript app with all slide content defined in `apps/presentation/src/slides.ts`. Each slide is a typed object with `id`, `title`, `body` (array of content blocks), and `notes`. No data fetching, no backend — content changes are pure TypeScript edits.

## Goals / Non-Goals

**Goals:**
- Update the cons slide (id: `cons`) with a more precise spec-drift bullet and three new bullets
- Update the open-questions slide (id: `open-questions`) with three additional numbered questions

**Non-Goals:**
- Changes to slide structure, types, or rendering components
- Updates to any other slide

## Decisions

Single file edit to `slides.ts` — no architectural decisions required. Content is straightforward to locate by slide `id`.

## Risks / Trade-offs

- Low risk: typed data structure ensures no runtime breakage from content changes
- The new cons bullets are longer than existing ones — verify they render well in the presentation layout
