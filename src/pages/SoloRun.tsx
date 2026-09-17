import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveTurn } from '../../shared/engine/battle.js';
import { chooseAiAction, chooseAiReplacement } from '../../shared/engine/ai.js';
import { grantKillLevels } from '../../shared/engine/level.js';
import { describeEvents } from '../../shared/engine/log.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import { needsReplacement, resolveReplacement } from '../../shared/engine/replace.js';
import { applyReward, drawRewards } from '../../shared/engine/rewards.js';
import { battleForWave, createRun, isBossWave, nextWave, type RunState } from '../../shared/engine/run.js';
import { runScore } from '../../shared/engine/score.js';
import type { RewardId } from '../../shared/data/rewards.js';
import type { Action, BattleState, MonsterInstance, TurnResult } from '../../shared/types.js';
import { EventBus } from '../game/EventBus.ts';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { ANIMATION_TIMEOUT_MS } from '../game/timing.ts';
import { saveSoloRun, type SaveRunResult } from '../lib/leaderboard.ts';
import { useBattleMusic } from '../lib/music.ts';
import { ActionMenu } from '../components/ActionMenu.tsx';
import { MusicToggle } from '../components/MusicToggle.tsx';
import { RewardPanel } from '../components/RewardPanel.tsx';
import { StarterSelect } from './StarterSelect.tsx';

/** Vague gagnée en attente du choix de la récompense (US-12). */
interface PendingReward {
  wonWave: number;
  /** Run de la vague suivante, déjà soignée de 20 %, avant la récompense. */
  next: RunState;
  choices: RewardId[];
}

/** Fin de run : vague atteinte, score (US-14) et état de son enregistrement. */
interface RunOver {
  wave: number;
  forfeited: boolean;
  score: number;
  save: SaveRunResult | 'saving';
}

const SAVE_MESSAGES: Record<RunOver['save'], string> = {
  saving: 'Enregistrement du score…',
  saved: 'Score enregistré dans le classement.',
  guest: 'Connecte-toi avec un pseudo pour enregistrer tes prochains scores.',
  error: 'Le score n’a pas pu être enregistré.',
};

/**
 * Mode solo (US-10, US-11, US-12, US-13) : choix du starter, puis vagues contre l'IA (un boss toutes les 5 vagues),
 * avec une récompense entre deux vagues. Quand un monstre tombe KO, le joueur choisit son remplaçant.
 * React garde l'état du combat ; Phaser ne fait que l'afficher (docs/02-ARCHITECTURE.md §5).
 */
