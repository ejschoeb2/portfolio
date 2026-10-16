// Everything the site says about each project lives here. The order of this
// list is the order of the carousel.
//
// To add a photo: drop the original in media/originals, run `npm run images`,
// then point `media` (the card) or a `gallery` entry at /images/<name>.webp.

export type Media =
  | { kind: 'photo'; src: string; alt: string; position?: string }
  | { kind: 'screen'; src: string; alt: string; position?: string }

export type GalleryItem = { label: string; src?: string; alt?: string }

export type StoryImage = {
  src: string
  alt: string
  caption?: string
  /** 'contain' shows the whole image (for drawings) instead of filling the frame. */
  fit?: 'contain'
}

/** A live website shown in a scrollable window on the page. */
export type Site = {
  url: string
  label: string
  /** Full-page screenshot, shown when the site refuses to load inside another page. */
  capture: string
  /** Set true only for sites that allow being embedded on this domain. */
  embeddable: boolean
}

/** Something built under a project (e.g. a product of a business), with its website. */
export type Build = {
  name: string
  summary: string[]
  site: Site
}

export type Table = {
  head: string[]
  rows: string[][]
  /** Column to pick out in blue (e.g. the chosen option). */
  highlight?: number
  caption?: string
}

/** One step of a project's story: text on one side, a picture or slideshow on the other. */
export type Chapter = {
  label: string
  heading: string
  body: string[]
  media?:
    | { kind: 'image'; image: StoryImage; small?: boolean }
    /** ratio = frame width / height (default 0.8, portrait). */
    | { kind: 'slides'; images: StoryImage[]; ratio?: number }
    | { kind: 'table'; table: Table }
    /** Several images overlapped like a pile of sheets. */
    | { kind: 'stack'; images: StoryImage[] }
    /** The ball launcher's four-bar linkage, animated from its real link lengths. */
    | { kind: 'linkage' }
  /** Which side the picture sits on (default right). */
  side?: 'left' | 'right'
  stats?: { value: string; label: string }[]
  /** Short label / value lines under the text, e.g. requirements or calculation checks. */
  facts?: { label: string; value: string }[]
  /** A table running the full width under the chapter. */
  table?: Table
}

export type Project = {
  slug: string
  title: string
  kind: string
  period: string
  blurb: string
  /** Leave out until there is an image; the card shows a blank drawing sheet. */
  media?: Media
  facts: { label: string; value: string }[]
  lede: string
  /** Opening paragraph beside the main image. Falls back to `lede`. */
  intro?: string
  /** Projects with a story show it in place of `sections` and `gallery`. */
  story?: Chapter[]
  stats?: { value: string; label: string }[]
  sections: { heading: string; body: string[] }[]
  site?: Site
  /** Shown under a "What I've built" heading, each with its website. */
  builds?: Build[]
  /** The main image opens this in a new tab (a read-only workbook, a live site). */
  open?: { url: string; label: string }
  /** 'web': no main image; title and opening paragraph side by side, then the
   *  site (or each build's site) full width below. */
  layout?: 'web'
  gallery?: GalleryItem[]
}

