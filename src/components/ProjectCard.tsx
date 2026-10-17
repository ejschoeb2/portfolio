import { useRef, type MouseEvent, type PointerEvent } from 'react'
import { projectNumber, type Project } from '../content/projects'
import { projectPath } from '../lib/router'
import { useTransitions } from '../transition'
import { Arrow } from './Arrow'
import { DrawingSheet } from './DrawingSheet'

type Props = {
  project: Project
  /** False while the card is not the one in focus. */
  enabled?: boolean
  heading?: 'h1' | 'h2' | 'h3'
}

function LearnLabel() {
  return (
    <span className="learn__label">
      Learn more
      <Arrow />
    </span>
  )
}

export function ProjectCard({ project, enabled = true, heading: Heading = 'h3' }: Props) {
  const root = useRef<HTMLElement>(null)
  const { hoverStart, hoverEnd, open } = useTransitions()
  const number = projectNumber(project)
  const { media } = project

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && root.current) hoverStart(project, root.current)
  }
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') hoverEnd()
  }
  const onClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !root.current) return
    e.preventDefault()
    open(project, root.current)
  }
  // The card in focus opens its project wherever it is clicked.
  const onCardClick = (e: MouseEvent) => {
    if (!root.current) return
    if (e.metaKey || e.ctrlKey) return void window.open(projectPath(project.slug), '_blank')
    open(project, root.current)
  }

  return (
    <article
      ref={root}
      className="card"
      data-card={project.slug}
      data-media={media?.kind ?? 'sheet'}
      data-enabled={enabled}
      onClick={enabled ? onCardClick : undefined}
    >
      <div className="card__inner">
        {media?.kind === 'photo' && (
          <img
            className="card__photo"
            src={media.src}
            alt={media.alt}
            style={{ objectPosition: media.position }}
            draggable={false}
          />
        )}
        {media?.kind === 'screen' && (
          <div className="card__screen">
            <img
              src={media.src}
              alt={media.alt}
              style={{ objectPosition: media.position }}
              draggable={false}
            />
          </div>
        )}
        {!media && <DrawingSheet number={number} />}

        <div className="card__bottom">
          <div className="card__text">
            <Heading className="card__title">{project.title}</Heading>
            <p className="card__blurb">{project.blurb}</p>
          </div>

          <a
            className="learn"
            href={projectPath(project.slug)}
            tabIndex={enabled ? 0 : -1}
            aria-label={`Learn more about ${project.title}`}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            onClick={onClick}
          >
            <LearnLabel />
            <span className="learn__fill" aria-hidden="true">
              <LearnLabel />
            </span>
          </a>
        </div>
      </div>
    </article>
  )
}
