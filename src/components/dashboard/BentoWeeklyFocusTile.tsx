import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FocusItem {
  count: number;
  label: string;
  route?: string;
}

interface BentoWeeklyFocusTileProps {
  items: FocusItem[];
}

export function BentoWeeklyFocusTile({ items }: BentoWeeklyFocusTileProps) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="col-span-12 lg:col-span-5 rounded-3xl p-6 bg-primary text-primary-foreground min-h-[200px] flex flex-col justify-between relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border-[3px] border-primary-foreground/10 pointer-events-none" />
      <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border-[3px] border-primary-foreground/10 pointer-events-none" />

      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary-foreground/60 mb-4">
        Focus van deze week
      </p>

      <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-end">
        {items.map((item, i) => {
          const isClickable = !!item.route;
          const Wrapper = isClickable ? 'button' : 'div';
          return (
            <Wrapper
              key={i}
              {...(isClickable ? { onClick: () => navigate(item.route!) } : {})}
              className={cn(
                'flex items-center gap-4 w-full text-left rounded-2xl px-4 py-3 transition-colors',
                isClickable ? 'hover:bg-primary-foreground/10 cursor-pointer group' : ''
              )}
            >
              <span className="text-3xl font-bold tracking-tight w-10 text-right tabular-nums">
                {item.count}
              </span>
              <span className="text-sm text-primary-foreground/80 flex-1">{item.label}</span>
              {isClickable && (
                <ChevronRight className="h-4 w-4 text-primary-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
