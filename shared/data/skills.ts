import type { SkillDef } from '../types.js';

/**
 * Compétences (docs/01-GAME-DESIGN.md §4).
 * Les PP des attaques ont été relevés de 25 % (arrondi) ; ceux des soins et des boosts sont inchangés.
 */
export const SKILLS: Record<string, SkillDef> = {
  strike: { id: 'strike', name: 'Frappe', element: 'neutre', power: 40, pp: null },
  quick_strike: { id: 'quick_strike', name: 'Frappe rapide', element: 'neutre', power: 25, pp: 13, priority: 1 },
  fireball: { id: 'fireball', name: 'Boule de feu', element: 'feu', power: 50, pp: 13 },
  inferno: { id: 'inferno', name: 'Souffle ardent', element: 'feu', power: 80, pp: 4 },
  water_jet: { id: 'water_jet', name: "Jet d'eau", element: 'eau', power: 50, pp: 13 },
  deluge: { id: 'deluge', name: 'Déluge', element: 'eau', power: 80, pp: 4 },
  vine: { id: 'vine', name: 'Liane', element: 'nature', power: 50, pp: 13 },
  regrowth: { id: 'regrowth', name: 'Régénération', element: 'nature', power: 0, pp: 3, effect: 'heal30' },
  shadow_claw: { id: 'shadow_claw', name: "Griffe d'ombre", element: 'ombre', power: 50, pp: 13 },
  life_drain: { id: 'life_drain', name: 'Drain vital', element: 'ombre', power: 40, pp: 6, effect: 'drain50' },
  holy_ray: { id: 'holy_ray', name: 'Rayon sacré', element: 'lumiere', power: 50, pp: 13 },
  blessing: { id: 'blessing', name: 'Bénédiction', element: 'lumiere', power: 0, pp: 2, effect: 'defUp' },
  bite: { id: 'bite', name: 'Morsure', element: 'neutre', power: 60, pp: 10 },
  rock_throw: { id: 'rock_throw', name: 'Jet de roc', element: 'neutre', power: 70, pp: 6 },
  harden: { id: 'harden', name: 'Durcissement', element: 'neutre', power: 0, pp: 2, effect: 'defUp' },
  shell_guard: { id: 'shell_guard', name: 'Carapace', element: 'eau', power: 0, pp: 2, effect: 'defUp' },
  soothing_song: { id: 'soothing_song', name: 'Chant apaisant', element: 'eau', power: 0, pp: 3, effect: 'heal30' },
  thorn_storm: { id: 'thorn_storm', name: "Tempête d'épines", element: 'nature', power: 80, pp: 4 },
  sunburst: { id: 'sunburst', name: 'Éclat solaire', element: 'lumiere', power: 80, pp: 4 },
  soul_leech: { id: 'soul_leech', name: "Siphon d'âme", element: 'ombre', power: 60, pp: 5, effect: 'drain50' },
  // Boosts d'attaque : un par famille de monstres (docs/01-GAME-DESIGN.md §4).
  war_cry: { id: 'war_cry', name: 'Cri de guerre', element: 'neutre', power: 0, pp: 2, effect: 'atkUp' },
  rumble: { id: 'rumble', name: 'Grondement', element: 'neutre', power: 0, pp: 2, effect: 'atkUp' },
  howl: { id: 'howl', name: 'Hurlement', element: 'neutre', power: 0, pp: 2, effect: 'atkUp' },
  sharpen: { id: 'sharpen', name: 'Aiguisage', element: 'neutre', power: 0, pp: 2, effect: 'atkUp' },
  kindle: { id: 'kindle', name: 'Embrasement', element: 'feu', power: 0, pp: 2, effect: 'atkUp' },
  rising_tide: { id: 'rising_tide', name: 'Marée montante', element: 'eau', power: 0, pp: 2, effect: 'atkUp' },
  growth: { id: 'growth', name: 'Croissance', element: 'nature', power: 0, pp: 2, effect: 'atkUp' },
  holy_zeal: { id: 'holy_zeal', name: 'Ferveur sacrée', element: 'lumiere', power: 0, pp: 2, effect: 'atkUp' },
  dark_pact: { id: 'dark_pact', name: 'Pacte ténébreux', element: 'ombre', power: 0, pp: 2, effect: 'atkUp' },
};
