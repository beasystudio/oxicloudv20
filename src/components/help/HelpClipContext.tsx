import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getClip, type HelpClip } from './helpClipsRegistry';

interface HelpClipContextValue {
  activeClip: HelpClip | null;
  openClip: (clipId: string) => void;
  closeClip: () => void;
  watchedIds: Set<string>;
  markWatched: (clipId: string) => void;
}

const HelpClipContext = createContext<HelpClipContextValue | null>(null);

const STORAGE_KEY = 'oxicloud_help_clips_watched_v1';

export function HelpClipProvider({ children }: { children: ReactNode }) {
  const [activeClip, setActiveClip] = useState<HelpClip | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWatchedIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const openClip = useCallback((clipId: string) => {
    const clip = getClip(clipId);
    if (clip) setActiveClip(clip);
  }, []);

  const closeClip = useCallback(() => setActiveClip(null), []);

  const markWatched = useCallback((clipId: string) => {
    setWatchedIds((prev) => {
      if (prev.has(clipId)) return prev;
      const next = new Set(prev);
      next.add(clipId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return (
    <HelpClipContext.Provider value={{ activeClip, openClip, closeClip, watchedIds, markWatched }}>
      {children}
    </HelpClipContext.Provider>
  );
}

export function useHelpClips() {
  const ctx = useContext(HelpClipContext);
  if (!ctx) throw new Error('useHelpClips must be used inside <HelpClipProvider>');
  return ctx;
}
