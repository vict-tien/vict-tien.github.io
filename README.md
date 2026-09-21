# Portfolio — "Dossier"

A single-page React portfolio built from the **Dossier** design boards
(2A desktop, plus the 3A / 3B / 3C responsive variants). One implementation,
four breakpoints — nothing is duplicated per device.

> ### ⚠️ The content is placeholder
>
> **Jordan Mercer is a fictional persona** that shipped with the design mockup.
> Every name, employer, metric, date and case study on the site is invented
> filler. A banner says so at the top of the page until you turn it off.
>
> Replace everything in [`src/content.ts`](src/content.ts), then set
> `IS_PLACEHOLDER = false` in that same file to hide the banner.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

Node 20+.

## Deploy to GitHub Pages

Configured as a **user site** — repo named `<your-username>.github.io`, served
from the domain root, so `base` is `/` in `vite.config.ts`.

1. Create a repo called `<your-username>.github.io` and push this folder to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push. `.github/workflows/deploy.yml` builds and publishes on every push to `main`.

Moving to a **project site** later (e.g. `username.github.io/Portfolio/`)? Change
one line in `vite.config.ts`:

```ts
base: '/Portfolio/',
```

`public/.nojekyll` is already there so GitHub doesn't strip Vite's `_`-prefixed
asset files.

## Making it yours

Everything editable lives in **`src/content.ts`**:

| What | Where |
| --- | --- |
| Name, disciplines, location, email, availability | `identity` |
| Headline, intro copy, the four-up stat row | `intro` |
| Case files — problem, what I did, metrics | `cases` |
| About copy and the three facts | `about` |
| Roles, and the résumé PDF link | `experience` |
| Building / reading / available-for | `now` |
| Contact blurb and social links | `contact` |

Two more things worth setting:

- **Images.** Every artwork slot is a hatched placeholder plate. Drop a file in
  `public/` and point at it: `image: '/atlas.png'` on a case, or
  `portrait: '/portrait.jpg'` in `about`.
- **Résumé.** Put a PDF in `public/` and set `experience.resumeUrl = '/resume.pdf'`.
  Until then the button renders as a visibly unwired placeholder.

Don't forget the `<title>` and meta description in `index.html`.

## How the layout works

| Board | Width | Shape |
| --- | --- | --- |
| **3A** | `< 768px` | Header on top, bottom index bar, case grid 2×2, detail stacked |
| **3B** | `768 – 1023px` | 212px rail, cases 4-across, detail stacked below |
| **3C** | `1024 – 1279px` | 238px rail, case list beside the detail |
| **2A** | `≥ 1280px` | 268px rail, full master/detail dossier |

The pane is a scroll-snap container; the rail and tab bar ease it between
panels (`src/hooks/useDossierNav.ts`), and an `IntersectionObserver` marks the
section you're in. `prefers-reduced-motion` turns the easing into a jump.

### When content outgrows a panel

A panel is a **minimum**, not a maximum — see
[`docs/DESIGN-SPEC-OVERFLOW.md`](docs/DESIGN-SPEC-OVERFLOW.md) for the full
reasoning. Each section is assigned one of three behaviours in `App.tsx`, and it
rides on the panel as `data-mode`:

| Mode | Sections | Behaviour |
| --- | --- | --- |
| **fit** | 01 intro, 06 contact | always one screenful; content budget in §5 of the spec |
| **flow** | 03 about, 04 experience, 05 now, 02 below 1024px | grows past the viewport, with a "CONT. ↓" caption |
| **frame** | 02 case files, ≥ 1024px | panel holds; the list and detail scroll inside it |

A panel taller than the pane drops out of scroll-snap, so it can never yank you
away from something you're part way through. While you're in one, a 1px hairline
on the rail's right edge tracks how far through it you are (a progress underline
on the active tab, on phones). Overflow is measured with a `ResizeObserver`, so
it keeps up with web fonts landing and with content you edit.

There is also a **density ladder** driven by viewport *height*, independent of
the four width boards: under 820px tall everything tightens by 25% and the short
copy variants in `content.ts` come into play; under 620px it tightens further and
snapping turns off entirely.

In development, a Fit panel that overflows logs a console warning — the
guarantee is only worth something if something checks it.

### Testing overflow

```bash
npm run dev:stress
```

Runs the site against [`src/content.stress.ts`](src/content.stress.ts): doubled
prose, eight case files, eight résumé entries per track, five stats, four
metrics, and a 38-character unbroken org name. Nothing should clip, overlap or
scroll sideways, and every panel's last line should be reachable scrolling down
**and back up**. The viewport matrix worth checking is in §7 of the spec — 400%
browser zoom included, since that is WCAG 2.1 SC 1.4.10 and the reason this
matters beyond polish.

```
src/
  content.ts              ← all copy and data (the only file you must edit)
  App.tsx                 ← shell: flag, header/rail, pane, tab bar
  content.stress.ts       ← over-budget fixture for `npm run dev:stress`
  hooks/
    useDossierNav.ts      ← snap nav, scroll spy, overflow detection
    useMediaQuery.ts      ← breakpoints that change markup, not just styling
  components/             ← Rail, MobileChrome, Plate, Stat, PlaceholderFlag
  sections/               ← Intro, CaseFiles, About, Experience, Now, Contact
  styles/
    theme.css             ← design tokens
    layout.css            ← shell + the four breakpoints
    sections.css          ← section internals
```

## Notes

- Fonts (Newsreader + JetBrains Mono) load from Google Fonts in `index.html`.
  Self-host them if you'd rather not depend on a third party.
- The pane hides its scrollbar, as the design does. Wheel, trackpad, touch and
  keyboard scrolling all still work.
