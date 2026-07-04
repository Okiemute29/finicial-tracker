import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (value) => set({ isInitialized: value }),
}));
