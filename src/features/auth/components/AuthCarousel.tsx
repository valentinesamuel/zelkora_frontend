import { useEffect, useRef, useState } from 'react';

interface Slide {
  src: string;
  headline: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    src: 'https://lotwgimgfkslvtuisxah.supabase.co/storage/v1/object/public/stockimages/nursesthetoscope.jpg',
    headline:
      'Optimize your medicare operations with our intelligent medical admin dashboard',
    body: 'This comprehensive digital solution centralizes and streamlines essential tasks, data, and processes, empowering medicare providers to deliver better patient care and enhance operational efficiency.',
  },
  {
    src: 'https://lotwgimgfkslvtuisxah.supabase.co/storage/v1/object/public/stockimages/operatingtheatre.jpg',
    headline: 'Coordinate every department from a single operational view',
    body: 'Scheduling, staffing, and theatre utilisation stay in sync across your facility, so teams spend less time reconciling systems and more time with patients.',
  },
  {
    src: 'https://lotwgimgfkslvtuisxah.supabase.co/storage/v1/object/public/stockimages/medicalclipboard.jpg',
    headline: 'Turn day-to-day records into decisions you can defend',
    body: 'Consolidated reporting surfaces the trends behind admissions, outcomes, and resourcing, giving administrators the evidence they need before the next review cycle.',
  },
];

const AUTOPLAY_DELAY_MS = 6000;

export function AuthCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (paused || reduced) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [index, paused, reduced]);

  const activeSlide = SLIDES[index];

  return (
    <section
      ref={containerRef}
      aria-roledescription="carousel"
      aria-label="Product highlights"
      className="relative flex h-full  flex-col gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-6/5 w-full justify-between overflow-hidden rounded-xl bg-white/5">
        {SLIDES.map((slide, slideIndex) => (
          <img
            key={slide.src + slideIndex}
            src={slide.src}
            alt=""
            aria-hidden="true"
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
            fetchPriority={slideIndex === 0 ? 'high' : undefined}
            className={`absolute inset-0 h-full w-full object-cover ${
              reduced ? '' : 'transition-opacity duration-500'
            } ${slideIndex === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 -right-6 hidden h-40 w-40 text-white/4 lg:block"
          viewBox="0 0 200 60"
          fill="none"
        >
          <path
            d="M0 30 H40 L55 5 L75 55 L95 15 L110 30 H200"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col gap-3"
      >
        <h2 className="text-2xl font-semibold leading-snug text-auth-hero-foreground lg:text-4xl">
          {activeSlide.headline}
        </h2>
        <p className="text-sm leading-relaxed text-white/60 lg:text-base">
          {activeSlide.body}
        </p>
      </div>

      <div role="tablist" className="mt-auto flex items-center gap-2">
        {SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.src + slideIndex}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            aria-label={`Slide ${slideIndex + 1} of ${SLIDES.length}`}
            onClick={() => setIndex(slideIndex)}
            className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-auth-hero ${
              slideIndex === index
                ? 'h-1.5 w-6 bg-white'
                : 'size-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
