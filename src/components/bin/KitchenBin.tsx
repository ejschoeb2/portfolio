import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { aiNote, chapters, finalStep, problem, specification, type Block, type Calc, type Step } from '../../content/kitchenBin'
import type { Table } from '../../content/projects'
import '../../styles/timeline.css'
import { lenis } from '../../lib/scroll'
import { Reveal } from '../Reveal'
import { BinViewer } from './BinViewer'
import { BRAINSTORM_PARTS, SCENES } from './scenes'
import { Brainstorm, Dovetail, LatchTrack, SealSection, SpringChart } from './Widgets'

type Flat = Step & { chapter: number; n: number }
type OnCalc = (c: Calc | null, tap?: boolean) => void

const steps: Flat[] = chapters.flatMap((c, ci) => c.steps.map((s) => ({ ...s, chapter: ci, n: 0 })))
steps.forEach((s, i) => (s.n = i + 1))
const LAST = steps.length // index of the final frame


/** **bold** inside a string. */
function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/).map((bit, i) =>
    bit.startsWith('**') ? <strong key={i}>{bit.slice(2, -2)}</strong> : <Fragment key={i}>{bit}</Fragment>,
  )
}

function SmallTable({ table }: { table: Table }) {
  return (
    <figure className="data tl-table">
      <div className="data__scroll" data-lenis-prevent-horizontal>
        <table>
          <thead>
            <tr>
              {table.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className={/[a-z]{4,}/i.test(cell) ? 'is-text' : undefined}>
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.caption && <figcaption>{table.caption}</figcaption>}
    </figure>
  )
}

/** Hover (or tap) handlers that show a calculation's working over the model. */
const hoverCalc = (c: Calc, onCalc: OnCalc) => ({
  tabIndex: 0,
  onMouseEnter: () => onCalc(c),
  onMouseLeave: () => onCalc(null),
  onFocus: () => onCalc(c),
  onBlur: () => onCalc(null),
  onPointerUp: (e: React.PointerEvent) => e.pointerType !== 'mouse' && onCalc(c, true),
})

/** Text with [[linked words]]; the n-th link shows the n-th calculation. */
function linked(text: string, calcs: (Calc | undefined)[], onCalc: OnCalc): ReactNode {
  let n = 0
  return text.split(/(\[\[[^\]]+\]\])/).map((bit, i) => {
    const c = bit.startsWith('[[') ? (calcs[n++] ?? calcs[0]) : undefined
    return c ? (
      <span key={i} className="tl-link" {...hoverCalc(c, onCalc)}>
        {bit.slice(2, -2)}
      </span>
    ) : (
      <Fragment key={i}>{rich(bit.replace(/\[\[|\]\]/g, ''))}</Fragment>
    )
  })
}

function BlockView({ block, onFlash, onCalc }: { block: Block; onFlash: (k: string | null) => void; onCalc: OnCalc }) {
  switch (block.kind) {
    case 'text':
      return <p className={block.lead ? 'tl-card__summary' : 'tl-text'}>{linked(block.text, block.calcs ?? [block.calc], onCalc)}</p>
    case 'list':
      return (
        <div className="tl-list">
          {block.title && <h4>{block.title}</h4>}
          <ul>
            {block.items.map((it) => (
              <li key={it}>{rich(it)}</li>
            ))}
          </ul>
        </div>
      )
    case 'table':
      return block.calc ? (
        <div className="tl-hovertable" {...hoverCalc(block.calc, onCalc)}>
          <SmallTable table={block.table} />
          <p className="tl-hint">Hover the table to see the working</p>
        </div>
      ) : (
        <SmallTable table={block.table} />
      )
    case 'outcome':
      return (
        <p className="tl-outcome">
          {block.dropped && <span className="tl-outcome__dropped">{block.dropped} </span>}
          {linked(block.text, [block.calc], onCalc)}
        </p>
      )
    case 'cite':
      return <p className="tl-cite">{block.text}</p>
    case 'widget':
      if (block.name === 'brainstorm') return <Brainstorm onFlash={onFlash} />
      if (block.name === 'latch') return <LatchTrack />
      if (block.name === 'springs') return <SpringChart />
      if (block.name === 'seal') return <SealSection />
      return <Dovetail />
  }
}

function Card({ step, active, onFlash, onCalc }: { step: Flat; active: boolean; onFlash: (k: string | null) => void; onCalc: OnCalc }) {
  return (
    <article className="tl-card" aria-hidden={!active} inert={!active} data-dead={step.dead || undefined}>
      <h3 className="tl-card__step">{step.n}</h3>
      <div className="tl-card__body">
        {step.blocks.map((b, i) => (
          <BlockView key={i} block={b} onFlash={onFlash} onCalc={onCalc} />
        ))}
      </div>
    </article>
  )
}

