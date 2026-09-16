import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage, startMatch } from '../lib/api.ts';
import { useProfile } from '../lib/profile.tsx';
import { subscribeToRoom } from '../lib/realtime.ts';
import { fetchUsernames } from '../lib/rooms.ts';
import type { RoomRow } from '../../shared/types.js';

/**
 * Salon d'attente (US-16 et US-17). La ligne `rooms` est suivie en Realtime :
 * l'arrivée de l'invité et le lancement du duel s'affichent sans rafraîchir.
 */
export function Room() {
  const { roomId = '' } = useParams();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const stop = subscribeToRoom(roomId, (row) => {
      setRoom(row);
      setLoaded(true);
    });
    const timer = setTimeout(() => setLoaded(true), 2500); // salon introuvable ou interdit par la RLS
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [roomId]);

  const hostId = room?.host_id ?? null;
  const guestId = room?.guest_id ?? null;
  useEffect(() => {
    if (!hostId) return;
    void fetchUsernames([hostId, guestId]).then(setNames);
  }, [hostId, guestId]);

  // Les deux joueurs partent sur la page du match dès que l'hôte l'a lancé (US-19 CA1).
  useEffect(() => {
    if (room?.current_match_id) navigate(`/match/${room.current_match_id}`, { replace: true });
  }, [room?.current_match_id, navigate]);

  const copy = useCallback(async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copie impossible : note le code à la main.');
    }
  }, [room]);

  async function onStart() {
    if (!room || starting) return;
    setStarting(true);
    setError(null);
    try {
      const { matchId } = await startMatch(room.id);
      navigate(`/match/${matchId}`, { replace: true });
    } catch (failure) {
      setError(errorMessage(failure));
      setStarting(false);
    }
  }

  if (!room) {
    return (
      <main className="page centered-page">
        <section className="panel" aria-label="Salon">
          <p className="loading-line">{loaded ? 'Aucun salon avec ce code.' : 'Ouverture du salon…'}</p>
          <Link to="/multi" className="button back-button">
            <span>Retour au multijoueur</span>
            <span className="button-arrow" aria-hidden="true">↩</span>
          </Link>
        </section>
      </main>
    );
  }

  const isHost = profile?.id === room.host_id;
  const guestName = room.guest_id ? (names[room.guest_id] ?? '…') : null;

  return (
    <main className="page centered-page">
      <section className="panel room-panel" aria-label="Salon">
        <p className="eyebrow">Salon {isHost ? '· vous êtes l’hôte' : '· vous êtes l’invité'}</p>
        <h1>Code du salon</h1>
        <p className="room-code" aria-label="Code du salon">{room.code}</p>
        <button type="button" className="button" onClick={copy}>
          <span>{copied ? 'Code copié !' : 'Copier le code'}</span>
          <span className="button-arrow" aria-hidden="true">⧉</span>
        </button>

        <ul className="player-list" aria-label="Joueurs présents">
          <li>
            <span className="player-slot">Hôte</span>
            <span className="player-name">{names[room.host_id] ?? '…'}</span>
          </li>
          <li className={guestName ? '' : 'player-empty'}>
            <span className="player-slot">Invité</span>
            <span className="player-name">{guestName ?? 'En attente d’un joueur…'}</span>
          </li>
        </ul>

        {isHost ? (
          <button type="button" className="button" onClick={onStart} disabled={!room.guest_id || starting}>
            <span>{starting ? 'Lancement…' : 'Lancer le duel'}</span>
            <span className="button-arrow" aria-hidden="true">⚔</span>
          </button>
        ) : (
          <p className="menu-status"><span className="status-dot" /> En attente du lancement par l’hôte…</p>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <Link to="/multi" className="button back-button">
          <span>Quitter le salon</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
