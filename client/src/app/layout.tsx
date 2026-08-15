import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxStoreProvider } from '@/store/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkFlow - Enterprise Role-Based Access Control Platform',
  description: 'Production-style MERN RBAC application for enterprise workflow management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        <ReduxStoreProvider>{children}</ReduxStoreProvider>
      </body>
    </html>
  );
}