function FinalCard({ active }: { active: boolean }) {
  return (
    <article className="tl-card tl-card--final" aria-hidden={!active} inert={!active}>
      <h3 className="tl-card__step">Today</h3>
      <p className="tl-card__summary">{finalStep.text}</p>
      <div className="tl-card__body">
        <ol className="tl-hotlist">
          {SCENES.final.hotspots!.map((h, i) => (
            <li key={h.id}>
              <span>{i + 1}</span>
              <div>
                <strong>{h.title}</strong>
                <p>{h.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}

export function KitchenBin() {
  const [index, setIndex] = useState(0)
  const [flash, setFlash] = useState<string[]>([])
  const track = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const section = useRef<HTMLElement>(null)

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(LAST, i))), [])
  const step = index < LAST ? steps[index] : null
  const scene = step ? SCENES[step.id] : SCENES.final

  const onFlash = useCallback((k: string | null) => setFlash(k ? (BRAINSTORM_PARTS[k] ?? []) : []), [])
  // a calculation being looked at replaces the model on the left
  const [calc, setCalc] = useState<Calc | null>(null)
  const lastCalc = useRef<Calc | null>(null)
  if (calc) lastCalc.current = calc
  const onCalc = useCallback<OnCalc>((c, tap) => setCalc((old) => (tap && old === c ? null : c)), [])
  useEffect(() => {
    setFlash([])
    setCalc(null)
  }, [index])

  // each card scrolls on its own; start a newly shown one at the top
  useLayoutEffect(() => {
    const card = track.current?.children[index] as HTMLElement | undefined
    if (card) card.scrollTop = 0
  }, [index])

  // arrow keys while the timeline is on screen
  useEffect(() => {
    let onScreen = false
    const io = new IntersectionObserver(([e]) => (onScreen = e.intersectionRatio > 0.25), { threshold: [0, 0.25, 0.5] })
    if (section.current) io.observe(section.current)
    const key = (e: KeyboardEvent) => {
      if (!onScreen || e.altKey || e.metaKey || e.ctrlKey) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => Math.min(LAST, i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    addEventListener('keydown', key)
    return () => {
      removeEventListener('keydown', key)
      io.disconnect()
    }
  }, [])

  // swipe between steps on touch screens
  useEffect(() => {
    const el = panel.current
    if (!el) return
    let x0 = 0
    let y0 = 0
    const start = (e: TouchEvent) => {
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
    }
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0
      const dy = e.changedTouches[0].clientY - y0
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) setIndex((i) => Math.max(0, Math.min(LAST, i + (dx < 0 ? 1 : -1))))
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchend', end, { passive: true })
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchend', end)
    }
  }, [])

  // after moving on, bring the top of the card back into view if it has scrolled away
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const stage = section.current?.querySelector<HTMLElement>('.tl__stage')
    if (stage && stage.getBoundingClientRect().top < -40) lenis.scrollTo(stage, { offset: -16, duration: 0.8 })
  }, [index])


  return (
    <div className="kb">
      <section className="kb__problem" aria-labelledby="kb-problem">
        <Reveal>
          <h2 className="story__title" id="kb-problem">
            The problem
          </h2>
        </Reveal>
        <div className="kb__problem-grid">
          <Reveal className="kb__problem-text">
            {problem.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="kb__note">{problem.note}</p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="chapter__stats kb__stats">
              {problem.stats.map((s) => (
                <li key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="kb__spec" aria-labelledby="kb-spec">
        <Reveal>
          <h2 className="story__title" id="kb-spec">
            The specification
          </h2>
        </Reveal>
        <Reveal>
          <SmallTable table={specification} />
        </Reveal>
      </section>

      <section className="tl" ref={section} aria-labelledby="kb-design">
        <Reveal className="tl__head">
          <h2 className="story__title" id="kb-design">
            The design process
          </h2>
          <p className="tl__ai">{aiNote}</p>
        </Reveal>

        <div className="tl__stage">
          <div className="tl__viewer">
            <BinViewer scene={scene} flash={flash} />
            <div className="tl-calcview" data-on={calc ? true : undefined} aria-hidden={!calc} onClick={() => setCalc(null)}>
              {lastCalc.current && (
                <>
                  <p className="tl-calcview__badge">Worked in text for now · hand working to follow</p>
                  <h4>{lastCalc.current.title}</h4>
                  {lastCalc.current.given && <p className="calc__given">{lastCalc.current.given}</p>}
                  <ol className="calc__lines">
                    {lastCalc.current.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ol>
                  <p className="calc__result">{lastCalc.current.result}</p>
                </>
              )}
            </div>
          </div>

          <div className="tl__panel" ref={panel}>
            <div className="tl__window">
              <div className="tl__track" ref={track} style={{ transform: `translateX(${-index * 100}%)` }}>
                {steps.map((s, i) => (
                  <Card key={s.id} step={s} active={i === index} onFlash={onFlash} onCalc={onCalc} />
                ))}
                <FinalCard active={index === LAST} />
              </div>
            </div>

          </div>
        </div>

        <div className="tl__scrub">
          <div className="tl__scrub-bar" style={{ '--p': `${(index / LAST) * 100}%` } as CSSProperties}>
            <div className="tl__ticks" aria-hidden="true">
              {[...steps, null].map((s, i) => (
                <span
                  key={s ? s.id : 'final'}
                  style={{ left: `${(i / LAST) * 100}%` }}
                  data-dead={s?.dead || undefined}
                  data-done={i <= index || undefined}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={LAST}
              step={1}
              value={index}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Design step"
              aria-valuetext={step ? `Step ${index + 1} of ${steps.length}` : 'Today'}
            />
          </div>
        </div>
      </section>

    </div>
  )
}
