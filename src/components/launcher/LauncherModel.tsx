import { useEffect, useRef, useState } from 'react'
import '../../styles/launcher.css'
import type { LauncherEngine } from './engine'

/** The launcher in 3D, with a run of all four balls, taken apart, or labelled.
 *  three.js loads only when this mounts. */
export function LauncherModel() {
  const host = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const [engine, setEngine] = useState<LauncherEngine | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [exploded, setExploded] = useState(false)
  const [labels, setLabels] = useState(false)
  const [phase, setPhase] = useState<string | null>(null)
  const playing = phase !== null

  useEffect(() => {
    let alive = true
    let made: LauncherEngine | null = null
    import('./engine')
      .then(({ LauncherEngine }) => {
        if (!alive || !host.current || !overlay.current) return
        try {
          made = new LauncherEngine(host.current, overlay.current, {
            onReady: () => alive && setStatus('ready'),
            onError: () => alive && setStatus('failed'),
          })
        } catch {
          setStatus('failed')
          return
        }
        made.letPageScroll()
        setEngine(made)
      })
      .catch(() => alive && setStatus('failed'))
    return () => {
      alive = false
      made?.dispose()
    }
  }, [])

  useEffect(() => engine?.setExploded(exploded), [engine, exploded])
  useEffect(() => engine?.setLabels(labels), [engine, labels])

  const run = () => {
    if (!engine) return
    if (playing) return engine.stopDemo()
    setExploded(false)
    setPhase('')
    engine.playDemo(setPhase)
  }

  return (
    <div className="l3d" data-status={status}>
      <div className="l3d__canvas" ref={host} />
      <div className="l3d__overlay" ref={overlay} aria-hidden="true" />
      {status !== 'ready' && (
        <div className="l3d__wait">
          {status === 'failed' ? 'The 3D model needs WebGL, which this browser has turned off.' : 'Loading the 3D model…'}
        </div>
      )}
      <p className="l3d__hint" data-live={playing || undefined} aria-live="polite">
        {playing ? phase : 'Drag to turn'}
      </p>
      <div className="l3d__controls">
        <button type="button" className="l3d__play" onClick={run} disabled={status !== 'ready'}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            {playing ? <rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor" /> : <path d="M4 2.5v11l9-5.5z" fill="currentColor" />}
          </svg>
          {playing ? 'Stop' : 'Run it'}
        </button>
        <Toggle on={exploded} set={setExploded} disabled={playing}>
          Explode
        </Toggle>
        <Toggle on={labels} set={setLabels}>
          Labels
        </Toggle>
      </div>
      <button type="button" className="l3d__reset" onClick={() => engine?.resetView()} aria-label="Reset view" title="Reset view">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </button>
    </div>
  )
}

function Toggle({ on, set, disabled, children }: { on: boolean; set: (on: boolean) => void; disabled?: boolean; children: string }) {
  return (
    <button type="button" className="l3d__toggle" aria-pressed={on} disabled={disabled} onClick={() => set(!on)}>
      <span className="l3d__switch" aria-hidden="true" />
      {children}
    </button>
  )
}
