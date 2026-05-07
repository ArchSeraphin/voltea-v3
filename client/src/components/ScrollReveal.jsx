import React, { useEffect, useRef } from 'react';

export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    // Skip animation work in non-browser environments (SSG / SSR snapshot)
    if (typeof window === 'undefined') return;

    // Skip during the build-time prerender pass so the captured HTML stays
    // clean (no .reveal--armed) and matches React's initial render output.
    // Hydration on the user's browser then succeeds without mismatch.
    if (/VolteaPrerender/i.test(navigator.userAgent)) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    // Arm the animation: hide now (CSS sets opacity:0 on .reveal--armed)
    // then let IntersectionObserver reveal on entry. Without this, the
    // prerendered HTML stays visible and the animation is skipped entirely
    // — that's an acceptable tradeoff if IO is unavailable.
    el.classList.add('reveal--armed');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay) {
              setTimeout(() => el.classList.add('visible'), delay);
            } else {
              el.classList.add('visible');
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`reveal${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}
