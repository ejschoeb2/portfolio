import { site } from '../content/site'
import { Arrow } from './Arrow'

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <p className="footer__label">Contact</p>
      <h2 className="footer__title">Get in touch</h2>
      <a className="footer__email" href={`mailto:${site.email}`}>
        {site.email}
        <Arrow direction="out" />
      </a>
      <div className="footer__row">
        <a href={site.phoneHref}>{site.phone}</a>
        <a href={site.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={site.instagram} target="_blank" rel="noreferrer">
          Instagram
        </a>
        <span>{site.location}</span>
        <span>© {new Date().getFullYear()} {site.name}</span>
      </div>
    </footer>
  )
}
