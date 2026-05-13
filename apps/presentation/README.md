# Presentation app

Vite + React 19 + Tailwind 3 deck app that hosts two presentation decks behind a small hash-routed shell.

## Decks and routes

| Route | Deck | Audience |
| --- | --- | --- |
| `/` | Landing page | Both — entry point linking to the two decks |
| `/#/workflow` | OpenSpec + Claude workflow pitch | New audiences hearing about the workflow for the first time |
| `/#/research` | Migration case study (full, ~27 slides) | Engineering audiences who want the evidence |
| `/#/research/summary` | Migration case study (summary, ~14 slides) | Leadership / lightning-talk slot |

Both research routes render from a single slide source (`src/decks/research/slides.ts`); each slide declares `density: 'full' | 'summary' | 'both'` and the route filters accordingly.

## Source layout

```
src/
  decks/
    workflow/
      slides.ts         # the workflow-pitch deck
      theme.ts          # workflow visual treatment (white card, gradient bar, ut-navy stage)
    research/
      slides.ts         # the migration case-study deck
      theme.ts          # "research journal" visual treatment (off-white card, hand-drawn accent)
  components/
    LandingPage.tsx
    DeckView.tsx        # shared deck renderer (keyboard nav, notes, progress)
    SlideCard.tsx       # theme-aware slide card; renders every ContentItem variant
    NavControls.tsx
    NotesPanel.tsx
    ProgressIndicator.tsx
  hooks/
    useHashRoute.ts     # the routing primitive
  types.ts              # Slide / ResearchSlide / Theme / ContentItem union
  App.tsx               # switches on the route, renders Landing or DeckView
```

## Theming

Each deck declares a `Theme` (in `decks/<name>/theme.ts`) describing stage classes, card classes, accent treatment, typography, animation, and watermark. `SlideCard` reads brand-token / shape decisions from the theme rather than hardcoding Tailwind classes — adding a third deck reduces to authoring `slides.ts` + `theme.ts` and pointing `App.tsx` at them.

Both themes use the same UserTesting logo asset and the same `ut-navy` / `ut-blue` / `ut-teal` palette. No new brand tokens were introduced for the research deck — the visual distinction is achieved by applying existing tokens differently (shape, leading, accent style, stage texture).

## Slide schema

`src/types.ts` declares the `ContentItem` union. Variants:

- `text`, `subheading`, `bullets`, `numbered`, `numbered-with-subitems`, `code`, `link`, `section`, `footer` — used by both decks
- `finding` (severity + title + body + optional mitigation link), `timeline`, `diff` (before / after), `metric` (label + value + subtext), `callout` (info / warn / evidence) — added for the research deck; existing workflow slides are unaffected

Research slides additionally carry a required `density` field. Workflow slides do not.

## Local dev

```bash
npm install
npm run dev          # http://localhost:5173/
npm run build        # tsc -b && vite build
npm run lint
```

Keyboard shortcuts (in a deck):

- `→` / `l` — next slide
- `←` / `h` — previous slide
- `n` — toggle the speaker-notes panel

## Authoring slides

Workflow deck: edit `src/decks/workflow/slides.ts`. Each slide needs `id`, `title`, `body: ContentItem[]`, and (recommended) a `notes` string.

Research deck: edit `src/decks/research/slides.ts`. Same shape plus a `density` field. The summary route renders only slides marked `'summary' | 'both'`; the full route renders only `'full' | 'both'`. Most slides should be `'both'`.

Every claim about counts, time, or behavior in the research deck must cite the research notes at `enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md` or a commit SHA — use a `callout { tone: 'evidence' }` content item or an inline link.
