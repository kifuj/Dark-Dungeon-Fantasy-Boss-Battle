import { useState } from 'react';
import { SPECIES } from '../../shared/data/monsters.js';
import { STARTER_IDS, STARTER_LEVEL } from '../../shared/engine/run.js';
import { MonsterCard } from '../components/MonsterCard.tsx';

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
        {STARTER_IDS.map((speciesId, index) => (
          <MonsterCard
            key={speciesId}
            speciesId={speciesId}
            level={STARTER_LEVEL}
            selected={selectedId === speciesId}
            onSelect={() => setSelectedId(speciesId)}
            shortcut={String(index + 1)}
          />
        ))}
      </div>
      <button
        type="button"
        className="button confirm-button"
        disabled={!selected}
        data-key="v"
        onClick={() => selectedId && onChoose(selectedId)}
      >
        Valider {selected ? `· ${selected.name}` : 'le choix'}
        <span className="button-arrow" aria-hidden="true">↗</span>
      </button>
    </section>
  );
}
