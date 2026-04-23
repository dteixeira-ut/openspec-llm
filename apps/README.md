# Apps

This directory contains the front-end applications built as part of the OpenSpec + Claude workflow experiment.

## `presentation/`

A static React presentation app that serves as a shareable walkthrough of the OpenSpec + Claude development workflow. Intended for live demos and async sharing with teams evaluating whether to adopt spec-driven development with AI.

### What it covers

1. The problem with AI-assisted development today — why context-free LLM usage falls short
2. What spec-driven development is and how it differs from TDD or doc-first approaches
3. How OpenSpec works — the CLI and four Claude Code skills that drive the workflow
4. A slide-by-slide walkthrough of each skill: `/opsx:propose`, `/opsx:explore`, `/opsx:apply`, `/opsx:archive`
5. An honest assessment of what works well and what we're not sure about
6. Open questions the team needs to resolve before committing to the workflow
7. Resources for further reading

### Running locally

```bash
cd presentation
nvm use 22        # requires Node 22+
npm install
npm run dev       # http://localhost:5173
```

### Building for deployment

```bash
npm run build     # outputs to dist/
```

The build output is fully static — deploy the `dist/` folder to Vercel, GitHub Pages, S3, or any static host.

### Navigation

| Action | Input |
|---|---|
| Next slide | `→` or `l` or Next button |
| Previous slide | `←` or `h` or Prev button |
| Toggle speaker notes | `n` or Notes button |

### Tech stack

- React + Vite (TypeScript)
- Tailwind CSS v3 with UserTesting.com color palette
- No backend, no router, no external dependencies beyond React
