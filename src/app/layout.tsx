// src/app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Master Minds – The Learning Hub',
  description: 'Your one-stop destination for job notifications, mock tests, study materials, and education info.',
  keywords: 'education, mock tests, job notifications, study materials, government jobs',
  openGraph: {
    title: 'Master Minds – The Learning Hub',
    description: 'Empowering your career with the best learning resources.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        {/* Razorpay checkout script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-body bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'var(--font-body)' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
