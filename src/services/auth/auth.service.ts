import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

async function signInWithPassword(email: string, password: string): Promise<Session> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

async function signUpWithPassword(email: string, password: string): Promise<Session | null> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session;
}

async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

async function updatePassword(password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export const authService = {
  signInWithPassword,
  signUpWithPassword,
  requestPasswordReset,
  updatePassword,
  signOut,
  getSession,
  onAuthStateChange,
};
