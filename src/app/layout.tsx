import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
      <body>
        <AppProviders>
          <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
              {children}
            </div>
          </ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
} 