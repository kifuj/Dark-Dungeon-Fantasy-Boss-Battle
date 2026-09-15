import { useLayoutEffect, useRef } from 'react';
import { Game } from 'phaser';
import { gameConfig } from './config.ts';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const game = new Game({ ...gameConfig, parent: containerRef.current! });
    return () => game.destroy(true); // indispensable (StrictMode monte 2 fois en dev)
  }, []);

  return <div ref={containerRef} className="game-container" />;
}
