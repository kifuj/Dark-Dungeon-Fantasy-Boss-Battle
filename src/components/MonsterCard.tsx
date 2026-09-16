import { SPECIES } from '../../shared/data/monsters.js';
import { SKILLS } from '../../shared/data/skills.js';
import { createMonster } from '../../shared/engine/stats.js';
import { ELEMENT_LABELS } from '../../shared/data/elements.js';
import { MonsterSprite } from './MonsterSprite.tsx';

interface MonsterCardProps {
  speciesId: string;
  level: number;
  selected: boolean;
  onSelect: () => void;
  /** Pastille affichée sur une carte choisie (ex. ordre d'entrée dans le draft). */
  badge?: string;
  disabled?: boolean;
}

/** Carte d'une espèce avec ses stats au niveau donné (choix du starter US-10, draft US-18). */
export function MonsterCard({ speciesId, level, selected, onSelect, badge, disabled = false }: MonsterCardProps) {
  const species = SPECIES[speciesId];
  const preview = createMonster(speciesId, level, `preview-${speciesId}`);

  return (
    <button
      type="button"
      className={`starter-card ${selected ? 'starter-card-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      disabled={disabled}
    >
      {badge && <span className="card-badge">{badge}</span>}
      <span className={`starter-sprite sprite-${species.sprite}`}>
        <MonsterSprite speciesId={speciesId} scale={1.25} />
      </span>
      <span className="starter-card-heading">
        <strong>{species.name}</strong>
        <span className="starter-element">{ELEMENT_LABELS[species.element]}</span>
      </span>
      <span className="starter-level">Niveau {preview.level}</span>
      <span className="starter-stats">
        <span>PV <b>{preview.maxHp}</b></span>
        <span>ATK <b>{preview.stats.atk}</b></span>
        <span>DEF <b>{preview.stats.def}</b></span>
        <span>VIT <b>{preview.stats.spd}</b></span>
      </span>
      <span className="starter-skills">{species.skills.map((skillId) => SKILLS[skillId].name).join(' · ')}</span>
    </button>
  );
}
