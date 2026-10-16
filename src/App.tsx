import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { projectBySlug, type Project } from './content/projects'
import { tween } from './lib/motion'
import { parseRoute, projectPath, type Route } from './lib/router'
import { glideTo, jumpTo, reducedMotion } from './lib/scroll'
import { Home } from './pages/Home'
import { ProjectPage } from './pages/Project'
import { TransitionContext, type Transitions } from './transition'

const HOVER_MS = 1150 // time for the Learn more button to fill while hovered

// Resting the pointer on a card's Learn more fills the button (`--p` on the
// card, 0 → 1); once it is full the project opens. Pages swap straight over.
type Hold = { card: HTMLElement; project: Project; p: number; cancel?: () => void }

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.pathname))
  const [returnSlug, setReturnSlug] = useState<string | null>(null)
  const [holding, setHolding] = useState(false)

  const routeRef = useRef(route)
  routeRef.current = route
  const hold = useRef<Hold | null>(null)

  const controls = useMemo(() => {
    const setFill = (h: Hold, p: number) => {
      h.p = p
      h.card.style.setProperty('--p', String(p))
    }

    const release = () => {
      const h = hold.current
      if (!h) return
      h.cancel?.()
      h.card.style.removeProperty('--p')
      hold.current = null
      setHolding(false)
    }

    const showProject = (project: Project) => {
      release()
      const path = projectPath(project.slug)
      if (location.pathname !== path) history.pushState(null, '', path)
      flushSync(() => {
        setRoute({ name: 'project', slug: project.slug })
        setReturnSlug(null)
      })
      jumpTo(0)
    }

    const showHome = (slug: string | null) => {
      flushSync(() => {
        setRoute({ name: 'home' })
        setReturnSlug(slug)
      })
    }

    const api: Omit<Transitions, 'flying'> = {
      hoverStart(project, card) {
        if (reducedMotion) return
        let h = hold.current
        if (h && h.card !== card) release()
        h = hold.current ?? { card, project, p: 0 }
        hold.current = h
        setHolding(true)
        h.cancel?.()
        h.cancel = tween(h.p, 1, HOVER_MS * (1 - h.p), (p) => setFill(h, p), () =>
          showProject(project),
        )
      },
      hoverEnd() {
        const h = hold.current
        if (!h) return
        h.cancel?.()
        h.cancel = tween(h.p, 0, 380 * h.p + 60, (p) => setFill(h, p), release)
      },
      open(project) {
        showProject(project)
      },
      goHome() {
        const current = routeRef.current
        if (current.name === 'home') return glideTo(0)
        history.pushState(null, '', '/')
        showHome(current.slug)
      },
    }

    const onPopState = () => {
      const next = parseRoute(location.pathname)
      const current = routeRef.current
      release()
      if (next.name === 'home') {
        if (current.name === 'project') showHome(current.slug)
        return
      }
      if (current.name === 'project' && current.slug === next.slug) return
      flushSync(() => {
        setRoute(next)
        setReturnSlug(null)
      })
      jumpTo(0)
    }

    return { api, onPopState }
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', controls.onPopState)
    return () => window.removeEventListener('popstate', controls.onPopState)
  }, [controls])

  const project = route.name === 'project' ? projectBySlug(route.slug) : undefined

  useEffect(() => {
    document.title = project ? `${project.title} · Ethan Schoeb` : 'Ethan Schoeb · Portfolio'
  }, [project])

  const transitions = useMemo<Transitions>(
    () => ({ ...controls.api, flying: holding }),
    [controls, holding],
  )

  return (
    <TransitionContext value={transitions}>
      {project ? (
        <ProjectPage key={project.slug} project={project} />
      ) : (
        <Home returnSlug={returnSlug} />
      )}
    </TransitionContext>
  )
}
