import type { HTMLAttributes, ReactNode } from "react";
import { Body, H3 } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export type ProcessStepProps = HTMLAttributes<HTMLElement> & {
  index: number;
  title: string;
  body: ReactNode;
};

/**
 * Single process step — numbered marker + title + short body (DS).
 */
export function ProcessStep({
  index,
  title,
  body,
  className,
  ...props
}: ProcessStepProps) {
  const label = String(index).padStart(2, "0");

  return (
    <article
      className={cn("process-step", className)}
      {...props}
    >
      <span className="process-step__marker" aria-hidden>
        <span className="process-step__index">{label}</span>
      </span>
      <div className="process-step__content">
        <H3 className="process-step__title text-balance">{title}</H3>
        <Body className="process-step__body text-pretty text-neutral-0/90">
          {body}
        </Body>
      </div>
    </article>
  );
}
