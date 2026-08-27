/**
 * Generic form-field primitive.
 *
 * Domain-agnostic: it owns structure and the accessibility contract only, never
 * colours or domain concepts. It ships NO CSS — every class name arrives as a
 * prop (INV-F3). It calls NO hooks and is a pure function of its props (INV-F4).
 * Binding is by registration-prop, not by context (INV-F5).
 *
 * Layering: this module is domain-agnostic and must never import feature or
 * transport modules (INV-L2). Dependency arrows point inward only.
 */
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export interface FormFieldProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'className'> {
  /** Control id; the error node uses `${id}-error`. */
  id: string;
  /** Visible label text. */
  label: string;
  /** Result of `register('field')`. */
  registration: UseFormRegisterReturn;
  /** `errors.field` from RHF `formState`. */
  error?: FieldError;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

export function FormField({
  id,
  label,
  registration,
  error,
  labelClassName,
  inputClassName,
  errorClassName,
  ...rest
}: FormFieldProps) {
  return (
    <>
      <label className={labelClassName} htmlFor={id}>
        {label}
        <input
          {...rest}
          id={id}
          className={inputClassName}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
        />
      </label>
      {error?.message && (
        <p className={errorClassName} role="alert" id={`${id}-error`}>
          {error.message}
        </p>
      )}
    </>
  );
}
