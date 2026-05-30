import { getDb, generateId } from './index';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  date_of_birth?: string;
  gender: 'male' | 'female' | 'unknown';
  color?: string;
  microchip_id?: string;
  photo_uri?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export type CreatePetInput = Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'is_active'>;

export async function getAllPets(): Promise<Pet[]> {
  const db = await getDb();
  return db.getAllAsync<Pet>(
    'SELECT * FROM pets WHERE is_active = 1 ORDER BY created_at DESC'
  );
}

export async function getPetById(id: string): Promise<Pet | null> {
  const db = await getDb();
  return db.getFirstAsync<Pet>('SELECT * FROM pets WHERE id = ?', [id]);
}

export async function createPet(input: CreatePetInput): Promise<Pet> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pets (id, name, species, breed, date_of_birth, gender, color, microchip_id, photo_uri, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [id, input.name, input.species, input.breed ?? null, input.date_of_birth ?? null,
     input.gender, input.color ?? null, input.microchip_id ?? null, input.photo_uri ?? null, now, now]
  );
  return (await getPetById(id))!;
}

export async function updatePet(id: string, input: Partial<CreatePetInput>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const fields = Object.keys(input)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(input), now, id];
  await db.runAsync(
    `UPDATE pets SET ${fields}, updated_at = ? WHERE id = ?`,
    values
  );
}

export async function deletePet(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE pets SET is_active = 0, updated_at = ? WHERE id = ?', [
    new Date().toISOString(), id,
  ]);
}
