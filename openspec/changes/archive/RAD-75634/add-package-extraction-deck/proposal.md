Starting state: greenfield
Cutover: greenfield
Ticket: RAD-75634 (continuation)

## Why

The presentation app today carries two decks: a forward-looking
"Workflow" pitch and a backward-looking "Migration Case Study." The
next phase of opsx work — extracting `templates/opsx/` + `bin/opsx-sync`
into a versioned npm package (`@usertesting/insight-out-opsx`) — has
no slot in either deck. The Workflow deck is general-purpose and
already long; the Research deck is a closed case study about
`enriched-video-uploads-v2` and its mitigations. The package
extraction is its own pitch: a third, smaller deck that explains the
distribution shape, the locked decisions, and what changes for
consuming repos. Without it, the presentation has nowhere to make the
"one source of truth, properly versioned" case to the audiences who
need to hear it (platform-eng leads, repo owners considering
adoption).

This proposal adds the deck only. The package extraction itself is
out of scope and will be tracked separately when work begins in the
new repo.

## What Changes

- **New deck** `apps/presentation/src/decks/package-extraction/` with
  `slides.ts` and `theme.ts`, mirroring the existing
  `decks/workflow/` and `decks/research/` shape.
- **Slide content** covering: (1) the problem (template drift across
  consumer repos), (2) the package shape (`@usertesting/insight-out-opsx`,
  UT private registry, peer-dep on `openspec`), (3) the
  bin (`opsx init` and `opsx sync` as subcommands), (4) the
  `opsx init` full-bootstrap contract (runs upstream openspec init,
  then `opsx sync`, then writes a commented-out `openspec/config.yaml`
  stub), (5) drift enforcement (two CI surfaces — package repo
  fixtures + consumer-repo install; Codex-global scope gap), (6)
  the cross-repo cutover sequence (publish package, repoint
  openspec-llm drift-check), (7) what's next for consumer repos
  (the install + init flow). Versioning policy is deliberately not
  slide content — semver is industry-standard and audiences do not
  need a primer.
- **New route** `/#/package-extraction` in `hooks/useHashRoute.ts`
  and `App.tsx`, plus extension of the `Deck` union type to include
  `'package-extraction'`.
- **Theme** extension: `Theme.name` union in `types.ts` gains
  `'package-extraction'`, and the new `theme.ts` declares the new
  deck's visual treatment (see design.md for color / accent
  decisions).
- **Landing page** gains a third card linking to
  `/#/package-extraction` with a one-line description. The page's
  framing copy ("Two decks. One workflow.") is updated to reflect
  three decks.

## Capabilities

### New Capabilities

- `package-extraction-deck-content`: defines the package-extraction
  deck's narrative arc, the slide count bounds, and the
  load-bearing claims each slide must surface (locked-decision
  citations, peer-dep prerequisite, codex-global rule). Modeled on
  `research-deck-content`.

### Modified Capabilities

- `presentation-shell`: the routing requirement (currently names
  three destinations) extends to four destinations, the landing-page
  requirement extends to three cards, and the per-deck theme
  requirement gains a third entry. The slide-data location
  convention (`apps/presentation/src/decks/<deck-name>/`) is already
  parametric on `<deck-name>` and does not need rewording — the new
  deck simply slots in.

## Impact

- `apps/presentation/src/decks/package-extraction/slides.ts` — new
  file, ~10–14 slides.
- `apps/presentation/src/decks/package-extraction/theme.ts` — new
  file, ~30 lines declaring the deck's `Theme`.
- `apps/presentation/src/types.ts` — `Theme.name` union gains a
  third entry.
- `apps/presentation/src/hooks/useHashRoute.ts` — `Deck` union and
  parser both extended.
- `apps/presentation/src/App.tsx` — new conditional branch for the
  new deck.
- `apps/presentation/src/components/LandingPage.tsx` — third card
  added, framing copy updated.
- `apps/presentation/src/components/SlideCard.tsx` — IF the new
  theme requires a per-deck background hook (the file currently
  branches on `theme.name === 'research'`), a new branch is added.
  Otherwise unchanged.
- `openspec/specs/presentation-shell/spec.md` — modified-spec delta
  for the three requirements above.
- `openspec/specs/package-extraction-deck-content/spec.md` — new
  living spec.
- No changes to `decks/workflow/` or `decks/research/`. No changes
  to `templates/opsx/` or `bin/opsx-sync` (this proposal is about
  the deck, not the package).

## Non-code surfaces

- **Config load mechanics**: N/A — slide content is static TypeScript
  baked into the bundle.
- **Secret sources**: N/A.
- **Container/deploy artifacts**: N/A — the presentation app builds
  to a static bundle via the existing `apps/presentation` Vite
  pipeline; no new deploy artifacts.
- **CI workflow scripts**: N/A — the existing `apps/presentation`
  build catches TS errors if slide or route shape regresses; no new
  workflow needed.
- **Observability endpoints**: N/A.

## Out of scope

- The package extraction itself (the new `insight-out-opsx` repo,
  the npm publish, the openspec-llm cutover). Tracked separately
  when work starts in the new repo.
- Restyling or reorganizing the Workflow or Research decks.
- Adding a fourth deck for the as-yet-unshipped Domain Skills home
  graduation (separate future work).
- Changing the slide rendering shell, the keyboard shortcuts, or
  any cross-deck chrome.

## Legacy preservation

This change is greenfield (a brand-new deck). The existing two
decks, their themes, their routes, and their slide content MUST be
preserved verbatim. Specifically:

- `decks/workflow/slides.ts` and `decks/workflow/theme.ts` MUST be
  byte-identical post-change.
- `decks/research/slides.ts` and `decks/research/theme.ts` MUST be
  byte-identical post-change.
- The `/#/workflow`, `/#/research`, and `/#/research/summary` route
  behaviors MUST be byte-identical post-change.
- The landing page's existing two cards MUST be visually
  identical; only a third card is added and the framing paragraph
  is reworded from "Two decks" to "Three decks."

No deletions. No reordering of the existing two decks on the
landing page (workflow first, research second, package-extraction
third).

## Decisions made without consultation

- **Deck name = `package-extraction`** (route slug, directory name,
  Deck-union member). Alternative considered: `distribution`,
  `opsx-package`, `insight-out`. Rationale: `package-extraction`
  is the most descriptive of what the deck is *about* (the
  extraction work), independent of whatever the final package
  name lands on — the deck survives a working-name rename.
- **Forward-looking deck shape, not a case study.** The package
  extraction has not shipped yet; the deck is a pitch for the
  upcoming work. Alternative considered: wait until the package
  ships and produce a second case-study deck. Rejected: the value
  of having this deck *now* is letting platform-eng and repo owners
  see the shape before it lands, so adoption is shaped by the
  audience's input rather than presented as a fait accompli.
- **Locked decisions from memory `opsx-package-extraction-open-questions`
  are surfaced verbatim on the relevant slide.** Alternative:
  paraphrase or summarize. Rejected: those decisions are
  load-bearing and the deck's credibility depends on quoting them
  in the language that was already agreed.
