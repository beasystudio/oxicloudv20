import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: () => void;
  icon: React.ReactNode;
  statusColor: string;
}

interface BentoActionTileProps {
  tasks: PendingTask[];
}

const colorMap: Record<string, { dot: string }> = {
  gray: { dot: 'bg-muted-foreground/50' },
  blue: { dot: 'bg-muted-foreground/70' },
  orange: { dot: 'bg-muted-foreground' },
  green: { dot: 'bg-primary' },
  purple: { dot: 'bg-muted-foreground/60' },
};

export function BentoActionTile({ tasks }: BentoActionTileProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="col-span-8 lg:col-span-9 rounded-3xl p-6 bg-background border border-border/40 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Actie vereist
        </h2>
        <Badge className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2.5 rounded-full border-0 h-6 min-w-[24px] flex items-center justify-center">
          {tasks.length}
        </Badge>
      </div>

      <div className="space-y-1 flex-1">
        {tasks.map((task) => {
          const colors = colorMap[task.statusColor] || colorMap.gray;
          return (
            <button
              key={task.id}
              onClick={task.action}
              className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 group rounded-2xl hover:bg-muted/60"
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
