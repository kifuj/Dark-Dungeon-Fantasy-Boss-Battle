import { Link } from 'react-router-dom';

const ENTRIES = [
  { to: '/solo', label: 'Solo' },
  { to: '/multi', label: 'Multijoueur' },
  { to: '/classement', label: 'Classement' },
  { to: '/credits', label: 'Crédits' },
];

/** Menu principal (US-24 CA2). */
export function Menu() {
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
          {ENTRIES.map((entry, i) => (
            <Link key={entry.to} to={entry.to} className="button" autoFocus={i === 0}>
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
