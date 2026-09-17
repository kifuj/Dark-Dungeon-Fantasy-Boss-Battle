import { describe, expect, it } from 'vitest';
import { SPECIES } from '../data/monsters.js';
import { SKILLS } from '../data/skills.js';
import { RARITIES, RARITY_ORDER, rarityForPower, speciesPower } from '../data/rarities.js';
import { ONLINE_POOL } from '../engine/online.js';
import type { Element } from '../types.js';

describe('Bestiaire', () => {
  const species = Object.values(SPECIES);

  it('compte 25 espèces, chacune avec son identifiant comme clé', () => {
    expect(species).toHaveLength(25);
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

  it('donne à chaque espèce la rareté de sa puissance', () => {
    for (const s of species) {
      expect(s.rarity).toBe(rarityForPower(speciesPower(s.base)));
      expect(speciesPower(s.base)).toBeGreaterThanOrEqual(RARITIES[s.rarity].minPower);
    }
    expect(SPECIES.slime.rarity).toBe('common');
    expect(SPECIES.griffin.rarity).toBe('rare');
    expect(SPECIES.dragon.rarity).toBe('boss');
  });

  it('a au moins une espèce par rareté, et des raretés rangées par puissance croissante', () => {
    for (const rarity of RARITY_ORDER) expect(species.some((s) => s.rarity === rarity)).toBe(true);
    const mins = RARITY_ORDER.map((id) => RARITIES[id].minPower);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
    const loots = RARITY_ORDER.map((id) => RARITIES[id].loot);
    expect(loots).toEqual([0, 1, 2, 3, 4]);
  });

  it('ajoute les 5 nouvelles espèces (chauve-souris, licorne, kraken, phénix, hydre)', () => {
    expect(['bat', 'unicorn', 'kraken', 'phoenix', 'hydra'].map((id) => SPECIES[id]?.rarity)).toEqual(['common', 'rare', 'epic', 'epic', 'boss']);
  });
});
