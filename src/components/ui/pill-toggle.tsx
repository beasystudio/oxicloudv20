import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PillToggleItem {
  id: string;
  label: string;
}

interface PillToggleProps {
  items: readonly PillToggleItem[];
  activeId: string;
  onSelect: (id: string) => void;
  layoutId?: string;
  className?: string;
}

export function PillToggle({ items, activeId, onSelect, layoutId = 'pillToggleBg', className }: PillToggleProps) {
  return (
    <div className={cn("inline-flex items-center gap-1 p-1 rounded-full bg-muted/60 border border-border/40", className)}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200",
            activeId === item.id
              ? "text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {activeId === item.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-foreground rounded-full shadow-sm"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
