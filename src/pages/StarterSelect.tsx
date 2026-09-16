import { useState } from 'react';
import { SPECIES } from '../../shared/data/monsters.js';
import { SKILLS } from '../../shared/data/skills.js';
import { createMonster } from '../../shared/engine/stats.js';
import { STARTER_IDS, STARTER_LEVEL } from '../../shared/engine/run.js';
import type { Element } from '../../shared/types.js';
import { MonsterSprite } from '../components/MonsterSprite.tsx';

const ELEMENT_LABELS: Record<Element, string> = {
  feu: 'Feu',
  eau: 'Eau',
  nature: 'Nature',
  lumiere: 'Lumière',
  ombre: 'Ombre',
  neutre: 'Neutre',
};

function StarterCard({ speciesId, selected, onSelect }: { speciesId: string; selected: boolean; onSelect: () => void }) {
  const species = SPECIES[speciesId];
  const preview = createMonster(speciesId, STARTER_LEVEL, `preview-${speciesId}`);

  return (
    <button
      type="button"
      className={`starter-card ${selected ? 'starter-card-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
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

/** Choix du starter (US-10 CA1) : sélection d'une carte, puis validation qui lance la run (CA2). */
export function StarterSelect({ onChoose }: { onChoose: (speciesId: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? SPECIES[selectedId] : null;

  return (
    <section className="starter-panel" aria-label="Choix du starter">
      <p className="eyebrow">Mode solo · La Descente</p>
      <h1 className="solo-title">Choisissez votre starter</h1>
      <p className="solo-intro">Trois créatures. Une seule stratégie pour commencer la run.</p>
      <div className="starter-grid">
        {STARTER_IDS.map((speciesId) => (
          <StarterCard
            key={speciesId}
            speciesId={speciesId}
            selected={selectedId === speciesId}
            onSelect={() => setSelectedId(speciesId)}
          />
        ))}
      </div>
      <button type="button" className="button confirm-button" disabled={!selected} onClick={() => selectedId && onChoose(selectedId)}>
        Valider {selected ? `· ${selected.name}` : 'le choix'}
        <span className="button-arrow" aria-hidden="true">↗</span>
      </button>
    </section>
  );
}
