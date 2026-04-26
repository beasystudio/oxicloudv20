import { cn } from '@/lib/utils';

type BannerVariant = 'grey' | 'amber' | 'blue' | 'green' | 'red';

interface StatusBannerProps {
  variant: BannerVariant;
  children: React.ReactNode;
}

// Monochrome banner — variant kept for API compatibility but visually unified.
export function StatusBanner({ variant, children }: StatusBannerProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground')}>
      {children}
    </div>
  );
}
