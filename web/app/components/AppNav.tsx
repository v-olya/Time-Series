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
      <div className="vstack">
        <Link href="/">
          <span className={'badge badge-' + (pathname === '/' ? 'primary' : 'secondary')}>
            Home</span>
        </Link>

        <Link href="https://github.com/v-olya/Time-Series" target="_blank" rel="noopener noreferrer">
          <span className="badge badge-secondary">Repo&thinsp;</span>
        </Link>
      </div>

      <nav className="vstack" aria-label="Sections">
        {menu.map((m) => {
          const isActive = pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              title={m.label}
              className={'nav-icon' + (isActive ? ' active' : '')}
              aria-current={isActive ? 'page' : undefined}
            >
              <img src={m.icon} alt={m.label} width={30} height={30} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
