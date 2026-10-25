import { lazy, Suspense, useState, type CSSProperties } from 'react'
import type { Project } from '../content/projects'
import { reducedMotion } from '../lib/scroll'

// The 3D model (and three.js) only loads once someone asks to see it.
const LauncherModel = lazy(() => import('./launcher/LauncherModel').then((m) => ({ default: m.LauncherModel })))

/** The finished thing at the top of a page: a clip of it working beside photos,
 *  and a button that swaps them for the 3D model. */
export function Showcase({ showcase }: { showcase: NonNullable<Project['showcase']> }) {
  const [model, setModel] = useState(false)
  const { video, photos } = showcase

  return (
    <section className="showcase" aria-label="The finished design" style={{ '--photos': photos.length } as CSSProperties}>
      {model ? (
        <div className="showcase__model">
          <Suspense fallback={<div className="l3d" />}>
            <LauncherModel />
          </Suspense>
        </div>
      ) : (
        <div className="showcase__row">
          <figure className="showcase__video">
            <video
              src={video.src}
              poster={video.poster}
              aria-label={video.alt}
              autoPlay={!reducedMotion}
              controls={reducedMotion}
              muted
              loop
              playsInline
            />
          </figure>
          {photos.map((photo) => (
            <a key={photo.src} className="showcase__photo" href={photo.src} target="_blank" rel="noreferrer">
              <img src={photo.src} alt={photo.alt} />
            </a>
          ))}
        </div>
      )}
      <div className="showcase__foot">
        <button type="button" className="showcase__toggle" onClick={() => setModel(!model)} aria-pressed={model}>
          {model ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 16 5-5 4 4 3-3 6 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
              <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
            </svg>
          )}
          {model ? 'Back to the photos' : 'See it in 3D'}
        </button>
      </div>
    </section>
  )
}
