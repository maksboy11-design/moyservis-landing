import { cva, type VariantProps } from "class-variance-authority";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";



/**

 * Adaptive grid columns:

 *   Small Mobile → 1

 *   Large Mobile (sm) → up to 2

 *   Tablet H+ (lg) → 3 / 4

 *   12-col token grid with span helpers

 */

export const gridVariants = cva("grid w-full min-w-0", {

  variants: {

    cols: {

      1: "grid-cols-1",

      2: "grid-cols-1 sm:grid-cols-2",

      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",

      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",

      12: "grid-ds",

    },

    gap: {

      sm: "gap-[var(--grid-gap-sm)]",

      md: "gap-[var(--grid-gap)]",

      lg: "gap-[var(--grid-gap-lg)]",

    },

  },

  defaultVariants: {

    cols: 3,

    gap: "md",

  },

});



export type GridProps = HTMLAttributes<HTMLDivElement> &

  VariantProps<typeof gridVariants> & {

    children?: ReactNode;

  };



/**

 * Adaptive grid — Small Mobile → Large Desktop.

 * `cols={12}` uses token-based `.grid-ds` with span helpers.

 */

export function Grid({

  className,

  cols,

  gap,

  children,

  ...props

}: GridProps) {

  return (

    <div className={cn(gridVariants({ cols, gap }), className)} {...props}>

      {children}

    </div>

  );

}



export type GridItemProps = HTMLAttributes<HTMLDivElement> & {

  span?: 4 | 6 | 12;

  children?: ReactNode;

};



const spanClass = {

  4: "grid-ds__span-4",

  6: "grid-ds__span-6",

  12: "grid-ds__span-12",

} as const;



export function GridItem({

  span = 12,

  className,

  children,

  ...props

}: GridItemProps) {

  return (

    <div className={cn("min-w-0 max-w-full", spanClass[span], className)} {...props}>

      {children}

    </div>

  );

}


