import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { BinEngine } from './engine'
import type { SceneState } from './types'

type Props = {
  scene: SceneState
  flash: string[]
  /** Let the wheel scroll the page instead of zooming (for the model at the top of the page). */
  pageScroll?: boolean
  /** Hears the engine once it's made (and null when it goes), for extra controls. */
  onEngine?: (engine: BinEngine | null) => void
  /** More controls over the model. */
  children?: ReactNode
}

/** The 3D bin. three.js loads only when this mounts, so the rest of the site stays light. */
export function BinViewer({ scene, flash, pageScroll, onEngine, children }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const engine = useRef<BinEngine | null>(null)
  const latest = useRef(scene)
  latest.current = scene
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    let alive = true
    let made: BinEngine | null = null
    import('./engine')
      .then(({ BinEngine }) => {
        if (!alive || !host.current || !overlay.current) return
        try {
          made = new BinEngine(host.current, overlay.current, {
            onReady: () => alive && setStatus('ready'),
            onError: () => alive && setStatus('failed'),
          })
        } catch {
          setStatus('failed')
          return
        }
        engine.current = made
        if (pageScroll) made.letPageScroll()
        made.setState(latest.current)
        onEngine?.(made)
      })
      .catch(() => alive && setStatus('failed'))
    return () => {
      alive = false
      made?.dispose()
      engine.current = null
      onEngine?.(null)
    }
  }, [])

  useEffect(() => {
    engine.current?.setState(scene)
  }, [scene])

  useEffect(() => {
    engine.current?.flash(flash)
  }, [flash])

  return (
    // With zoom on, the wheel belongs to the model, not the page's smooth scroll.
    <div className="bin3d" data-status={status} data-lenis-prevent={pageScroll ? undefined : true}>
      <div className="bin3d__canvas" ref={host} />
      <div className="bin3d__overlay" ref={overlay} aria-hidden="true" />
      {status !== 'ready' && (
        <div className="bin3d__wait">
          {status === 'failed' ? 'The 3D model needs WebGL, which this browser has turned off.' : 'Loading the 3D model…'}
        </div>
      )}
      <button type="button" className="bin3d__reset" onClick={() => engine.current?.resetView()} aria-label="Reset view" title="Reset view">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </button>
      {children}
    </div>
  )
}
