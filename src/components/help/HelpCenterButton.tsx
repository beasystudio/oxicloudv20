import { useState, useEffect } from 'react';
import { HelpCircle, Check, Play, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHelpClips } from './HelpClipContext';
import { HELP_CATEGORIES, HELP_CLIPS, type HelpClipCategory } from './helpClipsRegistry';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Browsable help center. Lives in the top nav. Lists every clip grouped
 * by sub-topic, with search and watched state.
 */
export function HelpCenterButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showHint, setShowHint] = useState(false);
  const { openClip, watchedIds } = useHelpClips();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';

  // Show a one-time discovery hint pointing at the help button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('oxicloud_help_hint_seen');
    if (seen) return;
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem('oxicloud_help_hint_seen', '1'); } catch {/* ignore */}
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && showHint) dismissHint();
  };

  const q = query.trim().toLowerCase();
  const filtered = HELP_CLIPS.filter((c) =>
    !q ||
    c.title[lang].toLowerCase().includes(q) ||
    c.description[lang].toLowerCase().includes(q)
  );

  const grouped = (Object.keys(HELP_CATEGORIES) as HelpClipCategory[])
    .map((cat) => ({ cat, clips: filtered.filter((c) => c.category === cat) }))
    .filter((g) => g.clips.length > 0);

  const watchedCount = watchedIds.size;
  const total = HELP_CLIPS.length;
  const unwatchedCount = total - watchedCount;
  const progress = Math.round((watchedCount / total) * 100);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Help center">
          <HelpCircle className="h-4 w-4" />
          {unwatchedCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-foreground ring-2 ring-background" />
          )}
          {showHint && (
            <>
              <span className="absolute inset-0 rounded-full ring-2 ring-foreground pointer-events-none" />
              <div
                role="tooltip"
                onClick={(e) => { e.stopPropagation(); dismissHint(); }}
                className="absolute top-full right-0 mt-2 inline-block w-fit max-w-[min(16rem,calc(100vw-2rem))] rounded-xl bg-foreground text-background shadow-xl px-3.5 py-2.5 text-left z-50 cursor-pointer"
              >
                <p className="text-[11px] font-semibold mb-0.5 leading-tight">
                  {lang === 'nl' ? 'Hulp nodig?' : 'Need help?'}
                </p>
                <p className="max-w-[13.5rem] text-[10px] leading-snug opacity-85 break-words hyphens-auto">
                  {lang === 'nl'
                    ? 'Klik hier voor korte uitlegvideo\u2019s.'
                    : 'Tap here for short how-to videos.'}
                </p>
                <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-foreground" />
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] p-0 max-h-[72vh] overflow-hidden flex flex-col rounded-2xl border-border shadow-xl"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-2">
             <div className="min-w-0">
               <div className="flex items-center gap-1.5">
                 <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                 <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-muted-foreground">
                  {lang === 'nl' ? 'Hulpcentrum' : 'Help center'}
                </p>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-foreground tracking-tight">
                {lang === 'nl' ? 'Korte video-antwoorden' : 'Short video answers'}
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {lang === 'nl'
                  ? 'Snelle uitleg per onderwerp.'
                  : 'Quick guidance by topic.'}
              </p>
            </div>
          </div>

          {/* Progress strip */}
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
              {watchedCount}/{total}
            </span>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'nl' ? 'Zoek een vraag...' : 'Search a question...'}
              className="h-8 pl-8 text-xs rounded-full bg-background border-border focus-visible:ring-1"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 py-1 bg-background">
          {grouped.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground text-center">
              {lang === 'nl' ? 'Geen resultaten.' : 'No matches.'}
            </p>
          )}
          {grouped.map(({ cat, clips }) => (
            <div key={cat} className="py-1.5">
              <p className="px-4 pt-1.5 pb-1.5 text-[9px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                {HELP_CATEGORIES[cat][lang]}
              </p>
              <div className="px-2">
                {clips.map((clip) => {
                  const watched = watchedIds.has(clip.id);
                  return (
                    <button
                      key={clip.id}
                      onClick={() => { openClip(clip.id); setOpen(false); }}
                      className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition text-left"
                    >
                      <div className={cn(
                        'shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition',
                        watched
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-foreground text-background group-hover:bg-secondary group-hover:text-secondary-foreground'
                      )}>
                        {watched
                          ? <Check className="h-4 w-4" strokeWidth={2.5} />
                          : <Play className="h-3 w-3 fill-current ml-0.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                          {clip.title[lang]}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          {clip.durationSec}s {watched && (lang === 'nl' ? '· bekeken' : '· watched')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
