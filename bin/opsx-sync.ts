// bin/opsx-sync.ts
//
// Canonical-templates generator for the opsx workflow set.
//
// Reads every `templates/opsx/<id>.md`, parses its YAML-subset frontmatter,
// and writes one tool-specific output file per (template × supported tool):
//
//   Claude Code: .claude/commands/opsx/<id>.md
//   Cursor     : .cursor/commands/opsx-<id>.md
//   Codex      : ${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md
//
// Each generated file begins with a banner so manual editors come back here.
//
// Flags:
//   --check          dry-run; compare in-memory output to on-disk content,
//                    exit 0 on match, 1 on diff (prints diffs).
//   --scope=ci       skip the Codex global path (used by CI).
//   --scope=all      include all three tools (default).

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const TEMPLATES_DIR = path.join(REPO_ROOT, "templates", "opsx");

const README_FILENAME = "README.md";

interface Frontmatter {
  id: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface Template {
  id: string;
  sourceFile: string;
  frontmatter: Frontmatter;
  body: string; // body text WITHOUT leading frontmatter, trimmed of leading blank lines
}

interface ToolTarget {
  tool: "claude" | "cursor" | "codex";
  // Absolute path of the file to write.
  outputPath: (id: string) => string;
  // Returns the full file contents (frontmatter + banner + body).
  render: (tpl: Template) => string;
  // Directory whose contents we sweep for stale `opsx-*` files.
  cleanupDir: () => string;
  // Regex matching files in cleanupDir that belong to this tool. Captures
  // group 1 is the workflow id so we can compare against the template set.
  cleanupRegex: RegExp;
}

// ---------- frontmatter parsing (YAML subset: scalar + flow-list strings) ----------

function parseFrontmatter(raw: string, sourceFile: string): { fm: Frontmatter; bodyStart: number } {
  if (!raw.startsWith("---\n")) {
    throw new Error(`${sourceFile}: missing YAML frontmatter (file must start with '---')`);
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) {
    throw new Error(`${sourceFile}: unterminated YAML frontmatter (missing closing '---')`);
  }
  const block = raw.slice(4, end);
  const bodyStart = end + 5; // skip "\n---\n"

  const fm: Partial<Frontmatter> = {};
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) {
      throw new Error(`${sourceFile}: cannot parse frontmatter line: ${rawLine}`);
    }
    const key = m[1];
    let value: string | string[] = m[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      value = inner === ""
        ? []
        : inner.split(",").map((s) => unquote(s.trim()));
    } else {
      value = unquote(value);
    }
    (fm as Record<string, unknown>)[key] = value;
  }

  for (const required of ["id", "title", "description"] as const) {
    if (typeof fm[required] !== "string" || !(fm[required] as string).length) {
      throw new Error(`${sourceFile}: missing required frontmatter field '${required}'`);
    }
  }
  return { fm: fm as Frontmatter, bodyStart };
}

function unquote(s: string): string {
  if (s.length >= 2) {
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
  }
  return s;
}

// ---------- per-tool frontmatter rendering ----------

const GENERATED_BANNER = (id: string) =>
  `<!-- generated from templates/opsx/${id}.md — do not edit -->`;

