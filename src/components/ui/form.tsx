"use client";

import { Slot } from "@radix-ui/react-slot";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { VisuallyHidden } from "@/components/shared/VisuallyHidden";
import { cn } from "@/lib/cn";
import { FormLabel, type FormLabelProps } from "./label";

export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = {
  id: string;
  required: boolean;
  setRequired: (value: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
};

const FormItemContext = createContext<FormItemContextValue | null>(null);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField must be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: id,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    required: itemContext.required,
    hasDescription: itemContext.hasDescription,
    ...fieldState,
  };
}

export type FormItemProps = HTMLAttributes<HTMLDivElement>;

export function FormItem({ className, ...props }: FormItemProps) {
  const id = useId();
  const [required, setRequiredState] = useState(false);
  const [hasDescription, setHasDescriptionState] = useState(false);
  const setRequired = useCallback((value: boolean) => {
    setRequiredState(value);
  }, []);
  const setHasDescription = useCallback((value: boolean) => {
    setHasDescriptionState(value);
  }, []);

  const value = useMemo(
    () => ({
      id,
      required,
      setRequired,
      hasDescription,
      setHasDescription,
    }),
    [id, required, hasDescription, setRequired, setHasDescription],
  );

  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

export function FormFieldLabel({
  className,
  required = false,
  children,
  ...props
}: FormLabelProps) {
  const { error, formItemId } = useFormField();
  const item = useContext(FormItemContext);

  useEffect(() => {
    item?.setRequired(required);
    return () => item?.setRequired(false);
  }, [required, item?.setRequired]);

  return (
    <FormLabel
      htmlFor={formItemId}
      required={required}
      className={cn(error && "text-error", className)}
      {...props}
    >
      {children}
      {required ? <VisuallyHidden> (обязательно)</VisuallyHidden> : null}
    </FormLabel>
  );
}

export type FormControlProps = ComponentProps<typeof Slot>;

export function FormControl({ ...props }: FormControlProps) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    required,
    hasDescription,
  } = useFormField();

  const describedBy =
    [hasDescription ? formDescriptionId : null, error ? formMessageId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Slot
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={Boolean(error) || undefined}
      aria-required={required || undefined}
      {...props}
    />
  );
}

export type FormDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function FormDescription({
  className,
  ...props
}: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();
  const item = useContext(FormItemContext);

  useEffect(() => {
    item?.setHasDescription(true);
    return () => item?.setHasDescription(false);
  }, [item?.setHasDescription]);

  return (
    <p
      id={formDescriptionId}
      data-slot="form-description"
      className={cn(
        "font-body text-sm leading-normal text-foreground-muted normal-case",
        className,
      )}
      {...props}
    />
  );
}

export type FormMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  successMessage?: ReactNode;
};

export function FormMessage({
  className,
  children,
  successMessage,
  ...props
}: FormMessageProps) {
  const { error, formMessageId, isDirty, invalid } = useFormField();
  const body = error ? String(error.message ?? "") : children;

  if (successMessage && isDirty && !invalid && !error) {
    return (
      <p
        id={formMessageId}
        role="status"
        data-slot="form-message"
        className={cn(
          "font-body text-sm leading-normal text-success normal-case",
          className,
        )}
        {...props}
      >
        {successMessage}
      </p>
    );
  }

  if (!body) return null;

  return (
    <p
      id={formMessageId}
      role="alert"
      data-slot="form-message"
      className={cn(
        "font-body text-sm leading-normal text-error normal-case",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}
