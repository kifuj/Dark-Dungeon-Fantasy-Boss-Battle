import { useState } from 'react';
import { SPECIES } from '../../shared/data/monsters.js';
import { ONLINE_LEVEL, ONLINE_TEAM_SIZE } from '../../shared/engine/online.js';
import { MonsterCard } from './MonsterCard.tsx';

const ORDER_LABELS = ['1er', '2e', '3e'];

interface DraftPanelProps {
  offer: string[];
  /** Vrai une fois le choix envoyé (ou pendant l'envoi) : les cartes sont figées. */
  locked: boolean;
  onConfirm: (picks: number[]) => void;
}

/**
 * Draft du duel (US-18 CA1) : le joueur garde 3 monstres parmi ses 6 propositions.
 * L'ordre des clics est l'ordre d'entrée en combat : le 1er choisi commence le duel.
 */
export function DraftPanel({ offer, locked, onConfirm }: DraftPanelProps) {
  const [picks, setPicks] = useState<number[]>([]);
  const full = picks.length === ONLINE_TEAM_SIZE;

  const toggle = (index: number) => {
    if (locked) return;
    setPicks((current) =>
      current.includes(index)
        ? current.filter((pick) => pick !== index)
        : current.length < ONLINE_TEAM_SIZE
          ? [...current, index]
          : current,
    );
  };

  return (
    <section className="starter-panel draft-panel" aria-label="Choix de l’équipe">
      <p className="eyebrow">Duel · Draft</p>
      <h1 className="solo-title">Composez votre équipe</h1>
      <p className="solo-intro">
        Gardez {ONLINE_TEAM_SIZE} monstres parmi {offer.length}. Le premier choisi ouvre le combat. Votre adversaire ne
        verra votre équipe qu’au début du duel.
      </p>
      <div className="starter-grid draft-grid">
        {offer.map((speciesId, index) => {
          const order = picks.indexOf(index);
          return (
            <MonsterCard
              key={speciesId}
              speciesId={speciesId}
              level={ONLINE_LEVEL}
              selected={order !== -1}
              badge={order !== -1 ? ORDER_LABELS[order] : undefined}
              disabled={locked || (full && order === -1)}
              onSelect={() => toggle(index)}
            />
          );
        })}
      </div>
      <p className="draft-summary" aria-live="polite">
        {picks.length === 0
          ? 'Aucun monstre choisi.'
          : picks.map((index, order) => `${ORDER_LABELS[order]} ${SPECIES[offer[index]].name}`).join(' · ')}
      </p>
      <button type="button" className="button confirm-button" disabled={!full || locked} onClick={() => onConfirm(picks)}>
        {locked ? 'Équipe validée' : `Valider mon équipe (${picks.length}/${ONLINE_TEAM_SIZE})`}
        <span className="button-arrow" aria-hidden="true">⚔</span>
      </button>
    </section>
  );
}
