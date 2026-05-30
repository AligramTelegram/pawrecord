import { getDb, generateId } from './index';

export type ReminderType = 'food' | 'water' | 'medication' | 'custom';
export type ReminderDays = 'daily' | number[]; // daily veya [1..7] (1=Pzt, 7=Paz)

export interface Reminder {
  id: string;
  pet_id: string;
  type: ReminderType;
  label: string;
  hour: number;
  minute: number;
  days: string; // JSON string — 'daily' veya '[1,2,3,4,5]'
  enabled: number;
  notification_ids: string | null; // JSON string
  created_at: string;
}

export type CreateReminderInput = {
  pet_id: string;
  type: ReminderType;
  label: string;
  hour: number;
  minute: number;
  days: ReminderDays;
};

export async function getRemindersByPet(petId: string): Promise<Reminder[]> {
  const db = await getDb();
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE pet_id = ? ORDER BY hour ASC, minute ASC',
    [petId]
  );
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  const daysStr = input.days === 'daily' ? 'daily' : JSON.stringify(input.days);

  await db.runAsync(
    `INSERT INTO reminders (id, pet_id, type, label, hour, minute, days, enabled, notification_ids, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL, ?)`,
    [id, input.pet_id, input.type, input.label, input.hour, input.minute, daysStr, now]
  );
  return (await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]))!;
}

export async function updateReminderEnabled(id: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE reminders SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
}

export async function updateReminderNotificationIds(id: string, notifIds: string[]): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE reminders SET notification_ids = ? WHERE id = ?', [JSON.stringify(notifIds), id]);
}

export async function deleteReminder(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
}

export function parseDays(days: string): ReminderDays {
  if (days === 'daily') return 'daily';
  try { return JSON.parse(days) as number[]; } catch { return 'daily'; }
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
