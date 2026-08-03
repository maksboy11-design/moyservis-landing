"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type ReviewSliderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  label?: string;
};

/**
 * Adaptive reviews layout:
 * — < lg: horizontal snap slider + prev/next
 * — ≥ lg: static 3-col grid (controls hidden)
 */
export function ReviewSlider({
  children,
  label = "Отзывы клиентов",
  className,
  ...props
}: ReviewSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const x = el.scrollLeft;
    setCanPrev(x > 4);
    setCanNext(x < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });

    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, children]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>(".reviews-slider__slide");
    const delta = (card?.offsetWidth ?? el.clientWidth * 0.85) + 16;
    el.scrollBy({ left: direction * delta, behavior: "smooth" });
  };

  return (
    <div className={cn("reviews-slider", className)} {...props}>
      <div
        className="reviews-slider__controls"
        aria-controls="reviews-slider-track"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="reviews-slider__btn"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          aria-label="Предыдущий отзыв"
        >
          <span aria-hidden>←</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="reviews-slider__btn"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          aria-label="Следующий отзыв"
        >
          <span aria-hidden>→</span>
        </Button>
      </div>

      <div
        id="reviews-slider-track"
        ref={trackRef}
        className="reviews-slider__track"
        role="list"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
