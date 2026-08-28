import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-4 text-muted">This route wandered off somewhere.</p>
      <Link to="/" className="mt-8 rounded-theme bg-accent px-5 py-3 text-on-accent no-underline">
        Back home
      </Link>
    </div>
  );
}
