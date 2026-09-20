/* ============================================================================
 *  ⚠️  PLACEHOLDER CONTENT — NOT REAL
 * ----------------------------------------------------------------------------
 *  "Jordan Mercer" is a fictional persona that shipped with the design mockup.
 *  Every name, number, employer, metric and case study in this file is invented
 *  filler used to prove out the layout. None of it describes a real person.
 *
 *  This is the ONLY file you need to edit to make the site yours. Replace the
 *  values below, then set IS_PLACEHOLDER to false to hide the "placeholder
 *  content" banner that renders at the top of the page.
 * ========================================================================== */

/** Flip to false once you've replaced the content below with your own. */
export const IS_PLACEHOLDER = true;

export type SectionId = 'intro' | 'cases' | 'about' | 'experience' | 'now' | 'contact';

export interface NavItem {
  id: SectionId;
  /** Label in the desktop / tablet index rail. */
  label: string;
  /** Shorter label for the mobile bottom tab bar. */
  short: string;
  /** "01".."06" */
  num: string;
}

export const NAV: NavItem[] = [
  { id: 'intro', label: 'INTRO', short: 'INTRO', num: '01' },
  { id: 'cases', label: 'CASE FILES', short: 'WORK', num: '02' },
  { id: 'about', label: 'ABOUT', short: 'ABOUT', num: '03' },
  { id: 'experience', label: 'EXPERIENCE', short: 'CV', num: '04' },
  { id: 'now', label: 'NOW', short: 'NOW', num: '05' },
  { id: 'contact', label: 'CONTACT', short: 'MAIL', num: '06' },
];

/* -- Identity ------------------------------------------------------------- */

export const identity = {
  firstName: 'Jordan',
  lastName: 'Mercer',
  /** Sits under the name in the rail and mobile header. */
  disciplines: 'PRODUCT · DEVELOPMENT · ENGINEERING',
  location: 'MELBOURNE · UTC+10',
  email: 'hello@example.com',
  availability: 'OPEN TO ROLES & CONTRACTS',
  /** Trimmed for the narrower tablet rail. */
  availabilityCompact: 'OPEN TO ROLES',
  /** Short form used in the narrow mobile header. */
  availabilityShort: 'OPEN',
  footerLeft: 'J. MERCER — PORTFOLIO 2026',
  footerRight: 'REPLIES WITHIN 24H',
};

/* -- 01 / Intro ----------------------------------------------------------- */

export const intro = {
  headline: 'I write the spec, then I write the service.',
  body: 'Ten years between the roadmap and the repo — platform products at a Series C infrastructure company, and the Go services underneath them. Four case files below, each with the problem, my actual scope, and what moved.',
  /** Shown as a 4-up stat row along the bottom of the intro panel. */
  stats: [
    { value: '10', label: 'YEARS SHIPPING' },
    { value: '04', label: 'CASE FILES' },
    { value: '9', label: 'LARGEST TEAM LED' },
    { value: 'Go', label: 'STILL IN PRODUCTION' },
  ],
  /** Mobile-only call to action under the headline. */
  cta: 'GET IN TOUCH →',
};

/* -- 02 / Case files ------------------------------------------------------ */

export interface CaseFile {
  key: string;
  name: string;
  year: string;
  role: string;
  kicker: string;
  problem: string;
  did: string;
  metrics: { value: string; label: string }[];
  /**
   * Optional image for the case. Drop a file in `public/` and reference it as
   * '/atlas.png'. When null, the design's hatched placeholder plate is shown.
   */
  image: string | null;
  imageAlt?: string;
}

