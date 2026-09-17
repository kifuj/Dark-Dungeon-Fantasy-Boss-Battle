import type { BaseStats, Rarity } from '../types.js';

/**
 * Raretés (docs/01-GAME-DESIGN.md §5.1) : la rareté d'une espèce découle de sa puissance,
 * c'est-à-dire la somme de ses stats de base. Plus une espèce est rare, plus elle apparaît
 * tard dans la run solo et meilleures sont les récompenses quand on la bat.
 */
export interface RarityDef {
  id: Rarity;
  label: string;
  color: string;
  /** Puissance minimale (PV + ATQ + DEF + VIT de base). */
  minPower: number;
  /** Première vague où l'espèce peut apparaître (les boss n'apparaissent que sur les vagues de boss). */
  firstWave: number;
  /** Poids du tirage de la rareté d'un ennemi, parmi les raretés déjà débloquées. */
  weight: number;
  /** Niveau de butin : relève les récompenses de fin de vague (docs/01-GAME-DESIGN.md §6.2). */
  loot: number;
}

export const RARITIES: Record<Rarity, RarityDef> = {
  common: { id: 'common', label: 'Commun', color: '#b0a8a0', minPower: 0, firstWave: 1, weight: 50, loot: 0 },
  uncommon: { id: 'uncommon', label: 'Peu commun', color: '#5dbb4a', minPower: 215, firstWave: 3, weight: 30, loot: 1 },
  rare: { id: 'rare', label: 'Rare', color: '#3a8fe0', minPower: 230, firstWave: 5, weight: 20, loot: 2 },
  epic: { id: 'epic', label: 'Épique', color: '#a86bff', minPower: 245, firstWave: 8, weight: 12, loot: 3 },
  boss: { id: 'boss', label: 'Boss', color: '#e0603a', minPower: 265, firstWave: 5, weight: 0, loot: 4 },
};

/** Du plus faible au plus puissant. */
export const RARITY_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'boss'];

export const speciesPower = (base: BaseStats) => base.hp + base.atk + base.def + base.spd;

export function rarityForPower(power: number): Rarity {
  return [...RARITY_ORDER].reverse().find((id) => power >= RARITIES[id].minPower) ?? 'common';
}
