/** Pulsing dot plus the literal word "Live" — the text carries the meaning. */
export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-1.5 rounded-full bg-success animate-pulse motion-reduce:animate-none" />
      Live
    </span>
  );
}
