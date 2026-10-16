import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { StoryImage } from '../content/projects'
import { Arrow } from './Arrow'

/** A small slideshow for a story chapter: arrows, dots, and swipe on touch screens. */
export function Slides({ images, ratio = 0.8 }: { images: StoryImage[]; ratio?: number }) {
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const count = images.length
  const go = (i: number) => setIndex((i + count) % count)

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') startX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <figure className="slides" style={{ '--ratio': ratio } as CSSProperties}>
      <div
        className="slides__frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        <div className="slides__track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {images.map((image, i) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              draggable={false}
              data-fit={image.fit}
              aria-hidden={i !== index}
            />
          ))}
        </div>
        <button
          type="button"
          className="slides__nav slides__nav--prev"
          aria-label="Previous photo"
          onClick={() => go(index - 1)}
        >
          <Arrow direction="left" />
        </button>
        <button
          type="button"
          className="slides__nav slides__nav--next"
          aria-label="Next photo"
          onClick={() => go(index + 1)}
        >
          <Arrow />
        </button>
      </div>

      <figcaption className="slides__foot">
        <span>{images[index].caption}</span>
        <span className="slides__dots">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              className="slides__dot"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </span>
      </figcaption>
    </figure>
  )
}
