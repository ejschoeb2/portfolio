import type { Site } from '../content/projects'
import { Arrow } from './Arrow'

/** A window onto a project's website. An embeddable site scrolls inside the
 *  page; otherwise it is a still of the top of the site, greyed and blurred,
 *  and clicking it opens the real site in a new tab. */
export function SiteViewer({ site, title }: { site: Site; title: string }) {
  if (site.embeddable) {
    return (
      <div className="viewer" tabIndex={0} aria-label={`${title} website`}>
        <iframe src={site.url} title={`${title} website`} loading="lazy" />
      </div>
    )
  }

  return (
    <div className="viewer viewer--still">
      <a
        className="viewer__link"
        href={site.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${site.label} (opens in a new tab)`}
      >
        {/* Laid over the window and held there while the capture scrolls under it. */}
        <span className="viewer__veil" aria-hidden="true">
          <span className="project__open-label">
            Click to visit
            <Arrow direction="out" />
          </span>
        </span>
        <img src={site.capture} alt={`Full-page capture of ${site.label}`} loading="lazy" />
      </a>
    </div>
  )
}
