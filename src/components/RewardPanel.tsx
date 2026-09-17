import { useState } from 'react';
import { ELEMENT_COLORS, ELEMENT_LABELS } from '../../shared/data/elements.js';
import { RARITIES, RARITY_ORDER } from '../../shared/data/rarities.js';
import { REWARDS, type RewardId } from '../../shared/data/rewards.js';
import { SKILLS } from '../../shared/data/skills.js';
import { needsTarget, recruitFor, scrollNeedsForget, scrollSkillFor } from '../../shared/engine/rewards.js';
import { isBossWave } from '../../shared/engine/run.js';
import type { MonsterInstance, SkillDef } from '../../shared/types.js';
import { MonsterSprite } from './MonsterSprite.tsx';

interface RewardPanelProps {
  wave: number;
  seed: number;
  choices: RewardId[];
  team: MonsterInstance[];
  onChoose: (reward: RewardId, targetUid?: string, forgetSkillId?: string) => void;
}

const EFFECT_SHORT: Record<NonNullable<SkillDef['effect']>, string> = {
  heal30: 'soigne 30 % des PV',
  drain50: 'draine 50 % des dégâts',
  defUp: 'augmente la DEF',
  atkUp: 'augmente l’ATK',
};

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
  /** Monstre qui lit le parchemin : il reste à choisir la compétence oubliée. */
  const [reader, setReader] = useState<MonsterInstance | null>(null);

  const pick = (reward: RewardId) => {
    if (needsTarget(reward, team)) setPending(reward);
    else onChoose(reward);
  };

  const target = (reward: RewardId, monster: MonsterInstance) => {
    if (reward === 'scroll' && scrollNeedsForget(monster)) setReader(monster);
    else onChoose(reward, monster.uid);
  };

  if (pending === 'scroll' && reader) {
    const learned = SKILLS[scrollSkillFor(seed, wave, reader)];
    return (
      <section className="reward-panel" aria-label="Compétence à oublier">
        <p className="eyebrow">
          {REWARDS.scroll.icon} {REWARDS.scroll.name} · {reader.name}
        </p>
        <h2 className="reward-title">
          {reader.name} veut apprendre <span className="scroll-learned">{learned.name}</span>
        </h2>
        <p className="solo-intro">
          {[
            ELEMENT_LABELS[learned.element],
            learned.power > 0 ? `puissance ${learned.power}` : null,
            learned.effect ? EFFECT_SHORT[learned.effect] : null,
            `${learned.pp} PP`,
          ]
            .filter(Boolean)
            .join(' · ')}
          . Quelle
          compétence oublier ? La Frappe est toujours gardée.
        </p>
        <ul className="skill-grid scroll-forget">
          {reader.skills.map((slot, index) => {
            const skill = SKILLS[slot.id];
            const kept = skill.pp === null;
            return (
              <li key={slot.id}>
                <button
                  type="button"
                  className="skill-button"
                  style={{ '--element': ELEMENT_COLORS[skill.element] } as React.CSSProperties}
                  disabled={kept}
                  data-key={index + 1}
                  autoFocus={index === reader.skills.findIndex((s) => SKILLS[s.id].pp !== null)}
                  onClick={() => onChoose('scroll', reader.uid, slot.id)}
                >
                  <span className="skill-name">
                    <kbd className="key-hint" aria-hidden="true">{index + 1}</kbd>
                    {kept ? `${skill.name} (gardée)` : `Oublier ${skill.name}`}
                  </span>
                  <span className="skill-meta">
                    <span className="skill-element">{skill.element}</span>
                    <span className="skill-pp">{skill.power > 0 ? `puiss. ${skill.power}` : 'effet'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="button confirm-button" data-shortcut="back" onClick={() => setReader(null)}>
          <span>Choisir un autre monstre</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </button>
      </section>
    );
  }

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
          {team.map((monster, index) => (
            <button
              key={monster.uid}
              type="button"
              className="starter-card reward-target"
              data-key={index + 1}
              autoFocus={index === 0}
              onClick={() => target(pending, monster)}
            >
              <kbd className="key-hint card-key" aria-hidden="true">{index + 1}</kbd>
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
              {pending === 'scroll' && <span className="starter-skills">Apprendrait : {SKILLS[scrollSkillFor(seed, wave, monster)].name}</span>}
            </button>
          ))}
        </div>
        <button type="button" className="button confirm-button" data-shortcut="back" onClick={() => setPending(null)}>
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
            data-key={index + 1}
          >
            <kbd className="key-hint card-key" aria-hidden="true">{index + 1}</kbd>
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
