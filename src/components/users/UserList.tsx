import { useState } from "react";
import { FullUser } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Search, User, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

interface UserListProps {
  users: FullUser[];
  onEdit: (user: FullUser) => void;
  onDelete: () => void;
}

export function UserList({ users, onEdit }: UserListProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return user.general.firstName.toLowerCase().includes(query) || user.general.lastName.toLowerCase().includes(query) || user.general.workEmail.toLowerCase().includes(query) || (user.general.jobTitle || '').toLowerCase().includes(query);
  });

  const getLicenseVariant = (contractType: string) => {
    if (contractType === 'Power User/Admin' || contractType === 'Ultimate User') {
      return 'default';
    }
    return 'secondary';
  };

  const getKeyModules = (user: FullUser): string[] => {
    const modules: string[] = [];
    if (user.general.responsibleForHR) modules.push('Settings');
    if (user.general.crmAccess) modules.push('Financial Dashboard');
    return modules;
  };

  if (users.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">{t('settingsUsers.noEmployeesFound')}</p>
      </div>;
  }

  return <>
      <div className="relative w-64 mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder={t('settingsUsers.searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="text-xs font-medium text-muted-foreground h-9">{t('settingsUsers.employee')}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9">{t('settingsUsers.licenseType')}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9">{t('settingsUsers.myProjects')}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9">{t('settingsUsers.accessModules')}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground h-9 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            
              {filteredUsers.map(user => {
              const keyModules = getKeyModules(user);
              return <TableRow key={user.id} className="transition-all duration-200 group hover:scale-[1.01] hover:z-10">
                         <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={getAvatarUrl({ email: user.general.workEmail, id: user.id })} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {getInitials(user.general.firstName, user.general.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {user.general.firstName} {user.general.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.general.jobTitle || 'No title'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant={getLicenseVariant(user.subscription.contractType)} className="text-[10px] px-2 py-0.5">
                            {user.subscription.contractType === 'Power User/Admin' ? 'Power User' : user.subscription.contractType}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm">
                          {user.general.myProjectsOnly ? '✓' : '✕'}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {keyModules.map(module => <Badge key={module} variant="outline" className="text-[10px] px-1.5 py-0">
                                {module}
                              </Badge>)}
                            {keyModules.length === 0 && <span className="text-xs text-muted-foreground">{t('settingsUsers.standard')}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <button
                            onClick={() => onEdit(user)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title={t('settingsUsers.editEmployee') || 'Edit'}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>;
            })}
              {filteredUsers.length === 0 && <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                    {t('settingsUsers.noUsersMatch')}
                  </TableCell>
                </TableRow>}
            </TooltipProvider>
          </TableBody>
        </Table>
      </div>
    </>;
}
