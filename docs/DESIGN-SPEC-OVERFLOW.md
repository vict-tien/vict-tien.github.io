# Design Spec Update — Overflow

**Status:** implemented · **Supersedes:** the "one panel = one screenful" assumption in the
Dossier boards (2A / 3A / 3B / 3C) · **Scope:** `src/styles/*`, `useDossierNav`, three
component-level changes · **Proposed:** 2026-09-21 · **Built:** 2026-09-22

> Built as specified except for two points, both marked **AS BUILT** below:
> scroll containment on the Mode C columns, and hyphenation on display type.

---

## 1. The problem

The Dossier layout is built on a promise: six panels, each exactly one screenful,
paginated by scroll-snap. `.panel { min-height: 100% }` makes that the *floor*, and the
rail, the tab bar and the snap engine all assume it is also the *ceiling*.

It is not. Panel height is content-driven, and the content is yours to change. A sixth
case file, a real résumé with seven roles, a two-line job title, a 400% zoom for
accessibility — any of these pushes a panel past the viewport, and the design has no
defined behaviour for that state. Today it does one of four undesigned things:

| # | What happens | Where |
| --- | --- | --- |
| 1 | Content **spills out of the panel and paints over the next section** | `.cases` / `.detail` |
| 2 | Content grows correctly but the reader is **never told there is more below** | Experience, About, Now |
| 3 | Content **clips silently** against `.app { overflow: hidden }` | the rail |
| 4 | A **sliver** — panel 105% of the viewport, one scroll for 30px of content | any Mode A panel |

Failure 1 is the serious one, and it is structural, not incidental:

```css
/* sections.css:125 */  .cases  { flex: 1; min-height: 0; }
/* sections.css:308 */  .detail { min-height: 0; }
```

`min-height: 0` overrides the automatic minimum size of a flex item. `.cases` is
`flex: 1 1 0%`, so its height becomes exactly the leftover space in the panel and stops
there. `.panel` therefore never grows to accommodate it. Longer prose in
`case.problem` / `case.did` — or a fourth metric, or a fifth case — pushes content out of
the bottom of a box that will not stretch, with no `overflow` rule to clip it and no
background on `.panel` to hide it. It renders over section 03.

Failure 3 is the same mechanic one level up: `.rail` (`layout.css:145`) is a fixed-height
grid item with `min-height: 0`, `justify-content: space-between`, and no overflow
handling. Add a nav item or a fourth discipline on a 1280×720 screen and `.rail__foot` —
location and email, the only contact route on tablet and desktop — is cut off by
`.app { overflow: hidden }` with nothing to scroll.

Failure 2 is a perception bug, not a layout one. Panels without `min-height: 0` *do*
grow, so nothing is lost. But in a snap-paginated layout the reader has been taught that
a panel boundary is the end of the section, so below-fold content reads as absent. And
because `scroll-snap-align: start` snaps to the panel's **top**, scrolling *upward* from
section 05 into section 04 lands on 04's first line and skips its tail entirely.

The one guard that exists — `@media (max-height: 620px)` (`layout.css:370`) — solves the
inverse problem. It handles a short *viewport*; it does nothing about long *content*.

> **On the numbers below.** Trigger thresholds are derived by reading the cascade, not
> measured in a browser. They are directionally right and good enough to design against;
> §7 lists what to measure before calling this done.

---

## 2. Design position

> **A panel is a minimum, not a maximum. When content exceeds the frame, the frame is
> what yields — visibly, and in the dossier's own language.**

A physical dossier does not shrink a page to fit; it prints *continued overleaf* and
turns the page. That is the model. Three modes, assigned per section by what the content
actually is:

**Mode A — Fit.** The panel is guaranteed one screenful. It adapts by compressing (fluid
type, fluid plates, a density ladder) and is protected by a documented content budget.
For panels whose job is composition: **01 Intro**, **06 Contact**.

