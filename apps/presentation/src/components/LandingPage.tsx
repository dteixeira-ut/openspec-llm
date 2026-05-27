import { useEffect, useRef, useState } from 'react'

/**
 * LandingPage — root entry point for the presentation app. Renders four cards
 * (Workflow, Research, Package Extraction, Migrate to NestJS) plus a one-paragraph
 * framing block.
 *
 * Clicking a deck card triggers a "hero zoom": the card scales up toward the
 * centre of the viewport and fades out while the backdrop deepens to navy,
 * then the route swaps to the deck and `DeckView` mounts. Falls back to a
 * straight navigation when `prefers-reduced-motion` is set.
 */
export function LandingPage() {
  const [zooming, setZooming] = useState(false)
  const cloneRef = useRef<HTMLElement | null>(null)
  const animRef = useRef<Animation | null>(null)

  // Cancel an in-flight zoom and remove the cloned overlay if LandingPage
  // unmounts before the animation finishes (e.g., back-button mid-transition).
  // Without this, `onfinish` would override the user's navigation and the
  // detached clone would leak on document.body.
  useEffect(
    () => () => {
      animRef.current?.cancel()
      cloneRef.current?.remove()
    },
    [],
  )

  function handleDeckClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const anchor = e.currentTarget
    const href = anchor.getAttribute('href') ?? '#/'

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // let the native hash navigation happen

    e.preventDefault()
    const rect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const cardCx = rect.left + rect.width / 2
    const cardCy = rect.top + rect.height / 2
    const dx = vw / 2 - cardCx
    const dy = vh / 2 - cardCy

    // Scale so the card grows ~1.6× — feels like "zooming in" without
    // becoming so large its content reflows visibly during the animation.
    const scale = 1.6

    // Snapshot the clicked card into a fixed-position clone we can animate
    // independently of the React tree. Sibling cards fade in place.
    const clone = anchor.cloneNode(true) as HTMLElement
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      zIndex: '60',
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
      pointerEvents: 'none',
    })
    document.body.appendChild(clone)
    cloneRef.current = clone
    setZooming(true)

    const anim = clone.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: 520, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' },
    )
    animRef.current = anim

    anim.onfinish = () => {
      clone.remove()
      cloneRef.current = null
      animRef.current = null
      window.location.hash = href.replace(/^#/, '')
    }
  }

  return (
    <div
      className={`stage-glow relative min-h-screen bg-ut-navy-dark flex flex-col font-sans transition-opacity duration-500 ${
        zooming ? 'landing-zooming' : ''
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-14 gap-10">
        <header className="w-full max-w-6xl text-center space-y-3 animate-fade-up">
          <p className="section-marker text-white/50">OpenSpec + Claude</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Four decks. One workflow.
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The pitch, the case study, and what&apos;s next. The workflow deck explains how
            spec-driven development with Claude is meant to work. The research deck shows
            what happened when we ran it against a real two-service NestJS migration. The
            package-extraction deck pitches the next phase: shipping the workflow as a
            versioned npm package consuming repos can pin. The migrate-to-nestjs deck is
            the procedural skill extracted from the case study — the reusable artifact.
          </p>
        </header>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <a
            href="#/workflow"
            onClick={handleDeckClick}
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
            onClick={handleDeckClick}
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

          <a
            href="#/package-extraction"
            onClick={handleDeckClick}
            className="group rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-up hover:-translate-y-0.5 transition-transform"
          >
            <div className="h-1.5 w-full bg-ut-teal" />
            <div className="p-8 space-y-3">
              <p className="section-marker">Deck 3</p>
              <h2 className="text-2xl font-bold text-ut-navy leading-tight">
                Package Extraction
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                The next phase: extract <code className="text-sm">templates/opsx/</code> and{' '}
                <code className="text-sm">bin/opsx-sync</code> into a versioned npm package
                (<code className="text-sm">@usertestingenterprise/insight-out-opsx</code>) so every UT
                repo can pin a version and stay in sync.
              </p>
              <p className="text-ut-blue text-sm font-semibold mt-3 group-hover:underline">
                Open package-extraction deck →
              </p>
            </div>
          </a>

          <a
            href="#/nestjs-demo"
            onClick={handleDeckClick}
            className="group rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-up hover:-translate-y-0.5 transition-transform"
          >
            <div className="h-1.5 w-full bg-ut-navy" />
            <div className="p-8 space-y-3">
              <p className="section-marker">Deck 4</p>
              <h2 className="text-2xl font-bold text-ut-navy leading-tight">
                Migrate to NestJS
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                The skill: a ~7-slide walkthrough of <code className="text-sm">migrate-to-nestjs</code>,
                the procedure extracted from the two-service migration. Provenance, the two
                open integration PRs, the build gate that surprised everyone, and what&apos;s
                portable now.
              </p>
              <p className="text-ut-blue text-sm font-semibold mt-3 group-hover:underline">
                Open migrate-to-nestjs deck →
              </p>
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
