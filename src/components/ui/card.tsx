import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import type {
  ElementType,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Body, H2, H4 } from "./typography";

export const cardVariants = cva(
  [
    "card-ds relative flex min-w-0 max-w-full flex-col overflow-hidden",
    "transition-[transform,box-shadow,background-color,border-color]",
    "duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-standard)]",
  ],
  {
    variants: {
      variant: {
        service: [
          "service-card bg-surface-elevated text-foreground rounded-lg",
          "card-ds--interactive",
        ].join(" "),
        /* Always a light island — never inherit dark section canvas into gutters */
        feature: "rounded-xl bg-neutral-0 text-neutral-950",
        info: "bg-surface text-foreground rounded-lg",
        statistic: "bg-surface-elevated text-foreground rounded-md",
      },
      padding: {
        none: "p-0",
        sm: "p-[var(--space-4)]",
        md: "p-[var(--card-padding)]",
        lg: "p-[var(--card-padding-lg)]",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
      },
      interactive: {
        true: [
          "card-ds--interactive cursor-pointer",
          "hover:shadow-md",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "active:translate-y-0",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "info",
      padding: "md",
      shadow: "none",
      interactive: false,
    },
  },
);

type CardVariantProps = VariantProps<typeof cardVariants>;

export type CardProps = HTMLAttributes<HTMLElement> &
  CardVariantProps & {
    as?: ElementType;
  };

export function Card({
  as: Comp = "article",
  className,
  variant,
  padding,
  shadow,
  interactive = false,
  children,
  onClick,
  onKeyDown,
  ...props
}: CardProps) {
  const isInteractive = Boolean(interactive && onClick);

  const handleKeyDown =
    isInteractive || onKeyDown
      ? (event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event);
          if (!isInteractive || event.defaultPrevented) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.(event as unknown as MouseEvent<HTMLElement>);
          }
        }
      : undefined;

  return (
    <Comp
      className={cn(
        cardVariants({
          variant,
          padding,
          shadow,
          interactive: isInteractive,
        }),
        className,
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Comp>
  );
}

export type CardMediaProps = {
  src: string;
  alt?: string;
  position?: "top" | "bottom";
  rounded?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function CardMedia({
  className,
  position = "top",
  rounded = true,
  alt = "",
  src,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: CardMediaProps) {
  return (
    <div
      data-position={position}
      className={cn(
        "media-ds__frame relative w-full max-w-full overflow-hidden",
        "aspect-[16/10]",
        rounded && "rounded-[var(--image-radius)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("flex flex-1 flex-col gap-3", className)} {...props} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("mt-auto flex flex-wrap items-center gap-3 pt-2", className)}
      {...props}
    />
  );
}

/* ── Typed card presets (refs: Services / About / Stats) ── */

export type ServiceCardProps = Omit<CardProps, "variant" | "children"> & {
  title: string;
  description: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: "top" | "bottom";
  /** Optional scan icon (purple badge — brand accent) */
  icon?: ReactNode;
  footer?: ReactNode;
};

/**
 * Service card — dark elevated surface, media top/bottom rhythm (refs).
 * Hover lift via `.card-ds--interactive` (no button role unless onClick).
 */
export function ServiceCard({
  title,
  description,
  imageSrc,
  imageAlt = "",
  imagePosition = "top",
  icon,
  footer,
  className,
  interactive = false,
  ...props
}: ServiceCardProps) {
  const media = imageSrc ? (
    <CardMedia
      src={imageSrc}
      alt={imageAlt}
      position={imagePosition}
      className="service-card__media"
    />
  ) : null;

  return (
    <Card
      variant="service"
      interactive={interactive}
      padding="lg"
      className={cn(
        "service-card h-full gap-5",
        imagePosition === "bottom" && "service-card--media-bottom",
        className,
      )}
      data-media={imagePosition}
      {...props}
    >
      {imagePosition === "top" && media}
      <CardContent className="service-card__body gap-3">
        {icon ? (
          <div
            className="service-card__icon flex size-11 shrink-0 items-center justify-center rounded-pill bg-brand-purple text-neutral-0"
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
        <H4 as="h3" className="service-card__title text-balance">
          {title}
        </H4>
        <Body className="service-card__text text-pretty [&_strong]:font-bold [&_strong]:text-foreground">
          {description}
        </Body>
        {footer ? <CardFooter className="pt-1">{footer}</CardFooter> : null}
      </CardContent>
      {imagePosition === "bottom" && media}
    </Card>
  );
}

export type FeatureCardProps = Omit<CardProps, "variant" | "children"> & {
  title: string;
  titleId?: string;
  description?: ReactNode;
  media?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
};

export function FeatureCard({
  title,
  titleId,
  description,
  media,
  aside,
  children,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      variant="feature"
      padding="lg"
      shadow="sm"
      className={cn(
        "gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start",
        className,
      )}
      {...props}
      data-surface="light"
    >
      <CardContent>
        <H2 id={titleId} className="text-[length:var(--type-display-h3)]">
          {title}
        </H2>
        {description ? <Body className="mt-3">{description}</Body> : null}
        {children}
      </CardContent>
      {media ? (
        <div className="w-full self-start overflow-hidden rounded-lg bg-neutral-0">
          {media}
        </div>
      ) : null}
      {aside ? (
        <div className="flex flex-col gap-4 self-start">{aside}</div>
      ) : null}
    </Card>
  );
}

export type InfoCardProps = Omit<CardProps, "variant" | "children"> & {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
};

export function InfoCard({
  title,
  description,
  icon,
  children,
  className,
  interactive = false,
  ...props
}: InfoCardProps) {
  return (
    <Card
      variant="info"
      interactive={interactive}
      className={cn("gap-4", className)}
      {...props}
    >
      {icon ? (
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-brand-purple text-neutral-0"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <CardHeader>
        <H4 as="h3">{title}</H4>
        {description ? <Body tone="muted">{description}</Body> : null}
      </CardHeader>
      {children}
    </Card>
  );
}

export type StatisticCardProps = Omit<CardProps, "variant" | "children"> & {
  value: string;
  label: string;
};

export function StatisticCard({
  value,
  label,
  className,
  ...props
}: StatisticCardProps) {
  return (
    <Card
      variant="statistic"
      padding="md"
      className={cn("items-start gap-2", className)}
      {...props}
    >
      <p className="font-display text-4xl font-extrabold leading-tight tracking-wide text-action-primary md:text-5xl">
        {value}
      </p>
      <Body tone="muted" className="normal-case">
        {label}
      </Body>
    </Card>
  );
}
