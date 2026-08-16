import Link from 'next/link';

function Icon({ name }: { name: 'grid' | 'play' }) {
  if (name === 'play') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-tight text-white">
          Streamio
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/" className="flex items-center gap-2 border border-transparent px-3 py-2 text-neutral-300 transition hover:border-white/30 hover:text-white">
            <Icon name="grid" />
            Catalog
          </Link>
          <Link href="/watch?id=27205" className="flex items-center gap-2 border border-white bg-white px-3 py-2 text-black transition hover:bg-black hover:text-white">
            <Icon name="play" />
            Player
          </Link>
        </nav>
      </div>
    </header>
  );
}
