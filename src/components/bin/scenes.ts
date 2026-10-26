// What the 3D model shows at each timeline step. Coordinates are the Inventor assembly frame
// in mm: x points to the back of the bin, y up, z across (0 = the left side seen from the front).
// The rim top is y 0 in the 'top' frame; the floor is world y -714; the worktop's underside +156.

import type { SceneState, ShowEntry, V3 } from './types'

type Show = Record<string, ShowEntry>

const EARLY = 760 // first box
const TALL = 835 // tall bin that rolls clear (3–11 Oct)
const FINAL = 714 // set by the 100 mm hand gap (11 Oct)

const off = (rim: number) => rim - FINAL

const cams = {
  iso: (rim: number): [V3, V3] => [[-1720, 260 + off(rim) * 0.5, 760], [-130, -300 + off(rim) * 0.5, -220]],
  wide: (rim: number): [V3, V3] => [[-2350, 420 + off(rim) * 0.4, 1150], [-430, -280, -220]],
  top: (rim: number): [V3, V3] => [[-232, off(rim) + 1650, -220], [-200, off(rim), -220]],
  lid: (rim: number): [V3, V3] => [[-960, off(rim) + 560, 600], [-170, off(rim) - 10, -220]],
  back: (rim: number): [V3, V3] => [[640, off(rim) + 330, 470], [-60, off(rim) - 5, -230]],
  latch: (rim: number): [V3, V3] => [[-480, off(rim) + 46, -150], [-374, off(rim) + 10, -220]],
  side: (rim: number): [V3, V3] => [[-200, off(rim) + 40, 760], [-190, off(rim) + 15, -220]],
  sheet: (rim: number): [V3, V3] => [[-640, off(rim) + 170, 430], [-300, off(rim) + 50, -220]],
  hall: (rim: number): [V3, V3] => [[-250, off(rim) + 240, -200], [-12, off(rim) + 4, -345]],
  under: (): [V3, V3] => [[-980, -520, 560], [-190, -675, -220]],
  roll: (rim: number): [V3, V3] => [[-2250, 330 + off(rim) * 0.4, 900], [-420, -300, -220]],
  tilt: (): [V3, V3] => [[-2300, 520, 1000], [-560, -180, -220]],
  sensor: (rim: number): [V3, V3] => [[-900, off(rim) + 420, 260], [-330, off(rim) + 80, -220]],
  dial: (): [V3, V3] => [[-900, -60, 120], [-420, -40, -300]],
}

const ENV: Show = { space: 'base', worktop: 'base' }
const CONCEPT: Show = { ...ENV, box: 'base', conceptLid: 'base' }
// the D-shaped top of 4–10 Oct, on the plywood box: one rim until the tilt-up top split it (S36)
const D_BODY: Show = { ...ENV, box: 'base', rimD: 'base' }
const D_BODY_SPLIT: Show = { ...ENV, box: 'base', rimD_s2: 'base', rimD_s3: 'base' }
// close-ups of the top hide the room: in this era the tall rim met the worktop (found 8 Oct, fixed at step 34)
const D_TOP: Show = { box: 'base', rimD: 'base' }
const D_MECH: Show = {
  hingeRod: 'base', lidCollars: 'base', motor: 'base', lever: 'base', coupler: 'base', motorBeam: 'base',
  springs: 'base', latch: 'base', cuff: 'base', latchPin: 'base', latchRod: 'base',
}
// the mechanism before the latch arm was strengthened (S15)
const D_MECH_OLD_ARM: Show = Object.fromEntries(Object.entries(D_MECH).filter(([k]) => k !== 'cuff' && k !== 'latchPin'))
const DRIVE: Show = {
  fit0403: 'base', axleHw: 'base', wheels: 'base', axle: 'base', driveBracket: 'base', kp08Spacers: 'base',
  castors: 'base', castorPads: 'base', basePanel: 'base',
}
const D_ALL: Show = { ...D_BODY_SPLIT, ...D_MECH, ...DRIVE, lidV3: 'base', sheetD: 'base', sealLipD: 'base', footSensor: 'base', hall: 'base', magnets: 'base' }
// the current design
const NOW_TOP: Show = {
  s2: 'base', s3: 'base', lid: 'base', lidTop: 'base', sealLipR: 'base', tiltPins: 'base', tiltCollars: 'base',
  ...D_MECH, hall: 'base', magnets: 'base', tof: 'base', irPanel: 'base',
}
const NOW_BODY: Show = { wallFront: 'base', wallBack: 'base', wallLeft: 'base', wallRight: 'base', angles: 'base', innerBars: 'base', ...DRIVE }
const NOW_TOP_NO_SENSOR: Show = Object.fromEntries(Object.entries(NOW_TOP).filter(([k]) => k !== 'tof' && k !== 'irPanel'))
const NOW: Show = { ...ENV, ...NOW_TOP, ...NOW_BODY, ebox: 'base', eboxLid: 'base', battery: 'base', batteryCover: 'base', cables: 'base' }

