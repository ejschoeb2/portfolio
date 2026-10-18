import { useRef, useState, type PointerEvent } from 'react'
import type { WalkPage } from '../content/projects'
import { Arrow } from './Arrow'

/** A tour of a tool, one page at a time: the screenshot on the left (click to
 *  see it full size) with dots under it, what that page does on the right. */
export function Walkthrough({ pages }: { pages: WalkPage[] }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const count = pages.length
  const page = pages[index]
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
    <div className="walk">
      <div className="walk__media">
        <div
          className="walk__frame"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (startX.current = null)}
        >
          <div className="walk__track" style={{ transform: `translateX(${-index * 100}%)` }}>
            {pages.map((p, i) => (
              <div key={p.name} className="walk__shot" aria-hidden={i !== index}>
                <img src={p.image.src} alt={p.image.alt} loading="lazy" draggable={false} />
              </div>
            ))}
          </div>
          <a
            className="project__open"
            href={page.image.src}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open the ${page.name} screenshot full size`}
          >
            <span className="project__open-label">
              Click to enlarge
              <Arrow direction="out" />
            </span>
          </a>
        </div>
        <span className="slides__dots walk__dots">
          {pages.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className="slides__dot"
              aria-label={`Show ${p.name}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </span>
      </div>

      <div className="walk__text" aria-live="polite">
        <h3 className="walk__name">{page.name}</h3>
        {page.body.map((paragraph) => (
          <p key={paragraph} className="chapter__body">
            {paragraph}
          </p>
        ))}

        <div className="walk__nav">
          <button type="button" className="panels__nav" aria-label="Previous page" onClick={() => go(index - 1)}>
            <Arrow direction="left" />
          </button>
          <button type="button" className="panels__nav" aria-label="Next page" onClick={() => go(index + 1)}>
            <Arrow />
          </button>
        </div>
      </div>
    </div>
  )
}
