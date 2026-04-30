import React from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className={className ?? 'container mx-auto px-4 py-8'}>
        {children}
      </main>
      <footer className="border-t bg-slate-900 text-slate-400 text-center text-sm py-6 mt-12">
        <p>© 2026 MID — Medical Identity System. All rights reserved.</p>
        <p className="text-xs mt-1 text-slate-500">P-MID · D-MID · H-MID · Secure · Universal</p>
      </footer>
    </div>
  );
}
