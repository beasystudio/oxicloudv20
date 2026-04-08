import { useState } from "react";
import { UserAvailability, Break } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserAvailabilityTabProps {
  data: UserAvailability;
  onChange: (data: UserAvailability) => void;
  onSave: () => void;
}

export function UserAvailabilityTab({ data, onChange, onSave }: UserAvailabilityTabProps) {
  const [newBreak, setNewBreak] = useState({
    from: "12:00",
    to: "13:00",
    description: ""
  });

  const handleDayChange = (day: keyof Omit<UserAvailability, 'breaks'>, value: number) => {
    onChange({ ...data, [day]: value });
  };

  const handleAddBreak = () => {
    if (!newBreak.description.trim()) return;

    const breakItem: Break = {
      id: crypto.randomUUID(),
      from: newBreak.from,
      to: newBreak.to,
      description: newBreak.description
    };

    onChange({ ...data, breaks: [...data.breaks, breakItem] });
    setNewBreak({ from: "12:00", to: "13:00", description: "" });
  };

  const handleDeleteBreak = (id: string) => {
    onChange({ ...data, breaks: data.breaks.filter(b => b.id !== id) });
  };

  const totalWeeklyHours = 
    data.monday + data.tuesday + data.wednesday + data.thursday + data.friday;

  return (
    <div className="space-y-6">
      {/* Daily Working Hours */}
      <div className="space-y-4">
        <h4 className="font-medium">Daily Working Hours</h4>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monday">Monday</Label>
            <Input
              id="monday"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={data.monday}
              onChange={(e) => handleDayChange("monday", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tuesday">Tuesday</Label>
            <Input
              id="tuesday"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={data.tuesday}
              onChange={(e) => handleDayChange("tuesday", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wednesday">Wednesday</Label>
            <Input
              id="wednesday"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={data.wednesday}
              onChange={(e) => handleDayChange("wednesday", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thursday">Thursday</Label>
            <Input
              id="thursday"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={data.thursday}
              onChange={(e) => handleDayChange("thursday", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="friday">Friday</Label>
            <Input
              id="friday"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={data.friday}
              onChange={(e) => handleDayChange("friday", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">
            Total Weekly Hours: <span className="text-lg text-primary">{totalWeeklyHours}</span> hours
          </p>
        </div>
      </div>

      {/* Breaks */}
      <div className="space-y-4">
        <h4 className="font-medium">Break Setup</h4>
        
        {/* Add Break Form */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breakFrom">From</Label>
              <Input
                id="breakFrom"
                type="time"
                value={newBreak.from}
                onChange={(e) => setNewBreak({ ...newBreak, from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakTo">To</Label>
              <Input
                id="breakTo"
                type="time"
                value={newBreak.to}
                onChange={(e) => setNewBreak({ ...newBreak, to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDescription">Description</Label>
              <Input
                id="breakDescription"
                value={newBreak.description}
                onChange={(e) => setNewBreak({ ...newBreak, description: e.target.value })}
                placeholder="Lunch break"
              />
            </div>
          </div>

          <Button onClick={handleAddBreak} size="sm" disabled={!newBreak.description.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Break
          </Button>
        </div>

        {/* Breaks List */}
        {data.breaks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No breaks added yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.breaks.map((breakItem) => (
                  <TableRow key={breakItem.id}>
                    <TableCell>{breakItem.from}</TableCell>
                    <TableCell>{breakItem.to}</TableCell>
                    <TableCell>{breakItem.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBreak(breakItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave}>Save Availability</Button>
      </div>
    </div>
  );
}
