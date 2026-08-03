"use client";

import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "role"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  invalid?: boolean;
};

/**
 * Toggle switch — `role="switch"`, Space/Enter via native button.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      label,
      invalid = false,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) {
    const isControlled = checked !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultChecked);
    const isOn = isControlled ? Boolean(checked) : uncontrolled;

    useEffect(() => {
      if (isControlled) return;
      setUncontrolled(defaultChecked);
    }, [defaultChecked, isControlled]);

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-invalid={invalid || undefined}
        aria-label={label}
        disabled={disabled}
        data-state={isOn ? "checked" : "unchecked"}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-pill",
          "border border-transparent bg-neutral-700",
          "transition-[background-color,box-shadow]",
          "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]",
          "data-[state=checked]:bg-action-primary",
          invalid && "shadow-[0_0_0_2px_var(--color-semantic-error)]",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          const next = !isOn;
          if (!isControlled) setUncontrolled(next);
          onCheckedChange?.(next);
        }}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none block size-5 translate-x-1 rounded-pill bg-neutral-0 shadow-sm",
            "transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
            isOn && "translate-x-6",
          )}
        />
      </button>
    );
  },
);
