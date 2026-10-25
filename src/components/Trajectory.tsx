// The planned flight of the ball, drawn to scale on both axes (heights stretched
// by a fixed amount). Heights every 20 mm from a model of the flight with drag
// and the flywheel's topspin: 3.35 m/s at 35°, landing 930 mm away.
const STEP = 20
const HEIGHTS = [
  12.0, 26.4, 40.1, 53.2, 65.6, 77.4, 88.6, 99.2, 109.1, 118.5, 127.2, 135.2, 142.7, 149.5, 155.7, 161.2, 166.1, 170.5,
  174.1, 177.2, 179.6, 181.3, 182.5, 183.0, 182.8, 182.0, 180.6, 178.5, 175.7, 172.3, 168.2, 163.5, 158.1, 151.9, 145.2,
  137.7, 129.5, 120.6, 111.0, 100.7, 89.6, 77.8, 65.3, 52.0, 37.9, 23.1, 7.4,
]
const LANDING = 930
const NET_X = 550
const NET_H = 152
const PEAK_X = 460
const PEAK_H = 183

// Plot area in SVG units, and the range it shows in mm.
const L = 58
const R = 742
const T = 26
const B = 286
const MAX_X = 1050
const MAX_Y = 220
const sx = (R - L) / MAX_X
const sy = (B - T) / MAX_Y
const X = (mm: number) => L + mm * sx
const Y = (mm: number) => B - mm * sy
const STRETCH = (sy / sx).toFixed(1)

const heightAt = (mm: number) => {
  const i = Math.min(HEIGHTS.length - 2, Math.floor(mm / STEP))
  return HEIGHTS[i] + ((HEIGHTS[i + 1] - HEIGHTS[i]) * (mm - i * STEP)) / STEP
}

const path = [...HEIGHTS.map((h, i) => [i * STEP, h]), [LANDING, 0]]
  .map(([x, h], i) => `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(h).toFixed(1)}`)
  .join(' ')

// The launch arrow follows the start of the curve as drawn.
const tip = (() => {
  const dx = X(20) - X(0)
  const dy = Y(HEIGHTS[1]) - Y(HEIGHTS[0])
  const k = 64 / Math.hypot(dx, dy)
  return { x: X(0) + dx * k, y: Y(HEIGHTS[0]) + dy * k }
})()

export function Trajectory({ caption }: { caption?: string }) {
  const clear = Math.round(heightAt(NET_X) - NET_H)
  return (
    <figure className="traj">
      <svg viewBox="0 0 760 340" role="img" aria-label={`The ball's planned flight: launched at 3.35 metres per second and 35 degrees, it peaks at ${PEAK_H} millimetres, clears the ${NET_H} millimetre net by ${clear} millimetres and lands ${LANDING} millimetres away.`}>
        <defs>
          <marker id="traj-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="traj__head" />
          </marker>
        </defs>

        {/* Height grid */}
        {[0, 50, 100, 150, 200].map((h) => (
          <g key={h}>
            {h > 0 && <line className="traj__grid" x1={L} x2={R} y1={Y(h)} y2={Y(h)} />}
            <text className="traj__tick" x={L - 10} y={Y(h) + 4} textAnchor="end">
              {h}
            </text>
          </g>
        ))}

        {/* Launch zone and target zone on the table */}
        <rect className="traj__launch" x={X(0)} y={Y(16)} width={X(300) - X(0)} height={Y(0) - Y(16)} />
        <text className="traj__note" x={X(150)} y={Y(0) - 6} textAnchor="middle">
          launch zone
        </text>
        <rect className="traj__target" x={X(880)} y={Y(0) - 7} width={X(980) - X(880)} height={7} rx={2} />
        <text className="traj__label traj__label--blue" x={X(930)} y={Y(0) + 40} textAnchor="middle">
          Zone A / C
        </text>

        {/* The table */}
        <line className="traj__axis" x1={L} x2={R} y1={Y(0)} y2={Y(0)} />
        {[0, 300, NET_X, LANDING].map((x) => (
          <g key={x}>
            <line className="traj__axis" x1={X(x)} x2={X(x)} y1={Y(0)} y2={Y(0) + 6} />
            <text className="traj__tick" x={X(x)} y={Y(0) + 22} textAnchor="middle">
              {x}
            </text>
          </g>
        ))}

        {/* Net, and how far the ball clears it */}
        <line className="traj__net" x1={X(NET_X)} x2={X(NET_X)} y1={Y(0)} y2={Y(NET_H)} />
        <text className="traj__label traj__label--red" x={X(NET_X) + 9} y={Y(118)}>
          Net {NET_H} mm
        </text>
        <line className="traj__dim" x1={X(NET_X)} x2={X(NET_X)} y1={Y(NET_H) - 3} y2={Y(heightAt(NET_X)) + 3} />
        <text className="traj__label" x={X(NET_X) - 9} y={Y((NET_H + heightAt(NET_X)) / 2) + 5} textAnchor="end">
          +{clear} mm
        </text>

        {/* The flight */}
        <path className="traj__path" d={path} />
        <circle className="traj__dot" cx={X(PEAK_X)} cy={Y(PEAK_H)} r={4.5} />
        <text className="traj__label" x={X(PEAK_X)} y={Y(PEAK_H) - 12} textAnchor="middle">
          Peak {PEAK_H} mm
        </text>

        {/* Launch */}
        <line className="traj__launch-arrow" x1={X(0)} y1={Y(HEIGHTS[0])} x2={tip.x} y2={tip.y} markerEnd="url(#traj-arrow)" />
        <circle className="traj__ball" cx={X(0)} cy={Y(HEIGHTS[0])} r={5} />
        <text className="traj__label" x={tip.x + 12} y={tip.y + 22}>
          3.35 m/s
        </text>
        <text className="traj__label" x={tip.x + 12} y={tip.y + 40}>
          at 35°
        </text>

        {/* Axis names */}
        <text className="traj__note" x={(L + R) / 2} y={334} textAnchor="middle">
          Distance from the launcher (mm)
        </text>
        <text className="traj__note" transform={`translate(14 ${(T + B) / 2}) rotate(-90)`} textAnchor="middle">
          Height (mm)
        </text>
        <text className="traj__note" x={R} y={T - 8} textAnchor="end">
          Heights drawn {STRETCH}× taller than distances
        </text>
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
