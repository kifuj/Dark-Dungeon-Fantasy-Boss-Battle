import { setMusicMuted, useMusicMuted } from '../lib/music.ts';

/** Bouton son de la musique de combat ; la touche M fait la même chose. */
export function MusicToggle() {
  const muted = useMusicMuted();
  return (
    <button
      type="button"
      className="music-toggle"
      data-key="m"
      aria-pressed={!muted}
      aria-label={muted ? 'Activer la musique (M)' : 'Couper la musique (M)'}
      onClick={() => setMusicMuted(!muted)}
    >
      <kbd className="key-hint" aria-hidden="true">M</kbd>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
