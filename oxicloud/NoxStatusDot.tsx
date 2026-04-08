import { getNoxDataByProjectId } from '@/lib/noxProjectStore';
import { STATUS_CONFIG, OxiCloudProjectStatus } from '@/types/oxicloud';
import { cn } from '@/lib/utils';

interface NoxStatusDotProps {
  projectId: string;
  className?: string;
}

// Dot colors aligned with STATUS_CONFIG display groups
const DOT_COLORS: Record<OxiCloudProjectStatus, string> = {
  input_incomplete: 'bg-gray-500',      // Draft
  input_completed: 'bg-gray-500',       // Draft
  price_generated: 'bg-blue-500',       // Quote Sent
  awaiting_payment: 'bg-blue-500',      // Quote Sent
  paid: 'bg-indigo-500',                // Signed
  report_in_progress: 'bg-amber-500',   // Report Held
  report_delivered: 'bg-emerald-600',   // Released
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
