import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Management & Enrollment System',
  description: 'Full-stack student enrollment and course management dashboard powered by Supabase PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
