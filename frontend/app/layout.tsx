import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Commerce Platform',
  description: 'A modern e-commerce platform built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
