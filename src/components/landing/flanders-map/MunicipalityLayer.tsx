import { useState } from 'react';
import { motion } from 'framer-motion';
import { Municipality, geoToSvg, TooltipData, SVG_WIDTH, SVG_HEIGHT } from './types';

interface MunicipalityLayerProps {
  municipalities: Municipality[];
  isVisible: boolean;
  onHover: (data: TooltipData | null) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  onSelect?: (muni: Municipality | null) => void;
  selectedId?: string | null;
}

export const MunicipalityLayer = ({ municipalities, isVisible, onHover, svgRef, onSelect, selectedId }: MunicipalityLayerProps) => {
  const handleMouseEnter = (muni: Municipality) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pos = geoToSvg(muni.lat, muni.lng);
    onHover({
      type: 'municipalities',
      x: (pos.x / SVG_WIDTH) * rect.width + rect.left,
      y: (pos.y / SVG_HEIGHT) * rect.height + rect.top,
      data: muni,
    });
  };

  const handleClick = (e: React.MouseEvent, muni: Municipality) => {
    e.stopPropagation();
    onSelect?.(selectedId === muni.id ? null : muni);
  };

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {municipalities.map((muni, index) => {
        const pos = geoToSvg(muni.lat, muni.lng);
        const r = Math.max(14, Math.min(26, muni.projectCount * 2));
        const isSelected = selectedId === muni.id;

        return (
          <motion.g
            key={muni.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 0.5 + index * 0.06, duration: 0.6, type: "spring", stiffness: 200 }}
            onMouseEnter={() => handleMouseEnter(muni)}
            onMouseLeave={() => onHover(null)}
            onClick={(e: any) => handleClick(e, muni)}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx={pos.x} cy={pos.y} r={r}
              fill={isSelected ? "hsl(var(--primary) / 0.12)" : "hsl(var(--primary) / 0.06)"}
              stroke={isSelected ? "hsl(var(--primary) / 0.3)" : "hsl(var(--primary) / 0.12)"}
              strokeWidth="0.5"
              animate={isSelected ? { r: r * 1.15 } : { r }}
              whileHover={{ r: r * 1.2, fill: "hsl(var(--primary) / 0.1)", stroke: "hsl(var(--primary) / 0.25)" }}
              transition={{ duration: 0.3 }}
            />
            <circle cx={pos.x} cy={pos.y} r={r * 0.5} fill="hsl(var(--primary) / 0.08)" />
            <motion.circle
              cx={pos.x} cy={pos.y} r={4}
              fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2"
              animate={isSelected ? { r: 5.5 } : { r: 4 }}
              whileHover={{ r: 5.5 }}
              transition={{ duration: 0.2 }}
            />
            <motion.g initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1 + index * 0.06 }}>
              <circle cx={pos.x + 7} cy={pos.y - 7} r="5" fill="hsl(var(--foreground))" />
              <text x={pos.x + 7} y={pos.y - 4.5} textAnchor="middle" fill="hsl(var(--background))" fontSize="5" fontWeight="700" fontFamily="system-ui, sans-serif">
                {muni.projectCount}
              </text>
            </motion.g>
            <motion.text
              x={pos.x} y={pos.y + r + 10} textAnchor="middle"
              fill="hsl(var(--muted-foreground))" fontSize="6" fontWeight="500" fontFamily="system-ui, sans-serif"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: isSelected ? 0 : 0.65 } : { opacity: 0 }}
              transition={{ delay: 1.2 + index * 0.06 }}
            >
              {muni.name.replace('Gemeente ', '').replace('Stad ', '')}
            </motion.text>
          </motion.g>
        );
      })}
    </motion.g>
  );
};
