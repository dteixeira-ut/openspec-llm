import type { ContentItem, Slide, SubItem, Theme } from '../types'
import { researchCardBackground } from '../decks/research/theme'

function renderWithLink(content: string, link: { label: string; href: string }) {
  const idx = content.indexOf(link.label)
  if (idx === -1) return content
  return (
    <>
      {content.slice(0, idx)}
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ut-blue underline underline-offset-2 hover:text-ut-navy transition-colors"
      >
        {link.label}
      </a>
      {content.slice(idx + link.label.length)}
    </>
  )
}

function severityClasses(severity: 'low' | 'medium' | 'high') {
  // Map severity to existing brand-palette tints (no new colors introduced).
  switch (severity) {
    case 'high':
      return 'border-l-4 border-ut-navy bg-ut-blue-light/60'
    case 'medium':
      return 'border-l-4 border-ut-blue bg-ut-blue-light/40'
    case 'low':
      return 'border-l-4 border-ut-teal bg-ut-blue-light/20'
  }
}

function severityLabel(severity: 'low' | 'medium' | 'high') {
  return severity.toUpperCase()
}

function calloutClasses(tone: 'info' | 'warn' | 'evidence') {
  switch (tone) {
    case 'evidence':
      return 'border-l-2 border-ut-teal bg-ut-blue-light/30 text-ut-navy/85'
    case 'warn':
      return 'border-l-2 border-ut-navy bg-ut-blue-light/40 text-ut-navy/90'
    case 'info':
      return 'border-l-2 border-ut-blue bg-ut-blue-light/20 text-ut-navy/80'
  }
}

function calloutLabel(tone: 'info' | 'warn' | 'evidence') {
  switch (tone) {
    case 'evidence':
      return 'Evidence'
    case 'warn':
      return 'Watch out'
    case 'info':
      return 'Note'
  }
}

