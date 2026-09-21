/* ============================================================================
 *  Overflow stress fixture — docs/DESIGN-SPEC-OVERFLOW.md §7.
 *
 *  A drop-in replacement for content.ts that sits well outside every content
 *  budget: doubled-length prose, eight case files, eight résumé entries per
 *  track, five intro stats, four metrics per case, six long nav labels, and a
 *  forty-character unbroken org name to attack the wrapping guards.
 *
 *  Run the site against it with:
 *
 *      npm run dev:stress
 *
 *  Nothing should clip, overlap, or scroll sideways. Every panel's last line
 *  should be reachable scrolling down AND back up. That is the whole
 *  regression suite this site needs.
 * ========================================================================== */

/* The explicit `.ts` extension keeps these specifiers outside the `--mode
   stress` alias in vite.config.ts, so this module can never resolve to
   itself. Both statements are type-only and erased at build time regardless. */
import type { Availability, CaseFile, ExperienceTrack, NavItem } from './content.ts';

export type {
  Availability,
  CaseFile,
  ExperienceEntry,
  ExperienceTrack,
  NavItem,
  SectionId,
} from './content.ts';

export const IS_PLACEHOLDER = true;

/* Six ids — App.tsx pairs NAV[i] with panel i, so the count is structural.
   The labels are long instead, to attack the rail's and tab bar's truncation. */
export const NAV: NavItem[] = [
  { id: 'intro', label: 'INTRODUCTION', short: 'INTRO', num: '01' },
  { id: 'cases', label: 'CASE FILES & SELECTED WORK', short: 'CASEWORK', num: '02' },
  { id: 'about', label: 'ABOUT', short: 'ABOUT', num: '03' },
  { id: 'experience', label: 'EXPERIENCE', short: 'CURRICULUM', num: '04' },
  { id: 'now', label: 'NOW', short: 'NOW', num: '05' },
  { id: 'contact', label: 'CONTACT', short: 'MAIL', num: '06' },
];

const availability: Availability | null = {
  full: 'OPEN TO CONTRACTS AND FRACTIONAL WORK',
  compact: 'OPEN TO ROLES',
  short: 'OPEN',
};

export const identity = {
  firstName: 'Maximilian',
  lastName: 'Featherstonehaugh',
  disciplines: [
    'Product Manager',
    'Data Analyst',
    'Building Services Engineer',
    'Distributed Systems Generalist',
  ],
  location: 'Sydney · Melbourne · UTC+10',
  email: 'maximilian.featherstonehaugh@averylongdomainname.example.com',
  availability,
  footerLeft: 'M. Featherstonehaugh — Portfolio 2026',
  footerRight: 'Set in Newsreader and JetBrains Mono',
};

export const intro = {
  headline: 'I write the specification, and then I write the service underneath it.',
  body: 'Ten years between the roadmap and the repository — platform products at a Series C infrastructure company, and the Go services underneath them. Eight case files below, each one with the problem as it was handed to me, my actual scope rather than the team’s, and what measurably moved afterwards. Every number here is reconstructed from the dashboards that were live at the time, and every one of them survived an argument with somebody in finance.',
  /** Five, to prove the stat row is not hard-wired to four. */
  stats: [
    { value: '10', label: 'YEARS SHIPPING' },
    { value: '08', label: 'CASE FILES ON RECORD' },
    { value: '9', label: 'LARGEST TEAM LED' },
    { value: 'Go', label: 'STILL IN PRODUCTION' },
    { value: '3', label: 'CONTINENTS WORKED' },
  ],
  cta: 'GET IN TOUCH ABOUT AVAILABILITY →',
};

const LONG_PROBLEM =
  'Quotes took four days and three spreadsheets to assemble, and by the time one reached a customer the pricing assumptions inside it were already stale. Sales discounted blind because nobody could see the margin floor; finance reconciled the damage by hand at the end of every month, which meant the company learned about a bad quarter six weeks after it had happened.';

const LONG_DID =
  'Owned the roadmap and wrote the pricing engine in Go. Modelled the rule system with finance over four weeks of whiteboard sessions, shipped an approvals flow that sales actually used rather than routed around, and then migrated the two largest regions myself to prove the migration path was real before asking anyone else to walk it.';

const metrics = [
  { value: '−80%', label: 'quote turnaround' },
  { value: '$2.4M', label: 'margin recovered' },
  { value: '11', label: 'legacy sheets retired' },
  { value: '99.98%', label: 'availability, rolling 90d' },
];

