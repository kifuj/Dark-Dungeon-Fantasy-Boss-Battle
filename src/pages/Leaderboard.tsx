import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadLeaderboard, type LeaderboardRow } from '../lib/leaderboard.ts';
import { useProfile } from '../lib/profile.tsx';

/** Page Classement (US-14 CA2) : top 20 des pseudos, triés par meilleur score solo. */
export function Leaderboard() {
  const { profile } = useProfile();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    loadLeaderboard()
      .then((data) => active && setRows(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page centered-page">
      <section className="panel leaderboard-panel" aria-label="Classement">
        <p className="eyebrow">Mode solo · top 20</p>
        <h1>Classement</h1>

        {error ? (
          <p className="form-error" role="alert">Impossible de charger le classement, réessaie.</p>
        ) : !rows ? (
          <p className="loading-line">Chargement…</p>
        ) : rows.length === 0 ? (
          <p>Aucun score pour l’instant. Termine une run solo pour ouvrir le classement !</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Pseudo</th>
                <th scope="col">Score</th>
                <th scope="col">Vague</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.username} className={row.username === profile?.username ? 'leaderboard-me' : undefined}>
                  <td>{i + 1}</td>
                  <td>{row.username}</td>
                  <td>{row.best_score}</td>
                  <td>{row.best_wave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Link to="/solo" className="button">
          <span>Jouer en solo</span>
          <span className="button-arrow" aria-hidden="true">⚔</span>
        </Link>
        <Link to="/menu" className="button back-button">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
