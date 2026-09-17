import type { BattleEvent } from '../../shared/types.js';

/**
 * Un tour animé dure moins de 4 s (US-09 CA4). Au-delà, la page considère la scène en échec
 * (pas encore chargée, canvas en erreur, onglet en arrière-plan) et applique le tour quand même.
 */
export const ANIMATION_TIMEOUT_MS = 4500;

/** Budget d'un tour animé (US-09 CA4). */
export const TURN_ANIMATION_BUDGET_MS = 4000;

/**
 * Durée (ms) allouée à chaque type d'événement rejoué (US-09 CA1). Calibrée pour qu'un tour
 * chargé — deux attaques avec drain, un KO et un remplacement — reste sous le budget de 4 s.
 */
export const EVENT_DURATION: Record<BattleEvent['type'], number> = {
  skill_used: 450,
  damage: 500,
  heal: 400,
  buff: 400,
  level_up: 600,
  faint: 500,
  switch: 350,
  forfeit: 0,
  battle_end: 0,
};

export const turnAnimationDuration = (events: BattleEvent[]) => events.reduce((total, event) => total + EVENT_DURATION[event.type], 0);
