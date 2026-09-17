import { useState } from 'react';
import { ELEMENT_LABELS } from '../../shared/data/elements.js';
import { RARITIES, RARITY_ORDER } from '../../shared/data/rarities.js';
import { REWARDS, type RewardId } from '../../shared/data/rewards.js';
import { needsTarget, recruitFor } from '../../shared/engine/rewards.js';
import { isBossWave } from '../../shared/engine/run.js';
import type { MonsterInstance } from '../../shared/types.js';
import { MonsterSprite } from './MonsterSprite.tsx';

interface RewardPanelProps {
  wave: number;
  seed: number;
  choices: RewardId[];
  team: MonsterInstance[];
  onChoose: (reward: RewardId, targetUid?: string) => void;
}

const TARGET_PROMPTS: Record<RewardId, string> = {
  potion: '',
  elixir: '',
  training: 'Quel monstre entraîner ?',
  intensive_training: 'Quel monstre suit l’entraînement intensif ?',
  royal_potion: '',
  war_camp: '',
  relic: '',
  scroll: 'Quel monstre lit le parchemin ?',
  recruit: 'Votre équipe est pleine. Quel monstre remplacer ?',
};

/** Couleur d'une récompense rare : celle de la rareté qui la débloque. */
const lootColor = (reward: RewardId) => RARITIES[RARITY_ORDER[REWARDS[reward].minLoot]].color;

/**
 * Récompense de fin de vague (US-12) : 3 cartes au choix, puis le monstre visé
 * pour l'entraînement, le parchemin, ou le recrutement dans une équipe pleine (CA3).
 */
export function RewardPanel({ wave, seed, choices, team, onChoose }: RewardPanelProps) {
  const [pending, setPending] = useState<RewardId | null>(null);

  const pick = (reward: RewardId) => {
    if (needsTarget(reward, team)) setPending(reward);
    else onChoose(reward);
  };

  if (pending) {
    const recruit = pending === 'recruit' ? recruitFor(seed, wave) : null;
    return (
      <section className="reward-panel" aria-label="Choix du monstre">
        <p className="eyebrow">
          {REWARDS[pending].icon} {REWARDS[pending].name}
        </p>
        <h2 className="reward-title">{TARGET_PROMPTS[pending]}</h2>
        {recruit && (
          <p className="solo-intro">
            {recruit.name} (N.{recruit.level}) veut rejoindre l’équipe.
          </p>
        )}
        <div className="reward-team">
          {team.map((monster) => (
            <button key={monster.uid} type="button" className="starter-card reward-target" onClick={() => onChoose(pending, monster.uid)}>
              <span className="starter-sprite">
                <MonsterSprite speciesId={monster.speciesId} scale={1} />
              </span>
              <span className="starter-card-heading">
                <strong>{monster.name}</strong>
                <span className="starter-element">{ELEMENT_LABELS[monster.element]}</span>
              </span>
              <span className="starter-level">
                N.{monster.level} · {monster.hp > 0 ? `${monster.hp}/${monster.maxHp} PV` : 'KO'}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="button confirm-button" onClick={() => setPending(null)}>
          <span>Changer de récompense</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </button>
      </section>
    );
  }

  return (
    <section className="reward-panel" aria-label="Récompense">
      <p className="eyebrow">{isBossWave(wave) ? `Boss vaincu à la vague ${wave} : butin de boss` : `Vague ${wave} remportée`}</p>
      <h2 className="reward-title">Choisissez une récompense</h2>
      <div className="reward-grid">
        {choices.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`starter-card reward-card ${REWARDS[id].minLoot > 0 ? 'reward-card-rare' : ''}`}
            style={REWARDS[id].minLoot > 0 ? ({ '--loot': lootColor(id) } as React.CSSProperties) : undefined}
            onClick={() => pick(id)}
            autoFocus={index === 0}
          >
            {REWARDS[id].minLoot > 0 && <span className="loot-badge">Butin {RARITIES[RARITY_ORDER[REWARDS[id].minLoot]].label.toLowerCase()}</span>}
            <span className="reward-icon" aria-hidden="true">
              {REWARDS[id].icon}
            </span>
            <span className="starter-card-heading">
              <strong>{REWARDS[id].name}</strong>
            </span>
            <span className="reward-description">{REWARDS[id].description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
