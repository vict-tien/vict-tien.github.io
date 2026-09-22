import { useCallback, useEffect, useRef, useState } from 'react';
import { EPS, clamp, panelBounds, scrollableAncestor, wheelPixels } from '../lib/scroll';
import { useMediaQuery } from './useMediaQuery';

/** Fraction of the remaining distance a glide closes per 60fps frame. */
const FOLLOW = 0.22;

/** Quiet time after a page turn before the wheel is heard again. */
const LATCH_MS = 220;

/** Where a page turn parks: on the section's first line, or on its last. */
type Align = 'start' | 'end';

/** The pane's single animation slot. Only one of these runs at a time. */
type Run = { raf: number; timer: number; kind: 'turn' | 'glide' };

/**
 * Scroll behaviour for the dossier pane.
 *
 * - `goTo(i, align)` eases the pane to panel `i`, briefly turning scroll-snap
 *   off so the animation isn't fought by the snap engine (the same trick the
 *   design mockup used), then restoring it. `align: 'end'` parks on the
 *   panel's *last* line instead of its first — what reading backwards wants.
 * - `active` tracks which panel is under the middle of the pane, so the index
 *   rail and the mobile tab bar can show where you are.
 * - `overflowing[i]` says whether panel `i` is taller than the pane. Panels
 *   that overflow drop out of scroll-snap so they can never yank a reader away
 *   from content they are part way through.
 * - Scroll position *within* the active panel is written straight onto the
 *   shell as `--panel-progress` / `--panel-visible`, plus two data attributes.
 *   That drives the rail's progress hairline and the "CONT." caption without
 *   a React render per frame.
 * - Under a wheel the pane is *paged*: see the Paged scroll block below, and
 *   docs/DESIGN-SPEC-PAGED-SCROLL.md.
 *
 * `fitPanels` names the Mode A panels — the ones the design guarantees will be
 * one screenful. In development, one overflowing is a bug worth a warning.
 */