**Mode B — Flow.** The panel grows past the viewport on purpose. Snap relaxes, centring
turns off, and a continuation affordance appears. For unbounded list and prose content:
**03 About**, **04 Experience**, **05 Now**, and **02 Case Files below 1024px**.

**Mode C — Frame.** The panel stays one screenful; a designated region scrolls *inside*
it. Only where the composition is the feature: **02 Case Files at ≥1024px**, where
master/detail is the whole point of board 2A.

Everything below follows from that assignment.

---

## 3. Global rules

### 3.1 Centring becomes conditional

Five containers centre their content — `.intro__main`, `.about`, `.exp__tracks`,
`.now__list`, `.contact__main`, across six declarations in `sections.css`. Centring is
correct when content fits and actively harmful when it does not. CSS has the exact
primitive for this:

```css
justify-content: safe center;   /* flex:  .intro__main, .now__list, .contact__main */
align-content:  safe center;    /* grid:  .about, .exp__tracks */
```

`safe` falls back to `start` the moment the content overflows. One keyword, no JS, and it
removes the sliver's worst symptom — a panel centred inside its own overgrown box.

No `@supports` guard is needed, which the proposal got wrong. An engine that does not
know the `safe` keyword drops the whole declaration as invalid, so alignment reverts to
`normal` — start-aligned for flex — which is precisely the fallback the guard would have
written by hand.

### 3.2 A density ladder replaces the single height guard

Retire the lone `max-height: 620px` rule in favour of three vertical density steps. This
buys roughly 15–20% vertical headroom before anything overflows, which absorbs most
slivers outright.

| Step | Viewport height | `--pad-y` (desktop) | Section gaps | Plates | Snap |
| --- | --- | --- | --- | --- | --- |
| `comfortable` | ≥ 820px | 52px | ×1.0 | ×1.0 | on |
| `compact` | 620–819px | 36px | ×0.75 | ×0.8, `.rsp-short` copy | on |
| `dense` | < 620px | 24px | ×0.6 | ×0.65 | **off**, `min-height: auto` |

`dense` reproduces today's 620px guard, so nothing regresses. `compact` is new, and it is
where most laptops live (1366×768, 1280×720). Note the reuse: `compact` promotes the
existing `.rsp-short` / `.rsp-long` copy pair from a *width* switch to a width-**and**-
height switch, so `about.bodyShort` and `now.updatedShort` finally earn their keep on
desktop. No new content fields.

### 3.3 Fixed pixel heights become viewport-relative

Four hard-coded plate heights (`sections.css:532, 569, 580` and `410`) are the most
reliable overflow driver on short screens. Collapse each family into one fluid rule:

Each keeps a per-breakpoint clamp rather than one global rule, so the boards' proportions
survive while the viewport term does the protecting:

| | < 768 | ≥ 768 | ≥ 1024 | ≥ 1280 |
| --- | --- | --- | --- | --- |
| `.about__plate` was | 210px | 320px | 380px | 420px |
| `.about__plate` is | `clamp(150px, 25vh, 210px)` | `clamp(200px, 32vh, 320px)` | `clamp(220px, 40vh, 380px)` | `clamp(240px, 46vh, 420px)` |
| `.detail__plate` was | 132px | `flex: 1`, min 180px | ← | 200px |
| `.detail__plate` is | `clamp(110px, 16vh, 140px)` | `flex: 1`, min `clamp(140px, 22vh, 200px)` | `clamp(132px, 22vh, 200px)` | ← |

On a tall screen each clamp lands on its original pixel value, so the boards are
unchanged; on a short one the `vh` term takes over before the panel can overflow.

`object-fit: cover` on `.hatch__img` already handles the aspect change.

Display type gains a height term so a long headline cannot outgrow a short screen:

```css
--fs-display: clamp(72px, min(6.7vw, 13vh), 104px);   /* ≥1280px */
```

### 3.4 Count-locked grids become count-agnostic

