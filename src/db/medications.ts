import { getDb, generateId } from './index';

export interface Medication {
  id: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  start_date: string;
  end_date?: string;
  times_per_day: number;
  reminder_times?: string;
  notes?: string;
  is_active: number;
  created_at: string;
}

export type CreateMedicationInput = Omit<Medication, 'id' | 'created_at'>;

export async function getMedicationsByPet(petId: string): Promise<Medication[]> {
  const db = await getDb();
  return db.getAllAsync<Medication>(
    'SELECT * FROM medications WHERE pet_id = ? ORDER BY created_at DESC',
    [petId]
  );
}

export async function createMedication(input: CreateMedicationInput): Promise<Medication> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO medications (id, pet_id, name, dosage, frequency, start_date, end_date, times_per_day, reminder_times, notes, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.pet_id, input.name, input.dosage, input.frequency, input.start_date,
     input.end_date ?? null, input.times_per_day, input.reminder_times ?? null,
     input.notes ?? null, input.is_active, now]
  );
  const result = await db.getFirstAsync<Medication>('SELECT * FROM medications WHERE id = ?', [id]);
  return result!;
}

export async function updateMedication(id: string, input: Partial<CreateMedicationInput>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input).map((k) => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE medications SET ${fields} WHERE id = ?`, [...Object.values(input), id]);
}

export async function deleteMedication(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
}
