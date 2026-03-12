/**
 * Notification Store
 * Manages persistent notifications shown in the Bell icon
 */

export interface Notification {
  id: string;
  type: 'payment_success' | 'settlement_complete' | 'nox_complete' | 'general';
  title: string;
  message: string;
  projectName?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'oxicloud_notifications';

export function getNotifications(): Notification[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(newNotification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('notifications-updated'));
  
  return newNotification;
}

export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('notifications-updated'));
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('notifications-updated'));
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function clearAllNotifications(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('notifications-updated'));
}
