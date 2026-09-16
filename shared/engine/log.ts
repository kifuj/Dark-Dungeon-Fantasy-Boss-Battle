import type { BattleEvent, Seat } from '../types.js';

/**
 * Traduction des événements d'un tour en phrases françaises (US-08 / US-11).
 * Les mêmes phrases seront rejouées une par une, avec les animations, par l'US-09.
 */
export function describeEvent(event: BattleEvent, playerSeat: Seat): string[] {
  const mine = (seat: Seat) => seat === playerSeat;
  switch (event.type) {
    case 'switch':
      return [event.forced ? `${event.name} prend le relais !` : `${event.name} entre en jeu !`];
    case 'skill_used':
      return [`${event.actorName} utilise ${event.skillName} !`];
    case 'damage': {
      const lines = [mine(event.targetSeat) ? `Votre monstre perd ${event.amount} PV.` : `L'ennemi perd ${event.amount} PV.`];
      if (event.crit) lines.push('Coup critique !');
      if (event.effectiveness > 1) lines.push("C'est super efficace !");
      if (event.effectiveness < 1) lines.push("Ce n'est pas très efficace…");
      return lines;
    }
    case 'heal':
      return [`${mine(event.seat) ? 'Votre monstre' : "L'ennemi"} récupère ${event.amount} PV.`];
    case 'buff':
      return [`${mine(event.seat) ? 'Votre monstre' : "L'ennemi"} augmente sa défense !`];
    case 'faint':
      return [`${event.name} est K.O. !`];
    case 'forfeit':
      return [mine(event.seat) ? 'Vous abandonnez le combat.' : "L'adversaire abandonne."];
    case 'battle_end':
      return [mine(event.winnerSeat) ? 'Combat remporté !' : 'Votre équipe est vaincue…'];
  }
}

export const describeEvents = (events: BattleEvent[], playerSeat: Seat): string[] =>
  events.flatMap((event) => describeEvent(event, playerSeat));
