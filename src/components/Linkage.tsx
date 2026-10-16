import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/scroll'

// Final (v6) link lengths of the launcher's aiming linkage, in mm.
const A = 26 // crank
const B = 95 // coupler
const C = 107 // rocker
const D = 151.38 // ground: crank pivot O to rocker pivot Q
const DEG_PER_S = 60 // crank speed for the animation (the real crank turns at ~30°/s)

const deg = (r: number) => (r * 180) / Math.PI

// Rocker angle measured at Q from the ground link (Q → O), at the two
// extremes where the crank and coupler line up (law of cosines).
const rockerAt = (ob: number) => Math.acos((D * D + C * C - ob * ob) / (2 * D * C))
const EXTENDED = rockerAt(A + B)
const FOLDED = rockerAt(B - A)

type Pose = { ax: number; ay: number; bx: number; by: number; rocker: number; mu: number }

/** Where every joint sits for a given crank angle. y is up. */
function solve(theta: number): Pose {
  const ax = A * Math.cos(theta)
  const ay = A * Math.sin(theta)
  // Coupler/rocker joint: the upper intersection of circle(A, B) and circle(Q, C).
  const dx = D - ax
  const dy = -ay
  const l = Math.hypot(dx, dy)
  const along = (B * B - C * C + l * l) / (2 * l)
  const h = Math.sqrt(Math.max(0, B * B - along * along))
  const ux = dx / l
  const uy = dy / l
  const px = ax + along * ux
  const py = ay + along * uy
  const c1 = { x: px - h * uy, y: py + h * ux }
  const c2 = { x: px + h * uy, y: py - h * ux }
  const { x: bx, y: by } = c1.y > c2.y ? c1 : c2
  const rocker = Math.atan2(by, -(bx - D)) // from Q → O, opening upwards
  const v1 = { x: ax - bx, y: ay - by }
  const v2 = { x: D - bx, y: -by }
  const mu = Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)))
  return { ax, ay, bx, by, rocker, mu }
}

/** Point at angle `a` (from Q → O, upwards) on a circle of radius r around Q, in SVG space. */
const aroundQ = (r: number, a: number) => `${D - r * Math.cos(a)} ${-r * Math.sin(a)}`

/** The four-bar crank-rocker that aims the launcher, turning at its real proportions. */
export function Linkage() {
  const root = useRef<HTMLDivElement>(null)
  const [theta, setTheta] = useState(2.2)

  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    let last = 0
    let visible = false
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    observer.observe(root.current!)
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 0
      last = now
      if (visible && !document.hidden) setTheta((t) => (t + (dt / 1000) * ((DEG_PER_S * Math.PI) / 180)) % (Math.PI * 2))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  const p = solve(theta)
  // SVG y runs down, so flip every y.
  const A_ = { x: p.ax, y: -p.ay }
  const B_ = { x: p.bx, y: -p.by }
  const sweep = `M ${D} 0 L ${aroundQ(C, FOLDED)} A ${C} ${C} 0 0 1 ${aroundQ(C, EXTENDED)} Z`

  return (
    <figure className="linkage" ref={root}>
      <svg viewBox="-42 -96 222 124" role="img" aria-label="Animated four-bar linkage: the crank turns and the rocker swings 28.5 degrees">
        {/* Ground */}
        <line className="linkage__ground" x1={0} y1={0} x2={D} y2={0} />
        {/* The rocker's swing between its two extremes */}
        <path className="linkage__sweep" d={sweep} />
        <circle className="linkage__path" cx={0} cy={0} r={A} />

        <line className="linkage__link linkage__link--rocker" x1={D} y1={0} x2={B_.x} y2={B_.y} />
        <line className="linkage__link" x1={A_.x} y1={A_.y} x2={B_.x} y2={B_.y} />
        <line className="linkage__link linkage__link--crank" x1={0} y1={0} x2={A_.x} y2={A_.y} />

        {[
          [0, 0],
          [D, 0],
        ].map(([x, y]) => (
          <g key={x}>
            <path className="linkage__mount" d={`M ${x - 7} ${y + 9} L ${x} ${y} L ${x + 7} ${y + 9} Z`} />
            <circle className="linkage__pivot" cx={x} cy={y} r={3.2} />
          </g>
        ))}
        <circle className="linkage__joint" cx={A_.x} cy={A_.y} r={2.6} />
        <circle className="linkage__joint" cx={B_.x} cy={B_.y} r={2.6} />

        <text className="linkage__label" x={-6} y={20}>
          crank 26
        </text>
        <text className="linkage__label" x={D - 34} y={20}>
          rocker pivot
        </text>
        <text className="linkage__label" x={52} y={13}>
          ground 151.38
        </text>
      </svg>

      <dl className="linkage__readout">
        <div>
          <dt>Crank</dt>
          <dd>{Math.round(deg(theta))}°</dd>
        </div>
        <div>
          <dt>Rocker</dt>
          <dd>{deg(p.rocker).toFixed(1)}°</dd>
        </div>
        <div>
          <dt>Transmission</dt>
          <dd>{Math.round(deg(p.mu > Math.PI / 2 ? Math.PI - p.mu : p.mu))}°</dd>
        </div>
        <div>
          <dt>Sweep</dt>
          <dd>{deg(EXTENDED - FOLDED).toFixed(1)}°</dd>
        </div>
      </dl>
      <figcaption>
        The final linkage at its real proportions: crank 26, coupler 95, rocker 107 mm. As the crank
        turns, the rocker swings through the shaded 28.5°, and the arm aims from zone A to zone C.
      </figcaption>
    </figure>
  )
}
