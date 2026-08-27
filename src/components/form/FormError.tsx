/**
 * Generic form-level (not field-level) error primitive.
 *
 * Renders `message` verbatim — no prefix, no capitalisation change, no
 * truncation, no localisation, no fallback text (INV-F8 / INV-B8). Returns
 * `null` when `message` is falsy so callers do not repeat the guard.
 *
 * Domain-agnostic: no CSS, no hooks, and no feature or transport imports
 * (INV-L2).
 */
export interface FormErrorProps {
  message?: string;
  className?: string;
  id?: string;
}

export function FormError({ message, className, id }: FormErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p className={className} role="alert" id={id}>
      {message}
    </p>
  );
}
