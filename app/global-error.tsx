'use client';

type GlobalErrorProps = {
  unstable_retry: () => void;
};

const GlobalError = ({ unstable_retry }: GlobalErrorProps) => {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <section className="max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p>The application ran into a problem. Please try again.</p>
            <button type="button" onClick={() => unstable_retry()}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
