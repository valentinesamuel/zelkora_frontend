interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

/**
 * A plain section label — `font-display` heading over an optional muted
 * subtitle. Deliberately a `<div>`, not a card: it groups the cards below it.
 */
export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="min-w-0">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
