import { useState } from 'react'
import type { Build } from '../content/projects'
import { Arrow } from './Arrow'
import { SiteViewer } from './SiteViewer'

/** Each thing built under a project, one site at a time, with a box in the
 *  corner that says what it is and steps to the next. */
export function Builds({ builds }: { builds: Build[] }) {
  const [index, setIndex] = useState(0)
  const count = builds.length
  const build = builds[index]
  const go = (i: number) => setIndex((i + count) % count)

  return (
    <section className="builds" aria-label="What I’ve built">
      <div className="builds__stage">
        {/* All kept loaded, so switching back is instant and keeps its scroll. */}
        {builds.map((b, i) => (
          <div key={b.name} className="builds__site" data-shown={i === index || undefined} inert={i !== index}>
            <SiteViewer site={b.site} title={b.name} />
          </div>
        ))}

        <aside className="builds__box" aria-live="polite">
          <p className="builds__count">
            {index + 1} / {count}
          </p>
          <h2 className="builds__name">{build.name}</h2>
          {build.summary.map((paragraph) => (
            <p key={paragraph} className="builds__about">
              {paragraph}
            </p>
          ))}
          {count > 1 && (
            <div className="builds__nav">
              <button type="button" className="panels__nav" aria-label="Previous" onClick={() => go(index - 1)}>
                <Arrow direction="left" />
              </button>
              <button type="button" className="builds__next" onClick={() => go(index + 1)}>
                {builds[(index + 1) % count].name}
                <Arrow />
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
