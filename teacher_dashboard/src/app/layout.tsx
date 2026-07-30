import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Literacy App - Teacher & Admin Dashboard',
  description: 'Manage modules, students, and progress for the Literacy App.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
