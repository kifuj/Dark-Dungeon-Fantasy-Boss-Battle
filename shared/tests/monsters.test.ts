import { describe, expect, it } from 'vitest';
import { COMMON_EVOLUTION_LEVEL, EVOLVED_IDS, evolvesFrom, SPECIES, speciesAtLevel, STARTER_EVOLUTION_LEVEL } from '../data/monsters.js';
import { SKILLS } from '../data/skills.js';
import { RARITIES, RARITY_ORDER, rarityForPower, speciesPower } from '../data/rarities.js';
import { ONLINE_POOL } from '../engine/online.js';
import type { Element } from '../types.js';

describe('Bestiaire', () => {
  const species = Object.values(SPECIES);

  it('compte 35 espèces (dont 10 évolutions), chacune avec son identifiant comme clé', () => {
    expect(species).toHaveLength(35);
    expect(EVOLVED_IDS.size).toBe(10);
    for (const [key, s] of Object.entries(SPECIES)) expect(s.id).toBe(key);
  });

  it('ne référence que des compétences existantes, sans doublon', () => {
    for (const s of species) {
      expect(s.skills.every((id) => SKILLS[id])).toBe(true);
      expect(new Set(s.skills).size).toBe(s.skills.length);
    }
  });

  it('donne à chaque espèce 3 compétences et la Frappe à PP illimités', () => {
    for (const s of species) {
      expect(s.skills).toHaveLength(4);
      expect(s.skills).toContain('strike');
      expect(s.skills.filter((id) => SKILLS[id].pp === null)).toEqual(['strike']);
    }
  });

  it('a relevé de 25 % les PP des attaques, pas ceux des soins et des boosts', () => {
    expect(SKILLS.fireball.pp).toBe(13);
    expect(SKILLS.inferno.pp).toBe(4);
    expect(SKILLS.bite.pp).toBe(10);
    expect(SKILLS.regrowth.pp).toBe(3);
    expect(SKILLS.harden.pp).toBe(2);
  });

  it('propose un boost d’attaque de l’élément du monstre ou neutre', () => {
    const boosted = species.filter((s) => s.skills.some((id) => SKILLS[id].effect === 'atkUp'));
    expect(boosted.length).toBeGreaterThanOrEqual(15);
    for (const s of boosted) {
      const boost = SKILLS[s.skills.find((id) => SKILLS[id].effect === 'atkUp')!];
      expect([s.element, 'neutre']).toContain(boost.element);
    }
  });

  it('fait évoluer les starters et les communs, avec la même famille d’élément et plus de puissance', () => {
    for (const id of ['salamander', 'undine', 'mushroom']) expect(SPECIES[id].evolution?.level).toBe(STARTER_EVOLUTION_LEVEL);
    for (const s of species.filter((x) => x.rarity === 'common' && !EVOLVED_IDS.has(x.id))) {
      expect(s.evolution?.level).toBe(COMMON_EVOLUTION_LEVEL);
    }
    for (const s of species.filter((x) => x.evolution)) {
      const into = SPECIES[s.evolution!.into];
      expect(into.element).toBe(s.element);
      expect(speciesPower(into.base)).toBeGreaterThan(speciesPower(s.base));
      expect(into.rarity).not.toBe('boss');
      expect(evolvesFrom(into.id)).toBe(s.id);
    }
    expect(speciesAtLevel('salamander', 11)).toBe('salamander');
    expect(speciesAtLevel('salamander', 12)).toBe('drakeid');
    expect(speciesAtLevel('drakeid', 30)).toBe('drakeid');
  });

  it('a affaibli la DEF du Golem, neutre et donc faible à rien', () => {
    expect(SPECIES.golem.base.def).toBeLessThan(SPECIES.crab.base.def);
    expect(SPECIES.golem.rarity).toBe('uncommon');
  });

  it('a une clé de sprite propre à chaque espèce', () => {
    expect(new Set(species.map((s) => s.sprite)).size).toBe(species.length);
  });

  it('ne propose ni boss ni évolution en duel', () => {
    expect(ONLINE_POOL.some((id) => EVOLVED_IDS.has(id) || SPECIES[id].rarity === 'boss')).toBe(false);
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
