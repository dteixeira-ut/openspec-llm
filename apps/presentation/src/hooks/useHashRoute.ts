import { useEffect, useState } from 'react'

export type Deck = 'workflow' | 'research' | 'landing' | 'package-extraction'
export type Density = 'full' | 'summary'

export type Route = {
  deck: Deck
  density: Density
}

/**
 * Parse `window.location.hash` into a `{ deck, density }` route.
 *
 * Recognised routes:
 *  - `` (empty) or `#/` or unrecognised        -> { deck: 'landing', density: 'full' }
 *  - `#/workflow`                              -> { deck: 'workflow', density: 'full' }
 *  - `#/research`                              -> { deck: 'research', density: 'full' }
 *  - `#/research/summary`                      -> { deck: 'research', density: 'summary' }
 *  - `#/package-extraction`                    -> { deck: 'package-extraction', density: 'full' }
 *
 * Density is irrelevant for non-research decks but is set to `'full'` for type completeness.
 */
function parseHash(hash: string): Route {
  // Normalise: strip leading `#`, leading `/`, trailing `/`.
  const stripped = hash.replace(/^#/, '').replace(/^\//, '').replace(/\/$/, '')
  if (stripped === '') return { deck: 'landing', density: 'full' }

  const segments = stripped.split('/')
  const [first, second] = segments

  if (first === 'workflow') return { deck: 'workflow', density: 'full' }
  if (first === 'research') {
    if (second === 'summary') return { deck: 'research', density: 'summary' }
    return { deck: 'research', density: 'full' }
  }
  if (first === 'package-extraction') return { deck: 'package-extraction', density: 'full' }

  return { deck: 'landing', density: 'full' }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  )

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
