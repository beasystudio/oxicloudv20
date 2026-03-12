import { OxiCloudProjectStatus, STATUS_CONFIG } from '@/types/oxicloud';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { getTranslatedStatusLabel } from '@/lib/statusLabels';

interface OxiCloudStatusBadgeProps {
  status: OxiCloudProjectStatus;
  className?: string;
}

export function OxiCloudStatusBadge({ status, className }: OxiCloudStatusBadgeProps) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white',
        config.color,
        className
      )}
    >
      {getTranslatedStatusLabel(status, t)}
    </span>
  );
}
