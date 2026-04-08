import type { OxiCloudProjectStatus } from '@/types/oxicloud';

const STATUS_KEY_MAP: Record<OxiCloudProjectStatus, string> = {
  input_incomplete: 'noxStatus.draft',
  input_completed: 'noxStatus.draft',
  price_generated: 'noxStatus.quoteSent',
  awaiting_payment: 'noxStatus.quoteSent',
  paid: 'noxStatus.signed',
  report_in_progress: 'noxStatus.reportHeld',
  report_delivered: 'noxStatus.released',
};

export function getTranslatedStatusLabel(status: OxiCloudProjectStatus, t: (key: string) => string): string {
  return t(STATUS_KEY_MAP[status]);
}
