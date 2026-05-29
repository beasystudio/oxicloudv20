import { useEffect, useRef, useState } from 'react';
import { X, Play, GripHorizontal, GripVertical } from 'lucide-react';
import { useHelpClips } from './HelpClipContext';
import { useLanguage } from '@/i18n/LanguageContext';

/**
 * Picture-in-picture style overlay player. Draggable, dismissible,
 * never blocks the underlying form. Renders nothing when no clip is active.
 */
export function HelpClipOverlay() {
  const { activeClip, closeClip, markWatched } = useHelpClips();
  const { language } = useLanguage();
  const [pos, setPos] = useState({ x: 24, y: 24 }); // bottom-right offset (px)
  const [size, setSize] = useState({ w: 360, h: 0 }); // h=0 means auto
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; baseW: number; baseH: number } | null>(null);

  useEffect(() => {
    if (activeClip) markWatched(activeClip.id);
  }, [activeClip, markWatched]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPos({
          x: Math.max(8, dragRef.current.baseX - dx),
          y: Math.max(8, dragRef.current.baseY - dy),
        });
      } else if (resizeRef.current) {
        // resize from bottom-left corner (since anchored to bottom-right)
        const dx = resizeRef.current.startX - e.clientX;
        const dy = e.clientY - resizeRef.current.startY;
        setSize({
          w: Math.min(900, Math.max(260, resizeRef.current.baseW + dx)),
          h: Math.min(800, Math.max(220, (resizeRef.current.baseH || 280) + dy)),
        });
      }
    }
    function onUp() { dragRef.current = null; resizeRef.current = null; }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!activeClip) return null;

  const t = activeClip.title[language === 'nl' ? 'nl' : 'en'];
  const d = activeClip.description[language === 'nl' ? 'nl' : 'en'];

  return (
    <div
      role="dialog"
      aria-label={t}
      className="fixed z-[200] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col backdrop-blur-md"
      style={{ right: pos.x, bottom: pos.y, width: size.w, height: size.h || undefined, backgroundColor: 'hsl(var(--card))' }}
    >
      {/* Drag handle / header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted cursor-grab active:cursor-grabbing select-none"
        onPointerDown={(e) => {
          dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground truncate">
            {language === 'nl' ? 'Help-clip' : 'Help clip'} · {activeClip.durationSec}s
          </span>
        </div>
        <button
          onClick={closeClip}
          className="rounded-md p-1 hover:bg-background text-muted-foreground hover:text-foreground transition"
          aria-label="Close help clip"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Video / placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/15 via-background to-accent/10 overflow-hidden shrink-0">
        {activeClip.videoUrl ? (
          <video
            src={activeClip.videoUrl}
            poster={activeClip.posterUrl}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <PlaceholderClip duration={activeClip.durationSec} />
        )}
      </div>

      {/* Caption */}
      <div className="px-4 py-3 flex-1 overflow-y-auto">
        <p className="text-sm font-semibold text-foreground leading-snug">{t}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d}</p>
      </div>

      {/* Resize handle (bottom-left corner since anchored bottom-right) */}
      <div
        role="separator"
        aria-label="Resize"
        onPointerDown={(e) => {
          e.stopPropagation();
          const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
          resizeRef.current = { startX: e.clientX, startY: e.clientY, baseW: rect.width, baseH: rect.height };
        }}
        className="absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize flex items-end justify-start text-muted-foreground/60 hover:text-foreground"
      >
        <GripVertical className="h-3 w-3 rotate-45" />
      </div>
    </div>
  );
}

function PlaceholderClip({ duration }: { duration: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      {/* animated rings */}
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <span className="absolute inset-2 rounded-full bg-primary/40" />
        <span className="absolute inset-0 flex items-center justify-center">
          <Play className="h-5 w-5 text-primary fill-primary" />
        </span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
        Clip preview · {duration}s
      </p>
      <p className="text-[10px] text-muted-foreground/70 px-6 text-center">
        Final video drops in here when produced
      </p>
    </div>
  );
}
