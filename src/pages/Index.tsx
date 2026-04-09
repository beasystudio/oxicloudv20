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
      } else {
        const isPilot = isPilotAccount(currentUser.email);
        navigate(isPilot ? '/dashboard/partner' : '/dashboard/client/home');
      }
    }
  }, [currentUser, navigate]);

  return <OxiCloudLanding />;
};

export default Index;
