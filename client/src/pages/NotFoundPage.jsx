import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
      >
        Back to home
      </Link>
    </div>
  );
}
