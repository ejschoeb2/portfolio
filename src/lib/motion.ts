export type Rect = { x: number; y: number; w: number; h: number }

export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** Runs `onUpdate` with a value moving linearly from → to. Returns a cancel function. */
export function tween(
  from: number,
  to: number,
  ms: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
) {
  let raf = 0
  const start = performance.now()
  const frame = (now: number) => {
    const t = ms <= 0 ? 1 : clamp((now - start) / ms, 0, 1)
    onUpdate(lerp(from, to, t))
    if (t < 1) raf = requestAnimationFrame(frame)
    else onDone?.()
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
