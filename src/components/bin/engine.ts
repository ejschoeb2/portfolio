// The kitchen bin in 3D: the real Inventor parts (public/models/bin.glb, assembly frame, mm)
// plus simple shapes for the early concepts. Each timeline step hands over a SceneState;
// parts fade, tint and move towards it, and the camera glides to the step's view.

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { latchAt, latchClock, LATCHED_PIN } from './latchPath'
import type { AnimName, Hotspot, Label, Look, SceneState, ShowEntry, V3 } from './types'

const BLUE = new THREE.Color('#2a5fe0')
const RED = new THREE.Color('#e0452a')
const INK = new THREE.Color('#0c1424')

type MatSpec = { color: string; metal?: number; rough?: number; opacity?: number; edge?: number }

const MATS: Record<string, MatSpec> = {
  print: { color: '#f3f5f9', rough: 0.85 },
  printDark: { color: '#dde3ec', rough: 0.85 },
  wood: { color: '#dcbf93', rough: 0.9 },
  concept: { color: '#eef2f9', rough: 0.9 },
  acm: { color: '#cfd4db', metal: 0.55, rough: 0.38 },
  alu: { color: '#b8bfc9', metal: 0.65, rough: 0.35 },
  steel: { color: '#8e97a3', metal: 0.75, rough: 0.35 },
  acrylic: { color: '#3a4459', rough: 0.15, opacity: 0.7 },
  acrylicClear: { color: '#d6e3f7', rough: 0.15, opacity: 0.45 },
  black: { color: '#1b1f27', rough: 0.4 },
  tpu: { color: '#2c3038', rough: 0.9 },
  motor: { color: '#a3abb6', metal: 0.6, rough: 0.4 },
  pcb: { color: '#1f6a43', rough: 0.6 },
  silicone: { color: '#eaf1ff', rough: 0.5, opacity: 0.85 },
  oldBin: { color: '#d9dde3', metal: 0.35, rough: 0.45 },
  worktop: { color: '#e9e4dc', rough: 0.8 },
  battery: { color: '#3d4452', rough: 0.6 },
  blue: { color: '#2a5fe0', rough: 0.5 },
  beam: { color: '#2a5fe0', rough: 1, opacity: 0.16, edge: 0 },
}

const KEY_MAT: Record<string, string> = {
  lidTop: 'acrylic', sheetD: 'acrylic', acrSheet: 'acrylic', irPanel: 'black', tof: 'pcb', hcsr04: 'pcb',
  latch: 'printDark', cuff: 'printDark', latchRod: 'steel', hingeRod: 'steel', lidCollars: 'steel', tiltCollars: 'steel',
  tiltPins: 'steel', motor: 'motor', lever: 'printDark', coupler: 'steel', motorBeam: 'steel', springs: 'steel',
  basePanel: 'acrylicClear', innerBars: 'alu', angles: 'alu', caps: 'printDark', wallFront: 'acm', wallBack: 'acm',
  wallLeft: 'acm', wallRight: 'acm', driveBracket: 'printDark', kp08Spacers: 'printDark', fit0403: 'motor',
  axleHw: 'steel', wheels: 'tpu', axle: 'steel', castorPads: 'printDark', castors: 'black', ebox: 'printDark',
  eboxLid: 'printDark', cables: 'black', batteryCover: 'printDark', battery: 'battery', b22: 'motor', pod2d: 'printDark',
  dial: 'printDark', sealLipD: 'silicone', sealLipR: 'silicone', lidHollow: 'print',
}

const LID_KEYS = new Set(['lid', 'lidTop', 'latch', 'tof', 'irPanel', 'lidHollow', 'lidV3', 'sheetD', 'acrFrame', 'acrSheet',
  'acrSpine', 'acrLatchHolder', 'hcsr04', 'conceptLid', 'magnets', 'torque'])
const TILT_KEYS = new Set(['s2', 'motor', 'lever', 'coupler', 'motorBeam', 'hingeRod', 'lidCollars', 'springs', 'latchRod',
  'b22', 'rimD_s2', 'sealLipD', 'sealLipR', 'hall'])
const FIXED_KEYS = new Set(['s3', 'tiltPins', 'tiltCollars', 'dial', 'rimD_s3', 'rimD'])
const STRETCH_KEYS = new Set(['wallFront', 'wallBack', 'wallLeft', 'wallRight', 'angles'])

function parentOf(key: string) {
  if (LID_KEYS.has(key) || key.startsWith('lid_') || key.startsWith('lidV3_')) return 'lid'
  if (key === 'cuff') return 'cuff'
  if (key === 'lever') return 'lever'
  if (TILT_KEYS.has(key) || key.startsWith('s2_') || key.startsWith('rimD_s2_')) return 'tilt'
  if (FIXED_KEYS.has(key) || key.startsWith('s3_') || key.startsWith('rimD_s3_')) return 'fixedTop'
  if (STRETCH_KEYS.has(key)) return 'stretch'
  return 'lower'
}

type Part = {
  key: string
  obj: THREE.Object3D
  meshes: THREE.Mesh[]
  mats: { m: THREE.MeshStandardMaterial; spec: MatSpec; base: THREE.Color }[]
  edges: THREE.LineBasicMaterial[]
  home: THREE.Vector3
  cur: { o: number; blue: number; red: number; ghost: number; off: THREE.Vector3 }
  tgt: { o: number; blue: number; red: number; ghost: number; off: THREE.Vector3 }
}

