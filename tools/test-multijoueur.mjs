// Scénarios de test du multijoueur (docs/04-MULTIJOUEUR.md §11) joués contre le vrai
// projet Supabase : trois sessions anonymes, un salon, un draft, un duel complet, un abandon,
// un timeout de tour, le choix du remplaçant après un KO.
// Usage : `npm run test:multi` (lit VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY
// dans .env / .env.local ou dans l'environnement). Avec SUPABASE_ACCESS_TOKEN, la deadline
// du tour est avancée en SQL pour tester le timeout tout de suite ; sans, on attend 62 s.
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

/** Sièges dont le monstre actif est KO avec encore un monstre en vie : ils doivent choisir un remplaçant. */
const koSeats = (row) =>
  [0, 1].filter((seat) => {
    const player = row.state.players[seat];
    return player.team[player.activeIndex].hp <= 0 && player.team.some((m) => m.hp > 0);
  });

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
check('RLS : un tiers ne voit pas la ligne du match', await readMatch(C, matchId), null);

// --- Draft (US-18) ---
check('US-18 le match démarre en phase draft, tour 0', [row.phase, row.turn], ['draft', 0]);
check('US-18 CA1 six offres distinctes par joueur', row.state.draftOffers.map((offer) => new Set(offer).size), [6, 6]);
check('US-18 équipes vides pendant le draft', row.state.players.map((p) => p.team.length), [0, 0]);
check('US-18 action de combat refusée pendant le draft', (await fn('match-action', A, { matchId, round: 1, turn: 0, action: { type: 'skill', skillId: 'strike' } })).body.error, 'WRONG_PHASE');
check('US-18 draft avec un doublon → INVALID_ACTION', (await fn('match-draft', A, { matchId, picks: [0, 0, 1] })).body.error, 'INVALID_ACTION');
check('US-18 draft de 2 monstres → INVALID_ACTION', (await fn('match-draft', A, { matchId, picks: [0, 1] })).body.error, 'INVALID_ACTION');
check('US-18 draft par un tiers → NOT_A_PLAYER', (await fn('match-draft', C, { matchId, picks: [0, 1, 2] })).body.error, 'NOT_A_PLAYER');
check('US-18 premier draft → waiting', (await fn('match-draft', A, { matchId, picks: [5, 0, 2] })).body.status, 'waiting');
check('US-18 double envoi du draft → ALREADY_PLAYED', (await fn('match-draft', A, { matchId, picks: [1, 2, 3] })).body.error, 'ALREADY_PLAYED');
const hostDraftSeenByGuest = (await call(`/rest/v1/match_actions?match_id=eq.${matchId}&phase=eq.draft&select=player_id`, { token: B.token })).body;
check('US-18 CA2 le choix de l’hôte est invisible pour l’invité', hostDraftSeenByGuest, []);
check('US-18 CA2 le combat n’a pas commencé', (await readMatch(B, matchId)).phase, 'draft');
check('US-18 CA3 second draft → resolved', (await fn('match-draft', B, { matchId, picks: [1, 3, 4] })).body.status, 'resolved');
check('US-18 draft après le lancement → WRONG_PHASE', (await fn('match-draft', B, { matchId, picks: [1, 3, 4] })).body.error, 'WRONG_PHASE');

const offers = row.state.draftOffers;
row = await readMatch(A, matchId);
check('US-18 CA3 le combat démarre au tour 1', [row.phase, row.turn, row.state.draftOffers], ['battle', 1, null]);
check('US-18 CA3 les équipes sont celles choisies, dans l’ordre', row.state.players.map((p) => p.team.map((m) => m.speciesId)), [
  [5, 0, 2].map((i) => offers[0][i]),
  [1, 3, 4].map((i) => offers[1][i]),
]);
check('US-19 CA1 deux équipes de 3 monstres de niveau 10', row.state.players.map((p) => `${p.team.length}×N${p.team[0].level}`), ['3×N10', '3×N10']);

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

