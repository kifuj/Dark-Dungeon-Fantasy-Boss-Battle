import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const NEXT_KEYS = ['ArrowDown', 'ArrowRight'];
const PREVIOUS_KEYS = ['ArrowUp', 'ArrowLeft'];

const isVisible = (element: HTMLElement) => element.getClientRects().length > 0 && !element.closest('[aria-hidden="true"]');

/** Éléments atteignables au clavier dans la page, dans l'ordre du document. */
export function focusableElements(root: ParentNode = document): HTMLElement[] {
  const scope = root.querySelector('main') ?? root;
  return [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible);
}

const isTextField = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || (element instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'submit'].includes(element.type));

/**
 * Contrôle complet au clavier, sur toutes les pages :
 * - flèches : passer d'un bouton ou d'un lien à l'autre (Tab marche aussi) ; Entrée ou Espace : valider ;
 * - Échap : bouton « retour » de la page (`data-shortcut="back"`), s'il y en a un ;
 * - une touche indiquée par `data-key` sur un bouton (ex. « 1 » à « 4 » en combat) le déclenche ;
 * - à chaque changement de page, le premier bouton ou lien reçoit le focus (si rien ne l'a déjà pris).
 * Un composant qui gère lui-même une touche appelle `preventDefault()` : ce raccourci global s'efface.
 */
export function useKeyboardNavigation() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Après le rendu de la nouvelle page : `autoFocus` n'agit pas sur les liens, d'où ce filet.
    const timer = setTimeout(() => {
      if (document.activeElement && document.activeElement !== document.body) return;
      focusableElements()[0]?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const active = document.activeElement;
      const typing = isTextField(active);

      if (event.key === 'Escape') {
        const back = document.querySelector<HTMLElement>('[data-shortcut="back"]');
        if (back && isVisible(back)) {
          event.preventDefault();
          back.click();
        }
        return;
      }

      if (!typing && event.key.length === 1) {
        const target = [...document.querySelectorAll<HTMLElement>('[data-key]')].find(
          (element) => element.dataset.key?.toLowerCase() === event.key.toLowerCase() && isVisible(element) && !(element as HTMLButtonElement).disabled,
        );
        if (target) {
          event.preventDefault();
          target.click();
          return;
        }
      }

      const next = NEXT_KEYS.includes(event.key);
      const previous = PREVIOUS_KEYS.includes(event.key);
      if (!next && !previous) return;
      // Dans un champ texte, les flèches gauche/droite déplacent le curseur.
      if (typing && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
      const elements = focusableElements();
      if (elements.length === 0) return;
      event.preventDefault();
      const index = elements.indexOf(active as HTMLElement);
      if (index === -1) {
        elements[next ? 0 : elements.length - 1].focus();
        return;
      }
      elements[(index + (next ? 1 : -1) + elements.length) % elements.length].focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
