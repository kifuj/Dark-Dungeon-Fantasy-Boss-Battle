// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
/** Récompenses de fin de vague (US-12, docs/01-GAME-DESIGN.md §6.2). */
export type RewardId = 'potion' | 'elixir' | 'training' | 'recruit' | 'scroll';

export interface RewardDef {
  id: RewardId;
  name: string;
  icon: string;
  description: string;
  /** Poids du tirage : plus il est grand, plus la récompense sort souvent. */
  weight: number;
}

export const REWARDS: Record<RewardId, RewardDef> = {
  potion: { id: 'potion', name: 'Potion', icon: '🧪', description: 'Soigne 50 % des PV max de toute l’équipe, KO compris.', weight: 30 },
  elixir: { id: 'elixir', name: 'Élixir', icon: '✨', description: 'Recharge tous les PP de l’équipe.', weight: 15 },
  training: { id: 'training', name: 'Entraînement', icon: '🗡️', description: '+2 niveaux pour un monstre au choix.', weight: 25 },
  recruit: { id: 'recruit', name: 'Recrutement', icon: '🐾', description: 'Le monstre vaincu rejoint l’équipe.', weight: 20 },
  scroll: { id: 'scroll', name: 'Parchemin', icon: '📜', description: 'Un monstre apprend une compétence tirée au hasard.', weight: 10 },
};
