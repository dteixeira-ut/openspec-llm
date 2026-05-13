import type { Theme } from '../../types'

/**
 * Package-extraction deck theme. Visually distinct from both workflow (gradient
 * stripe) and research (hand-drawn stroke) via a solid `ut-teal` accent bar.
 * Card shape and stage treatment otherwise mirror the workflow deck so the
 * pitch-style decks read as a family.
 */
export const packageExtractionTheme: Theme = {
  name: 'package-extraction',
  stageClasses: 'stage-glow relative min-h-screen bg-ut-navy-dark flex flex-col font-sans',
  cardClasses: 'w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden',
  accentClasses: 'h-1.5 w-full bg-ut-teal',
  titleClasses: 'font-bold leading-tight text-ut-navy',
  bodyTextClasses: 'text-gray-600 text-lg leading-relaxed',
  bulletItemClasses: 'flex items-start gap-3 text-gray-700 text-lg',
  cardPaddingClasses: 'p-10 md:p-14 space-y-6',
  headingScaleClasses: 'text-3xl md:text-4xl',
  cardAnimationClass: 'animate-fade-up',
  watermarkClasses: 'opacity-25 w-28 mt-2',
}
