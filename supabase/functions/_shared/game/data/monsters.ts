// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import type { SpeciesDef } from '../types.ts';

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
  knight: {
    id: 'knight', name: 'Chevalier déchu', element: 'lumiere', rarity: 'rare',
    base: { hp: 65, atk: 55, def: 65, spd: 35 },
    skills: ['holy_ray', 'blessing', 'strike'], sprite: 'knight',
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
};
