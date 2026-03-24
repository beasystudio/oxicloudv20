import { motion } from 'framer-motion';
import { Project, geoToSvg, TooltipData, SVG_WIDTH, SVG_HEIGHT } from './types';

interface ProjectMarkersProps {
  projects: Project[];
  isVisible: boolean;
  onHover: (data: TooltipData | null) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  selectedId?: string | null;
  onSelect?: (project: Project | null) => void;
}

export const ProjectMarkers = ({ projects, isVisible, onHover, svgRef, selectedId, onSelect }: ProjectMarkersProps) => {
  const handleMouseEnter = (project: Project) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pos = geoToSvg(project.lat, project.lng);
    onHover({
      type: 'projects',
      x: (pos.x / SVG_WIDTH) * rect.width + rect.left,
      y: (pos.y / SVG_HEIGHT) * rect.height + rect.top,
      data: project,
    });
  };

  const handleClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    onSelect?.(selectedId === project.id ? null : project);
  };

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {projects.map((project, index) => {
        const pos = geoToSvg(project.lat, project.lng);
        const isActive = project.status === 'active';
        const isSelected = selectedId === project.id;
        const size = 5;

        return (
          <motion.g
            key={project.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 0.6 + index * 0.02, duration: 0.4, type: "spring" }}
            onMouseEnter={() => handleMouseEnter(project)}
            onMouseLeave={() => onHover(null)}
            onClick={(e: any) => handleClick(e, project)}
            style={{ cursor: 'pointer' }}
          >
            {isActive && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={size + 4}
                fill="none" stroke="hsl(var(--primary))" strokeWidth="1"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: [0.7, 0], scale: [1, 2.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: Math.random() * 2, ease: "easeOut" }}
              />
            )}
            <motion.circle
              cx={pos.x} cy={pos.y} r={size}
              fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.7)"}
              stroke={isSelected ? "hsl(var(--foreground))" : (isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)")}
              strokeWidth={isSelected ? 2 : 1}
              whileHover={{ scale: 1.4 }}
              transition={{ duration: 0.2 }}
            />
          </motion.g>
        );
      })}
    </motion.g>
  );
};
