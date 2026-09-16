// Scénarios de test du multijoueur (docs/04-MULTIJOUEUR.md §11) joués contre le vrai
// projet Supabase : trois sessions anonymes, un salon, un duel complet, un abandon.
// Usage : `npm run test:multi` (lit VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY
// dans .env / .env.local ou dans l'environnement).
import { readFileSync } from 'node:fs';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
        if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
      }
    } catch {
      /* fichier absent : on se contente de l'environnement */
    }
  }
}

loadEnv();
const BASE = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
if (!BASE || !KEY) {
  console.error('VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont nécessaires (voir .env.example).');
  process.exit(1);
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` — attendu ${JSON.stringify(expected)}, reçu ${JSON.stringify(actual)}`}`);
};

async function call(path, { body, token, headers } = {}) {
  const response = await fetch(BASE + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      apikey: KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

/** Session anonyme + profil, comme le fait la page Login (US-15). */
async function anonymousPlayer(username) {
  const { status, body } = await call('/auth/v1/signup', { body: {} });
  if (status !== 200) throw new Error(`connexion anonyme impossible (${status}) : ${JSON.stringify(body)}`);
  const player = { token: body.access_token, id: body.user.id, username };
  await call('/rest/v1/profiles', {
    body: { id: player.id, username },
    token: player.token,
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  });
  return player;
}

const fn = (name, player, body = {}) => call(`/functions/v1/${name}`, { body, token: player.token });
const readMatch = async (player, matchId) => (await call(`/rest/v1/matches?id=eq.${matchId}&select=*`, { token: player.token })).body?.[0] ?? null;
const firstUsableSkill = (row, seat) => {
  const player = row.state.players[seat];
  const monster = player.team[player.activeIndex];
  return monster.skills.find((skill) => skill.ppLeft === null || skill.ppLeft > 0).id;
};

const tag = Math.random().toString(36).slice(2, 6).toUpperCase();
const [A, B, C] = await Promise.all([anonymousPlayer(`TestA-${tag}`), anonymousPlayer(`TestB-${tag}`), anonymousPlayer(`TestC-${tag}`)]);
console.log(`Trois sessions anonymes : ${A.username} (hôte), ${B.username} (invité), ${C.username} (tiers)\n`);

// --- Salon (US-16, US-17) ---
const created = await fn('rooms-create', A);
check('US-16 CA1 rooms-create renvoie un code de 6 caractères', /^[A-Z0-9]{6}$/.test(created.body?.code ?? ''), true);
const { code, roomId } = created.body;
check('US-17 CA4 code accepté en minuscules et avec un espace', (await fn('rooms-join', B, { code: `${code.toLowerCase()} ` })).body.roomId, roomId);
check('US-17 CA3 salon complet', (await fn('rooms-join', C, { code })).body.error, 'ROOM_FULL');
check('US-17 rejoindre deux fois est sans effet', (await fn('rooms-join', B, { code })).body.roomId, roomId);
check('US-17 CA2 code inconnu', (await fn('rooms-join', C, { code: 'ZZZZZZ' })).body.error, 'ROOM_NOT_FOUND');

// --- Lancement (US-19) ---
check('US-16 CA3 seul l’hôte peut lancer', (await fn('match-start', B, { roomId })).body.error, 'NOT_HOST');
const started = await fn('match-start', A, { roomId });
const matchId = started.body.matchId;
check('match-start est idempotent', (await fn('match-start', A, { roomId })).body.matchId, matchId);

let row = await readMatch(A, matchId);
check('US-19 CA1 deux équipes de 3 monstres de niveau 10', row.state.players.map((p) => `${p.team.length}×N${p.team[0].level}`), ['3×N10', '3×N10']);
check('RLS : un tiers ne voit pas la ligne du match', await readMatch(C, matchId), null);

// --- Actions (US-19 CA4, CA5) ---
const turnBody = (skillId) => ({ matchId, round: row.round, turn: row.turn, action: { type: 'skill', skillId } });
check('M7 compétence inconnue → INVALID_ACTION', (await fn('match-action', A, turnBody('sort_inexistant'))).body.error, 'INVALID_ACTION');
check('M6 non-joueur → NOT_A_PLAYER', (await fn('match-action', C, turnBody(firstUsableSkill(row, 0)))).body.error, 'NOT_A_PLAYER');
check('tour dépassé → STALE_TURN', (await fn('match-action', A, { matchId, round: row.round, turn: 99, action: { type: 'skill', skillId: firstUsableSkill(row, 0) } })).body.error, 'STALE_TURN');
check('US-19 CA2 première action → waiting', (await fn('match-action', A, turnBody(firstUsableSkill(row, 0)))).body.status, 'waiting');
check('M2 double envoi → ALREADY_PLAYED', (await fn('match-action', A, turnBody(firstUsableSkill(row, 0)))).body.error, 'ALREADY_PLAYED');
check('US-19 CA3 deuxième action → resolved', (await fn('match-action', B, turnBody(firstUsableSkill(row, 1)))).body.status, 'resolved');

const afterTurn = await readMatch(A, matchId);
check('le tour avance et la version augmente', [afterTurn.turn, afterTurn.version], [row.turn + 1, row.version + 1]);
check('les deux joueurs lisent la même version', (await readMatch(B, matchId)).version, afterTurn.version);

// --- Duel joué jusqu'à la victoire (M5) ---
row = afterTurn;
let turns = 1;
while (row.phase === 'battle' && turns < 60) {
  await fn('match-action', A, { matchId, round: row.round, turn: row.turn, action: { type: 'skill', skillId: firstUsableSkill(row, 0) } });
  await fn('match-action', B, { matchId, round: row.round, turn: row.turn, action: { type: 'skill', skillId: firstUsableSkill(row, 1) } });
  row = await readMatch(A, matchId);
  turns++;
}
check('M5 le duel se termine sur une victoire', [row.phase, row.winner_id === A.id || row.winner_id === B.id], ['finished', true]);
check('M5 le dernier événement est battle_end', row.last_events.at(-1).type, 'battle_end');
check('le salon passe en finished', (await call(`/rest/v1/rooms?id=eq.${roomId}&select=status`, { token: A.token })).body[0].status, 'finished');
check('historique : un enregistrement par tour', (await call(`/rest/v1/match_turns?match_id=eq.${matchId}&select=turn`, { token: A.token })).body.length, turns);
const mine = (await call(`/rest/v1/match_actions?match_id=eq.${matchId}&select=player_id`, { token: A.token })).body;
check('RLS : chacun ne voit que ses propres actions', mine.every((action) => action.player_id === A.id), true);
console.log(`   (duel joué en ${turns} tours)`);

// --- Abandon (US-23) ---
const room2 = (await fn('rooms-create', A)).body;
await fn('rooms-join', B, { code: room2.code });
const match2 = (await fn('match-start', A, { roomId: room2.roomId })).body.matchId;
check('US-23 abandon refusé à un tiers', (await fn('match-forfeit', C, { matchId: match2 })).body.error, 'NOT_A_PLAYER');
check('US-23 CA2 abandon → match terminé', (await fn('match-forfeit', B, { matchId: match2 })).body.status, 'finished');
const forfeited = await readMatch(A, match2);
check('US-23 CA2 la victoire revient à l’adversaire', [forfeited.winner_id === A.id, forfeited.last_events.map((e) => e.type)], [true, ['forfeit', 'battle_end']]);
check('US-23 abandonner deux fois est sans effet', (await fn('match-forfeit', B, { matchId: match2 })).body.status, 'finished');

console.log(`\n${failures === 0 ? 'Tous les scénarios passent.' : `${failures} scénario(s) en échec.`}`);
process.exit(failures === 0 ? 0 : 1);
