import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveTurn } from '../../shared/engine/battle.js';
import { chooseAiAction } from '../../shared/engine/ai.js';
import { describeEvents } from '../../shared/engine/log.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import { battleForWave, createRun, nextWave, type RunState } from '../../shared/engine/run.js';
import type { Action, BattleState, TurnResult } from '../../shared/types.js';
import { EventBus } from '../game/EventBus.ts';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { ActionMenu } from '../components/ActionMenu.tsx';
import { StarterSelect } from './StarterSelect.tsx';

/**
 * Mode solo (US-10, US-11) : choix du starter, puis enchaînement des vagues contre l'IA.
 * React garde l'état du combat ; Phaser ne fait que l'afficher (docs/02-ARCHITECTURE.md §5).
 */
export function SoloRun() {
  const [run, setRun] = useState<RunState | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState<{ wave: number } | null>(null);
  const battleRef = useRef<BattleState | null>(null);
  // Tour résolu en attente de la fin de l'animation Phaser (US-09) avant d'être appliqué à l'état React.
  const pendingRef = useRef<TurnResult | null>(null);

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
      const result = pendingRef.current;
      pendingRef.current = null;
      if (!result || !run) return;
      setBattle(result.state);
      if (result.winnerSeat === 0) {
        const advanced = nextWave(run, result.state.players[0].team); // +20 % de PV max (US-11 CA3)
        const next = battleForWave(advanced);
        setRun(advanced);
        setBattle(next);
        setLog((lines) => [...lines, `Vague ${advanced.wave} : ${next.players[1].team.map((m) => m.name).join(' et ')} apparaît !`]);
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
    },
    [battle, busy, run],
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