/** Eight, to prove the master list and its grid are not hard-wired to four. */
export const cases: CaseFile[] = [
  'Atlas',
  'Relay',
  'Fieldbook',
  'Ledger UI',
  'Beacon',
  'Quarry',
  'Sundial',
  'Interchange Reconciliation Platform',
].map((name, i) => ({
  key: `stress-${i}`,
  name,
  year: String(2024 - i),
  role: i % 2 ? 'PLATFORM PRODUCT MANAGER' : 'PM + BACKEND ENGINEERING',
  kicker: `Internal quoting and settlement platform · ${400 + i * 130}-seat organisation`,
  problem: LONG_PROBLEM,
  did: LONG_DID,
  metrics,
  image: null,
}));

export const about = {
  headline:
    'The engineering route into product management, taken without ever giving up the terminal or the on-call pager.',
  body: 'Specifications that hold up under load, estimates that engineers recognise as their own, and prototypes in place of slide decks. I work best where the hard part is the model underneath — infrastructure, internal tools, settlement systems, anything with a data shape worth arguing about for a fortnight. The argument is the work; the interface is what is left once the argument is settled and everybody agrees on what the nouns mean.',
  bodyShort:
    'Specifications that hold up under load, estimates engineers recognise, prototypes instead of slide decks. I work best where the hard part is the model underneath.',
  /** Four, to prove the facts row is not hard-wired to three. */
  facts: [
    { label: 'LEADS', value: 'Teams of five to twelve', short: '5—12' },
    { label: 'WRITES', value: 'Go · TypeScript · SQL', short: 'Go · TS · SQL' },
    { label: 'STILL DOES', value: 'Code review, every week', short: 'Code review' },
    { label: 'ON CALL', value: 'Settlement, one week in four', short: 'Settlement' },
  ],
  portrait: null as string | null,
};

const entry = (i: number) => ({
  period: `JAN ${2025 - i} — DEC ${2025 - i}`,
  org: i === 3 ? 'Interchangeabilityreconciliationgruppe' : 'Neuron Infrastructure Group',
  title: 'PRINCIPAL ENGINEERING DATA SPECIALIST, PLATFORM',
  meta: 'Distinction · promoted twice',
  blurb:
    'Led the platform pod of nine engineers. Owned the public API, billing, and developer experience end to end.\nOn call for settlement one week in four.',
});

export const experience = {
  resumeUrl: null as string | null,
  /** Eight per track, to push both columns well past a 1024px board. */
  tracks: [
    {
      key: 'work',
      label: 'WORK & PROJECTS',
      aside: 'MOST RECENT FIRST',
      entries: Array.from({ length: 8 }, (_, i) => entry(i)),
    },
    {
      key: 'education',
      label: 'EDUCATION & QUALIFICATIONS',
      aside: 'QUALIFICATIONS',
      entries: Array.from({ length: 8 }, (_, i) => entry(i + 8)),
    },
  ] as ExperienceTrack[],
};

export const now = {
  updated: 'UPDATED SEPTEMBER 2026',
  updatedShort: 'SEPT 2026',
  /** Five, to prove the list is not hard-wired to three. */
  entries: [
    {
      label: 'BUILDING',
      value: 'A quieter alerting tool for small on-call teams who are tired of being paged at four in the morning by a disk that is only ninety per cent full.',
    },
    {
      label: 'READING',
      value: 'Designing Data-Intensive Applications, second pass, slower this time.',
    },
    {
      label: 'AVAILABLE FOR',
      value: 'Platform product roles, and short technical discovery contracts.',
    },
    { label: 'LEARNING', value: 'Rust, badly, on Sunday afternoons.' },
    { label: 'AVOIDING', value: 'Anything that starts with a migration to a new ticketing system.' },
  ],
};

export const contact = {
  body: 'The fastest way to reach me is email — I read everything, and I answer anything with a real question in it inside a day or two. If you would rather talk than type, say so and I will send a calendar link back.',
  /** Six, to prove the link row wraps rather than overflowing. */
  links: [
    { label: 'GITHUB', href: 'https://github.com/vict-tien' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/' },
    { label: 'READING LOG', href: 'https://example.com/' },
    { label: 'WRITING', href: 'https://example.com/' },
    { label: 'SPEAKING', href: 'https://example.com/' },
    { label: 'RÉSUMÉ ARCHIVE', href: 'https://example.com/' },
  ],
};
