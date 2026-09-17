import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, claimTimeout, errorMessage, forfeitMatch, sendAction, sendDraft } from '../lib/api.ts';
import { useProfile } from '../lib/profile.tsx';
import { hasPlayedThisTurn } from '../lib/matches.ts';
import { subscribeToMatch } from '../lib/realtime.ts';
import { fetchUsernames } from '../lib/rooms.ts';
import { describeEvents } from '../../shared/engine/log.js';
import { isTurnExpired } from '../../shared/engine/online.js';
import type { Action, MatchRow, Seat } from '../../shared/types.js';
import { EventBus } from '../game/EventBus.ts';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { ANIMATION_TIMEOUT_MS } from '../game/timing.ts';
import { ActionMenu } from '../components/ActionMenu.tsx';
import { DraftPanel } from '../components/DraftPanel.tsx';

type UiState = 'loading' | 'choosing' | 'waiting' | 'animating' | 'finished';

/** Délai entre deux réclamations du timeout si le serveur répond TOO_EARLY (horloges décalées). */
const TIMEOUT_RETRY_MS = 3000;
/** En dessous, le compte à rebours passe en rouge. */
const TIMER_URGENT_S = 10;

const STATUS_TEXT: Record<UiState, string> = {
  loading: 'Chargement du duel…',
  choosing: 'À vous de jouer.',
  waiting: 'En attente de l’adversaire…',
  animating: 'Résolution du tour…',
  finished: 'Duel terminé.',
};

