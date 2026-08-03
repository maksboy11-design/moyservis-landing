"use client";

import { Container, Section } from "@/components/layout";
import { ReviewItem } from "@/components/shared/ReviewItem";
import { ReviewSlider } from "@/components/shared/ReviewSlider";
import { Body, H2 } from "@/components/ui/typography";
import { SECTION_IDS } from "@/constants/section-ids";
import { reviewsContent, type ReviewContent } from "@/content/reviews";
import { cn } from "@/lib/cn";

export type ReviewsSectionProps = {
  className?: string;
  items?: readonly ReviewContent[];
  title?: string;
  titleId?: string;
  lead?: string;
};

function SummaryStars({ value, max }: { value: string; max: number }) {
  const numeric = Number.parseFloat(value);
  const filled = Number.isFinite(numeric)
    ? Math.min(max, Math.round(numeric))
    : max;

  return (
    <p className="reviews__rating-stars" aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            "review-item__star",
            i < filled ? "review-item__star--on" : "review-item__star--off",
          )}
        >
          ★
        </span>
      ))}
    </p>
  );
}

/**
 * Reviews — cards (rating / name / device / date / photo) + adaptive slider→grid.
 */
export function ReviewsSection({
  className,
  items = reviewsContent.items,
  title = reviewsContent.title,
  titleId = reviewsContent.titleId,
  lead = reviewsContent.lead,
}: ReviewsSectionProps) {
  const { ratingSummary } = reviewsContent;

  return (
    <Section
      id={SECTION_IDS.reviews}
      surface="dark"
      reveal
      aria-labelledby={titleId}
      className={cn("reviews", className)}
    >
      <Container className="flex flex-col gap-8 md:gap-10">
        <header className="reviews__heading">
          <H2 id={titleId}>{title}</H2>
          {lead ? (
            <Body tone="muted" className="reviews__lead">
              {lead}
            </Body>
          ) : null}
          <div className="reviews__rating">
            <span
              className="reviews__rating-value"
              aria-label={`Средняя оценка ${ratingSummary.value} из ${ratingSummary.max}`}
            >
              {ratingSummary.value}
            </span>
            <div className="reviews__rating-aside">
              <SummaryStars
                value={ratingSummary.value}
                max={ratingSummary.max}
              />
              <span className="reviews__rating-meta">
                {ratingSummary.countLabel}
              </span>
            </div>
          </div>
        </header>

        <ReviewSlider label={title}>
          {items.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className="reviews-slider__slide"
            >
              <ReviewItem
                name={item.name}
                text={item.text}
                rating={item.rating}
                device={item.device}
                date={item.date}
                photo={item.photo}
              />
            </div>
          ))}
        </ReviewSlider>
      </Container>
    </Section>
  );
}
