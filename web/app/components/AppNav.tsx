'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppNav() {
  const pathname = usePathname() || '/';

  const menu = [
    { href: '/dairy', icon: '/dairy.svg', label: 'Dairy' },
    { href: '/flour', icon: '/flour.svg', label: 'Flour' },
    { href: '/eggs', icon: '/eggs.svg', label: 'Eggs' },
  ];

  return (
    <header className="app-nav">
      <Link href="/">
        <span className="badge-primary">Home</span>
      </Link>

      <nav aria-label="Sections">
        {menu.map((m) =>
          pathname.startsWith(m.href) ? null : (
            <Link key={m.href} href={m.href} title={m.label}>
              <img src={m.icon} alt={m.label} width={30} height={30} />
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
