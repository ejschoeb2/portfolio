// Shared types for the kitchen-bin timeline: what each step shows in 3D.

export type V3 = [number, number, number]

/** How a part looks in a step. 'new' = what this step adds (blue), 'dead' = dropped (red),
 *  'ghost' = see-through outline so you can see inside. */
export type Look = 'base' | 'new' | 'dead' | 'ghost'

export type ShowEntry = Look | { look?: Look; off?: V3 }

export type Label = {
  /** Point in the bin's own frame (moves with roll-out and height), or 'world' for the room. */
  at: V3
  text: string
  frame?: 'bin' | 'top' | 'world'
}

export type Hotspot = { id: string; at: V3; title: string; text: string }

export type AnimName =
  | 'oldBinLid'
  | 'bagSection'
  | 'pedal'
  | 'footSensor'
  | 'rollCycle'
  | 'butterfly'
  | 'lidCycle'
  | 'leverClose'
  | 'latch'
  | 'motorRelease'
  | 'hallPulse'
  | 'tiltCycle'
  | 'lidSensor'
  | 'sheetThickness'
  | 'spin2d'
  | 'none'

export type SceneState = {
  show: Record<string, ShowEntry>
  /** Camera position and target, world mm. */
  cam: [V3, V3]
  /** Rim height above the floor (mm). The final design is 714. */
  rim?: number
  /** Bottom of the plain body box, mm above the floor, and its top relative to the rim. */
  box?: { bottom: number; top: number }
  /** Static poses (overridden by an animation while one runs). */
  roll?: number
  lid?: number
  tilt?: number
  anim?: AnimName
  labels?: Label[]
  hotspots?: Hotspot[]
}
