import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";



export type ContainerSize = "auto" | "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";



export type ContainerProps = HTMLAttributes<HTMLElement> & {

  as?: ElementType;

  /**

   * `auto` — адаптивный `--layout-container-max` из responsive.css

   * Остальные — фиксированный max-width токен (всё равно ≤ 100%).

   */

  size?: ContainerSize;

  children?: ReactNode;

};



const sizeClass: Record<ContainerSize, string> = {

  auto: "container-ds",

  sm: "container-ds container-ds--sm",

  md: "container-ds container-ds--md",

  lg: "container-ds container-ds--lg",

  xl: "container-ds container-ds--xl",

  "2xl": "container-ds container-ds--2xl",

  fluid: "container-ds container-ds--fluid",

};



/**

 * Project container — adaptive max-width + gutters from DS tokens.

 */

export function Container({

  as: Comp = "div",

  size = "auto",

  className,

  children,

  ...props

}: ContainerProps) {

  return (

    <Comp className={cn(sizeClass[size], className)} {...props}>

      {children}

    </Comp>

  );

}