export const cases: CaseFile[] = [
  {
    key: 'atlas',
    name: 'Atlas',
    year: '2024',
    role: 'PM + BACKEND',
    kicker: 'Internal quoting platform · 400-seat sales org',
    problem:
      'Quotes took four days and three spreadsheets. Sales discounted blind; finance reconciled by hand.',
    did: 'Owned the roadmap and wrote the pricing engine in Go. Modelled the rule system with finance, then shipped an approvals flow sales actually used.',
    metrics: [
      { value: '−80%', label: 'quote turnaround' },
      { value: '$2.4M', label: 'margin recovered' },
      { value: '11', label: 'legacy sheets retired' },
    ],
    image: null,
  },
  {
    key: 'relay',
    name: 'Relay',
    year: '2023',
    role: 'PLATFORM PM',
    kicker: 'Event pipeline + self-serve webhooks · 1,400 tenants',
    problem:
      'A queue nobody trusted. Support absorbed integration failures the platform should have surfaced.',
    did: 'Defined delivery guarantees, drove the replay and dead-letter design with two teams, and built the tenant-facing logs console.',
    metrics: [
      { value: '99.98%', label: 'delivery rate' },
      { value: '−61%', label: 'integration tickets' },
      { value: '14d', label: 'median time to integrate' },
    ],
    image: null,
  },
  {
    key: 'fieldbook',
    name: 'Fieldbook',
    year: '2021',
    role: 'SOLO BUILD',
    kicker: 'Offline-first inspection app · utility crews',
    problem:
      'Crews worked where there was no signal, then re-entered everything at the depot that evening.',
    did: 'Designed, built and shipped it alone in 11 weeks — React frontend, conflict-aware sync layer, and the forms model crews helped write.',
    metrics: [
      { value: '2,100', label: 'daily users' },
      { value: '11wk', label: 'concept to field' },
      { value: '−3h', label: 'admin per crew, daily' },
    ],
    image: null,
  },
  {
    key: 'ledger',
    name: 'Ledger UI',
    year: '2020',
    role: 'DESIGN ENG',
    kicker: 'Component library + token system · six product teams',
    problem: 'Six teams, six button components, and an accessibility backlog nobody owned.',
    did: 'Built the library and token pipeline, wrote the contribution model, and migrated the two largest surfaces myself to prove it.',
    metrics: [
      { value: '6', label: 'teams adopted' },
      { value: 'AA', label: 'contrast, audited' },
      { value: '−40%', label: 'UI review time' },
    ],
    image: null,
  },
];

/* -- 03 / About ----------------------------------------------------------- */

export const about = {
  headline: 'The engineering route into product, without giving up the terminal.',
  body: 'Specs that hold up under load, estimates engineers recognise, prototypes instead of slide decks. I work best where the hard part is the model underneath — infrastructure, internal tools, anything with a data shape worth arguing about.',
  /** Condensed body used on phones. */
  bodyShort:
    'Specs that hold up under load, estimates engineers recognise, prototypes instead of slide decks. I work best where the hard part is the model underneath.',
  facts: [
    { label: 'LEADS', value: 'Teams of 5—12', short: '5—12' },
    { label: 'WRITES', value: 'Go · TS · SQL', short: 'Go · TS · SQL' },
    { label: 'STILL DOES', value: 'Code review, weekly', short: 'Code review' },
  ],
  /** Portrait image. Drop a 3:4 file in `public/` and set e.g. '/portrait.jpg'. */
  portrait: null as string | null,
};

/* -- 04 / Experience ------------------------------------------------------ */

export const experience = {
  /**
   * Résumé download. Put a PDF in `public/` and set this to '/resume.pdf'.
   * While null, the button renders as an unwired placeholder.
   */
  resumeUrl: null as string | null,
  roles: [
    {
      period: '2022 — NOW',
      org: 'Northbeam Infrastructure',
      title: 'SENIOR PM, PLATFORM',
      blurb: 'Led platform pod of 9. Owned API, billing and developer experience.',
    },
    {
      period: '2019 — 2022',
      org: 'Corvid Labs',
      title: 'PRODUCT MANAGER',
      blurb: 'First product hire. Took two internal tools to external GA.',
    },
    {
      period: '2015 — 2019',
      org: 'Tessellate Payments',
      title: 'BACKEND ENGINEER',
      blurb: 'Ledger and reconciliation services in Go. On-call for settlement.',
    },
  ],
};

/* -- 05 / Now ------------------------------------------------------------- */

export const now = {
  updated: 'UPDATED SEPT 2026',
  updatedShort: 'SEPT 2026',
  entries: [
    { label: 'BUILDING', value: 'A quieter alerting tool for small on-call teams.' },
    { label: 'READING', value: 'Designing Data-Intensive Applications, second pass.' },
    {
      label: 'AVAILABLE FOR',
      value: 'Platform PM roles, and short technical discovery contracts.',
    },
  ],
};

/* -- 06 / Contact --------------------------------------------------------- */

export const contact = {
  body: "Tell me what's stuck. If it's a platform or internal-tools problem, I'll have an opinion within a day.",
  links: [
    { label: 'GITHUB', href: '#' },
    { label: 'LINKEDIN', href: '#' },
    { label: 'WRITING', href: '#' },
  ],
};
