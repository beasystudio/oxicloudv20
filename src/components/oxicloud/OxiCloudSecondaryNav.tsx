import { PillToggle } from '@/components/ui/pill-toggle';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

export type OxiCloudTab = 'invoice-payment' | 'settings' | 'dashboard' | 'engine' | 'forms' | 'pdf-template' | 'users';

interface OxiCloudSecondaryNavProps {
  activeTab: OxiCloudTab;
  onTabChange: (tab: OxiCloudTab) => void;
}

export function OxiCloudSecondaryNav({ activeTab, onTabChange }: OxiCloudSecondaryNavProps) {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const clientItems = [
    { id: 'dashboard', label: t('dashboard.nox.dashboard') },
    { id: 'invoice-payment', label: t('dashboard.nox.invoicePayment') },
  ];

  const adminItems = [
    { id: 'engine', label: t('dashboard.nox.calculationEngine') },
    { id: 'forms', label: t('dashboard.nox.forms') },
    { id: 'pdf-template', label: t('dashboard.nox.pdfTemplate') },
    ...(isOwner ? [{ id: 'users', label: t('dashboard.nox.users') }] : []),
  ];

  const items = isAdmin ? adminItems : clientItems;

  return (
    <PillToggle
      items={items}
      activeId={activeTab}
      onSelect={(id) => onTabChange(id as OxiCloudTab)}
      layoutId="oxiCloudSecondaryNav"
    />
  );
}
