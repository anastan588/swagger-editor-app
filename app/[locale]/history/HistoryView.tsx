import { BADGE_THEMES, DEFAULT_BADGE, RequestHistoryData } from '@/app/components/swagger/types';
import { Link } from '@/i18n/navigation';

export type HistoryTranslations = {
  title: string;
  emptyDescription: string;
  goToEditor: string;
  goToViewer: string;
  statusCode: string;
  latency: string;
  requestSize: string;
  responseSize: string;
  error: string;
};

type HistoryViewProps = {
  entries: RequestHistoryData[];
  translations: HistoryTranslations;
};

const HistoryView = ({ entries, translations: t }: HistoryViewProps) => {
  const badgeClass = (method: string) => BADGE_THEMES[method.toUpperCase()] || DEFAULT_BADGE;

  if (entries.length === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.emptyDescription}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="rounded-md border px-4 py-2 text-sm font-medium" href="/editor">
            {t.goToEditor}
          </Link>
          <Link className="rounded-md border px-4 py-2 text-sm font-medium" href="/">
            {t.goToViewer}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{t.title}</h1>

      <div className="mt-6 divide-y rounded-lg border">
        {entries.map((entry) => (
          <details key={entry.id} className="group p-4" id={`history-entry-${entry.id}`}>
            <summary className="flex cursor-pointer justify-between text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-xs border px-2 py-0.5 text-xs font-bold ${badgeClass(entry.method)}`}>
                  {entry.method}
                </span>
                <span className="select-all text-neutral-800 dark:text-neutral-200">
                  {entry.target_host + entry.path}
                </span>
                <div className="flex gap-2">
                  <span>{t.statusCode}:</span>
                  <span
                    className={`font-bold ${entry.response_status.toString().startsWith('2') ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}
                  >
                    {entry.response_status}
                  </span>
                </div>
              </div>
              <time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString()}</time>
            </summary>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <p>
                {t.latency}: {entry.latency_ms} ms
              </p>
              <p>
                {t.requestSize}: {entry.request_size_bytes} B
              </p>
              <p>
                {t.responseSize}: {entry.response_size_bytes} B
              </p>
              {entry.error_details ? (
                <p className="text-red-600">
                  {t.error}: {entry.error_details}
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default HistoryView;
