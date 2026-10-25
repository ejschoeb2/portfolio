// The ball launcher in 3D: the real Inventor parts (public/models/launcher.glb,
// assembly frame, mm, y up). The gears, Geneva wheel and four-bar linkage move
// with the ratios and link lengths of the CAD, and a run feeds and fires all
// four balls the way the built launcher does.

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'

type V3 = [number, number, number]
type V2 = [number, number] // a point on the plan: x and z

const INK = new THREE.Color('#0c1424')
const DEG = Math.PI / 180

// ---------------------------------------------------------------- the CAD

// Pivots on the plan, from the assembly.
const CRANK: V2 = [60.51, -80] // 80T gear and crank
const IDLER: V2 = [120.51, -80] // 40T idler
const DRIVER: V2 = [160.51, -80] // 40T gear and Geneva driver
const WHEEL: V2 = [230.51, -80] // Geneva wheel
const ROCKER: V2 = [164.51, -187] // firing-arm pivot
const PIN0: V2 = [36.25, -89.36] // crank pin, as modelled
const JOINT0: V2 = [60.69, -202.75] // coupler-to-arm joint, as modelled
const DRIVER_PIN0: V2 = [200.67, -50.22] // Geneva driver pin, as modelled

// Flywheel: centre and shaft direction.
const FLY: V3 = [80.47, 82.39, -199.75]
const FLY_AXIS = new THREE.Vector3(0.15001, 0, -0.98868)
// Along the arm, from its pivot towards the flywheel end is -ARM_DIR.
const ARM_DIR: V2 = [0.98868, 0.15001]

const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]]
const len = (a: V2) => Math.hypot(a[0], a[1])
/** Angle on the plan, measured from +x towards +z. rotation.y turns the other way. */
const ang = (a: V2) => Math.atan2(a[1], a[0])

const CRANK_R = len(sub(PIN0, CRANK))
const COUPLER = len(sub(JOINT0, PIN0))
const ROCKER_R = len(sub(JOINT0, ROCKER))
const PIN_ANGLE0 = ang(sub(PIN0, CRANK))
const ROCKER_ANGLE0 = ang(sub(JOINT0, ROCKER))
const COUPLER_ANGLE0 = ang(sub(JOINT0, PIN0))
// Which of the two ways the linkage can close, as modelled.
const BRANCH = (() => {
  const u = sub(ROCKER, PIN0)
  const v = sub(JOINT0, PIN0)
  return Math.sign(u[0] * v[1] - u[1] * v[0])
})()
const GENEVA_R = len(sub(DRIVER_PIN0, DRIVER)) // 50
const GENEVA_C = WHEEL[0] - DRIVER[0] // 70
const DRIVER_ANGLE0 = ang(sub(DRIVER_PIN0, DRIVER)) / DEG // 36.6°, just finishing a step

/** The linkage for a crank turn of `t` (rad, from the modelled pose). */
function linkage(t: number) {
  const a = PIN_ANGLE0 + t
  const pin: V2 = [CRANK[0] + CRANK_R * Math.cos(a), CRANK[1] + CRANK_R * Math.sin(a)]
  const toQ = sub(ROCKER, pin)
  const d = len(toQ)
  const along = (COUPLER * COUPLER - ROCKER_R * ROCKER_R + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, COUPLER * COUPLER - along * along))
  const u: V2 = [toQ[0] / d, toQ[1] / d]
  const joint: V2 = [pin[0] + u[0] * along - u[1] * h * BRANCH, pin[1] + u[1] * along + u[0] * h * BRANCH]
  return {
    pin,
    coupler: ang(sub(joint, pin)) - COUPLER_ANGLE0,
    rocker: ang(sub(joint, ROCKER)) - ROCKER_ANGLE0,
  }
}

/** Geneva wheel turn (deg, from the modelled pose) for a driver angle (deg). Four slots:
 *  the pin is in a slot for 90° of every turn, and the wheel steps 90° the other way. */
