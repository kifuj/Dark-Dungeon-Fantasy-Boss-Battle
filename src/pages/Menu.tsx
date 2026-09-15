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
    <main className="page">
      <h1 className="logo logo-small">
        Dark Dungeon Fantasy <span>Boss battle</span>
      </h1>
      <nav className="menu">
        {ENTRIES.map((entry, i) => (
          <Link key={entry.to} to={entry.to} className="button" autoFocus={i === 0}>
            {entry.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
