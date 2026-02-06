"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-main p-5">
      <div className="text-center flex flex-col gap-4">
        <h1 className="h3 text-strong">Une erreur est survenue</h1>
        <p className="text-soft">
          Quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="text-accent-base hover:text-blue-600 font-medium cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
