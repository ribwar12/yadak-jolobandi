"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { SITE_CONTENT } from "@/config/site-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 5500;

export function HeroSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = SITE_CONTENT.heroSlides;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    loop: true,
    align: "start",
  });

  const onSelect = useCallback((api) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [emblaApi, isPaused]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((idx) => emblaApi?.scrollTo(idx), [emblaApi]);

  return (
    <section className="pt-3 md:pt-0 md:bg-slate-950">
      <div className="w-full px-3 md:px-0">
        <div
          className="relative group overflow-hidden rounded-2xl md:rounded-none bg-slate-950 shadow-md md:shadow-none select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-roledescription="carousel"
          aria-label="بنرهای پیشنهادی فروشگاه"
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="relative min-w-0 shrink-0 grow-0 basis-full h-[185px] sm:h-[220px] md:h-[340px] lg:h-[420px]"
                >
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover object-left"
                  />

                  <div className="absolute inset-0 bg-gradient-to-l from-slate-950/95 via-slate-950/70 to-slate-950/20 md:from-slate-950/90 md:via-slate-950/45 md:to-transparent" />

                  <div className="relative z-10 h-full flex items-center px-5 md:container md:mx-auto md:px-4">
                    <div className="max-w-lg space-y-2 md:space-y-4 text-right">
                      <span className="inline-block rounded-md bg-orange-500/15 border border-orange-400/30 px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-bold text-orange-300">
                        {slide.tag}
                      </span>

                      {idx === 0 ? (
                        <h1 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-black leading-snug text-white">
                          {slide.title}
                        </h1>
                      ) : (
                        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-black leading-snug text-white">
                          {slide.title}
                        </h2>
                      )}

                      <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-200 leading-relaxed line-clamp-1 md:line-clamp-2">
                        {slide.subtitle}
                      </p>

                      <div className="pt-0.5 md:pt-1">
                        <Button
                          asChild
                          variant="accent"
                          size="default"
                          className="h-8 md:h-10 px-3.5 md:px-5 text-xs md:text-sm font-bold gap-1.5 md:gap-2"
                        >
                          <Link href={slide.href}>
                            <span>{slide.ctaLabel}</span>
                            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* دکمه‌های قبلی و بعدی روی هاور دسکتاپ */}
          <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-20 container mx-auto px-4 hidden md:flex items-center justify-between">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="بنر قبلی"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              aria-label="بنر بعدی"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* نشانگرهای اسلاید */}
          <div className="absolute bottom-2.5 md:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollTo(idx)}
                aria-label={`رفتن به بنر ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selectedIndex === idx
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/45 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
