import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Crown, User } from 'lucide-react';

// Storage key for OxiCloud staff settings
const STAFF_SETTINGS_KEY = 'oxicloud_staff_settings';
interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  contractType: 'Standard User' | 'Power User/Admin';
  financialDashboardAccess: boolean;
}

// Initial OxiCloud staff data
const initialStaff: StaffMember[] = [{
  id: 'paul',
  name: 'Paul Gijsemans',
  email: 'paul@oxicloud.be',
  role: 'owner',
  contractType: 'Power User/Admin',
  financialDashboardAccess: true
}, {
  id: 'christine',
  name: 'Christine Duong',
  email: 'christine@oxicloud.be',
  role: 'admin',
  contractType: 'Power User/Admin',
  financialDashboardAccess: false
}];
const getStaffSettings = (): StaffMember[] => {
  const stored = localStorage.getItem(STAFF_SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default staff
  localStorage.setItem(STAFF_SETTINGS_KEY, JSON.stringify(initialStaff));
  return initialStaff;
};
const saveStaffSettings = (staff: StaffMember[]) => {
  localStorage.setItem(STAFF_SETTINGS_KEY, JSON.stringify(staff));
};
export function StaffManagement() {
  const {
    toast
  } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  useEffect(() => {
    loadStaff();
  }, []);
  const loadStaff = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setStaff(getStaffSettings());
      setIsLoading(false);
    }, 300);
  };
  const handleContractTypeChange = (staffId: string, contractType: 'Standard User' | 'Power User/Admin') => {
    setStaff(prev => prev.map(s => s.id === staffId ? {
      ...s,
      contractType
    } : s));
  };
  const handleFinancialAccessChange = (staffId: string, access: boolean) => {
    setStaff(prev => prev.map(s => s.id === staffId ? {
      ...s,
      financialDashboardAccess: access
    } : s));
  };
  const handleSave = async (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;
    setIsSaving(staffId);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    saveStaffSettings(staff);
    toast({
      title: "Settings Updated",
      description: `Permissions for ${member.name} have been updated.`
    });
    setIsSaving(null);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>;
  }
  return <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage access for your OxiCloud team</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {staff.map(member => <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{member.name}</p>
                      <Badge variant="outline" className={member.role === 'owner' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}>
                        {member.role === 'owner' ? 'Owner' : 'Admin'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-44">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select value={member.contractType} onValueChange={value => handleContractTypeChange(member.id, value as 'Standard User' | 'Power User/Admin')} disabled={member.role === 'owner'}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard User">Standard User</SelectItem>
                      <SelectItem value="Power User/Admin">Power User/Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5 w-40">
                  <Label className="text-xs text-muted-foreground">Financial Access</Label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch checked={member.financialDashboardAccess} onCheckedChange={checked => handleFinancialAccessChange(member.id, checked)} disabled={member.role === 'owner'} />
                    <span className="text-sm text-muted-foreground">
                      {member.financialDashboardAccess ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>)}
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-600">
              <strong>Note:</strong> Owner permissions cannot be modified. Owners always have full access to all features including the Financial Dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
}