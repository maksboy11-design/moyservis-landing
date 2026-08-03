import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  controlVariants,
  resolveControlState,
  type ControlVariants,
} from "./control";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Pick<ControlVariants, "controlSize"> & {
    invalid?: boolean;
    success?: boolean;
  };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      controlSize = "md",
      invalid = false,
      success = false,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const state = resolveControlState({ invalid, success });

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          controlVariants({ controlSize, state }),
          "min-h-28 resize-y py-3",
          className,
        )}
        {...props}
      />
    );
  },
);
