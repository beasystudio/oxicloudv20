import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function OxiCloudSettings() {
  const [profileOpen, setProfileOpen] = useState(true);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const SectionHeader = ({ 
    title, 
    subtitle, 
    open, 
    onToggle 
  }: { 
    title: string; 
    subtitle: string; 
    open: boolean; 
    onToggle: () => void 
  }) => (
    <CollapsibleTrigger onClick={onToggle} className="w-full">
      <div className="flex items-center justify-between py-4 group">
        <div className="text-left">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} 
        />
      </div>
    </CollapsibleTrigger>
  );

  return (
    <div className="max-w-xl space-y-1">
      {/* Profile Settings */}
      <Collapsible open={profileOpen} onOpenChange={setProfileOpen} className="border-b">
        <SectionHeader 
          title="Profile" 
          subtitle="Your account information" 
          open={profileOpen}
          onToggle={() => setProfileOpen(!profileOpen)}
        />
        <CollapsibleContent className="pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm">First Name</Label>
              <Input id="firstName" placeholder="John" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm">Last Name</Label>
              <Input id="lastName" placeholder="Doe" className="h-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" type="email" placeholder="john@company.com" className="h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Phone</Label>
            <Input id="phone" type="tel" placeholder="+31 6 12345678" className="h-9" />
          </div>
          <Button size="sm" className="mt-2">Save Profile</Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Company Settings */}
      <Collapsible open={companyOpen} onOpenChange={setCompanyOpen} className="border-b">
        <SectionHeader 
          title="Company" 
          subtitle="Company information for invoicing" 
          open={companyOpen}
          onToggle={() => setCompanyOpen(!companyOpen)}
        />
        <CollapsibleContent className="pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm">Company Name</Label>
            <Input id="companyName" placeholder="Company B.V." className="h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber" className="text-sm">VAT Number</Label>
            <Input id="vatNumber" placeholder="NL123456789B01" className="h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm">Address</Label>
            <Input id="address" placeholder="Street 123, 1234 AB City" className="h-9" />
          </div>
          <Button size="sm" className="mt-2">Save Company</Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Notification Settings */}
      <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen} className="border-b">
        <SectionHeader 
          title="Notifications" 
          subtitle="How you receive updates" 
          open={notificationsOpen}
          onToggle={() => setNotificationsOpen(!notificationsOpen)}
        />
        <CollapsibleContent className="pb-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Report Completion</p>
              <p className="text-xs text-muted-foreground">Notify when reports are ready</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Payment Reminders</p>
              <p className="text-xs text-muted-foreground">Remind about pending payments</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Marketing Updates</p>
              <p className="text-xs text-muted-foreground">News and product updates</p>
            </div>
            <Switch />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Email Preferences */}
      <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
        <SectionHeader 
          title="Email Addresses" 
          subtitle="Where notifications are sent" 
          open={emailOpen}
          onToggle={() => setEmailOpen(!emailOpen)}
        />
        <CollapsibleContent className="pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingEmail" className="text-sm">Billing Email</Label>
            <Input id="billingEmail" type="email" placeholder="billing@company.com" className="h-9" />
            <p className="text-xs text-muted-foreground">Invoices will be sent here</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportEmail" className="text-sm">Report Delivery Email</Label>
            <Input id="reportEmail" type="email" placeholder="reports@company.com" className="h-9" />
            <p className="text-xs text-muted-foreground">Completed reports will be sent here</p>
          </div>
          <Button size="sm" className="mt-2">Save Email Preferences</Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
