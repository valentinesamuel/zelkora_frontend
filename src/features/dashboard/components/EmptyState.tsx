interface EmptyStateProps {
  readonly message: string;
}

/** Reserves height so an empty widget body does not collapse. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex min-h-24 items-center justify-center text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
