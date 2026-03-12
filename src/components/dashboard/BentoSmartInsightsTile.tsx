import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  text: string;
  type: 'warning' | 'positive' | 'neutral';
}

interface BentoSmartInsightsTileProps {
  insights: Insight[];
}

const dotColor: Record<string, string> = {
  warning: 'bg-muted-foreground',
  positive: 'bg-primary',
  neutral: 'bg-muted-foreground/50',
};

export function BentoSmartInsightsTile({ insights }: BentoSmartInsightsTileProps) {
  if (insights.length === 0) return null;

  return (
    <div className="col-span-12 lg:col-span-7 rounded-2xl border border-border/40 p-6 bg-secondary">
      <div className="flex items-center gap-2.5 mb-4">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
          Smart Insights
        </h2>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', dotColor[insight.type])} />
            <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
