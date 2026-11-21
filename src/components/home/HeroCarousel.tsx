"use client";

import { useEffect, useState, type ReactNode } from "react";

const INTERVAL_MS = 5000;

/**
 * Crossfades between hero slides. Auto-advances every 5 s, pauses on hover/focus,
 * and doesn't auto-advance for users who prefer reduced motion.
 */
export function HeroCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div
      className="hidden shrink-0 flex-col items-center gap-3 lg:flex"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[216px] w-[326px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Hero illustrations">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={labels[i] ?? `Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-brand" : "w-1.5 bg-brand/30 hover:bg-brand/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
