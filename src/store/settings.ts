import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  hasSeenOnboarding: boolean;
  loaded: boolean;
  notificationsEnabled: boolean;
  weightUnit: 'kg' | 'lbs';
  setHasSeenOnboarding: (val: boolean) => void;
  setNotificationsEnabled: (val: boolean) => void;
  setWeightUnit: (val: 'kg' | 'lbs') => void;
  loadSettings: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hasSeenOnboarding: false,
  loaded: false,
  notificationsEnabled: true,
  weightUnit: 'kg',

  loadSettings: async () => {
    const [onboarding, notif, unit] = await Promise.all([
      AsyncStorage.getItem('hasSeenOnboarding'),
      AsyncStorage.getItem('notificationsEnabled'),
      AsyncStorage.getItem('weightUnit'),
    ]);
    set({
      hasSeenOnboarding: onboarding === 'true',
      notificationsEnabled: notif !== 'false',
      weightUnit: unit === 'lbs' ? 'lbs' : 'kg',
      loaded: true,
    });
  },

  setHasSeenOnboarding: async (val: boolean) => {
    await AsyncStorage.setItem('hasSeenOnboarding', String(val));
    set({ hasSeenOnboarding: val });
  },

  setNotificationsEnabled: async (val: boolean) => {
    await AsyncStorage.setItem('notificationsEnabled', String(val));
    set({ notificationsEnabled: val });
  },

  setWeightUnit: async (val: 'kg' | 'lbs') => {
    await AsyncStorage.setItem('weightUnit', val);
    set({ weightUnit: val });
  },

  clearAllData: async () => {
    await AsyncStorage.clear();
    set({ hasSeenOnboarding: false, notificationsEnabled: true, weightUnit: 'kg' });
  },
}));
