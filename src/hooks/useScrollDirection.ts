import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether the page was most recently scrolled down or up.
 * Returns 'down' | 'up' | null (null = hasn't scrolled yet / at the very top).
 * Ignores tiny jitters below `threshold` px so it doesn't flicker.
 */
export function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastY.current;

      if (y <= 0) {
        setDirection(null);
      } else if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? 'down' : 'up');
        lastY.current = y;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
