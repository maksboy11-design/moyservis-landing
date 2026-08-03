"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Body, H3 } from "@/components/ui/typography";
import {
  leadDefaultValues,
  leadSchema,
  type LeadInput,
} from "@/schemas/lead";
import { LeadSubmitError, submitLead } from "./submit-lead";

const deviceOptions = [
  { value: "phone", label: "Смартфон / планшет" },
  { value: "laptop", label: "Ноутбук" },
  { value: "pc", label: "Компьютер / ПК" },
  { value: "console", label: "Игровая консоль" },
  { value: "other", label: "Другое" },
] as const;

const contactOptions = [
  { value: "phone", label: "Телефон", description: "Перезвоним в рабочее время" },
  {
    value: "messenger",
    label: "Мессенджер",
    description: "Напишем в VK / MAX",
  },
] as const;

export type LeadFormProps = {
  className?: string;
  onSuccess?: (id: string) => void;
};

export function LeadForm({ className, onSuccess }: LeadFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: leadDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const result = await submitLead({
        ...values,
        message: values.message?.trim() ? values.message.trim() : undefined,
        website: values.website ?? "",
      });
      setSuccessId(result.id);
      onSuccess?.(result.id);
      reset(leadDefaultValues);
    } catch (error) {
      if (error instanceof LeadSubmitError) {
        setFormError(error.message);
        if (error.fieldErrors) {
          for (const [key, messages] of Object.entries(error.fieldErrors)) {
            const message = Array.isArray(messages) ? messages[0] : undefined;
            if (message) {
              form.setError(key as keyof LeadInput, { message });
            }
          }
        }
        return;
      }

      setFormError("Что-то пошло не так. Попробуйте ещё раз.");
    }
  });

  if (successId) {
    return (
      <div
        className={className}
        role="status"
        aria-live="polite"
        data-surface="dark"
      >
        <div className="flex flex-col gap-4 rounded-lg bg-surface p-6">
          <H3 className="text-action-primary">Заявка отправлена</H3>
          <Body tone="muted">
            Мы свяжемся с вами в ближайшее время. Номер заявки:{" "}
            <span className="text-foreground">{successId}</span>
          </Body>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSuccessId(null);
              reset(leadDefaultValues);
            }}
          >
            Отправить ещё
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={onSubmit}
        noValidate
        aria-busy={isSubmitting || undefined}
        aria-label="Форма заявки"
      >
        <div className="flex flex-col gap-5">
          {/* Honeypot — hidden from users, visible to bots */}
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
            <FormField
              control={control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormFieldLabel>Сайт</FormFieldLabel>
                  <FormControl>
                    <Input
                      {...field}
                      tabIndex={-1}
                      autoComplete="off"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormFieldLabel required>Имя</FormFieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
                    invalid={Boolean(fieldState.error)}
                    success={fieldState.isDirty && !fieldState.invalid}
                  />
                </FormControl>
                <FormMessage successMessage="Отлично" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormFieldLabel required>Телефон</FormFieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    invalid={Boolean(fieldState.error)}
                    success={fieldState.isDirty && !fieldState.invalid}
                  />
                </FormControl>
                <FormDescription>Только для связи по заявке</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="deviceType"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormFieldLabel required>Устройство</FormFieldLabel>
                <FormControl>
                  <Select
                    {...field}
                    options={[...deviceOptions]}
                    placeholder="Выберите тип"
                    invalid={Boolean(fieldState.error)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contactPref"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    legend="Как удобнее связаться"
                    options={[...contactOptions]}
                    invalid={Boolean(fieldState.error)}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="message"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormFieldLabel>Комментарий</FormFieldLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Опишите проблему (необязательно)"
                    rows={4}
                    invalid={Boolean(fieldState.error)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="callback"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-elevated px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <FormFieldLabel className="normal-case tracking-normal">
                      Нужен обратный звонок
                    </FormFieldLabel>
                    <FormDescription>
                      Перезвоним в течение рабочего дня
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="consent"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      invalid={Boolean(fieldState.error)}
                    />
                  </FormControl>
                  <FormFieldLabel required className="normal-case font-body font-medium tracking-normal leading-normal">
                    Согласен на обработку персональных данных
                  </FormFieldLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError ? (
            <p role="alert" className="font-body text-sm text-error">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Отправить заявку
          </Button>
        </div>
      </form>
    </Form>
  );
}
