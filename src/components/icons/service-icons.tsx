import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function base(props: IconProps) {
  const { className, ...rest } = props;
  return {
    className: cn("size-5", className),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    ...rest,
  };
}

/** Phone / mobile repair */
export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

/** Laptop / PC repair */
export function IconLaptop(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="11" rx="1.5" />
      <path d="M2 18.5h20" />
      <path d="M10 15.5h4" />
    </svg>
  );
}

/** Components / chip */
export function IconChip(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9 3.5v3.5M12 3.5v3.5M15 3.5v3.5M9 17v3.5M12 17v3.5M15 17v3.5M3.5 9h3.5M3.5 12h3.5M3.5 15h3.5M17 9h3.5M17 12h3.5M17 15h3.5" />
    </svg>
  );
}

export const serviceIcons = {
  phone: IconPhone,
  laptop: IconLaptop,
  chip: IconChip,
} as const;

export type ServiceIconId = keyof typeof serviceIcons;