type Pose = { roll: number; lid: number; tilt: number; rim: number; boxBottom: number; boxTop: number; spin: number }

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}
const DEG = Math.PI / 180
// Closing lever angles (deg, from the CAD pose). Parked, it is clear of the tail tab even
// with the lid wide open; pushed to LEVER_PRESS it holds the lid just past shut, onto the latch.
const LEVER_PARK = -50
const LEVER_PRESS = 47.1
// How far the lid can be open (deg) before its tail tab meets the lever, for each lever
// angle. Found by sweeping the two CAD sections past each other.
const TAB_CONTACT: [number, number][] = [
  [-45, 80], [-40, 76.9], [-35, 73.6], [-30, 70.3], [-25, 66.9], [-20, 63.4], [-15, 59.9], [-10, 56.3], [-5, 52.6],
  [0, 48.7], [5, 44.8], [10, 40.6], [15, 36.3], [20, 31.7], [25, 26.8], [30, 21.6], [35, 15.9], [40, 9.6], [45, 2.7],
  [47.1, -0.45],
]
/** The furthest the lid can be open with the lever at `lever` degrees. */
function lidLimit(lever: number) {
  if (lever <= TAB_CONTACT[0][0]) return 90
  for (let i = 1; i < TAB_CONTACT.length; i++) {
    const [a1, l1] = TAB_CONTACT[i]
    if (lever <= a1) {
      const [a0, l0] = TAB_CONTACT[i - 1]
      return l0 + ((l1 - l0) * (lever - a0)) / (a1 - a0)
    }
  }
  return TAB_CONTACT[TAB_CONTACT.length - 1][1]
}
/** Lever angle for a push that is 0 (parked) → 1 (pressing the lid onto the latch). */
const leverAt = (push: number) => LEVER_PARK + (LEVER_PRESS - LEVER_PARK) * push
// the run shown at the top of the page, in seconds
const DEMO_END = 15
const DEMO_PHASES: [number, string][] = [
  [1.9, 'A hand over the sensor'],
  [4.0, 'It rolls out'],
  [4.6, 'The motor pushes to release the latch'],
  [5.8, 'The springs open the lid'],
  [9.4, 'It waits for the rubbish'],
  [12.2, 'The motor closes the lid'],
  [DEMO_END, 'And it rolls back in'],
]

/** 0 → 1 → 0 over `period`, holding at each end. */
function wave(t: number, period: number, rise = 0.3, hold = 0.2) {
  const p = (t % period) / period
  if (p < rise) return ease(p / rise)
  if (p < rise + hold) return 1
  if (p < 2 * rise + hold) return 1 - ease((p - rise - hold) / rise)
  return 0
}

export type EngineEvents = { onReady?: () => void; onError?: (e: unknown) => void }

