import { useEffect, useSyncExternalStore } from 'react';

/**
 * Musique de combat (public/assets/musics) : une seule piste en boucle, jouée pendant les
 * combats solo et les duels. Le choix « son coupé » est retenu par le navigateur.
 */
export const BATTLE_MUSIC_URL = '/assets/musics/boss-battle-retro-rock.mp3';
const VOLUME = 0.35;
const MUTED_KEY = 'ddfbb-music-muted';

const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
let wanted = false;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

// jsdom (tests) n'implémente pas la lecture audio.
const canPlay = () => typeof window !== 'undefined' && typeof Audio !== 'undefined' && !navigator.userAgent.includes('jsdom');

function track(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(BATTLE_MUSIC_URL);
    audio.loop = true;
    audio.volume = VOLUME;
  }
  return audio;
}

/** Le navigateur refuse la lecture avant une première interaction : on réessaie au prochain clic ou appui. */
function retryOnInteraction() {
  const retry = () => {
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('keydown', retry);
    sync();
  };
  window.addEventListener('pointerdown', retry, { once: true });
  window.addEventListener('keydown', retry, { once: true });
}

function sync() {
  if (!canPlay()) return;
  const player = track();
  if (wanted && !muted) {
    if (player.paused) player.play().catch(retryOnInteraction);
  } else {
    player.pause();
  }
}

export function setMusicMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTED_KEY, value ? '1' : '0');
  } catch {
    // stockage indisponible (navigation privée) : le choix vaut pour cette visite
  }
  sync();
  listeners.forEach((listener) => listener());
}

export function useMusicMuted(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => muted,
  );
}

/** Lance la musique tant que `active` est vrai (et que le son n'est pas coupé). */
export function useBattleMusic(active: boolean) {
  useEffect(() => {
    if (!active) return;
    wanted = true;
    sync();
    return () => {
      wanted = false;
      sync();
    };
  }, [active]);
}
