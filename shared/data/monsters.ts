import type { SpeciesDef } from '../types.js';

/** Bestiaire (docs/01-GAME-DESIGN.md §5). */
export const SPECIES: Record<string, SpeciesDef> = {
  salamander: {
    id: 'salamander', name: 'Salamandre', element: 'feu', rarity: 'starter',
    base: { hp: 50, atk: 65, def: 40, spd: 55 },
    skills: ['fireball', 'inferno', 'strike'], sprite: 'salamander',
  },
  undine: {
    id: 'undine', name: 'Ondine', element: 'eau', rarity: 'starter',
    base: { hp: 55, atk: 55, def: 50, spd: 50 },
    skills: ['water_jet', 'deluge', 'strike'], sprite: 'undine',
  },
  mushroom: {
    id: 'mushroom', name: 'Champignon', element: 'nature', rarity: 'starter',
    base: { hp: 60, atk: 50, def: 55, spd: 35 },
    skills: ['vine', 'regrowth', 'strike'], sprite: 'mushroom',
  },
  goblin: {
    id: 'goblin', name: 'Gobelin', element: 'neutre', rarity: 'common',
    base: { hp: 45, atk: 55, def: 40, spd: 70 },
    skills: ['strike', 'quick_strike', 'shadow_claw'], sprite: 'goblin',
  },
  skeleton: {
    id: 'skeleton', name: 'Squelette', element: 'ombre', rarity: 'common',
    base: { hp: 50, atk: 55, def: 55, spd: 40 },
    skills: ['shadow_claw', 'life_drain', 'strike'], sprite: 'skeleton',
  },
  flying_eye: {
    id: 'flying_eye', name: 'Œil volant', element: 'ombre', rarity: 'common',
    base: { hp: 40, atk: 60, def: 35, spd: 75 },
    skills: ['shadow_claw', 'quick_strike', 'life_drain'], sprite: 'flying_eye',
  },
  slime: {
    id: 'slime', name: 'Slime', element: 'nature', rarity: 'common',
    base: { hp: 65, atk: 40, def: 50, spd: 30 },
    skills: ['vine', 'regrowth', 'strike'], sprite: 'slime',
  },
  imp: {
    id: 'imp', name: 'Diablotin', element: 'feu', rarity: 'common',
    base: { hp: 45, atk: 65, def: 35, spd: 70 },
    skills: ['fireball', 'quick_strike', 'shadow_claw'], sprite: 'imp',
  },
  crab: {
    id: 'crab', name: 'Crabe des abysses', element: 'eau', rarity: 'common',
    base: { hp: 55, atk: 60, def: 70, spd: 25 },
    skills: ['water_jet', 'shell_guard', 'strike'], sprite: 'crab',
  },
  wolf: {
    id: 'wolf', name: 'Loup sylvestre', element: 'nature', rarity: 'common',
    base: { hp: 55, atk: 65, def: 40, spd: 65 },
    skills: ['vine', 'bite', 'quick_strike'], sprite: 'wolf',
  },
  wisp: {
    id: 'wisp', name: 'Feu follet', element: 'lumiere', rarity: 'common',
    base: { hp: 40, atk: 60, def: 35, spd: 80 },
    skills: ['holy_ray', 'quick_strike', 'blessing'], sprite: 'wisp',
  },
  ghost: {
    id: 'ghost', name: 'Spectre', element: 'ombre', rarity: 'common',
    base: { hp: 45, atk: 60, def: 45, spd: 60 },
    skills: ['soul_leech', 'shadow_claw', 'quick_strike'], sprite: 'ghost',
  },
  knight: {
    id: 'knight', name: 'Chevalier déchu', element: 'lumiere', rarity: 'rare',
    base: { hp: 65, atk: 55, def: 65, spd: 35 },
    skills: ['holy_ray', 'blessing', 'strike'], sprite: 'knight',
  },
  golem: {
    id: 'golem', name: 'Golem de pierre', element: 'neutre', rarity: 'rare',
    base: { hp: 80, atk: 60, def: 75, spd: 20 },
    skills: ['rock_throw', 'harden', 'strike'], sprite: 'golem',
  },
  siren: {
    id: 'siren', name: 'Sirène', element: 'eau', rarity: 'rare',
    base: { hp: 60, atk: 60, def: 50, spd: 60 },
    skills: ['deluge', 'water_jet', 'soothing_song'], sprite: 'siren',
  },
  treant: {
    id: 'treant', name: 'Tréant', element: 'nature', rarity: 'rare',
    base: { hp: 75, atk: 60, def: 65, spd: 25 },
    skills: ['thorn_storm', 'vine', 'regrowth'], sprite: 'treant',
  },
  griffin: {
    id: 'griffin', name: 'Griffon', element: 'lumiere', rarity: 'rare',
    base: { hp: 60, atk: 65, def: 50, spd: 65 },
    skills: ['sunburst', 'holy_ray', 'bite'], sprite: 'griffin',
  },
  demon: {
    id: 'demon', name: 'Démon mineur', element: 'feu', rarity: 'boss',
    base: { hp: 90, atk: 70, def: 60, spd: 50 },
    skills: ['inferno', 'fireball', 'shadow_claw'], sprite: 'demon',
  },
  lich: {
    id: 'lich', name: 'Liche', element: 'ombre', rarity: 'boss',
    base: { hp: 85, atk: 75, def: 55, spd: 55 },
    skills: ['life_drain', 'shadow_claw', 'holy_ray'], sprite: 'lich',
  },
  dragon: {
    id: 'dragon', name: 'Dragon ancien', element: 'feu', rarity: 'boss',
    base: { hp: 95, atk: 75, def: 65, spd: 45 },
    skills: ['inferno', 'bite', 'rock_throw'], sprite: 'dragon',
  },
};
