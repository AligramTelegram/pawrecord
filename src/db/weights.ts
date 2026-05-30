import { getDb, generateId } from './index';

export interface WeightLog {
  id: string;
  pet_id: string;
  weight_kg: number;
  date: string;
  notes?: string;
  created_at: string;
}

export type CreateWeightInput = Omit<WeightLog, 'id' | 'created_at'>;

export async function getWeightsByPet(petId: string): Promise<WeightLog[]> {
  const db = await getDb();
  return db.getAllAsync<WeightLog>(
    'SELECT * FROM weight_logs WHERE pet_id = ? ORDER BY date DESC',
    [petId]
  );
}

export async function createWeight(input: CreateWeightInput): Promise<WeightLog> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO weight_logs (id, pet_id, weight_kg, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, input.pet_id, input.weight_kg, input.date, input.notes ?? null, now]
  );
  const result = await db.getFirstAsync<WeightLog>('SELECT * FROM weight_logs WHERE id = ?', [id]);
  return result!;
}

export async function deleteWeight(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM weight_logs WHERE id = ?', [id]);
}
