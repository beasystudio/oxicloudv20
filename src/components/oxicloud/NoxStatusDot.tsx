import { getNoxDataByProjectId } from '@/lib/noxProjectStore';
import { STATUS_CONFIG, OxiCloudProjectStatus } from '@/types/oxicloud';
import { cn } from '@/lib/utils';

interface NoxStatusDotProps {
  projectId: string;
  className?: string;
}

// Map STATUS_CONFIG colors to actual tailwind-compatible colors
const DOT_COLORS: Record<OxiCloudProjectStatus, string> = {
  input_incomplete: 'bg-gray-400',
  input_completed: 'bg-blue-500',
  price_generated: 'bg-indigo-500',
  awaiting_payment: 'bg-orange-500',
  paid: 'bg-green-500',
  report_in_progress: 'bg-purple-500',
  report_delivered: 'bg-emerald-700',
};

export function NoxStatusDot({ projectId, className }: NoxStatusDotProps) {
  const noxData = getNoxDataByProjectId(projectId);
  
  if (!noxData) {
    // No NOx data - show gray outline dot
    return (
      <span
        className={cn(
          'inline-block w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/40',
          className
        )}
        title="NOx: Not started"
      />
    );
  }
  
  const color = DOT_COLORS[noxData.status];
  const label = STATUS_CONFIG[noxData.status]?.label || 'Unknown';
  
  return (
    <span
      className={cn(
        'inline-block w-2.5 h-2.5 rounded-full',
        color,
        className
      )}
      title={`NOx: ${label}`}
    />
  );
}