function geneva(driver: number) {
  const n = Math.floor((driver + 45) / 360)
  const a = driver + 45 - n * 360 - 45 // -45 … 315
  let step = -45
  if (a < 45) {
    const r = a * DEG
    const slot = Math.atan2(GENEVA_R * Math.sin(r), GENEVA_R * Math.cos(r) - GENEVA_C) / DEG // 225 … 135
    step = ((slot < 0 ? slot + 360 : slot) - 180) * (45 / 45.6)
  }
  return -90 * n + step + 44.36
}

// ---------------------------------------------------------------- parts

type MatSpec = { color: string; metal?: number; rough?: number; opacity?: number; edge?: number }

const MATS: Record<string, MatSpec> = {
  mdf: { color: '#dcc097', rough: 0.9 },
  yellow: { color: '#f4dc22', rough: 0.6 },
  blue: { color: '#2f62d8', rough: 0.55 },
  acrylic: { color: '#d5e4f6', rough: 0.1, opacity: 0.4, edge: 0.5 },
  steel: { color: '#a6aeb8', metal: 0.35, rough: 0.4 },
  motor: { color: '#c8cdd4', metal: 0.3, rough: 0.35 },
  pvc: { color: '#e9edf3', rough: 0.3, opacity: 0.4, edge: 0.35 },
  rubber: { color: '#181b21', rough: 0.7, edge: 0 },
}

function matFor(key: string) {
  if (/^(BaseVersion2|MainBracket|MountPVC)/.test(key)) return MATS.mdf
  if (/^(GenevaV2|RampToArm|Bracket|MountPart2)/.test(key)) return MATS.yellow
  if (/^(FlywheelV2|MotorHolder|Ramp_)/.test(key)) return MATS.blue
  if (/^(Arm|GenevaDriver|SpurGear|DrivenGear|Bar|ShortBar)/.test(key)) return MATS.acrylic
  if (/^(MotorJ|N20)/.test(key)) return MATS.motor
  if (/^PVCTube/.test(key)) return MATS.pvc
  return MATS.steel
}

type GroupName = 'fixed' | 'crank' | 'idler' | 'driver' | 'wheel' | 'coupler' | 'arm'

const GROUPS: Record<Exclude<GroupName, 'fixed'>, string[]> = {
  crank: ['SpurGearA_2', 'ShortBar_1', 'Rod6_1', 'Washer_1', 'Rod13_1', 'Washer_2', 'Washer_3', '3mmto4mmCoupler_1'],
  idler: ['DrivenGearA_4', 'Rod16_1', 'CNS1204_1', 'CNS1204_6'],
  driver: ['DrivenGearA_2', 'Rod3_1', 'GenevaDriver_1', 'RodGenevaDriver_1', 'CNS1204_2', 'CNS1204_5', 'Washer_5'],
  wheel: ['GenevaV2_1', 'Rod10_2', 'CNS1204_4', 'CNS1204_7'],
  coupler: ['Bar_1'],
  arm: ['Arm_1', 'ArmWall1_1', 'ArmWall2_1', 'Ramp_1', 'MotorHolder_1', 'MotorJ_1', 'UniversalCoupler_1', 'Rod5_2',
    'Bearing4X8X3_4', 'Bearing4X8X3_5', 'RodSimple_2', 'Washer_4', 'CNS1204_3', 'FlywheelV2_1', 'oRings'],
}
const PIVOT: Record<GroupName, V2> = {
  fixed: [0, 0], crank: CRANK, idler: IDLER, driver: DRIVER, wheel: WHEEL, coupler: PIN0, arm: ROCKER,
}
const groupOf = (key: string) =>
  (Object.keys(GROUPS) as (keyof typeof GROUPS)[]).find((g) => GROUPS[g].includes(key)) ?? 'fixed'

