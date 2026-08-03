import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TickerBarProps = HTMLAttributes<HTMLDivElement> & {
  items: readonly string[];
  /** Repeat groups for seamless marquee loop */
  repeats?: number;
};

/**
 * Lime informational ticker under Hero (refs).
 * CSS marquee — pauses under prefers-reduced-motion.
 */
export function TickerBar({
  items,
  repeats = 2,
  className,
  ...props
}: TickerBarProps) {
  const groups = Array.from({ length: Math.max(2, repeats) }, (_, index) => index);

  return (
    <div
      className={cn("ticker-bar", className)}
      role="presentation"
      {...props}
    >
      <div className="ticker-bar__viewport">
        <div className="ticker-bar__track">
          {groups.map((group) => (
            <div
              key={group}
              className="ticker-bar__group"
              aria-hidden={group > 0 || undefined}
            >
              {items.map((item, index) => (
                <span key={`${group}-${item}`} className="contents">
                  {index > 0 ? (
                    <span className="ticker-bar__sep" aria-hidden />
                  ) : null}
                  <span className="ticker-bar__item">{item}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only">{items.join(": ")}</p>
    </div>
  );
}
