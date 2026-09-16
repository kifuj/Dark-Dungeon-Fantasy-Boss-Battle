import { describe, expect, it } from 'vitest';
import { isRoomCode, makeRoomCode, normalizeRoomCode, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '../engine/rooms.js';
import { mulberry32 } from '../engine/rng.js';

describe('US-16 — code de salon', () => {
  it('génère 6 caractères sans caractère ambigu (CA1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 200; i++) {
      const code = makeRoomCode(rng);
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
      expect(isRoomCode(code)).toBe(true);
      expect(code).not.toMatch(/[01OIL]/); // 0/O et 1/I/L se confondent quand on dicte le code
    }
  });

  it('couvre tout l’alphabet et ne répète pas toujours le même code', () => {
    const rng = mulberry32(7);
    const codes = new Set(Array.from({ length: 500 }, () => makeRoomCode(rng)));
    expect(codes.size).toBeGreaterThan(400);
    const used = new Set([...codes].join(''));
    expect(used.size).toBe(ROOM_CODE_ALPHABET.length);
  });
});

describe('US-17 — saisie du code', () => {
  it('ignore la casse, les espaces et les tirets (CA4)', () => {
    expect(normalizeRoomCode(' k7p2 qx ')).toBe('K7P2QX');
    expect(normalizeRoomCode('k7p-2qx')).toBe('K7P2QX');
    expect(normalizeRoomCode('K7P2QX')).toBe('K7P2QX');
  });

  it('refuse un code de mauvaise longueur ou avec un caractère interdit', () => {
    expect(isRoomCode('K7P2Q')).toBe(false);
    expect(isRoomCode('K7P2QX0')).toBe(false);
    expect(isRoomCode('K7P2QO')).toBe(false); // O n'est pas dans l'alphabet
  });
});
