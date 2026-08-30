interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

/** Inline error surface — deliberately not a toast, so it cannot be missed. */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-text"
    >
      <span className="min-w-0">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-sm border border-destructive/30 px-2 py-1 text-xs font-medium hover:bg-destructive/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Retry
      </button>
    </div>
  );
}
