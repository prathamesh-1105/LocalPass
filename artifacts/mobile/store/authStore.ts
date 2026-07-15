import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  hasSeenOnboarding: boolean;
  biometricsEnabled: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasSeenOnboarding: false,
      biometricsEnabled: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'railpass-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
