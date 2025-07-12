import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/AppProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mutabaahly',
  description: 'Monitoring student progress in Al-Quran memorizing and Tilawati reciting',
  authors: [{ name: 'Lovable' }],
  openGraph: {
    title: 'Mutabaahly',
    description: 'Monitoring student progress in Al-Quran memorizing and Tilawati reciting',
    type: 'website',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovable_dev',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=SF+Pro+Text:wght@300;400;500;600&display=swap" />
      </head>
      <body className={inter.className}>
        <AppProviders>
          <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
} 