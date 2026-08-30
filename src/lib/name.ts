/** `"Adebayo Okonkwo"` -> `"AO"`, `"Chidi"` -> `"C"`, `""` -> `"?"`. */
export function initialsOf(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '?';
  const first = tokens[0]!.charAt(0);
  const last = tokens.length > 1 ? tokens[tokens.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}
