import type { HTMLAttributes, ReactNode } from "react";
import { IconBadge } from "@/components/shared/IconBadge";
import { Body, H4 } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export type TrustFactProps = HTMLAttributes<HTMLElement> & {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** card = elevated block · row = About-style horizontal fact */
  variant?: "card" | "row";
};

/**
 * Trust / advantage fact — IconBadge + title (+ optional body).
 */
export function TrustFact({
  icon,
  title,
  description,
  variant = "card",
  className,
  ...props
}: TrustFactProps) {
  if (variant === "row") {
    return (
      <div
        className={cn(
          "trust-fact trust-fact--row flex items-center gap-4",
          className,
        )}
        {...props}
      >
        <IconBadge>{icon}</IconBadge>
        <H4
          as="p"
          className="text-[length:var(--font-size-sm)] tracking-[0.08em] md:text-md"
        >
          {title}
        </H4>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "trust-fact trust-fact--card",
        "flex h-full min-w-0 flex-col gap-4",
        "rounded-lg bg-surface-elevated p-[var(--card-padding-lg)]",
        "card-ds card-ds--interactive",
        "transition-[transform,box-shadow,background-color]",
        "duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-standard)]",
        className,
      )}
      {...props}
    >
      <IconBadge className="trust-fact__badge">{icon}</IconBadge>
      <div className="flex flex-col gap-2">
        <H4 as="h3" className="trust-fact__title text-balance">
          {title}
        </H4>
        {description ? (
          <Body className="trust-fact__text text-pretty text-neutral-0/90 [&_strong]:font-bold [&_strong]:text-foreground">
            {description}
          </Body>
        ) : null}
      </div>
    </article>
  );
}
