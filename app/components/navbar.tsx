import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-slate-800 p-4 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-red-500">
          Streamio
        </Link>
        <nav className="space-x-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition">Dashboard</Link>
          <Link href="/watch?id=27205" className="hover:text-white transition">Demo Player</Link>
        </nav>
      </div>
    </header>
  );
}