import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllPilotData, createPilotSession } from '@/lib/pilotSessionStore';

/**
 * Pilot Landing - Immediately redirects to registration form
 * This creates a new session and clears old data
 */
export default function PilotLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing pilot data for fresh start
    clearAllPilotData();
    
    // Create new pilot session
    createPilotSession();
    
    // Navigate to registration form
    navigate('/pilot-demo/register', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
