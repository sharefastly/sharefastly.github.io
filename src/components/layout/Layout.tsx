// Main Layout component

import { type ReactNode } from 'react';
import { FolderNavbar } from './FolderNavbar';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function Layout({ children, showNavbar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {showNavbar && <FolderNavbar />}
      <main>{children}</main>
    </div>
  );
}
