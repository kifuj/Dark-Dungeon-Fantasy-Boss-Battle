import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Page vide en attendant l'US correspondante. */
export function Placeholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="page">
      <h2>{title}</h2>
      {children ?? <p>Bientôt disponible.</p>}
      <Link to="/menu" className="button">
        Retour au menu
      </Link>
    </main>
  );
}