// --- Duel joué jusqu'à la victoire (M5), avec choix du remplaçant après chaque KO ---
row = afterTurn;
let turns = 1;
let replacementChecked = false;
while (row.phase === 'battle' && turns < 80) {
  const ko = koSeats(row);
  if (ko.length > 0) {
    const seat = ko[0];
    const [koPlayer, other] = seat === 0 ? [A, B] : [B, A];
    const alive = row.state.players[seat].team.map((m, i) => (m.hp > 0 ? i : -1)).filter((i) => i !== -1);
    const choice = alive.at(-1); // le dernier monstre en vie : ce n'est pas le choix automatique
    const at = { matchId, round: row.round, turn: row.turn };
    if (!replacementChecked) {
      const otherSeat = seat === 0 ? 1 : 0;
      check('KO : l’adversaire ne joue pas pendant le choix du remplaçant', (await fn('match-action', other, { ...at, action: { type: 'skill', skillId: firstUsableSkill(row, otherSeat) } })).body.error, 'INVALID_ACTION');
      check('KO : le joueur KO ne peut que changer de monstre', (await fn('match-action', koPlayer, { ...at, action: { type: 'skill', skillId: row.state.players[seat].team[row.state.players[seat].activeIndex].skills[0].id } })).body.error, 'INVALID_ACTION');
    }
    const status = (await fn('match-action', koPlayer, { ...at, action: { type: 'switch', toIndex: choice } })).body.status;
    const before = row;
    row = await readMatch(A, matchId);
    if (!replacementChecked) {
      check('KO : le choix du seul joueur concerné résout le tour', status, 'resolved');
      check('KO : le monstre choisi entre en combat', [row.state.players[seat].activeIndex, row.turn], [choice, before.turn + 1]);
      check('KO : un seul événement, un changement forcé', row.last_events.map((e) => [e.type, e.seat, e.toIndex, e.forced]), [['switch', seat, choice, true]]);
      replacementChecked = true;
    }
  } else {
    await fn('match-action', A, { matchId, round: row.round, turn: row.turn, action: { type: 'skill', skillId: firstUsableSkill(row, 0) } });
    await fn('match-action', B, { matchId, round: row.round, turn: row.turn, action: { type: 'skill', skillId: firstUsableSkill(row, 1) } });
    row = await readMatch(A, matchId);
  }
  turns++;
}
check('KO : au moins un remplacement choisi pendant le duel', replacementChecked, true);
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
check('US-23 abandon possible pendant le draft', (await readMatch(A, match2)).phase, 'draft');
check('US-23 abandon refusé à un tiers', (await fn('match-forfeit', C, { matchId: match2 })).body.error, 'NOT_A_PLAYER');
check('US-23 CA2 abandon → match terminé', (await fn('match-forfeit', B, { matchId: match2 })).body.status, 'finished');
const forfeited = await readMatch(A, match2);
check('US-23 CA2 la victoire revient à l’adversaire', [forfeited.winner_id === A.id, forfeited.last_events.map((e) => e.type)], [true, ['forfeit', 'battle_end']]);
check('US-23 abandonner deux fois est sans effet', (await fn('match-forfeit', B, { matchId: match2 })).body.status, 'finished');

// --- Timeout de tour (US-20, M3) ---
const PROJECT_REF = new URL(BASE).hostname.split('.')[0];
/** Fait comme si la deadline du tour était passée depuis 5 s (API de gestion Supabase), sinon attend 62 s. */
async function adminSql(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(`requête SQL refusée (${response.status})`);
}

async function expireDeadline(id) {
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    console.log('   (pas de SUPABASE_ACCESS_TOKEN : attente réelle de 62 s)');
    await new Promise((resolve) => setTimeout(resolve, 62_000));
    return;
  }
  await adminSql(`update public.matches set turn_deadline = now() - interval '5 seconds' where id = '${id}'`);
}

