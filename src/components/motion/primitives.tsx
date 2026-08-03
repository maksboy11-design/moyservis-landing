"use client";

import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  defaultEnterTransition,
  fadeDownVariants,
  fadeUpVariants,
  fadeVariants,
  scaleVariants,
  slideVariants,
  type SlideDirection,
} from "@/animations/variants";
import { cn } from "@/lib/cn";

type BaseProps = HTMLMotionProps<"div"> & {
  /** Animate on mount (default true) */
  animateOnMount?: boolean;
};

function useEnter(reduced: boolean | null) {
  return {
    initial: "hidden" as const,
    animate: "visible" as const,
    exit: "exit" as const,
    transition: defaultEnterTransition(reduced),
  };
}

export type FadeProps = BaseProps;

export function Fade({
  className,
  animateOnMount = true,
  children,
  ...props
}: FadeProps) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);

  return (
    <m.div
      className={cn(className)}
      variants={fadeVariants(reduced)}
      {...(animateOnMount ? enter : {})}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type FadeUpProps = BaseProps;

export function FadeUp({
  className,
  animateOnMount = true,
  children,
  ...props
}: FadeUpProps) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);

  return (
    <m.div
      className={cn(className)}
      variants={fadeUpVariants(reduced)}
      {...(animateOnMount ? enter : {})}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type FadeDownProps = BaseProps;

export function FadeDown({
  className,
  animateOnMount = true,
  children,
  ...props
}: FadeDownProps) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);

  return (
    <m.div
      className={cn(className)}
      variants={fadeDownVariants(reduced)}
      {...(animateOnMount ? enter : {})}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type ScaleProps = BaseProps;

export function Scale({
  className,
  animateOnMount = true,
  children,
  style,
  ...props
}: ScaleProps) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);

  return (
    <m.div
      className={cn(className)}
      variants={scaleVariants(reduced)}
      style={{ transformOrigin: "center", ...style }}
      {...(animateOnMount ? enter : {})}
      {...props}
    >
      {children}
    </m.div>
  );
}

export type SlideProps = BaseProps & {
  direction?: SlideDirection;
};

export function Slide({
  className,
  direction = "up",
  animateOnMount = true,
  children,
  ...props
}: SlideProps) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);

  return (
    <m.div
      className={cn(className)}
      variants={slideVariants(direction, reduced)}
      {...(animateOnMount ? enter : {})}
      {...props}
    >
      {children}
    </m.div>
  );
}

/** Alias: Reveal = FadeUp enter (mount) */
export type RevealProps = FadeUpProps;

export function Reveal(props: RevealProps) {
  return <FadeUp {...props} />;
}
