export type SubItem = {
  label?: string
  content: string
  link?: { label: string; href: string }
}

export type NumberedItem = {
  question: string
  subitems?: SubItem[]
}

export type Severity = 'low' | 'medium' | 'high'
export type CalloutTone = 'info' | 'warn' | 'evidence'

export type ContentItem =
  | { type: 'text'; content: string }
  | { type: 'subheading'; content: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'numbered-with-subitems'; items: NumberedItem[] }
  | { type: 'code'; content: string }
  | { type: 'link'; label: string; href: string }
  | { type: 'section'; title: string; links: { label: string; href: string }[] }
  | { type: 'footer'; content: string }
  | {
      type: 'finding'
      severity: Severity
      title: string
      body: string
      mitigation?: { changeName: string; href: string }
    }
  | { type: 'timeline'; items: { date: string; event: string }[] }
  | { type: 'diff'; before: string; after: string; language?: string }
  | { type: 'metric'; label: string; value: string; subtext?: string }
  | { type: 'callout'; tone: CalloutTone; content: string }

export interface Slide {
  id: string
  title: string
  body: ContentItem[]
  notes?: string
}

export type Density = 'full' | 'summary' | 'both'

export interface ResearchSlide extends Slide {
  density: Density
}

/**
 * Theme describing visual treatment for a deck. Each renderer reads brand-token / shape
 * decisions from a Theme rather than hardcoding Tailwind classes, so a deck can be
 * re-skinned via its `theme.ts` without editing the renderer.
 */
export type Theme = {
  name: 'workflow' | 'research'
  /** Outer stage wrapper. Combined with `stage-glow` or texture classes. */
  stageClasses: string
  /** Slide card container classes. */
  cardClasses: string
  /** Accent strip rendered above the card body. Returns a className string. */
  accentClasses: string
  /** Title typography. */
  titleClasses: string
  /** Body-paragraph (`text`) typography. */
  bodyTextClasses: string
  /** Bullet-list item classes. */
  bulletItemClasses: string
  /** Inner padding of the slide card. */
  cardPaddingClasses: string
  /** Card heading scale (h1 size). */
  headingScaleClasses: string
  /** Animation class applied to the slide card (fade-up variant). */
  cardAnimationClass: string
  /** Watermark logo width / opacity. */
  watermarkClasses: string
  /** Optional class applied to summary-route variant for slightly tighter padding. */
  summaryVariantClasses?: string
}
