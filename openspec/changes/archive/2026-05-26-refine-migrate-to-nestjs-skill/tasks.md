## 1. SKILL.md edits — inputs and procedure

- [x] 1.1 In `skills/migrate-to-nestjs/SKILL.md` `Inputs` section, add a `Source-stack descriptor` subsection documenting the closed-shape descriptor (`http`, `rpc`, `orm`, `queue`, `validator` slots with their enumerated values) per the spec's "structured source-stack descriptor" requirement.
- [x] 1.2 In the same `Inputs` section, add an OPTIONAL `referenceCodebase` field (absolute path to a sibling NestJS service). Document the field as optional, NOT required-by-default. Quote the verbatim retrofit-risk warning the spec requires the agent to emit in the proposal when the field is omitted.
- [x] 1.3 Add a `Capability derivation` subsection under the `Procedure` section, with the table mapping descriptor slot values to foundation capabilities (rows for each `http` value, each `rpc` value, each `orm` value, each `queue` value, each `validator` value, plus the fixed `test-scaffolding` tail).

## 2. SKILL.md edits — scope and framework coverage

- [x] 2.1 Update the `When to use this skill` section's framework list to enumerate Express, hapi, Mali, hand-rolled `@grpc/grpc-js` (grpcServer), and ApolloServer as in-scope legacy sources, per the spec's "full HOLD set" requirement.
- [x] 2.2 In the same section, add an explicit assertion that the source language is TypeScript on Node.js, citing the deploying organization's Languages choice standardization page.

## 3. Create the `ut-standards` skill

- [x] 3.1 Create `skills/ut-standards/SKILL.md` with the frontmatter prescribed by the spec (name, description, license: MIT, compatibility note, metadata.author: `usertesting-arch`, version `1.0`).
- [x] 3.2 Add the self-check section at the top of the SKILL.md noting that the skill is UT-specific by design and listing the substitution surface for external consumers (three Confluence URLs + UT-specific resource names).
- [x] 3.3 Author the "Framework standardization" section enumerating ADOPT/HOLD framework status. Include the named scenarios (`nest-is-target-framework`, `legacy-source-is-on-hold`).
- [x] 3.4 Author the "UT REST API Standard" section enumerating all seventeen named rules (`audience-prefix`, `uri-versioning`, `error-shape`, `idempotency-key`, `x-request-id`, `iso-standards`, `uuid-v4-ids`, `pagination-shape`, `action-sub-resources`, `monitoring-endpoint`, `openapi-spec`, `required-resource-attributes`, `summary-vs-detail-responses`, `read-only-db-for-gets`, `http-method-semantics`, `batch-query-pattern`, `json-content-type`) with WHEN/THEN scenarios per rule.
- [x] 3.5 Author the "Languages choice standardization" section enumerating ADOPT/ASSESS/HOLD language status.
- [x] 3.6 Author the `## Graduation` section listing the three graduation criteria (versioned reference, second-org pattern, three-consumer threshold).
- [x] 3.7 PORTABILITY ASSERTION — grep the produced `skills/ut-standards/` directory tree for the literal string `openspec-llm` and verify zero matches; no hard-coded host-repo name in SKILL.md or any recipe.

## 4. SKILL.md edits — invocation of ut-standards + cross-reference section

- [x] 4.1 Add an instruction to `skills/migrate-to-nestjs/SKILL.md`'s Procedure section directing the agent to INVOKE the `ut-standards` skill (via the host runtime's Skill-invocation primitive) BEFORE authoring any HTTP/RPC/persistence-flavor capability specs. Name the step explicitly (e.g. "Step 0.5 — Load org-normative rules").
- [x] 4.2 Add the fallback: when the host runtime lacks a Skill-invocation primitive, the agent SHALL READ `skills/ut-standards/SKILL.md` end-to-end at the same step.
- [x] 4.3 Add a `## Standards cross-reference` section near the end of `skills/migrate-to-nestjs/SKILL.md` (before `Open questions` / `Decisions made without consultation`).
- [x] 4.4 In that section, list the rule names from `ut-standards` that apply to NestJS migrations, with one-line notes on how each is honored in the produced migration. Do NOT duplicate the rule bodies.
- [x] 4.5 PORTABILITY ASSERTION — grep the produced `skills/migrate-to-nestjs/SKILL.md` for the literal string `openspec-llm`; verify zero matches.

## 5. SKILL.md edits — error-shape BREAKING update

- [x] 5.1 Locate the current "Error shape from documented schema, not runtime" entry under `Canonical Library Decisions (rationale)` (or wherever it lives in `SKILL.md`) and replace it with: "Error shape per the `error-shape` rule in `ut-standards` (`{ error: { code, message, target } }`); if legacy returns a divergent shape, the new implementation aligns with the standard and the deviation is documented in the PR body."
- [x] 5.2 Verify there are no other references to "documented schema" or `error-response.schema.ts` in `SKILL.md`; if any remain, update them to match the new guidance.

