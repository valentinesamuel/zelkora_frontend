interface SectionHeadingProps {
  readonly title: string;
  readonly subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="min-w-0">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
