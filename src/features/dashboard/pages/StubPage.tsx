import { Link, useParams } from 'react-router-dom';

interface StubPageProps {
  title: string;
  note?: string;
}

/**
 * Placeholder for a route whose real screen is not built yet. Every stub still
 * has a title, one sentence naming what will live here, an echo of any route
 * params (so a row-click contract is visibly correct), and a way back to the
 * dashboard — no dead ends (`D-role-dashboard-shell-8`).
 */
export function StubPage({ title, note }: StubPageProps) {
  const params = useParams();
  const routeParams = Object.entries(params).filter(
    ([, value]) => typeof value === 'string',
  ) as Array<[string, string]>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        {note ?? 'This section is coming soon.'}
      </p>

      {routeParams.length > 0 && (
        <dl className="mt-3 flex flex-col gap-1 text-sm">
          {routeParams.map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="font-mono text-muted-foreground">{key}</dt>
              <dd className="font-mono text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Link
        to="/dashboard"
        className="mt-4 inline-flex rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
