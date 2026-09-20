import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Scroll behaviour for the dossier pane.
 *
 * - `goTo(i)` eases the pane to panel `i`, briefly turning scroll-snap off so
 *   the animation isn't fought by the snap engine (the same trick the design
 *   mockup used), then restoring it.
 * - `active` tracks which panel is under the middle of the pane, so the index
 *   rail and the mobile tab bar can show where you are.
 */
export function useDossierNav(count: number) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const anim = useRef<{ raf: number; timer: number } | null>(null);
  const [active, setActive] = useState(0);

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

  useEffect(() => cancel, [cancel]);

  return { paneRef, registerPanel, active, goTo };
}