const D_BOX = { bottom: 68, top: -50 }
const C_BOX = { bottom: 75, top: 0 }

export const SCENES: Record<string, SceneState> = {
  s03: {
    show: { ...ENV, oldBin: 'base' },
    cam: [[-1650, 200, 820], [-140, -330, -220]],
    anim: 'oldBinLid',
    labels: [
      { at: [-420, 156, 10], text: 'Worktop, 870 mm', frame: 'world' },
      { at: [-235, -460, -10], text: 'Addis 50 L: 580 × 330 × 420', frame: 'world' },
      { at: [210, -100, 10], text: 'Empty space ≈ 71%', frame: 'world' },
    ],
  },
  s04: {
    show: { box: 'ghost', section: 'new' },
    rim: EARLY,
    box: C_BOX,
    cam: cams.top(EARLY),
    anim: 'bagSection',
  },
  s05: {
    show: { ...CONCEPT, box: 'new', conceptLid: 'new', castorsC: 'base' },
    rim: EARLY,
    box: C_BOX,
    cam: cams.iso(EARLY),
    labels: [
      { at: [-200, 15, 0], text: '440 wide (10 mm each side)' },
      { at: [-400, -300, -220], text: '400 deep' },
    ],
  },
  s06: {
    show: { ...CONCEPT, box: 'ghost', castorsC: 'base', pedal: 'base', ballast: 'base', windowC: 'base', handleC: 'base', footSensor: 'base' },
    rim: EARLY,
    box: C_BOX,
    cam: cams.iso(EARLY),
  },
  s07: {
    show: { ...CONCEPT, castorsC: 'base', pedal: 'dead' },
    rim: EARLY,
    box: C_BOX,
    cam: [[-1500, 30, 760], [-200, -420, -220]],
    anim: 'pedal',
    labels: [{ at: [-470, -560, -120], text: '≈ 59 N needed, 45 N allowed', frame: 'bin' }],
  },
  s10: {
    show: { ...CONCEPT, driveC: 'new', footSensor: 'new', footBeam: 'new' },
    rim: EARLY,
    box: C_BOX,
    cam: [[-1600, 60, 780], [-220, -420, -220]],
    anim: 'footSensor',
    labels: [
      { at: [-420, -600, -220], text: 'Foot sensor', frame: 'bin' },
      { at: [-100, -700, -10], text: 'One drive motor', frame: 'bin' },
    ],
  },
  s11: {
    show: { ...CONCEPT, driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: C_BOX,
    cam: cams.roll(TALL),
    anim: 'rollCycle',
    labels: [{ at: [-420, 156, 20], text: 'Worktop edge', frame: 'world' }],
  },
  s12: {
    show: { ...ENV, box: 'base', flapL: 'dead', flapR: 'dead', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: C_BOX,
    roll: 440,
    cam: [[-1650, off(TALL) + 330, 900], [-200, off(TALL) - 230, -220]],
    anim: 'butterfly',
  },
  s13: {
    show: { ...CONCEPT, driveC: 'base', footSensor: 'base', torque: 'new' },
    rim: TALL,
    box: C_BOX,
    roll: 440,
    lid: 0,
    cam: [[-700, off(TALL) + 260, 900], [-180, off(TALL) + 20, -220]],
    labels: [
      { at: [-186, 160, -220], text: 'Weight ≈ 11 N' },
      { at: [14, 80, -440], text: '≈ 2.3 N·m at the hinge' },
    ],
  },
  s14: {
    show: { ...D_TOP, lidHollow: 'ghost', hingeRod: 'new', motor: 'new', lever: 'new', rimD: 'ghost', coupler: 'base', motorBeam: 'base', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: [[120, off(TALL) + 90, 330], [10, off(TALL) + 10, -222]],
    anim: 'leverClose',
    labels: [
      { at: [55, 70, -222], text: 'Tail tab' },
      { at: [40, -10, -290], text: 'Closing motor' },
    ],
  },
  s15: {
    show: { box: 'base', rimD: 'ghost', ...D_MECH_OLD_ARM, lidHollow: 'ghost', latch: 'new', cuffOld: 'new', driveC: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.latch(TALL),
    anim: 'latch',
    labels: [
      { at: [-372, 40, -228], text: 'Track plate (on the lid)' },
      { at: [-378, -14, -212], text: 'Swinging arm with a printed pin (on the rim)' },
    ],
  },
  s16: {
    show: { ...D_TOP, ...D_MECH, lidHollow: 'base', springs: 'new', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.back(TALL),
    anim: 'lidCycle',
    labels: [{ at: [10, 30, -178], text: 'Torsion spring (one each side of the tab)' }],
  },
  s18: {
    show: { box: 'base', rimD: 'ghost', ...D_MECH, lidHollow: 'ghost', latch: 'base', cuff: 'new', latchPin: 'new', driveC: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.latch(TALL),
    labels: [
      { at: [-373, 22, -219], text: 'Steel Ø 2 pin' },
      { at: [-378, 0, -220], text: 'Arm stem 4 × 4 mm' },
    ],
  },
  s20a: {
    show: { ...D_TOP, ...D_MECH, lidHollow: 'base', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    lid: -0.7,
    cam: cams.side(TALL),
    labels: [
      { at: [5, 10, 0], text: 'Back: ≈ 6 mm' },
      { at: [-395, 5, 0], text: 'Front: ≈ 2.8 mm (tilt exaggerated)' },
    ],
  },
  s20b: {
    show: { ...D_TOP, ...D_MECH, lidHollow: 'ghost', sealLipD: 'new', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.lid(TALL),
    anim: 'lidCycle',
    labels: [{ at: [-330, 12, -40], text: '1 mm silicone lip' }],
  },
  s23: {
    show: { box: 'base', rimD: 'ghost', ...D_MECH, lidHollow: 'ghost', sealLipD: 'base', b22: 'dead', driveC: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: [[-720, off(TALL) + 200, 20], [-350, off(TALL) - 15, -205]],
    anim: 'solenoid',
    labels: [
      { at: [-350, -10, -180], text: 'Ledex B22 pull solenoid' },
      { at: [-378, 30, -205], text: 'Pulls the pin out of the track' },
    ],
  },
  s24: {
    show: { ...D_TOP, ...D_MECH, lidHollow: 'base', sealLipD: 'base', motor: 'new', lever: 'new', driveC: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.back(TALL),
    anim: 'motorRelease',
    labels: [{ at: [45, -5, -230], text: 'Push once more → latch lets go' }],
  },
  s25: {
    show: { ...D_TOP, ...D_MECH, lidHollow: 'ghost', sealLipD: 'base', hall: 'new', magnets: 'new', driveC: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.hall(TALL),
    anim: 'hallPulse',
    labels: [
      { at: [-15, -8, -352], text: 'Hall sensor' },
      { at: [-15, 28, -352], text: '6 magnets in the lid' },
    ],
  },

  s27: {
    show: { ...D_BODY, box: 'ghost', ...D_MECH, lidHollow: 'base', sealLipD: 'base', ...DRIVE, fit0403: 'new', axleHw: 'new', axle: 'new', wheels: 'new', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.under(),
    anim: 'rollCycle',
    labels: [
      { at: [-120, -680, -100], text: 'FIT0403 motor + belt', frame: 'bin' },
      { at: [-55, -700, -440], text: 'Solid rear axle', frame: 'bin' },
    ],
  },
  s28: {
    show: { ...D_BODY, box: 'ghost', ...D_MECH, lidHollow: 'base', sealLipD: 'base', ...DRIVE, fit0403: 'new', castors: 'new', castorPads: 'new', wheels: 'new', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.under(),
    labels: [
      { at: [-316, -690, -40], text: 'Screwfix castor, £2.19', frame: 'bin' },
      { at: [-55, -690, -445], text: 'Printed TPU wheel, Ø 55', frame: 'bin' },
    ],
  },
  s30: {
    show: { ...D_TOP, ...D_MECH, ...DRIVE, sealLipD: 'base', acrFrame: 'new', acrSheet: 'new', acrSpine: 'new', acrLatchHolder: 'new', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.lid(TALL),
    labels: [{ at: [-200, 52, -220], text: 'Flat laser-cut sheet' }],
  },
  s31: {
    show: { ...D_TOP, ...D_MECH, ...DRIVE, sealLipD: 'base', lidV3: 'new', sheetD: 'new', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.lid(TALL),
    anim: 'lidCycle',
    labels: [{ at: [-200, 64, -220], text: 'Flush on VHB tape' }],
  },
  s33: {
    show: {
      ...D_TOP, ...D_MECH, ...DRIVE, sealLipD: 'base', footSensor: 'base',
      lidV3_FrontLeft: { look: 'new', off: [-60, 70, -60] },
      lidV3_FrontRight: { look: 'new', off: [-60, 70, 60] },
      lidV3_BackLeft: { look: 'new', off: [0, 70, -80] },
      lidV3_BackRight: { look: 'new', off: [0, 70, 80] },
      lidV3_Back: { look: 'new', off: [70, 70, 0] },
    },
    rim: TALL,
    box: D_BOX,
    cam: cams.lid(TALL),
  },
  s34: {
    show: { ...D_TOP, ...D_MECH, ...DRIVE, sealLipD: 'base', lidV3: 'new', sheetD: 'base', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.lid(TALL),
  },
  s35: {
    show: { ...D_TOP, ...D_MECH, ...DRIVE, sealLipD: 'base', lidV3: 'base', sheetD: 'new', footSensor: 'base' },
    rim: TALL,
    box: D_BOX,
    cam: cams.sheet(TALL),
    anim: 'sheetThickness',
  },
  s36: {
    show: { ...D_ALL, tiltPins: 'new', tiltCollars: 'new' },
    rim: TALL,
    box: D_BOX,
    cam: cams.tilt(),
    anim: 'tiltCycle',
    labels: [{ at: [36, -40, -60], text: 'Second hinge' }],
  },

  s38: {
    show: { ...ENV, ...NOW_TOP, ...DRIVE, footSensor: 'base', wallFront: 'new', wallBack: 'new', wallLeft: 'new', wallRight: 'new' },
    roll: 440,
    rim: TALL,
    cam: cams.iso(TALL),
    labels: [{ at: [-400, -350, -220], text: '3 mm ACM' }],
  },
  s40a: {
    show: { ...ENV, ...NOW_TOP, ...DRIVE, s2: 'new', s3: 'new', lid: 'new', lidTop: 'new', tof: 'base', irPanel: 'base', footSensor: 'base',
      wallFront: 'ghost', wallBack: 'ghost', wallLeft: 'ghost', wallRight: 'ghost' },
    roll: 440,
    rim: TALL,
    cam: cams.iso(TALL),
    labels: [{ at: [-190, -40, -220], text: 'Inside 330 × 410 → ≈ 81 L' }],
  },

  s40c: {
    show: { ...ENV, ...NOW_TOP, ...DRIVE, footSensor: 'base', wallFront: 'base', wallBack: 'base', wallLeft: 'base', wallRight: 'base', angles: 'new', innerBars: 'new' },
    roll: 440,
    rim: TALL,
    cam: [[-1150, 0 + off(TALL) * 0.5, 420], [-330, -330, -40]],
    labels: [{ at: [-360, -360, -10], text: '20 × 20 × 1.5 aluminium angle' }],
  },
  s41: {
    show: { ...ENV, ...NOW_TOP, ...NOW_BODY, footSensor: 'base', basePanel: 'new', wallFront: 'ghost', wallLeft: 'ghost' },
    roll: 440,
    rim: TALL,
    cam: [[-1150, -260, 700], [-190, -640, -220]],
    labels: [{ at: [-190, -646, -220], text: '8 mm acrylic floor', frame: 'bin' }],
  },
  s43: {
    show: { ...ENV, ...NOW_TOP, ...NOW_BODY, footSensor: 'base', dims: 'new' },
    rim: FINAL,
    cam: [[-1900, -60, 980], [-200, -300, -150]],
    labels: [
      { at: [-470, 156, 30], text: 'Worktop 870', frame: 'world' },
      { at: [-470, 56, 30], text: 'Lid top 770: 100 mm for a hand', frame: 'world' },
      { at: [-470, 0, 30], text: 'Rim 714', frame: 'world' },
      { at: [-470, -714, 30], text: 'Floor', frame: 'world' },
    ],
  },
  s44: {
    show: { ...ENV, ...NOW_TOP_NO_SENSOR, ...NOW_BODY, hcsr04: 'new', footSensor: 'dead', hand: 'base', lidBeam: 'new' },
    rim: FINAL,
    cam: [[-1900, 260, 1000], [-420, -260, -220]],
    anim: 'handRoll',
    labels: [{ at: [-380, 60, -220], text: 'Ultrasonic sensor in the lid' }],
  },
  s45: {
    show: { ...ENV, ...NOW_TOP, ...NOW_BODY, tof: 'new', irPanel: 'new', hand: 'base', lidBeam: 'base' },
    rim: FINAL,
    cam: [[-620, 230, 40], [-380, 50, -220]],
    anim: 'lidSensor',
    labels: [{ at: [-380, 62, -220], text: 'Laser sensor under 1 mm IR-clear acrylic' }],
  },
  s46: {
    show: { ...NOW, ebox: 'new', eboxLid: 'new', battery: 'new', batteryCover: 'new', cables: 'new', wallFront: 'ghost', wallLeft: 'ghost' },
    rim: FINAL,
    cam: [[-1050, -610, 330], [-250, -690, -220]],
    labels: [
      { at: [-240, -672, -300], text: 'Arduino Uno + 2 motor drivers', frame: 'bin' },
      { at: [-300, -712, -110], text: 'Slide-out battery', frame: 'bin' },
    ],
  },

  final: {
    show: NOW,
    rim: FINAL,
    cam: [[-1450, 60, 800], [-170, -330, -220]],
    hotspots: [
      { id: 'latch', at: [-404, -6, -228], title: 'Click-pen latch', text: 'Push to latch, push again to release. The closing motor gives the second push, so there is no solenoid.' },
      { id: 'seal', at: [-200, 2, -18], title: 'Silicone lip seal', text: 'A 1 mm silicone lip in an angled printed slot. It bends instead of squashing, so it seals for ≈ 1–2 N.' },
      { id: 'springs', at: [14, 30, -178], title: 'Springs open, motor closes', text: 'Two torsion springs open the lid. The motor only pushes the tail tab to close it, then parks out of the way.' },
      { id: 'tilt', at: [36, -40, -60], title: 'Tilt-up top', text: 'The rim and lid hinge back for a bag change. Nothing has to be unplugged.' },
      { id: 'sensor', at: [-350, 63, -250], title: 'Hand sensor', text: 'A laser time-of-flight sensor under a black, infrared-clear panel, flush with the lid.' },
      { id: 'walls', at: [-361, -330, -12], title: 'ACM walls, aluminium corners', text: '3 mm aluminium composite, ≈ 37× stiffer than PVC foam board of the same thickness.' },
      { id: 'drive', at: [-55, -688, -12], title: 'One-motor drive', text: 'A belt to a solid rear axle rolls the bin 440 mm straight out and back.' },
      { id: 'power', at: [-290, -690, -134], title: 'Battery and Arduino', text: 'A slide-out 3-cell pack and an Arduino Uno under the floor. Nothing extra.' },
    ],
  },
}

/** Parts each brainstorm sketch refers to (S06). */
export const BRAINSTORM_PARTS: Record<string, string[]> = {
  pedal: ['pedal'],
  lid: ['conceptLid'],
  plan: ['box'],
  rota: ['windowC'],
  sensor: ['footSensor'],
  squash: ['handleC'],
  weight: ['ballast'],
  tracks: ['castorsC'],
}
