import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Shield, Key, Settings, UserPlus, Building2, 
  Copy, CheckCircle, Trash2, Mail 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * License Manager Dashboard - ONLY for Paul & Christine (owner/admin)
 * 
 * FEATURES:
 * - Send Activation Email (mock)
 * - Add Admin (creates admin user with activation token)
 * - Create Client (creates client_owner with activation token)
 * - Copy Activation Link
 * - Delete users (with permission rules)
 * - List all users with Role Badge and Status Badge
 */
export default function LicenseManager() {
  const { currentUser, users, createAdmin, createClient, sendActivationEmail, deleteUser, canDelete } = useMockAuth();
  const { toast } = useToast();
  
  // Form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [lastToken, setLastToken] = useState<string | null>(null);
  
  // Dialog states
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const handleCreateAdmin = () => {
    if (!adminEmail || !adminName) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const result = createAdmin(adminEmail, adminName);
    if (result.success) {
      setLastToken(result.token || null);
      toast({
        title: "Admin Created (mock)",
        description: `${adminName} created. Copy the activation link below.`
      });
      setAdminEmail('');
      setAdminName('');
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleCreateClient = () => {
    if (!clientCompany || !clientEmail || !clientName) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const result = createClient(clientCompany, clientEmail, clientName);
    if (result.success) {
      setLastToken(result.token || null);
      toast({
        title: "Client Created (mock)",
        description: `${clientCompany} created with owner ${clientName}. Copy the activation link below.`
      });
      setClientCompany('');
      setClientEmail('');
      setClientName('');
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleSendActivation = (email: string) => {
    const result = sendActivationEmail(email);
    if (result.success) {
      setLastToken(result.token || null);
      toast({
        title: "Activation Email Sent (mock)",
        description: `Token generated for ${email}. Copy the activation link.`
      });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const copyActivationLink = (token: string) => {
    const link = `${window.location.origin}/activation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Activation link copied to clipboard"
    });
  };

  const handleDeleteUser = (email: string) => {
    if (!canDelete(email)) {
      toast({
        title: "Permission Denied",
        description: "You cannot delete this user",
        variant: "destructive"
      });
      return;
    }

    const result = deleteUser(email);
    if (result.success) {
      toast({ title: "User Deleted", description: `${email} has been removed` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.activated).length;
  const admins = users.filter(u => u.role === 'owner' || u.role === 'admin').length;
  const clients = users.filter(u => u.role === 'client_owner' || u.role === 'client_user').length;

  return (
    <>
      <Helmet>
        <title>License Manager - OxiCloud</title>
        <meta name="description" content="Manage licenses and users" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight">License Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {currentUser?.name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">{activeUsers} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">{totalUsers - activeUsers} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admins}</div>
                <p className="text-xs text-muted-foreground">Internal users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients}</div>
                <p className="text-xs text-muted-foreground">External users</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Admin</DialogTitle>
                  <DialogDescription>
                    Create a new admin user (e.g., Christine). They will need to activate their account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Name</Label>
                    <Input
                      id="adminName"
                      placeholder="Christine"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="christine@a-spine.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateAdmin} className="w-full">
                    Create Admin
                  </Button>
                  {lastToken && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Activation Token Generated:</div>
                      <code className="text-xs break-all">{lastToken}</code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => copyActivationLink(lastToken)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Activation Link
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Client</DialogTitle>
                  <DialogDescription>
                    Create a new client organization with an owner. They will need to activate their account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientCompany">Company Name</Label>
                    <Input
                      id="clientCompany"
                      placeholder="Demo Corp"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Owner Name</Label>
                    <Input
                      id="clientName"
                      placeholder="John Doe"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Owner Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="john@democorp.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateClient} className="w-full">
                    Create Client
                  </Button>
                  {lastToken && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Activation Token Generated:</div>
                      <code className="text-xs break-all">{lastToken}</code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => copyActivationLink(lastToken)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Activation Link
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user accounts, send activation emails, and control access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.name}</span>
                        <Badge variant={
                          user.role === 'owner' ? 'default' :
                          user.role === 'admin' ? 'secondary' :
                          user.role === 'client_owner' ? 'outline' : 'outline'
                        }>
                          {user.role}
                        </Badge>
                        {user.activated ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Pending</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email} • {user.company}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!user.activated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendActivation(user.email)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Send Activation
                        </Button>
                      )}
                      {user.activationToken && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyActivationLink(user.activationToken!)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.email)}
                        disabled={!canDelete(user.email)}
                        title={canDelete(user.email) ? 'Delete user' : 'Cannot delete (higher/same role)'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
