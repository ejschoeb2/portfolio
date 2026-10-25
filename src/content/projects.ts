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
  /** A website the caption links to, e.g. a supplier's shop. */
  link?: string
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
    /** A short looping clip (mp4 in public/videos) with a still to show before it loads. */
    | { kind: 'video'; src: string; poster: string; alt: string; caption?: string }
    /** ratio = frame width / height (default 0.8, portrait). */
    | { kind: 'slides'; images: StoryImage[]; ratio?: number }
    | { kind: 'table'; table: Table }
    /** Several images overlapped like a pile of sheets. */
    | { kind: 'stack'; images: StoryImage[] }
    /** The ball launcher's four-bar linkage, animated from its real link lengths. */
    | { kind: 'linkage' }
    /** The ball launcher's planned flight, drawn to scale from the trajectory model. */
    | { kind: 'trajectory'; caption?: string }
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
  /** Opening paragraph (or paragraphs) beside the main image. Falls back to `lede`. */
  intro?: string | string[]
  /** Projects with a story show it in place of `sections` and `gallery`. */
  story?: Chapter[]
  /** How it turned out, under its own heading after the story (steps not numbered). */
  results?: { title: string; chapters: Chapter[] }
  /** The finished thing under the title: a clip of it working and photos, which a
   *  button swaps for its 3D model. */
  showcase?: { video: { src: string; poster: string; alt: string }; photos: StoryImage[] }
  stats?: { value: string; label: string }[]
  sections: { heading: string; body: string[] }[]
  site?: Site
  /** A plain block of text under the opening, with an optional small heading. */
  about?: { title?: string; body: string[] }
  /** A tour of a tool, page by page, under its own heading. */
  walkthrough?: { title: string; pages: WalkPage[] }
  /** How part of the work works, as numbered steps (each label is the step's name). */
  method?: { title: string; chapters: Chapter[] }
  /** Set false to show a story's steps without their numbers. */
  stepNumbers?: boolean
  /** Shown under a "What I've built" heading, each with its website. */
  builds?: Build[]
  /** The main image opens this in a new tab (a read-only workbook, a live site). */
  open?: { url: string; label: string }
  /** 'web': no main image; title and opening paragraph side by side, then the
   *  site (or each build's site, the bin's 3D model, or the showcase) full width below. */
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
    blurb: 'A fully mechanical launcher that fires four balls into alternating targets. Two motors, no electronics, and it works: last year only 2 of about 60 groups managed that.',
    media: {
      kind: 'screen',
      src: '/images/launcher-build-mechanism.webp',
      alt: 'The finished launcher: yellow 3D-printed Geneva wheel and ramp, clear acrylic gears, and the blue O-ring flywheel on its motor',
      position: '50% 58%',
    },
    facts: [
      { label: 'Role', value: 'CAD lead' },
      { label: 'Team', value: '5 people' },
      { label: 'When', value: 'Feb – Oct 2026' },
      { label: 'CAD', value: 'Autodesk Inventor' },
      { label: 'Result', value: 'Built and working' },
    ],
    lede: 'A university project to fire four table-tennis balls into alternating target zones using two motors and no electronics.',
    intro: [
      'In a team of five, I designed and built a fully mechanical table-tennis ball launcher for a University of Bath project. It fires four balls in quick succession over the net, to alternating left and right zones.',
      'On build day it worked, which is rarer than it sounds. Last year, only **2** of about **60** groups got theirs firing. Here it is in action:',
    ],
    // Title and opening side by side, then the clip, photos and 3D model.
    layout: 'web',
    showcase: {
      video: {
        src: '/videos/launcher-firing.mp4',
        poster: '/videos/launcher-firing-poster.jpg',
        alt: 'The finished launcher on a workshop bench, feeding and firing table-tennis balls down the table towards a teammate at the far end',
      },
      photos: [
        {
          src: '/images/launcher-build-mechanism.webp',
          alt: 'The finished launcher: yellow Geneva wheel and ramp, raised upper plate, acrylic gears and the blue O-ring flywheel on its motor',
        },
        {
          src: '/images/launcher-build-loaded.webp',
          alt: 'The launcher loaded with table-tennis balls in the Geneva wheel, with the flywheel motor and battery pack to the right',
        },
      ],
    },
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
          'Louis’s idea came out on top. We scored every concept against eight criteria from the specification in a weighted decision matrix, and his won thanks to its Geneva mechanism, which turns one motor’s steady rotation into four clean steps.',
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
          kind: 'trajectory',
          caption: 'The planned flight: 3.35 m/s at 35°, over the net and into the zone at 930 mm.',
        },
      },
      {
        label: '23 March 2026',
        body: [
          'The aim comes from a four-bar linkage, and while the first version worked on paper, the real geometry was a different matter. Each time the CAD showed one part hitting another, I had to change the geometry and recalculate the length of every arm across the linkage. It took **six versions** until it finally worked.',
        ],
        media: {
          kind: 'panels',
          panels: [
            {
              kind: 'table',
              caption: 'All six versions, with the **length of each bar in mm**',
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
              link: 'https://www.technobotsonline.com/',
            },
            {
              src: '/images/launcher-order-rs.webp',
              alt: 'RS Components order, £9.75',
              caption: 'RS Components',
              link: 'https://uk.rs-online.com/',
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
          'When we tested the first parts together, we realised the flywheel wouldn’t work as intended, so we redesigned it.',
          'The new one is a printed hub with two rubber O-rings that grip the ball, and swapping the rings tunes its speed. I recalculated everything around the smaller wheel: on six AA batteries it should spin at about **3,480 RPM** and launch the ball at **3.3–3.5 m/s**. The ramp changed to match, so we reprinted that too.',
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
          ],
        },
      },
      {
        label: '23 October 2026',
        body: [
          'On build day it took a few fixes. The gear driving the Geneva wheel was misaligned, so I reprinted it. Even then the Geneva wheel was a little finicky: once the driver pin left its slot, nothing held the wheel still, so it sometimes rotated on too far and stopped slightly out of line.',
          'The firing arm also sat too low. The ball didn’t meet the flywheel until it reached the ramp, and by then it was too slow to make it up. I added spacer layers under the arm’s base so the flywheel caught the ball earlier.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/launcher-build-assembly.webp',
            alt: 'Two team members assembling the laser-cut base, the yellow Geneva wheel and the blue flywheel at a workshop bench',
            caption: 'Putting the base, Geneva wheel and flywheel together on build day.',
          },
        },
      },
    ],
    results: {
      title: 'Final results',
      chapters: [
        {
          label: '23 October 2026',
          heading: 'We succeeded!',
          body: [
            'We switched the finished launcher on and it fired all four balls in quick succession, about **0.8 s** apart, and every one cleared the net. Last year only **2 of about 60** groups got their launcher working.',
            'Each ball flew in an arc about **300 mm** high and landed around **110 cm** away. The flywheel puts a lot of topspin on the ball, so it carried on well after the bounce, and the Magnus effect pulled the arc down just as the trajectory model had allowed for.',
            'The battery pack we were given was more powerful than our design needed, so the launcher ran faster and fired further than planned. On a less powerful pack it would have worked exactly as intended.',
          ],
          stats: [
            { value: '4 / 4', label: 'balls fired over the net' },
            { value: '2 of 60', label: 'groups working last year' },
          ],
        },
        {
          label: 'Looking back',
          body: [
            'The lesson from our design report held up on build day: kinematics and geometry are only the starting point, and nearly every fix was about how the parts physically sat together. For a second version, I would add a locking disc to the Geneva drive, a curved ring on the driver that holds the wheel still between steps and stops the over-rotation we saw.',
          ],
        },
      ],
    },
    sections: [],
  },
  {
    slug: 'dragster',
    title: 'Spring-powered dragster',
    kind: 'University of Bath · first-year team project',
    period: 'Jan 2026',
    blurb: 'A mostly 3D-printed dragster driven by an elastic band. Our team came first of 60, at 2.26 seconds over 10 m.',
    // TODO: add `media` (card photo) once there are pictures. Until then the card shows a blank drawing sheet.
    facts: [
      { label: 'Result', value: '1st of 60 teams, 2.26 s' },
      { label: 'Role', value: 'Energy and grip calculations' },
      { label: 'Team', value: 'Six students' },
      { label: 'Made with', value: '3D printing, light wood' },
    ],
    lede: 'A first-year project to build a spring-powered dragster and race it over a timed 10 m course. Our team came first of 60.',
    intro:
      'In my first year at Bath, my team of six designed, built and raced a dragster powered by nothing but an elastic band, over a timed 10 m course from a standing start. Out of 60 teams, we came first overall, with a time of 2.26 seconds.',
    story: [
      {
        label: 'The design',
        body: [
          'Most of the dragster is 3D printed. The large back wheel carries a custom wind-up pulley, and the elastic band stretches the full length of the car to a long front. Rubber bands round the rear wheels add grip, and the body is light wood.',
          'The pulley tapers, so the windings get thinner as the band unwinds. At the start the band pulls on a large radius, giving plenty of torque to get moving; by the end it pulls on a small one, so the wheel spins faster once the car is already up to speed.',
        ],
        // TODO: add a photo or CAD render of the whole dragster here.
      },
      {
        label: 'My calculations',
        body: [
          'I did the calculations. First, how much energy the stretched elastic band stores and passes to the wheel, which gave the car’s **maximum wheel speed**. Second, whether the rubber on the rear wheels would grip well enough to stop them spinning at the start.',
          // TODO: add the real figures (band energy, maximum RPM, friction coefficient) once calculated.
        ],
        // TODO: add the calculation sheet or a chart as media.
      },
      {
        label: 'Race day',
        body: [
          'On race day we came first of **60 teams**, covering the 10 m course in **2.26 seconds**.',
          // TODO: add the number of runs, how it compared with the other teams, and what we would change.
        ],
        // TODO: add race-day photos or video.
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
    about: {
      title: 'What I built',
      body: [
        'In five weeks I built a PostgreSQL database of **3.2 million** finance records from four overlapping datasets, three from the OECD and one from TOSSD, with the double-counting between them resolved.',
        'On top of it I built an automatic classification. It decides whether each candidate project counts for a topic like wetlands, and whether that topic is the point of the project or one aim among several. It screened **14,045** transactions, using only rules that held up in blind tests.',
        'The client got it all as one Excel tool over about **2.35 million** activities, run by Power Query and VBA, so a non-technical team can do the same search for any topic. I wrote the methodology report and an illustrated user guide to go with it.',
      ],
    },
    sections: [],
    walkthrough: {
      title: 'How it works',
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
      title: 'How the auto classification works',
      chapters: [
        {
          label: 'Find the candidates',
          body: [
            'There is no wetlands marker in OECD data, so wetland finance has to be found from each project’s text. Keyword lists catch the candidates: Primary terms count on their own, General terms only in numbers or with supporting evidence such as a biodiversity marker or an environmental funder.',
            'Matching whole words mattered. Matching inside words, “pan” caught Japan and “bog” caught Bogotá; fixing it cut the candidates from **1,947** to **864**.',
          ],
          media: {
            kind: 'table',
            table: {
              head: ['Group', 'How it counts', 'Examples'],
              rows: [
                ['Primary', 'On its own', 'wetland, Ramsar, mangrove, peatland, seagrass, coral reef'],
                ['General', 'Two or more, or with other evidence', 'lagoon, marsh, floodplain, lake, oasis'],
                ['Fauna', 'Only with a biodiversity marker', 'migratory birds, heron, plover, otter'],
                ['Gated', 'Only with a conservation word', 'rice paddy, fish pond, salt pan'],
              ],
            },
          },
        },
        {
          label: 'Clean out false friends',
          body: [
            'A random audit found only **34** of **50** candidates were real wetland projects. Most of the rest came from a few words, so I checked each suspect term by how many rows it brought in and how many of those were real.',
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
                ['LAC', 'Capitals ignored', 'Latin America and the Caribbean, not the French “lac”'],
              ],
            },
          },
        },
        {
          label: 'Test every rule',
          body: [
            'Rules that decide rows automatically were designed on **628** rows I labelled by hand, then tested on **280** fresh rows they had never seen. To be used, a rule had to be right at least **94%** of the time.',
            'Only **5** of the **21** I tried passed. Most failures had memorised a few big programmes: “donor is Canada” scored **89%** on the design rows but **41%** on fresh ones.',
          ],
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
                    ['Primary term and the general environment sector', '89%', '78%'],
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
          label: 'Grade what’s kept',
          body: [
            'Each included project is Principal if wetlands are its point, or Significant if they are one aim among several. Over-calling Principal inflates the total, so Significant is the default and Principal needs positive evidence, like a wetland term with an action verb in the title. On the client’s **73** blind labels, every project the confident rules included, she had included too.',
          ],
        },
        {
          label: 'Finish by hand and AI',
          body: [
            'The money is concentrated, so the biggest projects were screened by hand until **95%** of the value was decided. An AI screener, tested against my labels over nine versions, took the next **4.5%**, and rules the last **0.5%**.',
            'In the end **14,045** transactions were screened and **5,489** counted as wetland finance.',
          ],
          side: 'left',
          media: {
            kind: 'table',
            table: {
              head: ['Decided by', 'Rows', 'Value'],
              rows: [
                ['Hand', 'about 3,156', 'about $11.9bn'],
                ['AI screener', 'about 710', 'about $0.63bn'],
                ['Rules', 'about 9,939', 'about $0.13bn'],
              ],
              caption: 'Who decided the first 13,805 rows.',
            },
          },
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
    layout: 'web',
    site: {
      url: 'https://cruising-redesign.vercel.app/',
      label: 'the redesigned site',
      capture: '/images/ctheworld-full.webp',
      embeddable: false,
    },
    facts: [
      { label: 'Role', value: 'Brand, design and full-stack build' },
      { label: 'When', value: 'Jan – Jun 2025' },
      { label: 'Stack', value: 'Node.js, MongoDB, Render, GitHub' },
      { label: 'Data', value: 'Widgety API' },
    ],
    lede: 'I designed the brand and built the website for a cruise agency, so customers could search every cruise in one place.',
    intro:
      'Cruising the World is a cruise agency. I designed its brand and built its website, so customers could search every cruise in one place. The agency’s site has since been taken down, so I’ve rebuilt it as a redesign, shown below. The cruises in it are sample data.',
    stats: [
      { value: '26,000', label: 'cruise records' },
      { value: '15 min', label: 'between price refreshes' },
      { value: '200%', label: 'Instagram growth' },
    ],
    about: {
      body: [
        'I created the brand, from the logo to the colours, and designed a site where customers can search holidays by region, country, cabin type, number of stops and price.',
        'Behind it, a Node.js server held 26,000 cruises from the Widgety API in MongoDB. It merged the itineraries with their prices and refreshed them every 15 minutes, so listings stayed accurate without anyone updating them.',
        'I also ran the agency’s social media and grew its Instagram by 200%.',
      ],
    },
    sections: [],
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
    stepNumbers: false,
    story: [
      {
        label: 'February 2023',
        body: [
          'In the design technology workshop at school I came across sheets of mirrored acrylic, a material I had never seen. It had the finish of a real mirror but was light, tough and could go straight into a laser cutter: if I could draw a shape, I could make it a mirror. I started drawing designs in 2D Design, the school’s CAD software, from a board of ideas I built on Pinterest.',
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
        label: 'Spring 2023',
        body: [
          'The first mirrors didn’t come out as I’d pictured. The cutter wasn’t calibrated and my designs were too fine, so the acrylic melted in places instead of cutting cleanly. It taught me that a part has to suit the machine and material that make it, not just look good on screen.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/etsy-first-cut.webp',
            alt: 'An early round mirror with a leafy cut-out design, its fine details partly melted',
            caption: 'One of my first cuts, melted where the detail was too fine.',
          },
        },
      },
      {
        label: 'Late 2023',
        body: [
          'As my CAD skills improved I redrew my designs with bolder shapes and details sized for the laser. It was still a hobby: I made mirrors as custom gifts, and each one taught me more about what would cut cleanly.',
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
        label: 'February 2024',
        body: [
          'Once I had designs I was proud of, I opened an Etsy shop. The photo is the first thing a buyer sees, so I styled the mirrors on real walls and shelves, in soft light, for the listings.',
        ],
        media: {
          kind: 'image',
          image: {
            src: '/images/etsy-hummingbirds-shelf.webp',
            alt: 'Two hummingbird mirrors on a kitchen wall beside patterned mugs',
            caption: 'One of the product photos I took for the shop.',
          },
        },
      },
      {
        label: '2024',
        body: [
          'In the end I sold six mirrors, but I had taken a product from an idea in a school workshop to something people paid for. Two things held the shop back: 3 mm acrylic with lots of cut-outs is fragile to post, and standing out on Etsy is hard.',
        ],
      },
    ],
    sections: [],
  },
  {
    slug: 'desk-lamp',
    title: 'Biomimicry desk lamp',
    kind: 'GCSE Design and Technology',
    period: '2021 – 2022',
    blurb: 'A calming desk lamp for a friend with ADHD, with laser-cut acrylic fins shaped like octopus tentacles.',
    media: {
      kind: 'screen',
      src: '/images/lamp-final.webp',
      alt: 'The finished lamp lit up on a workshop bench: eight neon acrylic fins curving up around a bulb in a white 3D-printed base',
      position: '50% 42%',
    },
    facts: [
      { label: 'Role', value: 'Designer and maker' },
      { label: 'When', value: '2021 – 2022' },
      { label: 'CAD', value: 'SketchUp, Fusion 360, 2D Design' },
      { label: 'Made with', value: 'Laser cutter and 3D printer' },
    ],
    lede: 'My GCSE Design and Technology project: a calming desk lamp for a friend with ADHD.',
    intro:
      'For my GCSE Design and Technology project I designed and made a desk lamp for a friend with ADHD, who found it hard to focus when revising at home. Eight laser-cut acrylic fins, shaped like octopus tentacles, glow around a bulb in a 3D-printed base. The whole process is below.',
    story: [
      {
        label: 'The brief',
        body: [
          'My friend wanted something to help him focus while revising at home, where his phone and everything around him kept pulling him away. In an interview he told me lamps and relaxing light had helped him most, that nature helped him relax, and that he could spend **£10–20**.',
          'I visited his desk to see where it would go: plenty of space and a socket close by, so a mains lamp made more sense than batteries. From the interview, a questionnaire and my research, I wrote the specification.',
        ],
        media: {
          kind: 'table',
          table: {
            head: ['Requirement', 'Target'],
            rows: [
              ['Form', 'Copies nature, and is relaxing to look at'],
              ['Light', 'Lights a small area with calming light'],
              ['Power', 'Draws less than 5 W'],
              ['Cost', 'Under £20'],
              ['Size', 'No bigger than 400 × 200 × 200 mm'],
              ['Safety', 'A stable base, no hot filament bulb, survives small knocks'],
              ['Materials', 'High quality, recyclable, parts that fit together seamlessly'],
            ],
          },
        },
      },
      {
        label: 'Research',
        body: [
          'In a questionnaire of people with ADHD, relaxing lighting came out as what helped most. Research into biomimicry, copying nature in design, backed up my friend’s wish: one study found people’s heart rates were lower walking in a forest than in a city.',
          'I compared four materials for the parts. Acrylic suited the visible pieces best: it is cheap, cuts cleanly on a laser cutter and comes in bright colours.',
        ],
        side: 'left',
        media: {
          kind: 'table',
          table: {
            head: ['Material', 'For', 'Against'],
            rows: [
              ['Acrylic', 'Cheap, laser cuts cleanly, lots of colours', 'Scratches easily, low melting point'],
              ['PLA', 'Biodegradable, easy to 3D print', 'Not flexible, shatters easily'],
              ['ABS', 'Very cheap, tough, easy to 3D print', 'Weakened by sunlight, not biodegradable'],
              ['Aluminium', 'Strong, light, recyclable', 'Expensive and hard to shape'],
            ],
          },
        },
      },
      {
        label: 'Ideas',
        body: [
          'I drew ten ideas by hand and modelled most of them in SketchUp. Nearly all copied something from nature: a tree, a honeycomb, a rainbow, a flower, stacking pyramids, and fins inspired by an octopus’s tentacles.',
        ],
        media: {
          kind: 'slides',
          ratio: 4 / 3,
          images: [
            {
              src: '/images/lamp-ideas-sketch.webp',
              alt: 'A sheet of hand-drawn initial ideas, including a tentacle lamp, a flower lamp and a lamp on a wooden block',
              caption: 'A sheet of initial ideas',
            },
            {
              src: '/images/lamp-ideas-pyramid.webp',
              alt: 'A hand-drawn lamp made of coloured triangular pyramids, with annotations',
              caption: 'Stacking pyramids',
            },
            {
              src: '/images/lamp-ideas-honeycomb.webp',
              fit: 'contain',
              alt: 'SketchUp model of a cylindrical lamp with a honeycomb pattern of yellow panels on a wooden base',
              caption: 'Honeycomb, modelled in SketchUp',
            },
            {
              src: '/images/lamp-ideas-tree.webp',
              fit: 'contain',
              alt: 'SketchUp model of a yellow branching tree lamp on a grey base',
              caption: 'Tree, modelled in SketchUp',
            },
            {
              src: '/images/lamp-ideas-octopus.webp',
              fit: 'contain',
              alt: 'Hand-drawn sketch of a lamp with blue tentacle-like fins around a bulb, with annotations',
              caption: 'The octopus fins',
            },
          ],
        },
      },
      {
        label: 'Choosing',
        body: [
          'I scored every idea against each point of the specification. The octopus fins came top with **18** points, two clear of the next, and my friend chose it too: “I think design 5 looks the best, I can see the biomimicry and it looks like it would be helpful.”',
        ],
        side: 'left',
        media: {
          kind: 'image',
          image: {
            src: '/images/lamp-scores.webp',
            alt: 'The scoring table: each of the ten ideas rated green, amber or red against every point of the specification, with idea 5 scoring 18',
            caption: 'Every idea scored against the specification: green 2, amber 1, red 0.',
          },
        },
      },
      {
        label: 'Development',
        body: [
          'Models showed the problems. In cardboard the fins slumped sideways, acrylic test fins snapped, the lamp was too big and there was no way to wire the bulb.',
          'So I shrank the base from **150 mm** to **100 mm** across and split it in two: a dome with eight slots for the fins and a **10 mm** hole for the wires, and an insert to hold a standard E27 bulb. The fins went from **8 mm** to **3 mm** thick, and their colours changed to green, red, orange and blue to look more natural. The developed design scored **92 out of 100** against the specification.',
        ],
        media: {
          kind: 'slides',
          ratio: 4 / 3,
          images: [
            {
              src: '/images/lamp-cardboard.webp',
              fit: 'contain',
              alt: 'A cardboard model of the lamp on a workshop bench, its fins slumping sideways',
              caption: 'The cardboard model',
            },
            {
              src: '/images/lamp-dev-sketch.webp',
              fit: 'contain',
              alt: 'Drawing of the developed lamp from the side and from above, with coloured fins around the bulb',
              caption: 'The developed design, from above and the side',
            },
            {
              src: '/images/lamp-base-cad.webp',
              fit: 'contain',
              alt: 'Fusion 360 model of the domed base with eight curved slots for the fins and a hole for the wires',
              caption: 'The base in Fusion 360',
            },
            {
              src: '/images/lamp-dev-render.webp',
              fit: 'contain',
              alt: 'CAD model of the lamp with its fins, bulb and screw fitting',
              caption: 'How the fins, bulb and base fit together',
            },
          ],
        },
      },
      {
        label: 'Making',
        body: [
          'I modelled the base in Fusion 360 and 3D printed it in white PLA, with the bulb fitting adapted from a design on Thingiverse. The fins were drawn in 2D Design and laser cut from 3 mm acrylic in four colours, two of each.',
          'Then came the hand work: straightening fins that warped in the cutter on a line bender, drilling holes for the wires, sanding the holder to fit and gluing the fins into their slots. A **12 V**, **5 W** bulb on a variable power supply lights it.',
        ],
        side: 'left',
        media: {
          kind: 'slides',
          images: [
            {
              src: '/images/lamp-printing.webp',
              alt: 'The white domed base on the bed of a FlashForge 3D printer',
              caption: 'Printing the base',
            },
            {
              src: '/images/lamp-fin-cut.webp',
              alt: 'An orange acrylic fin fresh from the laser cutter',
              caption: 'A fin from the laser cutter',
            },
            {
              src: '/images/lamp-line-bender.webp',
              alt: 'An orange acrylic fin on a line bender, being straightened',
              caption: 'Straightening a fin on the line bender',
            },
            {
              src: '/images/lamp-wiring.webp',
              alt: 'Hands feeding wires through the 3D-printed bulb holder',
              caption: 'Wiring the bulb holder',
            },
            {
              src: '/images/lamp-first-light.webp',
              alt: 'The base with its bulb lit for the first time, before the fins went in',
              caption: 'First light, before the fins went in',
            },
          ],
        },
      },
      {
        label: 'Testing',
        body: [
          'I tested the finished lamp against every point of the specification and it scored **208 out of 220**. It draws **5 W**, fits in **120 × 120 × 280 mm**, takes **5 N** to push over and survived a **1.5 m** drop with only small scratches. The parts cost **£19.25**, under budget.',
          'My friend found it calming and said it helped him focus. If I made it again, I’d look for a warmer light: the colour was calming, but not the most relaxing it could be.',
        ],
        media: {
          kind: 'slides',
          images: [
            {
              src: '/images/lamp-lit-2.webp',
              alt: 'The finished lamp lit on a workshop bench, its neon fins glowing',
              caption: 'The finished lamp',
            },
            {
              src: '/images/lamp-lit-1.webp',
              alt: 'The finished lamp lit beside the variable power supply',
              caption: 'Running at 12 V',
            },
            {
              src: '/images/lamp-lit-3.webp',
              alt: 'The lamp from above, with the fins curving over the bulb',
              caption: 'From above',
            },
          ],
        },
      },
    ],
    sections: [],
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)

export const projectNumber = (project: Project) =>
  String(projects.indexOf(project) + 1).padStart(2, '0')
