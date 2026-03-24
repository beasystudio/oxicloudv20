import { motion, AnimatePresence } from 'framer-motion';
import { TooltipData, Natura2000Site, Project } from './types';

interface MapTooltipProps {
  data: TooltipData | null;
}

export const MapTooltip = ({ data }: MapTooltipProps) => {
  if (!data) return null;

  const renderContent = () => {
    switch (data.type) {
      case 'natura2000': {
        const site = data.data as Natura2000Site;
        return (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(142 71% 45% / 0.15)' }}>
                <span style={{ color: 'hsl(142 71% 45%)' }} className="text-sm">🌿</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{site.sitename}</p>
                <p className="text-xs text-muted-foreground">{site.sitetype === 'SPA' ? 'Bird Directive' : 'Habitat Directive'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{site.area_ha.toLocaleString()} ha</span>
              <span className="text-xs text-muted-foreground/50">•</span>
              <span className="text-xs text-muted-foreground font-mono">{site.sitecode}</span>
            </div>
          </>
        );
      }
      case 'projects': {
        const project = data.data as Project;
        return (
          <div>
            <p className="text-sm font-medium text-foreground">{project.address}</p>
          </div>
        );
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute z-50 pointer-events-none"
        style={{
          left: data.x,
          top: data.y - 10,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
          {renderContent()}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-background/95 border-r border-b border-border/50" />
      </motion.div>
    </AnimatePresence>
  );
};
