import { OxiCloudLanding } from '@/components/landing/OxiCloudLanding';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isPilotAccount } from '@/lib/pilotAccountUtils';

const Index = () => {
  const { currentUser } = useMockAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        navigate('/dashboard/lm');
      } else if (currentUser.role === 'authority' || currentUser.role === 'authority_standard') {
        navigate('/dashboard/authority');
      } else {
        // Client users: Pilot goes to Partner Home (onboarding), others to Client Dashboard
        const isPilot = isPilotAccount(currentUser.email);
        navigate(isPilot ? '/dashboard/partner' : '/dashboard/client/home');
      }
    }
  }, [currentUser, navigate]);

  return <OxiCloudLanding />;
};

export default Index;
