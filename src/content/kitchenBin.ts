// The kitchen bin's problem, specification and design timeline.
// Calculations are written out in text for now; Ethan is redoing each one by hand.

import type { Table } from './projects'

export type Calc = { kind: 'calc'; title: string; given?: string; lines: string[]; result: string }

export type Block =
  /** lead = the problem or idea at the top of a step; [[words]] show `calc` when hovered */
  | { kind: 'text'; text: string; lead?: boolean; calc?: Calc; calcs?: Calc[] }
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'table'; table: Table; calc?: Calc }
  | { kind: 'widget'; name: 'brainstorm' | 'latch' | 'springs' | 'dovetail' | 'seal' }
  /** the decision at the bottom; `dropped` is shown in red first */
  | { kind: 'outcome'; text: string; dropped?: string; calc?: Calc }
  | { kind: 'cite'; text: string }

export type Step = {
  id: string
  date: string
  title: string
  /** Something tried and dropped. */
  dead?: boolean
  /** Short note shown on the 3D view. */
  pointer: string
  blocks: Block[]
}

export type Chapter = { title: string; steps: Step[] }

/** **Figures** in the points are picked out in bold blue. */
export const problem = {
  intro: 'Nine of us share one 50 L pedal bin in our flat on Bath’s high street, and it lets us down every day.',
  points: [
    'It fills in under a day: we throw away about **57 L** of rubbish a day, and there’s no recycling collection on the high street.',
    'The lid is left open about **20%** of the time, so there are **5–10** fruit flies in the kitchen on a normal day.',
    'The pedal only opens the lid to **55°**, so rubbish misses and lands on the floor.',
    'It’s light and top-heavy, so it falls over.',
    'It fills less than **a third** of the space under the worktop.',
  ],
  note: 'Bags counted over a week; the other figures are my own observations.',
}

export const specification: Table = {
  head: ['Requirement', 'Target', 'Why'],
  rows: [
    ['1. Fits the space', 'Within 870 H × 700 D × 460 W under the worktop, standalone', 'Measured space; we rent, so nothing can be fixed to the kitchen'],
    ['2. Holds more', '≥ 80 L, about a day and a half of rubbish', '57 L a day measured; the current bin holds 50 L'],
    ['3. Opens hands-free and wide', 'No pedal or handle; the lid opens clear of the worktop', 'The pedal only manages 55° under the worktop'],
    ['4. Fly-proof when shut', 'No gap over 1 mm round the lid', 'Fruit flies get through gaps of about 1 mm'],
    ['5. Shuts itself, and knows it', 'Closes on its own and checks it is shut before rolling home', 'Left open ≈ 20% of the time'],
    ['6. Works with the power off', 'Lid opens and shuts by hand; the bin can be pushed', 'A flat battery must never trap the rubbish'],
    ['7. Doesn’t tip', '≥ 20 N push at the rim to tip it over, empty', 'The current bin falls over'],
    ['8. Easy bag change', 'Without lifting the bag over a high rim or unplugging anything', 'Nine people have to be willing to do it'],
    ['9. Hygienic', 'Smooth, wipe-clean materials; no wood', 'It is a kitchen bin'],
    ['10. Affordable', 'Whole project ≤ £200', 'A student budget'],
  ],
}

export const finalStep = {
  title: 'Where it is now',
  pointer: 'The design as it stands. Click the numbers.',
  text: 'Everything that survived the process. The lid frame is printed, and the rest of the build is waiting for a laser cutter big enough for the panels.',
}

/** Building the prototype, step by step (a photo and a card for each). **Figures** in bold blue. */
export type BuildStep = {
  title: string
  text: string[]
  image: { src: string; alt: string; caption: string }
}

export const build: BuildStep[] = [
  {
    title: 'Printing the lid',
    text: [
      'The first part of the prototype is made. The lid frame is bigger than any 3D printer bed in the university Makerspace, so I designed it in **5** pieces that join with printed dovetails, then printed them and fitted them together.',
      'A laser-cut acrylic top drops into the frame, which used about half the filament of a fully printed lid.',
    ],
    image: {
      src: '/images/bin-lid-printed.webp',
      alt: 'The black 3D-printed lid frame of the bin on a desk, its five printed pieces joined into one rounded rectangle with the hinge tab at the back',
      caption: 'The printed lid frame, joined from five pieces.',
    },
  },
  {
    title: 'On hold',
    text: [
      'The next parts, starting with the acrylic lid top, need a laser cutter with a bed big enough for them, and the university’s isn’t free for students to use at the moment.',
      'The build is on hold until it is. Then the rest of the body, the drive and the electronics go together into the first full prototype.',
    ],
    image: {
      src: '/images/kitchen-bin-render.webp',
      alt: 'Render of the finished bin design from the Inventor model, stowed under the worktop',
      caption: 'Where it’s heading: the full design, waiting on the laser cutter.',
    },
  },
]

export const aiNote = 'AI was used to help with research and calculations.'

export { chapters } from './kitchenBinSteps'
