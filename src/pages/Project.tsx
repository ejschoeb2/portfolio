import { Fragment, lazy, Suspense, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { Arrow } from '../components/Arrow'
import { Builds } from '../components/Builds'
import { DrawingSheet } from '../components/DrawingSheet'
import { Linkage } from '../components/Linkage'
import { Panels } from '../components/Panels'
import { ProjectMedia } from '../components/ProjectMedia'
import { SiteViewer } from '../components/SiteViewer'
import { Slides } from '../components/Slides'
import {
  projectNumber,
  type Chapter,
  type Project,
  type StoryImage,
  type Table,
} from '../content/projects'
import { useTransitions } from '../transition'

const order = (i: number) => ({ '--i': i }) as CSSProperties

/** **figures** in story text, picked out in bold blue. */
const rich = (text: string): ReactNode =>
  text.split(/(\*\*[^*]+\*\*)/).map((bit, i) =>
    bit.startsWith('**') ? <strong key={i}>{bit.slice(2, -2)}</strong> : <Fragment key={i}>{bit}</Fragment>,
  )

// The kitchen bin's page (and its 3D model) only loads when someone opens it.
const KitchenBin = lazy(() => import('../components/bin/KitchenBin').then((m) => ({ default: m.KitchenBin })))
const BinHero = lazy(() => import('../components/bin/BinHero').then((m) => ({ default: m.BinHero })))

export function ProjectPage({ project }: { project: Project }) {
  const number = projectNumber(project)
  const { goHome } = useTransitions()
  const web = project.layout === 'web'
  const hasBody =
    project.slug === 'kitchen-bin' ||
    project.story ||
    project.stats ||
    project.sections.length > 0 ||
    (project.site && !web) ||
    project.gallery
  const summary = (
    <p className="project__summary rise" style={order(2)}>
      {project.intro ?? project.lede}
    </p>
  )
  const back = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    goHome()
  }

  return (
    <main className="project">
      <a className="pill project__back rise" href="/" onClick={back}>
        <Arrow direction="left" />
        All projects
      </a>

      <header className="project__intro" data-layout={web ? 'web' : undefined}>
        <div className="project__intro-text">
          <h1 className="project__title rise" style={order(1)}>
            {project.title}
          </h1>
          {!web && summary}
        </div>

        {web ? (
          <div className="project__intro-side">
            {summary}
            {project.open && (
              <a
                className="build__link rise"
                style={order(3)}
                href={project.open.url}
                target="_blank"
                rel="noreferrer"
              >
                Open in a new tab
                <Arrow direction="out" />
              </a>
            )}
          </div>
        ) : (
          <div className="project__media rise" style={order(2)}>
            <ProjectMedia project={project} />
            {project.open && (
              <a
                className="project__open"
                href={project.open.url}
                target="_blank"
                rel="noreferrer"
                aria-label={project.open.label}
              >
                <span className="project__open-label">
                  Click to open
                  <Arrow direction="out" />
                </span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Web projects: the site itself, full width, straight under the title. */}
      {web && project.site && (
        <div className="project__site rise" style={order(3)}>
          <SiteViewer site={project.site} title={project.title} />
        </div>
      )}

      {/* The kitchen bin's 3D model, full width. */}
      {project.slug === 'kitchen-bin' && (
        <div className="project__site rise" style={order(3)}>
          <div className="project__model">
            <Suspense fallback={<ProjectMedia project={project} />}>
              <BinHero />
            </Suspense>
          </div>
        </div>
      )}

      {/* Or each thing built, one site at a time, full width. */}
      {project.builds && <Builds builds={project.builds} />}

      {hasBody && (
        <div className="project__body">
          {project.slug === 'kitchen-bin' ? (
            <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
              <KitchenBin />
            </Suspense>
          ) : project.story ? (
            <section className="story" aria-label="The story">
              {project.story.map((chapter, i) => (
                <StoryChapter key={chapter.label} chapter={chapter} number={i + 1} />
              ))}
            </section>
          ) : (
            <>
              {project.stats && (
                <ul className="stats">
                  {project.stats.map((stat) => (
                    <li key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </li>
                  ))}
                </ul>
              )}

              {project.sections.map((section, i) => (
                <section key={section.heading} className="block">
                  <h2>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {section.heading}
                  </h2>
                  <div>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}

              {project.site && !web && <SiteViewer site={project.site} title={project.title} />}

              {project.gallery && (
                <div className="gallery" data-count={project.gallery.length}>
                  {project.gallery.map((item, i) => (
                    <figure key={item.label}>
                      <div className="gallery__tile">
                        {item.src ? (
                          <img src={item.src} alt={item.alt ?? item.label} loading="lazy" />
                        ) : (
                          <DrawingSheet number={`${number}-${i + 1}`} label={item.label} />
                        )}
                      </div>
                      <figcaption>{item.label}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  )
}

function StoryChapter({ chapter, number }: { chapter: Chapter; number: number }) {
  const { media } = chapter

  return (
    <article
      className="chapter"
      data-side={media ? (chapter.side ?? 'right') : undefined}
      data-plain={media ? undefined : true}
    >
      <div className="chapter__text">
        <p className="chapter__label">
          <span className="chapter__number">{String(number).padStart(2, '0')}</span>
          <span className="chapter__date">{chapter.label}</span>
        </p>
        {chapter.heading && <h3 className="chapter__heading">{chapter.heading}</h3>}
        {chapter.body.map((paragraph) => (
          <p key={paragraph} className="chapter__body">
            {rich(paragraph)}
          </p>
        ))}
        {chapter.facts && (
          <dl className="chapter__facts">
            {chapter.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {chapter.stats && (
          <ul className="chapter__stats">
            {chapter.stats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {media && (
        <div className="chapter__media">
          {media.kind === 'image' && (
            <figure className="shot" data-small={media.small || undefined}>
              <img src={media.image.src} alt={media.image.alt} loading="lazy" />
              {media.image.caption && <figcaption>{media.image.caption}</figcaption>}
            </figure>
          )}
          {media.kind === 'slides' && <Slides images={media.images} ratio={media.ratio} />}
          {media.kind === 'table' && <DataTable table={media.table} />}
          {media.kind === 'stack' && <Stack images={media.images} />}
          {media.kind === 'linkage' && <Linkage />}
          {media.kind === 'panels' && (
            <Panels
              panels={media.panels.map((panel) => ({
                caption: panel.caption,
                content: panel.kind === 'table' ? <DataTable table={panel.table} /> : <Linkage />,
              }))}
            />
          )}
        </div>
      )}

      {chapter.table && (
        <div className="chapter__wide">
          <DataTable table={chapter.table} />
        </div>
      )}
    </article>
  )
}

function DataTable({ table }: { table: Table }) {
  const lit = (i: number) => (i === table.highlight ? 'is-lit' : undefined)
  // Words read better in the body font; figures stay in mono.
  const kind = (cell: string, i: number) =>
    [lit(i), /[a-z]{4,}/i.test(cell) ? 'is-text' : undefined].filter(Boolean).join(' ') || undefined
  return (
    <figure className="data">
      {/* A wide table scrolls sideways on small screens; up and down still moves the page. */}
      <div className="data__scroll" data-lenis-prevent-horizontal>
        <table>
          <thead>
            <tr>
              {table.head.map((cell, i) => (
                <th key={cell} className={lit(i)} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className={kind(cell, i)}>
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

/** Sheets laid over one another; the one under the pointer comes to the top. */
function Stack({ images }: { images: StoryImage[] }) {
  return (
    <div className="stack">
      {images.map((image, i) => (
        <a
          key={image.src}
          className="stack__sheet"
          href={image.src}
          target="_blank"
          rel="noreferrer"
          style={{ '--i': i } as CSSProperties}
        >
          <span className="stack__label">{image.caption}</span>
          <img src={image.src} alt={image.alt} loading="lazy" />
        </a>
      ))}
    </div>
  )
}