Six grids hard-code their child count. Each breaks the moment the content array changes
length — a fifth stat orphans onto its own row, a fourth metric collides with the
`margin-top: auto` floor.

Each becomes `repeat(auto-fit, minmax(var(--<name>-min), 1fr))`. The minimum is a token
so it can differ per breakpoint, and each value is chosen so the *default* content lays
out exactly as the boards do — auto-fit collapses the empty tracks and `1fr` stretches
the rest, so four stats in a five-track grid still fill the row.

| Selector | Was | Min token | < 768 | ≥ 768 |
| --- | --- | --- | --- | --- |
| `.intro__stats` | `repeat(4, 1fr)` | `--stat-min` | 120px → 2-up | 100px → 4-up |
| `.detail__metrics` | `repeat(3, 1fr)` | `--metric-min` | 86px → 3-up | 110px → 3-up |
| `.about__facts` | `repeat(3, 1fr)` | `--fact-min` | 84px → 3-up | 120px → 3-up |
| `.caselist` | `1fr 1fr` / `repeat(4, 1fr)` | `--case-min` | 130px → 2-up | 115px → 4-up |
| `.tabbar` | `repeat(6, 1fr)` | — | `grid-auto-flow: column` + `grid-auto-columns: minmax(0, 1fr)` | ← |
| `.rail__nav` | implicit | — | unchanged; see §4.6 | ← |

The tab bar drops template columns entirely: one auto column per item is count-agnostic
by construction, with no minimum to tune.

### 3.5 Horizontal overflow

`.pane` sets `overflow-x: hidden`, so anything too wide is lost without a trace. Two
rules close it:

- Every flex and grid child carrying text gets `min-width: 0`. `.exp__track` already
  does, and the comment there explains exactly why — generalise it.
- Display and serif type gets `overflow-wrap: break-word`. `.contact__email`
  already has `overflow-wrap: anywhere` — the model to follow for `.case__name`,
  `.exp__org`, `.now__value`, `.intro__headline`, `.rail__name b` and
  `.mhead__name b`.

> **AS BUILT — `hyphens: auto` on `.prose` only, not on display type.** `<html
> lang="en">` is set, so hyphenation works. But `hyphens: auto` hyphenates
> wherever it improves line breaking, not only where a word would otherwise
> overflow — on the boards' serif headlines that visibly changes the
> typography for no overflow benefit, since `overflow-wrap: break-word` already
> handles the unbreakable-word case. It is kept on body copy, where hyphenation
> is typographically normal and genuinely helps a narrow measure.

---

## 4. Per-section specification

### 4.1 Snap policy

```css
/* layout.css:325 */
.pane { scroll-snap-type: y proximity; }   /* was: y mandatory at ≥1024px */
```

Mandatory snapping is the wrong tool once a panel can exceed the scrollport. Proximity
keeps the pleasing settle-onto-a-panel feel, never fights a tall panel, and never skips a
tail on the way back up.

Panels additionally opt out of snapping entirely while they overflow. `useDossierNav`
gains a `ResizeObserver` on the pane and each panel, and sets `data-overflow="true"` when
`panel.scrollHeight > pane.clientHeight`:

```css
.panel[data-overflow='true'] { scroll-snap-align: none; }
```

This attribute is the single switch that drives every Mode B behaviour below. It costs
one observer and no per-frame work.

### 4.2 The continuation affordance

Mode B needs to say *there is more*, in the dossier's vocabulary — hairlines and mono
micro-type, no shadows, no chevron buttons.

**Rail progress hairline (≥768px).** The rail's existing 1px right border doubles as a
position indicator: an ink-coloured segment whose length and offset track scroll position
*within the active panel*, drawn only while that panel overflows. It answers "is there
more?" and "how much?" in one mark, costs no layout, and reads as part of the frame
rather than as chrome.

**Fold caption.** Pinned to the bottom-right of the pane while the active panel overflows
and is not yet scrolled to its end:

```
────────────────────  CONT. ↓
```

