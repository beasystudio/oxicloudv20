import { ReactNode } from 'react';

export function DarkModeWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      {children}
    </div>
  );
}
