import { useState } from "react";
import { FullUser } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";

interface FormerEmployeesListProps {
  users: FullUser[];
}

export function FormerEmployeesList({ users }: FormerEmployeesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.general.firstName.toLowerCase().includes(query) ||
      user.general.lastName.toLowerCase().includes(query) ||
      user.general.workEmail.toLowerCase().includes(query) ||
      (user.general.jobTitle || '').toLowerCase().includes(query)
    );
  });

  const handleReactivate = (user: FullUser) => {
    toast.success(`Reactivation request sent for ${user.general.firstName} ${user.general.lastName}`);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No former employees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="text-xs font-medium text-muted-foreground h-9">User</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9">License Type</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9">Termination date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9 text-right">Reactivate employee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id}
                className="group transition-all duration-200 relative rounded-lg hover:bg-muted/60"
              >
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.general.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(user.general.firstName, user.general.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm group-hover:text-foreground">
                        {user.general.firstName} {user.general.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground group-hover:text-foreground/70">
                        {user.general.jobTitle || 'No title'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {user.subscription.contractType === 'Power User/Admin' ? 'Standard User' : user.subscription.contractType}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {user.terminationDate ? format(new Date(user.terminationDate), 'dd - MM - yyyy') : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                    onClick={() => handleReactivate(user)}
                  >
                    Reactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                  No former employees match your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
