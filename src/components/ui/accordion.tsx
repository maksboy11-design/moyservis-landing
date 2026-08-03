import type {
  DetailsHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  /** Exclusive group name for native <details name> */
  name?: string;
  children: ReactNode;
};

/**
 * Accordion shell — groups exclusive <details> items (native disclosure).
 */
export function Accordion({
  name = "accordion",
  className,
  children,
  ...props
}: AccordionProps) {
  return (
    <div
      className={cn("accordion", className)}
      data-accordion-name={name}
      {...props}
    >
      {children}
    </div>
  );
}

export type AccordionItemProps = Omit<
  DetailsHTMLAttributes<HTMLDetailsElement>,
  "name"
> & {
  /** Shared with siblings for single-open behavior */
  name?: string;
  children: ReactNode;
};

export function AccordionItem({
  name = "accordion",
  className,
  children,
  ...props
}: AccordionItemProps) {
  return (
    <details className={cn("accordion__item", className)} name={name} {...props}>
      {children}
    </details>
  );
}

export type AccordionTriggerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

/**
 * Disclosure trigger — <summary> with question heading slot.
 */
export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <summary className={cn("accordion__trigger", className)} {...props}>
      <span className="accordion__trigger-label">{children}</span>
      <span className="accordion__icon" aria-hidden>
        <svg viewBox="0 0 24 24" className="accordion__chevron" fill="none">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </summary>
  );
}

export type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <div className={cn("accordion__content", className)} {...props}>
      {children}
    </div>
  );
}
