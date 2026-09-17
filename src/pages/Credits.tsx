import { Link } from 'react-router-dom';
import credits from '../../docs/CREDITS.md?raw';
import { Markdown } from '../lib/markdown.tsx';

/**
 * Page Crédits (US-26) : le contenu vient directement de `docs/CREDITS.md`, embarqué au build.
 * Une seule source à tenir à jour : ajouter un asset dans le fichier suffit à le créditer dans le jeu.
 */
export function Credits() {
  // Le titre « # Crédits » du fichier est remplacé par celui de la page.
  const body = credits.replace(/^#\s+.*\n/, '');
  return (
    <main className="page credits-page">
      <section className="panel credits-panel" aria-label="Crédits">
        <p className="eyebrow">Merci à celles et ceux qui partagent</p>
        <h1>Crédits</h1>
        <Markdown source={body} />
        <Link to="/menu" className="button back-button" data-shortcut="back">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
