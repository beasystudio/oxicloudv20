import { motion } from 'framer-motion';
import { MapLayer } from './types';

interface MapLegendProps {
  activeLayer: MapLayer;
}

export const MapLegend = ({ activeLayer }: MapLegendProps) => {
  const legends: Record<MapLayer, { color: string; label: string; dashed?: boolean }[]> = {
    natura2000: [
      { color: 'hsl(152 60% 42%)', label: 'SPA - Bird Directive' },
      { color: 'hsl(168 55% 38%)', label: 'SAC - Habitat Directive', dashed: true },
    ],
    projects: [
      { color: 'hsl(var(--primary))', label: 'Active Project' },
      { color: 'hsl(var(--muted-foreground) / 0.4)', label: 'Completed' },
    ],
  };

  return (
    <motion.div
      key={activeLayer}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="flex items-center gap-5"
    >
      {legends[activeLayer].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="flex items-center gap-2"
        >
          {activeLayer === 'natura2000' ? (
            <span className="relative w-4 h-2.5 rounded-sm overflow-hidden" style={{ border: `1px ${item.dashed ? 'dashed' : 'solid'} ${item.color}`, background: `${item.color}15` }}>
              <span className="absolute inset-0" style={{ background: `repeating-linear-gradient(${item.dashed ? '-30deg' : '45deg'}, transparent, transparent 1.5px, ${item.color}18 1.5px, ${item.color}18 3px)` }} />
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          )}
          <span className="text-[10px] tracking-wide text-muted-foreground font-medium">{item.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};
