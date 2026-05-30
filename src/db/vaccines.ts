import { getDb, generateId } from './index';

export interface Vaccine {
  id: string;
  pet_id: string;
  name: string;
  date_given: string;
  next_due?: string;
  vet_name?: string;
  batch_number?: string;
  notes?: string;
  reminder_enabled: number;
  created_at: string;
}

export type CreateVaccineInput = Omit<Vaccine, 'id' | 'created_at'>;

export async function getVaccinesByPet(petId: string): Promise<Vaccine[]> {
  const db = await getDb();
  return db.getAllAsync<Vaccine>(
    'SELECT * FROM vaccines WHERE pet_id = ? ORDER BY date_given DESC',
    [petId]
  );
}

export async function createVaccine(input: CreateVaccineInput): Promise<Vaccine> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO vaccines (id, pet_id, name, date_given, next_due, vet_name, batch_number, notes, reminder_enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.pet_id, input.name, input.date_given, input.next_due ?? null,
     input.vet_name ?? null, input.batch_number ?? null, input.notes ?? null,
     input.reminder_enabled, now]
  );
  const result = await db.getFirstAsync<Vaccine>('SELECT * FROM vaccines WHERE id = ?', [id]);
  return result!;
}

export async function updateVaccine(id: string, input: Partial<CreateVaccineInput>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input).map((k) => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE vaccines SET ${fields} WHERE id = ?`, [...Object.values(input), id]);
}

export async function deleteVaccine(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM vaccines WHERE id = ?', [id]);
}

export async function getUpcomingVaccines(daysAhead = 30): Promise<(Vaccine & { pet_name: string })[]> {
  const db = await getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  return db.getAllAsync<Vaccine & { pet_name: string }>(
    `SELECT v.*, p.name as pet_name FROM vaccines v
     JOIN pets p ON v.pet_id = p.id
     WHERE v.next_due IS NOT NULL AND v.next_due <= ? AND p.is_active = 1
     ORDER BY v.next_due ASC`,
    [cutoff.toISOString()]
  );
}
