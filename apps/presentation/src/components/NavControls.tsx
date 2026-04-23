interface NavControlsProps {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}

export function NavControls({ onPrev, onNext, canPrev, canNext }: NavControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
        className="rounded-lg border-2 border-white/30 px-5 py-2 font-semibold text-white/70 transition-all hover:border-ut-blue hover:text-ut-blue disabled:opacity-25 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
        className="rounded-lg bg-ut-blue px-5 py-2 font-semibold text-white transition-all hover:bg-ut-navy hover:shadow-[0_0_20px_rgba(49,92,253,0.55)] disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Next →
      </button>
    </div>
  )
}
