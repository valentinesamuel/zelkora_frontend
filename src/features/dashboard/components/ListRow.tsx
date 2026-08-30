import { Link } from 'react-router-dom';

interface ListRowProps {
  primary: string;
  meta?: string;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
}

const rowClassName =
  'h-9 w-full text-left flex items-center gap-3 px-2 rounded-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * A 36px list row. Pass `href` to render a router Link, otherwise it is a
 * button driven by `onClick`.
 */
export function ListRow({
  primary,
  meta,
  onClick,
  href,
  ariaLabel,
}: ListRowProps) {
  const content = (
    <>
      <span className="min-w-0 flex-1 truncate">{primary}</span>
      {meta && (
        <span className="font-mono text-xs text-muted-foreground shrink-0">
          {meta}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} aria-label={ariaLabel} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={rowClassName}
    >
      {content}
    </button>
  );
}
