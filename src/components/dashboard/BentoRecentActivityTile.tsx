import { Activity } from 'lucide-react';

interface ActivityItem {
  icon: string;
  label: string;
  time: string;
}

interface BentoRecentActivityTileProps {
  activities: ActivityItem[];
}

export function BentoRecentActivityTile({ activities }: BentoRecentActivityTileProps) {
  if (activities.length === 0) return null;

  return (
    <div className="col-span-8 lg:col-span-5 rounded-3xl p-6 bg-background border border-border/40 flex flex-col">
      <div className="flex items-center gap-2.5 mb-5">
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recente Activiteit
        </h2>
      </div>

      <div className="space-y-4 flex-1">
        {activities.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-foreground">{item.label}</span>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-3">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
