import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SUIT AI v4.b',
  description: 'Vision & Measurement Service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
