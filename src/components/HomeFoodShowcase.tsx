"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  label: string;
};

type Props = {
  slides: Slide[];
  variant?: "default" | "tall";
};

const AUTOPLAY_MS = 4200;

export default function HomeFoodShowcase({ slides, variant = "default" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;
  const showcaseClassName = `food-showcase ${variant === "tall" ? "food-showcase-tall" : ""} home-fade-up`;

  useEffect(() => {
    if (slideCount < 2) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slideCount);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timerId);
  }, [slideCount]);

  if (slideCount === 0) {
    return (
      <section className={showcaseClassName} aria-label="Food slideshow">
        <div className="food-frame" />
      </section>
    );
  }

  const currentIndex = activeIndex % slideCount;
  const activeSlide = slides[currentIndex];
  const previousIndex = currentIndex === 0 ? slideCount - 1 : currentIndex - 1;
  const nextIndex = (currentIndex + 1) % slideCount;

  return (
    <section className={showcaseClassName} aria-label="Food slideshow">
      <div className="food-frame">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={`${slide.src}-${index}`}
              className={`food-slide ${isActive ? "is-active" : ""}`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority={index === 0}
                className="food-image"
              />
            </div>
          );
        })}

        <div className="food-overlay" aria-hidden="true" />

        <div className="food-caption" key={`${activeSlide.src}-${activeIndex}`}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-yellow">
            Fresh Off The Grill
          </p>
          <p className="mt-2 font-display text-2xl text-white sm:text-3xl">{activeSlide.label}</p>
        </div>
      </div>

      <div className="food-controls">
        <button
          type="button"
          onClick={() => setActiveIndex(previousIndex)}
          className="food-arrow"
          aria-label="Show previous food photo"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="m11.8 3.8 1.1 1.1L7.8 10l5.1 5.1-1.1 1.1-6.2-6.2 6.2-6.2Z" />
          </svg>
        </button>

        <div className="food-dot-row" aria-label="Food photo controls">
          {slides.map((slide, index) => (
            <button
              key={`${slide.label}-${index}`}
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-pressed={index === currentIndex}
              onClick={() => setActiveIndex(index)}
              className={`food-dot ${index === currentIndex ? "is-active" : ""}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setActiveIndex(nextIndex)}
          className="food-arrow"
          aria-label="Show next food photo"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="m8.2 16.2-1.1-1.1 5.1-5.1-5.1-5.1 1.1-1.1 6.2 6.2-6.2 6.2Z" />
          </svg>
        </button>
      </div>

      <div className="food-progress-track" aria-hidden="true">
        <span key={`${activeSlide.label}-${currentIndex}`} className="food-progress-fill" />
      </div>
    </section>
  );
}
