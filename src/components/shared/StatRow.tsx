import type { HTMLAttributes } from "react";
import { StatisticCard } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export type StatItem = {
  id: string;
  value: string;
  label: string;
};

export type StatRowProps = HTMLAttributes<HTMLDivElement> & {
  items: readonly StatItem[];
};

/**
 * Trust statistics row — years / repairs / warranty (not in hero).
 */
export function StatRow({ items, className, ...props }: StatRowProps) {
  return (
    <div
      className={cn(
        "stat-row grid grid-cols-2 gap-[var(--grid-gap)] lg:grid-cols-4",
        className,
      )}
      role="list"
      aria-label="Ключевые показатели"
      {...props}
    >
      {items.map((item) => (
        <div key={item.id} role="listitem" className="min-w-0">
          <StatisticCard value={item.value} label={item.label} />
        </div>
      ))}
    </div>
  );
}
