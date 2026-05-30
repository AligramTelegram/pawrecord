import { create } from 'zustand';
import {
  Pet,
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  CreatePetInput,
} from '../db/pets';
import { getRemindersByPet } from '../db/reminders';
import { cancelAllRemindersForPet } from '../services/notifications';

interface PetsState {
  pets: Pet[];
  loading: boolean;
  loadPets: () => Promise<void>;
  addPet: (input: CreatePetInput) => Promise<Pet>;
  editPet: (id: string, input: Partial<CreatePetInput>) => Promise<void>;
  removePet: (id: string) => Promise<void>;
}

export const usePetsStore = create<PetsState>((set, get) => ({
  pets: [],
  loading: false,

  loadPets: async () => {
    set({ loading: true });
    const pets = await getAllPets();
    set({ pets, loading: false });
  },

  addPet: async (input) => {
    const pet = await createPet(input);
    set({ pets: [pet, ...get().pets] });
    return pet;
  },

  editPet: async (id, input) => {
    await updatePet(id, input);
    await get().loadPets();
  },

  removePet: async (id) => {
    // Bildirim iptal et
    const reminders = await getRemindersByPet(id);
    for (const r of reminders) {
      if (r.notification_ids) {
        const ids = JSON.parse(r.notification_ids) as string[];
        await cancelAllRemindersForPet(ids);
      }
    }
    await deletePet(id);
    set({ pets: get().pets.filter((p) => p.id !== id) });
  },
}));
