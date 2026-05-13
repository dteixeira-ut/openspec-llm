## Change Summary: add-package-extraction-deck

### What Was Built
Added a third deck to the presentation app at `apps/presentation/src/decks/package-extraction/` (slides + theme) pitching the upcoming extraction of `templates/opsx/` and `bin/opsx-sync` into an installable `@usertesting/insight-out-opsx` npm package. Twelve slides across five sections plus close (Frame, Locked Decisions, The Bin, Drift, Adoption, Close); each load-bearing claim cites either the locked-decisions memory record, the codex-placement memory record, or the archived RAD-75634 mitigations. Wired the new route at `/#/package-extraction`, extended the `Theme.name` and `Deck` unions, and added a third card to the landing page (now `md:grid-cols-3` with "Three decks. One workflow.").

### Why
The single-source-of-truth work in this repo ended at "one canonical templates tree per repo, drift-checked." For the templates to act as a versioned contract across multiple UT repos they need to be addressable — and the existing two decks had no slot to pitch that shape. A third deck lets platform-eng and repo owners see the package shape before it lands, so adoption is shaped by audience input rather than presented as a fait accompli.

### Key Decisions
- **Forward-looking deck, not a case study** — the package extraction has not shipped yet; deferring until it had would have made the deck reactive instead of formative.
- **Solid `ut-teal` accent over a new brand color** — `ut-teal` is the freshest existing palette token; inventing a fourth color would break the "no new brand colors" rule.
- **Landing-page grid extends to `md:grid-cols-3` over an asymmetric "primary + two below" layout** — the three decks are content peers; the layout should say so. Asymmetric hierarchy would imply the workflow deck is the "real" one.
- **No density variant for v1** — at 10–14 slides the summary deck would be ~6 slides and feel padded. Easy to lift later if the deck grows.
- **Versioning policy is NOT slide content** — semver is industry-standard; a primer would pad the deck without teaching the audience anything new. Section 4 covers drift only.
- **Each pitch-style deck reuses the workflow card shape; only research keeps the "paper" treatment** — two pitch cards + one case-study card reads cleaner than three different card styles, and the paper treatment is uniquely a case-study signal.

### Spec Changes
- **package-extraction-deck-content**: added — new capability defining the deck's narrative arc, slide-count bounds (10–14), citation rule for load-bearing claims, and theme contract.
- **presentation-shell**: modified — routing extends from three destinations to four (`/#/package-extraction` added), landing-page requirement now names three cards, per-deck theme requirement adds a third entry, and the `Theme.name` union widens to `'workflow' | 'research' | 'package-extraction'`.

### Tasks Completed
**18/18 tasks complete**
- Section 1 — Scaffolding (10 tasks): type-union extensions, parser branch, theme module, six narrative-arc sections of slide content
- Section 2 — Wiring (3 tasks): App.tsx route branch, LandingPage framing copy, three-card grid + new card
- Section 3 — Verification (5 tasks): build, slide count (12, target ~12), citation spot-check, routing + viewport checks, strict + all-specs validate, opsx-sync clean

### Decisions made without consultation
**From `proposal.md`**
- Deck name `package-extraction` — Alternatives: `distribution`, `opsx-package`, `insight-out`. Rationale: most descriptive of what the deck is *about*, survives any working-name rename of the package itself.
- Forward-looking pitch shape, not a case study — Alternative: wait until the package ships and produce a second case-study deck. Rejected: the value of the deck *now* is letting audiences shape the work before it lands.
- Locked decisions surfaced verbatim from memory — Alternative: paraphrase. Rejected: those decisions are load-bearing and credibility depends on the exact agreed wording.

**From `design.md`**
- `ut-teal` chosen over `ut-blue` or a new blend — Alternative: derive a new token. Rejected: proposal forbids new brand colors.
- `md:grid-cols-3` symmetric layout — Alternative: "primary deck + two below" hierarchy. Rejected: the three decks are content peers.
- No density variant for v1 — Alternative: ship full + summary. Rejected: at 10–14 slides the summary would feel padded.
- Workflow-card shape reused for the third card — Alternative: invent a new card style. Rejected: the research "paper" treatment is a unique case-study signal; mixing three styles would mis-cue the audience.
