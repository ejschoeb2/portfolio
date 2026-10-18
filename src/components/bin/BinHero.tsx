import { useEffect, useState } from 'react'
import '../../styles/timeline.css'
import { BinViewer } from './BinViewer'
import type { BinEngine } from './engine'
import { SCENES } from './scenes'
import type { Hotspot, SceneState, ShowEntry, V3 } from './types'

// The finished design, full width at the top of the kitchen bin page. It can be
// run (a hand over the sensor, out, open, wait, close, back), taken apart, shown
// without the worktop, or labelled.

// Views are in the bin's frame, so the exploded one follows it out from under the worktop.
const VIEW: [V3, V3] = [[-2150, 360, 1380], [-400, -190, -220]]
const EXPLODED_VIEW: [V3, V3] = [[-2550, 980, 1750], [-200, -10, -220]]
// Rolled well clear of the worktop, so the parts lifted off the top don't hit it.
const EXPLODED_ROLL = 600

const COUNTER = ['worktop', 'space']

// How far each part moves when the bin is taken apart (mm, in the bin's frame).
const UP_TOP: V3 = [0, 300, 0]
const UP_LID: V3 = [0, 520, 0]
const EXPLODE: Record<string, V3> = {
  ...Object.fromEntries(
    ['s2', 's3', 'sealLipR', 'tiltPins', 'tiltCollars', 'hingeRod', 'lidCollars', 'motor', 'lever', 'coupler', 'motorBeam', 'springs', 'latchRod', 'hall'].map(
      (k) => [k, UP_TOP],
    ),
  ),
  ...Object.fromEntries(['lid', 'latch', 'cuff', 'magnets'].map((k) => [k, UP_LID])),
  tof: [0, 600, 0],
  irPanel: [0, 680, 0],
  lidTop: [0, 680, 0],
  wallFront: [-170, 0, 0],
  wallBack: [170, 0, 0],
  wallLeft: [0, 0, 170],
  wallRight: [0, 0, -170],
  battery: [-220, 0, 0],
  batteryCover: [-220, 0, 0],
}

// The labels follow the part they point at.
const NOTE_PART: Record<string, string> = { latch: 'latch', seal: 'sealLipR', springs: 'springs', tilt: 's2', sensor: 'tof', walls: 'wallLeft', power: 'battery' }

const finished: SceneState = { ...SCENES.final, cam: VIEW, hotspots: undefined, labels: undefined }
const none: string[] = []

function showFor(counter: boolean, exploded: boolean) {
  const show: Record<string, ShowEntry> = {}
  for (const [key, entry] of Object.entries(SCENES.final.show)) {
    if (!counter && COUNTER.includes(key)) continue
    show[key] = exploded && EXPLODE[key] ? { look: entry as 'base', off: EXPLODE[key] } : entry
  }
  return show
}

function notesFor(exploded: boolean): Hotspot[] {
  return (SCENES.final.hotspots ?? []).map((h) => {
    const off = exploded ? EXPLODE[NOTE_PART[h.id]] : undefined
    return off ? { ...h, at: [h.at[0] + off[0], h.at[1] + off[1], h.at[2] + off[2]] as V3 } : h
  })
}

export function BinHero() {
  const [engine, setEngine] = useState<BinEngine | null>(null)
  const [counter, setCounter] = useState(true)
  const [exploded, setExploded] = useState(false)
  const [notes, setNotes] = useState(false)
  const [phase, setPhase] = useState<string | null>(null)
  const playing = phase !== null

  useEffect(() => engine?.setShow(showFor(counter, exploded)), [engine, counter, exploded])
  useEffect(() => engine?.setNotes(notes ? notesFor(exploded) : []), [engine, notes, exploded])
  useEffect(() => {
    if (!engine) return
    engine.setPose({ roll: exploded ? EXPLODED_ROLL : 0 })
    engine.view(exploded ? EXPLODED_VIEW : VIEW)
  }, [engine, exploded])
  useEffect(() => () => engine?.stopDemo(), [engine])

  const play = () => {
    if (!engine) return
    setExploded(false)
    setPhase('')
    engine.playDemo(setPhase)
  }

  return (
    <BinViewer scene={finished} flash={none} pageScroll onEngine={setEngine}>
      <p className="bin3d__hint" data-live={playing || undefined} aria-live="polite">
        {playing ? phase : 'Drag to turn'}
      </p>
      <div className="bin3d__controls">
        <button type="button" className="bin3d__play" onClick={play} disabled={!engine || playing}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
          </svg>
          {playing ? 'Running' : 'Run it'}
        </button>
        <Toggle on={!counter} set={(on) => setCounter(!on)}>
          Hide counter
        </Toggle>
        <Toggle on={exploded} set={setExploded} disabled={playing}>
          Explode
        </Toggle>
        <Toggle on={notes} set={setNotes}>
          Annotations
        </Toggle>
      </div>
    </BinViewer>
  )
}

function Toggle({ on, set, disabled, children }: { on: boolean; set: (on: boolean) => void; disabled?: boolean; children: string }) {
  return (
    <button type="button" className="bin3d__toggle" aria-pressed={on} disabled={disabled} onClick={() => set(!on)}>
      <span className="bin3d__switch" aria-hidden="true" />
      {children}
    </button>
  )
}
