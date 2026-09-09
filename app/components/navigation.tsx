'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/movies', label: 'Movies', icon: 'film' },
    { href: '/series', label: 'Series', icon: 'tv' },
    { href: '/sports', label: 'Sports', icon: 'radio' },
    { href: '/watchlist', label: 'Watchlist', icon: 'bookmark' },
  ];

  const iconMap: Record<string, string> = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    film: 'M4 5h16v14H4V5Zm4 0v14m8-14v14M4 9h4m8 0h4M4 15h4m8 0h4',
    tv: 'M4 6h16v11H4V6Zm6 15h4m-2-4v4',
    radio: 'M5 11a7 7 0 0 1 14 0v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Zm4 2h6M9 16h2',
    bookmark: 'M6 4h12v17l-6-4-6 4V4Z',
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/95 backdrop-blur-lg">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d={iconMap[item.icon]} />
                </svg>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
