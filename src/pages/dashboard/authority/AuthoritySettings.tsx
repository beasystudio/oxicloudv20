import { useState } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ChevronRight, Calendar, CheckCircle } from 'lucide-react';
import { useMockAuth } from '@/contexts/MockAuthContext';
const AuthoritySettings = () => {
  const {
    currentUser
  } = useMockAuth();
  const [activeTab, setActiveTab] = useState('subscription');

  // Mock subscription data
  const subscription = {
    plan: 'Authority Professional',
    billing: 'Annual',
    price: '€2,400/year',
    nextBilling: '2026-01-15',
    seats: {
      used: 4,
      total: 10
    }
  };

  // Mock team members - Koen is Power User (Admin), Els is Standard User
  const teamMembers = [{
    id: '1',
    name: 'Koen Van den Berg',
    email: 'koen@antwerpen.be',
    role: 'Power User',
    license: 'Power User/Admin',
    status: 'active'
  }, {
    id: '2',
    name: 'Els Peeters',
    email: 'els@antwerpen.be',
    role: 'Standard User',
    license: 'Standard User',
    status: 'active'
  }, {
    id: '3',
    name: 'Anna Martens',
    email: 'anna.martens@antwerpen.be',
    role: 'Standard User',
    license: 'Standard User',
    status: 'active'
  }, {
    id: '4',
    name: 'Thomas De Smedt',
    email: 'thomas.desmedt@antwerpen.be',
    role: 'Standard User',
    license: 'Standard User',
    status: 'pending'
  }];

  // Mock activity log
  const activityLog = [{
    id: '1',
    action: 'Project reviewed',
    user: 'Koen Van den Berg',
    timestamp: '2025-01-19 14:32'
  }, {
    id: '2',
    action: 'Report uploaded',
    user: 'Anna Martens',
    timestamp: '2025-01-19 11:15'
  }, {
    id: '3',
    action: 'User invited',
    user: 'Koen Van den Berg',
    timestamp: '2025-01-18 16:45'
  }, {
    id: '4',
    action: 'Subscription renewed',
    user: 'System',
    timestamp: '2025-01-15 00:00'
  }];
  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-6 py-8">
        

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="subscription" className="gap-2">
              
              Subscription
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Current Plan</CardTitle>
                  
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{subscription.plan}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.billing} billing</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-semibold">{subscription.price}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Billing</p>
                      <p className="text-lg font-semibold">{subscription.nextBilling}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">Update Payment</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Seats</CardTitle>
                  <CardDescription>Team size and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-foreground">{subscription.seats.used}</p>
                    <p className="text-sm text-muted-foreground">of {subscription.seats.total} seats used</p>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{
                    width: `${subscription.seats.used / subscription.seats.total * 100}%`
                  }} />
                  </div>

                  {subscription.seats.used >= subscription.seats.total * 0.8 && <p className="text-xs text-amber-600 text-center">
                      Running low on seats. Consider upgrading.
                    </p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <CardDescription>Manage user access and permissions</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    
                    Invite User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers.map(member => <div key={member.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={member.license === 'Power User/Admin' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-muted text-muted-foreground'}
                        >
                          {member.license}
                        </Badge>
                        {member.status === 'active' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Pending
                          </Badge>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Activity</CardTitle>
                <CardDescription>Recent actions and audit records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activityLog.map(log => <div key={log.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">by {log.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default AuthoritySettings;