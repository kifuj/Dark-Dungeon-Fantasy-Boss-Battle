import { describe, expect, it } from 'vitest';
import { SPECIES } from '../data/monsters.js';
import { SKILLS } from '../data/skills.js';
import { ONLINE_POOL } from '../engine/online.js';
import type { Element } from '../types.js';

describe('Bestiaire', () => {
  const species = Object.values(SPECIES);

  it('compte 20 espèces, chacune avec son identifiant comme clé', () => {
    expect(species).toHaveLength(20);
    for (const [key, s] of Object.entries(SPECIES)) expect(s.id).toBe(key);
  });

  it('ne référence que des compétences existantes, sans doublon', () => {
    for (const s of species) {
      expect(s.skills.every((id) => SKILLS[id])).toBe(true);
      expect(new Set(s.skills).size).toBe(s.skills.length);
    }
  });

  it('a une clé de sprite propre à chaque espèce', () => {
    expect(new Set(species.map((s) => s.sprite)).size).toBe(species.length);
  });

  it('propose au moins 2 monstres de chaque élément en duel (draft varié)', () => {
    const elements: Element[] = ['feu', 'eau', 'nature', 'lumiere', 'ombre', 'neutre'];
    for (const element of elements) {
      expect(ONLINE_POOL.filter((id) => SPECIES[id].element === element).length).toBeGreaterThanOrEqual(2);
    }
  });
});
