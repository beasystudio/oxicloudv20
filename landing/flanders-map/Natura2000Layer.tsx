import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';
import { Natura2000Site, TooltipData, SVG_WIDTH, SVG_HEIGHT, geoToSvg } from './types';

interface Natura2000LayerProps {
  isVisible: boolean;
  onHover: (data: TooltipData | null) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  selectedId?: string | null;
  onSelect?: (site: (Natura2000Site & { centroid: { x: number; y: number } }) | null) => void;
}

const geoToSvgCoord = (lng: number, lat: number): [number, number] => {
  const pos = geoToSvg(lat, lng);
  return [pos.x, pos.y];
};

const polygonToPath = (coordinates: number[][][]): string => {
  return coordinates.map(ring => {
    return ring.map((coord, i) => {
      const [x, y] = geoToSvgCoord(coord[0], coord[1]);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + ' Z';
  }).join(' ');
};

const getCentroid = (coordinates: number[][][]): [number, number] => {
  const ring = coordinates[0];
  let sumLng = 0, sumLat = 0;
  ring.forEach(c => { sumLng += c[0]; sumLat += c[1]; });
  return [sumLng / ring.length, sumLat / ring.length];
};

export type Natura2000SiteWithCentroid = Natura2000Site & { centroid: { x: number; y: number } };

export const Natura2000Layer = ({ isVisible, onHover, svgRef, selectedId, onSelect }: Natura2000LayerProps) => {
  const [geojson, setGeojson] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium-natura2000.geojson')
      .then(r => r.json())
      .then(setGeojson)
      .catch(console.error);
  }, []);

  const sites: Natura2000SiteWithCentroid[] = useMemo(() => {
    if (!geojson?.features) return [];
    return geojson.features.map((f: any) => {
      const geom = f.geometry;
      let path = '';
      let centroidCoord: [number, number];
      if (geom.type === 'Polygon') {
        path = polygonToPath(geom.coordinates);
        centroidCoord = getCentroid(geom.coordinates);
      } else if (geom.type === 'MultiPolygon') {
        path = geom.coordinates.map((poly: number[][][]) => polygonToPath(poly)).join(' ');
        centroidCoord = getCentroid(geom.coordinates[0]);
      } else {
        return null;
      }
      const [cx, cy] = geoToSvgCoord(centroidCoord[0], centroidCoord[1]);
      return {
        sitecode: f.properties.SITECODE,
        sitename: f.properties.SITENAME,
        sitetype: f.properties.SITETYPE,
        area_ha: f.properties.AREA_HA || 0,
        path,
        centroid: { x: cx, y: cy },
      };
    }).filter(Boolean);
  }, [geojson]);

  const handleMouseEnter = (site: Natura2000SiteWithCentroid) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    onHover({
      type: 'natura2000',
      x: (site.centroid.x / SVG_WIDTH) * rect.width + rect.left,
      y: (site.centroid.y / SVG_HEIGHT) * rect.height + rect.top,
      data: site,
    });
  };

  const handleClick = (e: React.MouseEvent, site: Natura2000SiteWithCentroid) => {
    e.stopPropagation();
    onSelect?.(selectedId === site.sitecode ? null : site);
  };

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <pattern id="spaHatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="hsl(152 60% 42% / 0.12)" strokeWidth="1" />
        </pattern>
        <pattern id="sacHatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(-30)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="hsl(168 55% 38% / 0.12)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {sites.map((site, index) => {
        const isSPA = site.sitetype === 'SPA';
        const hatchId = isSPA ? 'spaHatch' : 'sacHatch';
        const isSelected = selectedId === site.sitecode;

        return (
          <motion.g
            key={site.sitecode}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 + index * 0.07, duration: 0.5 }}
            onMouseEnter={() => handleMouseEnter(site)}
            onMouseLeave={() => onHover(null)}
            onClick={(e: any) => handleClick(e, site)}
            style={{ cursor: 'pointer' }}
          >
            <path d={site.path} fill={`url(#${hatchId})`} stroke="none" />
            <motion.path
              d={site.path}
              fill={isSelected
                ? (isSPA ? 'hsl(152 60% 42% / 0.22)' : 'hsl(168 55% 38% / 0.22)')
                : (isSPA ? 'hsl(152 60% 42% / 0.10)' : 'hsl(168 55% 38% / 0.10)')
              }
              stroke={isSelected
                ? (isSPA ? 'hsl(152 60% 42% / 0.6)' : 'hsl(168 55% 38% / 0.6)')
                : (isSPA ? 'hsl(152 60% 42% / 0.35)' : 'hsl(168 55% 38% / 0.35)')
              }
              strokeWidth={isSelected ? 1.1 : 0.7}
              strokeLinejoin="round"
              strokeDasharray={isSPA ? 'none' : '2 1.5'}
              whileHover={{
                fill: isSPA ? 'hsl(152 60% 42% / 0.22)' : 'hsl(168 55% 38% / 0.22)',
                stroke: isSPA ? 'hsl(152 60% 42% / 0.6)' : 'hsl(168 55% 38% / 0.6)',
                strokeWidth: 1.1,
              }}
              transition={{ duration: 0.2 }}
            />
            <circle
              cx={site.centroid.x} cy={site.centroid.y} r={2.5}
              fill={isSPA ? 'hsl(152 60% 42%)' : 'hsl(168 55% 38%)'} opacity={0.6}
            />
          </motion.g>
        );
      })}
    </motion.g>
  );
};
