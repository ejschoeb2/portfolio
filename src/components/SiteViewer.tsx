import type { Site } from '../content/projects'

/** A window onto a project's website that scrolls without leaving the page. */
export function SiteViewer({ site, title }: { site: Site; title: string }) {
  return (
    <div className="viewer" tabIndex={0} aria-label={`${title} website`}>
      {site.embeddable ? (
        <iframe src={site.url} title={`${title} website`} loading="lazy" />
      ) : (
        <img src={site.capture} alt={`Full-page capture of ${site.label}`} loading="lazy" />
      )}
    </div>
  )
}
