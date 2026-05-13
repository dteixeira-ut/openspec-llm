# Auditor: `dockerfile-entrypoint`

## What it checks

A `Dockerfile` `CMD ["node", "dist/<x>.js"]` looks valid at build time even when its `src/<x>.ts` source file no longer exists — the build stage produces a `dist/` directory from whatever sources *do* exist, and the runtime stage references a `dist/<x>.js` that simply isn't there. The container builds, the image ships, the pod fails on `node`'s "Cannot find module" at deploy time.

This auditor catches that class of bug, plus a related one: the build stage is missing a `COPY` for `tsconfig.build.json` or `nest-cli.json` even though the build script needs them.

## Precondition

- At least one `Dockerfile` exists at the target repo's root (or under any path; `find . -name Dockerfile -not -path '*/node_modules/*'`).

If no `Dockerfile` is present → `skipped` with reason "no Dockerfile at target path".

## Check logic

### Check A — dangling `CMD` / `ENTRYPOINT`

1. Grep the `Dockerfile`(s) for `CMD` or `ENTRYPOINT` instructions that reference `dist/<x>.js` (either JSON-array form `CMD ["node", "dist/<x>.js"]` or shell form `CMD node dist/<x>.js`).
2. For each match, extract `<x>` (the filename without the `dist/` prefix or `.js` suffix).
3. Look for the source: `<source-root>/<x>.ts`, where `<source-root>` is read from `tsconfig.json` `compilerOptions.rootDir` (default `src/`). Also accept `apps/<name>/src/<x>.ts` for Nx-style layouts.
4. If no source file exists → `fail`. In the failure output, list candidate replacement files (any `<source-root>/*.ts` that has a top-level `await bootstrap()` or `NestFactory.create` call, since those are usually entrypoints).
5. If the source exists → Check A `pass`.

### Check B — missing `COPY` for build configs

1. Detect whether the `Dockerfile`'s build stage runs `nest build` (or runs `npm run build` / `pnpm build` where the corresponding `package.json` script invokes `nest build`).
2. If yes, verify the build stage has `COPY` instructions for both `tsconfig.build.json` and `nest-cli.json` **when those files exist in the repo**. (If the file doesn't exist in the repo, no `COPY` is needed.)
3. If a required `COPY` is missing → `fail`. The symptom is that `nest build` falls back to default config and ships test files plus a too-broad `dist/`.

### Combined result

- Both checks `pass` → `pass`.
- Either check `fail` → `fail`, with one finding per failed sub-check.
- The auditor `skipped` only if the whole-auditor precondition fails (no Dockerfile).

## Failure output shape

```markdown
## dockerfile-entrypoint: fail

`Dockerfile` has issues that will surface at deploy time.

- Finding (dangling CMD): `Dockerfile` line <N>: `CMD ["node", "dist/index.js"]`, but no `src/index.ts` exists. Candidate replacements: `src/main.ts`.
  - Fix: change `CMD` to `CMD ["node", "dist/main.js"]` (or update `src/main.ts` → `src/index.ts` if the legacy name is intended).
- Finding (missing COPY): builder stage runs `nest build` but does not `COPY tsconfig.build.json` (file exists at repo root).
  - Fix: add `COPY tsconfig.build.json ./` to the builder stage before `RUN nest build` (and the same for `nest-cli.json` if missing).
```

## One-line fix

- Dangling `CMD`: update the `CMD` filename to match an existing source file, or add the source file back if it was deleted in error.
- Missing `COPY`: add the missing `COPY tsconfig.build.json ./` and/or `COPY nest-cli.json ./` lines to the builder stage.

## Notes

- The auditor does **not** validate that `npm run build` produces the expected `dist/` layout — that would require running the build, which is out of scope for a hygiene check.
- For multi-stage Dockerfiles, only the final stage's `CMD` matters at runtime. Intermediate stages' `CMD` lines are inert and the auditor should ignore them.
- If the same Dockerfile has both `ENTRYPOINT` and `CMD`, the auditor checks the `ENTRYPOINT` first (it overrides `CMD` for the runtime command).
