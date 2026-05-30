import { getDb, generateId } from './index';

export interface VetVisit {
  id: string;
  pet_id: string;
  date: string;
  reason: string;
  vet_name?: string;
  clinic?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  currency: string;
  follow_up_date?: string;
  notes?: string;
  created_at: string;
}

export type CreateVisitInput = Omit<VetVisit, 'id' | 'created_at'>;

export async function getVisitsByPet(petId: string): Promise<VetVisit[]> {
  const db = await getDb();
  return db.getAllAsync<VetVisit>(
    'SELECT * FROM vet_visits WHERE pet_id = ? ORDER BY date DESC',
    [petId]
  );
}

export async function createVisit(input: CreateVisitInput): Promise<VetVisit> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO vet_visits (id, pet_id, date, reason, vet_name, clinic, diagnosis, treatment, cost, currency, follow_up_date, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.pet_id, input.date, input.reason, input.vet_name ?? null, input.clinic ?? null,
     input.diagnosis ?? null, input.treatment ?? null, input.cost ?? null,
     input.currency, input.follow_up_date ?? null, input.notes ?? null, now]
  );
  const result = await db.getFirstAsync<VetVisit>('SELECT * FROM vet_visits WHERE id = ?', [id]);
  return result!;
}

export async function updateVisit(id: string, input: Partial<CreateVisitInput>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input).map((k) => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE vet_visits SET ${fields} WHERE id = ?`, [...Object.values(input), id]);
}

export async function deleteVisit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM vet_visits WHERE id = ?', [id]);
}
