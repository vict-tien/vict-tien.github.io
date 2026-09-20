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
section you're in. `prefers-reduced-motion` turns the easing into a jump. On
short viewports (`max-height: 620px`) snapping is disabled so content can't get
trapped off-screen.

```
src/
  content.ts              ← all copy and data (the only file you must edit)
  App.tsx                 ← shell: flag, header/rail, pane, tab bar
  hooks/useDossierNav.ts  ← eased snap navigation + scroll spy
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
