/**
 * LandingPage — root entry point for the presentation app. Renders two cards
 * (Workflow, Research) plus a one-paragraph framing block. Uses the workflow
 * deck's stage treatment so the brand entry point feels continuous with the
 * existing experience (design.md Decision 6).
 */
export function LandingPage() {
  return (
    <div className="stage-glow relative min-h-screen bg-ut-navy-dark flex flex-col font-sans">
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-14 gap-10">
        <header className="w-full max-w-4xl text-center space-y-3 animate-fade-up">
          <p className="section-marker text-white/50">OpenSpec + Claude</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Two decks. One workflow.
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The pitch and the case study live side by side. The workflow deck explains how
            spec-driven development with Claude is meant to work. The research deck shows
            what happened when we ran it against a real two-service NestJS migration —
            what worked, what didn&apos;t, and what we shipped to close the gaps.
          </p>
        </header>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
          <a
            href="#/workflow"
            className="group rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-up hover:-translate-y-0.5 transition-transform"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-ut-navy via-ut-blue to-ut-teal" />
            <div className="p-8 space-y-3">
              <p className="section-marker">Deck 1</p>
              <h2 className="text-2xl font-bold text-ut-navy leading-tight">
                OpenSpec + Claude Workflow
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                The pitch: spec-driven development with Claude Code, the `/opsx:*` skills,
                and how proposals, designs, specs, and tasks become an AI-consumable
                handoff protocol.
              </p>
              <p className="text-ut-blue text-sm font-semibold mt-3 group-hover:underline">
                Open workflow deck →
              </p>
            </div>
          </a>

          <a
            href="#/research"
            className="group rounded-lg overflow-hidden shadow-lg border border-white/10 animate-fade-up hover:-translate-y-0.5 transition-transform"
            style={{ backgroundColor: '#fafaf8' }}
          >
            <div className="research-accent-stroke h-2 w-full" />
            <div className="p-8 space-y-3">
              <p className="section-marker">Deck 2</p>
              <h2 className="text-2xl font-semibold text-ut-navy leading-snug tracking-tight">
                Migration Case Study
              </h2>
              <p className="text-ut-navy/75 text-base leading-loose">
                The evidence: we used the workflow to drive a two-service NestJS migration
                in <code className="text-sm">enriched-video-uploads-v2</code>. ~17 stacked
                sub-PRs, ~18 rebase cycles, ~30 findings, two mitigation changes shipped
                back into this repo.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-ut-blue text-sm font-semibold group-hover:underline">
                  Open research deck →
                </span>
                <a
                  href="#/research/summary"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-ut-navy/60 underline underline-offset-2 hover:text-ut-blue"
                >
                  View summary
                </a>
              </div>
            </div>
          </a>
        </div>

        <p className="text-white/45 text-sm italic max-w-2xl text-center animate-fade-up">
          Built with the workflow it pitches. Read the case study to see the evidence.
        </p>

        <img
          src="./usertesting-logo-white.svg"
          alt="UserTesting"
          className="opacity-25 w-28 mt-2"
        />
      </div>
    </div>
  )
}