// Taken apart: each layer lifts clear of the one below (mm). Parts on the arm
// move in the arm's own frame, so the motor slides off along its shaft.
const along = (d: number): V3 => [FLY_AXIS.x * d, 0, FLY_AXIS.z * d]
const EXPLODE: [RegExp, V3][] = [
  [/^(Bar_1|Washer_1|Washer_4)$/, [0, 30, 0]],
  [/^RampToArm/, [0, 30, 0]],
  [/^(ShortBar_1|Rod6_1)$/, [0, 60, 0]],
  [/^(FlywheelV2_1|oRings)$/, [0, 130, 0]],
  [/^(MotorJ_1|UniversalCoupler_1|Rod5_2)$/, [along(70)[0], 60, along(70)[2]]],
  [/^MotorHolder/, [along(35)[0], 60, along(35)[2]]],
  [/^(Arm|Ramp_|Bearing4X8X3_4|Bearing4X8X3_5|RodSimple|CNS1204_3)/, [0, 60, 0]],
  [/^(SpurGearA|DrivenGearA|CNS1204_[1256]|Washer_[23]|Rod3_|Rod13|Rod16)/, [0, 95, 0]],
  [/^Rod17/, [0, 125, 0]],
  [/^(MainBracket|Bearing4X8X3_1[234]|Washer_5)/, [0, 160, 0]],
  [/^(GenevaDriver|RodGenevaDriver)/, [0, 190, 0]],
  [/^(Bracket|N20|MountPart2|3mmto4mmCoupler)/, [0, 220, 0]],
  [/^(GenevaV2|Rod10|CNS1204_[47])/, [0, 240, 0]],
  [/^MountPVC/, [0, 290, 0]],
  [/^PVCTube/, [0, 320, 0]],
]
const explodeFor = (key: string): V3 => EXPLODE.find(([re]) => re.test(key))?.[1] ?? [0, 0, 0]

// What the labels point at: a part, and a point on it (assembly frame).
const LABELS: { text: string; part: string; at: V3 }[] = [
  { text: 'Geneva wheel', part: 'GenevaV2_1', at: [256, 80, -40] },
  { text: 'Feed motor', part: 'N20DCMOTOR_1', at: [60.5, 68, -80] },
  { text: 'Gear train', part: 'SpurGearA_2', at: [24, 20, -70] },
  { text: 'Four-bar linkage', part: 'Bar_1', at: [52, 6, -170] },
  { text: 'Flywheel', part: 'FlywheelV2_1', at: [80, 104, -200] },
  { text: 'Flywheel motor', part: 'MotorJ_1', at: [92, 99, -268] },
  { text: 'Firing arm', part: 'Arm_1', at: [140, 14, -192] },
  { text: 'Ramp', part: 'RampToArm_1', at: [240, 37, -140] },
]

// ---------------------------------------------------------------- views

// From behind the ramp, like the photos of the build.
const VIEW: [V3, V3] = [[712, 398, -595], [200, 55, -80]]
const EXPLODED_VIEW: [V3, V3] = [[937, 690, -767], [225, 150, -50]]

// ---------------------------------------------------------------- the run

const PERIOD = 2.6 // seconds per ball: one turn of the Geneva driver
const DRIVER_SPEED = 360 / PERIOD // deg/s
const RUN_START = -470 // driver angle at rest: just before the first step
const RUN_END = RUN_START + 1440 // two crank turns, so it ends where it began
const DROPS = [-315, 45, 405, 765] // driver angles where each ball drops through the plate
const FIRE_AFTER = 131.6 // driver degrees from drop to the arm reaching the end of its swing
const POCKET_R = 37.5
const BALL_R = 20
const BALL_Y = 69.4 // resting on the upper plate in a pocket
const TUBE_Y = BALL_Y + 2 * BALL_R // the fourth ball, waiting in the tube on top of another

// The path down the ramp to the arm (fixed), then along the arm (turns with it).
const RAMP_PATH: V3[] = (() => {
  const pts: V3[] = [
    [WHEEL[0], BALL_Y, WHEEL[1] - POCKET_R],
    [WHEEL[0], 50.9, WHEEL[1] - POCKET_R],
    [WHEEL[0], 35.6, -155],
  ]
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    pts.push([198.5 + 32 * Math.cos(a), 35.6, -155 - 32 * Math.sin(a)])
  }
  pts.push([ROCKER[0] + 22 * ARM_DIR[0], 34, ROCKER[1] + 22 * ARM_DIR[1]])
  return pts
})()
const ARM_START = 22 // along the arm from its pivot (mm, + is away from the flywheel)
const ARM_LAUNCH = -112
const armY = (s: number) => 33.4 + Math.max(0, -96 - s) * 0.7 // flat, then up the wedge under the flywheel
const LAUNCH_SPEED = 1300 // mm/s, slowed down so you can follow it
const GRAVITY = 1600

