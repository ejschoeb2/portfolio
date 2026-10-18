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

/** One page of a tool's walkthrough: its screenshot and what that page does. */
export type WalkPage = { name: string; image: StoryImage; body: string[] }

/** A panel in a chapter's switcher: a table, or the launcher's linkage animation. */
export type Panel = { caption: string } & ({ kind: 'table'; table: Table } | { kind: 'linkage' })

/** One step of a project's story: text on one side, a picture or slideshow on the other. */
export type Chapter = {
  /** The date, shown under the step number. */
  label: string
  heading?: string
  /** **Figures** in a paragraph are picked out in bold blue. */
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
    /** Several tables or animations, switched with arrows and dots. */
    | { kind: 'panels'; panels: Panel[] }
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
  /** A tour of a tool, page by page, under its own heading. */
  walkthrough?: { title: string; intro?: string; pages: WalkPage[] }
  /** How part of the work was developed, told as dated steps like a story. */
  method?: { title: string; intro?: string; chapters: Chapter[] }
  /** Shown under a "What I've built" heading, each with its website. */
  builds?: Build[]
  /** The main image opens this in a new tab (a read-only workbook, a live site). */
  open?: { url: string; label: string }
  /** 'web': no main image; title and opening paragraph side by side, then the
   *  site (or each build's site, or the bin's 3D model) full width below. */
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
      'Nine of us share a kitchen bin that keeps letting us down. I’m designing a replacement that rolls out from under the worktop, opens by itself and keeps the flies out.',
    // The 3D model runs full width under the title.
    layout: 'web',
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
      'I designed a fully mechanical launcher in a team of five for a University of Bath project. It fires table-tennis balls across the table and over the net, to alternating left and right zones in quick succession. The design is complete, and we build the finished launcher on 23 October. The whole process is below.',
    story: [
      {
        label: '9 February 2026',
        body: [
          'We received the brief: build a prototype that fires four table-tennis balls, one at a time, into two target zones at the far end of a 1400 × 750 mm table, in the order A, C, A, C. Once the battery motors are switched on, everything else has to happen mechanically.',
          'As a team, we turned the brief into a product design specification of everything the launcher had to do.',
        ],
        media: {
          kind: 'table',
          table: {
            head: ['Requirement', 'Target'],
            rows: [
              ['Sequence', '4 balls, A‑C‑A‑C, 3–10 s apart'],
              ['Flight', 'Clear the net by 76 mm, peak under 508 mm'],
              ['Power', 'Batteries only, 9 V max, 2 motors max'],
              ['Control', 'Mechanical only after switch-on'],
              ['Size', 'Stows in 380 × 180 × 300 mm'],
              ['Budget', '£85 for bought-in parts'],
              ['Making', 'Laser cutting, 3D printing and hand machining; no glue, welding or CNC'],
            ],
          },
        },
      },
      {
        label: '16 February 2026',
        body: [
          'With the specification set, we mapped out the different ways each part of the job could be done, from feeding the balls to aiming them. Then each of us drew up our own concept for the whole launcher.',
          'Use the arrows to look through three of them, starting with mine.',
        ],
        side: 'left',
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
        label: '2 March 2026',
        body: [
          'To choose between our concepts, we scored each one against eight criteria from the specification in a weighted decision matrix. Louis’s came out on top, thanks to its Geneva mechanism, which turns one motor’s steady rotation into four clean steps.',
          'We then combined it with the best ideas from the others, including the cam-driven swivel from mine and Zak’s, so a single Geneva wheel drives both the feed and the aim. The combined design scored **135 out of 145**.',
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
        label: '9 March 2026',
        body: [
          'To size the parts, we worked backwards from the target. I modelled the ball’s flight, including drag and the topspin from the flywheel. It set the launch at **3.35 m/s** and **35°**, landing **930 mm** away, with the aim swinging **±14.3°** between the two zones.',
          'From that we sized the flywheel: a **64 mm** wheel spinning at **1,691 RPM**, heavy enough that it only slows by about **4%** with each shot.',
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
        label: '23 March 2026',
        body: [
          'The aim comes from a four-bar linkage: a crank turns continuously and swings the flywheel arm from side to side. It had to sweep exactly the right angle without jamming, and fit on the base plate without hitting anything.',
          'The first version worked on paper. But each time the CAD showed one part hitting another, I changed the geometry and recalculated the whole linkage. It took **six versions** to get right.',
        ],
        media: {
          kind: 'panels',
          panels: [
            {
              kind: 'table',
              caption: 'All six versions, link lengths in mm',
              table: {
                head: ['Version', 'What forced the change', 'Crank', 'Coupler', 'Rocker', 'Ground', 'Sweep'],
                rows: [
                  ['v1', 'First sizing from the trajectory', '26', '85', '115', '115', '38°'],
                  ['v2', 'Better transmission angle', '26', '85', '115', '125', '32°'],
                  ['v3', 'Gear ratio reversed, rocker pivot moved back', '28', '85', '115', '135', '28.2°'],
                  ['v4', 'Coupler hit the Geneva driver: idler gear added', '28', '85', '115', '120.4', '29.4°'],
                  ['v5', 'Crank caught the idler: gears up to 40T/80T', '28', '85', '115', '126.8', '28.7°'],
                  ['v6', 'Rocker hit the 80T gear: crank shortened', '26', '95', '107', '151.4', '28.5°'],
                ],
                highlight: 6,
              },
            },
            { kind: 'linkage', caption: 'The final linkage, moving' },
          ],
        },
      },
      {
        label: '20 April 2026',
        body: [
          'With the sizes fixed, we chose the motors, bearings and other bought-in parts to match, and put together an order sheet for each supplier.',
          'Everything we bought came to under **£35**, well inside the **£85** budget.',
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
        label: '4 May 2026',
        body: [
          'We built the full assembly in Autodesk Inventor as a team, and I modelled most of the parts. From the model we made the assembly drawing, part drawings to BS 8888, and the files for 3D printing and laser cutting, ready for manufacture.',
        ],
        side: 'left',
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
        label: '28 September 2026',
        body: [
          'Our parts were then made and delivered: a 3D-printed flywheel, ramp and Geneva wheel, laser-cut acrylic gears, plates and links, and the two motors. Then we started putting it together.',
        ],
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
        label: '9 October 2026',
        body: [
          'Once we had assembled the first parts and tested them together, we realised we had made a mistake: the flywheel didn’t work as we had designed it, so we redesigned it.',
          'The new flywheel is a printed hub with two rubber O-rings that grip the ball, and changing the rings lets us tune its speed. I recalculated everything around the smaller wheel: on six AA batteries it should spin at about **3,480 RPM** and launch the ball at **3.3–3.5 m/s**. The ramp had to change to match it, so we reprinted that too.',
        ],
        side: 'left',
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
        label: '23 October 2026',
        body: [
          'The new flywheel and ramp are ready, and we build the finished launcher on **23 October**. I’ll update this page once it’s firing.',
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
    facts: [
      { label: 'Role', value: 'Data analyst' },
      { label: 'Client', value: 'Stephanie Ockenden Ltd, environmental finance consultancy' },
      { label: 'When', value: 'Jun – Jul 2026' },
      { label: 'Tools', value: 'PostgreSQL, Excel (Power Query, VBA)' },
    ],
    lede: 'A summer internship turning four overlapping public datasets into one database, and an Excel tool the client could run without me.',
    stats: [
      { value: '3.2M', label: 'records consolidated from 4 datasets' },
      { value: '14,045', label: 'transactions screened and classified' },
      { value: '5 of 21', label: 'automatic rules kept after blind testing' },
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
          'I designed, tested and documented the screening method that decided which transactions count as wetland finance. It screened 14,045 transactions and counted 5,489 of them.',
          'Every rule that decided rows automatically had to be right at least 94% of the time against hand-labelled projects, and keep that up on projects it hadn’t seen. Only 5 of the 21 I tried did. How it developed is below.',
        ],
      },
      {
        heading: 'Handover',
        body: [
          'The deliverable was a reusable Excel tool over about 2.35 million finance activities, built with Power Query and VBA, that lets a non-technical client run the same kind of search for any topic.',
          'I wrote the methodology report and an illustrated user guide to go with it.',
        ],
      },
    ],
    walkthrough: {
      title: 'How it works',
      intro:
        'The Explorer is one Excel workbook and one data file of about 2.35 million finance activities, from 2015 to 2024. It needs no database or internet connection. You describe a topic in keywords, run the search, then screen what comes back. These are its pages, in the order you use them.',
      pages: [
        {
          name: 'Screening',
          image: {
            src: '/images/finance-guide-1-screening.webp',
            alt: 'The Screening page: six buttons (choose, add and remove a topic, undo, back up, export), the current topic, and totals of saved screenings per topic',
          },
          body: [
            'Everything is organised by topic. You start here by choosing a topic, or adding a new one, and its keywords and search settings come with it.',
            'Every judgement you save is tagged with that topic, so a project can be Principal for one topic and excluded from another. The totals at the bottom keep only your latest judgement per project, so saving twice can never double-count.',
          ],
        },
        {
          name: 'Keywords',
          image: {
            src: '/images/finance-guide-2-keywords.webp',
            alt: 'The Keywords page with four columns of desertification terms: Primary, General, Indicator and Context blocker, each with a count of matching rows',
          },
          body: [
            'The topic is defined in four keyword lists. Primary terms mean the topic on their own. General terms are relevant but ambiguous, so they only count in numbers or alongside other evidence. Indicator terms are weaker still, and context blockers rule out confusable settings, like coastal terms for desertification.',
            'Matching is whole-word and ignores case. The count beside each term shows how many results it brought in, so you can see which words are doing the work.',
          ],
        },
        {
          name: 'Search settings',
          image: {
            src: '/images/finance-guide-3-search.webp',
            alt: 'The Search settings page: four netting paths with on/off switches and row counts, the year filter, and the list of corroborating signals',
          },
          body: [
            'This page sets what counts as a match. A row is caught by any of four paths: a Primary keyword (A); two or more General keywords plus any corroborating signal (B); one General keyword plus a strong signal (C); or an Indicator keyword plus a strong signal, with no context blocker (D).',
            'The signals are independent evidence that a project is about the topic: its Rio markers, SDG goals, sector and purpose codes, and named funders. Changes here need a refresh, which re-scans the whole dataset.',
          ],
        },
        {
          name: 'Initial Report',
          image: {
            src: '/images/finance-guide-4-initial.webp',
            alt: 'The Initial Report: matching activities, total commitment and amount mobilised, above slicers for year, source, provider, region, sector, income group and Rio markers',
          },
          body: [
            'A first look at everything the search caught, before any screening: how many activities, how much money committed and mobilised, and charts of where it goes.',
            'The slicers filter the page instantly by year, source, provider, region, sector, income group or Rio marker. These are scoping figures, not audited ones, because the net always catches some false positives.',
          ],
        },
        {
          name: 'All Results',
          image: {
            src: '/images/finance-guide-5-results.webp',
            alt: 'The reading pane above All Results, showing a translated project description with the matched keyword picked out in red',
          },
          body: [
            'Screening happens here. Every row the search caught is listed biggest first, so the money is at the top, and each already has a decision from the rules.',
            'Click a row and the reading pane shows its full description, in English where it was translated, with the matched keywords in red. Keyboard shortcuts mark rows as Principal, Significant, Unsure or Exclude, and Save my screenings records them against the topic.',
          ],
        },
        {
          name: 'Classification methods',
          image: {
            src: '/images/finance-guide-6-rules.webp',
            alt: 'The Classification methods page: the rules that set each row to Include or Unsure and Principal, each with an on/off switch and the number of rows it reaches',
          },
          body: [
            'The rules that classify each row: whether it is in scope, and whether the topic is the point of the project (Principal) or one aim among several (Significant).',
            'Each rule can be switched on or off and shows how many rows it reaches. The results recalculate instantly, and an override typed on any row always wins.',
          ],
        },
        {
          name: 'Marked Report',
          image: {
            src: '/images/finance-guide-7-marked.webp',
            alt: 'A Marked Report section: included finance by provider type over time, as a table and a stacked bar chart',
          },
          body: [
            'The final report, built only from rows kept as Include. Nine tables, each with a chart, break the finance down by provider type over time, share of each provider’s portfolio, sector, region, income group, instrument, flow type, SDG and Rio marker.',
            'It updates the moment a decision or rule changes, with no refresh, and each table has space for your own commentary.',
          ],
        },
      ],
    },
    method: {
      title: 'How I built the classification',
      intro:
        'There is no wetlands marker or purpose code in OECD data, so wetland finance hides inside biodiversity, water, fishing and farming projects. I built a method that finds it from each project’s text, tested every rule against projects labelled by hand, and kept only what held up. It took five weeks.',
      chapters: [
        {
          label: '25 June 2026',
          body: [
            'I started from Stephanie’s idea of a keyword index: **222** terms in English, French and Spanish, split into Primary terms that mean wetlands on their own and General terms that only count together.',
            'The first screen matched words inside other words: “pan” matched Japan, “bog” matched Bogotá and “dam” matched Amsterdam. Switching to whole-word matching cut the candidates from **1,947** projects to **864**.',
          ],
          media: {
            kind: 'table',
            table: {
              head: ['Group', 'How it counts', 'Examples'],
              rows: [
                ['Primary', 'On its own', 'wetland, Ramsar, mangrove, peatland, seagrass, saltmarsh, coral reef'],
                ['General', 'Two or more, or with other evidence', 'lagoon, marsh, floodplain, lake, oasis'],
                ['Fauna', 'Only with a biodiversity marker', 'migratory birds, heron, plover, otter'],
                ['Gated', 'Only with a conservation word', 'rice paddy, fish pond, salt pan'],
                ['Exclude', 'Flags the row for a closer look', 'drinking water, sanitation, hydropower'],
              ],
              caption: 'The keyword groups, with examples from the final list.',
            },
          },
        },
        {
          label: '28 June 2026',
          body: [
            'Rows the rules couldn’t decide needed a person or a second opinion, so I wrote the instructions for an AI screener and tested each version against my own labels. The first agreed only **57.5%** of the time. Each version fixed the mistakes of the last, like counting river-basin water management as wetland work.',
            'Version 8 matched all of Stephanie’s include and exclude calls on **39** held-out projects. On **9 July** I tested version 9 on **162** fresh projects it had never seen: **93%** of the projects it included were right.',
          ],
          side: 'left',
          media: {
            kind: 'table',
            table: {
              head: ['Version', 'Tested on', 'Agreement', 'What changed'],
              rows: [
                ['v1', '80 rows', '57.5%', 'First version, far too strict'],
                ['v2', '63 rows', '74.6%', 'Three-way call; wetland components allowed'],
                ['v3', '27 rows', '81.5%', 'River-basin water management excluded'],
                ['v4', '86 rows', '84.9%', 'Duplicates removed before screening'],
                ['v6', '52 fresh 2024 rows', '90.2%', 'Four rules for borderline cases'],
                ['v8', '39 of Stephanie’s', '100%', 'Rebuilt on her test: is the wetland integral?'],
                ['v9', '162 fresh projects', '89.5%', 'Four consistency fixes'],
              ],
              highlight: 2,
              caption: 'Agreement with the hand labels on include or exclude.',
            },
          },
        },
        {
          label: '30 June 2026',
          body: [
            'Keywords alone missed too much, so I widened the net. A row could also get in on one General term backed by strong evidence: an environmental funder such as the GEF, a biodiversity marker or a wetland purpose code. The 2024 candidates went from **857** to **1,560**.',
            'Checking against the projects Stephanie had included showed the net’s limit: **142** of the **279** it missed had no wetland word at all. I tested a net built on markers and codes instead, but even the tightest version added **2,938** rows to find a handful, so I rejected it.',
          ],
          media: {
            kind: 'table',
            table: {
              head: ['Path', 'What gets a row in'],
              rows: [
                ['A', 'A Primary term'],
                ['B', 'Two General terms and any supporting signal'],
                ['C', 'One General term and a strong signal'],
                ['D', 'A fauna term and a biodiversity marker, with no land habitat word'],
              ],
              caption: 'The four ways into the net. Signals are Rio markers, SDGs, sector and purpose codes, and funders.',
            },
          },
        },
        {
          label: '2 July 2026',
          body: [
            'A random audit of **50** candidates found only **34** were real wetland projects. So I tested every rule that could decide rows automatically. I designed the rules on **628** rows I had labelled by hand, then tested them on **280** fresh rows they had never seen. A rule that included rows had to be right at least **94%** of the time, and one that excluded them **95%**.',
            'Only **5** of the **21** rules held up. Most that failed had memorised a few big programmes: “donor is Canada” was right **89%** of the time on the design rows but only **41%** on fresh ones.',
          ],
          side: 'left',
          media: {
            kind: 'panels',
            panels: [
              {
                kind: 'table',
                caption: 'The 5 rules kept (rows tested in brackets)',
                table: {
                  head: ['Rule', 'Design rows', 'Fresh rows', 'Overall'],
                  rows: [
                    ['Primary term in the title', '96% (216)', '100% (14)', '96% (230)'],
                    ['Two or more different Primary terms', '93% (223)', '100% (20)', '94% (243)'],
                    ['Primary term and an environmental funder', '99% (115)', '100% (6)', '99% (121)'],
                    ['Primary term and a conservation purpose code', '99% (70)', '100% (4)', '99% (74)'],
                    ['Exclude: no wetland term or marker, and a water-supply purpose', '–', '–', '100% (3)'],
                  ],
                  highlight: 3,
                },
              },
              {
                kind: 'table',
                caption: 'Some of the 16 rules rejected',
                table: {
                  head: ['Rule', 'Design rows', 'Fresh rows'],
                  rows: [
                    ['Primary term, biodiversity marker and an action verb in the title', '98%', '74%'],
                    ['Primary term and a principal biodiversity marker', '94%', '84%'],
                    ['Primary term and the general environment sector', '89%', '78%'],
                    ['Primary term and environmental policy purpose', '87%', '70%'],
                    ['Donor is Canada', '89%', '41%'],
                    ['Recipient is Iraq, Senegal or Honduras', '94%', '58%'],
                    ['Exclude: marine or ocean text', '18%', '49%'],
                  ],
                  highlight: 2,
                },
              },
            ],
          },
        },
        {
          label: '3 July 2026',
          body: [
            'Each included row also needed a grade: Principal if wetlands are the point of the project, Significant if they are one aim among several. My first grading rules agreed with my own labels **80.5%** of the time but with Stephanie’s only **60%**: she judged by whether the wetland was integral to the project, not by where the word appeared.',
            'Over-calling Principal inflates the wetland-specific total, which is the error to avoid. So I made Significant the default, and a row only becomes Principal on positive evidence: a wetland term with an action verb in the title, GEF funding, or a named Ramsar site. On Stephanie’s **73** blind labels, every row the confident rules included was one she had included too.',
          ],
        },
        {
          label: '8 July 2026',
          body: [
            'The money was concentrated: the top **25** entries held half of it. So the biggest rows were screened by hand until **95%** of the value was decided, the AI screener took the next **4.5%**, and rules the last **0.5%**.',
            'For the uncertain middle I added one more text rule: a wetland term with a conservation verb, or a conservation purpose code with a wetland term. Across **25** random splits it was right **95.9%** of the time by value on rows it hadn’t seen, and never below **90.9%**, recovering **$911m**. Every row then had a decision, each tagged so it could be undone.',
          ],
          media: {
            kind: 'table',
            table: {
              head: ['Decided by', 'Rows', 'Value'],
              rows: [
                ['Hand', 'about 3,156', 'about $11.9bn'],
                ['AI screener', 'about 710', 'about $0.63bn'],
                ['Rules', 'about 9,939', 'about $0.13bn'],
              ],
              caption: 'Who decided the 13,805 rows screened by 13 July.',
            },
          },
        },
        {
          label: '13 July 2026',
          body: [
            'Stephanie reviewed the keyword list. Estuary, swamp and shellfish reef became Primary terms, and river, stream and delta became General. The **4,174** new candidate rows were screened, adding **196** projects worth **$1.79bn**, mostly river restoration in China.',
            'I also made the list English-first: non-English rows were translated before the search, which let me retire **189** French and Spanish terms and keep **22** as a backstop. Each keyword change was judged by how many rows it moved and how many of those were real.',
          ],
          side: 'left',
          media: {
            kind: 'table',
            table: {
              head: ['Term', 'Change', 'Why'],
              rows: [
                ['pan', 'Removed', '216 of 367 hits were “Pan-African” or “Pan-American”'],
                ['lagos', 'Removed', 'Mostly the city in Nigeria'],
                ['lake', 'Kept as General', 'As Primary it added 641 rows in 2024, mostly places like “Great Lakes Region”'],
                ['delta', 'Kept out of Primary', '1,404 rows of Nile, Mekong and Niger Delta locations'],
                ['LAC', 'Capitals ignored', 'Latin America and the Caribbean, not the French “lac”'],
                ['HeRON', 'Capitals ignored', 'A health programme, not the bird'],
              ],
            },
          },
        },
        {
          label: '29 July 2026',
          body: [
            'The last gap was the second OECD dataset, TOSSD, which overlaps the main one. A claimed **$7.3bn** of missing finance was **96%** already counted, so I only took TOSSD for the **20** providers missing from the main data. The real gap was **240** rows worth **$174.3m**, all screened.',
            'The final count: **14,045** transactions screened and **5,489** counted as wetland finance, worth **$6.96bn** wetland-related and **$3.83bn** wetland-specific. Made generic, the same paths and rules became the Explorer above.',
          ],
        },
      ],
    },
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
