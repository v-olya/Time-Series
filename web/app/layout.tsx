import '../styles/global.css';

export const metadata = {
  title: 'Stats on raw materials for bakery products',
  description: 'Time series evaluation for dairy, eggs, and flour',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
