import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Arrow } from './Arrow'

export type Panel = { caption: string; content: ReactNode }

/** Like Slides, but each panel is any content (a table, an animation). The
 *  frame eases to the height of the panel on show. */
export function Panels({ panels }: { panels: Panel[] }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const frame = useRef<HTMLDivElement>(null)
  const count = panels.length

  useLayoutEffect(() => {
    const el = frame.current!
    const fit = () => {
      const panel = el.querySelectorAll<HTMLElement>('.panels__panel')[index]
      if (panel) el.style.height = `${panel.offsetHeight}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    el.querySelectorAll('.panels__panel').forEach((panel) => observer.observe(panel))
    return () => observer.disconnect()
  }, [index])
  const go = (i: number) => setIndex((i + count) % count)

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') startX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div className="panels">
      <div
        className="panels__frame"
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        <div className="panels__track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {panels.map((panel, i) => (
            <div key={panel.caption} className="panels__panel" aria-hidden={i !== index} inert={i !== index}>
              {panel.content}
            </div>
          ))}
        </div>
      </div>

      <div className="panels__foot">
        <span className="panels__caption">{panels[index].caption}</span>
        <span className="slides__dots">
          {panels.map((panel, i) => (
            <button
              key={panel.caption}
              type="button"
              className="slides__dot"
              aria-label={`Show ${panel.caption.toLowerCase()}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </span>
        <button type="button" className="panels__nav" aria-label="Previous" onClick={() => go(index - 1)}>
          <Arrow direction="left" />
        </button>
        <button type="button" className="panels__nav" aria-label="Next" onClick={() => go(index + 1)}>
          <Arrow />
        </button>
      </div>
    </div>
  )
}
