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
          "size-5 shrink-0 cursor-pointer appearance-none rounded-xs",
          "border border-border-strong bg-surface",
          "transition-[background-color,border-color,box-shadow]",
          "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
          "checked:border-action-primary checked:bg-action-primary",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]",
          invalid && "border-error",
          "checked:bg-[image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.5 6.5 11.5 12.5 4.5' stroke='%23111111' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")]",
          "checked:bg-[length:0.875rem] checked:bg-center checked:bg-no-repeat",
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
