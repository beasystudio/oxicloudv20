import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapLayer, TooltipData, SVG_WIDTH, SVG_HEIGHT, Project, geoToSvg } from './types';
import { projects } from './mockData';
import { FlandersRealMap } from './FlandersRealMap';
import { LayerToggle } from './LayerToggle';
import { MapTooltip } from './MapTooltip';
import { Natura2000Layer, Natura2000SiteWithCentroid } from './Natura2000Layer';
import { ProjectMarkers } from './ProjectMarkers';
import { MapLegend } from './MapLegend';

interface SelectedItem {
  label: string;
  sublabel: string;
  svgX: number;
  svgY: number;
}

export const FlandersInteractiveMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [activeLayer, setActiveLayer] = useState<MapLayer>('projects');
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [provincesData, setProvincesData] = useState<any>(null);
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedNaturaId, setSelectedNaturaId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/belgium-provinces.geojson')
      .then((res) => res.json())
      .then((data) => setProvincesData(data))
      .catch((err) => console.error('Failed to load provinces:', err));
  }, []);

  useEffect(() => {
    setSelected(null);
    setSelectedProjectId(null);
    setSelectedNaturaId(null);
  }, [activeLayer]);

  const handleSelectProject = useCallback((project: Project | null) => {
    if (!project) {
      setSelected(null);
      setSelectedProjectId(null);
      return;
    }
    const pos = geoToSvg(project.lat, project.lng);
    setSelectedProjectId(project.id);
    setSelected({
      label: project.address,
      sublabel: '',
      svgX: pos.x,
      svgY: pos.y,
    });
  }, []);

  const handleSelectNatura = useCallback((site: Natura2000SiteWithCentroid | null) => {
    if (!site) {
      setSelected(null);
      setSelectedNaturaId(null);
      return;
    }
    setSelectedNaturaId(site.sitecode);
    setSelected({
      label: site.sitename,
      sublabel: `${site.sitetype} · ${site.area_ha.toLocaleString()} ha`,
      svgX: site.centroid.x,
      svgY: site.centroid.y,
    });
  }, []);

  const getOverlayStyle = useCallback(() => {
    if (!selected || !svgRef.current || !containerRef.current) return null;
    const svgRect = svgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const xPct = selected.svgX / SVG_WIDTH;
    const yPct = selected.svgY / SVG_HEIGHT;
    return {
      left: svgRect.left - containerRect.left + xPct * svgRect.width,
      top: svgRect.top - containerRect.top + yPct * svgRect.height + 14,
      transform: 'translateX(-50%)',
    };
  }, [selected]);

  const overlayStyle = getOverlayStyle();

  return (
    <section id="flanders-map" className="py-24 md:py-32 px-6 bg-secondary overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary-foreground mb-4 text-balance">
            OxiCloud across Flanders
          </h2>
          <p className="text-secondary-foreground/60 max-w-xl mx-auto mb-8 text-balance">
            {projects.length} projects processed across the region
          </p>
          <div className="flex justify-center">
            <LayerToggle activeLayer={activeLayer} onLayerChange={setActiveLayer} />
          </div>
        </motion.div>

        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
          <motion.svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-auto relative z-10"
            preserveAspectRatio="xMidYMid meet"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            onClick={() => {
              setSelected(null);
              setSelectedProjectId(null);
              setSelectedNaturaId(null);
            }}
          >
            <FlandersRealMap isInView={isInView} provincesData={provincesData} />

            <Natura2000Layer
              isVisible={activeLayer === 'natura2000' && isInView}
              onHover={setTooltipData}
              svgRef={svgRef}
              selectedId={selectedNaturaId}
              onSelect={handleSelectNatura}
            />

            <ProjectMarkers
              projects={projects}
              isVisible={activeLayer === 'projects'}
              onHover={setTooltipData}
              svgRef={svgRef}
              selectedId={selectedProjectId}
              onSelect={handleSelectProject}
            />
          </motion.svg>

          <AnimatePresence>
            {selected && overlayStyle && (
              <motion.div
                key={selected.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 pointer-events-none"
                style={overlayStyle}
              >
                <div className="bg-foreground/90 backdrop-blur-sm text-background rounded-lg px-3 py-1.5 text-center shadow-lg max-w-[240px]">
                  <p className="text-sm font-semibold whitespace-nowrap truncate">{selected.label}</p>
                  {selected.sublabel && (
                    <p className="text-xs text-background/60 whitespace-nowrap">{selected.sublabel}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-4 px-1 max-w-5xl mx-auto">
          <MapLegend activeLayer={activeLayer} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="flex gap-4 text-xs text-secondary-foreground/50"
          >
            {activeLayer === 'natura2000' && (
              <span>Natura 2000 zones in Flanders</span>
            )}
            {activeLayer === 'projects' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {projects.filter((p) => p.status === 'active').length} active
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span>{projects.filter((p) => p.status === 'completed').length} completed</span>
              </>
            )}
          </motion.div>
        </div>

        <MapTooltip data={tooltipData} />
      </div>
    </section>
  );
};

export default FlandersInteractiveMap;