// In the order the carousel shows them: biggest projects first.
export const projects: Project[] = [
  {
    slug: 'kitchen-bin',
    title: 'Motorised kitchen bin',
    kind: 'Personal project',
    period: 'Sep 2026 – present',
    blurb: 'A bin that rolls itself out from under the worktop, opens on its own and keeps the flies out.',
    media: {
      kind: 'screen',
      src: '/images/kitchen-bin-render.webp',
      alt: 'Render of the bin design from my Inventor model, stowed under the worktop',
      position: '50% 50%',
    },
    facts: [
      { label: 'Type', value: 'Personal project' },
      { label: 'When', value: 'Sep 2026 – present' },
      { label: 'CAD', value: 'Autodesk Inventor' },
      { label: 'Status', value: 'Design done, prototype under way' },
    ],
    lede: 'Our kitchen bin fills in under a day. I am redesigning it as one that rolls out from under the worktop, opens and closes itself, and seals against flies.',
    intro:
      'Nine of us share one kitchen bin. I measured what goes wrong with it, wrote a specification and designed a replacement that rolls out from under the worktop, opens hands-free and seals against flies. Every decision, including the dead ends, is in the timeline below.',
    sections: [],
  },
  {
    slug: 'ball-launcher',
    title: 'Table-tennis ball launcher',
    kind: 'University of Bath · team of 5',
    period: 'Feb – Oct 2026',
    blurb: 'A fully mechanical launcher that fires four balls into alternating targets. Two motors, no electronics.',
    media: {
      kind: 'screen',
      src: '/images/launcher-cad.webp',
      alt: 'CAD render of the ball launcher: flywheel arm, Geneva feed wheel, ball tube and gear train on a base plate',
      position: '50% 55%',
    },
    facts: [
      { label: 'Role', value: 'CAD lead' },
      { label: 'Team', value: '5 people' },
      { label: 'When', value: 'Feb – Oct 2026' },
      { label: 'CAD', value: 'Autodesk Inventor' },
    ],
    lede: 'A university project to fire four table-tennis balls into alternating target zones using two motors and no electronics.',
    intro:
      'A table-tennis ball launcher I designed and built in a team of five at the University of Bath. It is fully mechanical: once its two battery motors are switched on, a Geneva wheel, a gear train and a four-bar linkage do all the feeding, timing and aiming, firing four balls into alternating target zones. I led the CAD.',
    story: [
      {
        label: 'Feb 2026',
        heading: 'The brief',
        body: [
          'We received the design brief: build a prototype that fires four table-tennis balls, one at a time, into two target zones at the far end of a 1400 × 750 mm table, in the order A, C, A, C. It had to run on batteries, and once the motors were on, everything else had to be done mechanically.',
          'As a group we turned the brief into a product design specification of demands and wishes, built a morphological chart of the ways each function could be solved, and each drew up our own concept.',
        ],
        facts: [
          { label: 'Sequence', value: '4 balls, A‑C‑A‑C, 3–10 s apart' },
          { label: 'Flight', value: 'Clear the net by 76 mm, peak under 508 mm' },
          { label: 'Power', value: 'Batteries only, 9 V max, 2 motors max' },
          { label: 'Control', value: 'Mechanical only after switch-on' },
          { label: 'Size', value: 'Stows in 380 × 180 × 300 mm' },
          { label: 'Budget', value: '£85 for bought-in parts' },
          { label: 'Making', value: 'Laser cutting, 3D printing, hand machining; no glue, welding or CNC' },
        ],
        media: {
          kind: 'slides',
          ratio: 4 / 3,
          images: [
            {
              src: '/images/launcher-concept-ethan.webp',
              alt: 'Hand-drawn concept with a Geneva wheel, firing arm and vertical flywheel, in top, side, front and isometric views',
              caption: 'My concept',
            },
            {
              src: '/images/launcher-concept-james.webp',
              fit: 'contain',
              alt: 'Hand-drawn concept with counter-rotating horizontal flywheels and a four-bar linkage',
              caption: 'James’s concept',
            },
            {
              src: '/images/launcher-concept-zak.webp',
              alt: 'Hand-drawn isometric concept with a ball tube, cam, two motors and a flywheel',
              caption: 'Zak’s concept',
            },
          ],
        },
      },
      {
        label: 'Mar 2026',
        heading: 'Choosing a concept',
        body: [
          'To compare the designs fairly we used a weighted decision matrix. Each concept was scored from 1 to 5 against eight criteria taken from the specification, each weighted from 2 (desirable) to 5 (essential).',
          'Louis’s concept came out on top at 125 out of 145, mainly because of its Geneva mechanism: one continuous motor input gives a clean four-step index that can drive both the ball feed and the A‑C‑A‑C sequencing.',
          'We then tested whether mixing in ideas from the other concepts could do better. We swapped Louis’s scotch yoke for the cam-driven swivel from mine and Zak’s, which is more compact with fewer sliding parts, and set up a single Geneva wheel to drive both the feed and the aim. That removed a whole subsystem, and the combined design re-scored 135 out of 145.',
        ],
        media: {
          kind: 'table',
          table: {
            head: ['Criterion', 'Weight', 'Ethan', 'James', 'Louis', 'Zak', 'Final'],
            rows: [
              ['Launch consistency', '5', '4', '5', '4', '4', '4'],
              ['A‑C‑A‑C sequencing', '5', '3', '3', '5', '2', '5'],
              ['No load on motor shaft', '4', '4', '3', '5', '4', '5'],
              ['Manufacturability', '4', '4', '3', '4', '4', '5'],
              ['Fits the storage box', '3', '4', '2', '4', '4', '5'],
              ['Simplicity / part count', '3', '3', '2', '4', '3', '5'],
              ['Cost (≤ £85)', '3', '4', '3', '4', '4', '4'],
              ['Safety', '2', '4', '3', '4', '4', '4'],
              ['Weighted total', '/145', '108', '91', '125', '103', '135'],
            ],
            highlight: 6,
            caption: 'Our decision matrix. Scores 1–5, multiplied by each criterion’s weight.',
          },
        },
      },
      {
        label: 'Calculations',
        heading: 'Working out the numbers',
        body: [
          'With a concept chosen, we worked outwards from the target to size every part. I built a trajectory model including drag and the topspin from a single flywheel, which works like a little extra gravity. It set the launch at 3.35 m/s and 35°, landing 930 mm away in the middle of the target zones, with the aim swinging ±14.3° between them.',
          'From there we sized the ramp and the flywheel: a 64 mm wheel spinning at 1,691 RPM, storing about 12 times the energy it gives each ball, so its speed only drops around 4% per shot. Then we chose the parts to match, searching supplier catalogues online for motors, bearings and couplings with enough headroom, and arranged bearings so the motor shafts only ever carry torque.',
        ],
        stats: [
          { value: '3.35 m/s', label: 'launch speed' },
          { value: '1,691', label: 'flywheel RPM' },
          { value: '±14.3°', label: 'aim between zones' },
        ],
        side: 'left',
        media: {
          kind: 'image',
          image: {
            src: '/images/launcher-trajectory.webp',
            alt: 'Graph of the ball’s flight path from the launcher over the net to the target zone 930 mm away',
            caption: 'The planned flight: 3.35 m/s at 35°, over the net and into the zone at 930 mm.',
          },
        },
      },
      {
        label: 'Iteration',
        heading: 'Six versions of the linkage',
        body: [
          'The aim comes from a four-bar crank-rocker. The crank turns continuously, driven from the feed motor through a gear train, and the rocker swings the flywheel arm from side to side. It had to sweep exactly the right angle, satisfy Grashof’s condition so the crank could turn fully, keep the transmission angle above 45° so it would not bind, and fit on the base plate without hitting anything.',
          'The first sizing worked on paper. Then, every time the CAD showed one part fouling another, I changed the geometry and recalculated the whole linkage. The coupler hit the Geneva driver, so we added an idler gear. The corner of the crank bar caught the idler’s teeth, so we went up from 30T/60T to 40T/80T gears. The rocker then hit the bigger crank gear, so the crank was shortened and the links resized again. It took six versions to get there.',
          'It taught me that kinematics is the starting point, not the finish line. The real work was making correct maths fit around real parts, clearances and tolerances.',
        ],
        media: { kind: 'linkage' },
        facts: [
          { label: 'Grashof', value: '26 + 151.38 = 177.38 ≤ 95 + 107 = 202 mm ✓' },
          { label: 'Sweep', value: '52.48° − 23.98° = 28.50°, i.e. ±14.25° (target ±14.3°)' },
          { label: 'Landing', value: '930 × tan 14.25° = 236.2 mm (zone centre 237.5 mm)' },
          { label: 'Transmission', value: 'worst case 57.3° (needs ≥ 45°)' },
          { label: 'Idler clearance', value: '39 − 32.25 = 6.75 mm' },
        ],
        table: {
          head: ['Version', 'What forced the change', 'Crank', 'Coupler', 'Rocker', 'Ground', 'Sweep'],
          rows: [
            ['v1', 'Initial sizing from the trajectory', '26', '85', '115', '115', '38°'],
            ['v2', 'Improving the transmission angle', '26', '85', '115', '125', '32°'],
            ['v3', 'Gear ratio reversed, rocker pivot moved back 20 mm', '28', '85', '115', '135', '28.2°'],
            ['v4', 'Idler gear added; coupler rod hit the Geneva driver', '28', '85', '115', '120.4', '29.4°'],
            ['v5', 'Crank gears upgraded from 30T/60T to 40T/80T', '28', '85', '115', '126.8', '28.7°'],
            ['v6', 'Rocker hit the 80T gear; crank shortened for idler clearance', '26', '95', '107', '151.4', '28.5°'],
          ],
          highlight: 6,
          caption: 'Link lengths in mm for each revision.',
        },
      },
      {
        label: 'Apr 2026',
        heading: 'Choosing and ordering parts',
        body: [
          'Once the sizes were fixed we picked the parts that fitted best and put together order spreadsheets for each supplier: University stores for steel bar, fasteners and the PVC ball tube; RS Components; and Technobots for the motors, couplings, bearings and shaft collars.',
          'The bought-in parts from RS and Technobots came to under £35, well inside the £85 budget. We costed the 3D printing and laser cutting too.',
        ],
        side: 'left',
        media: {
          kind: 'stack',
          images: [
            {
              src: '/images/launcher-order-technobots.webp',
              alt: 'Technobots order: flywheel motor, geared feed motor, couplings, nine MR84 bearings and six shaft collars, £24.72',
              caption: 'Technobots',
            },
            {
              src: '/images/launcher-order-rs.webp',
              alt: 'RS Components order, £9.75',
              caption: 'RS Components',
            },
            {
              src: '/images/launcher-order-uni.webp',
              alt: 'University of Bath stores order: washers, steel round bar, screws, nuts, aluminium sheet and PVC tube, £19.37',
              caption: 'University stores',
            },
          ],
        },
      },
      {
        label: 'CAD',
        heading: 'The finished assembly',
        body: [
          'I led the CAD in Autodesk Inventor, modelling every part and bringing them together into the full assembly. From the model we produced the assembly drawing with its parts list, dimensioned part drawings to BS 8888, STL files for printing, laser-cutting files and the order sheets, all ready for manufacture.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/launcher-assembly-drawing.webp',
            alt: 'Assembly drawing of the ball launcher with a parts list and section views',
            caption: 'The assembly drawing, with its full parts list.',
          },
        },
      },
      {
        label: 'Manufacture',
        heading: 'Parts in hand',
        body: [
          'The parts were made and delivered: 3D-printed flywheel, ramp and Geneva wheel, laser-cut acrylic gears, plates and links, and the two motors. We started the initial assembly.',
          'That is where we found that not everything worked properly in real life, and the flywheel had to be redesigned.',
        ],
        side: 'left',
        media: {
          kind: 'image',
          image: {
            src: '/images/launcher-parts.webp',
            alt: 'Tray of manufactured parts: yellow 3D-printed ramp, flywheel and Geneva wheel, clear acrylic gears and plates, and two small motors',
            caption: 'The manufactured parts, ready for assembly.',
          },
        },
      },
      {
        label: 'Redesign',
        heading: 'A new flywheel',
        body: [
          'The new flywheel is a solid printed hub with two grooves, each holding a 3 mm rubber O-ring. The O-rings give the grip on the ball, and spare groove sizes let us tune the speed later by changing which rings are fitted.',
          'I re-ran the numbers for the new wheel. It is 45.8 mm across the O-rings and weighs about 47 g, so it loses around 4% of its speed per shot and recovers in under a second. On six AA batteries it should spin at about 3,480 RPM, sending the ball off at 3.3–3.5 m/s.',
        ],
        media: {
          kind: 'slides',
          images: [
            {
              src: '/images/launcher-flywheel-v1.webp',
              alt: 'The original yellow 3D-printed flywheel with a ribbed rim',
              caption: 'The original flywheel',
            },
            {
              src: '/images/launcher-flywheel-v2-render.webp',
              fit: 'contain',
              alt: 'Render of the new flywheel: a yellow hub with two black O-rings seated in its grooves',
              caption: 'The new flywheel with its O-rings fitted (render from the CAD)',
            },
            {
              src: '/images/launcher-flywheel-v2-drawing.webp',
              fit: 'contain',
              alt: 'Drawing of the O-ring flywheel hub in half section, with groove, bore and O-ring dimensions',
              caption: 'Hub profile, D-bore and O-ring spec',
            },
          ],
        },
      },
      {
        label: 'Recalculation',
        heading: 'Fixing the ramp',
        body: [
          'A smaller wheel changed the geometry against the ramp, so I measured the real parts and recalculated. On the old ramp the ball met the wheel 16.5 mm up the face, and the squeeze kept rising to 6.6 mm by the top, when anything over about 2 mm jams or dents the ball. The closest point between the wheel and the ramp face was past the end of the ramp, so the gap just kept closing.',
          'There were two ways to fix it: move the flywheel axle, which meant re-cutting both walls and moving the motor mount, or reprint only the ramp. We reprinted the ramp. Its toe now starts 10.9 mm in front of the wheel centre, with a 42.9 mm face at 35°, giving a steady 1.25 mm squeeze. Sliding it 1 mm towards the wheel adds 0.57 mm if we need more grip.',
        ],
        side: 'left',
        facts: [
          { label: 'Old ramp', value: 'squeeze rises to 6.6 mm (limit ~2 mm): jams' },
          { label: 'New ramp', value: '1.25 mm squeeze, ball clears the wheel by 5.8 mm on the flat' },
          { label: 'Launch', value: '~16 mm further forward, ~4 mm higher' },
        ],
        media: {
          kind: 'slides',
          ratio: 1650 / 1170,
          images: [
            {
              src: '/images/launcher-ramp-jam.webp',
              fit: 'contain',
              alt: 'Side-view sheet showing the new flywheel over the old ramp, where the ball is squeezed too hard and jams',
              caption: 'Why the old ramp jams with the new wheel',
            },
            {
              src: '/images/launcher-ramp-fix.webp',
              fit: 'contain',
              alt: 'Side-view sheet of the new ramp profile with its pinch point and dimensions',
              caption: 'The new ramp, recalculated around the new flywheel',
            },
          ],
        },
      },
      {
        label: 'Next',
        heading: 'Still to come',
        body: [
          'The new flywheel and ramp are ready, but the finished launcher is yet to be assembled. I’ll update this page once it’s firing.',
        ],
      },
    ],
    sections: [],
  },
  {
    slug: 'prompt-automation',
    title: 'Prompt Automation',
    kind: 'My business · Prompt Automation Ltd',
    period: '2025 – now',
    blurb: 'My business, using AI to build automations that take the admin off small businesses.',
    media: {
      kind: 'screen',
      src: '/images/prompt-accountants-card.webp',
      alt: 'The Prompt homepage, headed “The Chase Is Over”',
    },
    facts: [
      { label: 'Role', value: 'Founder and director' },
      { label: 'Company', value: 'Prompt Automation Ltd' },
      { label: 'Since', value: 'Dec 2025' },
      { label: 'For', value: 'Small businesses' },
    ],
    layout: 'web',
    lede: 'Prompt Automation is my business. I use AI to build automations that help small businesses.',
    intro:
      'Prompt Automation is my business, registered at Companies House in March 2026. I use AI to build automations for small businesses, taking the repetitive admin that eats into their week and turning it into software that runs on its own.',
    sections: [],
    builds: [
      {
        name: 'Prompt Accountants',
        summary: [
          'A deadline tracker for UK accounting practices. It keeps track of every client’s filing deadlines and sends the reminders on schedule, so the firm no longer has to chase clients for paperwork.',
        ],
        site: {
          url: 'https://prompt.accountants/',
          label: 'prompt.accountants',
          capture: '/images/prompt-accountants-full.webp',
          embeddable: false,
        },
      },
      {
        name: 'ChurchOps',
        summary: [
          'A task and deadline tracker for church staff teams and their volunteers. Every key date, from the annual inspections to the APCM, gets its own checklist, and each person gets email reminders for just their own jobs. Volunteers only need a link: no account, no password.',
          'It’s in beta, and I’m building it with a small group of UK churches.',
        ],
        site: {
          url: 'https://churchops-theta.vercel.app/',
          label: 'ChurchOps',
          capture: '/images/churchops-full.webp',
          embeddable: false,
        },
      },
    ],
  },
  {
    slug: 'environmental-finance-data',
    title: 'Environmental finance data tool',
    kind: 'Data analyst · Stephanie Ockenden Ltd',
    period: 'Jun – Jul 2026',
    blurb: '3.2 million investment records consolidated into one tool a non-technical client can run.',
    media: {
      kind: 'screen',
      src: '/images/finance-explorer-card.webp',
      alt: 'The Environment Finance Explorer workbook open in Excel, showing included finance by provider type',
    },
    open: {
      url: 'https://1drv.ms/x/c/4ff5cc4c886a91e0/IQCBPt4D10jqQ4kk7UZ6n3odAYZeX42RA9S3l3Fq7gkwtXo?e=2RKIcD',
      label: 'Open a read-only copy of the workbook in a new tab',
    },
    layout: 'web',
    // The same read-only link, opened by Excel for the web inside the page.
    site: {
      url: 'https://1drv.ms/x/c/4ff5cc4c886a91e0/IQCBPt4D10jqQ4kk7UZ6n3odAYZeX42RA9S3l3Fq7gkwtXo?e=2RKIcD&action=embedview',
      label: 'the workbook',
      capture: '/images/finance-explorer-card.webp',
      embeddable: true,
    },
    facts: [
      { label: 'Role', value: 'Data analyst' },
      { label: 'Client', value: 'Stephanie Ockenden Ltd, environmental finance consultancy' },
      { label: 'When', value: 'Jun – Jul 2026' },
      { label: 'Tools', value: 'PostgreSQL, Excel (Power Query, VBA)' },
    ],
    lede: 'A summer internship turning four overlapping public datasets into one database, and an Excel tool the client could run without me.',
    stats: [
      { value: '3.2M', label: 'records consolidated from 4 datasets' },
      { value: '13,805', label: 'transactions classified' },
      { value: '94%', label: 'precision against manual review' },
    ],
    sections: [
      {
        heading: 'One database',
        body: [
          'I built a PostgreSQL database consolidating 3.2 million records from four datasets (three OECD, one TOSSD) covering 2015 to 2024.',
          'The same investment was often reported in both OECD and TOSSD, so the double-counting had to be resolved before any of it could be analysed.',
        ],
      },
      {
        heading: 'Screening method',
        body: [
          'I designed, tested and documented a screening methodology that classified 13,805 transactions.',
          'The automated classification was validated against manual review on held-out samples, reaching 94% precision. Any rule that failed validation was discarded.',
        ],
      },
      {
        heading: 'Handover',
        body: [
          'The deliverable was a reusable Excel tool over a 1.73 million-row dataset, built with Power Query and VBA, that lets a non-technical client run their own analyses.',
          'I wrote the methodology report and an illustrated user guide to go with it.',
        ],
      },
    ],
    gallery: [{ label: 'Excel tool' }, { label: 'Method diagram' }],
  },
  {
    slug: 'cruisingtheworld',
    // The zero-width space lets the one-word name wrap on narrow screens.
    title: 'Cruising​TheWorld Travel',
    kind: 'Full-stack developer',
    period: 'Jan – Jun 2025',
    blurb: 'Brand and website for a cruise agency, with 26,000 cruises searchable in one place.',
    media: {
      kind: 'screen',
      src: '/images/ctheworld-card.webp',
      alt: 'The Cruising the World homepage, with a cruise search bar over a photo of the Mediterranean coast',
    },
    open: {
      url: 'https://cruising-redesign.vercel.app/',
      label: 'Open the Cruising the World website in a new tab',
    },
    layout: 'web',
    site: {
      url: 'https://cruising-redesign.vercel.app/',
      label: 'the site',
      capture: '/images/ctheworld-full.webp',
      embeddable: true,
    },
    facts: [
      { label: 'Role', value: 'Brand, design and full-stack build' },
      { label: 'When', value: 'Jan – Jun 2025' },
      { label: 'Stack', value: 'Node.js, MongoDB, Render, GitHub' },
      { label: 'Data', value: 'Widgety API' },
    ],
    lede: 'I designed the brand and built the website for a cruise agency, so customers could search every cruise in one place.',
    intro:
      'Cruising the World is a cruise agency. I designed its brand and built its website, so customers could search every cruise in one place. The agency’s site has since been taken down, so I’ve rebuilt it as a redesign you can explore below. The cruises in it are sample data.',
    stats: [
      { value: '26,000', label: 'cruise records' },
      { value: '15 min', label: 'between price refreshes' },
      { value: '200%', label: 'Instagram growth' },
    ],
    sections: [
      {
        heading: 'The original site',
        body: [
          'I created the brand (logo, colour scheme and visual style) and designed a website that lets customers find holidays by region, country, cabin type, number of stops and price.',
          'Behind it, a Node.js server, hosted on Render and deployed from GitHub, held 26,000 cruise records from the Widgety API in MongoDB. It merged the separate itinerary and pricing data and refreshed prices every 15 minutes, so listings stayed accurate without anyone updating them by hand.',
          'I also ran the agency’s social media and grew its Instagram by 200%.',
        ],
      },
    ],
  },
  {
    slug: 'schoebshop',
    title: 'SchoebShop',
    kind: 'Etsy shop',
    period: '2023 – 2024',
    blurb: 'Custom-shaped mirrors, laser cut from reflective acrylic and sold on Etsy.',
    media: {
      kind: 'screen',
      src: '/images/etsy-mirrors.webp',
      alt: 'Two hummingbird-shaped acrylic mirrors mounted on a kitchen wall between oak shelves',
      position: '50% 47%',
    },
    facts: [
      { label: 'Role', value: 'Owner, designer and maker' },
      { label: 'When', value: '2023 – 2024' },
      { label: 'Process', value: 'Laser cutting' },
      { label: 'Material', value: '3 mm mirrored acrylic' },
    ],
    lede: 'I ran an Etsy shop selling mirrors in custom shapes, each one laser cut from reflective acrylic.',
    intro:
      'SchoebShop was my small business making custom-shaped mirrors. I drew every design myself in CAD, laser cut it from 3 mm mirrored acrylic and sold the finished mirrors on Etsy, in a range of shapes and sizes.',
    story: [
      {
        label: 'Feb 2023',
        heading: 'A material I’d never seen',
        body: [
          'It all started in February 2023. I was in the design technology department at school, working on my coursework, when I noticed we had sheets of mirrored acrylic. I had never seen the material before.',
          'It had the finish of a real mirror, but it was light, tough and could go straight into a laser cutter. The thought came to me almost straight away: if I could draw a shape, I could cut it into a mirror. I could design my own custom mirrors and make them right there in the school workshop.',
        ],
      },
      {
        label: 'Designing',
        heading: 'Drawing the first designs',
        body: [
          'I started designing in 2D Design, the CAD software we used at school. I didn’t have much experience with it yet, so I went looking for ideas online and built up a board of inspiration on Pinterest.',
          'From there I worked the shapes I liked into my own designs, drawing them as clean outlines that the laser cutter could follow.',
        ],
        side: 'left',
        media: {
          kind: 'image',
          small: true,
          image: {
            src: '/images/etsy-2d-design.webp',
            alt: 'The 2D Design CAD software with an empty drawing sheet',
            caption: '2D Design, the school CAD software I drew the first mirrors in.',
          },
        },
      },
      {
        label: 'First cuts',
        heading: 'Not quite right',
        body: [
          'The first mirrors didn’t come out the way I had pictured them. Up close the edges were rough, and parts of the design had melted rather than cut.',
          'It taught me something I still think about when I design: a part has to suit the machine and the material that will make it, not just look good on screen.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/etsy-first-cut.webp',
            alt: 'An early round mirror with a leafy cut-out design, its fine details partly melted',
            caption:
              'My first designs didn’t come out well. The laser cutter wasn’t calibrated properly, and the designs were too finely detailed, so the acrylic melted in places and didn’t cut along a clean, flush edge.',
          },
        },
      },
      {
        label: 'Gifts',
        heading: 'Getting better',
        body: [
          'As my CAD skills improved I went back to the drawing board and developed new designs, with bolder shapes, cleaner lines and details sized so the laser could actually cut them.',
          'At this point it was just a hobby. I was making mirrors as custom gifts for people, which meant each one was a little different, and every design taught me more about what would cut cleanly.',
        ],
        side: 'left',
        media: {
          kind: 'slides',
          images: [
            {
              src: '/images/etsy-stag.webp',
              alt: 'A round mirror with a stag and two pine trees cut out, held up in a garden',
              caption: 'Stag and pines',
            },
            {
              src: '/images/etsy-tree.webp',
              alt: 'A round tree-of-life mirror with branches and leaves cut out, held up in a garden',
              caption: 'Tree of life',
            },
            {
              src: '/images/etsy-dolphins.webp',
              alt: 'Two dolphin-shaped mirrors mounted on a grey wall',
              caption: 'Dolphins',
            },
          ],
        },
      },
      {
        label: 'Feb 2024',
        heading: 'Opening the shop',
        body: [
          'Once I had designs I was proud of, I opened an Etsy shop to sell them.',
          'Online, the photo is the first thing a buyer sees, so I took more professional photos of the mirrors to help with sales. I styled them on real walls and shelves, in soft light, so the shapes and reflections stood out.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/etsy-hummingbirds-shelf.webp',
            alt: 'Two hummingbird mirrors on a kitchen wall beside patterned mugs',
            caption: 'One of the product photos I took for the shop listings.',
          },
        },
      },
      {
        label: 'Looking back',
        heading: 'What I took from it',
        body: [
          'Over time I built a catalogue of designs I was really proud of and sold them on Etsy in a range of sizes. In the end I only sold six mirrors, but it was a great experience. I took a product all the way from an idea in a school workshop to something people actually paid for.',
          'Two things held the shop back. Getting the mirrors to customers safely was hard, because 3 mm acrylic is fragile, especially with so many cut-outs. And competition on Etsy is fierce, so standing out among other sellers was tough.',
        ],
        stats: [
          { value: '6', label: 'mirrors sold' },
          { value: '3 mm', label: 'mirrored acrylic' },
        ],
      },
    ],
    sections: [],
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)

export const projectNumber = (project: Project) =>
  String(projects.indexOf(project) + 1).padStart(2, '0')
