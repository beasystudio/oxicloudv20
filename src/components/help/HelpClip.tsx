import { HelpCircle, Check } from 'lucide-react';
import { useHelpClips } from './HelpClipContext';
import { getClip } from './helpClipsRegistry';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface HelpClipProps {
  clipId: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Inline help icon. Drop next to any field or section that maps to a clip.
 *
 *   <HelpClip clipId="raising-ground-level" />
 */
export function HelpClip({ clipId, className, size = 'sm' }: HelpClipProps) {
  const { openClip, watchedIds } = useHelpClips();
  const { language } = useLanguage();
  const clip = getClip(clipId);
  if (!clip) return null;

  const watched = watchedIds.has(clipId);
  const label = clip.title[language === 'nl' ? 'nl' : 'en'];
  const dim = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const box = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openClip(clipId); }}
            aria-label={`Help: ${label}`}
            className={cn(
              'inline-flex items-center justify-center rounded-full align-middle transition-all',
              box,
              watched
                ? 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'bg-foreground/5 text-muted-foreground hover:bg-foreground hover:text-background',
              className
            )}
          >
            {watched ? <Check className={dim} strokeWidth={2.75} /> : <HelpCircle className={dim} strokeWidth={2.25} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] px-3 py-2 rounded-lg">
          <p className="text-xs font-semibold leading-snug">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            {clip.durationSec}s · {language === 'nl' ? 'klik om af te spelen' : 'click to play'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
