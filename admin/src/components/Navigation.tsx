// src/components/Navigation.tsx
import type { ReactNode } from 'react';
import Sidebar from './sidebar/Sidebar';

interface NavigationProps {
  children?: ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}