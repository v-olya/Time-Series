import '../global.css';
import AppNav from './components/AppNav';

export const metadata = {
  title: 'Stats for bakery ingredients',
  description: 'Time series evaluation for dairy, eggs, and flour',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
