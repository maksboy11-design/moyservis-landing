import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { SectionId } from "@/constants/section-ids";
import { cn } from "@/lib/cn";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export type SectionSurface = "dark" | "light" | "hero" | "lime" | "none";
export type SectionPadding = "default" | "tight" | "none";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  id?: SectionId | (string & {});
  surface?: SectionSurface;
  paddingY?: SectionPadding;
  /** Enable scroll-reveal for children wrapper (Framer Motion) */
  reveal?: boolean;
  /** Delay in ms (converted to seconds for FM) */
  revealDelay?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
};

const surfaceClass: Record<SectionSurface, string> = {
  dark: "bg-bg-page text-foreground",
  light: "bg-surface-inverse text-foreground-inverse",
  hero: "bg-bg-hero text-foreground",
  lime: "bg-action-primary text-action-primary-fg",
  none: "",
};

const paddingClass: Record<SectionPadding, string> = {
  default: "section-ds",
  tight: "py-7 md:py-10",
  none: "py-0",
};

/**
 * Universal landing section — surface, spacing, anchors, optional reveal.
 */
export function Section({
  as: Comp = "section",
  id,
  surface = "dark",
  paddingY = "default",
  reveal = false,
  revealDelay = 0,
  className,
  children,
  ...props
}: SectionProps) {
  const surfaceAttr =
    surface === "dark" || surface === "light" ? surface : undefined;

  const content = reveal ? (
    <ScrollReveal preset="reveal" delay={revealDelay / 1000}>
      {children}
    </ScrollReveal>
  ) : (
    children
  );

  return (
    <Comp
      id={id}
      data-surface={surfaceAttr}
      className={cn(
        "relative scroll-mt-[var(--space-11)]",
        surfaceClass[surface],
        paddingClass[paddingY],
        className,
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}
