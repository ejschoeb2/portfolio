import { useEffect, useRef, type MouseEvent, type PointerEvent, type TransitionEvent } from 'react'
import { Arrow } from '../components/Arrow'
import { Carousel } from '../components/Carousel'
import { LinkedInIcon, MailIcon } from '../components/Icons'
import { site } from '../content/site'
import { glideTo, reducedMotion } from '../lib/scroll'

const toProjects = (e: MouseEvent) => {
  e.preventDefault()
  glideTo('#projects', 1.4)
}

export function Home({ returnSlug }: { returnSlug: string | null }) {
  const hero = useRef<HTMLElement>(null)

  // Fade the hero out over the first part of the scroll down the page.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const out = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.45)))
      hero.current?.style.setProperty('--out', out.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <main>
      <section className="hero" ref={hero}>
        <div className="hero__portrait">
          <img src="/images/portrait.webp" alt="Ethan Schoeb" draggable={false} />
        </div>

        <div className="hero__copy">
          <h1 className="hero__title">
            <span className="hero__line">
              <span>Welcome to my</span>
            </span>
            <span className="hero__line">
              <Portfolio />
            </span>
          </h1>

          <div className="hero__contact">
            <a href={`mailto:${site.email}`}>
              <MailIcon />
              {site.email}
            </a>
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              <LinkedInIcon />
              {site.linkedinUser}
            </a>
          </div>

          <div className="hero__about">
            <p>
              I’m Ethan Schoeb, a second-year mechanical engineering student at the University of
              Bath and a brakes engineer on Team Bath Racing Electric. I’m looking for a{' '}
              <strong>mechanical design engineering placement</strong> for 2027.
            </p>
            <ToProjects />
          </div>
        </div>
      </section>

      <Carousel startAt={returnSlug} />
    </main>
  )
}

/** A red copy of the word on top shows through in a circle round the pointer. */
function Portfolio() {
  const follow = (e: PointerEvent<HTMLSpanElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - box.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - box.top}px`)
  }
  return (
    <span className="hero__accent" onPointerEnter={follow} onPointerMove={follow}>
      portfolio
      <span className="hero__accent-red" aria-hidden="true">
        portfolio
      </span>
    </span>
  )
}

/** Fills from blue to red while hovered; once full it takes you down to the projects. */
function ToProjects() {
  const fill = useRef<HTMLSpanElement>(null)
  const onFilled = (e: TransitionEvent<HTMLAnchorElement>) => {
    if (e.target !== fill.current || e.propertyName !== 'transform') return
    if (e.currentTarget.matches(':hover')) glideTo('#projects', 1.4)
  }
  return (
    <a className="to-projects" href="#projects" onClick={toProjects} onTransitionEnd={onFilled}>
      {!reducedMotion && <span className="to-projects__fill" ref={fill} aria-hidden="true" />}
      <span className="to-projects__label">
        What I’ve been up to
        <Arrow direction="down" />
      </span>
    </a>
  )
}
