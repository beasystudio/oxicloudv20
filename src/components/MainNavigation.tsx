import { Link } from "react-router-dom";

import { Button } from './ui/button';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { User } from 'lucide-react';
export const MainNavigation = () => {
  const {
    currentUser,
    logout
  } = useMockAuth();
  return <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
          </div>
          <div className="flex items-center gap-3">
            {currentUser ? <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button onClick={() => logout()} variant="outline" size="sm">
                  Logout
                </Button>
              </> : <Button asChild size="sm">
                <Link to="/login" className="bg-primary-foreground text-secondary">Sign In</Link>
              </Button>}
          </div>
        </div>
      </div>
    </nav>;
};