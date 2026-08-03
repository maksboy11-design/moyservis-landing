import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  controlVariants,
  resolveControlState,
  type ControlVariants,
} from "./control";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  Pick<ControlVariants, "controlSize"> & {
    invalid?: boolean;
    success?: boolean;
    loading?: boolean;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    controlSize,
    invalid = false,
    success = false,
    loading = false,
    disabled,
    type = "text",
    ...props
  },
  ref,
) {
  const state = resolveControlState({ invalid, success });
  const isDisabled = Boolean(disabled || loading);

  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      aria-invalid={invalid || undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(controlVariants({ controlSize, state }), className)}
      {...props}
    />
  );
});
