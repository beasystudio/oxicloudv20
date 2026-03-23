import { cn } from '@/lib/utils';

interface BentoStatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon?: React.ReactNode;
  accent?: boolean;
  variant?: 'default' | 'dark' | 'green';
}

export function BentoStatCard({ label, value, sub, icon, accent, variant = 'default' }: BentoStatCardProps) {
  const styles = {
    default: 'bg-background border border-border/50 text-foreground',
    dark: 'bg-secondary text-secondary-foreground border-0',
    green: 'bg-primary text-primary-foreground border-0',
  };

  return (
    <div className={cn(
      'rounded-3xl p-5 flex flex-col justify-between min-h-[110px]',
      styles[variant]
    )}>
      <p className={cn(
        'text-[10px] uppercase tracking-[0.14em] font-semibold',
        variant === 'default' ? 'text-muted-foreground' : variant === 'dark' ? 'text-secondary-foreground/50' : 'text-primary-foreground/70'
      )}>
        {label}
      </p>
      <div>
        <p className={cn(
          'text-3xl font-bold tracking-tight leading-none',
          accent && variant === 'default' && 'accent-value'
        )}>
          {value}
        </p>
        <p className={cn(
          'text-xs mt-1',
          variant === 'default' ? 'text-muted-foreground' : variant === 'dark' ? 'text-secondary-foreground/50' : 'text-primary-foreground/70'
        )}>
          {sub}
        </p>
      </div>
    </div>
  );
}
