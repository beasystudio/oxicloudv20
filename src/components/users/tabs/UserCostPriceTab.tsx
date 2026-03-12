import { useState } from "react";
import { CostRate } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserCostPriceTabProps {
  costRates: CostRate[];
  onChange: (costRates: CostRate[]) => void;
  onSave: () => void;
}

export function UserCostPriceTab({ costRates, onChange, onSave }: UserCostPriceTabProps) {
  const [newRate, setNewRate] = useState({
    costPerHour: 0,
    effectiveFrom: new Date()
  });

  const handleAddRate = () => {
    if (newRate.costPerHour <= 0) return;

    const rate: CostRate = {
      id: crypto.randomUUID(),
      costPerHour: newRate.costPerHour,
      effectiveFrom: newRate.effectiveFrom,
      createdAt: new Date()
    };

    onChange([...costRates, rate].sort((a, b) => 
      new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    ));

    setNewRate({ costPerHour: 0, effectiveFrom: new Date() });
  };

  const handleDeleteRate = (id: string) => {
    onChange(costRates.filter(rate => rate.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Add New Rate Form */}
      <div className="rounded-lg border p-4 space-y-4">
        <h4 className="font-medium">Add New Cost Rate</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Cost per Hour */}
          <div className="space-y-2">
            <Label htmlFor="costPerHour">Cost per Hour (EUR)</Label>
            <Input
              id="costPerHour"
              type="number"
              step="0.01"
              value={newRate.costPerHour || ''}
              onChange={(e) => setNewRate({ ...newRate, costPerHour: parseFloat(e.target.value) || 0 })}
              placeholder="75.00"
            />
          </div>

          {/* Effective From */}
          <div className="space-y-2">
            <Label>Effective From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(newRate.effectiveFrom, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newRate.effectiveFrom}
                  onSelect={(date) => date && setNewRate({ ...newRate, effectiveFrom: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button onClick={handleAddRate} size="sm" disabled={newRate.costPerHour <= 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rate to History
        </Button>
      </div>

      {/* Cost Rate History */}
      <div className="space-y-4">
        <h4 className="font-medium">Cost Rate History</h4>
        {costRates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No cost rates added yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cost per Hour (EUR)</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">€{rate.costPerHour.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(rate.effectiveFrom), "PPP")}</TableCell>
                    <TableCell>{format(new Date(rate.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRate(rate.id)}
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
        <Button onClick={onSave}>Save Cost Information</Button>
      </div>
    </div>
  );
}
