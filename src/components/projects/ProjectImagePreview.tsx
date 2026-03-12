import { useState } from 'react';
// Demo project renders - architectural visualizations
const DEMO_PROJECT_IMAGES: Record<string, string> = {
  'proj-gdesign-001': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&q=80',
  // Modern residential
  'proj-gdesign-002': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&q=80',
  // Office tower
  'proj-gdesign-003': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&q=80',
  // Villa renovation
  'proj-4takt-001': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop&q=80',
  // School campus
  'proj-empty-001': '' // Empty project - no image
};
interface ProjectImagePreviewProps {
  projectId: string;
  projectName?: string;
  className?: string;
}
export const ProjectImagePreview = ({
  projectId,
  projectName,
  className
}: ProjectImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = DEMO_PROJECT_IMAGES[projectId];
  if (!imageUrl || imageError) {
    return <div className={`aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/15 rounded-lg flex flex-col items-center justify-center text-muted-foreground ${className}`}>
        
        
      </div>;
  }
  return <div className={`aspect-[16/10] rounded-lg overflow-hidden ${className}`}>
      <img src={imageUrl} alt={`Render of ${projectName || 'project'}`} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onError={() => setImageError(true)} />
    </div>;
};