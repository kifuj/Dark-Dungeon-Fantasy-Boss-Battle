import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRoom, errorMessage, joinRoom } from '../lib/api.ts';
import { useProfile } from '../lib/profile.tsx';
import { normalizeRoomCode, ROOM_CODE_LENGTH } from '../../shared/engine/rooms.js';

/** Accueil du multijoueur (US-16 et US-17) : créer un salon ou en rejoindre un par code. */
export function Multiplayer() {
  const { profile } = useProfile();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const navigate = useNavigate();

  async function onCreate() {
    if (busy) return;
    setBusy('create');
    setError(null);
    try {
      const { roomId } = await createRoom();
      navigate(`/salon/${roomId}`);
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(null);
    }
  }

  async function onJoin(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy('join');
    setError(null);
    try {
      const { roomId } = await joinRoom(normalizeRoomCode(code));
      navigate(`/salon/${roomId}`);
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(null);
    }
  }

  return (
    <main className="page centered-page">
      <section className="panel" aria-label="Multijoueur">
        <p className="eyebrow">Duel en ligne</p>
        <h1>Multijoueur</h1>
        <p className="menu-status"><span className="status-dot" /> Connecté en tant que {profile?.username}</p>

        <button type="button" className="button" onClick={onCreate} disabled={busy !== null}>
          <span>{busy === 'create' ? 'Création…' : 'Créer un salon'}</span>
          <span className="button-arrow" aria-hidden="true">✦</span>
        </button>

        <form onSubmit={onJoin} className="login-form" aria-label="Rejoindre un salon">
          <label htmlFor="code">Code du salon</label>
          <input
            id="code"
            name="code"
            autoComplete="off"
            spellCheck={false}
            maxLength={ROOM_CODE_LENGTH + 2}
            className="code-input"
            value={code}
            onChange={(event) => setCode(normalizeRoomCode(event.target.value))}
            placeholder="K7P2QX"
          />
          <button type="submit" className="button" disabled={busy !== null || code.length === 0}>
            <span>{busy === 'join' ? 'Connexion…' : 'Rejoindre'}</span>
            <span className="button-arrow" aria-hidden="true">↗</span>
          </button>
        </form>

        {error && <p className="form-error" role="alert">{error}</p>}

        <Link to="/menu" className="button back-button" data-shortcut="back">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
