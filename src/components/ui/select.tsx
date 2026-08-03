import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  controlVariants,
  resolveControlState,
  type ControlVariants,
} from "./control";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> &
  Pick<ControlVariants, "controlSize"> & {
    options: SelectOption[];
    placeholder?: string;
    invalid?: boolean;
    success?: boolean;
    loading?: boolean;
  };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      className,
      controlSize,
      options,
      placeholder,
      invalid = false,
      success = false,
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) {
    const state = resolveControlState({ invalid, success });
    const isDisabled = Boolean(disabled || loading);

    return (
      <select
        ref={ref}
        data-slot="select"
        aria-invalid={invalid || undefined}
        aria-busy={loading || undefined}
        disabled={isDisabled}
        className={cn(
          controlVariants({ controlSize, state }),
          "cursor-pointer pr-10",
          "bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat",
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23c8c8c8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);
