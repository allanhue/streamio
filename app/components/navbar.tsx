import Link from 'next/link';

function Icon({ name }: { name: 'grid' | 'play' | 'search' | 'bookmark' }) {
  if (name === 'play') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  if (name === 'search') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round">
        <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      </svg>
    );
  }

  if (name === 'bookmark') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
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
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight text-white">
          <span>Streamio</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-bold md:flex">
          <Link href="/" className="rounded-md px-3 py-2 text-white transition hover:bg-white/10">Home</Link>
          <Link href="/#catalog" className="rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="grid" />
            <span className="ml-2 inline">Browse</span>
          </Link>
          <Link href="/#my-list" className="flex items-center rounded-md px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white">
            <Icon name="bookmark" />
            <span className="ml-2">My List</span>
          </Link>
        </nav>

        <nav className="ml-auto flex items-center gap-2 text-sm font-bold">
          <Link href="/#stream-search" title="Search catalog" className="grid h-10 w-10 place-items-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white">
            <Icon name="search" />
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-black transition hover:bg-neutral-200">
            <Icon name="play" />
            <span className="hidden sm:inline">Open app</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
