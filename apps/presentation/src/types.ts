export type SubItem = {
  label?: string
  content: string
  link?: { label: string; href: string }
}

export type NumberedItem = {
  question: string
  subitems?: SubItem[]
}

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

export interface Slide {
  id: string
  title: string
  body: ContentItem[]
  notes?: string
}
