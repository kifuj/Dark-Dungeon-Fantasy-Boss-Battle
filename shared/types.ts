export type Element = 'feu' | 'eau' | 'nature' | 'lumiere' | 'ombre' | 'neutre';
export type Seat = 0 | 1;

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface SkillDef {
  id: string;
  name: string;
  element: Element;
  power: number; // 0 pour les compétences sans dégâts
  pp: number | null; // null = illimité
  priority?: number; // défaut 0
  effect?: 'heal30' | 'drain50' | 'defUp' | 'atkUp';
}

/** Rareté d'une espèce, déduite de sa puissance (shared/data/rarities.ts). */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'boss';

export interface SpeciesDef {
  id: string;
  name: string;
  element: Element;
  base: BaseStats;
  skills: string[];
  rarity: Rarity;
  sprite: string; // clé de texture Phaser
  /** Évolution en solo : l'espèce devient `into` en atteignant le niveau `level`. */
  evolution?: { into: string; level: number };
}

export interface MonsterInstance {
  uid: string;
  speciesId: string;
  name: string;
  element: Element;
  level: number;
  hp: number;
  maxHp: number;
  stats: { atk: number; def: number; spd: number };
  skills: { id: string; ppLeft: number | null }[];
  /** `atkMult` est absent des duels enregistrés avant l'ajout des boosts d'attaque : lire `atkMult ?? 1`. */
  modifiers: { defMult: number; atkMult?: number };
}

export interface PlayerState {
  userId: string | null; // null pour l'IA
  team: MonsterInstance[];
  activeIndex: number;
}

export interface BattleState {
  round: number;
  turn: number;
  players: [PlayerState, PlayerState];
  /** Phase `draft` (US-18) : espèces proposées à chaque siège ; `null` une fois le combat lancé. */
  draftOffers?: [string[], string[]] | null;
}

export type Action =
  | { type: 'skill'; skillId: string }
  | { type: 'switch'; toIndex: number }
  | { type: 'forfeit' };

export type BattleEvent =
  | { type: 'switch'; seat: Seat; fromIndex: number; toIndex: number; forced: boolean; name: string }
  | { type: 'skill_used'; seat: Seat; actorName: string; skillName: string; skillId: string }
  | { type: 'damage'; targetSeat: Seat; amount: number; hpAfter: number; maxHp: number; effectiveness: number; crit: boolean }
  | { type: 'heal'; seat: Seat; amount: number; hpAfter: number; maxHp: number }
  | { type: 'buff'; seat: Seat; stat: 'def' | 'atk'; mult: number }
  /** Solo uniquement : le monstre du joueur gagne un niveau en mettant un ennemi K.O. (et peut évoluer). */
  | { type: 'level_up'; seat: Seat; speciesId: string; name: string; level: number; evolvedFrom: string | null }
  | { type: 'faint'; seat: Seat; index: number; name: string }
  | { type: 'forfeit'; seat: Seat }
  | { type: 'battle_end'; winnerSeat: Seat };

export interface TurnResult {
  state: BattleState;
  events: BattleEvent[];
  winnerSeat: Seat | null;
}

export type Rng = () => number; // renvoie un nombre dans [0, 1[

// --- Lignes des tables Supabase (docs/03-BASE-DE-DONNEES.md) ---

export interface ProfileRow {
  id: string;
  username: string;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

export interface RoomRow {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  status: RoomStatus;
  current_match_id: string | null;
}

export type MatchPhase = 'draft' | 'battle' | 'reward' | 'finished';

export interface MatchRow {
  id: string;
  room_id: string;
  player1_id: string;
  player2_id: string;
  phase: MatchPhase;
  round: number;
  turn: number;
  seed: number;
  state: BattleState;
  last_events: BattleEvent[];
  version: number;
  turn_deadline: string | null;
  winner_id: string | null;
}
