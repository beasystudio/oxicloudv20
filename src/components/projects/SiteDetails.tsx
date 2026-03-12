import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Project } from '@/types/project';

interface SiteDetailsProps {
  project: Project;
}

export const SiteDetails = ({ project }: SiteDetailsProps) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !project.lat || !project.lng) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [project.lng, project.lat],
      zoom: 14,
    });

    new mapboxgl.Marker()
      .setLngLat([project.lng, project.lat])
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => { map.current?.remove(); };
  }, [project.lat, project.lng]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('siteDetails.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {project.address && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground">{t('siteDetails.address')}</div>
            <div className="text-sm">{project.address}</div>
          </div>
        )}
        {project.lat && project.lng ? (
          <div ref={mapContainer} className="w-full h-64 rounded-md" />
        ) : (
          <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
            {t('siteDetails.noLocation')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};