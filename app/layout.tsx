import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'LabFlow QA',
  description: 'Lab operations dashboard for sample tracking, experiment documentation, and QC management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:pl-56">
            <div className="px-6 py-6 max-w-screen-xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