export function useDossierNav(count: number, fitPanels: readonly number[] = []) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const anim = useRef<Run | null>(null);
  /** Where a glide is heading. Null whenever no glide owns the pane. */
  const glideTo = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState<boolean[]>(() =>
    new Array(count).fill(false),
  );

  /* Paging is a wheel behaviour, so it is asked for by pointer rather than by
     width: a touch reader keeps native scrolling and proximity snap, which is
     already the right thing on a phone. The height term matches the `dense`
     step in layout.css, where panels are sized to content and a "page" has
     stopped meaning anything. */
  const fine = useMediaQuery('(pointer: fine)');
  const tall = useMediaQuery('(min-height: 620px)');
  const paged = fine && tall;

  const registerPanel = useCallback((index: number, el: HTMLElement | null) => {
    panels.current[index] = el;
  }, []);

  const cancel = useCallback(() => {
    glideTo.current = null;
    const run = anim.current;
    if (!run) return;
    cancelAnimationFrame(run.raf);
    clearTimeout(run.timer);
    anim.current = null;
  }, []);

  const goTo = useCallback(
    (index: number, align: Align = 'start') => {
      const pane = paneRef.current;
      const target = panels.current[index];
      if (!pane || !target) return;

      cancel();
      setActive(index);

      const view = pane.clientHeight;
      const { top, bottom } = panelBounds(target, view);
      const to = clamp(
        align === 'end' ? bottom : top,
        0,
        Math.max(0, pane.scrollHeight - view),
      );
      const from = pane.scrollTop;
      const dist = to - from;

      const restore = () => {
        pane.style.scrollSnapType = '';
        anim.current = null;
      };

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!dist || reduced) {
        pane.scrollTop = to;
        restore();
        return;
      }

      pane.style.scrollSnapType = 'none';

      const duration = Math.min(900, 280 + Math.abs(dist) * 0.13);
      const start = performance.now();
      const run: Run = { raf: 0, timer: 0 as unknown as number, kind: 'turn' };
      anim.current = run;

      // Safety net: never leave snapping disabled if a frame is dropped.
      run.timer = window.setTimeout(restore, duration + 700);

      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        pane.scrollTop = from + dist * eased;
        if (p < 1) {
          run.raf = requestAnimationFrame(tick);
        } else {
          clearTimeout(run.timer);
          restore();
        }
      };

      run.raf = requestAnimationFrame(tick);
    },
    [cancel],
  );

  /* -- Paged scroll ---------------------------------------------------------
   * One rule, applied to whatever sits under the cursor:
   *
   *   the region can still scroll   ->  scroll it
   *   the region is out of content  ->  turn the page
   *
   * "Region" is resolved by walking up from the wheel's target, so the answer
   * is about the thing being pointed at rather than about the section as a
   * whole. In Case Files that means the detail column reads to its end under
   * the cursor, while the case list beside it — which fits — turns the page.
   *
   * Three regions, in the order the handler considers them:
   *
   *   1  a nested scroller (.detail, .caselist, the rail) with room left.
   *      Left entirely to the browser: native wheel scrolling is smoother than
   *      anything re-implemented here, and it is already correct.
   *   2  the panel itself, when it is taller than the pane. The pane scrolls,
   *      but *clamped to that panel's span* — so a fast flick reads to the end
   *      of the section and stops there instead of sailing into the next one.
   *   3  neither: the page turns.
   *
   * That clamp is why the pane's own scroll is driven here rather than left
   * native. The glide is an exponential follow on a target offset, so deltas
   * arriving mid-flight accumulate into it instead of restarting a tween.
   */
  const glide = useCallback(
    (to: number) => {
      const pane = paneRef.current;
      if (!pane) return;

      // A glide already owns the pane: just move the goalposts.
      if (anim.current?.kind === 'glide') {
        glideTo.current = to;
        return;
      }

      cancel();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pane.scrollTop = to;
        return;
      }

      glideTo.current = to;
      const run: Run = { raf: 0, timer: 0 as unknown as number, kind: 'glide' };
      anim.current = run;

      let last = performance.now();

      const tick = (now: number) => {
        // A cancelled glide has already had its frame cancelled; this only
        // catches the one that was mid-flight when it happened, so it cannot
        // clear a slot that now belongs to somebody else.
        if (anim.current !== run) return;

        const target = glideTo.current;
        if (target === null) {
          anim.current = null;
          return;
        }

        // Frame-rate independent smoothing: FOLLOW is stated per 60fps frame,
        // so a 120Hz display converges over the same wall-clock time.
        const dt = Math.min(50, now - last);
        last = now;

        const current = pane.scrollTop;
        const dist = target - current;

        if (Math.abs(dist) < 0.5) {
          pane.scrollTop = target;
          glideTo.current = null;
          anim.current = null;
          return;
        }

        pane.scrollTop = current + dist * (1 - Math.pow(1 - FOLLOW, dt / 16.67));
        run.raf = requestAnimationFrame(tick);
      };

      run.raf = requestAnimationFrame(tick);
    },
    [cancel],
  );

  useEffect(() => {
    const pane = paneRef.current;
    const shell = shellRef.current;
    if (!pane || !shell) return;

    // Drives the CSS half of paged mode — snap off, nested scrollers
    // contained. Kept as an attribute so the two halves cannot disagree.
    pane.dataset.paged = paged ? 'true' : 'false';
    if (!paged) return;

    /* A trackpad flick is one gesture and dozens of wheel events. The latch
       spends the tail of that gesture rather than turning six pages with it:
       it closes on a turn, and reopens only once the wheel has been quiet for
       LATCH_MS *and* the turn has landed. */
    let latched = false;
    let timer = 0;

    const relatch = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(function settle() {
        if (anim.current) {
          // Still in flight. Re-arm rather than open mid-turn, or the tail of
          // the flick that turned this page turns the next one as well.
          timer = window.setTimeout(settle, 80);
          return;
        }
        latched = false;
      }, LATCH_MS);
    };

    /** The panel containing pane offset `pos`, by geometry rather than state. */
    const panelAt = (pos: number) => {
      let found = 0;
      for (let i = 0; i < count; i++) {
        const panel = panels.current[i];
        if (panel && panel.offsetTop <= pos + EPS) found = i;
      }
      return found;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom, not a scroll
      const dir = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (!dir) return;

      // 1 — a scroll region under the cursor with somewhere left to go. The
      // pane is excluded from the walk when the cursor is inside it: the pane
      // is the paged surface, not a region the reader scrolls freely.
      const inPane = pane.contains(event.target as Node | null);
      if (scrollableAncestor(event.target, dir, inPane ? pane : shell)) return;

      // Everything past this line is ours, including the gesture we choose to
      // swallow: without this the browser would scroll the pane underneath the
      // decision just made.
      event.preventDefault();

      if (latched) {
        relatch();
        return;
      }

      const view = pane.clientHeight;
      if (!view) return;

      const at = glideTo.current ?? pane.scrollTop;
      const index = panelAt(at);
      const panel = panels.current[index];
      if (!panel) return;

      const { top, bottom } = panelBounds(panel, view);
      // Clamped, so a panel that fits reads as exactly zero room in both
      // directions even when a stray offset has left the pane a pixel adrift.
      const from = clamp(at, top, bottom);
      const room = dir > 0 ? bottom - from : from - top;

      // 2 — the panel itself overflows and is not yet read out in this
      // direction. Only for a cursor over the content: the rail and the tab
      // bar are chrome, and a wheel over chrome is a page turn.
      if (inPane && room > EPS) {
        glide(clamp(from + wheelPixels(event, view), top, bottom));
        return;
      }

      // 3 — end of the section, so turn the page. Backwards that means parking
      // on the previous section's *last* line: the tail of 04 is what you were
      // reaching for when you scrolled up out of 05, and landing on its
      // headline would skip everything you asked to see.
      const next = index + dir;
      if (next < 0 || next >= count) return;

      latched = true;
      relatch();
      goTo(next, dir < 0 ? 'end' : 'start');
    };

    shell.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      shell.removeEventListener('wheel', onWheel);
      window.clearTimeout(timer);
    };
  }, [count, paged, goTo, glide]);

  // Scroll spy: whichever panel sits across the middle of the pane is active.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = panels.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { root: pane, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    const observed = panels.current.slice(0, count).filter(Boolean) as HTMLElement[];
    observed.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [count]);

  /* -- Which panels overflow ------------------------------------------------
   * A ResizeObserver rather than a resize listener, so this also catches the
   * reflow when the web fonts land and when content itself changes height.
   */
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const measure = () => {
      const limit = pane.clientHeight;
      const next = Array.from(
        { length: count },
        (_, i) => {
          const el = panels.current[i];
          return !!el && el.offsetHeight > limit + EPS;
        },
      );
      setOverflowing((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
      );
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(pane);
    panels.current.slice(0, count).forEach((el) => el && ro.observe(el));

    // Web fonts change every panel's height after first paint.
    let live = true;
    document.fonts?.ready.then(() => live && measure());

    return () => {
      live = false;
      ro.disconnect();
    };
  }, [count]);

  /* -- Scroll telemetry -----------------------------------------------------
   * Written to the DOM directly. These values change every frame while
   * scrolling; routing them through React state would re-render six panels
   * per frame to move a one-pixel hairline.
   */
  useEffect(() => {
    const pane = paneRef.current;
    const shell = shellRef.current;
    if (!pane || !shell) return;

    let raf = 0;

    const write = () => {
      raf = 0;
      const view = pane.clientHeight;
      if (!view) return;

      // The panel under the middle of the pane — computed from geometry rather
      // than read from `active`, so it can never lag a frame behind the scroll.
      const mid = pane.scrollTop + view / 2;
      let el: HTMLElement | null = null;
      for (let i = 0; i < count; i++) {
        const panel = panels.current[i];
        if (panel && panel.offsetTop <= mid) el = panel;
      }
      if (!el) return;

      const scrollable = Math.max(0, el.offsetHeight - view);
      const overflows = scrollable > EPS;
      const progress = overflows
        ? Math.min(1, Math.max(0, (pane.scrollTop - el.offsetTop) / scrollable))
        : 0;
      const visible = el.offsetHeight > 0 ? Math.min(1, view / el.offsetHeight) : 1;

      shell.style.setProperty('--panel-progress', String(progress));
      shell.style.setProperty('--panel-visible', String(visible));
      shell.dataset.panelOverflow = overflows ? 'true' : 'false';
      shell.dataset.fold = overflows && progress < 0.99 ? 'true' : 'false';
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };

    pane.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    write();

    return () => {
      pane.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
    // `overflowing` is not read here, but a change to it means a panel's height
    // changed — which is exactly when these numbers need recomputing.
  }, [count, overflowing]);

  /* -- Mode A guard ---------------------------------------------------------
   * The design promises Intro and Contact are always one screenful. A promise
   * nobody checks stops being true within two content edits. Dev only; the
   * whole block is dropped from the production bundle.
   */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    fitPanels.forEach((i) => {
      if (!overflowing[i]) return;
      console.warn(
        `[dossier] Panel ${i} is a Fit panel but overflows its viewport. ` +
          'Shorten the copy, or reassign it to Mode B — see ' +
          'docs/DESIGN-SPEC-OVERFLOW.md §5.',
      );
    });
  }, [overflowing, fitPanels]);

  useEffect(() => cancel, [cancel]);

  return { paneRef, shellRef, registerPanel, active, goTo, overflowing };
}
