# Design Spec — Paged Scroll

**Status:** implemented · **Builds on:** `DESIGN-SPEC-OVERFLOW.md` · **Scope:**
`hooks/useDossierNav.ts`, `lib/scroll.ts` (new), one block in `styles/layout.css` ·
**Built:** 2026-09-23

---

## 1. The problem

The overflow spec made a panel *a minimum, not a maximum*, and gave the reader two
affordances for saying so: the rail hairline and the `CONT.` caption. What it left alone
was the scroll itself. The pane free-scrolls under `scroll-snap-type: y proximity`, which
means:

- **Overflow is easy to scroll past.** Proximity snap settles onto a panel when a gesture
  happens to end near one, and does nothing at all when it doesn't. A trackpad flick
  starting in section 03 lands wherever momentum takes it — often three quarters into 04,
  with 03's tail never seen and the caption that advertised it already gone.
- **Nothing distinguishes chrome from content.** A wheel over the index rail does the
  same thing as a wheel over the prose, which is to say it scrolls the pane out from
  under the rail. The rail is the one part of the layout that is *about* moving between
  sections, and it is the one part that cannot.
- **Reading backwards still skips tails.** §1 of the overflow spec names this bug and
  §4.1 softens it — proximity snap no longer *forces* you onto a panel's first line — but
  nothing actively puts you on its last one either.

The layout is paginated. The scroll is not.

---

## 2. Design position

> **The wheel acts on the region under the cursor. A region with more to show, shows it.
> A region with nothing left turns the page.**

One rule, two clauses, and the reader picks which clause applies by where they point.
That is the whole feature — everything below is the resolution of "which region" and
"what does turning the page mean".

It is deliberately a **wheel** behaviour. Touch keeps native scrolling and proximity
snap: a thumb has no hover, so there is no region to read off the cursor, and the phone
layout has no nested scrollers to disambiguate anyway. The hook asks
`(pointer: fine)` rather than a width, and `(min-height: 620px)` to stay off at the
`dense` step where panels are sized to content and a "page" has stopped meaning anything.

---

## 3. Resolving the region

From the wheel's target, walk up the ancestor chain and take the **first scroll region
with room left in the direction of travel**. An *exhausted* region is skipped rather than
returned, and that skip is the handoff: a reader at the foot of the case detail should
turn the page, not find the wheel dead under their cursor.

The walk stops before `.pane`. The pane is the paged surface, not a region anybody
scrolls freely — it is the thing the other two clauses are about.

| Cursor over | Direction | Result |
| --- | --- | --- |
| `.detail` / `.caselist` (Mode C) with room | either | native scroll, browser-owned |
| `.detail` / `.caselist` read out | either | page turn |
| a Mode B panel with room | either | pane scrolls, **clamped to that panel** |
| a Mode B panel read out | either | page turn |
| a Mode A panel | either | page turn |
| the rail, with the nav overflowing | either | native scroll of the rail |
| the rail, header, tab bar | either | page turn |

The last row is the rule taken at its word: chrome has no content of its own to reveal,
so a wheel over chrome is a page turn even when the section beside it still has a tail.
The rail is an index, and behaving like one is the point.

### 3.1 Why the pane's own scroll is driven in JS

Clause two needs a **clamp**, and there is no declarative clamp for "scroll freely, but
not past this section". `scroll-snap-stop: always` is the nearest primitive and it only
constrains where a gesture *ends*, not where it may pass through.

So `useDossierNav` takes the gesture and drives `pane.scrollTop` itself, as an
exponential follow on a target offset rather than a tween: deltas arriving mid-flight
accumulate into the target instead of restarting an animation, which is what makes a
trackpad feel continuous. The follow constant is stated per 60fps frame and corrected by
elapsed time, so a 120Hz display converges over the same wall-clock duration.

`prefers-reduced-motion` drops the follow and applies the delta outright. The clamp is
what matters for the feature; the easing is decoration.

### 3.2 The latch

A trackpad flick is one gesture and dozens of wheel events. Without a latch, one flick
turns six pages.

On a turn the latch closes, and reopens only once the wheel has been quiet for 220ms
**and** the turn has landed. Both terms are needed: the quiet period alone would reopen
mid-animation and let the tail of the flick turn the next page too.

### 3.3 Turning backwards lands on the last line

`goTo` gains an alignment. Forwards parks on the section's first line; backwards parks on
its **last**.

This is the direct fix for the bug named in the overflow spec's §1. The tail of section
04 is what you were reaching for when you scrolled up out of 05 — landing on 04's
headline skips exactly the content you asked to see.

---

## 4. What changes in CSS

Two rules, both keyed on `data-paged`, which the hook writes onto the pane. One attribute
so the CSS and the JS halves cannot disagree about which mode is running.

```css
/* Snap and the hook would argue over the same offset: the hook parks a reader
   mid-section on purpose, which is what proximity snapping exists to undo. */
.pane[data-paged='true'] { scroll-snap-type: none; }

/* The Mode C columns hold the wheel only while they have room. Containment
   closes the gap before the hook takes it back. */
.pane[data-paged='true'] .caselist,
.pane[data-paged='true'] .detail { overscroll-behavior-y: contain; }
```

The containment is the overflow spec's §4.3 finally landing, and it is scoped rather than
unconditional for the reason it was dropped the first time: on touch, `contain` traps a
reader inside the detail column. In paged mode it cannot, because the hook is the one
performing the handoff.

Nothing else moves. The `CONT.` caption, the rail hairline and the tab-bar underline all
read pane scroll position, which is still pane scroll position.

---

## 5. What this does not change

- **Touch.** `(pointer: coarse)` never enters paged mode. Native scrolling, proximity
  snap, unchanged.
- **Keyboard.** The rail and tab bar are buttons calling `goTo`, which is already a
  complete keyboard path through every section; native scrolling of the pane still works
  as before. No key handling was added, and none is bypassed.
- **`prefers-reduced-motion`.** Honoured by both the page turn and the in-panel scroll.
- **The `dense` step** (`max-height: 619px`). Panels are content-sized and snapping is
  off; paging stays off with it.
- **Deep links and `active`.** The scroll spy is untouched.

---

## 6. Acceptance

Run the `content.stress.ts` fixture (`npm run dev:stress`) — the default content barely
overflows anything, so the default content cannot test this.

1. Wheel over **01 Intro** (Mode A): one notch turns to 02. One notch back returns.
2. Wheel over **03 About** (Mode B, overflowing): the section scrolls to its own last
   line and **stops**. A further notch turns to 04.
3. From the top of **04**, wheel up: lands on **03's last line**, not its headline.
4. At ≥1024px, wheel over the **case list** in 02: turns the page, because the list fits.
5. At ≥1024px, wheel over the **case detail**: scrolls the column, then turns the page
   once the metrics bar is reached.
6. Wheel over the **rail**: turns the page. With enough `NAV` entries to make the rail
   overflow, it scrolls the rail instead.
7. **Flick** a trackpad hard on 01: exactly one page turns.
8. Resize to 1280×400 (`dense`): scrolling is native and continuous again.
9. On a phone or with devtools touch emulation: scrolling is native, snap intact.
10. With reduced motion on: every case above still lands in the right place, instantly.