export function SoloRun() {
  const [run, setRun] = useState<RunState | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<RunOver | null>(null);
  const [confirmingForfeit, setConfirmingForfeit] = useState(false);
  const [reward, setReward] = useState<PendingReward | null>(null);
  const battleRef = useRef<BattleState | null>(null);
  // Tour résolu en attente de la fin de l'animation Phaser (US-09) avant d'être appliqué à l'état React.
  const pendingRef = useRef<TurnResult | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Numéro de la run affichée : une réponse d'enregistrement arrivée après « Nouvelle run » est ignorée.
  const runIdRef = useRef(0);

  /** Termine la run et enregistre son score une seule fois (US-14 CA1). */
  const endRun = useCallback((wave: number, team: MonsterInstance[], forfeited: boolean) => {
    const runId = runIdRef.current;
    const score = runScore(wave, team);
    setOver({ wave, forfeited, score, save: 'saving' });
    void saveSoloRun(wave, score, team).then((save) => {
      if (runIdRef.current === runId) setOver((current) => current && { ...current, save });
    });
  }, []);

  // La scène prévient quand elle est prête : on lui envoie alors l'état courant.
  useEffect(() => {
    const onSceneReady = () => {
      if (battleRef.current) EventBus.emit('battle-init', { state: battleRef.current, playerSeat: 0 });
    };
    EventBus.on('scene-ready', onSceneReady);
    return () => {
      EventBus.off('scene-ready', onSceneReady);
    };
  }, []);

  useEffect(
    () => () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    battleRef.current = battle;
    if (battle) EventBus.emit('battle-update', battle);
  }, [battle]);

  useEffect(() => {
    if (run) EventBus.emit('battle-banner', isBossWave(run.wave) ? `Vague ${run.wave} · BOSS` : `Vague ${run.wave}`);
  }, [run]);

  // La scène prévient quand elle a fini de rejouer les événements du tour (US-09) : c'est
  // seulement là qu'on applique le nouvel état et qu'on enchaîne (vague suivante / défaite).
  useEffect(() => {
    const onEventsPlayed = () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
      const result = pendingRef.current;
      pendingRef.current = null;
      if (!result || !run) return;
      setBattle(result.state);
      if (result.winnerSeat === 0) {
        // +20 % de PV max (US-11 CA3) ; le monstre sur le terrain ouvrira la vague suivante.
        const next = nextWave(run, result.state.players[0].team, result.state.players[0].activeIndex);
        const [me, foe] = result.state.players;
        setBattle({ ...result.state, players: [{ ...me, team: next.team }, foe] }); // le soin est visible pendant le choix
        setReward({ wonWave: run.wave, next, choices: drawRewards(run.seed, run.wave) });
      } else if (result.winnerSeat === 1) {
        endRun(run.wave, result.state.players[0].team, false); // fin de run (US-11 CA4)
      }
      setBusy(false);
    };
    EventBus.on('events-played', onEventsPlayed);
    return () => {
      EventBus.off('events-played', onEventsPlayed);
    };
  }, [endRun, run]);

  const start = useCallback((starterId: string) => {
    const seed = Math.floor(Math.random() * 2 ** 31); // seed tirée une seule fois, hors de shared/
    const fresh = createRun(starterId, seed);
    runIdRef.current += 1;
    const first = battleForWave(fresh);
    setRun(fresh);
    setBattle(first);
    setOver(null);
    setReward(null);
    setConfirmingForfeit(false);
    setLog([`Vague 1 : ${first.players[1].team.map((m) => m.name).join(' et ')} apparaît !`]);
  }, []);

  /** Rejoue les événements d'un tour dans la scène ; `result` est appliqué à la fin (`events-played`). */
  const animate = useCallback((result: TurnResult) => {
    setBusy(true);
    setLog(describeEvents(result.events, 0));
    pendingRef.current = result;
    EventBus.emit('play-events', result.events);
    // Filet de sécurité : si la scène n'est pas encore chargée (réseau lent) ou ne rend jamais
    // la main, on applique quand même le tour — sinon la run reste figée.
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => EventBus.emit('events-played'), ANIMATION_TIMEOUT_MS);
  }, []);

  const play = useCallback(
    (action: Action) => {
      if (!run || !battle || busy) return;
      // Monstre KO : l'action est le choix de son remplaçant, l'IA ne joue pas.
      if (needsReplacement(battle, 0)) {
        if (action.type === 'switch') animate(resolveReplacement(battle, { 0: action.toIndex }));
        return;
      }
      const rng = createTurnRng(run.seed, run.wave, battle.turn);
      const aiAction = chooseAiAction(battle, 1, rng);
      // Les ennemis mis K.O. font monter de niveau le monstre du joueur (tous les 2 puis 3 K.O., solo uniquement).
      let result = grantKillLevels(resolveTurn(battle, [action, aiAction], rng));
      // Le monstre de l'IA est tombé : elle choisit tout de suite son remplaçant.
      if (result.winnerSeat === null && needsReplacement(result.state, 1)) {
        const replaced = resolveReplacement(result.state, { 1: chooseAiReplacement(result.state, 1) });
        result = { ...replaced, events: [...result.events, ...replaced.events] };
      }
      animate(result);
    },
    [animate, battle, busy, run],
  );

  const forfeit = useCallback(() => {
    if (!run || !battle) return;
    setConfirmingForfeit(false);
    endRun(run.wave, battle.players[0].team, true);
    setLog(['Vous abandonnez la run.']);
  }, [battle, endRun, run]);

  const chooseReward = useCallback(
    (id: RewardId, targetUid?: string, forgetSkillId?: string) => {
      if (!reward) return;
      const { next, wonWave } = reward;
      const outcome = applyReward(next.team, id, { seed: next.seed, wave: wonWave, targetUid, forgetSkillId });
      const advanced = { ...next, team: outcome.team };
      const fight = battleForWave(advanced);
      setReward(null);
      setRun(advanced);
      setBattle(fight);
      setLog([outcome.message, `Vague ${advanced.wave} : ${fight.players[1].team.map((m) => m.name).join(' et ')} apparaît !`]);
    },
    [reward],
  );

  useBattleMusic(Boolean(run && battle));

  if (!run || !battle) {
    return (
      <main className="page solo-starter-screen">
        <StarterSelect onChoose={start} />
        <Link to="/menu" className="button back-button" data-shortcut="back">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </main>
    );
  }

  const enemies = battle.players[1].team;
  return (
    <main className="page solo-page">
      <header className="run-header">
        <span className="run-wave">Vague {run.wave}</span>
        {isBossWave(run.wave) && <span className="run-boss">BOSS</span>}
        <span className="run-enemy">contre {enemies.map((m) => `${m.name} N.${m.level}`).join(' et ')}</span>
      </header>

      <PhaserGame />
      <MusicToggle />

      {over ? (
        <section className="run-over" aria-label="Fin de run">
          <h2>{over.forfeited ? 'Run abandonnée' : 'Fin de run'}</h2>
          <p>
            Vague atteinte : <strong>{over.wave}</strong>
          </p>
          <p>
            Score : <strong>{over.score}</strong>
          </p>
          <p className="run-save" role="status">
            {SAVE_MESSAGES[over.save]}
          </p>
          <div className="run-over-actions">
            <button type="button" className="button" onClick={() => setRun(null)}>
              <span>Nouvelle run</span>
              <span className="button-arrow" aria-hidden="true">↻</span>
            </button>
            <Link to="/classement" className="button">
              <span>Classement</span>
              <span className="button-arrow" aria-hidden="true">♛</span>
            </Link>
            <Link to="/menu" className="button">
              <span>Retour au menu</span>
              <span className="button-arrow" aria-hidden="true">↩</span>
            </Link>
          </div>
        </section>
      ) : reward ? (
        <>
          <RewardPanel wave={reward.wonWave} seed={reward.next.seed} choices={reward.choices} team={reward.next.team} onChoose={chooseReward} />
          {/* Le dernier tour reste lisible : le K.O. final et le niveau gagné. */}
          <ul className="battle-log" aria-live="polite">
            {log.slice(-4).map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <ActionMenu state={battle} seat={0} busy={busy} onAction={play} />
          <ul className="battle-log" aria-live="polite">
            {log.slice(-4).map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
          {confirmingForfeit ? (
            <div className="forfeit-confirm" role="alertdialog" aria-label="Confirmer l’abandon">
              <p>Abandonner la run ? Elle s’arrête à la vague {run.wave}.</p>
              <div className="run-over-actions">
                <button type="button" className="button" onClick={forfeit}>
                  <span>Confirmer l’abandon</span>
                  <span className="button-arrow" aria-hidden="true">⚑</span>
                </button>
                <button type="button" className="button" data-shortcut="back" onClick={() => setConfirmingForfeit(false)}>
                  <span>Continuer la run</span>
                  <span className="button-arrow" aria-hidden="true">↩</span>
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="button forfeit-button" disabled={busy} onClick={() => setConfirmingForfeit(true)}>
              <span>Abandonner</span>
              <span className="button-arrow" aria-hidden="true">⚑</span>
            </button>
          )}
        </>
      )}
    </main>
  );
}
