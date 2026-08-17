import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

// 1. Load the Inter font for high-readability typography
const inter = Inter({ subsets: ['latin'] });

// 2. Set website SEO metadata
export const metadata: Metadata = {
  title: 'OpenRoles | Tech Jobs & Real Salary Intelligence',
  description: 'Search open tech roles aggregated directly from top company career portals with verified salary data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col text-slate-900 antialiased`}>
        {/* Interactive Navbar with SVG Logo & Live Engine Status */}
        <Navbar />

        {/* Dynamic route views render inside main */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Engine Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p>© {new Date().getFullYear()} OpenRoles Engine. Real-time ATS Ingestion & Salary Intelligence.</p>
            <p className="text-[11px] text-slate-400">High-signal indexing across engineering, product, and infrastructure.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}