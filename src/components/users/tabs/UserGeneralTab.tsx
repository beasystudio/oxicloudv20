import { UserGeneral, LANGUAGES, COUNTRIES } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
interface UserGeneralTabProps {
  data: UserGeneral;
  onChange: (data: UserGeneral) => void;
  onSave: () => void;
  hideAvatar?: boolean;
}
export function UserGeneralTab({
  data,
  onChange,
  onSave,
  hideAvatar = false
}: UserGeneralTabProps) {
  const handleChange = (field: keyof UserGeneral, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };
  const getInitials = () => {
    if (!data.firstName && !data.lastName) return "??";
    return `${data.firstName[0] || ""}${data.lastName[0] || ""}`.toUpperCase();
  };
  return <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Avatar Upload - only show if not hidden */}
        {!hideAvatar && <div className="col-span-2 flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={data.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Avatar
            </Button>
          </div>}

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" value={data.firstName} onChange={e => handleChange("firstName", e.target.value)} placeholder="(voornaam)" />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" value={data.lastName} onChange={e => handleChange("lastName", e.target.value)} placeholder="(achternaam)" />
        </div>

        {/* Work Email */}
        <div className="space-y-2">
          <Label htmlFor="workEmail">Work Email *</Label>
          <Input id="workEmail" type="email" value={data.workEmail} onChange={e => handleChange("workEmail", e.target.value)} placeholder="(e-mailadres)" />
        </div>


        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={data.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="(telefoonnummer)" />
        </div>

        {/* GSM */}
        <div className="space-y-2">
          <Label htmlFor="gsm">GSM</Label>
          <Input id="gsm" value={data.gsm} onChange={e => handleChange("gsm", e.target.value)} placeholder="(gsm-nummer)" />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={data.language} onValueChange={(value: any) => handleChange("language", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Select value={data.nationality} onValueChange={value => handleChange("nationality", value)}>
            <SelectTrigger>
              <SelectValue placeholder="(selecteer)" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={data.company} onChange={e => handleChange("company", e.target.value)} placeholder="(bedrijfsnaam)" />
        </div>

        {/* Leave Days */}
        <div className="space-y-2">
          <Label htmlFor="leaveDays">Leave Days</Label>
          <Input id="leaveDays" type="number" value={data.leaveDays} onChange={e => handleChange("leaveDays", parseInt(e.target.value) || 0)} />
        </div>

        {/* Extra Leave Days */}
        <div className="space-y-2">
          <Label htmlFor="extraLeaveDays">Extra Leave Days</Label>
          <Input id="extraLeaveDays" type="number" value={data.extraLeaveDays} onChange={e => handleChange("extraLeaveDays", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="myProjectsOnly">My Projects Only</Label>
          <Switch id="myProjectsOnly" checked={data.myProjectsOnly} onCheckedChange={checked => handleChange("myProjectsOnly", checked)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="financialDashboardAccess">Financial Dashboard Access</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Allow access to the Financial Dashboard menu</p>
          </div>
          <Switch 
            id="financialDashboardAccess" 
            checked={data.financialDashboardAccess ?? false} 
            onCheckedChange={checked => handleChange("financialDashboardAccess", checked)} 
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave}>Save General Info</Button>
      </div>
    </div>;
}