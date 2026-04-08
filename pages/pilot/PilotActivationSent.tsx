import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { getPilotSession } from '@/lib/pilotSessionStore';

/**
 * PilotActivationSent - Confirmation that activation email was sent
 * In demo mode, user can click to simulate clicking the email link
 */
export default function PilotActivationSent() {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<any>(null);
  useEffect(() => {
    // Check session
    const session = getPilotSession();
    if (!session) {
      navigate('/pilot-demo');
      return;
    }

    // Load registration data from the new key
    const stored = sessionStorage.getItem('pilot_registration');
    if (stored) {
      setRegistrationData(JSON.parse(stored));
    }
  }, [navigate]);
  const handleContinue = () => {
    navigate('/pilot-demo/create-account');
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-border/50">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            We've sent a secure registration link to
          </p>
          {registrationData?.email && <p className="font-medium text-foreground">
              {registrationData.email}
            </p>}
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
          <div className="gap-3 flex items-end justify-start">
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-xs">
              Click the link in your email to continue registration
            </p>
          </div>
          <div className="gap-3 flex items-end justify-start">
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-xs">
              The link expires in 24 hours
            </p>
          </div>
          <div className="items-end justify-start flex gap-[12px]">
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-xs">
              Check spam folder if you don't see the email
            </p>
          </div>
        </div>

        {/* Demo mode: Simulate clicking email link */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-4">
            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Demo Mode
            </span>
          </p>
          <Button onClick={handleContinue} className="w-full h-11">
            Continue to Registration
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            In production, you would click the link in your email
          </p>
        </div>

        {/* Back to home */}
        <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to home
        </Link>
      </Card>
    </div>;
}