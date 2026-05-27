# nestjs-demo-deck-content Specification

## Purpose
TBD - created by archiving change add-nestjs-demo-deck. Update Purpose after archive.
## Requirements
### Requirement: nestjs-demo deck SHALL exist as its own slide module

The nestjs-demo deck SHALL be authored at `apps/presentation/src/decks/nestjs-demo/slides.ts` as a single slide array exported as `nestjsDemoSlides`. Each slide SHALL satisfy the existing `Slide` interface from `apps/presentation/src/types.ts` (`id`, `title`, `body: ContentItem[]`, optional `notes`). The deck SHALL NOT use the `ResearchSlide` shape — there is no `density` field, because this deck has no summary variant.

The deck SHALL declare its theme at `apps/presentation/src/decks/nestjs-demo/theme.ts`, exporting a `Theme` object as `nestjsDemoTheme` whose `name` field equals `'nestjs-demo'`.

#### Scenario: Deck loads at its route
- **WHEN** a viewer opens `/#/nestjs-demo`
- **THEN** the app SHALL render the deck's slide array via the shared `DeckView` component using `nestjsDemoTheme`

#### Scenario: Slide array shape
- **WHEN** the slide array is read
- **THEN** every entry SHALL declare `id` (kebab-case, unique within the array), `title`, and `body` AND MAY declare `notes`; no entry SHALL declare a `density` field

#### Scenario: Theme export shape
- **WHEN** `nestjsDemoTheme` is imported
- **THEN** it SHALL be a `Theme` whose `name` is exactly `'nestjs-demo'`

### Requirement: Deck SHALL contain exactly 7 slides

The rendered slide list SHALL contain exactly 7 slides. The bound is intentionally tight to encode the "very brief walk through" editorial directive that produced the deck; growth past 7 SHALL be treated as a signal that the deck's scope is drifting, not as a free pass to keep adding slides.

#### Scenario: Slide count is exactly 7
- **WHEN** the deck loads at `/#/nestjs-demo`
- **THEN** the rendered slide count SHALL be 7

#### Scenario: Slide count grows past 7
- **WHEN** a contributor proposes a slide that would push the array to 8 or more
- **THEN** the proposal SHALL be treated as a scope question (does the deck need a longer-form variant or a separate deck?) and SHALL NOT land as a slide-array append

### Requirement: Slide narrative order SHALL match the "one experiment, four outputs" arc

The 7 slides SHALL be ordered so that the AI Week experiment is framed first, the case study is summarized briefly (with a sub-link to the research deck for specifics), and then each of the four shipped outputs gets its own slide, closing with the current adoption status. The ordering SHALL be: (1) the experiment (AI Week, NestJS as ADOPT in `ut-standards`, hypothesis that SDD compresses a multi-week NestJS migration epic), (2) the case study in brief with a sub-link to the research deck (Express HTTP + plain gRPC → NestJS via OpenSpec, several weeks → 2 days, documented to assess validity / accuracy / quality / gaps), (3) Output 1 — the `insight-out-opsx` package, (4) Output 2 — the `migrate-to-nestjs` skill, (5) Output 3 — the team-aligned OpenSpec skills (`/opsx:plan`, `/opsx:code-review`, `/opsx:summarize`), (6) Output 4 — the GitHub agentic drift-detector that fires on PR merge, (7) where the experiment is now (adoption + rollout status).

Slides 1 and 2 SHALL be standalone — a viewer who leaves after slide 2 SHALL have the takeaway (an AI Week experiment compressed a multi-week NestJS migration into two days; specifics live in the research deck). Slides 3–6 SHALL each present one shipped output as a discrete artifact, named by its in-org identifier and with a clickable link or in-repo path. Slide 7 SHALL close the loop on adoption status.

#### Scenario: Slide 1 frames the AI Week experiment
- **WHEN** a viewer reads slide 1
- **THEN** they SHALL learn: this was an AI Week experiment, NestJS is the ADOPT framework per `ut-standards`, every new service in the team is bootstrapped with NestJS, those epics typically take weeks, and the hypothesis was that SDD via OpenSpec could compress that work

#### Scenario: Slide 2 summarizes the case study and links to the research deck
- **WHEN** a viewer reads slide 2
- **THEN** the slide SHALL state the migration shape (Express HTTP service + plain gRPC service → NestJS via OpenSpec) and the high-level compression claim ("several weeks → 2 days"), AND SHALL include a sub-link affordance (e.g. an inline link, a `link` content item, or a `callout` with an embedded link) navigating to `/#/research` for the full case study

