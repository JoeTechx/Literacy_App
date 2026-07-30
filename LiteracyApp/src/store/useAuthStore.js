import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,

  // Called on login/register success — stores token in encrypted native keychain
  setAuth: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, user });
  },

  // Called on app boot — rehydrates token from keychain into memory
  rehydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return token; // caller uses this to validate with backend
    } catch {
      return null;
    }
  },

  // Called on logout — wipes keychain + memory
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));
