import Lenis from 'lenis'

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// allowNestedScroll: a box that can still scroll (a site preview, a long
// card) takes the wheel; once it can't, the page carries on scrolling.
export const lenis = new Lenis({ autoRaf: true, lerp: 0.12, allowNestedScroll: true })

/** Move the page without animating, e.g. when one page is swapped for another. */
export function jumpTo(y: number) {
  lenis.resize()
  lenis.scrollTo(y, { immediate: true, force: true })
  window.scrollTo(0, y)
}

export function glideTo(target: number | string | HTMLElement, duration = 1.1) {
  lenis.scrollTo(target, { duration: reducedMotion ? 0 : duration, immediate: reducedMotion })
}
