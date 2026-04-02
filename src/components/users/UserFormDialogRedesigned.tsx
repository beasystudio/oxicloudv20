import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FullUser, LANGUAGES, COUNTRIES, CONTRACT_TYPES } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { createUser, updateUser } from "@/lib/mockUserDB";
import { getTaxonomyByContext } from "@/lib/mockContactDB";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: FullUser;
  onSaved: () => void;
}

const createEmptyUser = (): FullUser => ({
  id: crypto.randomUUID(),
  general: {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    workEmail: "",
    jobTitle: "",
    phone: "",
    gsm: "",
    language: "NL",
    nationality: "",
    avatarUrl: null,
    company: "",
    myProjectsOnly: false,
    isEmployee: true,
    responsibleForHR: false,
    crmAccess: false,
    financialDashboardAccess: false,
    leaveDays: 20,
    extraLeaveDays: 0
  },
  confidential: {
    street: "",
    number: "",
    bus: "",
    postalCode: "",
    city: "",
    country: "",
    idNumber: "",
    nationalNumber: "",
    personalEmail: "",
    personalPhone: "",
    birthdate: null,
    startDate: null
  },
  subscription: {
    contractType: "Standard User",
    workEmail: "",
    password: "",
    status: "Active"
  },
  costRates: [],
  availability: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    breaks: []
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  isFormerEmployee: false,
  terminationDate: null
});

type TabType = "profile" | "access";

export function UserFormDialogRedesigned({
  open,
  onOpenChange,
  user,
  onSaved
}: UserFormDialogProps) {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [formData, setFormData] = useState<FullUser>(createEmptyUser());

  const showSimplifiedView = currentUser?.role === 'client_user';
  const isOwnerUser = formData.general.workEmail === 'jan@gdesign.be';

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData(createEmptyUser());
    }
    setActiveTab("profile");
  }, [user, open]);

  const handleGeneralChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, general: { ...prev.general, [field]: value } }));
  };
  const handleConfidentialChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, confidential: { ...prev.confidential, [field]: value } }));
  };
  const handleSubscriptionChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, subscription: { ...prev.subscription, [field]: value } }));
  };

  const handleSave = () => {
    if (!formData.general.firstName || !formData.general.lastName || !formData.general.workEmail) {
      toast.error(t('userForm.requiredFields'));
      setActiveTab("profile");
      return;
    }
    const updatedData = {
      ...formData,
      subscription: { ...formData.subscription, workEmail: formData.general.workEmail }
    };
    try {
      if (user) {
        updateUser(user.id, updatedData);
        toast.success(t('userForm.userUpdated'));
      } else {
        createUser(updatedData);
        toast.success(t('userForm.userCreated'));
      }
      onSaved();
    } catch (error) {
      toast.error(t('userForm.saveFailed'));
      console.error(error);
    }
  };

  const getInitials = () => {
    if (!formData.general.firstName && !formData.general.lastName) return "??";
    return `${formData.general.firstName[0] || ""}${formData.general.lastName[0] || ""}`.toUpperCase();
  };

  const tabs: {id: TabType; label: string;}[] = [
    { id: "profile", label: t('userForm.profile') },
    { id: "access", label: t('userForm.accessSubscription') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">
            {user ? t('userForm.editUser') : t('userForm.newUser')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('userForm.description')}
          </p>

          {!showSimplifiedView &&
          <div className="flex gap-1 mt-4">
              {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                activeTab === tab.id ?
                "bg-primary text-primary-foreground shadow-sm" :
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                  {tab.label}
                </button>
            )}
            </div>
          }
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-5">
            
            {/* TAB 1: PROFILE */}
            {activeTab === "profile" &&
            <>
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('userForm.identity')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.firstName')} *</Label>
                      <Input value={formData.general.firstName} onChange={(e) => handleGeneralChange("firstName", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.lastName')} *</Label>
                      <Input value={formData.general.lastName} onChange={(e) => handleGeneralChange("lastName", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.company')} *</Label>
                      <Input value={formData.general.company} readOnly className="bg-muted/50 cursor-not-allowed" />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('userForm.businessContact')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.workEmail')} *</Label>
                      <Input type="email" value={formData.general.workEmail} onChange={(e) => handleGeneralChange("workEmail", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.gsm')}</Label>
                      <Input value={formData.general.gsm} onChange={(e) => handleGeneralChange("gsm", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.phone')}</Label>
                      <Input value={formData.general.phone} onChange={(e) => handleGeneralChange("phone", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.nationality')}</Label>
                      <Select value={formData.general.nationality} onValueChange={(value) => handleGeneralChange("nationality", value)}>
                        <SelectTrigger><SelectValue placeholder={`(${t('userForm.select')})`} /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.language')}</Label>
                      <Select value={formData.general.language} onValueChange={(value: any) => handleGeneralChange("language", value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('userForm.profilePhoto')}</h4>
                  <div className="rounded-lg border-muted-foreground/25 p-5 border border-dotted">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={formData.general.avatarUrl || undefined} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" />{t('userForm.uploadPhoto')}</Button>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{t('userForm.photoFormats')}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            }



            {/* TAB 3: ACCESS & SUBSCRIPTION */}
            {activeTab === "access" &&
            <>
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('userForm.userType')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.typeOfUser')}</Label>
                      {isOwnerUser ? (
                        <Input value="Power User/Admin" readOnly className="bg-muted/50 cursor-not-allowed" />
                      ) : (
                        <Select value={formData.subscription.contractType} onValueChange={(value: any) => handleSubscriptionChange("contractType", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CONTRACT_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.loginEmail')}</Label>
                      <Input value={formData.general.workEmail} readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('userForm.password')}</Label>
                      <Input type="password" placeholder={t('userForm.setPassword')} value={formData.subscription.password} onChange={(e) => handleSubscriptionChange("password", e.target.value)} />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('userForm.permissions')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('userForm.myProjectsOnly')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('userForm.myProjectsOnlyDesc')}</p>
                      </div>
                      <Switch checked={formData.general.myProjectsOnly} onCheckedChange={(checked) => handleGeneralChange("myProjectsOnly", checked)} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('userForm.settingsAccess')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('userForm.settingsAccessDesc')}</p>
                      </div>
                      <Switch checked={isOwnerUser ? true : (formData.general.settingsAccess ?? false)} disabled={isOwnerUser} onCheckedChange={(checked) => handleGeneralChange("settingsAccess", checked)} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('userForm.financialAccess')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('userForm.financialAccessDesc')}</p>
                      </div>
                      <Switch checked={isOwnerUser ? true : (formData.general.financialDashboardAccess ?? false)} disabled={isOwnerUser} onCheckedChange={(checked) => handleGeneralChange("financialDashboardAccess", checked)} />
                    </div>
                  </div>
                </section>
              </>
            }
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('userForm.cancel')}</Button>
          <Button size="sm" onClick={handleSave}>{t('userForm.save')}</Button>
        </div>
      </DialogContent>
    </Dialog>);
}
