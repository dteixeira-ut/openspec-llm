import type { ContentItem, Slide, SubItem } from '../types'

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

function renderItem(item: ContentItem, index: number) {
  switch (item.type) {
    case 'text':
      return (
        <p
          key={index}
          className="text-gray-600 text-lg leading-relaxed animate-fade-up"
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
              className="flex items-start gap-3 text-gray-700 text-lg animate-fade-up"
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
              className="flex items-start gap-3 text-gray-700 text-lg animate-fade-up"
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
  }
}

interface SlideCardProps {
  slide: Slide
  slideIndex: number
}

const isSkillSlide = (title: string) => title.startsWith('/opsx:')

export function SlideCard({ slide, slideIndex }: SlideCardProps) {
  const skill = isSkillSlide(slide.title)

  return (
    <section
      role="region"
      aria-label={slide.title}
      key={slideIndex}
      className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-fade-up"
    >
      {/* Accent gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-ut-navy via-ut-blue to-ut-teal" />

      <div className="p-10 md:p-14 space-y-6">
        {skill && (
          <span className="inline-block rounded-md bg-ut-blue-light px-3 py-1 font-mono text-xs font-semibold text-ut-navy tracking-wide animate-fade-up">
            Claude Code skill
          </span>
        )}

        <h1
          className={`font-bold leading-tight animate-fade-up ${
            skill
              ? 'font-mono text-3xl md:text-4xl text-ut-navy'
              : 'text-3xl md:text-4xl text-ut-navy'
          }`}
          style={{ animationDelay: '40ms' }}
        >
          {slide.title}
        </h1>

        <div className="space-y-5">{slide.body.map((item, i) => renderItem(item, i))}</div>
      </div>
    </section>
  )
}
