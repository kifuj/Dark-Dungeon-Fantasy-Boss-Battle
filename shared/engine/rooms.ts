import type { Rng } from '../types.js';

/** Codes de salon (US-16, US-17). Sans 0, O, 1, I ni L : illisibles quand on dicte un code. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;

export function makeRoomCode(rng: Rng): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () => ROOM_CODE_ALPHABET[Math.floor(rng() * ROOM_CODE_ALPHABET.length)]).join('');
}

/** La saisie ignore la casse, les espaces et les tirets (US-17 CA4). */
export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const isRoomCode = (code: string): boolean => new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`).test(code);
