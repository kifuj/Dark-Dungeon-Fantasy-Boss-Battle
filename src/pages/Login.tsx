import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/profile.tsx';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import { SessionFailure, USERNAME_MAX, USERNAME_MIN, signInWithUsername } from '../lib/session.ts';

const MESSAGES: Record<string, string> = {
  USERNAME_TAKEN: 'Ce pseudo est déjà utilisé.',
  INVALID_USERNAME: `Le pseudo doit faire entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères.`,
  INTERNAL: 'Connexion impossible, réessaie.',
};

/** Connexion par pseudo (US-15) : session anonyme Supabase + profil. */
export function Login() {
  const { profile, setProfile } = useProfile();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const target = (location.state as { from?: string } | null)?.from ?? '/multi';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setProfile(await signInWithUsername(username));
      navigate(target, { replace: true });
    } catch (failure) {
      setError(MESSAGES[failure instanceof SessionFailure ? failure.code : 'INTERNAL']);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page centered-page">
      <section className="panel login-panel" aria-label="Connexion">
        <p className="eyebrow">Avant d'entrer dans l'arène</p>
        <h1>Choisis ton pseudo</h1>
        {profile && <p className="menu-status"><span className="status-dot" /> Connecté en tant que {profile.username}</p>}
        {!isSupabaseConfigured && (
          <p className="form-error" role="alert">
            Supabase n'est pas configuré sur ce déploiement (variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY).
          </p>
        )}
        <form onSubmit={onSubmit} className="login-form">
          <label htmlFor="username">Pseudo</label>
          <input
            id="username"
            name="username"
            autoFocus
            autoComplete="off"
            maxLength={USERNAME_MAX}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ex. Mattéo"
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button" disabled={busy}>
            <span>{busy ? 'Connexion…' : 'Entrer'}</span>
            <span className="button-arrow" aria-hidden="true">↗</span>
          </button>
        </form>
        <Link to="/menu" className="button back-button" data-shortcut="back">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
