import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function DarkModeWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      {children}
    </div>
  );
}

/** Wrapper that responds to the user's theme preference */
export function ThemeWrapper({ children, forceDark }: { children: ReactNode; forceDark?: boolean }) {
  const { theme } = useTheme();
  const isDark = forceDark || theme === 'dark';

  return (
    <div className={cn(isDark && 'dark', 'bg-background text-foreground min-h-screen')}>
      {children}
    </div>
  );
}
