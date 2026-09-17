/**
 * Récompenses de fin de vague (US-12, docs/01-GAME-DESIGN.md §6.2).
 * Les monstres gagnent surtout leurs niveaux en combat (un par ennemi mis K.O.) : les récompenses
 * d'entraînement donnent donc peu de niveaux, pour que le soin reste un vrai choix.
 */
export type RewardId =
  | 'potion'
  | 'elixir'
  | 'training'
  | 'recruit'
  | 'scroll'
  | 'royal_potion'
  | 'intensive_training'
  | 'war_camp'
  | 'relic';

export interface RewardDef {
  id: RewardId;
  name: string;
  icon: string;
  description: string;
  /** Poids du tirage : plus il est grand, plus la récompense sort souvent. */
  weight: number;
  /**
   * Niveau de butin minimal pour que la récompense soit proposée : 0 partout, 1 après un ennemi peu commun,
   * 2 rare, 3 épique, 4 boss (shared/data/rarities.ts).
   */
  minLoot: number;
}

export const REWARDS: Record<RewardId, RewardDef> = {
  potion: { id: 'potion', name: 'Potion', icon: '🧪', description: 'Soigne 50 % des PV max de toute l’équipe, KO compris.', weight: 30, minLoot: 0 },
  elixir: { id: 'elixir', name: 'Élixir', icon: '✨', description: 'Recharge tous les PP de l’équipe.', weight: 15, minLoot: 0 },
  training: { id: 'training', name: 'Entraînement', icon: '🗡️', description: '+1 niveau pour un monstre au choix.', weight: 20, minLoot: 0 },
  recruit: { id: 'recruit', name: 'Recrutement', icon: '🐾', description: 'Le monstre vaincu rejoint l’équipe.', weight: 35, minLoot: 0 },
  scroll: { id: 'scroll', name: 'Parchemin', icon: '📜', description: 'Un monstre apprend une compétence tirée au hasard, à la place de celle de votre choix.', weight: 10, minLoot: 0 },
  royal_potion: {
    id: 'royal_potion', name: 'Potion royale', icon: '💖',
    description: 'Soigne tous les PV et recharge tous les PP de l’équipe, KO compris.', weight: 14, minLoot: 1,
  },
  intensive_training: {
    id: 'intensive_training', name: 'Entraînement intensif', icon: '⚔️',
    description: '+2 niveaux pour un monstre au choix.', weight: 12, minLoot: 2,
  },
  war_camp: {
    id: 'war_camp', name: 'Camp d’entraînement', icon: '🏕️',
    description: '+1 niveau pour toute l’équipe.', weight: 10, minLoot: 3,
  },
  relic: {
    id: 'relic', name: 'Relique du boss', icon: '👑',
    description: '+2 niveaux pour toute l’équipe, qui est entièrement soignée.', weight: 0, minLoot: 4,
  },
};
