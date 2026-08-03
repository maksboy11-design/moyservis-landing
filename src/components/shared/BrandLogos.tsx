import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BrandLogosProps = HTMLAttributes<HTMLElement> & {
  brands: readonly string[];
  label?: string;
};

/**
 * Device brands we service — text marks (concept-safe, no fake trademark art).
 */
export function BrandLogos({
  brands,
  label = "Работаем с техникой брендов",
  className,
  ...props
}: BrandLogosProps) {
  return (
    <section
      className={cn("brand-logos", className)}
      aria-label={label}
      {...props}
    >
      <p className="brand-logos__label font-display text-xs font-bold tracking-[0.14em] text-neutral-0/55 uppercase">
        {label}
      </p>
      <ul className="brand-logos__list">
        {brands.map((brand) => (
          <li key={brand} className="brand-logos__item">
            {brand}
          </li>
        ))}
      </ul>
    </section>
  );
}