## 6. SKILL.md edits — new must-ask classes

- [x] 6.1 In the `Migration-specific must-ask classes` section, append the four new classes from the spec: descriptor slot value not in the closed list; audience category absent for HTTP-flavor migration; error shape conflict between sibling and organization standard; sibling reference layout cannot be expressed by the source-layout recipe.

## 7. New recipe: sibling-source-layout-checklist.md

- [x] 7.1 Create `skills/migrate-to-nestjs/recipes/sibling-source-layout-checklist.md` covering the seven inspection items from the spec (src/ layout shape, config module shape, logger module shape, exception filter shape, test layout, test infra placement, naming conventions).
- [x] 7.2 The recipe's `## Output` section MUST direct the agent to produce a single "convention manifest" markdown document attached to the foundation proposal (NOT a reconciliation commit — distinguish from the file-diff recipe's output).
- [x] 7.3 The recipe's preamble MUST link to `sibling-file-diff-checklist.md` with a one-line distinction ("this recipe inspects source conventions; sibling-file-diff covers config files").

## 8. Existing recipe link-back

- [x] 8.1 Update `skills/migrate-to-nestjs/recipes/sibling-file-diff-checklist.md` preamble to link to the new `sibling-source-layout-checklist.md`, with the symmetric one-line distinction.

## 9. SKILL.md Step 0 wiring

- [x] 9.1 Update `SKILL.md`'s Step 0 section to direct agents to run BOTH inspections at Step 0 (file-diff + source-layout), with the file-diff producing a reconciliation commit and the source-layout producing a convention manifest. Name both recipes inline.

## 10. Living spec updates (handled by `/opsx:archive`)

- [x] 10.1 ~~Apply delta to `openspec/specs/skill-migrate-to-nestjs/spec.md`.~~ Deferred to `/opsx:archive`. The archive command auto-promotes the MODIFIED + ADDED deltas from `openspec/changes/refine-migrate-to-nestjs-skill/specs/skill-migrate-to-nestjs/spec.md` to the living spec; manual application would duplicate the work and conflict. Verification of the resulting living spec happens at task 10.3 post-archive.
- [x] 10.2 ~~Create `openspec/specs/skill-ut-standards/spec.md` manually.~~ Deferred to `/opsx:archive`. The archive command auto-creates the new capability's living spec from `openspec/changes/refine-migrate-to-nestjs-skill/specs/skill-ut-standards/spec.md`'s `## ADDED Requirements` block.
- [ ] 10.3 After the user runs `/opsx:archive refine-migrate-to-nestjs-skill` (task 12.2), verify both living specs validate via `openspec validate --strict` from this repo's root.

## 11. Validation

- [x] 11.1 Run `openspec validate refine-migrate-to-nestjs-skill --strict` from this repo's root; verify it passes.
- [x] 11.2 Re-read `skills/migrate-to-nestjs/SKILL.md` end-to-end and verify the agnostic framing is preserved — no `enriched-video-uploads`, `video-uploads-bff-service`, `video-uploads-service`, or other project-specific paths leaked into the additions. Also re-confirm the portability assertion (no `openspec-llm` literal in either SKILL.md).
- [x] 11.3 Verify each spec requirement (in both capabilities) can be traced to at least one task above; any requirement without a matching task gets a new task added.

## 12. Pull request

- [ ] 12.1 Open the PR via `/opsx:pr` against `main` in this repo. Title: `refine-migrate-to-nestjs-skill: source-stack descriptor + source-layout checklist + ut-standards skill + invocation`. Body cites the proposal and the three Confluence URLs.
- [ ] 12.2 After merge, run `/opsx:archive refine-migrate-to-nestjs-skill` to archive and trigger the post-archive `/opsx:summarize` hook.

## Decisions made without consultation

- **No separate task to delete the prior "Error shape from documented schema" text.** Task 5.1 is an in-place replacement rather than a delete + add. Alternative — explicit delete task — rejected because the text is a single bullet inside `Canonical Library Decisions (rationale)`; the replacement is cleaner expressed as one edit. The deletion-companion rule in `openspec/config.yaml` applies to file deletions (Dockerfiles, entrypoints, etc.), not in-place text replacements within existing files.
- **Tasks are grouped by editing surface (SKILL.md inputs, SKILL.md scope, new skill, invocation wiring, etc.) rather than by spec requirement.** Alternative — one task group per spec requirement — rejected because several spec requirements share a single editing surface (`SKILL.md` Inputs section, the new `ut-standards/SKILL.md` body), and grouping by surface keeps the diff cohesive per task group, which makes the apply phase produce smaller commits.
- **Portability assertions are checked via grep, not via a structural validator.** Alternative — add a JSON-schema or lint step that fails on host-repo references — rejected because the host-repo-name surface is open-ended (the literal string `openspec-llm`, but also potentially future renames); a grep step at apply time is sufficient and doesn't require new tooling. If the skill is graduated, the grep target updates with it.
