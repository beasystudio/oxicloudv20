import { UserSubscription, CONTRACT_TYPES } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface UserSubscriptionTabProps {
  data: UserSubscription;
  onChange: (data: UserSubscription) => void;
  onSave: () => void;
}

export function UserSubscriptionTab({ data, onChange, onSave }: UserSubscriptionTabProps) {
  const handleChange = (field: keyof UserSubscription, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contractType">A-Spine Contract Type</Label>
          <Select 
            value={data.contractType} 
            onValueChange={(value: any) => handleChange("contractType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Account Status</Label>
          <div className="flex items-center h-10 px-3">
            <Badge variant={data.status === 'Active' ? 'default' : 'outline'}>
              {data.status}
            </Badge>
          </div>
        </div>

        {/* Work Email (Login) */}
        <div className="space-y-2">
          <Label htmlFor="loginEmail">Work Email (Login)</Label>
          <Input
            id="loginEmail"
            type="email"
            value={data.workEmail}
            onChange={(e) => handleChange("workEmail", e.target.value)}
            placeholder="user@company.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password (Demo)</Label>
          <Input
            id="password"
            type="text"
            value={data.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="demo123"
          />
          <p className="text-xs text-muted-foreground">
            Demo mode: password shown in plain text
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-muted p-4 space-y-2">
        <h4 className="font-medium">Subscription Notes</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Standard Users have basic access to the platform</li>
          <li>• Power Users/Admins have full administrative capabilities</li>
          <li>• Auto-activated accounts are immediately ready to use</li>
          <li>• Pending accounts require email activation</li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave}>Save Subscription Info</Button>
      </div>
    </div>
  );
}
