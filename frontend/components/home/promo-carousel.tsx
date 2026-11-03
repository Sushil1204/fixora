"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/shell/category-icon";
import { HOME_PROMOS, type Promo, type PromoTone } from "@/lib/promos";
import { cn } from "@/lib/cn";

const ROTATE_MS = 6500;

/**
 * Per-tone class sets. Kept as complete class strings (never composed) so
 * Tailwind can see every class it needs to emit.
 */
const TONES: Record<
  PromoTone,
  {
    panel: string;
    glowA: string;
    glowB: string;
    ghost: string;
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    medallion: string;
    ring: string;
    ringDashed: string;
    dot: string;
    dotActive: string;
    dotFocus: string;
  }
> = {
  brand: {
    panel:
      "bg-[linear-gradient(120deg,#0f2a5c_0%,#1746a2_52%,#2a63c6_100%)]",
    glowA: "bg-highlight/25",
    glowB: "bg-white/10",
    ghost: "text-white",
    eyebrow: "border-white/20 bg-white/10 text-white/85",
    title: "text-white",
    body: "text-white/70",
    cta: "bg-white text-brand-deep hover:bg-brand-soft focus-visible:outline-white",
    medallion: "bg-white/10 text-white ring-1 ring-inset ring-white/25",
    ring: "border-white/15",
    ringDashed: "border-white/20",
    dot: "bg-white/35 hover:bg-white/60",
    dotActive: "bg-white",
    dotFocus: "focus-visible:outline-white",
  },
  sunrise: {
    panel: "bg-[linear-gradient(120deg,#fff8f2_0%,#fff0e5_100%)]",
    glowA: "bg-accent/20",
    glowB: "bg-white/70",
    ghost: "text-accent-strong",
    eyebrow: "border-accent/25 bg-white/70 text-accent-strong",
    title: "text-ink",
    body: "text-ink-secondary",
    cta: "bg-brand text-white hover:bg-brand-hover focus-visible:outline-brand-deep",
    medallion: "bg-white text-accent-strong ring-1 ring-inset ring-accent/25",
    ring: "border-accent/20",
    ringDashed: "border-accent/25",
    dot: "bg-accent-strong/25 hover:bg-accent-strong/45",
    dotActive: "bg-accent-strong",
    dotFocus: "focus-visible:outline-brand",
  },
  mist: {
    panel: "bg-[linear-gradient(120deg,#f5f8ff_0%,#eaf1ff_100%)]",
    glowA: "bg-brand/15",
    glowB: "bg-white/70",
    ghost: "text-brand",
    eyebrow: "border-brand/20 bg-white/80 text-brand",
    title: "text-ink",
    body: "text-ink-secondary",
    cta: "bg-brand text-white hover:bg-brand-hover focus-visible:outline-brand-deep",
    medallion: "bg-white text-brand ring-1 ring-inset ring-brand/15",
    ring: "border-brand/15",
    ringDashed: "border-brand/20",
    dot: "bg-brand/25 hover:bg-brand/45",
    dotActive: "bg-brand",
    dotFocus: "focus-visible:outline-brand",
  },
};

/**
 * Flexible promotional hero: rotates whatever is in `HOME_PROMOS`.
 * Auto-advance pauses on hover/focus and is disabled for reduced-motion users.
 */
export function PromoCarousel() {
  const slides = HOME_PROMOS;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const active = slides[index];
  const tone = TONES[active.tone];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers and promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      className="relative overflow-hidden rounded-xl border border-line/70 shadow-sm"
    >
      <div className="relative min-h-[260px] sm:min-h-[296px] lg:min-h-[320px]">
        {slides.map((promo, i) => (
          <PromoSlide
            key={promo.id}
            promo={promo}
            position={i + 1}
            total={slides.length}
            active={i === index}
          />
        ))}

        {slides.length > 1 ? (
          <div className="absolute bottom-3.5 right-4 z-10 flex items-center sm:bottom-4 sm:right-5">
            {slides.map((promo, i) => (
              <button
                key={promo.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show promotion ${i + 1}: ${promo.title}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2",
                  tone.dotFocus,
                )}
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-[width,background-color] duration-200",
                    i === index
                      ? cn("w-6", tone.dotActive)
                      : cn("w-2.5", tone.dot),
                  )}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {`Promotion ${index + 1} of ${slides.length}: ${active.title}`}
      </p>
    </section>
  );
}

function PromoSlide({
  promo,
  position,
  total,
  active,
}: {
  promo: Promo;
  position: number;
  total: number;
  active: boolean;
}) {
  const tone = TONES[promo.tone];

  return (
    <article
      aria-roledescription="slide"
      aria-label={`${position} of ${total}`}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0 transition-opacity duration-300",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col justify-center overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10",
          tone.panel,
        )}
      >
        {/* Soft, tone-matched light so the panel feels lit rather than flat */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute -right-20 -top-28 size-72 rounded-full blur-3xl",
              tone.glowA,
            )}
          />
          <div
            className={cn(
              "absolute -bottom-28 left-1/4 size-64 rounded-full blur-3xl",
              tone.glowB,
            )}
          />
        </div>

        <CategoryIcon
          icon={promo.icon}
          className={cn(
            "pointer-events-none absolute -right-5 -top-6 size-36 -rotate-12 opacity-[0.09] sm:hidden",
            tone.ghost,
          )}
        />

        <div className="relative grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {promo.eyebrow ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                    tone.eyebrow,
                  )}
                >
                  {promo.eyebrow}
                </span>
              ) : null}
              {promo.price ? (
                <span className="inline-flex items-center rounded-sm bg-surface px-2 py-0.5 text-[11.5px] font-semibold tabular-nums text-ink shadow-sm ring-1 ring-line">
                  {promo.price}
                </span>
              ) : null}
            </div>

            <h2
              className={cn(
                "mt-3 line-clamp-2 max-w-md text-balance text-[25px] font-[680] leading-[1.12] tracking-[-0.02em] sm:text-[32px] lg:text-[38px]",
                tone.title,
              )}
            >
              {promo.title}
            </h2>

            {promo.body ? (
              <p
                className={cn(
                  "mt-2 line-clamp-1 max-w-sm text-[13.5px] leading-relaxed sm:text-[15px]",
                  tone.body,
                )}
              >
                {promo.body}
              </p>
            ) : null}

            <Link
              href={promo.cta.href}
              className={cn(
                "mt-5 inline-flex h-11 items-center gap-1.5 rounded-md px-4 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                tone.cta,
              )}
            >
              {promo.cta.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          {/* Artwork carries the visual weight on tablet and up */}
          <div
            aria-hidden="true"
            className="relative hidden h-[176px] w-[196px] place-items-center sm:grid lg:h-[204px] lg:w-[228px]"
          >
            <span
              className={cn(
                "absolute size-[188px] rounded-full border lg:size-[212px]",
                tone.ring,
              )}
            />
            <span
              className={cn(
                "absolute size-[138px] rounded-full border border-dashed lg:size-[154px]",
                tone.ringDashed,
              )}
            />
            <span
              className={cn(
                "grid size-[84px] place-items-center rounded-xl lg:size-24",
                tone.medallion,
              )}
            >
              <CategoryIcon
                icon={promo.icon}
                className="size-9 lg:size-10"
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
