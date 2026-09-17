import type { SpeciesDef } from '../types.js';
import { rarityForPower, speciesPower } from './rarities.js';

/** Niveau où les starters évoluent (solo uniquement). */
export const STARTER_EVOLUTION_LEVEL = 24;
/** Niveau où les monstres communs évoluent : leurs évolutions n'apparaissent donc qu'en fin de run. */
export const COMMON_EVOLUTION_LEVEL = 10;

/**
 * Bestiaire (docs/01-GAME-DESIGN.md §5). La rareté n'est pas saisie : elle découle de la puissance (§5.1).
 * Chaque espèce a 3 compétences plus la Frappe, à PP illimités.
 */
const BESTIARY: Record<string, Omit<SpeciesDef, 'rarity'>> = {
  salamander: {
    id: 'salamander', name: 'Salamandre', element: 'feu',
    base: { hp: 55, atk: 70, def: 45, spd: 60 },
    skills: ['fireball', 'inferno', 'kindle', 'strike'], sprite: 'salamander',
    evolution: { into: 'drakeid', level: STARTER_EVOLUTION_LEVEL },
  },
  undine: {
    id: 'undine', name: 'Ondine', element: 'eau',
    base: { hp: 60, atk: 60, def: 55, spd: 55 },
    skills: ['water_jet', 'deluge', 'rising_tide', 'strike'], sprite: 'undine',
    evolution: { into: 'naiad', level: STARTER_EVOLUTION_LEVEL },
  },
  mushroom: {
    id: 'mushroom', name: 'Champignon', element: 'nature',
    base: { hp: 65, atk: 55, def: 60, spd: 40 },
    skills: ['vine', 'regrowth', 'growth', 'strike'], sprite: 'mushroom',
    evolution: { into: 'myconid', level: STARTER_EVOLUTION_LEVEL },
  },
  goblin: {
    id: 'goblin', name: 'Gobelin', element: 'neutre',
    base: { hp: 45, atk: 55, def: 40, spd: 70 },
    skills: ['quick_strike', 'shadow_claw', 'war_cry', 'strike'], sprite: 'goblin',
    evolution: { into: 'goblin_chief', level: COMMON_EVOLUTION_LEVEL },
  },
  skeleton: {
    id: 'skeleton', name: 'Squelette', element: 'ombre',
    base: { hp: 50, atk: 55, def: 55, spd: 40 },
    skills: ['shadow_claw', 'life_drain', 'dark_pact', 'strike'], sprite: 'skeleton',
    evolution: { into: 'skeleton_lord', level: COMMON_EVOLUTION_LEVEL },
  },
  flying_eye: {
    id: 'flying_eye', name: 'Œil volant', element: 'ombre',
    base: { hp: 40, atk: 60, def: 35, spd: 75 },
    skills: ['shadow_claw', 'quick_strike', 'life_drain', 'strike'], sprite: 'flying_eye',
    evolution: { into: 'tyrant_eye', level: COMMON_EVOLUTION_LEVEL },
  },
  slime: {
    id: 'slime', name: 'Slime', element: 'nature',
    base: { hp: 65, atk: 40, def: 50, spd: 30 },
    skills: ['vine', 'regrowth', 'growth', 'strike'], sprite: 'slime',
    evolution: { into: 'slime_king', level: COMMON_EVOLUTION_LEVEL },
  },
  imp: {
    id: 'imp', name: 'Diablotin', element: 'feu',
    base: { hp: 45, atk: 65, def: 35, spd: 70 },
    skills: ['fireball', 'shadow_claw', 'kindle', 'strike'], sprite: 'imp',
  },
  crab: {
    id: 'crab', name: 'Crabe des abysses', element: 'eau',
    base: { hp: 55, atk: 60, def: 70, spd: 25 },
    skills: ['water_jet', 'shell_guard', 'sharpen', 'strike'], sprite: 'crab',
    evolution: { into: 'titan_crab', level: COMMON_EVOLUTION_LEVEL },
  },
  wolf: {
    id: 'wolf', name: 'Loup sylvestre', element: 'nature',
    base: { hp: 55, atk: 65, def: 40, spd: 65 },
    skills: ['vine', 'bite', 'howl', 'strike'], sprite: 'wolf',
  },
  wisp: {
    id: 'wisp', name: 'Feu follet', element: 'lumiere',
    base: { hp: 40, atk: 60, def: 35, spd: 80 },
    skills: ['holy_ray', 'quick_strike', 'blessing', 'strike'], sprite: 'wisp',
  },
  ghost: {
    id: 'ghost', name: 'Spectre', element: 'ombre',
    base: { hp: 45, atk: 60, def: 45, spd: 60 },
    skills: ['soul_leech', 'shadow_claw', 'dark_pact', 'strike'], sprite: 'ghost',
    evolution: { into: 'banshee', level: COMMON_EVOLUTION_LEVEL },
  },
  knight: {
    id: 'knight', name: 'Chevalier déchu', element: 'lumiere',
    base: { hp: 65, atk: 55, def: 65, spd: 35 },
    skills: ['holy_ray', 'blessing', 'holy_zeal', 'strike'], sprite: 'knight',
  },
  // Neutre, donc faible à rien : sa DEF de base est plus basse que celle des autres colosses.
  golem: {
    id: 'golem', name: 'Golem de pierre', element: 'neutre',
    base: { hp: 80, atk: 60, def: 55, spd: 20 },
    skills: ['rock_throw', 'harden', 'rumble', 'strike'], sprite: 'golem',
  },
  siren: {
    id: 'siren', name: 'Sirène', element: 'eau',
    base: { hp: 60, atk: 60, def: 50, spd: 60 },
    skills: ['deluge', 'water_jet', 'soothing_song', 'strike'], sprite: 'siren',
  },
  treant: {
    id: 'treant', name: 'Tréant', element: 'nature',
    base: { hp: 75, atk: 60, def: 65, spd: 25 },
    skills: ['thorn_storm', 'vine', 'regrowth', 'strike'], sprite: 'treant',
  },
  griffin: {
    id: 'griffin', name: 'Griffon', element: 'lumiere',
    base: { hp: 60, atk: 65, def: 50, spd: 65 },
    skills: ['sunburst', 'holy_ray', 'sharpen', 'strike'], sprite: 'griffin',
  },
  demon: {
    id: 'demon', name: 'Démon mineur', element: 'feu',
    base: { hp: 90, atk: 70, def: 60, spd: 50 },
    skills: ['inferno', 'shadow_claw', 'kindle', 'strike'], sprite: 'demon',
  },
  lich: {
    id: 'lich', name: 'Liche', element: 'ombre',
    base: { hp: 85, atk: 75, def: 55, spd: 55 },
    skills: ['life_drain', 'shadow_claw', 'dark_pact', 'strike'], sprite: 'lich',
  },
  dragon: {
    id: 'dragon', name: 'Dragon ancien', element: 'feu',
    base: { hp: 95, atk: 75, def: 65, spd: 45 },
    skills: ['inferno', 'bite', 'rock_throw', 'strike'], sprite: 'dragon',
  },
  bat: {
    id: 'bat', name: 'Chauve-souris vampire', element: 'ombre',
    base: { hp: 40, atk: 55, def: 35, spd: 75 },
    skills: ['life_drain', 'bite', 'quick_strike', 'strike'], sprite: 'bat',
    evolution: { into: 'vampire_lord', level: COMMON_EVOLUTION_LEVEL },
  },
  unicorn: {
    id: 'unicorn', name: 'Licorne', element: 'lumiere',
    base: { hp: 60, atk: 55, def: 55, spd: 62 },
    skills: ['holy_ray', 'blessing', 'holy_zeal', 'strike'], sprite: 'unicorn',
  },
  kraken: {
    id: 'kraken', name: 'Kraken', element: 'eau',
    base: { hp: 80, atk: 70, def: 60, spd: 40 },
    skills: ['deluge', 'bite', 'rising_tide', 'strike'], sprite: 'kraken',
  },
  phoenix: {
    id: 'phoenix', name: 'Phénix', element: 'feu',
    base: { hp: 65, atk: 75, def: 50, spd: 65 },
    skills: ['inferno', 'fireball', 'regrowth', 'strike'], sprite: 'phoenix',
  },
  hydra: {
    id: 'hydra', name: 'Hydre', element: 'nature',
    base: { hp: 100, atk: 70, def: 65, spd: 40 },
    skills: ['thorn_storm', 'vine', 'regrowth', 'strike'], sprite: 'hydra',
  },

  // --- Évolutions : jamais tirées directement, on les obtient en montant de niveau (solo). ---
  drakeid: {
    id: 'drakeid', name: 'Drakéide', element: 'feu',
    base: { hp: 65, atk: 80, def: 50, spd: 65 },
    skills: ['inferno', 'fireball', 'kindle', 'strike'], sprite: 'drakeid',
  },
  naiad: {
    id: 'naiad', name: 'Naïade', element: 'eau',
    base: { hp: 70, atk: 70, def: 60, spd: 60 },
    skills: ['deluge', 'water_jet', 'rising_tide', 'strike'], sprite: 'naiad',
  },
  myconid: {
    id: 'myconid', name: 'Myconide', element: 'nature',
    base: { hp: 75, atk: 65, def: 70, spd: 45 },
    skills: ['thorn_storm', 'vine', 'growth', 'strike'], sprite: 'myconid',
  },
  goblin_chief: {
    id: 'goblin_chief', name: 'Chef gobelin', element: 'neutre',
    base: { hp: 55, atk: 72, def: 50, spd: 68 },
    skills: ['bite', 'shadow_claw', 'war_cry', 'strike'], sprite: 'goblin_chief',
  },
  skeleton_lord: {
    id: 'skeleton_lord', name: 'Seigneur squelette', element: 'ombre',
    base: { hp: 62, atk: 66, def: 67, spd: 45 },
    skills: ['soul_leech', 'shadow_claw', 'dark_pact', 'strike'], sprite: 'skeleton_lord',
  },
  tyrant_eye: {
    id: 'tyrant_eye', name: 'Œil tyran', element: 'ombre',
    base: { hp: 52, atk: 74, def: 42, spd: 77 },
    skills: ['soul_leech', 'shadow_claw', 'quick_strike', 'strike'], sprite: 'tyrant_eye',
  },
  slime_king: {
    id: 'slime_king', name: 'Roi slime', element: 'nature',
    base: { hp: 88, atk: 52, def: 62, spd: 30 },
    skills: ['vine', 'regrowth', 'growth', 'strike'], sprite: 'slime_king',
  },
  titan_crab: {
    id: 'titan_crab', name: 'Crabe titan', element: 'eau',
    base: { hp: 65, atk: 76, def: 72, spd: 30 },
    skills: ['deluge', 'shell_guard', 'sharpen', 'strike'], sprite: 'titan_crab',
  },
  banshee: {
    id: 'banshee', name: 'Banshee', element: 'ombre',
    base: { hp: 55, atk: 72, def: 48, spd: 70 },
    skills: ['soul_leech', 'life_drain', 'dark_pact', 'strike'], sprite: 'banshee',
  },
  vampire_lord: {
    id: 'vampire_lord', name: 'Seigneur vampire', element: 'ombre',
    base: { hp: 55, atk: 70, def: 45, spd: 77 },
    skills: ['soul_leech', 'bite', 'quick_strike', 'strike'], sprite: 'vampire_lord',
  },
};

export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(
  Object.entries(BESTIARY).map(([id, species]) => [id, { ...species, rarity: rarityForPower(speciesPower(species.base)) }]),
);

/** Espèces qui ne s'obtiennent que par évolution. */
export const EVOLVED_IDS: ReadonlySet<string> = new Set(
  Object.values(SPECIES).flatMap((species) => (species.evolution ? [species.evolution.into] : [])),
);

/** Espèce d'un monstre de cette lignée au niveau donné : suit les évolutions débloquées. */
export function speciesAtLevel(speciesId: string, level: number): string {
  let id = speciesId;
  for (let evolution = SPECIES[id]?.evolution; evolution && level >= evolution.level; evolution = SPECIES[id].evolution) {
    id = evolution.into;
  }
  return id;
}

/** Espèce d'origine d'une évolution (`null` si l'espèce n'évolue d'aucune autre). */
export const evolvesFrom = (speciesId: string): string | null =>
  Object.values(SPECIES).find((species) => species.evolution?.into === speciesId)?.id ?? null;
