import '../../styles/timeline.css'
import { BinViewer } from './BinViewer'
import { SCENES } from './scenes'
import type { SceneState } from './types'

// The finished design, as the kitchen bin page's main picture. Drag to turn it.
const finished: SceneState = { ...SCENES.final, hotspots: undefined, labels: undefined }
const none: string[] = []

export function BinHero() {
  return (
    <>
      <BinViewer scene={finished} flash={none} pageScroll />
      <p className="bin3d__hint" aria-hidden="true">
        Drag to turn
      </p>
    </>
  )
}