const room3 = (await fn('rooms-create', A)).body;
await fn('rooms-join', B, { code: room3.code });
const match3 = (await fn('match-start', A, { roomId: room3.roomId })).body.matchId;
check('US-20 CA3 timeout réclamé avant la deadline → TOO_EARLY', (await fn('match-timeout', A, { matchId: match3 })).body.error, 'TOO_EARLY');
check('US-20 timeout réclamé par un tiers → NOT_A_PLAYER', (await fn('match-timeout', C, { matchId: match3 })).body.error, 'NOT_A_PLAYER');
await fn('match-draft', A, { matchId: match3, picks: [2, 1, 0] });
await expireDeadline(match3);
check('US-20 draft absent : le timeout lance le combat', (await fn('match-timeout', A, { matchId: match3 })).body.status, 'resolved');
row = await readMatch(A, match3);
const offers3 = row.state.players.map((p) => p.team.map((m) => m.speciesId));
check('US-20 draft absent : l’invité reçoit ses 3 premières propositions', [row.phase, offers3[0].length, offers3[1].length], ['battle', 3, 3]);
check('US-20 CA1 une nouvelle deadline d’environ 60 s est fixée', Math.round((Date.parse(row.turn_deadline) - Date.now()) / 10_000), 6);

const skillA = firstUsableSkill(row, 0);
await fn('match-action', A, { matchId: match3, round: row.round, turn: row.turn, action: { type: 'skill', skillId: skillA } });
check('US-20 CA3 tour pas encore expiré → TOO_EARLY', (await fn('match-timeout', A, { matchId: match3 })).body.error, 'TOO_EARLY');
await expireDeadline(match3);
check('US-20 CA2 à 0, le tour est résolu pour le joueur absent', (await fn('match-timeout', A, { matchId: match3 })).body.status, 'resolved');
const timedOut = await readMatch(A, match3);
check('US-20 CA2 le tour avance', [timedOut.turn, timedOut.version], [row.turn + 1, row.version + 1]);
const guestUsed = timedOut.last_events.find((e) => e.type === 'skill_used' && e.seat === 1)?.skillId;
check('US-20 CA2 l’invité a joué sa première compétence disponible', guestUsed, firstUsableSkill(row, 1));
check('US-20 l’action de l’hôte a été gardée', timedOut.last_events.find((e) => e.type === 'skill_used' && e.seat === 0)?.skillId, skillA);
const autoFlags = (await call(`/rest/v1/match_actions?match_id=eq.${match3}&phase=eq.battle&select=is_auto`, { token: B.token })).body;
check('US-20 l’action de l’invité est marquée is_auto', autoFlags, [{ is_auto: true }]);
check('US-20 un second appel ne rejoue pas le tour', (await fn('match-timeout', B, { matchId: match3 })).body.error, 'TOO_EARLY');
if (process.env.SUPABASE_ACCESS_TOKEN) {
  // Timeout pendant un choix de remplaçant : le monstre actif de l'invité est mis KO en SQL.
  await adminSql(`update public.matches set state = jsonb_set(state, '{players,1,team,${timedOut.state.players[1].activeIndex},hp}', '0') where id = '${match3}'`);
  await expireDeadline(match3);
  check('KO + timeout : le tour de remplacement est résolu', (await fn('match-timeout', A, { matchId: match3 })).body.status, 'resolved');
  const replaced = await readMatch(A, match3);
  const firstAlive = replaced.state.players[1].team.findIndex((m) => m.hp > 0);
  check('KO + timeout : seul l’invité absent est remplacé, par son premier monstre en vie', replaced.last_events.map((e) => [e.type, e.seat, e.toIndex, e.forced]), [['switch', 1, firstAlive, true]]);
}
await fn('match-forfeit', A, { matchId: match3 });
check('US-20 timeout après la fin du duel → nothing_to_do', (await fn('match-timeout', B, { matchId: match3 })).body.status, 'nothing_to_do');

console.log(`\n${failures === 0 ? 'Tous les scénarios passent.' : `${failures} scénario(s) en échec.`}`);
process.exit(failures === 0 ? 0 : 1);
