import './globals.css';
import type { Metadata } from 'next';
import { NavBar } from '../src/components/NavBar';
import { PageTransitions } from '../src/components/PageTransitions';
import { RootClientProviders } from '../src/components/RootClientProviders';

export const metadata: Metadata = {
  title: 'GoShada',
  description: 'Multivendor campus apparel marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display">
        <RootClientProviders>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              <div className="container px-4 md:px-6 py-6">
                <PageTransitions>
                  {children}
                </PageTransitions>
              </div>
            </main>
            <footer className="border-t">
              <div className="container py-6 text-sm text-gray-500">© {new Date().getFullYear()} GoShada</div>
            </footer>
          </div>
        </RootClientProviders>
      </body>
    </html>
  );
}
