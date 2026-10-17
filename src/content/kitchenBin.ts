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

export const problem = {
  intro: 'Nine of us share one 50 L pedal bin in our flat on Bath’s high street, and it lets us down every day.',
  points: [
    '**It fills in under a day.** There’s no recycling or food-waste collection on the high street, so everything goes in the one bin.',
    '**The lid gets left open.** When the bin is too full, or the hinges have worked loose, it doesn’t shut, so fruit flies and maggots get in.',
    '**It doesn’t open far enough.** The pedal only lifts the lid to 55°, so rubbish misses and lands on the floor.',
    '**It falls over.** It’s light and top-heavy.',
    '**It wastes the space.** It sits in a gap under the worktop that’s 870 mm high and 700 mm deep, and fills less than a third of it.',
  ],
  stats: [
    { value: '57 L', label: 'of rubbish a day (8 bags in a week)' },
    { value: '≈ 20 %', label: 'of the time the lid is left open' },
    { value: '55°', label: 'is as far as the pedal opens the lid' },
    { value: '5–10', label: 'fruit flies in the kitchen on a normal day' },
  ],
  note: 'Bags counted over one week; the other figures are my own observations.',
}

export const specification: Table = {
  head: ['Requirement', 'Target', 'Why'],
  rows: [
    ['1. Fits the space', 'Within 870 H × 700 D × 460 W under the worktop, standalone', 'Measured space; we rent, so nothing can be fixed to the kitchen'],
    ['2. Holds more', '≥ 80 L, about a day and a half of rubbish', '57 L a day measured; the current bin holds 50 L'],
    ['3. Opens hands-free and wide', 'No pedal or handle; the lid opens clear of the worktop', 'The pedal only manages 55° under the worktop'],
    ['4. Fly-proof when shut', 'No gap over 1 mm round the lid', 'Fruit flies get through gaps of about 1 mm'],
    ['5. Shuts itself, and knows it', 'Closes on its own and checks it is shut before rolling home', 'Left open ≈ 20 % of the time'],
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
  text: 'Everything that survived the process. The lid pieces are printed, and the sheets, aluminium and electronics are bought, so the first prototype is next.',
}

export const aiNote = 'AI was used to help with research and calculations.'

export { chapters } from './kitchenBinSteps'
