import Image from "next/image";
import type { HTMLAttributes } from "react";
import { Body, H4, Small } from "@/components/ui/typography";
import { formatReviewDate } from "@/lib/format-review-date";
import { cn } from "@/lib/cn";

export type ReviewItemProps = HTMLAttributes<HTMLElement> & {
  name: string;
  text: string;
  rating?: number;
  device: string;
  date?: string;
  photo?: {
    src: string;
    alt: string;
  };
};

function Stars({ rating }: { rating: number }) {
  const value = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <p
      className="review-item__stars"
      aria-label={`Оценка ${value} из 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "review-item__star",
            i < value ? "review-item__star--on" : "review-item__star--off",
          )}
        >
          ★
        </span>
      ))}
    </p>
  );
}

/**
 * Review card — rating, quote, client name, device, optional date & photo.
 */
export function ReviewItem({
  name,
  text,
  rating = 5,
  device,
  date,
  photo,
  className,
  ...props
}: ReviewItemProps) {
  const formattedDate = formatReviewDate(date);

  return (
    <article
      className={cn("review-item", className)}
      {...props}
    >
      {photo ? (
        <div className="review-item__media">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 85vw, 33vw"
          />
        </div>
      ) : null}

      <div className="review-item__content">
        <Stars rating={rating} />

        <Body className="review-item__text text-pretty text-neutral-0/92">
          «{text}»
        </Body>

        <footer className="review-item__footer">
          <H4
            as="p"
            className="review-item__name text-[length:var(--font-size-sm)] tracking-[0.06em]"
          >
            {name}
          </H4>
          <Small className="review-item__meta">
            <span className="review-item__device">{device}</span>
            {formattedDate ? (
              <>
                <span aria-hidden className="review-item__sep">
                  ·
                </span>
                <time dateTime={date}>{formattedDate}</time>
              </>
            ) : null}
          </Small>
        </footer>
      </div>
    </article>
  );
}
