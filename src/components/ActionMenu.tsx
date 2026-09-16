import { useEffect, useRef } from 'react';
import { ELEMENT_COLORS } from '../../shared/data/elements.js';
import { SKILLS } from '../../shared/data/skills.js';
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
 * Menu d'actions du joueur (US-08).
 * Les actions impossibles sont grisées par `validateAction`, la même fonction que
 * celle qui protège le serveur (docs/06-MOTEUR-DE-COMBAT.md §7).
 */
export function ActionMenu({ state, seat, busy, onAction }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const player = state.players[seat];
  const active = player.team[player.activeIndex];

  useEffect(() => {
    if (busy) return;
    containerRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }, [busy, active.uid]);

  if (busy) return <div className="action-menu action-menu-hidden" aria-hidden="true" />;

  /** Navigation au clavier : flèches pour se déplacer, Entrée pour valider (US-08 CA4). */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
                onClick={() => onAction({ type: 'skill', skillId: slot.id })}
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
    </div>
  );
}
