import { useEffect, useRef, useState } from 'react';
import { ELEMENT_COLORS } from '../../shared/data/elements.js';
import { SKILLS } from '../../shared/data/skills.js';
import { hpRatio, hpTier } from '../../shared/engine/hp.js';
import { validateAction } from '../../shared/engine/validate.js';
import type { Action, BattleState, Seat } from '../../shared/types.js';

interface Props {
  state: BattleState;
  seat: Seat;
  /** Vrai pendant la résolution du tour : le menu est masqué (US-08 CA3). */
  busy: boolean;
  onAction: (action: Action) => void;
}

/**
 * Menu d'actions du joueur (US-08) et sous-menu « Changer » (US-04).
 * Les actions impossibles sont grisées par `validateAction`, la même fonction que
 * celle qui protège le serveur (docs/06-MOTEUR-DE-COMBAT.md §7).
 */
export function ActionMenu({ state, seat, busy, onAction }: Props) {
  const [tab, setTab] = useState<'root' | 'switch'>('root');
  const containerRef = useRef<HTMLDivElement>(null);
  const player = state.players[seat];
  const active = player.team[player.activeIndex];

  const switchable = player.team
    .map((monster, index) => ({ monster, index }))
    .filter(({ index }) => index !== player.activeIndex);
  const canSwitch = switchable.some(({ index }) => validateAction(state, seat, { type: 'switch', toIndex: index }).ok);

  useEffect(() => {
    if (busy) return;
    containerRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }, [busy, tab, active.uid]);

  if (busy) return <div className="action-menu action-menu-hidden" aria-hidden="true" />;

  /** Toute action jouée referme le sous-menu : au tour suivant on repart des compétences. */
  const send = (action: Action) => {
    setTab('root');
    onAction(action);
  };

  /** Navigation au clavier : flèches pour se déplacer, Entrée pour valider, Échap pour revenir (US-08 CA4). */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && tab === 'switch') {
      setTab('root');
      return;
    }
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const buttons = [...(containerRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])];
    if (buttons.length === 0) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(current + delta + buttons.length) % buttons.length].focus();
  };

  return (
    <div className="action-menu" ref={containerRef} onKeyDown={onKeyDown} aria-label="Menu d'actions">
      {tab === 'root' ? (
        <>
          <ul className="skill-grid">
            {active.skills.map((slot) => {
              const skill = SKILLS[slot.id];
              const check = validateAction(state, seat, { type: 'skill', skillId: slot.id });
              return (
                <li key={slot.id}>
                  <button
                    type="button"
                    className="skill-button"
                    style={{ '--element': ELEMENT_COLORS[skill.element] } as React.CSSProperties}
                    disabled={!check.ok}
                    title={check.ok ? `${skill.element} · puissance ${skill.power}` : 'Plus de PP'}
                    onClick={() => send({ type: 'skill', skillId: slot.id })}
                  >
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-meta">
                      <span className="skill-element">{skill.element}</span>
                      <span className="skill-pp">{slot.ppLeft === null ? '∞' : `${slot.ppLeft}/${skill.pp}`} PP</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="switch-button" disabled={!canSwitch} onClick={() => setTab('switch')}>
            Changer {canSwitch ? '' : '(aucun monstre disponible)'}
          </button>
        </>
      ) : (
        <>
          <ul className="switch-list">
            {switchable.map(({ monster, index }) => {
              const check = validateAction(state, seat, { type: 'switch', toIndex: index });
              const ratio = hpRatio(monster);
              return (
                <li key={monster.uid}>
                  <button type="button" className="switch-entry" disabled={!check.ok} onClick={() => send({ type: 'switch', toIndex: index })}>
                    <span className="skill-name">
                      {monster.name} <span className="skill-element">N.{monster.level}</span>
                    </span>
                    <span className={`hp-pill hp-${hpTier(ratio)}`}>
                      {monster.hp} / {monster.maxHp}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="switch-button" onClick={() => setTab('root')}>
            Retour (Échap)
          </button>
        </>
      )}
    </div>
  );
}
