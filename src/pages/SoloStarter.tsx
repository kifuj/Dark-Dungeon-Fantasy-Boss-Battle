import { useState } from 'react';
import { createMonster, statAtLevel } from '../../shared/engine/stats.js';
import { SPECIES } from '../../shared/data/monsters.js';
import type { Element, MonsterInstance } from '../../shared/types.js';
import { PhaserGame } from '../game/PhaserGame.tsx';
import { Link } from 'react-router-dom';

const STARTER_IDS = ['salamander', 'undine', 'mushroom'] as const;

const ELEMENT_LABELS: Record<Element, string> = {
  feu: 'Feu',
  eau: 'Eau',
  nature: 'Nature',
  lumiere: 'Lumière',
  ombre: 'Ombre',
  neutre: 'Neutre',
};

const ELEMENT_SYMBOLS: Record<Element, string> = {
  feu: '✦',
  eau: '◇',
  nature: '✤',
  lumiere: '☼',
  ombre: '◈',
  neutre: '◆',
};

function StarterCard({
  speciesId,
  selected,
  onSelect,
}: {
  speciesId: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const species = SPECIES[speciesId];
  const level = 5;

  return (
    <button
      type="button"
      className={`starter-card ${selected ? 'starter-card-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={`starter-sprite sprite-${species.sprite}`} aria-hidden="true">
        {ELEMENT_SYMBOLS[species.element]}
      </span>
      <span className="starter-card-heading">
        <strong>{species.name}</strong>
        <span className="starter-element">{ELEMENT_LABELS[species.element]}</span>
      </span>
      <span className="starter-level">Niveau {level}</span>
      <span className="starter-stats">
        <span>PV <b>{statAtLevel(species.base.hp, level)}</b></span>
        <span>ATK <b>{statAtLevel(species.base.atk, level)}</b></span>
        <span>DEF <b>{statAtLevel(species.base.def, level)}</b></span>
        <span>VIT <b>{statAtLevel(species.base.spd, level)}</b></span>
      </span>
      <span className="starter-skills">{species.skills.join(' · ')}</span>
    </button>
  );
}

export function SoloStarter() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runStarter, setRunStarter] = useState<MonsterInstance | null>(null);

  const selectedSpecies = selectedId ? SPECIES[selectedId] : null;

  const startRun = () => {
    if (!selectedId) return;
    setRunStarter(createMonster(selectedId, 5, `starter-${selectedId}`));
  };

  if (runStarter) {
    return (
      <main className="page solo-run-screen">
        <section className="run-panel" aria-label="Run solo démarrée">
          <p className="eyebrow">La descente commence</p>
          <h1 className="solo-title">Run solo lancée</h1>
          <div className="run-starter-summary">
            <span className={`starter-sprite sprite-${runStarter.speciesId}`} aria-hidden="true">
              {ELEMENT_SYMBOLS[runStarter.element]}
            </span>
            <div>
              <h2>{runStarter.name}</h2>
              <p>Niveau {runStarter.level} · Élément {ELEMENT_LABELS[runStarter.element]}</p>
            </div>
          </div>
          <p className="run-confirmation">Votre premier monstre est prêt pour la première vague.</p>
          <PhaserGame />
          <Link to="/menu" className="button back-button">Retour au menu</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page solo-starter-screen">
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
        <button type="button" className="button confirm-button" disabled={!selectedSpecies} onClick={startRun}>
          Valider {selectedSpecies ? `· ${selectedSpecies.name}` : 'le choix'}
          <span className="button-arrow" aria-hidden="true">↗</span>
        </button>
        <Link to="/menu" className="text-link">Retour au menu</Link>
      </section>
    </main>
  );
}
