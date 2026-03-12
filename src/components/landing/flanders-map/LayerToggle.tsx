import { motion } from 'framer-motion';
import { MapLayer } from './types';
import { cn } from '@/lib/utils';

interface LayerToggleProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

const layers: { id: MapLayer; label: string }[] = [
  { id: 'natura2000', label: 'Natura 2000' },
  { id: 'projects', label: 'Projects' },
  { id: 'municipalities', label: 'Municipalities' },
];

export const LayerToggle = ({ activeLayer, onLayerChange }: LayerToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-background/50 backdrop-blur-xl border border-border/50">
      {layers.map((layer) => (
        <motion.button
          key={layer.id}
          onClick={() => onLayerChange(layer.id)}
          className={cn(
            "relative px-4 py-2 rounded-full text-xs font-medium transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            activeLayer === layer.id
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeLayer === layer.id && (
            <motion.div
              layoutId="activeLayerBg"
              className="absolute inset-0 bg-primary rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{layer.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