function renderItem(item: ContentItem, index: number, theme: Theme) {
  switch (item.type) {
    case 'text':
      return (
        <p
          key={index}
          className={`${theme.bodyTextClasses} animate-fade-up`}
          style={{ animationDelay: `${100 + index * 60}ms` }}
        >
          {item.content}
        </p>
      )
    case 'subheading':
      return (
        <p
          key={index}
          className="text-ut-blue font-semibold text-xl animate-fade-up"
          style={{ animationDelay: `${100 + index * 60}ms` }}
        >
          {item.content}
        </p>
      )
    case 'bullets':
      return (
        <ul key={index} className="space-y-3">
          {item.items.map((bullet, i) => (
            <li
              key={i}
              className={`${theme.bulletItemClasses} animate-fade-up`}
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-ut-blue to-ut-teal" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )
    case 'numbered':
      return (
        <ol key={index} className="space-y-3">
          {item.items.map((q, i) => (
            <li
              key={i}
              className={`${theme.bulletItemClasses} animate-fade-up`}
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <span className="shrink-0 font-bold text-ut-blue min-w-[1.5rem]">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      )
    case 'numbered-with-subitems':
      return (
        <ol key={index} className="space-y-3">
          {item.items.map((entry, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 text-gray-700 text-lg animate-fade-up"
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 font-bold text-ut-blue min-w-[1.5rem]">{i + 1}.</span>
                <span>{entry.question}</span>
              </div>
              {entry.subitems && entry.subitems.length > 0 && (
                <ul className="ml-9 mt-1 space-y-1">
                  {entry.subitems.map((sub: SubItem, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-base text-gray-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ut-teal" />
                      <span>
                        {sub.label && (
                          <span className="font-semibold text-ut-navy">{sub.label}: </span>
                        )}
                        {sub.link
                          ? renderWithLink(sub.content, sub.link)
                          : sub.content}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )
    case 'code':
      return (
        <div
          key={index}
          className="rounded-xl overflow-hidden shadow-lg animate-fade-up"
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          <div className="flex items-center gap-1.5 bg-gray-800 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <pre className="bg-gray-950 px-5 py-4 font-mono text-sm text-ut-teal overflow-x-auto leading-relaxed">
            <code>{item.content}</code>
          </pre>
        </div>
      )
    case 'link':
      return (
        <a
          key={index}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-ut-blue font-medium hover:text-ut-navy transition-colors underline underline-offset-2 animate-fade-up"
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          {item.label}
        </a>
      )
    case 'section':
      return (
        <div
          key={index}
          className="space-y-2 animate-fade-up"
          style={{ animationDelay: `${120 + index * 80}ms` }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-ut-blue/60">
            {item.title}
          </p>
          <ul className="space-y-1">
            {item.links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ut-blue font-medium hover:text-ut-navy transition-colors underline underline-offset-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'footer':
      return (
        <p
          key={index}
          className="text-sm italic text-gray-400 border-t border-gray-100 pt-4 animate-fade-up"
          style={{ animationDelay: '400ms' }}
        >
          {item.content}
        </p>
      )
    case 'finding':
      return (
        <div
          key={index}
          className={`rounded-md p-4 animate-fade-up ${severityClasses(item.severity)}`}
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="section-marker">{severityLabel(item.severity)}</span>
            {item.mitigation && (
              <a
                href={item.mitigation.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ut-blue underline underline-offset-2 hover:text-ut-navy"
              >
                mitigated by {item.mitigation.changeName} →
              </a>
            )}
          </div>
          <p className="font-semibold text-ut-navy text-base md:text-lg leading-snug">
            {item.title}
          </p>
          <p className="text-ut-navy/75 text-sm md:text-base leading-relaxed mt-1">
            {item.body}
          </p>
        </div>
      )
    case 'timeline':
      return (
        <ol
          key={index}
          className="relative border-l-2 border-ut-blue/30 ml-2 space-y-3 animate-fade-up"
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          {item.items.map((entry, i) => (
            <li key={i} className="ml-4 relative">
              <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-ut-blue" />
              <p className="section-marker">{entry.date}</p>
              <p className="text-ut-navy/80 text-sm md:text-base leading-relaxed">{entry.event}</p>
            </li>
          ))}
        </ol>
      )
    case 'diff':
      return (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-up"
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          <div className="rounded-md border border-ut-navy/15 overflow-hidden">
            <div className="bg-ut-navy/5 px-3 py-1.5">
              <span className="section-marker">Before</span>
            </div>
            <pre className="px-4 py-3 font-mono text-xs md:text-sm text-ut-navy/85 bg-white whitespace-pre-wrap break-words">
              <code>{item.before}</code>
            </pre>
          </div>
          <div className="rounded-md border border-ut-teal/30 overflow-hidden">
            <div className="bg-ut-teal/10 px-3 py-1.5">
              <span className="section-marker">After</span>
            </div>
            <pre className="px-4 py-3 font-mono text-xs md:text-sm text-ut-navy bg-white whitespace-pre-wrap break-words">
              <code>{item.after}</code>
            </pre>
          </div>
        </div>
      )
    case 'metric':
      return (
        <div
          key={index}
          className="inline-flex flex-col items-start rounded-md border border-ut-blue/20 bg-ut-blue-light/30 px-5 py-3 animate-fade-up"
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          <span className="section-marker">{item.label}</span>
          <span className="font-bold text-3xl md:text-4xl text-ut-navy leading-none mt-1">
            {item.value}
          </span>
          {item.subtext && (
            <span className="text-ut-navy/65 text-xs md:text-sm mt-1.5">{item.subtext}</span>
          )}
        </div>
      )
    case 'callout':
      return (
        <div
          key={index}
          className={`rounded-md p-3 md:p-4 animate-fade-up ${calloutClasses(item.tone)}`}
          style={{ animationDelay: `${140 + index * 60}ms` }}
        >
          <span className="section-marker">{calloutLabel(item.tone)}</span>
          <p className="text-sm md:text-base leading-relaxed mt-1">{item.content}</p>
        </div>
      )
  }
}

interface SlideCardProps {
  slide: Slide
  slideIndex: number
  theme: Theme
  variant?: 'default' | 'summary'
}

const isSkillSlide = (title: string) => title.startsWith('/opsx:')

export function SlideCard({ slide, slideIndex, theme, variant = 'default' }: SlideCardProps) {
  const skill = isSkillSlide(slide.title)

  const padding =
    variant === 'summary' && theme.summaryVariantClasses
      ? theme.summaryVariantClasses
      : theme.cardPaddingClasses

  const headingScale =
    variant === 'summary' ? 'text-2xl md:text-3xl' : theme.headingScaleClasses

  const cardStyle =
    theme.name === 'research' ? { backgroundColor: researchCardBackground } : undefined

  return (
    <section
      role="region"
      aria-label={slide.title}
      key={slideIndex}
      className={`${theme.cardClasses} ${theme.cardAnimationClass}`}
      style={cardStyle}
    >
      {/* Accent strip — gradient bar (workflow) or hand-drawn stroke (research). */}
      <div className={theme.accentClasses} />

      <div className={padding}>
        {skill && (
          <span className="inline-block rounded-md bg-ut-blue-light px-3 py-1 font-mono text-xs font-semibold text-ut-navy tracking-wide animate-fade-up">
            Claude Code skill
          </span>
        )}

        <h1
          className={`${theme.titleClasses} ${
            skill ? 'font-mono text-3xl md:text-4xl' : headingScale
          } animate-fade-up`}
          style={{ animationDelay: '40ms' }}
        >
          {slide.title}
        </h1>

        <div className="space-y-5">
          {slide.body.map((item, i) => renderItem(item, i, theme))}
        </div>
      </div>
    </section>
  )
}
