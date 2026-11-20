import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Arrow } from './Arrow'

export type Report = {
  title: string
  /** One line under the heading. */
  note?: string
  /** The PDF to download or open. */
  pdf: string
  /** Page images, in order. */
  pages: string[]
}

const WIDE = '(min-width: 900px)'

/** A report you read page by page: two pages side by side on wide screens, one on
 *  narrow ones. The arrows either side, the arrow keys and swipe turn the pages. */
export function ReportViewer({ report }: { report: Report }) {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)
  const [first, setFirst] = useState(0)
  const startX = useRef<number | null>(null)
  const count = report.pages.length
  const step = wide ? 2 : 1

  useEffect(() => {
    const query = window.matchMedia(WIDE)
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Spreads always start on an odd page (1–2, 3–4 …).
  const start = wide ? first - (first % 2) : first
  const shown = report.pages.slice(start, start + step)
  const go = (to: number) => setFirst(Math.min(Math.max(to, 0), count - 1))
  const prev = () => go(start - step)
  const next = () => go(start + step)
  const atStart = start === 0
  const atEnd = start + step >= count

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') startX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)()
  }

  const label =
    shown.length > 1 ? `Pages ${start + 1}–${start + shown.length} of ${count}` : `Page ${start + 1} of ${count}`

  return (
    <section className="report" aria-labelledby="report-title">
      <div className="report__head">
        <div>
          <h2 className="story__title" id="report-title">
            {report.title}
          </h2>
          {report.note && <p className="report__note">{report.note}</p>}
        </div>
        <a className="build__link" href={report.pdf} target="_blank" rel="noreferrer">
          Open the PDF
          <Arrow direction="out" />
        </a>
      </div>

      <div
        className="report__desk"
        data-pages={step}
        tabIndex={0}
        role="group"
        aria-label={`${report.title}: ${label}. Use the arrow keys to turn the pages.`}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        <button type="button" className="report__turn" onClick={prev} disabled={atStart} aria-label="Previous pages">
          <Arrow direction="left" />
        </button>
        <div className="report__spread">
          {shown.map((src, i) => (
            <img
              key={src}
              className="report__page"
              src={src}
              alt={`Page ${start + i + 1} of the report`}
              draggable={false}
            />
          ))}
        </div>
        <button type="button" className="report__turn" onClick={next} disabled={atEnd} aria-label="Next pages">
          <Arrow />
        </button>
        {/* Load the next pages early so turning is instant. */}
        <div hidden>
          {report.pages.slice(start + step, start + step * 2).map((src) => (
            <img key={src} src={src} alt="" loading="eager" />
          ))}
        </div>
      </div>

      <p className="report__count">{label}</p>
    </section>
  )
}
