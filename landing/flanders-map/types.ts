export interface Natura2000Site {
  sitecode: string;
  sitename: string;
  sitetype: string;
  area_ha: number;
  path: string;
}

export interface Project {
  id: string;
  address: string;
  lat: number;
  lng: number;
  status: 'active' | 'completed';
}

export type MapLayer = 'natura2000' | 'projects';

export interface TooltipData {
  type: MapLayer;
  x: number;
  y: number;
  data: Natura2000Site | Project;
}

// Flanders-only bounds with cos(lat) corrected aspect
export const MAP_BOUNDS = {
  minLat: 50.68,
  maxLat: 51.51,
  minLng: 2.53,
  maxLng: 5.95,
};

const COS_MID_LAT = Math.cos((51.1 * Math.PI) / 180);
const LNG_RANGE = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;
const LAT_RANGE = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;

export const SVG_HEIGHT = 380;
export const SVG_WIDTH = Math.round(SVG_HEIGHT * ((LNG_RANGE * COS_MID_LAT) / LAT_RANGE));

export const geoToSvg = (
  lat: number,
  lng: number,
  width: number = SVG_WIDTH,
  height: number = SVG_HEIGHT
): { x: number; y: number } => {
  const x = ((lng - MAP_BOUNDS.minLng) / LNG_RANGE) * width;
  const y = height - ((lat - MAP_BOUNDS.minLat) / LAT_RANGE) * height;
  return { x, y };
};
