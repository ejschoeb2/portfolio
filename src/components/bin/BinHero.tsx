import { useEffect, useState } from 'react'
import '../../styles/timeline.css'
import { BinViewer } from './BinViewer'
import type { BinEngine } from './engine'
import { SCENES } from './scenes'
import type { SceneState, ShowEntry, V3 } from './types'

// The finished design, full width at the top of the kitchen bin page. It can be
// run (a hand over the sensor, out, open, wait, close, back), taken apart, shown
// without the worktop, and its parts named under the pointer.

// Views are in the bin's frame, so the exploded one follows it out from under the worktop.
const VIEW: [V3, V3] = [[-2150, 360, 1380], [-400, -190, -220]]
const EXPLODED_VIEW: [V3, V3] = [[-3350, 1000, 2500], [-330, 60, -220]]
// Rolled well clear of the worktop, so the parts lifted off the top don't hit it.
const EXPLODED_ROLL = 600

const COUNTER = ['worktop', 'space']

// Taken apart, layer by layer from the floor up (mm, in the bin's frame: x to the back,
// y up, z across). The walls fan out, the electronics slide out of the front, and the
// top comes apart into rim, seal, mechanism, lid and sensor.
const WALLS = 110
const EXPLODE: Record<string, V3> = {
  // under the floor
  ebox: [-470, 0, 0],
  eboxLid: [-470, 70, 0],
  battery: [-640, 0, 0],
  batteryCover: [-700, 0, 0],
  cables: [170, 120, 0],
  // floor and frame
  basePanel: [0, 70, 0],
  innerBars: [0, 150, 0],
  angles: [0, 250, 0],
  wallFront: [-300, WALLS, 0],
  wallBack: [300, WALLS, 0],
  wallLeft: [0, WALLS, -300],
  wallRight: [0, WALLS, 300],
  // the top: lower rim, its hinge, upper rim and what is fixed to it, seal, lid, sensor
  s3: [0, 380, 0],
  tiltPins: [0, 450, 0],
  tiltCollars: [0, 450, 0],
  s2: [0, 530, 0],
  hall: [0, 530, 0],
  cuff: [-90, 530, 0],
  latchPin: [-90, 530, 0],
  latchRod: [-90, 530, 0],
  motor: [130, 560, 0],
  coupler: [130, 560, 0],
  motorBeam: [130, 560, 0],
  lever: [130, 560, 0],
  sealLipR: [0, 620, 0],
  hingeRod: [0, 690, 0],
  lidCollars: [0, 690, 0],
  springs: [0, 690, 0],
  lid: [0, 800, 0],
  latch: [0, 800, 0],
  magnets: [0, 800, 0],
  lidTop: [0, 900, 0],
  irPanel: [0, 960, 0],
  tof: [0, 930, 0],
}

/** What each part is, shown when the pointer is over it. */
const NAMES: Record<string, string> = {
  s2: 'Upper rim: tilts back for a bag change',
  s3: 'Lower rim',
  tiltPins: 'Tilt hinge pins',
  tiltCollars: 'Tilt hinge collars',
  lid: 'Printed lid frame',
  lidTop: '3 mm acrylic top',
  sealLipR: 'Silicone lip seal',
  hingeRod: 'Lid hinge rod',
  lidCollars: 'Hinge rod collars',
  springs: 'Torsion springs: open the lid',
  motor: 'Closing motor',
  coupler: 'Motor coupler',
  motorBeam: 'Motor mount',
  lever: 'Closing lever',
  latch: 'Latch track plate',
  cuff: 'Latch arm',
  latchPin: 'Steel latch pin',
  latchRod: 'Latch arm pivot',
  hall: 'Lid-shut Hall sensor',
  magnets: 'Magnets for the Hall sensor',
  tof: 'Laser hand sensor',
  irPanel: 'Infrared-clear sensor window',
  wallFront: 'Aluminium composite wall',
  wallBack: 'Aluminium composite wall',
  wallLeft: 'Aluminium composite wall',
  wallRight: 'Aluminium composite wall',
  angles: 'Aluminium corner angles',
  innerBars: 'Floor frame',
  basePanel: '8 mm acrylic floor',
  fit0403: 'Drive motor',
  axleHw: 'Belt and pulleys',
  wheels: 'Printed TPU drive wheels',
  axle: 'Solid rear axle',
  driveBracket: 'Drive motor bracket',
  kp08Spacers: 'Axle bearing spacers',
  castors: 'Swivel castors',
  castorPads: 'Castor mounts',
  ebox: 'Electronics box: Arduino and motor drivers',
  eboxLid: 'Electronics box lid',
  battery: 'Battery pack',
  batteryCover: 'Battery cover',
  cables: 'Wiring',
}

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

export function BinHero() {
  const [engine, setEngine] = useState<BinEngine | null>(null)
  const [counter, setCounter] = useState(true)
  const [exploded, setExploded] = useState(false)
  const [names, setNames] = useState(false)
  const [phase, setPhase] = useState<string | null>(null)
  const playing = phase !== null

  useEffect(() => engine?.setShow(showFor(counter, exploded)), [engine, counter, exploded])
  useEffect(() => engine?.setHoverNames(names ? NAMES : null), [engine, names])
  useEffect(() => {
    if (!engine) return
    engine.setPose({ roll: exploded && counter ? EXPLODED_ROLL : 0 })
    engine.view(exploded ? EXPLODED_VIEW : VIEW)
  }, [engine, exploded, counter])
  useEffect(() => () => engine?.stopDemo(), [engine])

  // Taking it apart puts the worktop away and names the parts; putting it back undoes both.
  const explode = (on: boolean) => {
    setExploded(on)
    setCounter(!on)
    setNames(on)
  }

  const play = () => {
    if (!engine) return
    explode(false)
    setPhase('')
    engine.playDemo(setPhase)
  }

  return (
    <BinViewer scene={finished} flash={none} onEngine={setEngine}>
      <p className="bin3d__hint" data-live={playing || undefined} aria-live="polite">
        {playing ? phase : names ? 'Point at a part to see what it is' : 'Drag to turn, scroll to zoom'}
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
        <Toggle on={exploded} set={explode} disabled={playing}>
          Explode
        </Toggle>
        <Toggle on={names} set={setNames}>
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