/**
 * Duel en ligne (US-18, US-19) : draft des équipes, puis combat. Le serveur fait autorité : la page n'envoie que des actions
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
  const [confirmingForfeit, setConfirmingForfeit] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const versionRef = useRef<number | null>(null);
  const pendingRef = useRef<MatchRow | null>(null);
  const matchRef = useRef<MatchRow | null>(null);
  const seatRef = useRef<Seat>(0);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutClaimRef = useRef<{ version: number; at: number } | null>(null);

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
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
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
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
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
      const wasDrafting = matchRef.current?.phase === 'draft';

      if (firstLoad) {
        // Reconnexion ou premier affichage : on montre l'état sans rejouer d'animation (US-21 CA1).
        matchRef.current = row;
        setMatch(row);
        EventBus.emit('battle-init', { state: row.state, playerSeat: mySeat });
        if (row.phase === 'finished') {
          setUi('finished');
          setLog(describeEvents(row.last_events, mySeat));
        } else {
          const phase = row.phase === 'draft' ? 'draft' : 'battle';
          void hasPlayedThisTurn(row.id, row.round, row.turn, phase).then((played) => setUi(played ? 'waiting' : 'choosing'));
        }
        return;
      }

      // Fin du draft (US-18 CA3) : rien à animer, la scène Phaser se monte avec les équipes.
      if (wasDrafting) {
        matchRef.current = row;
        setMatch(row);
        setLog(describeEvents(row.last_events, mySeat));
        setUi(row.phase === 'finished' ? 'finished' : 'choosing');
        return;
      }

      // Tour résolu par le serveur : les deux clients rejouent les mêmes événements (CA3).
      pendingRef.current = row;
      setLog(describeEvents(row.last_events, mySeat));
      setUi('animating');
      EventBus.emit('play-events', row.last_events);
      // Filet de sécurité : si la scène ne rend jamais la main (canvas en échec, onglet
      // en arrière-plan…), on applique quand même le tour — un duel ne doit pas se figer.
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => EventBus.emit('events-played'), ANIMATION_TIMEOUT_MS);
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

  const deadline = match?.turn_deadline ?? null;
  const counting = Boolean(deadline) && (ui === 'choosing' || ui === 'waiting');

  /** Compte à rebours du tour (US-20 CA1) : une horloge par seconde, seulement quand un choix est attendu. */
  useEffect(() => {
    if (!counting) return;
    const refresh = setTimeout(() => setNow(Date.now()), 0); // l'horloge a pu dormir depuis le tour précédent
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(refresh);
      clearInterval(tick);
    };
  }, [counting, deadline]);

  /**
   * Deadline dépassée (marge comprise) : on réclame le timeout au serveur, qui joue l'action par défaut
   * pour le joueur absent (US-20 CA2). Les deux clients peuvent le faire, la fonction est idempotente.
   */
  const expired = counting && isTurnExpired(deadline, now);
  useEffect(() => {
    const row = matchRef.current;
    if (!expired || !row || !isTurnExpired(row.turn_deadline, Date.now())) return;
    const last = timeoutClaimRef.current;
    if (last && last.version === row.version && now - last.at < TIMEOUT_RETRY_MS) return;
    timeoutClaimRef.current = { version: row.version, at: now };
    claimTimeout(row.id).catch(() => {
      // TOO_EARLY (horloge en avance) ou réseau : on réessaiera au prochain passage.
    });
  }, [expired, now]);

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

  const draft = useCallback(
    async (picks: number[]) => {
      const row = matchRef.current;
      if (!row || ui !== 'choosing') return;
      setUi('waiting');
      setError(null);
      try {
        await sendDraft(row.id, picks);
      } catch (failure) {
        const code = failure instanceof ApiError ? failure.code : 'INTERNAL';
        // Choix déjà reçu ou draft déjà terminé : le Realtime apportera la suite.
        if (code === 'ALREADY_PLAYED' || code === 'WRONG_PHASE') return;
        setError(errorMessage(failure));
        setUi('choosing');
      }
    },
    [ui],
  );

  async function forfeit() {
    const row = matchRef.current;
    if (!row) return;
    setConfirmingForfeit(false);
    setError(null);
    try {
      await forfeitMatch(row.id); // la fin de partie revient aux deux joueurs par le Realtime
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

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
  const forfeited = match.last_events.some((event) => event.type === 'forfeit'); // US-23 CA2
  const drafting = match.phase === 'draft';
  // Un abandon pendant le draft termine le match sans équipes : pas de scène à afficher.
  const hasTeams = match.state.players.every((player) => player.team.length > 0);
  const status = expired
    ? 'Temps écoulé : le tour se joue automatiquement…'
    : drafting && ui === 'waiting'
      ? 'Équipe validée. En attente du choix de l’adversaire…'
      : STATUS_TEXT[ui];
  const secondsLeft = deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : null;

  return (
    <main className="page solo-page">
      <header className="run-header">
        <span className="run-wave">{drafting ? 'Draft' : `Tour ${match.turn}`}</span>
        <span className="run-enemy">contre {names[opponentId] ?? '…'}</span>
      </header>

      {hasTeams && <PhaserGame />}

      {ui === 'finished' ? (
        <section className="run-over" aria-label="Fin du duel">
          <h2>{won ? (forfeited ? 'Victoire par abandon' : 'Victoire !') : 'Défaite…'}</h2>
          <p>
            {forfeited
              ? won
                ? `${names[opponentId] ?? 'Votre adversaire'} a abandonné le duel.`
                : 'Vous avez abandonné le duel.'
              : won
                ? `Vous l’emportez contre ${names[opponentId] ?? 'votre adversaire'}.`
                : `${names[opponentId] ?? 'Votre adversaire'} remporte le duel.`}
          </p>
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
          <p className="match-status" role="status">{status}</p>
          {counting && secondsLeft !== null && (
            <p className={`turn-timer ${secondsLeft <= TIMER_URGENT_S ? 'turn-timer-urgent' : ''}`} role="timer" aria-label="Temps restant">
              ⏳ {secondsLeft} s
            </p>
          )}
          {drafting ? (
            <DraftPanel offer={match.state.draftOffers?.[seat] ?? []} locked={ui !== 'choosing'} onConfirm={draft} />
          ) : (
            <ActionMenu state={match.state} seat={seat} busy={ui !== 'choosing'} onAction={play} />
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          {!drafting && (
            <ul className="battle-log" aria-live="polite">
              {log.slice(-4).map((line, i) => (
                <li key={`${line}-${i}`}>{line}</li>
              ))}
            </ul>
          )}
          {confirmingForfeit ? (
            <div className="forfeit-confirm" role="alertdialog" aria-label="Confirmer l’abandon">
              <p>Abandonner le duel ? Votre adversaire gagne la partie.</p>
              <div className="run-over-actions">
                <button type="button" className="button" onClick={forfeit}>
                  <span>Confirmer l’abandon</span>
                  <span className="button-arrow" aria-hidden="true">⚑</span>
                </button>
                <button type="button" className="button" onClick={() => setConfirmingForfeit(false)}>
                  <span>Continuer le duel</span>
                  <span className="button-arrow" aria-hidden="true">↩</span>
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="button forfeit-button" onClick={() => setConfirmingForfeit(true)}>
              <span>Abandonner</span>
              <span className="button-arrow" aria-hidden="true">⚑</span>
            </button>
          )}
        </>
      )}
    </main>
  );
}
