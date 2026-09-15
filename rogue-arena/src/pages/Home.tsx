import { PhaserGame } from '../game/PhaserGame.tsx';

/** Page d'accueil provisoire (US-01) : vérifie que le canvas Phaser s'affiche. */
export function Home() {
  return (
    <main className="page">
      <PhaserGame />
    </main>
  );
}
