'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui';

/**
 * Global scroll-to-top button.
 *
 * Positioning strategy:
 * - Visible after scrolling 400 px down.
 * - On desktop: fixed bottom-6 end-6.
 * - On mobile: when the product page's sticky price bar slides in
 *   (it dispatches a "stickybar:change" CustomEvent), the button
 *   shifts up above the bar so they never overlap.
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  // On mobile the sticky bar is ~72 px tall. We add 16 px margin → 88 px.
  const [mobileBottom, setMobileBottom] = useState(24); // px

  // Show / hide based on scroll position
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Listen for sticky bar visibility changes dispatched by ProductPriceCard
  const handleStickyBar = useCallback((e: Event) => {
    const detail = (e as CustomEvent<{ visible: boolean }>).detail;
    setMobileBottom(detail.visible ? 88 : 24);
  }, []);

  useEffect(() => {
    window.addEventListener('stickybar:change', handleStickyBar);
    return () => window.removeEventListener('stickybar:change', handleStickyBar);
  }, [handleStickyBar]);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Button
      id="scroll-to-top-btn"
      aria-label="Scroll to top"
      onClick={scrollToTop}
      style={{ bottom: `${mobileBottom}px` }}
      className={[
        // Base styles
        'fixed inset-e-4 z-60 flex items-center justify-center',
        'w-11 h-11 rounded-full',
        'bg-primary/90 hover:bg-primary text-white',
        'shadow-lg shadow-primary/30 hover:shadow-primary/50',
        'backdrop-blur-sm border border-primary/40',
        'transition-all duration-300 ease-in-out',
        // Desktop override via Tailwind (end-6, bottom-6)
        'sm:inset-e-6',
        // Show / hide animation
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
    </Button>
  );
}