#### Scenario: Slides 3 through 6 each present one shipped output
- **WHEN** a viewer reads slides 3, 4, 5, and 6
- **THEN** each slide SHALL present exactly one shipped output, in this order: slide 3 — `insight-out-opsx` (the package); slide 4 — `migrate-to-nestjs` (the source-agnostic migration skill); slide 5 — the team-aligned OpenSpec skills (`/opsx:plan`, `/opsx:code-review`, `/opsx:summarize`); slide 6 — the agentic GitHub drift-detector

#### Scenario: Slide 7 reports adoption status
- **WHEN** a viewer reads slide 7
- **THEN** the slide SHALL describe the current adoption posture (`insight-out-opsx` installed across all team repos; agentic drift-detector running on at least one repo for monitoring; full rollout completing the week following the talk) without restating the procedural detail from slides 3–6

### Requirement: Every numerical or behavioral claim SHALL cite a source

Every slide that makes a numerical claim (PR counts, rebase counts, sub-PR counts, additions/deletions, dates, compression-ratio claims like "weeks → 2 days") or a behavioral claim about the experiment, the migration, the skills, the package, or the drift-detector SHALL cite at least one of:

- A skill file under `skills/` in this repo (e.g. `skills/migrate-to-nestjs/SKILL.md`, `skills/ut-standards/SKILL.md`, any `/opsx:*` skill description, or any recipe under those skills' `recipes/` folders),
- A GitHub URL on a UserTesting repo — the migration repo's PRs (#253, #256, sub-PRs), the `insight-out-opsx` package repo, or the drift-detector workflow file,
- The research notes at `openspec/research/sdd-exploration-notes.md` within the migration repo,
- A speaker-asserted figure (e.g. "several weeks → 2 days") MAY stand on its own when the speaker is the authority for that number; in that case the slide MUST attribute it to "the speaker" or "team experience" via a `callout` so the reader knows the number is anecdotal not document-sourced.

**Repo-name convention.** The migration's local checkout uses the directory name `enriched-video-uploads-v2` (research-mode copy), but the live GitHub repo is `UserTestingEnterprise/enriched-video-uploads` (no `-v2` suffix). PR URLs and any blob URLs SHALL target the GitHub name; prose references to the local working copy MAY use the `-v2` directory name. The two are NOT interchangeable in URLs.

Citation MAY take the form of an inline link, a `callout` content item with `tone: 'evidence'`, or a `link` content item; the choice is editorial. What matters is that a reader who challenges any number can find its source on the slide that makes the claim.

#### Scenario: Numerical claim carries a citation
- **WHEN** a slide displays a number such as "17 stacked sub-PRs", "~18 rebase cycles", "13 sub-PRs absorbed by #253", or any addition/deletion count
- **THEN** the same slide SHALL include a link or evidence callout naming the source (SKILL.md, a PR URL, or the research notes)

#### Scenario: Behavioral claim carries a citation
- **WHEN** a slide describes migration behavior such as "Dockerfile CMD was flipped to dist/main.js" or "prettier was missing the decorators-legacy plugin"
- **THEN** the same slide SHALL include a citation pointing to the source artifact for that claim

#### Scenario: Pure editorial framing does not require citation
- **WHEN** a slide contains only editorial framing (e.g., a section transition, a `subheading` content item summarizing the deck's posture)
- **THEN** no citation SHALL be required

### Requirement: Case-study slide SHALL link out to the research deck rather than enumerate PRs

Slide 2 (the case-study slide) SHALL primarily delegate to the research deck for case-study specifics. The slide MAY cite the two integration PRs (#253 `migrate-bff-foundation`, #256 `migrate-service-foundation`) as additional evidence links, but MUST surface a clear sub-link affordance to `/#/research` so a viewer who wants the full case study can navigate there. The slide MUST NOT walk individual sub-PRs.

The two GitHub PR URLs, when used as citations, SHALL be:

- `https://github.com/UserTestingEnterprise/enriched-video-uploads/pull/253`
- `https://github.com/UserTestingEnterprise/enriched-video-uploads/pull/256`

#### Scenario: Research-deck sub-link is present on the case-study slide
- **WHEN** slide 2 renders
- **THEN** the slide SHALL contain a navigation affordance to `/#/research` (an inline link, a `link` content item, or a `callout` whose body embeds the link) so a viewer can open the full case-study deck

#### Scenario: PR enumeration is optional, not required
- **WHEN** slide 2 renders
- **THEN** the slide MAY include links to PR #253 and PR #256 as supplementary citations, BUT the slide MUST NOT make the PR enumeration its primary content — the research-deck sub-link is the primary navigation

#### Scenario: Slide does not enumerate sub-PRs
- **WHEN** slide 2 renders
- **THEN** no individual sub-PR number (e.g., `#226`, `#229`) SHALL appear as a slide-level data point — those numbers belong in the research deck or the PR bodies

### Requirement: Deck SHALL present each of the four shipped outputs as its own slide

The deck SHALL devote slides 3 through 6 to the four shipped outputs of the AI Week experiment, one output per slide, each carrying a name (the in-org identifier), a one-paragraph summary of what it does, and at least one clickable link or in-repo path resolving the output. The four outputs and their slide assignments SHALL be:

- **Slide 3 — `insight-out-opsx`**: the OpenSpec framework extracted into a UserTesting-org-private GitHub package (`@usertestingenterprise/insight-out-opsx`). Adoption requires a GitHub token to access the private registry.
- **Slide 4 — `migrate-to-nestjs`**: the source-agnostic NestJS migration skill (target is always TS/Node + NestJS; source can be Express, hapi, hand-rolled gRPC, or non-Node frameworks). Bundles recipes for the squash-merge rebase cascade, sibling-file diff inspection, and sibling source-layout inspection.
- **Slide 5 — team-aligned OpenSpec skills**: three OpenSpec skills shaped by what the experiment learned about the team's process — `/opsx:plan` (cascading-branch planning), `/opsx:code-review` (post-`/opsx:apply` review gate), `/opsx:summarize` (human-readable synopsis of spec + tasks + design for parity-check during review).
- **Slide 6 — the GitHub agentic drift-detector**: an automated flow that runs on every PR merge and flags drift between code and the relevant spec; on detection it opens a corrective PR and assigns it back to the merger.

#### Scenario: Each output gets its own slide with a name and a link
- **WHEN** slides 3, 4, 5, and 6 render
- **THEN** each slide SHALL display the output's in-org identifier in its title or body, AND SHALL include at least one clickable link, in-repo path, or `callout` referencing the output's location (the GitHub repo URL, the in-repo skill folder under `skills/`, the OpenSpec skill name, or equivalent locator)

#### Scenario: insight-out-opsx slide notes the access requirement
- **WHEN** slide 3 renders
- **THEN** the slide SHALL state that the package lives on a UserTesting private GitHub org and that adoption requires a GitHub token to authenticate against the private registry

#### Scenario: migrate-to-nestjs slide names the source-agnosticism contract
- **WHEN** slide 4 renders
- **THEN** the slide SHALL state that the skill's source side is agnostic (any language/framework) and that the target is always TS/Node + NestJS, AND SHALL reference the bundled recipes (rebase recipe and the two sibling-inspection checklists) by their function

#### Scenario: Team-aligned opsx skills slide names exactly three skills
- **WHEN** slide 5 renders
- **THEN** the slide SHALL name exactly `/opsx:plan`, `/opsx:code-review`, and `/opsx:summarize`, each with a one-line description of what the team uses it for; no other `/opsx:*` skill SHALL be named on slide 5

#### Scenario: Drift-detector slide describes the PR-merge flow
- **WHEN** slide 6 renders
- **THEN** the slide SHALL state: the flow fires on PR merge, it compares the merged code against the relevant spec for drift, and on drift detection it opens a corrective PR and assigns the merger as that PR's reviewer or assignee

### Requirement: Deck SHALL NOT introduce new brand tokens

The deck's theme SHALL use only the existing `ut-*` palette tokens (`ut-navy`, `ut-blue`, `ut-teal`, `ut-blue-light`, etc.) declared in the existing Tailwind config. No new color tokens, fonts, or asset files SHALL be added by this change.

#### Scenario: Theme palette unchanged
- **WHEN** the change is merged
- **THEN** `apps/presentation/tailwind.config.ts` SHALL contain only the brand tokens it contained before the change (no additions, no renames)

#### Scenario: Accent uses a solid ut-navy bar
- **WHEN** `nestjsDemoTheme.accentClasses` is read
- **THEN** it SHALL describe a solid `ut-navy` bar (no gradient, no custom stroke, no new color token)

