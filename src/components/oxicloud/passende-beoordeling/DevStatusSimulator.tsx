import { cn } from '@/lib/utils';
import { PB_STATUSES, PB_STATUS_CONFIG, type PBStatus } from './types';
import { Bug } from 'lucide-react';

interface DevStatusSimulatorProps {
  currentStatus: PBStatus;
  onStatusChange: (status: PBStatus) => void;
  edgeCases: {
    noResponse14Days: boolean;
    quoteExpired: boolean;
    slaMissed: boolean;
  };
  onToggleEdgeCase: (key: 'noResponse14Days' | 'quoteExpired' | 'slaMissed') => void;
}

export function DevStatusSimulator({
  currentStatus,
  onStatusChange,
  edgeCases,
  onToggleEdgeCase,
}: DevStatusSimulatorProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
        <Bug className="w-3.5 h-3.5" />
        Dev only — status simulator
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PB_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border',
              currentStatus === status
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:bg-muted'
            )}
          >
            {PB_STATUS_CONFIG[status].index}. {PB_STATUS_CONFIG[status].label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-amber-300/50">
        <span className="text-[10px] text-amber-600 font-medium self-center mr-1">Edge cases:</span>
        <EdgeToggle
          label="14d geen reactie"
          active={edgeCases.noResponse14Days}
          onClick={() => onToggleEdgeCase('noResponse14Days')}
        />
        <EdgeToggle
          label="Offerte verlopen"
          active={edgeCases.quoteExpired}
          onClick={() => onToggleEdgeCase('quoteExpired')}
        />
        <EdgeToggle
          label="SLA overschreden"
          active={edgeCases.slaMissed}
          onClick={() => onToggleEdgeCase('slaMissed')}
        />
      </div>
    </div>
  );
}

function EdgeToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 rounded text-[10px] font-medium border transition-colors',
        active
          ? 'bg-red-100 text-red-700 border-red-300'
          : 'bg-background text-muted-foreground border-border hover:bg-muted'
      )}
    >
      {label}
    </button>
  );
}
