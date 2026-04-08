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
    <div className={cn("inline-flex items-center gap-0.5 p-0.5 rounded-full bg-muted/20 border border-border/20", className)}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200",
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
