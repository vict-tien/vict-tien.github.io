import { useCallback, useEffect, useRef, useState } from 'react';

/** A panel taller than the pane by less than this is treated as fitting. */
const EPS = 2;

/**
 * Scroll behaviour for the dossier pane.
 *
 * - `goTo(i)` eases the pane to panel `i`, briefly turning scroll-snap off so
 *   the animation isn't fought by the snap engine (the same trick the design
 *   mockup used), then restoring it.
 * - `active` tracks which panel is under the middle of the pane, so the index
 *   rail and the mobile tab bar can show where you are.
 * - `overflowing[i]` says whether panel `i` is taller than the pane. Panels
 *   that overflow drop out of scroll-snap so they can never yank a reader away
 *   from content they are part way through.
 * - Scroll position *within* the active panel is written straight onto the
 *   shell as `--panel-progress` / `--panel-visible`, plus two data attributes.
 *   That drives the rail's progress hairline and the "CONT. ↓" caption without
 *   a React render per frame.
 *
 * `fitPanels` names the Mode A panels — the ones the design guarantees will be
 * one screenful. In development, one overflowing is a bug worth a warning.
 */
export function useDossierNav(count: number, fitPanels: readonly number[] = []) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const anim = useRef<{ raf: number; timer: number } | null>(null);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState<boolean[]>(() =>
    new Array(count).fill(false),
  );

  const registerPanel = useCallback((index: number, el: HTMLElement | null) => {
    panels.current[index] = el;
  }, []);

  const cancel = useCallback(() => {
    const run = anim.current;
    if (!run) return;
    cancelAnimationFrame(run.raf);
    clearTimeout(run.timer);
    anim.current = null;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const pane = paneRef.current;
      const target = panels.current[index];
      if (!pane || !target) return;

      cancel();
      setActive(index);

      const to = target.offsetTop;
      const from = pane.scrollTop;
      const dist = to - from;

      const snap = getComputedStyle(pane).scrollSnapType;
      const restore = () => {
        pane.style.scrollSnapType = '';
        anim.current = null;
      };

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!dist || reduced || snap === 'none') {
        pane.scrollTop = to;
        restore();
        return;
      }

      pane.style.scrollSnapType = 'none';

      const duration = Math.min(900, 280 + Math.abs(dist) * 0.13);
      const start = performance.now();
      const run = { raf: 0, timer: 0 as unknown as number };
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
