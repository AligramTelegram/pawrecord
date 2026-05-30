import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder, parseDays, formatTime } from '../db/reminders';
import i18n from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') return true;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? k);
}

function getNotifContent(
  type: 'food' | 'water' | 'medication' | 'custom',
  petName: string,
  extra?: { label?: string; vaccine?: string; time?: string }
): { title: string; body: string } {
  const n = i18n.t('notif', { returnObjects: true, ns: 'common' }) as any;
  const vars: Record<string, string> = { name: petName, ...extra };

  if (type === 'custom') {
    return {
      title: fillTemplate(n.custom?.title ?? '⏰ {{name}}', vars),
      body: fillTemplate(n.custom?.body ?? '{{label}}', vars),
    };
  }

  const cfg = n[type];
  if (!cfg) return { title: `${petName}`, body: extra?.label ?? '' };

  return {
    title: fillTemplate(pick(cfg.titles), vars),
    body: fillTemplate(pick(cfg.bodies), vars),
  };
}

// Aşı hatırlatması — tek seferlik 7 gün önce
export async function scheduleVaccineReminder(
  petName: string,
  vaccineName: string,
  dueDate: Date,
  vaccineId: string
): Promise<string | null> {
  const granted = await requestPermissions();
  if (!granted) return null;

  const trigger = new Date(dueDate);
  trigger.setDate(trigger.getDate() - 7);
  trigger.setHours(9, 0, 0, 0);
  if (trigger < new Date()) return null;

  const n = i18n.t('notif.vaccine', { returnObjects: true, ns: 'common' }) as any;
  const vars = { name: petName, vaccine: vaccineName };

  return Notifications.scheduleNotificationAsync({
    content: {
      title: fillTemplate(n?.title ?? `💉 ${petName}`, vars),
      body: fillTemplate(n?.body ?? vaccineName, vars),
      data: { type: 'vaccine', vaccineId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

// Günlük / haftalık tekrarlayan hatırlatma
export async function scheduleRepeatingReminder(
  reminder: Reminder,
  petName: string
): Promise<string[]> {
  const granted = await requestPermissions();
  if (!granted) return [];

  const days = parseDays(reminder.days);
  const type = reminder.type as 'food' | 'water' | 'medication' | 'custom';
  const { title, body } = getNotifContent(type, petName, {
    label: reminder.label,
    time: formatTime(reminder.hour, reminder.minute),
  });

  const notifIds: string[] = [];

  if (days === 'daily') {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: 'reminder', reminderId: reminder.id }, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
    notifIds.push(id);
  } else {
    // Pazartesi=1..Pazar=7 → iOS weekday Pazar=1..Cumartesi=7
    const weekdayMap: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 1 };
    for (const day of days as number[]) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { type: 'reminder', reminderId: reminder.id }, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekdayMap[day] ?? 2,
          hour: reminder.hour,
          minute: reminder.minute,
        },
      });
      notifIds.push(id);
    }
  }

  return notifIds;
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllRemindersForPet(notifIds: string[]): Promise<void> {
  await Promise.all(notifIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
}
