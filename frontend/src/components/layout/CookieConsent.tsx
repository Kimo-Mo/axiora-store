'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
        // Add a small delay for the animation to kick in after mounting
        setTimeout(() => setIsVisible(true), 50);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Do not show on legal pages to avoid interrupting the reading experience
  if (pathname === '/legal') return null;
  if (!showConsent) return null;

  const handleAccept = () => {
    setIsVisible(false);
    localStorage.setItem('cookieConsent', 'true');
    // Remove from DOM after animation completes
    setTimeout(() => setShowConsent(false), 500);
  };

  return (
    <div
      className={`fixed bottom-0 inset-s-0 inset-e-0 z-50 p-4 sm:p-6 md:p-8 pointer-events-none flex justify-center w-full transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
    >
      <div className="bg-background/80 backdrop-blur-xl border border-primary/20 shadow-[0_8px_40px_-12px_var(--primary)] rounded-3xl p-6 md:p-8 pointer-events-auto relative overflow-hidden w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -inset-e-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -inset-s-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-2xl text-primary ring-1 ring-primary/20 shadow-inner">
                <Cookie className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="font-bold text-foreground tracking-tight text-lg md:text-xl">
                We use cookies 🍪
              </h3>
            </div>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              To ensure you get the best experience, we use cookies on our website. You can learn more by reading our{' '}
              <Link href="/legal?tab=cookie" className="text-primary hover:text-primary-hover underline underline-offset-4 decoration-primary/30 transition-colors font-medium">
                Cookie Policy
              </Link>{' '}
              as well as our{' '}
              <Link href="/legal?tab=privacy" className="text-primary hover:text-primary-hover underline underline-offset-4 decoration-primary/30 transition-colors font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="pt-2 md:pt-0 flex justify-end md:flex-shrink-0">
            <Button
              onClick={handleAccept}
              className="w-full md:w-auto shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl px-8 h-12 md:h-14 md:text-lg md:px-10"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
