import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

export type Panel = { label: string; caption: ReactNode; content: ReactNode }

/** Like Slides, but each panel is any content (a table, an animation), switched
 *  with the dots or a swipe. Every panel stands as tall as the tallest. */
export function Panels({ panels }: { panels: Panel[] }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const count = panels.length
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
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        <div className="panels__track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {panels.map((panel, i) => (
            <div key={panel.label} className="panels__panel" aria-hidden={i !== index} inert={i !== index}>
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
              key={panel.label}
              type="button"
              className="slides__dot"
              aria-label={`Show ${panel.label.toLowerCase()}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
