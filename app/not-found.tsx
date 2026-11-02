import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full p-6 text-center border border-slate-100 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">The requested page does not exist.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-[#6C3BEB] text-white text-xs font-semibold rounded-xl hover:bg-[#5A2ED6]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
