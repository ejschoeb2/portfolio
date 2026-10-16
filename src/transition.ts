import { createContext, useContext } from 'react'
import type { Project } from './content/projects'

export type Transitions = {
  /** Pointer is resting on a card's Learn more button: start (or resume) filling it. */
  hoverStart: (project: Project, card: HTMLElement) => void
  /** Pointer left before the button finished filling: empty it again. */
  hoverEnd: () => void
  /** Click, tap or Enter: open the project straight away. */
  open: (project: Project, card: HTMLElement) => void
  goHome: () => void
  /** True while a Learn more button is filling. */
  flying: boolean
}

export const TransitionContext = createContext<Transitions | null>(null)

export function useTransitions() {
  const value = useContext(TransitionContext)
  if (!value) throw new Error('useTransitions must be used inside <App>')
  return value
}
