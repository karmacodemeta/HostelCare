import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HostelCare - Premium Student Accommodation & Co-Living PG Finder',
  description: 'Find verified premium student housing, hostels, and co-living PGs in Noida and Patna. Book instantly with secure KYC verification and digitally signed lease agreements.',
  keywords: [
    'hostel booking', 'pg finder', 'student housing', 'co-living', 
    'Noida PG', 'Patna PG', 'rent room', 'hostel management system', 
    'HostelCare', 'Karma Code'
  ],
  authors: [{ name: 'Karma Code' }],
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'HostelCare - Premium Student Accommodation & Co-Living PG Finder',
    description: 'Find verified premium student housing, hostels, and co-living PGs in Noida and Patna. Book instantly with secure KYC verification.',
    url: 'http://localhost:3000',
    siteName: 'HostelCare',
    images: [
      {
        url: '/logo.svg',
        width: 800,
        height: 800,
        alt: 'HostelCare Brand Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HostelCare - Premium Student Accommodation & Co-Living PG Finder',
    description: 'Find verified premium student housing, hostels, and co-living PGs in Noida and Patna.',
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
