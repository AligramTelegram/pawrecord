import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getString: async (key: string): Promise<string | null> => {
    try { return await AsyncStorage.getItem(key); } catch { return null; }
  },
  set: async (key: string, value: string): Promise<void> => {
    try { await AsyncStorage.setItem(key, value); } catch {}
  },
  getBoolean: async (key: string): Promise<boolean | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val === null) return null;
      return val === 'true';
    } catch { return null; }
  },
  setBoolean: async (key: string, value: boolean): Promise<void> => {
    try { await AsyncStorage.setItem(key, String(value)); } catch {}
  },
};
