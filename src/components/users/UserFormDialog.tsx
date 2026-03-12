import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullUser } from "@/types/user";
import { UserGeneralTab } from "./tabs/UserGeneralTab";
import { UserConfidentialTab } from "./tabs/UserConfidentialTab";
import { UserSubscriptionTab } from "./tabs/UserSubscriptionTab";
import { UserCostPriceTab } from "./tabs/UserCostPriceTab";
import { UserAvailabilityTab } from "./tabs/UserAvailabilityTab";
import { createUser, updateUser } from "@/lib/mockUserDB";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";

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
    language: "EN",
    nationality: "",
    avatarUrl: null,
    company: "Demo Corp",
    myProjectsOnly: false,
    isEmployee: true,
    responsibleForHR: false,
    crmAccess: false,
    financialDashboardAccess: false,
    leaveDays: 20,
    extraLeaveDays: 0,
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
    startDate: null,
  },
  subscription: {
    contractType: "Standard User",
    workEmail: "",
    password: "demo123",
    status: "Active",
  },
  costRates: [],
  availability: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    breaks: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  isFormerEmployee: false,
  terminationDate: null,
});

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const { currentUser } = useMockAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<FullUser>(createEmptyUser());

  // Check if current user is a client role (not owner/admin)
  const isClientRole = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin' || currentUser?.role === 'client_user';

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData(createEmptyUser());
    }
    setActiveTab("general");
  }, [user, open]);

  const handleSave = () => {
    // Basic validation
    if (!formData.general.firstName || !formData.general.lastName || !formData.general.workEmail) {
      toast.error("Please fill in required fields: First Name, Last Name, and Work Email");
      setActiveTab("general");
      return;
    }

    try {
      if (user) {
        // Update existing user
        updateUser(user.id, formData);
        toast.success("User updated successfully");
      } else {
        // Create new user
        createUser(formData);
        toast.success("User created successfully");
      }
      onSaved();
    } catch (error) {
      toast.error("Failed to save user");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isClientRole ? "max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>

        {/* Simplified view for client roles - only General tab without avatar */}
        {isClientRole ? (
          <UserGeneralTab
            data={formData.general}
            onChange={(general) => setFormData({ ...formData, general })}
            onSave={handleSave}
            hideAvatar
          />
        ) : (
          /* Full tabs view for owner/admin */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="confidential">Confidential</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="cost">Cost Price</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <UserGeneralTab
                data={formData.general}
                onChange={(general) => setFormData({ ...formData, general })}
                onSave={handleSave}
              />
            </TabsContent>

            <TabsContent value="confidential">
              <UserConfidentialTab
                data={formData.confidential}
                onChange={(confidential) => setFormData({ ...formData, confidential })}
                onSave={handleSave}
              />
            </TabsContent>

            <TabsContent value="subscription">
              <UserSubscriptionTab
                data={formData.subscription}
                onChange={(subscription) => setFormData({ ...formData, subscription })}
                onSave={handleSave}
              />
            </TabsContent>

            <TabsContent value="cost">
              <UserCostPriceTab
                costRates={formData.costRates}
                onChange={(costRates) => setFormData({ ...formData, costRates })}
                onSave={handleSave}
              />
            </TabsContent>

            <TabsContent value="availability">
              <UserAvailabilityTab
                data={formData.availability}
                onChange={(availability) => setFormData({ ...formData, availability })}
                onSave={handleSave}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
