import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { SVG_WIDTH, SVG_HEIGHT, MAP_BOUNDS } from './types';

const geoToSvg = (lng: number, lat: number): [number, number] => {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * SVG_WIDTH;
  const y = SVG_HEIGHT - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * SVG_HEIGHT;
  return [x, y];
};

const simplifyPath = (coords: number[][], tolerance: number = 0.003): number[][] => {
  if (coords.length <= 10) return coords;
  const result: number[][] = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = coords[i];
    const dist = Math.sqrt(Math.pow(curr[0] - prev[0], 2) + Math.pow(curr[1] - prev[1], 2));
    if (dist > tolerance) result.push(curr);
  }
  result.push(coords[coords.length - 1]);
  return result;
};

const polygonToPath = (coordinates: number[][][]): string => {
  return coordinates.map(ring => {
    const simplified = simplifyPath(ring);
    return simplified.map((coord, i) => {
      const [x, y] = geoToSvg(coord[0], coord[1]);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + ' Z';
  }).join(' ');
};

const FLANDERS_PROVINCES = [
  'Provincie Antwerpen',
  'Provincie Limburg',
  'Provincie Oost-Vlaanderen',
  'Provincie Vlaams-Brabant',
  'Provincie West-Vlaanderen',
];

interface FlandersRealMapProps {
  isInView: boolean;
  provincesData: any;
}

const getRingsFromGeometry = (geometry: any): number[][][] => {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon: number[][][]) => polygon);
  }
  return [];
};

const coordToKey = (coord: number[], precision = 4): string =>
  `${coord[0].toFixed(precision)},${coord[1].toFixed(precision)}`;

const parseCoordKey = (key: string): [number, number] => {
  const [lng, lat] = key.split(',').map(Number);
  return [lng, lat];
};

export const FlandersRealMap = ({ isInView, provincesData }: FlandersRealMapProps) => {
  const flandersFeatures = useMemo(() => {
    if (!provincesData?.features) return [];
    return provincesData.features.filter((feature: any) =>
      FLANDERS_PROVINCES.includes(feature.properties?.NameDUT)
    );
  }, [provincesData]);

  const flandersPaths = useMemo(() => {
    return flandersFeatures.map((feature: any) => {
      const geometry = feature.geometry;
      let path = '';

      if (geometry.type === 'Polygon') {
        path = polygonToPath(geometry.coordinates);
      } else if (geometry.type === 'MultiPolygon') {
        path = geometry.coordinates
          .map((poly: number[][][]) => polygonToPath(poly))
          .join(' ');
      }

      return { name: feature.properties.NameDUT, path };
    });
  }, [flandersFeatures]);

  const internalBordersPath = useMemo(() => {
    const segmentCounts = new Map<string, number>();

    flandersFeatures.forEach((feature: any) => {
      const geometry = feature.geometry;
      const rings = getRingsFromGeometry(geometry);
      const featureSegments = new Set<string>();

      rings.forEach((ring) => {
        if (!Array.isArray(ring) || ring.length < 2) return;

        for (let i = 0; i < ring.length - 1; i++) {
          const a = coordToKey(ring[i]);
          const b = coordToKey(ring[i + 1]);
          if (a === b) continue;
          featureSegments.add(a < b ? `${a}|${b}` : `${b}|${a}`);
        }

        const first = coordToKey(ring[0]);
        const last = coordToKey(ring[ring.length - 1]);
        if (first !== last) {
          featureSegments.add(first < last ? `${first}|${last}` : `${last}|${first}`);
        }
      });

      featureSegments.forEach((segmentKey) => {
        segmentCounts.set(segmentKey, (segmentCounts.get(segmentKey) ?? 0) + 1);
      });
    });

    return Array.from(segmentCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([segmentKey]) => {
        const [aKey, bKey] = segmentKey.split('|');
        const [aLng, aLat] = parseCoordKey(aKey);
        const [bLng, bLat] = parseCoordKey(bKey);
        const [ax, ay] = geoToSvg(aLng, aLat);
        const [bx, by] = geoToSvg(bLng, bLat);
        return `M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}`;
      })
      .join(' ');
  }, [flandersFeatures]);

  return (
    <g>
      <defs>
        <pattern id="dotMatrix" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="hsl(var(--secondary-foreground) / 0.3)" />
        </pattern>
      </defs>

      {/* Province fills */}
      {flandersPaths.map((province, index) => (
        <motion.path
          key={`fill-${province.name}`}
          d={province.path}
          fill="url(#dotMatrix)"
          stroke="none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
        />
      ))}

      {/* Internal province borders only (shared edges) */}
      <motion.path
        d={internalBordersPath}
        fill="none"
        stroke="hsl(var(--secondary-foreground) / 0.2)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.55 }}
      />
    </g>
  );
};
