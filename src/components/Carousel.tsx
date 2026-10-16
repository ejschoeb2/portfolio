import { useLayoutEffect, useRef, useState } from 'react'
import { projects } from '../content/projects'
import { clamp, easeInOutCubic, lerp, tween } from '../lib/motion'
import { jumpTo, reducedMotion } from '../lib/scroll'
import { useTransitions } from '../transition'
import { ProjectCard } from './ProjectCard'

// The carousel is the last thing on the page. Once the page has come to rest
// on it, scrolling moves the cards instead of the page: down for the next card,
// up for the one before. The row has ends: past the last card nothing happens,
// and above the first one scrolling up moves the page back to the top.
const AUTOPLAY_MS = 10000 // how long the active dot takes to fill
const SWIPE_MS = 1050 // one card sliding across to the next
const PUSH_PX = 300 // wheel travel needed to push past the current card (~3 notches)
const PUSH_TOUCH = 0.24 // the same for a finger, as a share of the window height
const STICK = 0.28 // how far the card gives (in cards) while it is still holding on
const GESTURE_GAP_MS = 180 // quiet time that separates one scroll gesture from the next
const RELEASE_MS = 320 // a push that stops short springs back after this long
const SIDE_SCALE = 0.8 // size of the cards either side of the centre one
const SIDE_OPACITY = 0.5
const END_GIVE = 0.05 // how far the end cards give when pushed past the end
const REWIND_MS = 900 // autoplay running back to the first card, plus per card:
const REWIND_PER_CARD_MS = 160

// Leaves at a good pace (it has already been pushed) and settles gently.
const swipeEase = (t: number) => 0.5 * easeInOutCubic(t) + 0.5 * (1 - (1 - t) ** 3)

type LenisEvent = Event & { lenisStopPropagation?: boolean }