const segLens = RAMP_PATH.slice(1).map((p, i) => Math.hypot(p[0] - RAMP_PATH[i][0], p[1] - RAMP_PATH[i][1], p[2] - RAMP_PATH[i][2]))
const RAMP_LEN = segLens.reduce((a, b) => a + b, 0)
const ROLL_LEN = RAMP_LEN + (ARM_START - ARM_LAUNCH)
const FALL_T = 0.12
const ROLL_T = (FIRE_AFTER / 360) * PERIOD - FALL_T
const ROLL_V0 = 110
const ROLL_A = (2 * (ROLL_LEN - ROLL_V0 * ROLL_T)) / (ROLL_T * ROLL_T)

const LAST_FIRE = DROPS[3] + FIRE_AFTER
const HOLD = 1.4 // seconds the run stays on 'All four balls fired' before it resets

function phaseAt(driver: number) {
  const fires = DROPS.map((d) => d + FIRE_AFTER)
  if (driver >= LAST_FIRE + 40) return 'All four balls fired'
  let text = 'The feed motor turns the gears'
  DROPS.forEach((drop, k) => {
    if (driver >= drop - 90) text = 'The Geneva wheel steps a ball round'
    if (driver >= drop) text = 'It drops through and rolls to the arm'
    if (driver >= fires[k]) text = `The flywheel fires it into zone ${k % 2 ? 'C' : 'A'}`
    if (driver >= fires[k] + 70 && k < 3) text = `The linkage swings the aim to zone ${k % 2 ? 'A' : 'C'}`
  })
  return text
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type Part = { key: string; holder: THREE.Object3D; home: THREE.Vector3; off: THREE.Vector3 }

type Ball = { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pocket: number; drop: number }

export type EngineEvents = { onReady?: () => void; onError?: (e: unknown) => void }

export class LauncherEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private host: HTMLElement
  private overlay: HTMLElement
  private groups = {} as Record<GroupName, THREE.Group>
  private parts: Part[] = []
  private balls: Ball[] = []
  private labels: { el: HTMLElement; anchor: THREE.Object3D }[] = []
  private labelsOn = false
  private explode = 0
  private explodeTo = 0
  private driver = RUN_START
  private refill = 1
  private runFrom: number | null = null
  private onPhase: ((phase: string | null) => void) | null = null
  private phase: string | null = null
  private camFrom = { p: new THREE.Vector3(), t: new THREE.Vector3() }
  private camTo = { p: new THREE.Vector3(), t: new THREE.Vector3() }
  private camT = 1
  private view: [V3, V3] = VIEW
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  private ro: ResizeObserver
  private io: IntersectionObserver
  private visible = true
  private raf = 0
  private last = 0
  private disposed = false

  constructor(host: HTMLElement, overlay: HTMLElement, ev: EngineEvents = {}) {
    this.host = host
    this.overlay = overlay
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    host.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(30, 1, 5, 8000)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 120
    this.controls.maxDistance = 2400
    this.controls.zoomToCursor = true
    this.controls.addEventListener('start', () => (this.camT = 1))

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#c9d3e6', 1.9))
    const key = new THREE.DirectionalLight('#ffffff', 2.2)
    key.position.set(-500, 900, 600)
    this.scene.add(key)
    const fill = new THREE.DirectionalLight('#dfe8ff', 0.9)
    fill.position.set(700, 300, -800)
    this.scene.add(fill)

    for (const name of Object.keys(PIVOT) as GroupName[]) {
      const g = new THREE.Group()
      g.position.set(PIVOT[name][0], 0, PIVOT[name][1])
      this.scene.add(g)
      this.groups[name] = g
    }
    this.addBalls()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting))
    this.io.observe(host)
    this.resize()
    this.setView(VIEW, true)
    this.pose()

    new GLTFLoader().load(
      '/models/launcher.glb',
      (gltf) => {
        if (this.disposed) return
        gltf.scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) this.addPart(o.name, (o as THREE.Mesh).geometry, matFor(o.name))
        })
        this.addORings()
        this.addLabels()
        this.pose()
        ev.onReady?.()
      },
      undefined,
      (e) => ev.onError?.(e),
    )
    this.start()
  }

  // ---------------------------------------------------------------- building

  private material(s: MatSpec) {
    const see = s.opacity !== undefined
    return new THREE.MeshStandardMaterial({
      color: s.color,
      metalness: s.metal ?? 0,
      roughness: s.rough ?? 0.8,
      transparent: see,
      opacity: s.opacity ?? 1,
      depthWrite: !see,
      side: see ? THREE.DoubleSide : THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
  }

  private addPart(key: string, geometry: THREE.BufferGeometry, spec: MatSpec, mesh?: THREE.Object3D) {
    const group = groupOf(key)
    if (!mesh) {
      const m = new THREE.Mesh(toCreasedNormals(geometry, 30 * DEG), this.material(spec))
      if (spec.opacity !== undefined) m.renderOrder = 2
      if ((spec.edge ?? 0.3) > 0) {
        const lines = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 28),
          new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: spec.edge ?? 0.3 }),
        )
        m.add(lines)
      }
      geometry.dispose()
      mesh = m
    }
    const holder = new THREE.Group()
    holder.name = key
    holder.add(mesh)
    const pivot = PIVOT[group]
    const home = new THREE.Vector3(-pivot[0], 0, -pivot[1])
    holder.position.copy(home)
    this.groups[group].add(holder)
    this.parts.push({ key, holder, home, off: new THREE.Vector3(...explodeFor(key)) })
  }

  /** The two O-rings on the flywheel (bought in, so not in the CAD). */
  private addORings() {
    const g = new THREE.Group()
    const mat = this.material(MATS.rubber)
    const geo = new THREE.TorusGeometry(21.46, 1.46, 12, 72)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), FLY_AXIS)
    for (const side of [-6, 6]) {
      const ring = new THREE.Mesh(geo, mat)
      ring.quaternion.copy(q)
      ring.position.set(FLY[0], FLY[1], FLY[2]).addScaledVector(FLY_AXIS, side)
      g.add(ring)
    }
    this.addPart('oRings', geo, MATS.rubber, g)
  }

  private addBalls() {
    const geo = new THREE.SphereGeometry(BALL_R, 36, 18)
    const colours = ['#ff8a2b', '#a9dcb4', '#ff8a2b', '#a9dcb4'] // like the balls on build day
    // At rest the pockets sit at 180°, 270° (over the hole, empty), 0° and 90°.
    const pockets = [2, 3, 0, 1]
    colours.forEach((c, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, transparent: true })
      const mesh = new THREE.Mesh(geo, mat)
      this.scene.add(mesh)
      this.balls.push({ mesh, mat, pocket: pockets[i], drop: DROPS[i] })
    })
  }

  private addLabels() {
    for (const l of LABELS) {
      const part = this.parts.find((p) => p.key === l.part)
      if (!part) continue
      const anchor = new THREE.Object3D()
      anchor.position.set(...l.at)
      part.holder.add(anchor)
      const el = document.createElement('div')
      el.className = 'l3d__label'
      el.textContent = l.text
      this.overlay.appendChild(el)
      this.labels.push({ el, anchor })
    }
  }

  // ---------------------------------------------------------------- posing

  /** Put every moving part where it is for the current driver angle. */
  private pose() {
    const driver = this.driver
    const crank = ((driver - DRIVER_ANGLE0) / 2) * DEG
    const link = linkage(crank)
    const g = this.groups
    g.crank.rotation.y = -crank
    g.idler.rotation.y = 2 * crank
    g.driver.rotation.y = -2 * crank
    const wheel = geneva(driver)
    g.wheel.rotation.y = -wheel * DEG
    g.coupler.position.set(link.pin[0], 0, link.pin[1])
    g.coupler.rotation.y = -link.coupler
    g.arm.rotation.y = -link.rocker

    const e = ease(this.explode)
    for (const p of this.parts) p.holder.position.copy(p.home).addScaledVector(p.off, e)

    for (const b of this.balls) this.poseBall(b, driver, wheel, link.rocker, e)
  }

  private poseBall(b: Ball, driver: number, wheel: number, rocker: number, e: number) {
    const lift = 240 * e // with the Geneva wheel when taken apart
    const inPocket = (y: number) => {
      const a = (b.pocket * 90 + wheel) * DEG
      b.mesh.position.set(WHEEL[0] + POCKET_R * Math.cos(a), y + lift, WHEEL[1] + POCKET_R * Math.sin(a))
    }
    const running = this.runFrom !== null
    if (!running || driver < b.drop) {
      // The last ball waits in the tube until an empty pocket comes under it.
      if (b === this.balls[3] && (!running || driver < DROPS[2])) {
        b.mesh.position.set(WHEEL[0] + POCKET_R, TUBE_Y + lift, WHEEL[1])
      } else inPocket(BALL_Y)
      // After a run, the balls fade back in, ready for the next.
      b.mat.opacity = running ? 1 : this.refill
      b.mesh.visible = b.mat.opacity > 0.01
      return
    }
    const t = (driver - b.drop) / DRIVER_SPEED
    b.mesh.visible = true
    if (t < FALL_T + ROLL_T) {
      const s = t < FALL_T ? ((t / FALL_T) ** 2 * segLens[0]) : Math.min(ROLL_LEN, segLens[0] + ROLL_V0 * (t - FALL_T) + 0.5 * ROLL_A * (t - FALL_T) ** 2)
      this.pathPoint(Math.max(0, s), rocker, b.mesh.position)
      b.mat.opacity = 1
      return
    }
    // Fired: off up the wedge at 35°, aimed by the arm as it was at the moment of launch.
    const fireRocker = linkage(((b.drop + FIRE_AFTER - DRIVER_ANGLE0) / 2) * DEG).rocker
    const start = new THREE.Vector3()
    this.pathPoint(ROLL_LEN, fireRocker, start)
    const f = t - FALL_T - ROLL_T
    const dir = this.armDir(fireRocker)
    const vh = LAUNCH_SPEED * Math.cos(35 * DEG)
    b.mesh.position.set(
      start.x - dir[0] * vh * f,
      start.y + LAUNCH_SPEED * Math.sin(35 * DEG) * f - 0.5 * GRAVITY * f * f,
      start.z - dir[1] * vh * f,
    )
    b.mat.opacity = Math.max(0, 1 - Math.max(0, f - 0.25) / 0.25)
    b.mesh.visible = b.mat.opacity > 0.01
  }

  /** The arm's direction on the plan once it has swung by `rocker`. */
  private armDir(rocker: number): V2 {
    const a = ang(ARM_DIR) + rocker
    return [Math.cos(a), Math.sin(a)]
  }

  /** A point `s` mm along the ball's path, with the arm swung by `rocker`. */
  private pathPoint(s: number, rocker: number, out: THREE.Vector3) {
    if (s < RAMP_LEN) {
      let left = s
      for (let i = 0; i < segLens.length; i++) {
        if (left <= segLens[i] || i === segLens.length - 1) {
          const k = Math.min(1, left / segLens[i])
          const a = RAMP_PATH[i]
          const b = RAMP_PATH[i + 1]
          out.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k)
          return
        }
        left -= segLens[i]
      }
    }
    const along = ARM_START - (s - RAMP_LEN)
    const d = this.armDir(rocker)
    out.set(ROCKER[0] + d[0] * along, armY(along), ROCKER[1] + d[1] * along)
  }

  // ---------------------------------------------------------------- controls

  setExploded(on: boolean) {
    this.explodeTo = on ? 1 : 0
    this.setView(on ? EXPLODED_VIEW : VIEW)
  }

  setLabels(on: boolean) {
    this.labelsOn = on
    this.overlay.toggleAttribute('data-on', on)
  }

  /** Feed and fire all four balls, telling `onPhase` what is happening. */
  playDemo(onPhase: (phase: string | null) => void) {
    this.onPhase = onPhase
    this.driver = RUN_START
    this.runFrom = performance.now() / 1000
    this.phase = null
  }

  stopDemo() {
    if (this.runFrom === null) return
    this.runFrom = null
    this.driver = RUN_START
    this.phase = null
    this.refill = 0
    this.onPhase?.(null)
    this.onPhase = null
    this.pose()
  }

  resetView() {
    this.setView(this.view)
  }

  /** For a model on the page: the wheel scrolls the page, dragging still turns it. */
  letPageScroll() {
    this.controls.enableZoom = false
    this.renderer.domElement.style.touchAction = 'pan-y'
  }

  private setView(view: [V3, V3], now = false) {
    this.view = view
    const [p, t] = view
    // Back off on narrow viewers so the launcher still fits across.
    const w = this.host.clientWidth || 1
    const h = this.host.clientHeight || 1
    const k = Math.max(1, Math.pow(1.5 / (w / h), 0.85))
    this.camFrom.p.copy(this.camera.position)
    this.camFrom.t.copy(this.controls.target)
    this.camTo.t.set(...t)
    this.camTo.p.set(...p).sub(this.camTo.t).multiplyScalar(k).add(this.camTo.t)
    this.camT = now || this.reduced ? 1 : 0
    if (this.camT === 1) {
      this.camera.position.copy(this.camTo.p)
      this.controls.target.copy(this.camTo.t)
    }
  }

  // ---------------------------------------------------------------- frame loop

  private start() {
    const tick = (now: number) => {
      if (this.disposed) return
      this.raf = requestAnimationFrame(tick)
      const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0.016
      this.last = now
      if (!this.visible || document.hidden) return
      this.frame(dt, now / 1000)
    }
    this.raf = requestAnimationFrame(tick)
  }

  private frame(dt: number, now: number) {
    if (this.explode !== this.explodeTo) {
      const step = this.reduced ? 1 : dt / 1.1
      this.explode = this.explodeTo > this.explode ? Math.min(1, this.explode + step) : Math.max(0, this.explode - step)
    }
    if (this.runFrom !== null) {
      const raw = RUN_START + (now - this.runFrom) * DRIVER_SPEED
      // Two crank turns bring everything back to where it started, so the reset doesn't show.
      this.driver = Math.min(raw, RUN_END)
      const done = raw >= RUN_END + HOLD * DRIVER_SPEED
      const phase = done ? null : phaseAt(raw)
      if (phase !== this.phase) {
        this.phase = phase
        this.onPhase?.(phase)
      }
      if (done) {
        this.runFrom = null
        this.driver = RUN_START
        this.onPhase = null
        this.refill = 0
      }
    }
    if (this.refill < 1) this.refill = Math.min(1, this.refill + dt / 0.6)
    this.pose()

    if (this.camT < 1) {
      this.camT = Math.min(1, this.camT + dt / 1.2)
      const k = ease(this.camT)
      this.camera.position.lerpVectors(this.camFrom.p, this.camTo.p, k)
      this.controls.target.lerpVectors(this.camFrom.t, this.camTo.t, k)
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    if (this.labelsOn) this.placeLabels()
  }

  private placeLabels() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    const v = new THREE.Vector3()
    for (const { el, anchor } of this.labels) {
      anchor.getWorldPosition(v).project(this.camera)
      const hidden = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05
      el.style.opacity = hidden ? '0' : ''
      el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`
    }
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.disposed = true
    this.onPhase = null
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    this.controls.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose?.()
    })
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.overlay.replaceChildren()
  }
}