export class BinEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private parts = new Map<string, Part>()
  private groups: Record<string, THREE.Object3D> = {}
  private overlay: HTMLElement
  private host: HTMLElement
  private labels: { el: HTMLElement; anchor: THREE.Object3D }[] = []
  private hotspots: { el: HTMLElement; anchor: THREE.Object3D }[] = []
  private state: SceneState | null = null
  private pose: Pose = { roll: 0, lid: 0, tilt: 0, rim: 714, boxBottom: 0, boxTop: 0, spin: 0 }
  private camFrom = { p: new THREE.Vector3(), t: new THREE.Vector3() }
  private camTo = { p: new THREE.Vector3(), t: new THREE.Vector3() }
  private camT = 1
  private userMoved = false
  private stepStart = 0
  private animBlend = 0
  private last = 0
  private raf = 0
  private running = false
  private visible = true
  private flashKeys: string[] = []
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  private sectionLabel: HTMLElement | null = null
  private ro: ResizeObserver
  private io: IntersectionObserver
  private disposed = false
  private demoStart: number | null = null
  private demoPhase: string | null = null
  private onPhase: ((phase: string | null) => void) | null = null
  private names: Record<string, string> | null = null
  private pointer: THREE.Vector2 | null = null
  private pointerMoved = false
  private hoverKey: string | null = null
  private tip: HTMLElement | null = null
  private raycaster = new THREE.Raycaster()

  constructor(host: HTMLElement, overlay: HTMLElement, ev: EngineEvents = {}) {
    this.host = host
    this.overlay = overlay
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    host.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(32, 1, 10, 20000)
    this.camera.position.set(-1600, 420, 760)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 120
    this.controls.maxDistance = 5000
    this.controls.enablePan = true
    this.controls.zoomToCursor = true
    this.controls.addEventListener('start', () => {
      this.userMoved = true
      this.camT = 1
    })

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#c9d3e6', 1.9))
    const key = new THREE.DirectionalLight('#ffffff', 2.2)
    key.position.set(-900, 1400, 900)
    this.scene.add(key)
    const fill = new THREE.DirectionalLight('#dfe8ff', 0.9)
    fill.position.set(800, 300, -1200)
    this.scene.add(fill)

    this.buildGroups()
    this.buildEnvironment()
    this.buildConcepts()

    const canvas = this.renderer.domElement
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    // a zoom or turn moves the parts under a still pointer
    this.controls.addEventListener('change', () => (this.pointerMoved = true))

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting))
    this.io.observe(host)
    this.resize()

    new GLTFLoader().load(
      '/models/bin.glb',
      (gltf) => {
        if (this.disposed) return
        gltf.scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh && o.name) this.addMesh(o.name, (o as THREE.Mesh).geometry)
        })
        // Before the tilt-up top (step 26) the D-shaped rim was one part: the upper layer,
        // stretched down over the lower one (its top face stays at y 0).
        const upper = this.parts.get('rimD_s2')?.meshes[0]
        if (upper) this.addMesh('rimD', upper.geometry.clone().scale(1, 2, 1))
        if (this.state) this.applyState(this.state, true)
        ev.onReady?.()
      },
      undefined,
      (e) => ev.onError?.(e),
    )
    this.start()
  }

  // ---------------------------------------------------------------- scene graph

  private buildGroups() {
    const g = (name: string, parent: THREE.Object3D, pos?: V3) => {
      const o = new THREE.Group()
      o.name = name
      if (pos) o.position.set(...pos)
      parent.add(o)
      this.groups[name] = o
      return o
    }
    g('env', this.scene)
    const bin = g('bin', this.scene)
    g('lower', bin)
    // walls and corner angles stretch about their bottom edge (y -654) when the rim height changes
    const sp = g('stretchPivot', bin, [0, -654, 0])
    g('stretch', sp, [0, 654, 0])
    g('concept', bin)
    const top = g('top', bin)
    g('fixedTop', top)
    const tp = g('tiltPivot', top, [36, -40, 0])
    const ti = g('tilt', tp, [-36, 40, 0])
    const lp = g('lidPivot', ti, [14, 9, 0])
    g('lid', lp, [-14, -9, 0])
    // the closing lever turns with the motor shaft
    const vp = g('leverPivot', ti, [26.5, -13, 0])
    g('lever', vp, [-26.5, 13, 0])
    const cp = g('cuffPivot', ti, [0, -21.05, -220])
    g('cuff', cp, [0, 21.05, 220])
    const fl = g('flapLPivot', top, [0, 0, 0])
    g('flapL', fl)
    const fr = g('flapRPivot', top, [0, 0, -440])
    g('flapR', fr, [0, 0, 440])
    g('oldBin', this.groups.env)
  }

  private makePart(key: string, obj: THREE.Object3D, spec: MatSpec, parent: string) {
    const mats: Part['mats'] = []
    const edges: THREE.LineBasicMaterial[] = []
    const meshes: THREE.Mesh[] = []
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
    })
    for (const mesh of meshes) {
      const s = (mesh.userData.spec as MatSpec) ?? spec
      mesh.userData.part = key
      const m = new THREE.MeshStandardMaterial({
        color: s.color,
        metalness: s.metal ?? 0,
        roughness: s.rough ?? 0.8,
        flatShading: true,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
      mesh.material = m
      mats.push({ m, spec: s, base: new THREE.Color(s.color) })
      if ((s.edge ?? 1) > 0 && !mesh.userData.noEdges) {
        const em = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 })
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), em)
        mesh.add(lines)
        edges.push(em)
      }
    }
    obj.visible = false
    this.groups[parent].add(obj)
    const part: Part = {
      key,
      obj,
      meshes,
      mats,
      edges,
      home: obj.position.clone(),
      cur: { o: 0, blue: 0, red: 0, ghost: 0, off: new THREE.Vector3() },
      tgt: { o: 0, blue: 0, red: 0, ghost: 0, off: new THREE.Vector3() },
    }
    this.parts.set(key, part)
    return part
  }

  private addMesh(key: string, geometry: THREE.BufferGeometry) {
    const mesh = new THREE.Mesh(geometry)
    const holder = new THREE.Group()
    holder.add(mesh)
    this.makePart(key, holder, MATS[KEY_MAT[key] ?? 'print'], parentOf(key))
  }

  /** A simple shape for the concept steps, built in the assembly frame (mm). */
  private shape(key: string, parent: string, build: (g: THREE.Group) => void, spec: MatSpec = MATS.concept) {
    const g = new THREE.Group()
    build(g)
    return this.makePart(key, g, spec, parent)
  }

  private buildEnvironment() {
    const env = this.groups.env
    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: '#f4f6fa', roughness: 1 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -714.5
    env.add(floor)
    const grid = new THREE.GridHelper(4000, 40, '#d6dfef', '#e4e9f3')
    grid.position.set(-200, -714, -220)
    env.add(grid)
    // the space under the worktop: 870 high, 700 deep (wall to worktop edge), 460 wide
    this.shape('space', 'env', (g) => {
      const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(700, 870, 460))
      const line = new THREE.LineSegments(geo, new THREE.LineDashedMaterial({ color: '#2a5fe0', dashSize: 14, gapSize: 10 }))
      line.computeLineDistances()
      line.position.set(-70, -714 + 435, -220)
      g.add(line)
      const wall = new THREE.Mesh(new THREE.BoxGeometry(20, 1100, 1400))
      wall.position.set(290, -714 + 550, -220)
      wall.userData.spec = MATS.worktop
      g.add(wall)
    }, MATS.worktop)
    this.shape('worktop', 'env', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(720, 32, 1400))
      m.position.set(-70, 156 + 16, -220)
      g.add(m)
    }, MATS.worktop)

    // our old bin: an Addis 50 L pedal bin, 580 H × 330 D × 420 W, stowed at the front
    const old = this.groups.oldBin
    this.shape('oldBin', 'oldBin', (g) => {
      const body = new THREE.Mesh(new RoundedBoxGeometry(330, 560, 420, 4, 24))
      body.position.set(-235, -714 + 280, -220)
      g.add(body)
      const pedal = new THREE.Mesh(new RoundedBoxGeometry(40, 10, 150, 2, 4))
      pedal.position.set(-410, -714 + 30, -220)
      pedal.userData.spec = MATS.black
      g.add(pedal)
      const lidPivot = new THREE.Group()
      lidPivot.name = 'oldLidPivot'
      lidPivot.position.set(-70, -714 + 560, -220)
      const lid = new THREE.Mesh(new RoundedBoxGeometry(330, 20, 420, 4, 10))
      lid.position.set(-165, 10, 0)
      lidPivot.add(lid)
      g.add(lidPivot)
    }, MATS.oldBin)
    void old
  }

  private buildConcepts() {
    // plain body box, resized every frame from the pose
    this.shape('box', 'concept', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
      m.name = 'boxMesh'
      g.add(m)
    }, MATS.wood)
    this.shape('ballast', 'concept', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(360, 30, 400))
      m.position.set(-200, -714 + 95, -220)
      g.add(m)
    }, MATS.black)
    this.shape('windowC', 'top', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(4, 40, 120))
      m.position.set(-402, -90, -220)
      g.add(m)
    }, MATS.black)
    this.shape('handleC', 'concept', (g) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 120, 16))
      m.rotation.x = Math.PI / 2
      m.position.set(-200, -714 + 420, 18)
      g.add(m)
    }, MATS.black)
    // flat plywood lid hinged at the back
    this.shape('conceptLid', 'lid', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(400, 9, 440))
      m.position.set(-200, 4.5, -220)
      g.add(m)
    }, MATS.wood)
    // butterfly flaps, hinged along the two side edges
    this.shape('flapL', 'flapL', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(400, 9, 220))
      m.position.set(-200, 4.5, -110)
      g.add(m)
    }, MATS.wood)
    this.shape('flapR', 'flapR', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(400, 9, 220))
      m.position.set(-200, 4.5, -330)
      g.add(m)
    }, MATS.wood)
    // pedal
    this.shape('pedal', 'concept', (g) => {
      const piv = new THREE.Group()
      piv.name = 'pedalPivot'
      piv.position.set(-400, -714 + 75, -220)
      const m = new THREE.Mesh(new RoundedBoxGeometry(70, 10, 160, 2, 4))
      m.position.set(-35, 0, 0)
      piv.add(m)
      g.add(piv)
    }, MATS.steel)
    // four plain castors
    this.shape('castorsC', 'concept', (g) => {
      for (const [x, z] of [[-360, -40], [-360, -400], [-40, -40], [-40, -400]]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(25, 25, 18, 24))
        w.rotation.x = Math.PI / 2
        w.position.set(x, -714 + 25, z)
        g.add(w)
        const f = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 30))
        f.position.set(x, -714 + 55, z)
        g.add(f)
      }
    }, MATS.black)
    // concept drive: one motor and a rear axle
    this.shape('driveC', 'concept', (g) => {
      for (const z of [-30, -410]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(37, 37, 20, 32))
        w.rotation.x = Math.PI / 2
        w.position.set(-50, -714 + 37, z)
        w.userData.spec = MATS.tpu
        g.add(w)
      }
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 400, 12))
      axle.rotation.x = Math.PI / 2
      axle.position.set(-50, -714 + 37, -220)
      axle.userData.spec = MATS.steel
      g.add(axle)
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(18.5, 18.5, 80, 24))
      motor.rotation.x = Math.PI / 2
      motor.position.set(-120, -714 + 40, -120)
      motor.userData.spec = MATS.motor
      g.add(motor)
      for (const z of [-40, -400]) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 16, 20))
        c.rotation.x = Math.PI / 2
        c.position.set(-350, -714 + 20, z)
        c.userData.spec = MATS.black
        g.add(c)
      }
    }, MATS.motor)
    // 2D drive: two driven wheels at mid-depth on sprung pods
    this.shape('drive2d', 'concept', (g) => {
      for (const z of [-25, -415]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 24, 32))
        w.rotation.x = Math.PI / 2
        w.position.set(-200, -714 + 50, z)
        g.add(w)
        const m = new THREE.Mesh(new THREE.CylinderGeometry(18.5, 18.5, 90, 20))
        m.rotation.x = Math.PI / 2
        m.position.set(-200, -714 + 50, z + (z > -220 ? -70 : 70))
        m.userData.spec = MATS.motor
        g.add(m)
      }
    }, MATS.tpu)
    // foot sensor near the floor, looking forwards and down
    this.shape('footSensor', 'concept', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(16, 22, 46))
      m.position.set(-406, -714 + 110, -220)
      g.add(m)
    }, MATS.pcb)
    this.shape('footBeam', 'concept', (g) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(110, 300, 32, 1, true))
      cone.rotation.z = -(Math.PI / 2 - 0.35)
      cone.position.set(-547, -655, -220)
      cone.userData.noEdges = true
      g.add(cone)
    }, MATS.beam)
    // a hand held over the lid, and the sensor's beam up to it
    this.shape('hand', 'top', (g) => {
      const skin = { color: '#f0d2bd', rough: 0.8 }
      const palm = new THREE.Mesh(new RoundedBoxGeometry(95, 22, 85, 3, 10))
      palm.userData.spec = skin
      g.add(palm)
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(new THREE.CapsuleGeometry(8, 60, 4, 10))
        f.rotation.z = Math.PI / 2
        f.position.set(-80, 0, -30 + i * 20)
        f.userData.spec = skin
        g.add(f)
      }
      const th = new THREE.Mesh(new THREE.CapsuleGeometry(9, 40, 4, 10))
      th.rotation.x = Math.PI / 2.6
      th.position.set(-10, -2, 60)
      th.userData.spec = skin
      g.add(th)
      g.position.set(-330, 140, -220)
      g.name = 'handInner'
    }, { color: '#f0d2bd', rough: 0.8 })
    this.shape('lidBeam', 'top', (g) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(28, 80, 32, 1, true))
      cone.position.set(-380, 60 + 40, -220)
      cone.rotation.z = Math.PI
      cone.userData.noEdges = true
      g.add(cone)
    }, MATS.beam)
    // the latch arm as first drawn: a 2 × 2 mm stem with the pin printed on (S15); it swings with the arm
    this.shape('cuffOld', 'cuff', (g) => {
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 9.8, 20))
      hub.rotation.z = Math.PI / 2
      hub.position.set(-379.7, -21.05, -220)
      g.add(hub)
      const stem = new THREE.Mesh(new THREE.BoxGeometry(2, 40, 2))
      stem.position.set(-380.1, 1, -219.3)
      g.add(stem)
      const head = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 3))
      head.position.set(-380.1, 21.8, -219.3)
      g.add(head)
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10, 12))
      pin.rotation.z = Math.PI / 2
      pin.position.set(-374.5, 21.8, -219.3)
      g.add(pin)
    }, MATS.printDark)
    // the Ø 2 mm steel pin through the top of the arm, which rides in the track (S18 on)
    this.shape('latchPin', 'cuff', (g) => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8, 12))
      pin.rotation.z = Math.PI / 2
      pin.position.set(-373.5, 21.8, -219.3)
      g.add(pin)
    }, MATS.steel)
    // lid-shut Hall sensor in the back rail, and the magnets in the lid above it
    this.shape('hall', 'tilt', (g) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2, 4.8))
      m.position.set(-15, -0.8, -352.6)
      g.add(m)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(12, 1.2, 8, 40))
      ring.rotation.x = Math.PI / 2
      ring.position.set(-15, 0.5, -352.6)
      ring.userData.noEdges = true
      g.add(ring)
    }, MATS.blue)
    this.shape('magnets', 'lid', (g) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6.5, 16))
      m.position.set(-15, 6 + 3.25, -352.6)
      g.add(m)
    }, MATS.steel)
    // the lid's weight and the hinge torque
    this.shape('torque', 'lid', (g) => {
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-186, 150, -220), 130, 0xe0452a, 34, 20)
      g.add(arrow)
      const curve = new THREE.EllipseCurve(14, 9, 60, 60, Math.PI * 0.45, Math.PI * 1.05, false, 0)
      const pts = curve.getPoints(30).map((p) => new THREE.Vector3(p.x, p.y, -440))
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2a5fe0 }))
      g.add(line)
    }, { color: '#e0452a', edge: 0 })
    // top view of the inside cross-section (S04)
    this.shape('section', 'top', (g) => {
      const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1))
      fill.rotation.x = -Math.PI / 2
      fill.name = 'sectionFill'
      fill.userData.spec = { color: '#2a5fe0', opacity: 0.22, edge: 0 }
      fill.userData.noEdges = true
      g.add(fill)
      const sq = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 0, -0.5), new THREE.Vector3(0.5, 0, 0.5), new THREE.Vector3(-0.5, 0, 0.5)]),
        new THREE.LineBasicMaterial({ color: 0x2a5fe0 }),
      )
      sq.name = 'sectionLine'
      g.add(sq)
      g.position.set(-200, 12, -220)
      g.name = 'sectionInner'
    }, { color: '#2a5fe0', edge: 0 })
    // height dimensions (S43)
    this.shape('dims', 'env', (g) => {
      const mat = new THREE.LineBasicMaterial({ color: 0x2a5fe0 })
      const x = -470
      const z = 30
      const pts = [new THREE.Vector3(x, -714, z), new THREE.Vector3(x, 156, z)]
      for (const y of [-714, 0, 56, 156]) pts.push(new THREE.Vector3(x - 14, y, z), new THREE.Vector3(x + 14, y, z))
      g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat))
    }, { color: '#2a5fe0', edge: 0 })
  }

  // ---------------------------------------------------------------- state

  setState(state: SceneState) {
    const first = this.state === null
    this.state = state
    this.stepStart = performance.now() / 1000
    this.animBlend = 0
    this.applyState(state, first)
  }

  /** Light up parts for a moment (used by the brainstorm sketch markers). */
  flash(keys: string[]) {
    this.flashKeys = keys
  }

  /** Undo anything an animation moved directly, so the next step starts clean. */
  private resetAnimated() {
    const G = this.groups
    G.flapLPivot.rotation.x = 0
    G.flapRPivot.rotation.x = 0
    G.cuffPivot.rotation.x = 0
    G.leverPivot.rotation.z = LEVER_PARK * DEG
    this.parts.get('b22')?.mats.forEach(({ m }) => m.emissive.setRGB(0, 0, 0))
    const old = G.oldBin.getObjectByName('oldLidPivot')
    if (old) old.rotation.z = 0
    const ped = this.parts.get('pedal')?.obj.getObjectByName('pedalPivot')
    if (ped) ped.rotation.z = 0
    const sheet = this.parts.get('sheetD')
    if (sheet) {
      sheet.obj.scale.y = 1
      sheet.home.y = 0
    }
    this.parts.get('hall')?.mats.forEach(({ m }) => m.emissive.setRGB(0, 0, 0))
  }

  private applyState(state: SceneState, instant: boolean) {
    this.resetAnimated()
    this.applyShow(state.show, instant)
    this.camFrom.p.copy(this.camera.position)
    this.camFrom.t.copy(this.controls.target)
    this.aim(state.cam)
    this.camT = instant || this.reduced ? 1 : 0
    this.userMoved = false
    if (this.camT === 1) {
      this.camera.position.copy(this.camTo.p)
      this.controls.target.copy(this.camTo.t)
    }
    if (instant || this.reduced) {
      this.pose.rim = state.rim ?? 714
      this.pose.boxBottom = state.box?.bottom ?? 0
      this.pose.boxTop = state.box?.top ?? 0
    }
    this.setLabels(state.labels ?? [])
    this.setHotspots(state.hotspots ?? [])
    this.sectionLabel = null
    if (state.anim === 'bagSection' || state.anim === 'sheetThickness') {
      const el = document.createElement('div')
      el.className = 'bin3d__live'
      this.overlay.appendChild(el)
      this.labels.push({ el, anchor: this.anchor('top', state.anim === 'bagSection' ? [-200, 20, -220] : [-200, 70, -220]) })
      this.sectionLabel = el
    }
  }

  /** Fade, tint and move each part towards how `show` wants it. */
  private applyShow(show: Record<string, ShowEntry>, instant: boolean) {
    for (const p of this.parts.values()) {
      const e: ShowEntry | undefined = show[p.key]
      const look: Look | undefined = e === undefined ? undefined : typeof e === 'string' ? e : (e.look ?? 'base')
      const off = e && typeof e === 'object' && e.off ? e.off : [0, 0, 0]
      p.tgt.o = look ? 1 : 0
      p.tgt.blue = look === 'new' ? 1 : 0
      p.tgt.red = look === 'dead' ? 1 : 0
      p.tgt.ghost = look === 'ghost' ? 1 : 0
      p.tgt.off.set(off[0], off[1], off[2])
      if (instant || this.reduced) {
        Object.assign(p.cur, { o: p.tgt.o, blue: p.tgt.blue, red: p.tgt.red, ghost: p.tgt.ghost })
        p.cur.off.copy(p.tgt.off)
      }
    }
  }

  private anchor(frame: string, at: V3) {
    const a = new THREE.Object3D()
    a.position.set(...at)
    ;(frame === 'world' ? this.scene : this.groups[frame === 'bin' ? 'bin' : 'top']).add(a)
    return a
  }

  private setLabels(list: Label[]) {
    for (const l of this.labels) {
      l.el.remove()
      l.anchor.removeFromParent()
    }
    this.labels = list.map((l) => {
      const el = document.createElement('div')
      el.className = 'bin3d__label'
      el.textContent = l.text
      this.overlay.appendChild(el)
      return { el, anchor: this.anchor(l.frame ?? 'top', l.at) }
    })
  }

  private setHotspots(list: Hotspot[]) {
    for (const h of this.hotspots) {
      h.el.remove()
      h.anchor.removeFromParent()
    }
    this.hotspots = list.map((h, i) => {
      const el = document.createElement('div')
      el.className = 'bin3d__hot'
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'bin3d__dot'
      b.textContent = String(i + 1)
      b.setAttribute('aria-label', h.title)
      const card = document.createElement('div')
      card.className = 'bin3d__card'
      const t = document.createElement('strong')
      t.textContent = h.title
      const p = document.createElement('p')
      p.textContent = h.text
      card.append(t, p)
      el.append(b, card)
      b.addEventListener('click', (ev) => {
        ev.stopPropagation()
        const open = el.classList.contains('is-open')
        this.hotspots.forEach((x) => x.el.classList.remove('is-open'))
        if (!open) el.classList.add('is-open')
      })
      this.overlay.appendChild(el)
      return { el, anchor: this.anchor('top', h.at) }
    })
  }

  // ---------------------------------------------------------------- frame loop

  private start() {
    if (this.running) return
    this.running = true
    const tick = (now: number) => {
      if (!this.running) return
      this.raf = requestAnimationFrame(tick)
      const raw = this.last ? (now - this.last) / 1000 : 0.016
      this.last = now
      if (!this.visible || document.hidden) return
      this.frame(Math.min(raw, 0.05), now / 1000, Math.min(raw, 0.25))
    }
    this.raf = requestAnimationFrame(tick)
  }

  private frame(dt: number, now: number, wall: number) {
    const st = this.state
    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 5)
    const flashOn = this.flashKeys.length ? 0.5 + 0.5 * Math.sin(now * 7) : 0

    // parts
    for (const p of this.parts.values()) {
      const c = p.cur
      const t = p.tgt
      c.o += (t.o - c.o) * k
      c.blue += (t.blue - c.blue) * k
      c.red += (t.red - c.red) * k
      c.ghost += (t.ghost - c.ghost) * k
      c.off.lerp(t.off, k)
      const flash = this.flashKeys.includes(p.key) ? flashOn : 0
      const vis = c.o > 0.004
      p.obj.visible = vis
      if (!vis) continue
      p.obj.position.copy(p.home).add(c.off)
      for (const { m, spec, base } of p.mats) {
        const hover = p.key === this.hoverKey ? 1 : 0
        m.color.copy(base).lerp(BLUE, Math.min(1, c.blue * 0.5 + flash * 0.8 + hover * 0.35)).lerp(RED, c.red * 0.8)
        m.emissive.copy(BLUE).multiplyScalar(0.06 * c.blue + 0.25 * flash + 0.12 * hover)
        const op = c.o * (spec.opacity ?? 1) * (1 - 0.86 * c.ghost) * (1 - 0.35 * c.red)
        m.opacity = op
        m.transparent = op < 0.995
        m.depthWrite = op > 0.55
      }
      for (const em of p.edges) em.opacity = c.o * (0.3 - 0.14 * c.ghost)
    }

    // pose
    const pose = this.pose
    if (st) {
      pose.rim += ((st.rim ?? 714) - pose.rim) * k
      pose.boxBottom += ((st.box?.bottom ?? 0) - pose.boxBottom) * k
      pose.boxTop += ((st.box?.top ?? 0) - pose.boxTop) * k
      this.animBlend = Math.min(1, this.animBlend + dt / 0.6)
      const a =
        this.demoStart !== null
          ? this.demo(now - this.demoStart)
          : this.animate(st.anim ?? 'none', Math.max(0, now - this.stepStart), now)
      const blend = (key: 'roll' | 'lid' | 'tilt' | 'spin', still: number) => {
        const want = a[key] !== undefined ? still + (a[key]! - still) * this.animBlend : still
        pose[key] += (want - pose[key]) * (a[key] !== undefined ? Math.max(k, this.animBlend) : k)
      }
      blend('roll', st.roll ?? 0)
      blend('lid', st.lid ?? 0)
      blend('tilt', st.tilt ?? 0)
      blend('spin', 0)
    }
    const G = this.groups
    G.bin.position.x = -pose.roll
    G.bin.rotation.y = pose.spin
    G.bin.position.z = 0
    if (pose.spin) {
      // spin about the bin's own centre
      const c = new THREE.Vector3(-200, 0, -220)
      const r = c.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), pose.spin)
      G.bin.position.x = -pose.roll + c.x - r.x
      G.bin.position.z = c.z - r.z
    }
    G.top.position.y = pose.rim - 714
    G.stretch.parent!.scale.y = (pose.rim - 100) / 614
    G.lidPivot.rotation.z = -pose.lid * DEG
    G.tiltPivot.rotation.z = -pose.tilt * DEG
    const box = this.parts.get('box')
    if (box) {
      const mesh = box.obj.getObjectByName('boxMesh')!
      const y0 = -714 + pose.boxBottom
      const y1 = pose.rim - 714 + pose.boxTop
      mesh.scale.set(400, Math.max(1, y1 - y0), 440)
      mesh.position.set(-200, (y0 + y1) / 2, -220)
    }

    // camera
    if (this.camT < 1) {
      this.camT = Math.min(1, this.camT + wall / 1.3)
      const e = ease(this.camT)
      this.camera.position.lerpVectors(this.camFrom.p, this.camTo.p, e)
      this.controls.target.lerpVectors(this.camFrom.t, this.camTo.t, e)
    }
    this.controls.update()
    if (this.names && this.pointerMoved) this.pick()
    this.renderer.render(this.scene, this.camera)
    this.placeOverlay()
  }

  // ---------------------------------------------------------------- naming parts

  /** Name the part under the pointer (null turns it off). */
  setHoverNames(names: Record<string, string> | null) {
    this.names = names
    if (!names) this.setHover(null)
    else this.pointerMoved = true
  }

  private onPointerMove = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer = new THREE.Vector2(e.clientX - r.left, e.clientY - r.top)
    this.pointerMoved = true
  }

  private onPointerLeave = () => {
    this.pointer = null
    this.pointerMoved = true
  }

  private pick() {
    this.pointerMoved = false
    if (!this.pointer || !this.names) return this.setHover(null)
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    this.raycaster.setFromCamera(new THREE.Vector2((this.pointer.x / w) * 2 - 1, -(this.pointer.y / h) * 2 + 1), this.camera)
    const meshes: THREE.Mesh[] = []
    for (const p of this.parts.values()) if (p.obj.visible && p.cur.o > 0.5) meshes.push(...p.meshes)
    const hit = this.raycaster.intersectObjects(meshes, false)[0]
    const key = hit ? (hit.object.userData.part as string) : null
    this.setHover(key && this.names[key] ? key : null)
  }

  private setHover(key: string | null) {
    this.hoverKey = key
    if (!key || !this.names) {
      this.tip?.remove()
      this.tip = null
      return
    }
    if (!this.tip) {
      this.tip = document.createElement('div')
      this.tip.className = 'bin3d__tip'
      this.overlay.appendChild(this.tip)
    }
    this.tip.textContent = this.names[key]
    if (this.pointer) this.tip.style.transform = `translate(${this.pointer.x + 14}px, ${this.pointer.y + 14}px)`
  }

  /** Animated values for this moment; undefined = use the step's still pose. */
  private animate(name: AnimName, t: number, now: number): Partial<Record<'roll' | 'lid' | 'tilt' | 'spin', number>> {
    const G = this.groups
    const r = this.reduced
    switch (name) {
      case 'oldBinLid': {
        const piv = G.oldBin.getObjectByName('oldLidPivot')
        if (piv) piv.rotation.z = -(r ? 55 : 55 * wave(t, 4.5, 0.25, 0.3)) * DEG
        return {}
      }
      case 'pedal': {
        const w = r ? 0.6 : wave(t, 3.6, 0.22, 0.25)
        const piv = this.parts.get('pedal')?.obj.getObjectByName('pedalPivot')
        if (piv) piv.rotation.z = w * 12 * DEG
        return { lid: w * 40 }
      }
      case 'footSensor':
      case 'lidSensor': {
        const beam = this.parts.get(name === 'footSensor' ? 'footBeam' : 'lidBeam')
        if (beam) beam.mats.forEach(({ m }) => (m.opacity *= 0.55 + 0.45 * Math.sin(now * 3)))
        if (name === 'lidSensor') {
          const hand = this.parts.get('hand')?.obj.getObjectByName('handInner')
          if (hand) hand.position.y = 140 + (r ? 0 : 18 * Math.sin(t * 1.6))
        }
        return {}
      }
      case 'rollCycle': {
        if (r) return { roll: 440, lid: 75 }
        const p = t % 10
        const roll = 440 * (smooth(0.3, 2.6, p) - smooth(7.0, 9.3, p))
        const lid = 75 * (smooth(2.8, 3.8, p) - smooth(5.6, 6.6, p))
        return { roll, lid }
      }
      case 'butterfly': {
        const w = r ? 1 : wave(t, 5, 0.25, 0.3)
        G.flapLPivot.rotation.x = w * 80 * DEG
        G.flapRPivot.rotation.x = -w * 80 * DEG
        return {}
      }
      case 'leverClose': {
        // the springs open the lid with the lever parked; the lever swings up into the tail tab,
        // pushes the lid shut onto the latch, and parks again
        if (r) return { lid: 0 }
        const p = t % 8
        const lever = leverAt(smooth(3, 5.6, p) - smooth(5.9, 6.8, p))
        G.leverPivot.rotation.z = lever * DEG
        const springs = p < 5.75 ? 78 * smooth(1, 2.2, p) : 0 // latched once it has been pushed shut
        return { lid: Math.min(springs, lidLimit(lever)) }
      }
      case 'lidCycle':
        return { lid: r ? 75 : 78 * wave(t, 5.5, 0.22, 0.35) }
      case 'motorRelease': {
        if (r) return { lid: 40 }
        const p = t % 9
        // latched → the lever pushes once more and the latch lets go → it backs off and the
        // springs open the lid behind it → later it pushes the lid shut again
        const lever = leverAt(smooth(0.6, 1.3, p) - smooth(1.5, 2.6, p) + smooth(5, 7.2, p) - smooth(7.5, 8.4, p))
        G.leverPivot.rotation.z = lever * DEG
        const released = p > 1.4 && p < 7.3
        return { lid: Math.min(released ? 78 : 0, lidLimit(lever)) }
      }
      case 'solenoid': {
        // the solenoid pulls the arm sideways, swinging the pin out of the track; the springs
        // open the lid, and it is shut again by hand
        if (r) return { lid: 0 }
        const p = t % 7
        const pull = smooth(0.8, 1.05, p) - smooth(1.7, 2.1, p)
        G.cuffPivot.rotation.x = pull * 14 * DEG
        this.parts.get('b22')?.mats.forEach(({ m }) => m.emissive.copy(RED).multiplyScalar(0.45 * pull))
        return { lid: 78 * (smooth(1.05, 2.3, p) - smooth(4.6, 6.2, p)) }
      }
      case 'latch': {
        if (r) return { lid: 0 }
        const pin = latchAt(latchClock())
        // the plate moves with the lid; the pin's height barely changes, so the lid sits
        // (latched y − pin y) mm higher at the latch, 386 mm from the hinge
        const dy = LATCHED_PIN.y - pin.y
        const cp = G.cuffPivot
        const zRel = -pin.z - 228 + 220 // pin z in the assembly, relative to the arm's pivot
        cp.rotation.x = Math.asin(Math.max(-1, Math.min(1, zRel / 42.87))) - Math.asin(0.689 / 42.87)
        return { lid: (dy / 386) / DEG }
      }
      case 'tiltCycle':
        return { roll: 590, tilt: r ? 88 : 88 * wave(t, 6.5, 0.25, 0.3) }
      case 'hallPulse': {
        const hall = this.parts.get('hall')
        hall?.mats.forEach(({ m }) => m.emissive.copy(BLUE).multiplyScalar(0.4 + 0.4 * Math.sin(now * 4)))
        return { lid: r ? 0 : 30 * wave(t, 5, 0.2, 0.3) }
      }
      case 'sheetThickness': {
        const i = r ? 0 : Math.floor((t % 7.5) / 2.5)
        const th = [3, 4, 5][i]
        const sheet = this.parts.get('sheetD')
        if (sheet) {
          // the 4 mm sheet scaled about its top face (asm y 62)
          sheet.obj.scale.y = th / 4
          sheet.home.y = 62 * (1 - th / 4)
        }
        if (this.sectionLabel) this.sectionLabel.textContent = `${th} mm top: ${['opens in ≈ 0.5 s', 'stalls part-way', 'needs ≈ 117° of wind'][i]}`
        return {}
      }
      case 'bagSection': {
        const sizes = [
          { a: 285, b: 285, t: '60 L liner → 285 mm square inside ≈ 49 L' },
          { a: 350, b: 350, t: 'Refuse sack → 350 mm square inside ≈ 91 L' },
          { a: 390, b: 390, t: 'Wide 100 L sack → 390 mm square ≈ 102 L' },
        ]
        const i = r ? 1 : Math.floor((t % 7.5) / 2.5)
        const s = sizes[i]
        const g = this.parts.get('section')?.obj.getObjectByName('sectionInner')
        if (g) {
          const target = new THREE.Vector3(s.a, 1, s.b)
          g.scale.lerp(target, r ? 1 : 0.12)
        }
        if (this.sectionLabel) this.sectionLabel.textContent = s.t
        return {}
      }
      case 'spin2d':
        return { roll: 470, spin: r ? 0.5 : 0.6 * Math.sin(t * 0.9) }
      default:
        return {}
    }
  }

  // ---------------------------------------------------------------- the model at the top of the page

  /** Change which parts show, without starting a new step or moving the camera. */
  setShow(show: Record<string, ShowEntry>) {
    if (!this.state) return
    this.state = { ...this.state, show }
    this.applyShow(show, false)
  }

  /** Change the still roll-out and lid angle. */
  setPose(pose: { roll?: number; lid?: number }) {
    if (this.state) this.state = { ...this.state, ...pose }
  }

  setNotes(list: Hotspot[]) {
    if (this.state) this.state = { ...this.state, hotspots: list }
    this.setHotspots(list)
  }

  /** Glide to a new view, which Reset view then comes back to. */
  view(cam: [V3, V3]) {
    if (this.state) this.state = { ...this.state, cam }
    this.applyCamera(cam)
  }

  /** One run of the finished bin: a hand over the sensor, it rolls out, opens, waits,
   *  closes and rolls back. `onPhase` hears what it's doing, then null at the end. */
  playDemo(onPhase: (phase: string | null) => void) {
    this.stopDemo()
    this.demoStart = performance.now() / 1000
    this.onPhase = onPhase
  }

  stopDemo() {
    if (this.demoStart === null) return
    this.demoStart = null
    this.demoPhase = null
    this.groups.leverPivot.rotation.z = LEVER_PARK * DEG
    const show = this.state?.show ?? {}
    for (const key of ['hand', 'lidBeam']) {
      const part = this.parts.get(key)
      if (part) part.tgt.o = show[key] ? 1 : 0
    }
    this.parts.get('hand')?.obj.getObjectByName('handInner')?.position.set(-330, 140, -220)
    const done = this.onPhase
    this.onPhase = null
    done?.(null)
  }

  private demo(t: number): Partial<Record<'roll' | 'lid' | 'tilt' | 'spin', number>> {
    if (t >= DEMO_END) {
      this.stopDemo()
      return {}
    }
    const phase = DEMO_PHASES.find(([end]) => t < end)![1]
    if (phase !== this.demoPhase) {
      this.demoPhase = phase
      this.onPhase?.(phase)
    }
    const roll = 440 * (smooth(2, 4.4, t) - smooth(12.4, 14.8, t))
    // the hand comes in under the worktop to just above the sensor, then away again
    const hand = this.parts.get('hand')
    const inner = hand?.obj.getObjectByName('handInner')
    if (hand && inner) {
      hand.tgt.o = t < 2.5 ? 1 : 0
      inner.position.x = -760 + 430 * (smooth(0, 1.1, t) - smooth(1.8, 2.7, t)) + roll
    }
    const beam = this.parts.get('lidBeam')
    if (beam) beam.tgt.o = t > 0.9 && t < 1.9 ? 1 : 0
    // the lever pushes once to release the latch and the springs open the lid behind it; after
    // the wait it pushes the tail tab to close the lid onto the latch, then parks
    const lever = leverAt(smooth(4, 4.5, t) - smooth(4.6, 5.6, t) + smooth(9.6, 12, t) - smooth(12.1, 12.7, t))
    this.groups.leverPivot.rotation.z = lever * DEG
    const released = t > 4.55 && t < 12.05
    return { roll, lid: Math.min(released ? 78 : 0, lidLimit(lever)) }
  }

  private placeOverlay() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    const v = new THREE.Vector3()
    const put = (el: HTMLElement, a: THREE.Object3D) => {
      a.getWorldPosition(v)
      v.project(this.camera)
      const hidden = v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1
      el.style.opacity = hidden ? '0' : ''
      el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`
    }
    this.labels.forEach((l) => put(l.el, l.anchor))
    this.hotspots.forEach((l) => put(l.el, l.anchor))
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  /** Put the camera back on the step's view after the user has dragged it. */
  resetView() {
    if (!this.state) return
    this.applyCamera(this.state.cam)
  }

  get moved() {
    return this.userMoved
  }

  /** For a model at the top of a page: the wheel and vertical swipes scroll the page, dragging still turns it. */
  letPageScroll() {
    this.controls.enableZoom = false
    this.renderer.domElement.style.touchAction = 'pan-y'
  }

  /** Set the camera goal, backing off on narrow viewers so the scene still fits across. */
  private aim([p, t]: [V3, V3]) {
    const w = this.host.clientWidth || 1
    const h = this.host.clientHeight || 1
    const k = 1.1 * Math.max(1, Math.pow(1.4 / (w / h), 0.85))
    // views are written in the bin's frame; follow a step's fixed roll-out
    const dx = -(this.state?.roll ?? 0)
    this.camTo.t.set(t[0] + dx, t[1], t[2])
    this.camTo.p.set(p[0] + dx, p[1], p[2]).sub(this.camTo.t).multiplyScalar(k).add(this.camTo.t)
  }

  private applyCamera(cam: [V3, V3]) {
    this.camFrom.p.copy(this.camera.position)
    this.camFrom.t.copy(this.controls.target)
    this.aim(cam)
    this.camT = this.reduced ? 1 : 0
    this.userMoved = false
  }

  dispose() {
    this.disposed = true
    this.onPhase = null
    this.running = false
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.controls.dispose()
    this.renderer.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
    })
    this.renderer.domElement.remove()
    this.overlay.replaceChildren()
  }
}
