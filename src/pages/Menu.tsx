import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOngoingMatchId } from '../lib/matches.ts';
import { useProfile } from '../lib/profile.tsx';

const ENTRIES = [
  { to: '/solo', label: 'Solo' },
  { to: '/multi', label: 'Multijoueur' },
  { to: '/guide', label: 'Guide' },
  { to: '/classement', label: 'Classement' },
  { to: '/credits', label: 'Crédits' },
];

/** Menu principal (US-24 CA2), avec la reprise d'un duel en cours (US-21 CA3). */
export function Menu() {
  const { profile } = useProfile();
  const [ongoing, setOngoing] = useState<{ userId: string; matchId: string | null } | null>(null);
  const userId = profile?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchOngoingMatchId(userId)
      .then((matchId) => !cancelled && setOngoing({ userId, matchId }))
      .catch(() => {}); // Supabase injoignable : le menu reste utilisable sans le bouton
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // On ignore une réponse arrivée pour un autre joueur (changement de pseudo entre-temps).
  const resumeId = ongoing && ongoing.userId === userId ? ongoing.matchId : null;

  return (
    <main className="page menu-screen">
      <div className="menu-atmosphere" aria-hidden="true">
        <span className="rune rune-top">✦</span>
        <span className="rune rune-left">✧</span>
        <span className="rune rune-right">✧</span>
        <span className="rune rune-bottom">✦</span>
      </div>
      <section className="menu-panel" aria-label="Menu principal">
        <p className="eyebrow">La nuit attend son champion</p>
        <h1 className="logo logo-small">
          <span className="logo-line">Dark Dungeon Fantasy</span>
          <span className="logo-accent">Boss battle</span>
        </h1>
        <div className="title-rule" aria-hidden="true"><span /></div>
        <p className="menu-status"><span className="status-dot" /> Quartier général opérationnel</p>
        <nav className="menu" aria-label="Modes de jeu">
          {resumeId && (
            <Link to={`/match/${resumeId}`} className="button resume-button" autoFocus>
              <span>Reprendre la partie</span>
              <span className="button-arrow" aria-hidden="true">⚔</span>
            </Link>
          )}
          {ENTRIES.map((entry, i) => (
            <Link key={entry.to} to={entry.to} className="button" autoFocus={i === 0 && !resumeId}>
              <span>{entry.label}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
        <p className="menu-footer">Choisissez votre destinée <span>◆</span> Saison I</p>
      </section>
    </main>
  );
}
