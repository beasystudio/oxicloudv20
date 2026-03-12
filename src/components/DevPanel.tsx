import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { Copy, Terminal, Trash2, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedAllDemoData } from '@/lib/seedDemoData';

/**
 * DevPanel - Development helper panel for testing authentication flows
 * 
 * MANDATORY FEATURES:
 * - List all users with email, role, activated, activationPending, activationToken
 * - Copy Activation Link button
 * - Force Activate button (demo rescue)
 * - Delete User button (with permission rules)
 * - AUTO DEMO SETUP button
 * 
 * VISIBILITY:
 * - Shows "Quick Demo Setup" for non-logged-in users
 * - Shows full panel for logged-in owner/admin users
 * - Collapsed by default, expands on hover
 */
export const DevPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const {
    currentUser,
    users,
    forceActivate,
    deleteUser,
    canDelete,
    runDemoSetup
  } = useMockAuth();
  const {
    toast
  } = useToast();
  const isAdmin = currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin');
  const copyActivationLink = (token: string | null, email: string) => {
    if (!token) {
      toast({
        title: "No token",
        description: "This user doesn't have an activation token",
        variant: "destructive"
      });
      return;
    }
    const link = `${window.location.origin}/activation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: `Activation link for ${email} copied to clipboard`
    });
  };
  const handleForceActivate = (email: string) => {
    const result = forceActivate(email);
    if (result.success) {
      toast({
        title: "User activated!",
        description: `${email} has been force-activated with password: demo123`
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };
  const handleDelete = (email: string) => {
    if (!canDelete(email)) {
      toast({
        title: "Permission denied",
        description: "You cannot delete this user (higher or same role level)",
        variant: "destructive"
      });
      return;
    }
    const result = deleteUser(email);
    if (result.success) {
      toast({
        title: "User deleted",
        description: `${email} has been removed`
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };
  const handleDemoSetup = () => {
    runDemoSetup();
    seedAllDemoData(); // Seed all settings data as well
    toast({
      title: "Demo Ready!",
      description: "All users and settings created. Login with paul@a-spine.com or client@demo.com"
    });
  };
  const handleReset = () => {
    localStorage.removeItem('mockUsers');
    localStorage.removeItem('mockCurrentUser');
    localStorage.removeItem('mockApiLogs');
    window.location.reload();
  };

  // Show minimal setup button when not logged in as admin
  if (!isAdmin) {
    return <div className="fixed bottom-4 right-0 z-50 flex flex-col items-end gap-2 transition-all duration-300" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className={`flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%-40px)] opacity-90'}`}>
          <Button onClick={handleDemoSetup} size="lg" title="Click to create demo users and login credentials" className="shadow-lg rounded-l-lg rounded-r-none pr-4 bg-muted-foreground">
            <Zap className="mr-2 h-4 w-4" />
            <span className={`transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'}`}>
              Quick Demo Setup
            </span>
          </Button>
          {isHovered && <div className="text-xs text-center text-muted-foreground bg-background/95 p-2 rounded-l shadow mr-0 animate-fade-in">
              Creates demo users with password: <code className="bg-muted px-1">demo123</code>
            </div>}
        </div>
      </div>;
  }
  if (!isOpen) {
    return <div className="fixed bottom-4 right-0 z-50 transition-all duration-300" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Button onClick={() => setIsOpen(true)} className={`shadow-lg rounded-l-lg rounded-r-none transition-all duration-300 ${isHovered ? 'translate-x-0' : 'translate-x-[calc(100%-44px)]'}`} size="lg">
          <Terminal className="h-4 w-4 mr-2" />
          <span className={`transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            Dev Panel
          </span>
        </Button>
      </div>;
  }
  return <Card className="fixed bottom-4 right-4 z-50 w-[650px] max-h-[600px] overflow-auto shadow-2xl animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Dev Help Panel
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleDemoSetup} variant="default" size="sm">
            <Zap className="h-4 w-4 mr-1" />
            AUTO DEMO SETUP
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
          <strong>How to test activation:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Copy" to copy activation link</li>
            <li>Open link in new tab</li>
            <li>Set password and activate</li>
            <li>Login with the new credentials</li>
          </ol>
        </div>

        <div className="text-sm font-semibold">All Users ({users.length})</div>

        {users.map(user => <Card key={user.email} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{user.name}</span>
                  <Badge variant={user.role === 'owner' ? 'default' : user.role === 'admin' ? 'secondary' : user.role === 'authority' ? 'default' : 'outline'} className={user.role === 'authority' ? 'bg-blue-600' : ''}>
                    {user.role}
                  </Badge>
                  {user.activated ? <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge> : <Badge variant="destructive">Pending</Badge>}
                </div>
                <div className="flex gap-1">
                  {user.activationToken && <Button onClick={() => copyActivationLink(user.activationToken, user.email)} size="sm" variant="outline" title="Copy activation link">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>}
                  {!user.activated && <Button onClick={() => handleForceActivate(user.email)} size="sm" variant="secondary" title="Force activate with password: demo123">
                      Force Activate
                    </Button>}
                  <Button onClick={() => handleDelete(user.email)} size="sm" variant="destructive" disabled={!canDelete(user.email)} title={canDelete(user.email) ? 'Delete user' : 'Cannot delete (higher/same role)'}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Company:</strong> {user.company}</div>
                <div><strong>Activated:</strong> {user.activated ? 'Yes' : 'No'}</div>
                <div><strong>Pending:</strong> {user.activationPending ? 'Yes' : 'No'}</div>
                {user.activationToken && <div className="font-mono bg-muted p-1 rounded text-xs">
                    <strong>Token:</strong> {user.activationToken}
                  </div>}
                {user.password && <div className="text-green-600">
                    <strong>Password:</strong> {user.password}
                  </div>}
              </div>
            </div>
          </Card>)}
      </CardContent>
    </Card>;
};