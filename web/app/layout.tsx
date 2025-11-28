import '../styles.css';

export const metadata = {
  title: 'Stats Dashboard',
  description: 'Time series dashboard for dairy, eggs, and flour',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
