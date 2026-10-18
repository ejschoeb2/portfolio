import { useState } from 'react'
import type { Build } from '../content/projects'
import { Arrow } from './Arrow'
import { SiteViewer } from './SiteViewer'

/** Each thing built under a project, one site at a time (a still capture that
 *  links to the real site), with a box in the corner that says what it is and
 *  steps to the next. */
export function Builds({ builds }: { builds: Build[] }) {
  const [index, setIndex] = useState(0)
  const count = builds.length
  const build = builds[index]
  // One arrow: on to the next, or from the last back to the first.
  const last = index === count - 1
  const to = last ? 0 : index + 1

  return (
    <section className="builds" aria-label="What I’ve built">
      <div className="builds__stage">
        {/* All kept loaded, so switching back is instant. */}
        {builds.map((b, i) => (
          <div key={b.name} className="builds__site" data-shown={i === index || undefined} inert={i !== index}>
            <SiteViewer site={b.site} title={b.name} />
          </div>
        ))}

        <aside className="builds__box" aria-live="polite">
          <div className="builds__top">
            <p className="builds__count">
              {index + 1} / {count}
            </p>
            {count > 1 && (
              <button
                type="button"
                className="panels__nav"
                aria-label={`Show ${builds[to].name}`}
                onClick={() => setIndex(to)}
              >
                <Arrow direction={last ? 'left' : 'right'} />
              </button>
            )}
          </div>
          <h2 className="builds__name">{build.name}</h2>
          {build.summary.map((paragraph) => (
            <p key={paragraph} className="builds__about">
              {paragraph}
            </p>
          ))}
        </aside>
      </div>
    </section>
  )
}
