import '../global.css';
import Link from 'next/link';

export const metadata = {
  title: 'Stats on raw materials for bakery products',
  description: 'Time series evaluation for dairy, eggs, and flour',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <header className="app-home">
          <Link href="/">
            <span className="badge-primary">Home</span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
