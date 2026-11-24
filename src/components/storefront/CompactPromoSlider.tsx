'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PromoSlide } from '@/lib/data/banners';

interface CompactPromoSliderProps {
  slides: PromoSlide[];
}

export default function CompactPromoSlider({ slides }: CompactPromoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Touch tracking for mobile swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides?.length || 0;

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const goToNext = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-rotation timer (5 seconds)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused || reducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, reducedMotion, goToNext]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped left -> next slide
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous slide
      goToPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (!slides || totalSlides === 0) {
    return null;
  }

  return (
    <section
      aria-label="Promotional Carousel"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 sm:pt-6 sm:pb-3"
    >
      {/* Centered compact landscape container (~3:1 aspect ratio at desktop, ~960px by ~320px) */}
      <div
        className="relative max-w-[1000px] mx-auto rounded-lg sm:rounded-xl overflow-hidden border border-[#D9D9D4] shadow-sm bg-[#123C2F]/5 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Aspect Ratio Box: ~3:1 on desktop, ~16:9 on mobile */}
        <div className="relative w-full h-[200px] sm:h-[260px] md:h-[300px] lg:h-[320px] overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id || index}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Banner Image */}
                <div className="absolute inset-0 bg-[#123C2F]">
                  {/* Desktop Image */}
                  <Image
                    src={slide.desktopImage}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 1000px"
                    className="object-cover object-center hidden sm:block"
                  />
                  {/* Mobile Image (if available, else fallback to desktop image) */}
                  <Image
                    src={slide.mobileImage || slide.desktopImage}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover object-center sm:hidden"
                  />

                  {/* Sophisticated Luxury Dark Vignette / Gradient for maximum text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#123C2F]/85 via-[#123C2F]/50 to-transparent" />
                </div>

                {/* Promotional Content Overlay */}
                <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 text-white max-w-xl z-20 space-y-2 sm:space-y-3">
                  {slide.badgeText && (
                    <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-wider text-[#E9EDE7] uppercase bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded border border-white/20 self-start">
                      {slide.badgeText}
                    </span>
                  )}

                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white leading-tight drop-shadow-sm">
                    {slide.title}
                  </h2>

                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm text-[#FBF8F3]/90 line-clamp-2 max-w-md font-light leading-relaxed">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="pt-1 sm:pt-2">
                    <Link
                      href={slide.ctaLink || '/shop'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-md bg-white hover:bg-[#FBF8F3] text-[#123C2F] text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                    >
                      <span>{slide.ctaText || 'Shop Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous & Next Arrow Controls */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous promotional slide"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-[#123C2F] flex items-center justify-center shadow-md transition-all sm:opacity-90 sm:hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next promotional slide"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-[#123C2F] flex items-center justify-center shadow-md transition-all sm:opacity-90 sm:hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 ml-0.5" />
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-xs">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => goToSlide(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  aria-current={dotIdx === currentIndex ? 'true' : 'false'}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentIndex
                      ? 'w-5 sm:w-6 bg-white'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

