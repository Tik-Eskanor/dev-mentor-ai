import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-cyan-400 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-6 max-w-md">
        The page or resource you are looking for does not exist in DevMentor AI.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
      >
        Return to Workbench
      </Link>
    </div>
  );
}
