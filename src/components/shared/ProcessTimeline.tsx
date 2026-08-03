"use client";

import { m, useReducedMotion } from "framer-motion";
import {
  defaultEnterTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/animations/variants";
import { ProcessStep } from "@/components/shared/ProcessStep";
import type { ProcessStepContent } from "@/content/process";
import { cn } from "@/lib/cn";

export type ProcessTimelineProps = {
  steps: readonly ProcessStepContent[];
  className?: string;
  "aria-label"?: string;
};

/**
 * Visual process scheme — vertical rail (mobile) · horizontal track (desktop).
 * Staggered fade-up on enter viewport.
 */
export function ProcessTimeline({
  steps,
  className,
  "aria-label": ariaLabel = "Этапы ремонта",
}: ProcessTimelineProps) {
  const reduced = useReducedMotion();

  return (
    <m.ol
      className={cn("process-timeline", className)}
      aria-label={ariaLabel}
      variants={staggerContainerVariants(reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -6% 0px" }}
    >
      {steps.map((step, index) => (
        <m.li
          key={step.id}
          className="process-timeline__item"
          variants={staggerItemVariants(reduced)}
          transition={defaultEnterTransition(reduced)}
        >
          <ProcessStep
            index={index + 1}
            title={step.title}
            body={step.body}
          />
        </m.li>
      ))}
    </m.ol>
  );
}
