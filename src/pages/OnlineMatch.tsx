import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, errorMessage, sendAction } from '../lib/api.ts';
import { useProfile } from '../lib/profile.tsx';
import { hasPlayedThisTurn } from '../lib/matches.ts';
import { subscribeToMatch } from '../lib/realtime.ts';
import { fetchUsernames } from '../lib/rooms.ts';
import { describeEvents } from '../../shared/engine/log.js';
import type { Action, MatchRow, Seat } from '../../shared/types.js';
import { EventBus } from '../game/EventBus.ts';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { ActionMenu } from '../components/ActionMenu.tsx';

type UiState = 'loading' | 'choosing' | 'waiting' | 'animating' | 'finished';

const STATUS_TEXT: Record<UiState, string> = {
  loading: 'Chargement du duel…',
  choosing: 'À vous de jouer.',
  waiting: 'En attente de l’adversaire…',
  animating: 'Résolution du tour…',
  finished: 'Duel terminé.',
};

/**
 * Duel en ligne (US-19). Le serveur fait autorité : la page n'envoie que des actions
 * et affiche la ligne `matches` que le Realtime lui pousse (docs/04-MULTIJOUEUR.md §6).
 */
export function OnlineMatch() {
  const { matchId = '' } = useParams();
  const { profile } = useProfile();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [ui, setUi] = useState<UiState>('loading');
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState(false);

  const versionRef = useRef<number | null>(null);
  const pendingRef = useRef<MatchRow | null>(null);
  const matchRef = useRef<MatchRow | null>(null);
  const seatRef = useRef<Seat>(0);

  const seat: Seat = match && profile && match.player2_id === profile.id ? 1 : 0;

  /** La scène Phaser prévient quand elle est prête : on lui envoie l'état courant. */
  useEffect(() => {
    const onSceneReady = () => {
      if (matchRef.current) EventBus.emit('battle-init', { state: matchRef.current.state, playerSeat: seatRef.current });
    };
    EventBus.on('scene-ready', onSceneReady);
    return () => {
      EventBus.off('scene-ready', onSceneReady);
    };
  }, []);

  /** Fin d'animation : on applique l'état du tour résolu, puis on rouvre le menu. */
  useEffect(() => {
    const onEventsPlayed = () => {
      const row = pendingRef.current;
      pendingRef.current = null;
      if (!row) return;
      matchRef.current = row;
      setMatch(row);
      EventBus.emit('battle-update', row.state);
      setUi(row.phase === 'finished' ? 'finished' : 'choosing');
    };
    EventBus.on('events-played', onEventsPlayed);
    return () => {
      EventBus.off('events-played', onEventsPlayed);
    };
  }, []);

  useEffect(() => {
    if (!profile) return;

    const onRow = (row: MatchRow) => {
      const firstLoad = versionRef.current === null;
      if (!firstLoad && row.version <= versionRef.current!) return; // déjà traitée (Realtime + polling)
      versionRef.current = row.version;

      const mySeat: Seat = row.player2_id === profile.id ? 1 : 0;
      seatRef.current = mySeat;

      if (firstLoad) {
        // Reconnexion ou premier affichage : on montre l'état sans rejouer d'animation (US-21 CA1).
        matchRef.current = row;
        setMatch(row);
        EventBus.emit('battle-init', { state: row.state, playerSeat: mySeat });
        if (row.phase === 'finished') {
          setUi('finished');
          setLog(describeEvents(row.last_events, mySeat));
        } else {
          void hasPlayedThisTurn(row.id, row.round, row.turn).then((played) => setUi(played ? 'waiting' : 'choosing'));
        }
        return;
      }

      // Tour résolu par le serveur : les deux clients rejouent les mêmes événements (CA3).
      pendingRef.current = row;
      setLog(describeEvents(row.last_events, mySeat));
      setUi('animating');
      EventBus.emit('play-events', row.last_events);
    };

    const stop = subscribeToMatch(matchId, onRow);
    const timer = setTimeout(() => setMissing(true), 2500); // match inconnu ou interdit par la RLS
    return () => {
      stop();
      clearTimeout(timer);
      versionRef.current = null;
    };
  }, [matchId, profile]);

  const player1Id = match?.player1_id ?? null;
  const player2Id = match?.player2_id ?? null;
  useEffect(() => {
    if (!player1Id || !player2Id) return;
    void fetchUsernames([player1Id, player2Id]).then(setNames);
  }, [player1Id, player2Id]);

  const play = useCallback(
    async (action: Action) => {
      const row = matchRef.current;
      if (!row || ui !== 'choosing') return;
      setUi('waiting'); // dès le premier clic : un double-clic ne renvoie pas l'action (CA5)
      setError(null);
      try {
        await sendAction(row.id, row.round, row.turn, action);
      } catch (failure) {
        const code = failure instanceof ApiError ? failure.code : 'INTERNAL';
        // ALREADY_PLAYED et STALE_TURN : le serveur a déjà l'action ou le tour, le Realtime suivra.
        if (code === 'ALREADY_PLAYED' || code === 'STALE_TURN') return;
        setError(errorMessage(failure));
        setUi('choosing');
      }
    },
    [ui],
  );

  if (!match) {
    return (
      <main className="page centered-page">
        <section className="panel" aria-label="Duel">
          <p className="loading-line">{missing ? 'Cette partie est introuvable.' : 'Chargement du duel…'}</p>
          <Link to="/multi" className="button back-button">
            <span>Retour au multijoueur</span>
            <span className="button-arrow" aria-hidden="true">↩</span>
          </Link>
        </section>
      </main>
    );
  }

  const opponentId = seat === 0 ? match.player2_id : match.player1_id;
  const won = match.winner_id === profile?.id;

  return (
    <main className="page solo-page">
      <header className="run-header">
        <span className="run-wave">Tour {match.turn}</span>
        <span className="run-enemy">contre {names[opponentId] ?? '…'}</span>
      </header>

      <PhaserGame />

      {ui === 'finished' ? (
        <section className="run-over" aria-label="Fin du duel">
          <h2>{won ? 'Victoire !' : 'Défaite…'}</h2>
          <p>{won ? `Vous l’emportez contre ${names[opponentId] ?? 'votre adversaire'}.` : `${names[opponentId] ?? 'Votre adversaire'} remporte le duel.`}</p>
          <div className="run-over-actions">
            <Link to="/multi" className="button">
              <span>Nouveau duel</span>
              <span className="button-arrow" aria-hidden="true">⚔</span>
            </Link>
            <Link to="/menu" className="button">
              <span>Retour au menu</span>
              <span className="button-arrow" aria-hidden="true">↩</span>
            </Link>
          </div>
        </section>
      ) : (
        <>
          <p className="match-status" role="status">{STATUS_TEXT[ui]}</p>
          <ActionMenu state={match.state} seat={seat} busy={ui !== 'choosing'} onAction={play} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <ul className="battle-log" aria-live="polite">
            {log.slice(-4).map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
