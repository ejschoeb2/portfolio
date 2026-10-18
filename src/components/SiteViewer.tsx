import type { Site } from '../content/projects'
import { Arrow } from './Arrow'

/** A window onto a project's website that scrolls without leaving the page.
 *  A site that can't be embedded is shown as a capture; clicking it opens the
 *  real site in a new tab. */
export function SiteViewer({ site, title }: { site: Site; title: string }) {
  if (site.embeddable) {
    return (
      <div className="viewer" tabIndex={0} aria-label={`${title} website`}>
        <iframe src={site.url} title={`${title} website`} loading="lazy" />
      </div>
    )
  }

  return (
    <div className="viewer">
      <a
        className="viewer__link"
        href={site.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${site.label} (opens in a new tab)`}
      >
        {/* Held in the middle of the window while the capture scrolls under it. */}
        <span className="viewer__visit" aria-hidden="true">
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