`--fs-micro`, `--muted`, `letter-spacing: 0.1em`, over a `--paper` background. It is the
printed dossier's *continued overleaf*. `prefers-reduced-motion` removes its fade, never
its presence.

**Tab bar (<768px).** The active `.tabbar__item` gains the same 1px progress underline
beneath its label.

### 4.3 02 / Case Files — Mode C at ≥1024px

The structural fix, and the best part of this proposal. `.cases` keeps `min-height: 0`;
the two columns become independent scroll regions, and **the metrics row pins to the
floor**:

```css
@media (min-width: 1024px) {
  .caselist { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  .detail   { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }

  .detail__metrics {
    position: sticky;
    bottom: 0;
    margin-top: auto;              /* unchanged */
    background: var(--paper);
    padding-bottom: 2px;
  }
}
```

Board 2A's composition is "the still up top, the metrics on the floor." Today that holds
only while the prose is short enough; `margin-top: auto` inside a height-locked flex
column collides with the copy above it. Sticky positioning makes the composition *true
for any content length* — prose scrolls beneath the metrics bar, and the bar's existing
`border-top: 1px solid var(--ink)` becomes the fold line. The design intent is preserved
rather than abandoned.

Both scroll regions inherit the pane's hidden-scrollbar treatment and take
`overscroll-behavior: contain`, so a flick inside the detail never chains out into panel
navigation.

### 4.4 02 / Case Files — Mode B below 1024px

The correctness fix, and it is a move rather than an addition. `min-height: 0` belongs to
Mode C only, so it moves out of the base rule and into the `≥1024px` block where §4.3
needs it — keeping the stylesheet mobile-first rather than bolting on a `max-width` query:

```css
.cases { flex: 1; }                                   /* base: min-height: 0 removed */

@media (min-width: 1024px) { .cases { min-height: 0; } }   /* Mode C opts back in */
```

Below 1024px the panel now grows, `data-overflow` fires, the fold caption appears. No
overlap. This is the single highest-value line in the document.

### 4.5 04 / Experience — Mode B, plus a CTA that survives the fold

Experience is the section most likely to overflow in real use: a working résumé runs five
to eight roles, against the three that fit today at 1024px. It grows correctly, but
`.exp__cta` — the résumé download — sits after both tracks and drifts below the fold with
them.

**Move the CTA into the section header at ≥768px.** `.sechead__aside` currently renders
the static text `RÉSUMÉ · PDF`, which duplicates the button's meaning without its
function. Replace the aside with the button itself. It is then always visible, the header
row earns its width, and one redundant string disappears.

`.exp__tracks` takes `align-content: safe center`. Track columns of unequal length are
correct as they are.

*Optional, content-side:* give `ExperienceTrack` a `limit?: number` and render
`SEE FULL RÉSUMÉ →` past it. That is an editorial decision, not a layout one — noted, not
specified.

### 4.6 The rail — scroll the nav, pin the ends

```css
.rail       { overflow-y: auto; scrollbar-width: none; }
.rail__top  { position: sticky; top: 0; background: var(--paper); }
.rail__nav  { min-height: 0; }
.rail__foot { position: sticky; bottom: 0; background: var(--paper); padding-top: 8px; }
```

Identity and contact stay pinned; the nav scrolls between them when it cannot fit. The
email is never lost again. At `compact` density the foot drops `identity.location` and
keeps the availability dot and the email.

### 4.7 01 / Intro and 06 / Contact — Mode A, with a budget

These two are guaranteed one screenful, at every breakpoint and every density step. A
guarantee needs a limit, so §5 states one. Beyond the budget they degrade to Mode B
rather than breaking — the promise is about the *designed* range, not a hard clamp.

---

## 5. Content budgets

The contract between `src/content.ts` and the layout. Inside these numbers, Mode A never
overflows and Mode B rarely does; outside them, Mode B engages and the design still
holds.

