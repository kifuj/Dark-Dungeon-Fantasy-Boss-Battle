import { SPECIES } from '../../shared/data/monsters.js';

/**
 * Affiche la 1ʳᵉ image de la spritesheet d'une espèce (64 × 64), agrandie sans flou.
 * Sert dans les écrans React ; en combat, c'est Phaser qui dessine les monstres.
 */
export function MonsterSprite({ speciesId, scale = 2 }: { speciesId: string; scale?: number }) {
  const sprite = SPECIES[speciesId].sprite;
  const size = 64 * scale;
  return (
    <span
      className="monster-sprite"
      role="img"
      aria-label={SPECIES[speciesId].name}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/assets/sprites/monsters/${sprite}.png)`,
        backgroundSize: `${size * 2}px ${size}px`,
      }}
    />
  );
}
