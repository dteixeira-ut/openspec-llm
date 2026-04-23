import { useEffect, useState } from 'react'
import { SlideCard } from './components/SlideCard'
import { NavControls } from './components/NavControls'
import { ProgressIndicator } from './components/ProgressIndicator'
import { NotesPanel } from './components/NotesPanel'
import { slides } from './slides'

export default function App() {
  const [current, setCurrent] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)

  const canPrev = current > 0
  const canNext = current < slides.length - 1

  function prev() {
    if (canPrev) setCurrent((c) => c - 1)
  }

  function next() {
    if (canNext) setCurrent((c) => c + 1)
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'l') next()
      if (e.key === 'ArrowLeft' || e.key === 'h') prev()
      if (e.key === 'n') setNotesOpen((o) => !o)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const slide = slides[current]
  const progressPct = ((current + 1) / slides.length) * 100

  return (
    <div className="stage-glow relative min-h-screen bg-ut-navy-dark flex flex-col font-sans">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-ut-navy via-ut-blue to-ut-teal transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-14 gap-6">
        <div className="w-full max-w-4xl" key={current}>
          <SlideCard slide={slide} slideIndex={current} />
        </div>

        {notesOpen && (
          <div className="w-full max-w-4xl animate-fade-up">
            <NotesPanel notes={slide.notes} />
          </div>
        )}

        <div className="flex items-center gap-6">
          <NavControls onPrev={prev} onNext={next} canPrev={canPrev} canNext={canNext} />
          <ProgressIndicator current={current + 1} total={slides.length} />
          <button
            onClick={() => setNotesOpen((o) => !o)}
            aria-label="Toggle speaker notes"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/50 hover:border-ut-blue hover:text-ut-blue transition-colors"
          >
            {notesOpen ? 'Hide Notes' : 'Notes'}
          </button>
        </div>

        {/* Logo watermark */}
        <img
          src="./usertesting-logo-white.svg"
          alt="UserTesting"
          className="opacity-25 w-28 mt-2"
        />
      </div>
    </div>
  )
}
