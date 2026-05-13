# Auditor: `prettierrc-parser-plugins`

## What it checks

When a TypeScript repo uses decorators (e.g. NestJS `@Injectable()`, `@Controller()`, TypeORM `@Entity()`), `@trivago/prettier-plugin-sort-imports` (and similar import-ordering plugins) need to be told the source uses decorator syntax. That signal is the `decorators-legacy` entry in `importOrderParserPlugins`. Without it, the plugin fails on the first decorator it encounters, producing an unstable import order or a hard error depending on plugin version.

This auditor verifies the entry is present when (and only when) the repo actually uses decorators.

## Precondition

- A prettier configuration file exists in one of these forms:
  - `.prettierrc`
  - `.prettierrc.json`
  - `.prettierrc.js`
  - `.prettierrc.cjs`
  - `prettier` block in `package.json`
- At least one `.ts` file under a source root (typically `src/`, but accept any TS file outside `node_modules/`).

If neither condition holds → `skipped` with reason "no prettier config" or "no TS sources".

## Check logic

1. Parse the prettier config (JSON or eval'd JS export) and read the `importOrderParserPlugins` array. If the config does not declare an import-ordering plugin at all (no `importOrder*` keys, no `@trivago/...` plugin imported), report `skipped` with reason "no import-ordering plugin configured" — there is nothing for this auditor to verify.
2. Detect decorator usage in TS source files. Acceptable detection strategies (in increasing order of precision):
   - **Glob + regex** (fastest): grep `**/*.ts` excluding `node_modules` for `^@[A-Z][A-Za-z0-9]*\(` at the start of a line (allowing leading whitespace) or for the `@Injectable\|@Controller\|@Module\|@Entity\|@Component\|@Pipe\|@Directive\|@Get\|@Post` set. This produces false positives on string literals but is good enough for a hygiene check.
   - **AST** (precise): parse each TS file with `@typescript-eslint/parser` and look for `Decorator` nodes. Only worth doing if the regex pass produced confusing results.
3. If decorators are present **and** `decorators-legacy` is **not** in `importOrderParserPlugins` → `fail`.
4. If decorators are present **and** `decorators-legacy` **is** in `importOrderParserPlugins` → `pass`.
5. If no decorators are present → `pass` regardless of plugin entry. The plugin entry is inert when no decorators exist; flagging it would produce noise.

## Failure output shape

```markdown
## prettierrc-parser-plugins: fail

`.prettierrc` is missing `decorators-legacy` in `importOrderParserPlugins`; repo contains decorator usage.

- Finding: <N> `.ts` files use decorators (sample: `<path1>`, `<path2>`, `<path3>`). `<prettier-config-path>` `importOrderParserPlugins` is `<current-array>`.
  - Fix: change `importOrderParserPlugins` to `<current-array-with-decorators-legacy-appended>` in `<prettier-config-path>`.
```

## One-line fix

Append `"decorators-legacy"` to the `importOrderParserPlugins` array in the prettier config. If the array doesn't exist yet, create it as `["typescript", "decorators-legacy"]`.

## Notes

- "decorators-legacy" is the Babel parser plugin name. Plugin versions that use a different parser (e.g. typescript-eslint's parser directly) may use a different key — the auditor should accept "decorators" as an equivalent if it appears, and flag any other value as suspicious.
- The auditor does **not** check that the prettier plugin itself is installed (separate concern). If the plugin is missing entirely, the `importOrderParserPlugins` key wouldn't exist and the auditor reports `skipped` per step 1.
