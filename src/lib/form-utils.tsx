import React from 'react';
import { useForm, UseFormReturn, FieldValues, Path, FormProvider as FormProviderBase } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
};

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: FormProps<T>) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      <fieldset disabled={form.formState.isSubmitting} className="space-y-6">
        {children}
      </fieldset>
    </form>
  );
}

type FormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
  children: (field: {
    id: string;
    name: string;
    error?: string;
    disabled: boolean;
  }) => React.ReactNode;
};

export function FormField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required = false,
  children,
}: FormFieldProps<T>) {
  const error = form.formState.errors[name]?.message as string | undefined;
  const id = `form-${String(name)}`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {children({
        id,
        name: String(name),
        error,
        disabled: form.formState.isSubmitting,
      })}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function useZodForm<T extends z.ZodType>(
  schema: T,
  defaultValues?: z.infer<T>,
  options?: Parameters<typeof useForm<z.infer<T>>>[0]
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    ...options,
  });
}

export function FormProvider<T extends FieldValues>({
  children,
  ...props
}: Parameters<typeof FormProviderBase<T>>[0]) {
  return <FormProviderBase {...props}>{children}</FormProviderBase>;
}

export function createFormSchema<T extends z.ZodRawShape>(
  schema: T,
  options?: {
    refine?: (data: z.infer<z.ZodObject<T>>) => z.ZodIssue[] | void;
  }
) {
  let schemaObj = z.object(schema);
  
  if (options?.refine) {
    schemaObj = schemaObj.superRefine((data, ctx) => {
      const issues = options.refine?.(data);
      if (issues) {
        issues.forEach((issue) => {
          ctx.addIssue(issue);
        });
      }
    });
  }
  
  return schemaObj;
}

// Common validation schemas
export const validationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  url: z.string().url('Please enter a valid URL'),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number in E.164 format (e.g., +14155552671)'
    ),
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Please enter a valid date'
  ),
  number: z.number().min(0, 'Must be a positive number'),
  requiredString: z.string().min(1, 'This field is required'),
  optionalString: z.string().optional(),
} as const;
