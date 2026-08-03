import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const typographyVariants = cva("type-ds text-foreground max-w-full", {
  variants: {
    variant: {
      h1: [
        "font-display font-extrabold uppercase",
        "text-[length:var(--type-display-h1)] leading-tight tracking-wide",
      ],
      h2: [
        "font-display font-bold uppercase",
        "text-[length:var(--type-display-h2)] leading-tight tracking-wide",
      ],
      h3: [
        "font-display font-bold uppercase",
        "text-[length:var(--type-display-h3)] leading-snug tracking-wide",
      ],
      h4: [
        "font-display font-bold uppercase",
        "text-[length:var(--type-display-h4)] leading-snug tracking-wide",
      ],
      bodyLarge: [
        "font-body",
        "text-lg leading-relaxed tracking-normal",
        "normal-case",
      ],
      body: [
        "font-body",
        "text-md leading-relaxed tracking-normal",
        "normal-case",
      ],
      small: [
        "font-body",
        "text-sm leading-normal tracking-normal",
        "normal-case",
      ],
      caption: [
        "font-body font-medium",
        "text-xs leading-normal tracking-wide",
        "normal-case",
      ],
      label: [
        "font-display font-bold uppercase",
        "text-sm leading-normal tracking-wider",
      ],
    },
    tone: {
      default: "text-foreground",
      muted: "text-foreground-muted",
      brand: "text-foreground-brand",
      inverse: "text-foreground-inverse",
      onLime: "text-foreground-on-lime",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
  },
});

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

const defaultTags: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  bodyLarge: "p",
  body: "p",
  small: "p",
  caption: "span",
  label: "span",
};

export type TypographyProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: ElementType;
  };

export function Typography({
  as,
  variant = "body",
  tone,
  className,
  children,
  ...props
}: TypographyProps) {
  const Comp = as ?? defaultTags[variant ?? "body"];

  return (
    <Comp
      className={cn(typographyVariants({ variant, tone }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

type HeadingProps = Omit<TypographyProps, "variant">;

export function H1(props: HeadingProps) {
  return <Typography variant="h1" {...props} />;
}

export function H2(props: HeadingProps) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: HeadingProps) {
  return <Typography variant="h3" {...props} />;
}

export function H4(props: HeadingProps) {
  return <Typography variant="h4" {...props} />;
}

export function BodyLarge(props: HeadingProps) {
  return <Typography variant="bodyLarge" {...props} />;
}

export function Body(props: HeadingProps) {
  return <Typography variant="body" {...props} />;
}

export function Small(props: HeadingProps) {
  return <Typography variant="small" {...props} />;
}

export function Caption(props: HeadingProps) {
  return <Typography variant="caption" {...props} />;
}

export function Label(props: HeadingProps) {
  return <Typography variant="label" {...props} />;
}
