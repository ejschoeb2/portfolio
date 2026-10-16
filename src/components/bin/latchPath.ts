// The click-pen latch cycle, shared by the 3D view and the track drawing so both
// move together. Points are the pin centre in the latch plate's own frame
// (z across the plate, y up, mm), checked against the printed CustomLatch3 track:
// the Ø 2 pin keeps ≥ 0.96 mm from the walls, i.e. it just rides along them.
// Left and right in the captions are as seen from the front of the bin.

export type LatchPhase = { until: number; caption: string; short: string }

type Leg = { to: [number, number][]; secs: number; phase: number }

const LATCHED: [number, number] = [-8.689, 15.825]

// Each leg runs through its points at constant speed.
const LEGS: Leg[] = [
  { to: [[-8.0, -9.0]], secs: 0.01, phase: 0 },
  { to: [[-8.0, 4.6]], secs: 1.0, phase: 0 },
  {
    to: [[-7.6, 7.0], [-7.0, 8.4], [-6.6, 9.0], [-5.55, 10.0], [-3.95, 12.0], [-3.95, 17.0], [-6.0, 18.6], [-7.17, 19.1]],
    secs: 1.7,
    phase: 0,
  },
  { to: [[-7.17, 19.1]], secs: 0.5, phase: 1 },
  { to: [[-7.15, 17.6], [-7.6, 16.6], LATCHED], secs: 0.7, phase: 2 },
  { to: [LATCHED], secs: 1.6, phase: 2 },
  { to: [[-8.75, 17.3], [-10.0, 18.15], [-11.0, 18.7], [-11.98, 19.43]], secs: 1.0, phase: 3 },
  { to: [[-11.98, 19.43]], secs: 0.5, phase: 3 },
  {
    to: [[-11.7, 14.0], [-11.7, 9.0], [-10.9, 8.0], [-9.6, 7.4], [-8.6, 6.8], [-8.1, 5.8], [-8.0, 4.6], [-8.0, -9.0]],
    secs: 1.9,
    phase: 4,
  },
  { to: [[-8.0, -9.0]], secs: 0.9, phase: 4 },
]

export const LATCH_PHASES: LatchPhase[] = [
  { until: 0, short: 'Closing', caption: 'Shut the lid: the pin rides up the left-hand channel.' },
  { until: 0, short: 'Overtravel', caption: 'Pushed just past latched, the pin reaches the first pocket. The bump stops sit here, about 3 mm down.' },
  { until: 0, short: 'Latched', caption: 'Let go: the springs lift the lid a little and the pin drops into the notch. The lid is latched.' },
  { until: 0, short: 'Push again', caption: 'Push again: the tooth above the notch steers the pin into the right-hand pocket.' },
  { until: 0, short: 'Released', caption: 'Let go: the pin runs down the right-hand channel and out. The springs open the lid.' },
]

type Sample = { z: number; y: number; t: number; phase: number }
const samples: Sample[] = []
let clock = 0
let last: [number, number] = [-8.0, -9.0]
for (const leg of LEGS) {
  const pts = leg.to
  const lens = pts.map((p, i) => Math.hypot(p[0] - (i ? pts[i - 1][0] : last[0]), p[1] - (i ? pts[i - 1][1] : last[1])))
  const total = lens.reduce((a, b) => a + b, 0)
  if (total < 1e-6) {
    samples.push({ z: last[0], y: last[1], t: clock, phase: leg.phase })
    clock += leg.secs
    samples.push({ z: last[0], y: last[1], t: clock, phase: leg.phase })
    continue
  }
  let acc = 0
  pts.forEach((p, i) => {
    const a = i ? pts[i - 1] : last
    const n = Math.max(2, Math.ceil(lens[i] / 0.25))
    for (let k = 1; k <= n; k++) {
      const f = k / n
      samples.push({
        z: a[0] + (p[0] - a[0]) * f,
        y: a[1] + (p[1] - a[1]) * f,
        t: clock + ((acc + lens[i] * f) / total) * leg.secs,
        phase: leg.phase,
      })
    }
    acc += lens[i]
  })
  clock += leg.secs
  last = pts[pts.length - 1]
}

export const LATCH_PERIOD = clock
for (const p of LATCH_PHASES) p.until = 0
samples.forEach((s) => (LATCH_PHASES[s.phase].until = s.t))

export const LATCHED_PIN = { z: LATCHED[0], y: LATCHED[1] }

/** Pin position and phase at time `secs` (loops). */
export function latchAt(secs: number) {
  const t = ((secs % LATCH_PERIOD) + LATCH_PERIOD) % LATCH_PERIOD
  let lo = 0
  let hi = samples.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].t <= t) lo = mid
    else hi = mid
  }
  const a = samples[lo]
  const b = samples[hi]
  const f = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 0
  return { z: a.z + (b.z - a.z) * f, y: a.y + (b.y - a.y) * f, phase: a.phase }
}

/** One shared clock, so every view of the latch shows the same moment. */
export const latchClock = () => (performance.now() / 1000) * 0.6
