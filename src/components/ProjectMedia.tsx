import { projectNumber, type Project } from '../content/projects'
import { DrawingSheet } from './DrawingSheet'

/** A project's picture on its own: the main image on its page, and the part of
 *  a card that flies there when the card is opened. */
export function ProjectMedia({ project }: { project: Project }) {
  const { media } = project
  return (
    <div className="media" data-kind={media?.kind ?? 'sheet'}>
      {media ? (
        <img
          src={media.src}
          alt={media.alt}
          style={{ objectPosition: media.position }}
          draggable={false}
        />
      ) : (
        <DrawingSheet number={projectNumber(project)} />
      )}
    </div>
  )
}