export function Carousel({ startAt }: { startAt: string | null }) {
  const count = projects.length
  const startIndex = Math.max(0, projects.findIndex((p) => p.slug === startAt))

  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLDivElement | null)[]>([])
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  const dotsEl = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(startIndex)
  const { flying } = useTransitions()

  const state = useRef({
    index: startIndex, // the card in the centre (until a swipe has landed)
    shown: startIndex, // the card React has marked active
    pos: 0, // offset from `index`, in cards; -1 … 1
    target: 0, // where `pos` is easing to while the card is being pushed
    push: 0, // input travel in the current push, px
    swiping: false,
    rewinding: false,
    armed: false, // the current wheel gesture may move the carousel
    owned: false, // the carousel has taken part of the current wheel gesture
    lastWheel: 0,
    release: 0,
    touchY: null as number | null,
    span: 0, // distance between card centres, px
    max: 0, // page scroll offset at which the carousel fills the window
    moved: false, // the pointer has moved since the last card arrived
    hovering: false, // the pointer is on the card in the middle (autoplay waits)
    flying: false,
    fading: false,
    timer: 0, // 0 → 1 progress of the active dot
  })
  const s = state.current
  s.flying = flying

  const setIndex = (i: number) => {
    s.index = clamp(i, 0, count - 1)
    s.pos = s.target = s.push = 0
    s.timer = 0
    s.hovering = false
  }

  const swipe = (dir: 1 | -1) => {
    if (s.swiping) return
    s.swiping = true
    s.push = 0
    window.clearTimeout(s.release)
    const from = s.pos
    const ms = reducedMotion ? 0 : SWIPE_MS * (1 - Math.abs(from) / 2)
    s.moved = false
    tween(0, 1, ms, (t) => (s.pos = from + (dir - from) * swipeEase(t)), () => {
      s.swiping = false
      setIndex(s.index + dir)
    })
  }

  // After the last card, autoplay sweeps the row back to the first.
  const rewind = () => {
    if (s.swiping) return
    s.swiping = s.rewinding = true
    const from = s.index + s.pos
    const ms = reducedMotion ? 0 : REWIND_MS + REWIND_PER_CARD_MS * from
    tween(0, 1, ms, (t) => (s.pos = from * (1 - easeInOutCubic(t)) - s.index), () => {
      s.swiping = s.rewinding = false
      setIndex(0)
    })
  }

  const go = (i: number) => {
    if (s.swiping || s.fading || s.flying || i === s.index || i < 0 || i >= count) return
    if (i === s.index + 1) return swipe(1)
    if (i === s.index - 1) return swipe(-1)

    // Further than one card: fade through rather than spin past every card.
    s.fading = true
    track.current?.classList.add('is-hidden')
    window.setTimeout(() => {
      setIndex(i)
      track.current?.classList.remove('is-hidden')
      s.fading = false
    }, 260)
  }

  useLayoutEffect(() => {
    const sectionEl = section.current!
    let raf = 0

    const atBottom = () => window.scrollY >= s.max - 4

    const measure = () => {
      const cardW = slides.current[0]!.offsetWidth
      s.span = (cardW * (1 + SIDE_SCALE)) / 2 + Math.max(16, window.innerWidth * 0.022)
      s.max = document.documentElement.scrollHeight - window.innerHeight
    }

    // 0 while the carousel is still below the window, 1 once it fills it.
    const introAt = () => clamp(1 - (s.max - window.scrollY) / window.innerHeight, 0, 1)

    const render = (settled: boolean) => {
      const position = s.index + s.pos
      // On the way down from the hero the cards come up as a small fanned
      // stack from the bottom centre of the screen, then grow and deal out
      // into the row. While that happens the row is held still on screen
      // (`lag` undoes the page scroll), so the whole move plays in view.
      const raw = reducedMotion ? 1 : introAt()
      const intro = easeInOutCubic(raw)
      const fold = 1 - intro
      const lag = (1 - raw) * window.innerHeight
      track.current!.style.transform =
        raw < 1
          ? `translate3d(0, ${fold * window.innerHeight * 0.1 - lag}px, 0) scale(${lerp(0.22, 1, intro)})`
          : ''
      dotsEl.current!.style.opacity = String(clamp((intro - 0.6) / 0.4, 0, 1))

      slides.current.forEach((el, i) => {
        if (!el) return
        const offset = i - position // signed distance from the centre, in cards
        const away = Math.min(Math.abs(offset), 1)
        const x = offset * s.span * lerp(0.16, 1, intro)
        const y = fold * Math.abs(offset) * 40
        const turn = fold * clamp(offset, -2, 2) * 7
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${turn}deg) scale(${1 - (1 - SIDE_SCALE) * away})`
        el.style.opacity = String(1 - (1 - SIDE_OPACITY) * away * intro)
        el.style.zIndex = String(10 - Math.round(Math.abs(offset) * 2))
        el.style.visibility = Math.abs(offset) > 1.7 ? 'hidden' : ''
      })

      if (s.index !== s.shown) {
        s.shown = s.index
        s.timer = 0
        setActive(s.index)
      }

      // Dots fill up as you go: the ones already passed stay full, and the
      // active bar runs on to full as its card is pushed across to the next.
      const progress = s.pos >= 0 ? s.timer + (1 - s.timer) * s.pos : s.timer * (1 + s.pos)
      fills.current.forEach((el, i) => {
        if (!el) return
        const value = s.rewinding
          ? clamp(position - i, 0, 1) // the dots drain as the row runs back
          : i < s.index
            ? 1
            : i === s.index
              ? clamp(progress, 0, 1)
              : 0
        el.style.transform = `translateX(${(value - 1) * 100}%)`
      })

      // A card that slides in under a resting cursor shouldn't start opening
      // by itself, so Learn more waits for the pointer to move first.
      sectionEl.toggleAttribute('data-settled', settled && s.moved)
    }

    // Moves the row by `travel` (signed: + is towards the next card) of the
    // `full` distance needed to push a card over. At either end it only gives.
    const push = (travel: number, full: number) => {
      s.push = travel
      const dir = travel < 0 ? -1 : 1
      const f = Math.abs(travel) / full
      const open = dir > 0 ? s.index < count - 1 : s.index > 0
      if (open && f >= 1) return swipe(dir)
      s.target = dir * (open ? STICK * f ** 1.5 : END_GIVE * (1 - Math.exp(-f)))
    }

    const release = () => {
      s.push = 0
      s.target = 0
    }

    const consume = (e: LenisEvent) => {
      if (e.cancelable) e.preventDefault()
      e.lenisStopPropagation = true // keep Lenis from scrolling the page as well
    }

    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      const gap = now - s.lastWheel
      s.lastWheel = now
      if (e.ctrlKey) return
      if (!atBottom() || s.flying) {
        s.armed = s.owned = false
        return
      }
      const fresh = gap >= GESTURE_GAP_MS
      if (fresh) s.owned = false
      // The gesture that brought the page down here (and its inertia) must
      // end before the carousel starts listening. The rest of a gesture that
      // already moved a card is swallowed, so it can't scroll the page too.
      if (!s.armed) {
        if (!fresh) return s.owned ? consume(e) : undefined
        s.armed = true
      }
      if (s.swiping || s.fading) {
        s.owned = true
        return consume(e)
      }

      const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1)
      if (dy === 0) return
      // Scrolling up from the first card moves the page back up to the hero.
      if (dy < 0 && s.index === 0 && s.push === 0) return

      consume(e)
      s.owned = true
      push(s.push + dy, PUSH_PX)
      window.clearTimeout(s.release)
      if (s.swiping) s.armed = false // one card per gesture
      else s.release = window.setTimeout(release, RELEASE_MS)
    }

    const onTouchStart = (e: TouchEvent) => {
      const ready = e.touches.length === 1 && atBottom() && !s.swiping && !s.flying && !s.fading
      s.touchY = ready ? e.touches[0].clientY : null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (s.touchY === null) return
      const dy = s.touchY - e.touches[0].clientY
      // Dragging down at the first card moves the page back up to the hero.
      if (dy <= 0 && s.index === 0 && s.push === 0) return
      if (!atBottom()) {
        s.touchY = null
        return release()
      }
      consume(e)
      push(dy, window.innerHeight * PUSH_TOUCH)
      if (s.swiping) s.touchY = null
    }

    const onTouchEnd = () => {
      if (s.touchY === null) return
      s.touchY = null
      release()
    }

    const onPointerMove = () => {
      s.moved = true
    }

    const onKey = (e: KeyboardEvent) => {
      if (!atBottom() || e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      const forward =
        e.key === 'ArrowDown' ||
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        (e.key === ' ' && !target.closest('a, button'))
      if (forward) {
        e.preventDefault()
        go(s.index + 1)
      } else if (e.key === 'ArrowLeft' || (e.key === 'ArrowUp' && s.index > 0)) {
        e.preventDefault()
        go(s.index - 1)
      }
    }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      if (!s.swiping) {
        s.pos += (s.target - s.pos) * (1 - Math.exp(-dt / 85))
        if (Math.abs(s.target - s.pos) < 0.0004) s.pos = s.target
      }

      const settled = !s.swiping && s.pos === 0 && s.push === 0
      const inView = window.scrollY >= s.max - window.innerHeight * 0.15
      if (
        settled &&
        inView &&
        !s.hovering &&
        !s.flying &&
        !s.fading &&
        !document.hidden &&
        !reducedMotion
      ) {
        s.timer = Math.min(1, s.timer + dt / AUTOPLAY_MS)
        if (s.timer === 1) {
          if (s.index < count - 1) swipe(1)
          else rewind()
        }
      }

      render(settled)
      raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      measure()
      render(!s.swiping && s.pos === 0)
    }

    measure()
    if (startAt) jumpTo(s.max)
    render(true)

    const opts = { passive: false, capture: true }
    window.addEventListener('wheel', onWheel, opts)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, opts)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    const resize = new ResizeObserver(onResize)
    resize.observe(document.body)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('wheel', onWheel, opts)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove, opts)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onPointerMove)
      resize.disconnect()
      window.clearTimeout(s.release)
      cancelAnimationFrame(raf)
    }
    // Set up once; everything it reads afterwards lives in refs.
  }, [])

  return (
    <section className="carousel" id="projects" ref={section} aria-label="Projects">
      <div
        className="carousel__track"
        ref={track}
      >
        {projects.map((project, i) => (
          <div
            key={project.slug}
            className="carousel__slide"
            ref={(el) => {
              slides.current[i] = el
            }}
            data-active={i === active || undefined}
            onClick={() => i !== s.index && go(i)}
            onPointerMove={(e) => e.pointerType === 'mouse' && (s.hovering = i === s.index)}
            onPointerLeave={() => (s.hovering = false)}
          >
            <ProjectCard project={project} enabled={i === active} />
          </div>
        ))}
      </div>

      <div className="carousel__dots" ref={dotsEl}>
        {projects.map((project, i) => (
          <button
            key={project.slug}
            type="button"
            className="dot"
            aria-label={`Show ${project.title}`}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => go(i)}
          >
            <span className="dot__bar">
              <span
                className="dot__fill"
                ref={(el) => {
                  fills.current[i] = el
                }}
              />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
