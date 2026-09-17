import { describe, expect, it } from 'vitest';
import { describeEvents } from '../engine/log.js';
import { resolveTurn } from '../engine/battle.js';
import { mulberry32 } from '../engine/rng.js';
import { makeBattle } from './helpers.js';

describe('US-08 / US-11 — texte des événements', () => {
  it('annonce la compétence, les dégâts et l’efficacité', () => {
    const lines = describeEvents(
      [
        { type: 'skill_used', seat: 0, actorName: 'Salamandre', skillName: 'Boule de feu', skillId: 'fireball' },
        { type: 'damage', targetSeat: 1, amount: 12, hpAfter: 20, maxHp: 32, effectiveness: 2, crit: true },
      ],
      0,
    );
    expect(lines).toEqual(['Salamandre utilise Boule de feu !', "L'ennemi perd 12 PV.", 'Coup critique !', "C'est super efficace !"]);
  });

  it('annonce les boosts d’attaque, les montées de niveau et les évolutions', () => {
    expect(
      describeEvents(
        [
          { type: 'buff', seat: 0, stat: 'atk', mult: 1.15 },
          { type: 'buff', seat: 1, stat: 'def', mult: 1.15 },
          { type: 'level_up', seat: 0, speciesId: 'wolf', name: 'Loup sylvestre', level: 8, evolvedFrom: null },
          { type: 'level_up', seat: 0, speciesId: 'drakeid', name: 'Drakéide', level: 12, evolvedFrom: 'Salamandre' },
        ],
        0,
      ),
    ).toEqual([
      'Votre monstre augmente son attaque !',
      "L'ennemi augmente sa défense !",
      'Loup sylvestre passe au niveau 8 !',
      'Salamandre évolue en Drakéide !',
      'Drakéide passe au niveau 12 !',
    ]);
  });

  it('se place du point de vue du joueur', () => {
    const damage = { type: 'damage', targetSeat: 0, amount: 7, hpAfter: 1, maxHp: 30, effectiveness: 0.5, crit: false } as const;
    expect(describeEvents([damage], 0)[0]).toBe('Votre monstre perd 7 PV.');
    expect(describeEvents([damage], 1)[0]).toBe("L'ennemi perd 7 PV.");
  });

  it('produit une ligne pour chaque événement d’un vrai tour', () => {
    const state = makeBattle(['salamander'], ['mushroom']);
    const result = resolveTurn(state, [{ type: 'skill', skillId: 'fireball' }, { type: 'skill', skillId: 'vine' }], mulberry32(5));
    const lines = describeEvents(result.events, 0);
    expect(lines.length).toBeGreaterThanOrEqual(result.events.length);
    expect(lines.every((line) => line.trim().length > 0)).toBe(true);
  });
});
