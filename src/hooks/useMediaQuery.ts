import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reads a media query as React state.
 *
 * Used where a breakpoint has to change the *markup*, not just the styling —
 * the résumé button moves into the section header at 768px, and rendering it
 * in both places with CSS hiding one would leave two copies of the same
 * control in the accessibility tree.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