function yamlEscape(value: string): string {
  // Quote with double quotes if value contains characters that would change
  // YAML parsing (colon-space, leading symbols, etc.). Otherwise emit bare.
  if (
    /[:#\n"']/.test(value) ||
    /^[!&*?|>%@`\-]/.test(value) ||
    /\s$/.test(value) ||
    value === "" ||
    value === "true" ||
    value === "false" ||
    value === "null" ||
    /^[\d.+-]/.test(value)
  ) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

function yamlList(values: string[] | undefined): string {
  if (!values || values.length === 0) return "[]";
  return `[${values.map((v) => yamlEscape(v)).join(", ")}]`;
}

function renderClaude(tpl: Template): string {
  const { frontmatter: fm } = tpl;
  const category = fm.category ?? "Workflow";
  const tags = fm.tags ?? [];
  const fmBlock = [
    "---",
    `name: ${yamlEscape(`OPSX: ${fm.title}`)}`,
    `description: ${yamlEscape(fm.description)}`,
    `category: ${yamlEscape(category)}`,
    `tags: ${yamlList(tags)}`,
    "---",
  ].join("\n");
  return `${fmBlock}\n\n${GENERATED_BANNER(fm.id)}\n\n${tpl.body}`;
}

function renderCursor(tpl: Template): string {
  const { frontmatter: fm } = tpl;
  const tags = fm.tags ?? [];
  const fmBlock = [
    "---",
    `name: ${yamlEscape(`opsx-${fm.id}`)}`,
    `description: ${yamlEscape(fm.description)}`,
    `tags: ${yamlList(tags)}`,
    "---",
  ].join("\n");
  return `${fmBlock}\n\n${GENERATED_BANNER(fm.id)}\n\n${tpl.body}`;
}

function renderCodex(tpl: Template): string {
  const { frontmatter: fm } = tpl;
  const tags = fm.tags ?? [];
  // Codex prompt files use simple frontmatter; mirror the upstream shape
  // produced by `openspec init` (name + description).
  const fmBlock = [
    "---",
    `name: ${yamlEscape(`opsx-${fm.id}`)}`,
    `description: ${yamlEscape(fm.description)}`,
    `tags: ${yamlList(tags)}`,
    "---",
  ].join("\n");
  return `${fmBlock}\n\n${GENERATED_BANNER(fm.id)}\n\n${tpl.body}`;
}

// ---------- discovery ----------

function resolveCodexHome(): string {
  const env = process.env.CODEX_HOME;
  if (env && env.length > 0) return env;
  return path.join(os.homedir(), ".codex");
}

function buildTargets(scope: "all" | "ci"): ToolTarget[] {
  const claudeDir = path.join(REPO_ROOT, ".claude", "commands", "opsx");
  const cursorDir = path.join(REPO_ROOT, ".cursor", "commands");
  const codexDir = path.join(resolveCodexHome(), "prompts");

  const targets: ToolTarget[] = [
    {
      tool: "claude",
      outputPath: (id) => path.join(claudeDir, `${id}.md`),
      render: renderClaude,
      cleanupDir: () => claudeDir,
      // .claude/commands/opsx/<id>.md — every file in this nested folder
      // is opsx-owned.
      cleanupRegex: /^(.+)\.md$/,
    },
    {
      tool: "cursor",
      outputPath: (id) => path.join(cursorDir, `opsx-${id}.md`),
      render: renderCursor,
      cleanupDir: () => cursorDir,
      cleanupRegex: /^opsx-(.+)\.md$/,
    },
  ];

  if (scope !== "ci") {
    targets.push({
      tool: "codex",
      outputPath: (id) => path.join(codexDir, `opsx-${id}.md`),
      render: renderCodex,
      cleanupDir: () => codexDir,
      cleanupRegex: /^opsx-(.+)\.md$/,
    });
  }

  return targets;
}

async function loadTemplates(): Promise<Template[]> {
  const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const templates: Template[] = [];
  const warnings: string[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith(".md")) continue;
    if (e.name === README_FILENAME) continue;
    const sourceFile = path.join(TEMPLATES_DIR, e.name);
    const raw = await fs.readFile(sourceFile, "utf8");
    const { fm, bodyStart } = parseFrontmatter(raw, sourceFile);
    const stem = e.name.replace(/\.md$/, "");
    if (fm.id !== stem) {
      throw new Error(
        `${sourceFile}: frontmatter id '${fm.id}' does not match filename stem '${stem}'`,
      );
    }
    // Strip leading blank lines from body so the banner sits flush with the title.
    const body = raw.slice(bodyStart).replace(/^\s*\n/, "");
    templates.push({ id: fm.id, sourceFile, frontmatter: fm, body });

    // Soft-warn on terse descriptions per spec.
    if (fm.description.length < 50 || !/use when/i.test(fm.description)) {
      warnings.push(
        `[warn] templates/opsx/${e.name}: description should be >=50 chars and include "Use when …" (auto-invocation routing depends on it).`,
      );
    }
  }
  templates.sort((a, b) => a.id.localeCompare(b.id));
  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(w);
  }
  return templates;
}

// ---------- file output ----------

function ensureTrailingNewline(s: string): string {
  return s.endsWith("\n") ? s : `${s}\n`;
}

function normalize(s: string): string {
  // Generator always writes LF + exactly one trailing newline. Comparison
  // matches the same normalization to avoid CRLF/whitespace surprises.
  return ensureTrailingNewline(s.replace(/\r\n/g, "\n").replace(/\n+$/, "\n"));
}

async function writeIfChanged(file: string, contents: string): Promise<boolean> {
  const normalized = normalize(contents);
  await fs.mkdir(path.dirname(file), { recursive: true });
  let existing: string | null = null;
  try {
    existing = await fs.readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  if (existing !== null && normalize(existing) === normalized) {
    return false;
  }
  await fs.writeFile(file, normalized, "utf8");
  return true;
}

async function compareForCheck(file: string, contents: string): Promise<string | null> {
  const normalized = normalize(contents);
  let existing: string | null = null;
  try {
    existing = await fs.readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    return `missing file: ${file}`;
  }
  const existingNorm = normalize(existing);
  if (existingNorm === normalized) return null;
  return diffSummary(file, existingNorm, normalized);
}

function diffSummary(file: string, expected: string, actual: string): string {
  // Tiny unified-ish diff for CI logs. Not a real diff algorithm.
  const a = expected.split("\n");
  const b = actual.split("\n");
  const lines: string[] = [`--- ${file} (on disk)`, `+++ ${file} (generator)`];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] === b[i]) continue;
    if (a[i] !== undefined) lines.push(`-${i + 1}: ${a[i]}`);
    if (b[i] !== undefined) lines.push(`+${i + 1}: ${b[i]}`);
  }
  return lines.join("\n");
}

// ---------- cleanup of stale generated files ----------

async function listDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

interface RunResult {
  written: string[];
  deleted: string[];
  unchanged: string[];
}

async function runSync(targets: ToolTarget[], templates: Template[], mode: "write" | "check"): Promise<{ result: RunResult; diffs: string[] }> {
  const templateIds = new Set(templates.map((t) => t.id));
  const result: RunResult = { written: [], deleted: [], unchanged: [] };
  const diffs: string[] = [];

  for (const target of targets) {
    // Write outputs.
    for (const tpl of templates) {
      const file = target.outputPath(tpl.id);
      const contents = target.render(tpl);
      if (mode === "check") {
        const d = await compareForCheck(file, contents);
        if (d) diffs.push(d);
      } else {
        const wrote = await writeIfChanged(file, contents);
        if (wrote) result.written.push(file);
        else result.unchanged.push(file);
      }
    }

    // Cleanup stale files (every file in the target dir whose captured id
    // is not in the template set).
    const dir = target.cleanupDir();
    const names = await listDirSafe(dir);
    for (const name of names) {
      const m = target.cleanupRegex.exec(name);
      if (!m) continue;
      const id = m[1];
      if (templateIds.has(id)) continue;
      const stale = path.join(dir, name);
      if (mode === "check") {
        diffs.push(`stale file (would be deleted): ${stale}`);
      } else {
        await fs.unlink(stale);
        result.deleted.push(stale);
      }
    }
  }

  return { result, diffs };
}

// ---------- CLI ----------

function parseArgs(argv: string[]): { check: boolean; scope: "all" | "ci" } {
  let check = false;
  let scope: "all" | "ci" = "all";
  for (const a of argv) {
    if (a === "--check") check = true;
    else if (a === "--scope=ci") scope = "ci";
    else if (a === "--scope=all") scope = "all";
    else if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else {
      // eslint-disable-next-line no-console
      console.error(`opsx-sync: unknown argument: ${a}`);
      printUsage();
      process.exit(2);
    }
  }
  return { check, scope };
}

function printUsage(): void {
  // eslint-disable-next-line no-console
  console.error(
    `Usage: bin/opsx-sync [--check] [--scope=ci|all]

Generates per-tool command files from templates/opsx/*.md.
  --check        Dry-run; exit 1 on drift.
  --scope=ci     Skip the Codex global path (used by CI).
  --scope=all    Include all three tools (default).`,
  );
}

async function main() {
  const { check, scope } = parseArgs(process.argv.slice(2));
  const targets = buildTargets(scope);
  const templates = await loadTemplates();
  const { result, diffs } = await runSync(targets, templates, check ? "check" : "write");

  if (check) {
    if (diffs.length > 0) {
      // eslint-disable-next-line no-console
      console.error(diffs.join("\n\n"));
      // eslint-disable-next-line no-console
      console.error(
        `\nopsx-sync: drift detected (${diffs.length} item${diffs.length === 1 ? "" : "s"}).\nRun bin/opsx-sync locally and commit the result.`,
      );
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(`opsx-sync: clean (${templates.length} templates, ${targets.length} tools, scope=${scope}).`);
    return;
  }

  const summary = [
    `opsx-sync: ${result.written.length} written, ${result.unchanged.length} unchanged, ${result.deleted.length} deleted (scope=${scope}).`,
  ];
  for (const f of result.written) summary.push(`  wrote   ${path.relative(REPO_ROOT, f) || f}`);
  for (const f of result.deleted) summary.push(`  deleted ${path.relative(REPO_ROOT, f) || f}`);
  // eslint-disable-next-line no-console
  console.log(summary.join("\n"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
