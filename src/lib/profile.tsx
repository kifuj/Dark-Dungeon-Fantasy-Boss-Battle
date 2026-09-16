import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loadProfile } from './session.ts';
import type { ProfileRow } from '../../shared/types.js';

interface ProfileContextValue {
  profile: ProfileRow | null;
  /** Vrai tant que la session Supabase n'a pas été relue (US-15 CA3). */
  loading: boolean;
  setProfile: (profile: ProfileRow | null) => void;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await loadProfile());
    } catch {
      setProfile(null); // Supabase injoignable : on reste déconnecté, la page Login le dira
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ profile, loading, setProfile, refresh }), [profile, loading, refresh]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile doit être utilisé dans <ProfileProvider>');
  return value;
}

/** Garde de route : les pages multijoueur exigent un pseudo (US-15 CA1). */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile, loading } = useProfile();
  const location = useLocation();

  if (loading) return <main className="page centered-page"><p className="loading-line">Connexion…</p></main>;
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
