import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  /** Optional adjacent label text (use FormFieldLabel in RHF forms instead) */
  label?: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      className,
      label,
      description,
      invalid = false,
      id,
      disabled,
      ...props
    },
    ref,
  ) {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        data-slot="checkbox"
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={cn(
          // Checked fill + checkmark: see form-controls.css (data-slot=checkbox).
          // Do not put data-URL bg utilities here — quotes break the class attribute
          // and tailwind-merge drops checked:bg-action-primary against bg-[image].
          "size-5 shrink-0 cursor-pointer appearance-none rounded-xs",
          "border border-border-strong",
          "transition-[background-color,border-color,box-shadow]",
          "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]",
          invalid && "border-error",
          className,
        )}
        {...props}
      />
    );

    if (!label && !description) {
      return input;
    }

    return (
      <span
        className={cn(
          "inline-flex items-start gap-3",
          disabled && "opacity-[var(--opacity-disabled)]",
        )}
      >
        <span className="mt-0.5">{input}</span>
        <span className="flex min-w-0 flex-col gap-1">
          {label ? (
            <label
              htmlFor={id}
              className="cursor-pointer font-body text-sm font-medium leading-normal text-foreground normal-case"
            >
              {label}
            </label>
          ) : null}
          {description ? (
            <span className="font-body text-sm leading-normal text-foreground-muted normal-case">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    );
  },
);
