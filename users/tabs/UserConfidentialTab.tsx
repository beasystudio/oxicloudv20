import { UserConfidential, COUNTRIES } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserConfidentialTabProps {
  data: UserConfidential;
  onChange: (data: UserConfidential) => void;
  onSave: () => void;
}

export function UserConfidentialTab({ data, onChange, onSave }: UserConfidentialTabProps) {
  const handleChange = (field: keyof UserConfidential, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Street */}
        <div className="space-y-2">
          <Label htmlFor="street">Street</Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="Main Street"
          />
        </div>

        {/* Number */}
        <div className="space-y-2">
          <Label htmlFor="number">Number</Label>
          <Input
            id="number"
            value={data.number}
            onChange={(e) => handleChange("number", e.target.value)}
            placeholder="123"
          />
        </div>

        {/* Bus */}
        <div className="space-y-2">
          <Label htmlFor="bus">Bus</Label>
          <Input
            id="bus"
            value={data.bus}
            onChange={(e) => handleChange("bus", e.target.value)}
            placeholder="A"
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="1000"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Brussels"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={data.country} onValueChange={(value) => handleChange("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            value={data.idNumber}
            onChange={(e) => handleChange("idNumber", e.target.value)}
            placeholder="123456789"
          />
        </div>

        {/* National Number */}
        <div className="space-y-2">
          <Label htmlFor="nationalNumber">National Number</Label>
          <Input
            id="nationalNumber"
            value={data.nationalNumber}
            onChange={(e) => handleChange("nationalNumber", e.target.value)}
            placeholder="12.34.56-789.01"
          />
        </div>

        {/* Personal Email */}
        <div className="space-y-2">
          <Label htmlFor="personalEmail">Personal Email</Label>
          <Input
            id="personalEmail"
            type="email"
            value={data.personalEmail}
            onChange={(e) => handleChange("personalEmail", e.target.value)}
            placeholder="personal@email.com"
          />
        </div>

        {/* Personal Phone */}
        <div className="space-y-2">
          <Label htmlFor="personalPhone">Personal Phone</Label>
          <Input
            id="personalPhone"
            value={data.personalPhone}
            onChange={(e) => handleChange("personalPhone", e.target.value)}
            placeholder="+32 475 98 76 54"
          />
        </div>

        {/* Birthdate */}
        <div className="space-y-2">
          <Label>Birthdate</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.birthdate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.birthdate ? format(new Date(data.birthdate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.birthdate ? new Date(data.birthdate) : undefined}
                onSelect={(date) => handleChange("birthdate", date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave}>Save Confidential Info</Button>
      </div>
    </div>
  );
}
