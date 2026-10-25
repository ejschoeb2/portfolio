// The design timeline, step by step. Each step reads: the problem or idea at the top (lead),
// the evidence in the middle, and the decision at the bottom (outcome). [[Underlined]] words
// show the working for their calculation when hovered.

import type { Calc, Chapter } from './kitchenBin'

const c = (title: string, lines: string[], result: string, given?: string): Calc => ({ kind: 'calc', title, lines, result, given })

export const chapters: Chapter[] = [
  {
    title: 'The brief',
    steps: [
      {
        id: 's03', date: '3 Oct', title: 'Our bin', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'I started by measuring our bin and the space under the worktop. Our 50 L pedal bin used [[less than a third of the space]], and its lid could only open to 55° before it nearly hit the worktop.',
            calc: c('How much of the space it uses', [
              'Space: 0.870 × 0.700 × 0.460 = 0.280 m³',
              'Bin (outer box): 0.580 × 0.330 × 0.420 = 0.080 m³',
              '0.080 ÷ 0.280 = 0.29',
              'Lid at 55°: 330 × sin 55° ≈ 270 mm above the rim, so 580 + 270 = 850 mm, against a worktop at 870 mm',
            ], 'About 29 % of the space, and the lid is 20 mm from the worktop'),
          },
          { kind: 'outcome', text: 'So a new bin could be much bigger without taking more room, but a deeper lid would hit the worktop even sooner.' },
        ],
      },
      {
        id: 's04', date: '3 Oct', title: 'Bag size', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I realised the bag size determined the cross-section of the bin, because the bag had to be big enough to fit comfortably round the rim.' },
          {
            kind: 'table',
            table: {
              head: ['Bag', 'Flat size (mm)', 'Open loop (mm)', 'Capacity'],
              rows: [
                ['50–60 L kitchen liner', '600 × 820', '1200', '≈ 49 L'],
                ['Refuse sack, 18 × 29 × 39 in', '457 (737 open) × 990', '1474', '≈ 91 L'],
                ['Wide 100 L drawstring sack', '820 × 920', '1640', '≈ 102 L'],
              ],
            },
            calc: c('From bag to bin (refuse sack)', [
              'Rim perimeter ≤ 0.95 × open loop (5 % slack to fold over, est.)',
              '0.95 × 1474 = 1400 mm → square side 1400 ÷ 4 = 350 mm',
              'Useful depth = 990 − 100 (over the rim) − 150 (bottom corners, est.) = 740 mm',
              'V = 0.350 × 0.350 × 0.740 = 0.0907 m³',
            ], '≈ 91 L'),
          },
          { kind: 'text', text: 'The open loop is the distance round the mouth of a bag once it is opened out, about twice its flat width. My rim perimeter had to stay smaller than it, so the bag folds over without straining.' },
          { kind: 'outcome', text: 'Wide 100 L sacks were big enough for a bin filling the whole width, so I could size the bin to the space.' },
        ],
      },
    ],
  },
  {
    title: 'The pedal',
    steps: [
      {
        id: 's06', date: '3 Oct', title: 'Brainstorm', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I sketched every idea I had in GoodNotes.' },
          { kind: 'widget', name: 'brainstorm' },
          { kind: 'outcome', text: 'The idea that stuck was rolling the bin out from under the worktop, so the lid could open wide.' },
        ],
      },
      {
        id: 's07', date: '3 Oct', title: 'Pedal', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'My first plan was a pedal that rolled the bin out and lifted the lid. I researched pedal forces and found a published limit of 45 N for a pedal pushed with the ankle.¹ Then I worked out what different versions of my design would need.' },
          {
            kind: 'table',
            table: {
              head: ['Version of my design', 'Bag', 'Capacity', 'Pedal force needed'],
              rows: [
                ['One lid', '60 L liner', '48 L', '43 N: just over'],
                ['One lid', 'Refuse sack', '53 L', '59 N: fails'],
                ['Butterfly (two flaps)', '60 L liner', '49 L', '35 N: passes'],
                ['Butterfly (two flaps)', 'Refuse sack', '74 L', '47 N: fails'],
              ],
            },
            calc: c('Pedal force from energy (refuse sack, one lid)', [
              'Mass: ply box 7.3 kg + lid 0.96 kg + 53 L × 0.16 kg/L = 8.5 kg → M ≈ 16.8 kg',
              'Rolling: E = μ M g s = 0.025 × 16.8 × 9.81 × 0.233 ≈ 0.96 J',
              'Lid: E = m g (L/2) sin θ = 0.955 × 9.81 × 0.187 × sin 61° ≈ 1.53 J',
              'Pedal: F = 2.49 ÷ (0.7 efficiency × 0.060 m travel)',
              'The other rows use the same method with each version’s sizes',
            ], 'F ≈ 59 N, over the 45 N limit', 'Rolling resistance 0.025, efficiency 0.7, 60 mm of travel (all est.).'),
          },
          { kind: 'outcome', dropped: 'Dropped the pedal.', text: 'Only one version passed, and it held no more than our current bin.' },
          { kind: 'cite', text: '¹ US Department of Defense, MIL-STD-1472G Human Engineering (2012), Fig. 21, pedals: ankle movement only.' },
        ],
      },
      {
        id: 's10', date: '3 Oct', title: 'Electronic', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I decided to switch to an electronic bin, so motors would roll the bin out instead. A foot sensor near the floor would detect movement and move the bin accordingly.' },
          { kind: 'outcome', text: 'With a motor doing the work there was no force limit, so a big bag was possible again. I set three rules for it: it had to work by hand with the power off, only roll home with the lid shut, and close slowly so it couldn’t trap a hand.' },
        ],
      },
    ],
  },
  {
    title: 'Size and lid',
    steps: [
      {
        id: 's11', date: '3 Oct', title: 'Tall bin', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'Next I thought about height. [[The calculations]] made it clear that the best way to maximise capacity was a tall bin that rolls fully out, then opens.',
            calc: c('Roll-out for a lid hinged at the back', [
              'Gap above the lid = 870 − 15 − rim − 20',
              'The lid clears the worktop at angle θ once roll-out s ≥ 400 + 40 − gap ÷ tan θ',
              'Open 55° in place: gap ≥ 400 × sin 55° = 328 → rim ≤ 507 mm',
              'Rim 650: gap 185 → s = 440 − 185 ÷ tan 55° ≈ 310 mm',
              'Rim 835: gap 0 → s = 440 mm, the whole bin is clear first',
              'Capacity = 0.376 × 0.416 × (rim − 75)',
            ], 'Once it rolls fully clear, extra height costs no extra roll-out'),
          },
          {
            kind: 'table',
            table: {
              head: ['Option', 'Rim (mm)', 'Capacity', 'Roll-out'],
              rows: [
                ['Short: opens in place', '≤ 507', '≈ 68 L', '0'],
                ['Compromise', '650', '≈ 90 L', '≈ 310 mm'],
                ['Tall: rolls clear, then opens', 'up to 835', '≈ 119 L', '440 mm'],
              ],
            },
          },
          { kind: 'outcome', text: 'I chose the tall bin, rolling out 440 mm before the lid opens.' },
        ],
      },
      {
        id: 's12', date: '3–4 Oct', title: 'Butterfly lid', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I tried a butterfly lid, with two flaps opening from the middle, and compared the pros and cons.' },
          {
            kind: 'table',
            table: {
              head: ['For', 'Against'],
              rows: [
                ['About half the force to lift each flap', 'Can’t open until the bin is fully out, so slower'],
                ['Flaps stand lower when open', 'The centre seam needs its own fly-proof seal'],
                ['Light enough for a pedal', 'Needs a linkage to drive both flaps'],
              ],
            },
          },
          { kind: 'outcome', dropped: 'Dropped the butterfly lid.', text: 'Without a pedal its light lift no longer mattered, and the seam would be the hardest place to seal.' },
        ],
      },
    ],
  },
  {
    title: 'Opening and closing',
    steps: [
      {
        id: 's13', date: '4 Oct', title: 'Motors', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'Next, how the lid opens and closes. Every small motor I could find was [[too weak]] to hold the lid up on its own.',
            calc: c('Torque to hold the lid', [
              'Lid: 0.400 × 0.440 × 0.009 m plywood × 600 kg/m³ + 0.2 kg fittings ≈ 1.15 kg (est.)',
              'Centre of mass ≈ 0.20 m from the hinge',
              'T = m g d = 1.15 × 9.81 × 0.20 ≈ 2.26 N·m',
              'Best small gearmotor in stock: rated 0.88 N·m',
              '2.26 ÷ 0.88 ≈ 2.6 × its rating',
            ], 'About 2.6 times too much for a cheap motor'),
          },
          {
            kind: 'outcome',
            text: 'So I decided to use springs to carry most of the lid’s weight. Gas struts were a bad fit, with only about 10 mm spare each side. But two torsion springs on the hinge rod take almost no room, and their [[torque]] falls as the lid opens, just like its weight.',
            calc: c('Spring torque', [
              'Lee Spring LTL/LTR095G10M: 16.6 N·mm per degree each',
              'Wound 100° when shut: T = 16.6 × 100 = 1660 N·mm ≈ 1.66 N·m each',
              'Two springs ≈ 3.3 N·m shut, falling to ≈ 0.66 N·m at 80° open',
            ], 'More than the lid’s weight when shut, so it opens itself')
          },
        
        ],
      },
      {
        id: 's14', date: '4 Oct', title: 'Springs and motor', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I had to make sure the lid could still be opened and closed by hand. If the motor were fixed to the lid, shutting it by hand would turn the gearbox backwards and could damage it.' },
          { kind: 'outcome', text: 'So the springs open the lid, and the motor turns a lever that only pushes the tail tab behind the hinge to close it, then swings back out of the way.' },
        ],
      },
      {
        id: 's15', date: '4 Oct', title: 'Latch', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I wanted to push the lid to open it and push it to shut it, which magnets can’t do. So I designed a click-pen latch with a heart-shaped track. It needs no power.' },
          { kind: 'widget', name: 'latch' },
        ],
      },
      {
        id: 's18', date: '5–6 Oct', title: 'Latch strength', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'I checked whether the latch could take its [[loads]] (up to 68 N). The [[printed pin]] would have snapped, and the [[2 × 2 mm arm]] was too thin.',
            calcs: [c('Load on the pin', [
              'Springs’ push at the latch: 0.57 N·m ÷ 0.39 m ≈ 1.5 N',
              'Stiff seal: 10 N × 414 ÷ 390 ≈ 10.6 N',
              'Jolts while rolling ≈ 3 N (est.)',
              'Total ≈ 15 N; a 50 N yank adds 50 × 414 ÷ 390 → ≈ 68 N',
            ], '15 N design load, 68 N misuse'), c('Pin bending (Ø 2 mm, load 1.5 mm out)', [
              'σ = 32 F L ÷ (π d³) = 32 × 15 × 1.5 ÷ (π × 2³) ≈ 28.6 MPa',
              'Printed, across its layers ≈ 20 MPa → safety factor 0.7',
              'Steel ≈ 400 MPa → safety factor 14',
            ], 'A printed pin fails; steel is fine'), c('Arm stem', [
              'Z = 2 × 2² ÷ 6 = 1.33 mm³; offset 2.5 mm',
              'σ = 15 × 2.5 ÷ 1.33 + 15 ÷ 4 ≈ 32 MPa → safety factor ≈ 1.4',
              'Buckling P = π² E I ÷ L² = π² × 2100 × 1.33 ÷ 24² ≈ 48 N, below 68 N',
              '4 × 4 mm: σ ≈ 5.9 MPa, buckling ≈ 770 N',
            ], 'A 4 × 4 mm stem is safe')],
          },
          { kind: 'outcome', text: 'I switched to a steel pin and a 4 × 4 mm arm, and set the bump stops at about 3 mm.' },
        ],
      },
    ],
  },
  {
    title: 'Keeping flies out',
    steps: [
      {
        id: 's20a', date: '6 Oct', title: 'Seal problem', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'The lid needed a seal all round, as flies get through about 1 mm. But to click, the push-pen latch pushes the lid past where it rests, so the seal at the front is squashed [[about 3 mm more than at the back]]. Off-the-shelf seals needed [[far too much force]] to squash that far.',
            calcs: [c('The gap is a wedge', [
              'Latched, the lid sits flat with a 6 mm gap',
              'To latch, the front goes ≈ 3 mm further onto the stops: ≈ 2.8 mm gap',
              'The back is beside the hinge and barely moves: ≈ 6 mm',
            ], 'The seal must fill 6 mm and still squash to 2.8 mm at the front'), c('Force budget', [
              'Spare force at the front edge ≈ 5 N (est.)',
              'The 1.4 m seal acts like ≈ 716 mm at the front',
              'Bulbs ≈ 1–15 N per 100 mm → 7 to 107 N',
              'A squashed U-channel is still 3–4.5 mm tall, more than 2.8 mm',
            ], 'Nothing off the shelf fits')],
          },
          { kind: 'outcome', text: 'So I needed a way of sealing it that allowed for that much variation in compression: a seal that bends out of the way instead of squashing.' },
        ],
      },
      {
        id: 's20b', date: '6–9 Oct', title: 'Silicone lip', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I designed a 1 mm silicone lip, held at an angle in a printed slot, so it bends rather than squashes.' },
          { kind: 'widget', name: 'seal' },
          {
            kind: 'outcome',
            text: 'I bought a 1 mm silicone sheet to cut into strips. The other options were [[too stiff]].',
            calc: c('Why thin and soft', [
              'A lip is a small cantilever: stiffness ∝ E t³ ÷ L³',
              '1.0 → 0.8 mm: 0.8³ = 0.51, half the force',
              '2 mm neoprene: 2³ = 8× for thickness × ≈ 2.5× harder rubber ≈ 20×',
              '1 × 15 mm silicone, 11 mm free: ≈ 1.0 N latched, ≈ 1.7 N at the stops (est.)',
            ], 'Inside the ≈ 5 N budget'),
          },
        ],
      },
    ],
  },
  {
    title: 'Opening it automatically',
    steps: [
      {
        id: 's23', date: '6–9 Oct', title: 'Solenoid', dead: true, pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'To make the bin open by itself, something had to pull the latch pin out of its track. A pull solenoid would need [[about 10.5 N]].',
            calc: c('Solenoid force needed', [
              'Pin friction + slide friction + return spring ≈ 3.9 N (est.)',
              '× 1.5 safety factor ≈ 5.9 N',
              'Force ∝ voltage²; to work from a part-flat 9 V battery: 5.9 ÷ (9 ÷ 12)²',
            ], '≈ 10.5 N at 12 V'),
          },
          { kind: 'text', text: 'The only one strong enough, a Ledex B22, cost about £24 and drew 3.3 A, so it needed its own driver electronics.' },
          { kind: 'outcome', dropped: 'Therefore I dropped the solenoid,', text: 'since it was the most expensive part in the bin and added unnecessary extra complexity.' },
        ],
      },
      {
        id: 's24', date: '10 Oct', title: 'Motor release', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I realised the closing motor could be used to give a secondary push, releasing the lid from the latch so the springs could open it.' },
          { kind: 'outcome', text: 'This removed the solenoid and its electronics, saving money and making the design much simpler.' },
        ],
      },
      {
        id: 's25', date: '9–13 Oct', title: 'Lid sensor', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The bin had to know when the lid was shut, so it never rolls home with the lid open.' },
          { kind: 'text', text: 'A Hall sensor in the back of the rim reads six small magnets in the lid above it.' },
          { kind: 'outcome', text: 'My first sensor was the wrong type, so I swapped it for a linear SS49E. The magnet hole was lost in a CAD change, so I’ll drill it.' },
        ],
      },
    ],
  },
  {
    title: 'Rolling out',
    steps: [
      {
        id: 's26', date: '7 Oct', title: 'Following bin', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I wanted the bin to turn and follow you round the kitchen.' },
          { kind: 'list', items: ['Two motors on sprung wheels.', 'Sensing to track a person.', 'About £140–155 in parts.'] },
          { kind: 'outcome', dropped: 'Dropped the following bin.', text: 'It wasn’t in my specification and didn’t fix anything I’d measured.' },
        ],
      },
      {
        id: 's27', date: '7 Oct', title: 'Drive', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The bin only needs to go straight in and out of its slot.' },
          {
            kind: 'text',
            text: 'One motor drives a solid rear axle through a belt, so it can’t veer. It works at [[about 20 % of its stall torque]].',
            calc: c('Sizing the motor', [
              'Full bin 33 kg (est.), rolling resistance 0.03, 1° floor slope, starts at 0.3 m/s²',
              'F = 9.7 + 5.7 + 9.9 ≈ 25 N; × 1.5 ≈ 38 N',
              'Axle: 38 × 0.0275 ≈ 1.04 N·m',
              'Motor: 1.04 ÷ (1.5 × 0.95) ≈ 0.73 N·m, of 3.7 N·m stall',
            ], '≈ 20 % of stall, ≈ 0.2 m/s'),
          },
          { kind: 'outcome', text: 'I chose a DFRobot FIT0403 motor, with an encoder to count how far the bin has rolled.' },
        ],
      },
      {
        id: 's28', date: '7 Oct', title: 'Wheels', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I needed cheap wheels that kept the base low.' },
          { kind: 'text', text: 'Screwfix swivel castors at £2.19 each are only 49.4 mm tall, so the base dropped 20 mm. Printed TPU wheels at the back are driven through metal couplers.' },
          { kind: 'outcome', text: 'Low cost, and more height for the bin.' },
        ],
      },
    ],
  },
  {
    title: 'Making the lid',
    steps: [
      {
        id: 's30', date: '8 Oct', title: 'Sheet lid', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'Printing the whole lid as a shell would cost too much, and it wouldn’t fit any printer I can use.' },
          {
            kind: 'table',
            table: {
              head: ['Top sheet', 'Lid mass (est.)', 'Sag under a 20 N press'],
              rows: [
                ['3 mm acrylic', '≈ 1.18 kg', '≈ 4.7 mm'],
                ['4 mm acrylic', '≈ 1.38 kg', '≈ 2 mm'],
                ['6 mm plywood', '≈ 1.26 kg', '≈ 0.3 mm'],
              ],
            },
          },
          { kind: 'outcome', text: 'I changed the lid to a flat laser-cut acrylic sheet on a printed frame: about half the filament, and it wipes clean.' },
        ],
      },
      {
        id: 's31', date: '8–9 Oct', title: 'Flush top', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I didn’t want bolts showing on top.' },
          { kind: 'text', text: 'The sheet now sits flush in a recess on VHB tape. I rebuilt the lid as one part in Inventor, and the checks found two clashes: hinge bores with no clearance, and the back wall hitting the spring pads.' },
          { kind: 'outcome', text: 'I fixed both, keeping the lid walls clean.' },
        ],
      },
      {
        id: 's33', date: '9–12 Oct', title: 'Lid pieces', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The lid is too big for any print bed I can use.' },
          { kind: 'widget', name: 'dovetail' },
          { kind: 'text', text: 'The joints went from bolts and dowels, to bolts, to printed pins, to printed dovetails.' },
          { kind: 'outcome', text: 'I split it into five pieces with glued dovetails, since the taped-on top holds everything together anyway.' },
        ],
      },
      {
        id: 's34', date: '9 Oct', title: 'Filament', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I had to choose a filament for the lid.' },
          {
            kind: 'table',
            table: {
              head: ['', 'PETG', 'PLA'],
              rows: [
                ['Strength', 'Tough, bends rather than cracks', 'Stiffer but cracks'],
                ['Heat', 'Copes with a kitchen', 'Softens from ≈ 50 °C'],
                ['Printing', 'Harder', 'Easy and accurate'],
              ],
            },
          },
          { kind: 'outcome', text: 'I printed the prototype in PLA, because the Makerspace only had clear PETG. Anything that creeps or cracks gets reprinted in PETG.' },
        ],
      },
      {
        id: 's35', date: '11–15 Oct', title: 'Lid weight', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'Weighing the model showed a 4 mm acrylic top made the lid too heavy for the springs.' },
          { kind: 'widget', name: 'springs' },
          {
            kind: 'table',
            table: {
              head: ['Top', 'Lid (est.)', 'Weakest opening torque', 'Spring wind needed'],
              rows: [
                ['3 mm', '1.09–1.21 kg', '≈ +0.4 N·m', '≈ 96°'],
                ['4 mm', '1.33–1.45 kg', '≈ 0: stalls', '≈ 108°'],
                ['5 mm', '≈ 1.5–1.6 kg', '≈ −0.3 N·m', '≈ 117°'],
              ],
            },
            calc: c('Torque balance at 28° open', [
              'Springs: S = 2 × 16.6 × (100 − 28) × 0.96 ≈ 2.29 N·m',
              'Weight: W = m g R cos(θ + 9.6°), R = 0.21 m',
              '3 mm, 1.15 kg: W ≈ 1.88 → net ≈ +0.42 N·m',
              '4 mm, 1.39 kg: W ≈ 2.27 → net ≈ 0.03 N·m',
              '5 mm, 1.58 kg: W ≈ 2.57 → net ≈ −0.28 N·m',
            ], 'Only 3 mm opens with the springs as drawn', 'The net torque must stay above ≈ 0.25 N·m all the way to 80°.'),
          },
          { kind: 'outcome', text: '4 mm wasn’t available anyway, so I went with 3 mm. 5 mm would also have stood 1 mm proud.' },
        ],
      },
    ],
  },
  {
    title: 'Changing the bag',
    steps: [
      {
        id: 's36', date: '8–11 Oct', title: 'Tilt-up top', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'Changing the bag was hard with the lid, motor and latch all on the top.' },
          {
            kind: 'text',
            text: 'I made the whole top tilt back on a second hinge. [[Sweeping every part]] through the tilt showed where the hinge could go.',
            calc: c('What the sweep showed', [
              'Under the worktop the top only tips ≈ 36° before the lid hits the edge',
              'So for a bag change the bin rolls out a further 150 mm',
              'The hinge sits 16 mm behind the back face, to clear the motor’s cable',
              'Past ≈ 78° the top would fall back, so a stop holds it at ≈ 90°',
            ], 'Hinge at 16 mm behind the back, stop at ≈ 90°'),
          },
          { kind: 'outcome', text: 'Now nothing needs unplugging, and the top rests open on its own for a bag change.' },
        ],
      },
      {
        id: 's37', date: '8–13 Oct', title: 'Rim pieces', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The rim layers are too big to print whole.' },
          { kind: 'outcome', text: 'I split each into four pieces. After four joint designs, I settled on glued dovetails like the lid.' },
        ],
      },
    ],
  },
  {
    title: 'The body',
    steps: [
      {
        id: 's38', date: '10 Oct', title: 'Body material', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'I looked again at what the body should be made of.' },
          {
            kind: 'table',
            table: {
              head: ['Option', 'Problem'],
              rows: [
                ['Plywood', 'Soaks up spills and smells'],
                ['A bought bin', 'None fit; the closest (≈ £76–96) is 70 mm too tall'],
                ['One folded aluminium composite sheet', '≈ £150–180'],
                ['A curved skin', 'Too much work for a curved front'],
              ],
            },
          },
          { kind: 'outcome', dropped: 'Dropped the plywood body.', text: 'With a £200 budget it had to be flat panels, which meant square corners.' },
        ],
      },
      {
        id: 's40a', date: '11 Oct', title: 'Square corners', pointer: '',
        blocks: [
          {
            kind: 'text', lead: true,
            text: 'Flat walls needed square corners, so the rim and lid became a rounded rectangle. The walls sit inside the rim’s seal line, which cut the capacity to [[about 81 L]].',
            calc: c('Capacity and bag', [
              'Inside the walls: 330 × 410 mm; height 596 mm',
              'V = 0.330 × 0.410 × 0.596 ≈ 0.081 m³',
              'Bag loop needed: 2 × (330 + 410) ÷ 0.95 ≈ 1560 mm; the 100 L sack is 1640',
            ], '≈ 81 L, and a 100 L sack fits'),
          },
          { kind: 'outcome', text: 'Still 1.6 times our current bin, and the bag lifts straight out.' },
        ],
      },
      {
        id: 's40b', date: '10–12 Oct', title: 'Walls', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The walls must stay flat when someone leans on the bin.' },
          {
            kind: 'table',
            table: {
              head: ['3 mm sheet', 'Bend under a 50 N push'],
              rows: [
                ['Aluminium composite (ACM)', '≈ 1.5 mm'],
                ['ACM, 2 mm', '≈ 3.8 mm'],
                ['Acrylic', '≈ 16 mm'],
                ['Polypropylene', '≈ 39 mm'],
                ['PVC foam board', '≈ 57 mm'],
              ],
            },
            calc: c('Wall bending', [
              'Wall 416 × 600 mm, held on all four edges (est.)',
              'w = α P a² ÷ D, α ≈ 0.0151',
              'ACM, two 0.3 mm skins 2.7 mm apart: D ≈ E t d² ÷ 2(1 − ν²) ≈ 86 000 N·mm',
              'w = 0.0151 × 50 × 416² ÷ 86 000 ≈ 1.5 mm',
            ], 'ACM is ≈ 37 times stiffer than PVC foam'),
          },
          { kind: 'outcome', text: 'PVC foam would have felt flimsy, so I chose 3 mm brushed aluminium composite.' },
        ],
      },
      {
        id: 's40c', date: '11–13 Oct', title: 'Corners', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The flat walls needed joining at the corners.' },
          { kind: 'outcome', text: 'Aluminium angle up the corners and round the floor was cheaper and stronger than printed posts. The walls slot 10 mm into the rim, gripped by small printed ribs.' },
        ],
      },
      {
        id: 's41', date: '11 Oct', title: 'Floor', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The floor carries a full bag of about 27 kg, and the drive bolts to it.' },
          {
            kind: 'table',
            table: { head: ['Acrylic floor', 'Sag under a full bag'], rows: [['4 mm', '≈ 7.1 mm'], ['6 mm', '≈ 2.1 mm'], ['8 mm', '≈ 0.9 mm']] },
            calc: c('Floor sag', [
              'Panel 330 × 410 mm, edges held by the walls (est.)',
              'q = 27 × 9.81 ÷ (0.330 × 0.410) ≈ 0.00196 N/mm²',
              'D = 3200 × 8³ ÷ (12 × 0.88) ≈ 155 000 N·mm',
              'w = 0.0059 × 0.00196 × 330⁴ ÷ 155 000 ≈ 0.9 mm',
            ], '8 mm sags ≈ 0.9 mm'),
          },
          { kind: 'outcome', text: 'I chose 8 mm acrylic: it sags under 1 mm, and every hole can be laser-cut in place.' },
        ],
      },
      {
        id: 's43', date: '11 Oct', title: 'Height', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The tall 835 mm rim no longer fitted under the worktop with the real lid on, and I wanted room for a hand above the lid.' },
          {
            kind: 'table',
            table: {
              head: ['Level', 'Height above the floor (mm)'],
              rows: [['Worktop', '870'], ['Lid top', '770'], ['Rim', '714'], ['Walls', '60 to 674']],
            },
          },
          { kind: 'outcome', text: 'I lowered the bin 121 mm, leaving a 100 mm gap, which set the wall panels at 614 mm.' },
        ],
      },
    ],
  },
  {
    title: 'Sensing and electronics',
    steps: [
      {
        id: 's44', date: '11 Oct', title: 'Hand sensor', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'My foot sensor near the floor sat right in the bin’s own path.' },
          { kind: 'outcome', text: 'I moved the sensor into the lid, facing up: you hold a hand over the bin and it rolls out to you. When stowed it sees the worktop, so it also knows it’s home.' },
        ],
      },
      {
        id: 's45', date: '11–12 Oct', title: 'Laser sensor', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'The ultrasonic sensor couldn’t see through the acrylic, so it would need holes in the lid, and mine was faulty anyway.' },
          { kind: 'outcome', dropped: 'Dropped the ultrasonic sensor.', text: 'A laser time-of-flight sensor now sits under a black, infrared-clear panel: flush, with nothing to clean round.' },
        ],
      },
      {
        id: 's46', date: '12–13 Oct', title: 'Battery', pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'A trailing mains cable didn’t suit a bin that drives in and out.' },
          {
            kind: 'text',
            text: 'It runs on a slide-out battery and the Arduino Uno I already had, lasting [[about 2.5–3.5 days]] a charge.',
            calc: c('Battery life (est.)', [
              'Standby ≈ 0.9 W × 24 h ≈ 21.6 Wh, plus ≈ 0.7 Wh of movement',
              'Pack 3S2P ≈ 5–7 Ah × 11.1 V ≈ 55–78 Wh',
              '55–78 ÷ 22.3',
            ], '≈ 2.5–3.5 days'),
          },
          { kind: 'outcome', text: 'I cut the electronics to the minimum: no converter, fuse, switch or extras I don’t need to prove it works.' },
        ],
      },
    ],
  },
  {
    title: 'Extras',
    steps: [
      {
        id: 's47', date: '13 Oct', title: 'Rota dial', dead: true, pointer: '',
        blocks: [
          { kind: 'text', lead: true, text: 'Nobody wants to take the bin out, so I designed a dial showing whose turn it is.' },
          { kind: 'outcome', dropped: 'Dropped the dial.', text: 'To be easy to see it would sit where it stops the lid sealing, and anywhere else it would be hidden.' },
        ],
      },
    ],
  },
]
