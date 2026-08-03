import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { VisuallyHidden } from "@/components/shared/VisuallyHidden";

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "name"
> & {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: InputHTMLAttributes<HTMLInputElement>["onBlur"];
  invalid?: boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  legend?: ReactNode;
};

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      className,
      name,
      options,
      value,
      defaultValue,
      onChange,
      onBlur,
      invalid = false,
      required = false,
      orientation = "vertical",
      legend,
      disabled,
      id,
      "aria-required": _ariaRequired,
      ...props
    },
    ref,
  ) {
    return (
      <fieldset
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        data-slot="radio-group"
        className={cn("min-w-0 border-0 p-0", className)}
      >
        {legend ? (
          <legend className="mb-3 font-display text-sm font-bold tracking-wider text-foreground uppercase">
            {legend}
            {required ? (
              <>
                <span className="ml-1 text-error" aria-hidden>
                  *
                </span>
                <VisuallyHidden> (обязательно)</VisuallyHidden>
              </>
            ) : null}
          </legend>
        ) : null}
        <div
          role="presentation"
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          )}
        >
          {options.map((option) => {
            const optionId = `${name}-${option.value}`;
            const isDisabled = Boolean(disabled || option.disabled);

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  "flex cursor-pointer items-start gap-3",
                  isDisabled &&
                    "cursor-not-allowed opacity-[var(--opacity-disabled)]",
                )}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={
                    value !== undefined ? value === option.value : undefined
                  }
                  defaultChecked={
                    value === undefined
                      ? defaultValue === option.value
                      : undefined
                  }
                  disabled={isDisabled}
                  required={required}
                  onBlur={onBlur}
                  onChange={() => onChange?.(option.value)}
                  className={cn(
                    "mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-pill",
                    "border border-border-strong bg-surface",
                    "transition-[background-color,border-color,box-shadow]",
                    "duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]",
                    "checked:border-action-primary checked:bg-action-primary",
                    "checked:shadow-[inset_0_0_0_3px_var(--color-surface)]",
                    "focus-visible:outline-none focus-visible:shadow-focus",
                    invalid && "border-error",
                  )}
                  {...props}
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-body text-sm font-medium leading-normal text-foreground normal-case">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="font-body text-sm leading-normal text-foreground-muted normal-case">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  },
);
