/* ============================================================================
 *  Scroll primitives for the paged pane (docs/DESIGN-SPEC-PAGED-SCROLL.md).
 *
 *  Pure geometry and unit conversion, kept out of `useDossierNav` so the hook
 *  reads as policy rather than arithmetic.
 * ========================================================================== */

/** Sub-pixel slack. Scroll offsets are fractional on HiDPI and under zoom. */
export const EPS = 2;

export const clamp = (value: number, lo: number, hi: number) =>
  value < lo ? lo : value > hi ? hi : value;

/**
 * Wheel deltas arrive in three units (`WheelEvent.deltaMode`). Normalise to
 * CSS pixels, so one notch of one wheel means one distance on every engine.
 *
 * Chromium reports pixels; Firefox reports lines, three per notch on most
 * platforms — 20px each lands a notch within a few pixels of Chromium's 100.
 */
export function wheelPixels(event: WheelEvent, page: number): number {
  switch (event.deltaMode) {
    case 1:
      return event.deltaY * 20; // DOM_DELTA_LINE
    case 2:
      return event.deltaY * page; // DOM_DELTA_PAGE
    default:
      return event.deltaY; // DOM_DELTA_PIXEL
  }
}

/** Is `el` a scroll region with room left in `dir` (1 down, -1 up)? */
function hasRoom(el: HTMLElement, dir: 1 | -1): boolean {
  // Cheapest test first: most elements on the walk are not scroll regions at
  // all, and this spares them a style resolution.
  const room = el.scrollHeight - el.clientHeight;
  if (room <= EPS) return false;

  const { overflowY } = getComputedStyle(el);
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false;
  }

  return dir > 0 ? el.scrollTop < room - EPS : el.scrollTop > EPS;
}

/**
 * The nearest scroll region at or above `from` that still has somewhere to go
 * in `dir`, searching up to but not including `stop`.
 *
 * An *exhausted* region is skipped rather than returned, and that skip is the
 * whole handoff rule: a reader at the foot of the case detail should turn the
 * page, not find the wheel dead under their cursor.
 */
export function scrollableAncestor(
  from: EventTarget | null,
  dir: 1 | -1,
  stop: HTMLElement,
): HTMLElement | null {
  let node = from instanceof Element ? from : null;

  while (node && node !== stop) {
    if (node instanceof HTMLElement && hasRoom(node, dir)) return node;
    node = node.parentElement;
  }

  return null;
}

/**
 * The span of pane scroll offsets that keep `panel` in view: `top` shows its
 * first line, `bottom` its last.
 *
 * The two are equal for a panel that fits the pane, which is what lets the
 * wheel handler ask "is there overflow under the cursor, and how much is
 * left?" as one subtraction instead of a flag plus a special case.
 */
export function panelBounds(panel: HTMLElement, view: number) {
  const top = panel.offsetTop;
  return { top, bottom: Math.max(top, top + panel.offsetHeight - view) };
}
