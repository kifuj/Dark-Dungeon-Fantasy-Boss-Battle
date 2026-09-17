import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveTurn } from '../../shared/engine/battle.js';
import { chooseAiAction } from '../../shared/engine/ai.js';
import { describeEvents } from '../../shared/engine/log.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import { applyReward, drawRewards } from '../../shared/engine/rewards.js';
import { battleForWave, createRun, nextWave, type RunState } from '../../shared/engine/run.js';
import type { RewardId } from '../../shared/data/rewards.js';
import type { Action, BattleState, TurnResult } from '../../shared/types.js';
import { EventBus } from '../game/EventBus.ts';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { ANIMATION_TIMEOUT_MS } from '../game/timing.ts';
import { ActionMenu } from '../components/ActionMenu.tsx';
import { RewardPanel } from '../components/RewardPanel.tsx';
import { StarterSelect } from './StarterSelect.tsx';

/** Vague gagnée en attente du choix de la récompense (US-12). */
interface PendingReward {
  wonWave: number;
  /** Run de la vague suivante, déjà soignée de 20 %, avant la récompense. */
  next: RunState;
  choices: RewardId[];
}

/**
 * Mode solo (US-10, US-11, US-12) : choix du starter, puis vagues contre l'IA, avec une récompense entre deux vagues.
 * React garde l'état du combat ; Phaser ne fait que l'afficher (docs/02-ARCHITECTURE.md §5).
 */
export function SoloRun() {
  const [run, setRun] = useState<RunState | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<{ wave: number } | null>(null);
  const [reward, setReward] = useState<PendingReward | null>(null);
  const battleRef = useRef<BattleState | null>(null);
  // Tour résolu en attente de la fin de l'animation Phaser (US-09) avant d'être appliqué à l'état React.
  const pendingRef = useRef<TurnResult | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (run) EventBus.emit('battle-banner', `Vague ${run.wave}`);
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
        const next = nextWave(run, result.state.players[0].team); // +20 % de PV max (US-11 CA3)
        const [me, foe] = result.state.players;
        setBattle({ ...result.state, players: [{ ...me, team: next.team }, foe] }); // le soin est visible pendant le choix
        setReward({ wonWave: run.wave, next, choices: drawRewards(run.seed, run.wave) });
      } else if (result.winnerSeat === 1) {
        setOver({ wave: run.wave }); // fin de run (US-11 CA4)
      }
      setBusy(false);
    };
    EventBus.on('events-played', onEventsPlayed);
    return () => {
      EventBus.off('events-played', onEventsPlayed);
    };
  }, [run]);

  const start = useCallback((starterId: string) => {
    const seed = Math.floor(Math.random() * 2 ** 31); // seed tirée une seule fois, hors de shared/
    const fresh = createRun(starterId, seed);
    const first = battleForWave(fresh);
    setRun(fresh);
    setBattle(first);
    setOver(null);
    setReward(null);
    setLog([`Vague 1 : ${first.players[1].team.map((m) => m.name).join(' et ')} apparaît !`]);
  }, []);

  const play = useCallback(
    (action: Action) => {
      if (!run || !battle || busy) return;
      setBusy(true);
      const rng = createTurnRng(run.seed, run.wave, battle.turn);
      const aiAction = chooseAiAction(battle, 1, rng);
      const result = resolveTurn(battle, [action, aiAction], rng);
      setLog(describeEvents(result.events, 0));
      pendingRef.current = result;
      EventBus.emit('play-events', result.events); // la scène applique `result` à la fin (`events-played`)
      // Filet de sécurité : si la scène n'est pas encore chargée (réseau lent) ou ne rend jamais
      // la main, on applique quand même le tour — sinon la run reste figée.
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => EventBus.emit('events-played'), ANIMATION_TIMEOUT_MS);
    },
    [battle, busy, run],
  );

  const chooseReward = useCallback(
    (id: RewardId, targetUid?: string) => {
      if (!reward) return;
      const { next, wonWave } = reward;
      const outcome = applyReward(next.team, id, { seed: next.seed, wave: wonWave, targetUid });
      const advanced = { ...next, team: outcome.team };
      const fight = battleForWave(advanced);
      setReward(null);
      setRun(advanced);
      setBattle(fight);
      setLog([outcome.message, `Vague ${advanced.wave} : ${fight.players[1].team.map((m) => m.name).join(' et ')} apparaît !`]);
    },
    [reward],
  );

  if (!run || !battle) {
    return (
      <main className="page solo-starter-screen">
        <StarterSelect onChoose={start} />
        <Link to="/menu" className="button back-button">
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
        <span className="run-enemy">contre {enemies.map((m) => `${m.name} N.${m.level}`).join(' et ')}</span>
      </header>

      <PhaserGame />

      {over ? (
        <section className="run-over" aria-label="Fin de run">
          <h2>Fin de run</h2>
          <p>
            Vague atteinte : <strong>{over.wave}</strong>
          </p>
          <div className="run-over-actions">
            <button type="button" className="button" onClick={() => setRun(null)}>
              <span>Nouvelle run</span>
              <span className="button-arrow" aria-hidden="true">↻</span>
            </button>
            <Link to="/menu" className="button">
              <span>Retour au menu</span>
              <span className="button-arrow" aria-hidden="true">↩</span>
            </Link>
          </div>
        </section>
      ) : reward ? (
        <RewardPanel wave={reward.wonWave} seed={reward.next.seed} choices={reward.choices} team={reward.next.team} onChoose={chooseReward} />
      ) : (
        <>
          <ActionMenu state={battle} seat={0} busy={busy} onAction={play} />
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
