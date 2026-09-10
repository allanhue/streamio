import Link from 'next/link';

function Icon({ name }: { name: 'grid' | 'play' | 'film' | 'tv' | 'radio' | 'bookmark' }) {
  if (name === 'play') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  if (name === 'film') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v14H4V5Zm4 0v14m8-14v14M4 9h4m8 0h4M4 15h4m8 0h4" />
      </svg>
    );
  }

  if (name === 'tv') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16v11H4V6Zm6 15h4m-2-4v4" />
      </svg>
    );
  }

  if (name === 'radio') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11a7 7 0 0 1 14 0v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Zm4 2h6M9 16h2" />
      </svg>
    );
  }

  if (name === 'bookmark') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12v17l-6-4-6 4V4Z" />
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight text-white">
          <span>Streamio</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-bold md:flex">
          <Link href="/" className="rounded-md px-3 py-2 text-white transition hover:bg-white/10">
            Home
          </Link>
          <Link href="/movies" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="film" />
            Movies
          </Link>
          <Link href="/series" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="tv" />
            Series
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="radio" />
            Sports
          </Link>
          <Link href="/watchlist" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="bookmark" />
            Watchlist
          </Link>
        </nav>

        <nav className="ml-auto flex items-center gap-2 text-sm font-bold">
          <Link href="/" className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-black transition hover:bg-neutral-200">
            <Icon name="play" />
            <span className="hidden sm:inline">Open app</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
