import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useKeyboardNavigation } from '../lib/keyboard.ts';

function Page({ onBack, onSkill }: { onBack: () => void; onSkill: () => void }) {
  useKeyboardNavigation();
  return (
    <main>
      <button type="button">Premier</button>
      <button type="button" disabled>
        Grisé
      </button>
      <button type="button" data-key="1" onClick={onSkill}>
        Compétence
      </button>
      <input aria-label="Pseudo" />
      <button type="button" data-shortcut="back" onClick={onBack}>
        Retour
      </button>
    </main>
  );
}

// jsdom ne calcule pas de mise en page : chaque élément est considéré comme affiché.
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderPage = (props: { onBack: () => void; onSkill: () => void }) =>
  render(
    <MemoryRouter>
      <Page {...props} />
    </MemoryRouter>,
  );

describe('Contrôle au clavier', () => {
  it('met le focus sur le premier bouton de la page', async () => {
    vi.useFakeTimers();
    renderPage({ onBack: vi.fn(), onSkill: vi.fn() });
    await act(async () => vi.advanceTimersByTime(100));
    expect(document.activeElement?.textContent).toBe('Premier');
    vi.useRealTimers();
  });

  it('passe d’un élément à l’autre avec les flèches, en sautant les boutons grisés', () => {
    renderPage({ onBack: vi.fn(), onSkill: vi.fn() });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Premier');
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe('Compétence');
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(document.activeElement?.textContent).toBe('Premier');
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(document.activeElement?.textContent).toBe('Retour'); // on boucle
  });

  it('déclenche le bouton d’une touche et le retour avec Échap', () => {
    const onBack = vi.fn();
    const onSkill = vi.fn();
    renderPage({ onBack, onSkill });
    fireEvent.keyDown(window, { key: '1' });
    expect(onSkill).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('laisse les touches au champ texte', () => {
    const onSkill = vi.fn();
    renderPage({ onBack: vi.fn(), onSkill });
    const input = screen.getByRole('textbox', { name: 'Pseudo' });
    input.focus();
    fireEvent.keyDown(input, { key: '1' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(onSkill).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });
});
