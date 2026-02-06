import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-main p-5">
      <div className="text-center flex flex-col gap-4">
        <h1 className="h3 text-strong">404</h1>
        <p className="text-soft">
          La page que vous recherchez n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="text-accent-base hover:text-blue-600 font-medium"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
