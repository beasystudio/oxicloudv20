import type { OxiCloudProjectStatus } from '@/types/oxicloud';

const STATUS_KEY_MAP: Record<OxiCloudProjectStatus, string> = {
  input_incomplete: 'noxStatus.inputIncomplete',
  input_completed: 'noxStatus.inputCompleted',
  price_generated: 'noxStatus.priceGenerated',
  awaiting_payment: 'noxStatus.awaitingPayment',
  paid: 'noxStatus.paid',
  report_in_progress: 'noxStatus.reportInProgress',
  report_delivered: 'noxStatus.reportDelivered',
};

export function getTranslatedStatusLabel(status: OxiCloudProjectStatus, t: (key: string) => string): string {
  return t(STATUS_KEY_MAP[status]);
}
