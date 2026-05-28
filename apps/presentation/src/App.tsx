import { useHashRoute } from './hooks/useHashRoute'
import { DeckView } from './components/DeckView'
import { LandingPage } from './components/LandingPage'
import { slides as workflowSlides } from './decks/workflow/slides'
import { workflowTheme } from './decks/workflow/theme'
import { researchSlides } from './decks/research/slides'
import { researchTheme } from './decks/research/theme'
import { packageExtractionSlides } from './decks/package-extraction/slides'
import { packageExtractionTheme } from './decks/package-extraction/theme'
import { nestjsDemoSlides } from './decks/nestjs-demo/slides'
import { nestjsDemoTheme } from './decks/nestjs-demo/theme'

export default function App() {
  const route = useHashRoute()

  if (route.deck === 'landing') {
    return <LandingPage />
  }

  if (route.deck === 'workflow') {
    return <DeckView slides={workflowSlides} theme={workflowTheme} />
  }

  if (route.deck === 'package-extraction') {
    return <DeckView slides={packageExtractionSlides} theme={packageExtractionTheme} />
  }

  if (route.deck === 'nestjs-demo') {
    return <DeckView slides={nestjsDemoSlides} theme={nestjsDemoTheme} />
  }

  // research deck — filter slides by density.
  const filtered = researchSlides.filter((s) =>
    route.density === 'summary' ? s.density !== 'full' : s.density !== 'summary',
  )

  return (
    <DeckView
      slides={filtered}
      theme={researchTheme}
      variant={route.density === 'summary' ? 'summary' : 'default'}
    />
  )
}
