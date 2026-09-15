import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Écran titre (US-24 CA1) : n'importe quelle touche ou un clic ouvre le menu. */
export function Title() {
  const navigate = useNavigate();

  useEffect(() => {
    const start = () => navigate('/menu');
    window.addEventListener('keydown', start);
    return () => window.removeEventListener('keydown', start);
  }, [navigate]);

  return (
    <main className="page title-screen" onClick={() => navigate('/menu')}>
      <h1 className="logo">
        Rogue <span>Arena</span>
      </h1>
      <p className="blink">Appuyer pour commencer</p>
    </main>
  );
}
