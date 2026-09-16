// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import type { MonsterInstance } from '../types.ts';

/** Palier de la barre de PV (US-07 CA2) : vert > 50 %, jaune > 20 %, rouge sinon. */
export type HpTier = 'ok' | 'warn' | 'danger';

export function hpRatio(monster: Pick<MonsterInstance, 'hp' | 'maxHp'>): number {
  if (monster.maxHp <= 0) return 0;
  return Math.min(1, Math.max(0, monster.hp / monster.maxHp));
}

export function hpTier(ratio: number): HpTier {
  if (ratio > 0.5) return 'ok';
  if (ratio > 0.2) return 'warn';
  return 'danger';
}
