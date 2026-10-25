import { useEffect, useMemo, useRef, useState } from 'react'
import { reducedMotion } from '../../lib/scroll'
import { LATCH_PHASES, latchAt, latchClock } from './latchPath'
import { TRACK } from './latchTrack'

/** Runs `fn` every frame while the element is on screen. */
function useFrames(ref: React.RefObject<Element | null>, fn: () => void) {
  useEffect(() => {
    if (reducedMotion) {
      fn()
      return
    }
    let raf = 0
    let on = false
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    if (ref.current) io.observe(ref.current)
    const loop = () => {
      if (on && !document.hidden) fn()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
    // fn is stable for the life of the widget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// ---------------------------------------------------------------- latch track

// x = −z: drawn as seen from the front of the bin, like the 3D view
const trackPath = [TRACK[0], TRACK[TRACK.length - 1]].map((loop) => 'M' + loop.map(([z, y]) => `${-z} ${-y}`).join('L') + 'Z').join('')

// Where each stage happens on the track (drawn as seen from the front), for the numbers
const LATCH_MARKS: [number, number][] = [[1.6, 13], [6.6, 21.6], [8.7, 13.1], [12.6, 22], [14.3, 11]]

export function LatchTrack() {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<SVGCircleElement>(null)
  const trail = useRef<SVGPolylineElement>(null)
  const [phase, setPhase] = useState(2)
  const pts = useRef<string[]>([])

  useFrames(root, () => {
    const p = reducedMotion ? { z: -8.689, y: 15.825, phase: 2 } : latchAt(latchClock())
    pin.current?.setAttribute('cx', String(-p.z))
    pin.current?.setAttribute('cy', String(-p.y))
    pts.current.push(`${-p.z},${-p.y}`)
    if (pts.current.length > 70) pts.current.shift()
    trail.current?.setAttribute('points', pts.current.join(' '))
    setPhase((old) => (old === p.phase ? old : p.phase))
  })

  return (
    <figure className="latch" ref={root}>
      <svg viewBox="0.5 -24 15 34" role="img" aria-label="The latch track with the pin moving through one open-and-close cycle">
        <path className="latch__plate" d={trackPath} fillRule="evenodd" />
        <polyline className="latch__trail" ref={trail} points="" />
        <circle className="latch__pin" ref={pin} r={1} cx={8.7} cy={-15.8} />
        {LATCH_MARKS.map(([x, y], i) => (
          <g key={i} className="latch__mark" data-on={i === phase || undefined}>
            <circle cx={x} cy={-y} r={1.05} />
            <text x={x} y={-y + 0.5} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <ol className="latch__steps">
        {LATCH_PHASES.map((p, i) => (
          <li key={p.short} aria-current={i === phase || undefined}>
            <span>{i + 1}</span>
            {p.short}
          </li>
        ))}
      </ol>
    </figure>
  )
}

// ---------------------------------------------------------------- spring torque chart

const TOPS = [
  { t: 3, m: 1.15, cls: 'is-3' },
  { t: 4, m: 1.39, cls: 'is-4' },
  { t: 5, m: 1.58, cls: 'is-5' },
]
const R = Math.hypot(0.207, 0.035)
const PHI = Math.atan2(0.035, 0.207)
const net = (m: number, th: number, wind: number) =>
  (2 * 16.6 * (wind - th) * 0.96) / 1000 - m * 9.81 * R * Math.cos((th * Math.PI) / 180 + PHI)

export function SpringChart() {
  const [wind, setWind] = useState(100)
  const W = 300
  const H = 170
  const x = (th: number) => 34 + (th / 80) * (W - 44)
  const y = (v: number) => 12 + ((1.2 - v) / 1.7) * (H - 32)
  const curves = useMemo(
    () =>
      TOPS.map((top) => {
        let min = Infinity
        const d = Array.from({ length: 81 }, (_, th) => {
          const v = net(top.m, th, wind)
          min = Math.min(min, v)
          return `${th ? 'L' : 'M'}${x(th).toFixed(1)} ${y(v).toFixed(1)}`
        }).join('')
        return { ...top, d, min }
      }),
    // x and y only depend on constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wind],
  )
  return (
    <figure className="springs">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net opening torque against lid angle for 3, 4 and 5 mm tops">
        {[-0.4, 0, 0.4, 0.8, 1.2].map((v) => (
          <g key={v}>
            <line className="springs__grid" x1={34} x2={W - 10} y1={y(v)} y2={y(v)} />
            <text className="springs__tick" x={28} y={y(v) + 3} textAnchor="end">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80].map((th) => (
          <text key={th} className="springs__tick" x={x(th)} y={H - 6} textAnchor="middle">
            {th}°
          </text>
        ))}
        <line className="springs__min" x1={34} x2={W - 10} y1={y(0.25)} y2={y(0.25)} />
        <text className="springs__note" x={38} y={y(0.25) + 11} textAnchor="start">
          ≈ 0.25 N·m to open briskly
        </text>
        {curves.map((c) => (
          <path key={c.t} className={`springs__curve ${c.cls}`} d={c.d} />
        ))}
      </svg>
      <div className="springs__controls">
        <label>
          Spring wind when shut: <strong>{wind}°</strong>
          <input type="range" min={90} max={120} step={1} value={wind} onChange={(e) => setWind(Number(e.target.value))} />
        </label>
        <ul className="springs__key">
          {curves.map((c) => (
            <li key={c.t} className={c.cls}>
              {c.t} mm top: weakest {c.min >= 0 ? '+' : '−'}
              {Math.abs(c.min).toFixed(2)} N·m {c.min < 0.25 ? (c.min < 0 ? '· won’t open' : '· stalls') : '· opens'}
            </li>
          ))}
        </ul>
      </div>
      <figcaption>Net opening torque (N·m) against lid angle. Drag the wind to see why a heavier top needs a tighter spring.</figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------- brainstorm sketch

const SKETCH = [
  { n: 1, key: 'pedal', x: 31.5, y: 36.4, text: 'A pedal on a metal plate' },
  { n: 2, key: 'lid', x: 50.5, y: 53.6, text: 'Offset rods so the lid opens a full 90°' },
  { n: 3, key: 'plan', x: 56, y: 15.3, text: 'A rounded plan for more capacity' },
  { n: 4, key: 'rota', x: 67.5, y: 32.6, text: 'A window showing whose day it is' },
  { n: 5, key: 'sensor', x: 86, y: 31.6, text: 'A proximity sensor that beeps if the lid is left ajar' },
  { n: 6, key: 'squash', x: 32.5, y: 58.4, text: 'An outside handle to squash the rubbish down' },
  { n: 7, key: 'weight', x: 38, y: 72.8, text: 'Extra weight in the base so it can’t tip' },
  { n: 8, key: 'tracks', x: 74, y: 67, text: 'Tracks underneath, so a step rolls the bin out' },
]

export function Brainstorm({ onFlash }: { onFlash: (key: string | null) => void }) {
  const [on, setOn] = useState<string | null>(null)
  const pick = (k: string | null) => {
    setOn(k)
    onFlash(k)
  }
  return (
    <figure className="sketch">
      <div className="sketch__frame">
        <img src="/images/bin-brainstorm.webp" alt="My brainstorm page of bin sketches from GoodNotes" loading="lazy" />
        {SKETCH.map((s) => (
          <button
            key={s.n}
            type="button"
            className="sketch__mark"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-pressed={on === s.key}
            aria-label={s.text}
            title={s.text}
            onMouseEnter={() => pick(s.key)}
            onMouseLeave={() => pick(null)}
            onFocus={() => pick(s.key)}
            onBlur={() => pick(null)}
            onClick={() => pick(on === s.key ? null : s.key)}
          >
            {s.n}
          </button>
        ))}
      </div>
    </figure>
  )
}

// ---------------------------------------------------------------- seal cross-section

export function SealSection() {
  // x outwards (lid's outer face at 0), y up (rim top at 0); mm, drawn ×9
  const s = 9
  const P = (x: number, y: number) => `${(x + 30) * s} ${(14 - y) * s}`
  const dir = [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)]
  const root = [-12.4, 0]
  const slotEnd = [root[0] - 4 * dir[0], root[1] - 4 * dir[1]]
  const tip = [-4.2, 6]
  const ctrl = [root[0] + 5.6 * dir[0], root[1] + 5.6 * dir[1]]
  return (
    <figure className="seal">
      <svg viewBox={`0 0 ${36 * s} ${24 * s}`} role="img" aria-label="Cross-section of the silicone lip in its angled slot, under the lid edge">
        {/* printed rim strip */}
        <path className="seal__rim" d={`M${P(-30, 0)}L${P(4, 0)}L${P(4, -8)}L${P(-30, -8)}Z`} />
        {/* the slot */}
        <path
          className="seal__slot"
          d={`M${P(root[0] - 0.45, 0.01)}L${P(slotEnd[0] - 0.45, slotEnd[1])}L${P(slotEnd[0] + 0.35, slotEnd[1])}L${P(root[0] + 0.35, 0.01)}Z`}
        />
        {/* lid wall and its bottom edge */}
        <path className="seal__lid" d={`M${P(-8, 6)}L${P(0, 6)}L${P(0, 14)}L${P(-8, 14)}Z`} />
        {/* silicone strip: in the slot, then bent against the lid */}
        <path
          className="seal__lip"
          d={`M${P(slotEnd[0], slotEnd[1])}L${P(root[0], root[1])}Q${P(ctrl[0], ctrl[1])} ${P(tip[0], tip[1])}`}
        />
        <line className="seal__dim" x1={(2 + 30) * s} x2={(2 + 30) * s} y1={(14 - 0) * s} y2={(14 - 6) * s} />
        <text className="seal__text" x={(2.6 + 30) * s} y={(14 - 3) * s}>
          6 mm
        </text>
        
        
        <text className="seal__text is-blue" x={(-29 + 30) * s} y={(14 - 1.6) * s}>
          1 × 15 mm silicone
        </text>
        
      </svg>
      <figcaption>The silicone strip is pinched in an angled slot, and bends against the lid’s edge as it closes.</figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------- dovetail

export function Dovetail() {
  const s = 14
  // mm on the plan → SVG units; the seam between the two pieces is y 0
  const X = (x: number) => (x + 20) * s
  const Y = (y: number) => (y + 9) * s
  const path = (pts: number[][]) => 'M' + pts.map(([x, y]) => `${X(x)} ${Y(y)}`).join('L') + 'Z'
  // tongue: 6 wide at the seam, 10 wide 10 mm in; the socket is 0.15 bigger a side and 0.3 deeper
  const tongue = [[-3, -4], [3, -4], [3, 0], [5, 10], [-5, 10], [-3, 0]]
  const sock = [[-3.15, 0], [3.15, 0], [5.15, 10.3], [-5.15, 10.3]]
  const dimH = (x0: number, x1: number, y: number, label: string, ty: number) => (
    <g>
      <line className="dove__dim" x1={X(x0)} x2={X(x1)} y1={Y(y)} y2={Y(y)} markerStart="url(#dove-a)" markerEnd="url(#dove-a)" />
      <text className="dove__text" x={X((x0 + x1) / 2)} y={Y(ty)} textAnchor="middle">
        {label}
      </text>
    </g>
  )
  return (
    <figure className="dove">
      <svg viewBox={`0 0 ${40 * s} ${27 * s}`} role="img" aria-label="Plan view of a printed dovetail joint: the tongue is 6 mm wide at the seam, 10 mm wide at its end and 10 mm long; the socket is 0.15 mm bigger each side and 0.3 mm deeper">
        <defs>
          <marker id="dove-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" className="dove__head" />
          </marker>
        </defs>
        <rect className="dove__piece" x={X(-20)} y={Y(-9)} width={40 * s} height={9 * s} />
        <path className="dove__piece" d={path([[-20, 0], [20, 0], [20, 18], [-20, 18]])} />
        <path className="dove__socket" d={path(sock)} />
        <path className="dove__tongue" d={path(tongue)} />
        <text className="dove__label" x={X(-19)} y={Y(-1.2)}>
          Piece A
        </text>
        <text className="dove__label" x={X(-19)} y={Y(16.6)}>
          Piece B
        </text>
        <line className="dove__ext" x1={X(-3)} x2={X(-3)} y1={Y(-4)} y2={Y(-6)} />
        <line className="dove__ext" x1={X(3)} x2={X(3)} y1={Y(-4)} y2={Y(-6)} />
        {dimH(-3, 3, -5.4, '6 mm neck', -6.5)}
        {dimH(-5, 5, 12.4, '10 mm', 14.6)}
        <line className="dove__dim" x1={X(8)} x2={X(8)} y1={Y(0)} y2={Y(10)} markerStart="url(#dove-a)" markerEnd="url(#dove-a)" />
        <line className="dove__ext" x1={X(5.6)} x2={X(9)} y1={Y(10)} y2={Y(10)} />
        <text className="dove__text" x={X(8.8)} y={Y(5.6)}>
          10 mm
        </text>
        <text className="dove__text dove__text--blue" x={X(7)} y={Y(13.4)}>
          Socket: +0.15 a side,
        </text>
        <text className="dove__text dove__text--blue" x={X(7)} y={Y(15.6)}>
          +0.3 deep
        </text>
      </svg>
    </figure>
  )
}
