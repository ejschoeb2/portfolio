import { projectBySlug } from '../content/projects'

export type Route = { name: 'home' } | { name: 'project'; slug: string }

export function parseRoute(pathname: string): Route {
  const match = pathname.match(/^\/projects\/([^/]+)\/?$/)
  if (match && projectBySlug(match[1])) return { name: 'project', slug: match[1] }
  return { name: 'home' }
}

export const projectPath = (slug: string) => `/projects/${slug}`
