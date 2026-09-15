import type { SkillDef } from '../types.js';

/** Compétences (docs/01-GAME-DESIGN.md §4). */
export const SKILLS: Record<string, SkillDef> = {
  strike: { id: 'strike', name: 'Frappe', element: 'neutre', power: 40, pp: null },
  quick_strike: { id: 'quick_strike', name: 'Frappe rapide', element: 'neutre', power: 25, pp: 10, priority: 1 },
  fireball: { id: 'fireball', name: 'Boule de feu', element: 'feu', power: 50, pp: 10 },
  inferno: { id: 'inferno', name: 'Souffle ardent', element: 'feu', power: 80, pp: 3 },
  water_jet: { id: 'water_jet', name: "Jet d'eau", element: 'eau', power: 50, pp: 10 },
  deluge: { id: 'deluge', name: 'Déluge', element: 'eau', power: 80, pp: 3 },
  vine: { id: 'vine', name: 'Liane', element: 'nature', power: 50, pp: 10 },
  regrowth: { id: 'regrowth', name: 'Régénération', element: 'nature', power: 0, pp: 3, effect: 'heal30' },
  shadow_claw: { id: 'shadow_claw', name: "Griffe d'ombre", element: 'ombre', power: 50, pp: 10 },
  life_drain: { id: 'life_drain', name: 'Drain vital', element: 'ombre', power: 40, pp: 5, effect: 'drain50' },
  holy_ray: { id: 'holy_ray', name: 'Rayon sacré', element: 'lumiere', power: 50, pp: 10 },
  blessing: { id: 'blessing', name: 'Bénédiction', element: 'lumiere', power: 0, pp: 2, effect: 'defUp' },
};