| Field | Budget | Beyond it |
| --- | --- | --- |
| `intro.headline` | ≤ 60 chars (~3 lines at 14ch) | Mode B; headline shrinks first |
| `intro.body` | ≤ 320 chars | Mode B |
| `intro.stats` | 3–5 items | auto-fit reflows to 2 rows |
| `cases` | 4–8 entries | list scrolls (≥1024) / grid reflows (<1024) |
| `case.problem` / `case.did` | ≤ 280 chars each | detail column scrolls under sticky metrics |
| `case.metrics` | 2–4 items | auto-fit reflows |
| `about.body` | ≤ 420 chars (`bodyShort` ≤ 240) | Mode B |
| `about.facts` | 2–4 items | auto-fit reflows |
| `experience` entries | ≤ 4 per track at ≥1024px | Mode B + fold caption |
| `entry.blurb` | ≤ 2 lines | row grows; track grows |
| `now.entries` | 3–5 | Mode B |
| `contact.body` | ≤ 200 chars | Mode B |
| `contact.links` | ≤ 5 | wraps at ≥768px |
| `NAV` | 4–8 | tab bar auto-fits; rail nav scrolls |

**Enforcement.** A dev-only hook logs a console warning when a Mode A panel overflows
(`import.meta.env.DEV` guarded, stripped from the production bundle). A guarantee nobody
checks stops being true within two content edits.

---

## 6. What this changes

| File | Change | Size |
| --- | --- | --- |
| `styles/layout.css` | density ladder, snap policy, rail scroll, tab bar auto-fit | moderate |
| `styles/sections.css` | `safe` centring, fluid plates, auto-fit grids, sticky metrics, `min-height` fix | largest |
| `styles/theme.css` | density tokens, wrapping utilities | small |
| `hooks/useDossierNav.ts` | `ResizeObserver` → `data-overflow`, scroll-progress value | ~50 lines |
| `App.tsx` | fold caption element, progress value on rail and tab bar | small |
| `sections/Experience.tsx` | CTA into `.sechead` | small |
| `components/Rail.tsx` | progress hairline element | small |
| `content.ts` | none required | — |

No new dependencies. No change to the content schema.

**Suggested order.** (1) The correctness fixes: `.cases` `min-height`, rail overflow,
wrapping guards, `safe` centring — small, independent, and they stop both real bugs.
(2) The adaptive layer: density ladder, fluid plates, auto-fit grids. (3) The affordance
layer: `data-overflow`, fold caption, rail progress. (4) Sticky metrics and the Experience
CTA move. Each stage ships on its own.

---

## 7. Acceptance

Verify at each viewport that (a) no content is clipped or overlapped, (b) every panel's
last line is reachable by scrolling **down and up**, (c) no horizontal scrollbar appears,
and (d) the rail's email is visible or reachable.

| Viewport | Why it is on the list |
| --- | --- |
| 320 × 568 | narrowest supported; tab bar and headline wrapping |
| 390 × 844 | baseline phone |
| 768 × 1024 | board 3B; 4-up case grid |
| 1024 × 768 | board 3C at `compact` — the tightest real desktop |
| 1280 × 720 | board 2A at `compact`; plates vs. panel height |
| 1440 × 900 | board 2A at `comfortable` |
| 1280 × 400 | `dense`; snapping off |
| 1280 × 800 @ 400% zoom | **WCAG 2.1 SC 1.4.10 Reflow** |

That last row is why this is not merely a polish exercise. Reflow requires content at a
320 × 256 CSS px equivalent without loss of content or two-dimensional scrolling. At 400%
zoom every panel overflows by definition — which today means the Case Files spill in §1
happens to every visitor who zooms. The overflow design *is* the accessibility fix.

**Content stress fixtures.** Keep a `content.stress.ts` with doubled-length prose, 8 cases,
8 résumé entries, 5 stats and a 40-character unbroken org name. Swapping it in for a
minute before a release is the whole regression suite this site needs.
