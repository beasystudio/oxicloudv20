import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle2, Pause, Info } from 'lucide-react';

type BannerVariant = 'grey' | 'amber' | 'blue' | 'green' | 'red';

interface StatusBannerProps {
  variant: BannerVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BannerVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  grey: {
    bg: 'bg-muted/40',
    border: 'border-border',
    icon: <Pause className="w-4 h-4 text-muted-foreground flex-shrink-0" />,
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />,
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />,
  },
};

export function StatusBanner({ variant, children }: StatusBannerProps) {
  const styles = variantStyles[variant];
  return (
    <div className={cn('rounded-xl border px-4 py-3 flex items-start gap-3', styles.bg, styles.border)}>
      {styles.icon}
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
