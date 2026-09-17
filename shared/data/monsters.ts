import type { SpeciesDef } from '../types.js';
import { rarityForPower, speciesPower } from './rarities.js';

/** Bestiaire (docs/01-GAME-DESIGN.md §5). La rareté n'est pas saisie : elle découle de la puissance (§5.1). */
const BESTIARY: Record<string, Omit<SpeciesDef, 'rarity'>> = {
  salamander: {
    id: 'salamander', name: 'Salamandre', element: 'feu',
    base: { hp: 55, atk: 70, def: 45, spd: 60 },
    skills: ['fireball', 'inferno', 'strike'], sprite: 'salamander',
  },
  undine: {
    id: 'undine', name: 'Ondine', element: 'eau',
    base: { hp: 60, atk: 60, def: 55, spd: 55 },
    skills: ['water_jet', 'deluge', 'strike'], sprite: 'undine',
  },
  mushroom: {
    id: 'mushroom', name: 'Champignon', element: 'nature',
    base: { hp: 65, atk: 55, def: 60, spd: 40 },
    skills: ['vine', 'regrowth', 'strike'], sprite: 'mushroom',
  },
  goblin: {
    id: 'goblin', name: 'Gobelin', element: 'neutre',
    base: { hp: 45, atk: 55, def: 40, spd: 70 },
    skills: ['strike', 'quick_strike', 'shadow_claw'], sprite: 'goblin',
  },
  skeleton: {
    id: 'skeleton', name: 'Squelette', element: 'ombre',
    base: { hp: 50, atk: 55, def: 55, spd: 40 },
    skills: ['shadow_claw', 'life_drain', 'strike'], sprite: 'skeleton',
  },
  flying_eye: {
    id: 'flying_eye', name: 'Œil volant', element: 'ombre',
    base: { hp: 40, atk: 60, def: 35, spd: 75 },
    skills: ['shadow_claw', 'quick_strike', 'life_drain'], sprite: 'flying_eye',
  },
  slime: {
    id: 'slime', name: 'Slime', element: 'nature',
    base: { hp: 65, atk: 40, def: 50, spd: 30 },
    skills: ['vine', 'regrowth', 'strike'], sprite: 'slime',
  },
  imp: {
    id: 'imp', name: 'Diablotin', element: 'feu',
    base: { hp: 45, atk: 65, def: 35, spd: 70 },
    skills: ['fireball', 'quick_strike', 'shadow_claw'], sprite: 'imp',
  },
  crab: {
    id: 'crab', name: 'Crabe des abysses', element: 'eau',
    base: { hp: 55, atk: 60, def: 70, spd: 25 },
    skills: ['water_jet', 'shell_guard', 'strike'], sprite: 'crab',
  },
  wolf: {
    id: 'wolf', name: 'Loup sylvestre', element: 'nature',
    base: { hp: 55, atk: 65, def: 40, spd: 65 },
    skills: ['vine', 'bite', 'quick_strike'], sprite: 'wolf',
  },
  wisp: {
    id: 'wisp', name: 'Feu follet', element: 'lumiere',
    base: { hp: 40, atk: 60, def: 35, spd: 80 },
    skills: ['holy_ray', 'quick_strike', 'blessing'], sprite: 'wisp',
  },
  ghost: {
    id: 'ghost', name: 'Spectre', element: 'ombre',
    base: { hp: 45, atk: 60, def: 45, spd: 60 },
    skills: ['soul_leech', 'shadow_claw', 'quick_strike'], sprite: 'ghost',
  },
  knight: {
    id: 'knight', name: 'Chevalier déchu', element: 'lumiere',
    base: { hp: 65, atk: 55, def: 65, spd: 35 },
    skills: ['holy_ray', 'blessing', 'strike'], sprite: 'knight',
  },
  golem: {
    id: 'golem', name: 'Golem de pierre', element: 'neutre',
    base: { hp: 80, atk: 60, def: 75, spd: 20 },
    skills: ['rock_throw', 'harden', 'strike'], sprite: 'golem',
  },
  siren: {
    id: 'siren', name: 'Sirène', element: 'eau',
    base: { hp: 60, atk: 60, def: 50, spd: 60 },
    skills: ['deluge', 'water_jet', 'soothing_song'], sprite: 'siren',
  },
  treant: {
    id: 'treant', name: 'Tréant', element: 'nature',
    base: { hp: 75, atk: 60, def: 65, spd: 25 },
    skills: ['thorn_storm', 'vine', 'regrowth'], sprite: 'treant',
  },
  griffin: {
    id: 'griffin', name: 'Griffon', element: 'lumiere',
    base: { hp: 60, atk: 65, def: 50, spd: 65 },
    skills: ['sunburst', 'holy_ray', 'bite'], sprite: 'griffin',
  },
  demon: {
    id: 'demon', name: 'Démon mineur', element: 'feu',
    base: { hp: 90, atk: 70, def: 60, spd: 50 },
    skills: ['inferno', 'fireball', 'shadow_claw'], sprite: 'demon',
  },
  lich: {
    id: 'lich', name: 'Liche', element: 'ombre',
    base: { hp: 85, atk: 75, def: 55, spd: 55 },
    skills: ['life_drain', 'shadow_claw', 'holy_ray'], sprite: 'lich',
  },
  dragon: {
    id: 'dragon', name: 'Dragon ancien', element: 'feu',
    base: { hp: 95, atk: 75, def: 65, spd: 45 },
    skills: ['inferno', 'bite', 'rock_throw'], sprite: 'dragon',
  },
  bat: {
    id: 'bat', name: 'Chauve-souris vampire', element: 'ombre',
    base: { hp: 40, atk: 55, def: 35, spd: 75 },
    skills: ['life_drain', 'bite', 'quick_strike'], sprite: 'bat',
  },
  unicorn: {
    id: 'unicorn', name: 'Licorne', element: 'lumiere',
    base: { hp: 60, atk: 55, def: 55, spd: 62 },
    skills: ['holy_ray', 'blessing', 'quick_strike'], sprite: 'unicorn',
  },
  kraken: {
    id: 'kraken', name: 'Kraken', element: 'eau',
    base: { hp: 80, atk: 70, def: 60, spd: 40 },
    skills: ['deluge', 'water_jet', 'bite'], sprite: 'kraken',
  },
  phoenix: {
    id: 'phoenix', name: 'Phénix', element: 'feu',
    base: { hp: 65, atk: 75, def: 50, spd: 65 },
    skills: ['inferno', 'fireball', 'regrowth'], sprite: 'phoenix',
  },
  hydra: {
    id: 'hydra', name: 'Hydre', element: 'nature',
    base: { hp: 100, atk: 70, def: 65, spd: 40 },
    skills: ['thorn_storm', 'vine', 'regrowth'], sprite: 'hydra',
  },
};

export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(
  Object.entries(BESTIARY).map(([id, species]) => [id, { ...species, rarity: rarityForPower(speciesPower(species.base)) }]),
);
