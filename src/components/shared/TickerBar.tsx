import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TickerBarProps = HTMLAttributes<HTMLDivElement> & {
  items: readonly string[];
  /**
   * Identical loop segments on the track.
   * Must be ≥2. Higher values keep the viewport filled when one phrase
   * is narrower than the screen (ultrawide / desktop).
   */
  repeats?: number;
};

/**
 * Lime informational ticker under Hero (refs).
 * Seamless CSS marquee — pauses under prefers-reduced-motion.
 *
 * Track = N equal segments; animation moves exactly -100%/N so the next
 * segment lands where the first was (no empty gap, no jump).
 */
export function TickerBar({
  items,
  repeats = 6,
  className,
  ...props
}: TickerBarProps) {
  const copyCount = Math.max(2, repeats);
  const groups = Array.from({ length: copyCount }, (_, index) => index);

  return (
    <div
      className={cn("ticker-bar", className)}
      role="presentation"
      {...props}
    >
      <div className="ticker-bar__viewport">
        <div
          className="ticker-bar__track"
          style={
            {
              "--ticker-copies": copyCount,
            } as CSSProperties
          }
        >
          {groups.map((group) => (
            <div
              key={group}
              className="ticker-bar__group"
              aria-hidden={group > 0 || undefined}
            >
              {items.map((item, index) => (
                <span key={`${group}-${index}-${item}`} className="contents">
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
