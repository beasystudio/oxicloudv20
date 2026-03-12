/**
 * Contacts Settings Module
 * Manages contact taxonomy
 * Only accessible by Client Admin (owner, admin, client_owner)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactTaxonomyTable } from "@/components/contacts/ContactTaxonomyTable";
import { Plus } from "lucide-react";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { isPilotAccount } from "@/lib/pilotAccountUtils";
import { OnboardingTooltip } from "@/components/onboarding/ModuleOnboardingTour";
import { useLanguage } from "@/i18n/LanguageContext";

export function SettingsContacts() {
  const navigate = useNavigate();
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [triggerAdd, setTriggerAdd] = useState(0);
  const isPilot = isPilotAccount(currentUser?.email);
  return <Card className="rounded-xl border border-border/50 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">{t('dashboard.settings.contactTypes')}</h3>
              <p className="text-xs text-muted-foreground">{t('dashboard.settings.contactTypesDesc')}</p>
            </div>
            <Button onClick={() => setTriggerAdd(prev => prev + 1)} size="sm" className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t('dashboard.settings.addType')}
            </Button>
          </div>
          <ContactTaxonomyTable triggerAdd={triggerAdd} />
        </div>
      </Card>;
}