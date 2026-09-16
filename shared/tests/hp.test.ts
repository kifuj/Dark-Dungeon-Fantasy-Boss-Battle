import { describe, expect, it } from 'vitest';
import { hpRatio, hpTier } from '../engine/hp.js';

describe('barre de PV (US-07 CA2)', () => {
  it('calcule un ratio borné entre 0 et 1', () => {
    expect(hpRatio({ hp: 30, maxHp: 60 })).toBe(0.5);
    expect(hpRatio({ hp: -5, maxHp: 60 })).toBe(0);
    expect(hpRatio({ hp: 90, maxHp: 60 })).toBe(1);
    expect(hpRatio({ hp: 10, maxHp: 0 })).toBe(0);
  });

  it('passe au vert au-dessus de 50 %, au jaune au-dessus de 20 %, au rouge en dessous', () => {
    expect(hpTier(1)).toBe('ok');
    expect(hpTier(0.51)).toBe('ok');
    expect(hpTier(0.5)).toBe('warn');
    expect(hpTier(0.21)).toBe('warn');
    expect(hpTier(0.2)).toBe('danger');
    expect(hpTier(0)).toBe('danger');
  });
});
