# 07 — Installation et déploiement

| Partie | Hébergée sur | Déploiement |
|---|---|---|
| Front (build Vite `dist/`) | **Render** — Static Site | Automatique à chaque push sur `main` |
| Serveur autoritaire (`supabase/functions/`) | **Supabase Edge Functions** | `npx supabase functions deploy` |
| BDD, Auth, Realtime | **Supabase** | Migration SQL exécutée une fois |

## 0. Prérequis

| Outil | Version | Vérifier |
|---|---|---|
| Node.js | 22 ou 24 (LTS) | `node -v` |
| npm | fourni avec Node | `npm -v` |
| Git | récent | `git --version` |
| Comptes | GitHub, [Render](https://render.com) (connexion avec GitHub), [Supabase](https://supabase.com) | — |
| Docker *(optionnel)* | récent | Seulement pour exécuter les Edge Functions en local (§5) |

## 1. Créer le projet (une seule fois, par une personne)

```bash
# à la racine du dépôt (qui contient déjà README.md et docs/)
npm create vite@latest . -- --template react-ts
# si Vite signale que le dossier n'est pas vide → choisir "Ignore files and continue"

npm install
npm install phaser @supabase/supabase-js react-router-dom
npm install -D vitest supabase
```

Créer les dossiers :

```bash
mkdir -p shared/data shared/engine shared/tests \
         src/game/scenes src/lib src/pages src/components \
         public/assets/sprites public/assets/ui public/assets/fonts public/assets/audio \
         supabase/migrations supabase/functions/_shared
```

### `package.json` (scripts)

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "oxlint"
  }
}
```

### TypeScript : inclure `shared/`

Dans `tsconfig.app.json`, ajouter `shared` à `include` :

```json
{ "include": ["src", "shared"] }
```

> `supabase/functions/` n'est **pas** inclus : ce code tourne sous **Deno**, pas sous Node. Il est typé par Deno (extension VS Code *Deno* activée uniquement sur ce dossier).

### `supabase/functions/deno.json`

```json
{
  "unstable": ["sloppy-imports"]
}
```

> `shared/` importe ses fichiers avec l'extension `.js` (`from './damage.js'`) alors qu'ils sont en `.ts`. Vite le comprend, Deno non par défaut : `sloppy-imports` l'autorise. **À vérifier dès le début du sprint 3** en déployant une fonction qui importe `shared/engine`. Plan B si le bundler refuse : copier `shared/` dans `supabase/functions/_shared/engine/` avant chaque déploiement (script npm).

### Réécriture SPA

Render sert des fichiers statiques : sans règle de réécriture, un rafraîchissement sur `/menu` ou `/match/123` donne une **404**.

⚠️ **Render ne lit pas de fichier `_redirects`** (contrairement à Netlify) : un `public/_redirects` a été essayé au sprint 2, il est servi comme un fichier ordinaire et ne change rien. Les deux seules méthodes qui fonctionnent sont :

1. **Dashboard** (méthode retenue, §4.1 étape 5) : le Static Site → onglet **Redirects/Rewrites** → `Source /*`, `Destination /index.html`, `Action Rewrite`.
2. **Blueprint** : le fichier [`render.yaml`](../render.yaml) à la racine déclare la même règle, mais il n'est appliqué que si le service est géré par un Blueprint (Render → *New* → *Blueprint*, ou *Settings* → lier le blueprint). Un service créé à la main dans le dashboard **n'applique pas** `render.yaml` tant qu'il n'est pas relié.

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```


### `.env.example` (à commiter)

```bash
# --- Client (exposées au navigateur, préfixe VITE_) ---
# En local : dans .env.local. En production : dans Render → Environment.
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# --- Serveur (Edge Functions) ---
# Rien à renseigner : Supabase injecte automatiquement SUPABASE_URL et
# SUPABASE_SERVICE_ROLE_KEY dans les fonctions déployées.
```

### `.gitignore` (vérifier la présence de)

```
node_modules
dist
.env
.env.local
.env*.local
supabase/.temp
supabase/.branches
```

### Client Supabase

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
```

> Sur un ancien projet Supabase, les clés s'appellent `anon` (client) et `service_role` (serveur). Elles fonctionnent de la même façon : il suffit de mettre leurs valeurs dans les mêmes variables.

## 2. Supabase

1. **New project** : nom `dark-dungeon-fantasy-boss-battle`, région **Europe West (Paris)**, noter le mot de passe de la BDD.
2. **SQL Editor → New query** : coller `supabase/migrations/001_init.sql` ([doc 03](03-BASE-DE-DONNEES.md#2-migration-sql)) puis **Run**.
3. **Authentication → Sign In / Providers** : activer **Allow anonymous sign-ins**.
4. **Database → Publications** : vérifier que `rooms` et `matches` sont dans `supabase_realtime`.
5. **Project Settings → API Keys** : copier l'URL du projet et la clé publishable (la clé secrète n'est jamais copiée ailleurs : les Edge Functions la reçoivent automatiquement).

Test rapide de connexion anonyme (dans l'app ou la console du navigateur) :

```ts
const { data, error } = await supabase.auth.signInAnonymously();
console.log(data.user?.id, error);
```

### 2.1 Edge Functions

```bash
npx supabase login
npx supabase init                              # une seule fois : crée supabase/config.toml
npx supabase link --project-ref <ref-du-projet> # ref = xxxxxxxx dans https://xxxxxxxx.supabase.co
npx supabase functions new match-action        # crée supabase/functions/match-action/index.ts
npx supabase functions deploy                  # déploie toutes les fonctions
npx supabase functions deploy match-action     # ou une seule
```

- Les fonctions sont appelables à `https://<ref>.supabase.co/functions/v1/<nom>` ; le client passe par `supabase.functions.invoke('<nom>')` ([doc 05 §5](05-API.md#5-appeler-lapi-depuis-le-client)).
- La vérification du JWT par la passerelle Supabase reste **activée** (valeur par défaut) : un appel sans session est refusé avant d'atteindre la fonction.
- Les dossiers qui commencent par `_` (`_shared/`) ne sont pas déployés comme fonctions.

## 3. GitHub

```bash
git init
git add .
git commit -m "chore: initialisation du projet"
git branch -M main
git remote add origin https://github.com/<organisation-ou-pseudo>/dark-dungeon-fantasy-boss-battle.git
git push -u origin main
```

- Repo **public** (exigé par le TP) → relire [08-CONVENTIONS §4](08-CONVENTIONS.md#4-assets-et-licences) avant de commiter des assets.
- *Settings → Collaborators* : ajouter les membres de l'équipe.
- *Settings → Branches* : protéger `main` (PR obligatoire, 1 relecture).

## 4. Render

### 4.1 Premier déploiement
1. [dashboard.render.com](https://dashboard.render.com) → **New → Static Site** → connecter le repo GitHub `dark-dungeon-fantasy-boss-battle`.
2. Branche : `main`. Build Command : `npm ci && npm run build`. Publish Directory : `dist`.
3. **Environment** : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. **Deploy Static Site**.
5. **Redirects/Rewrites** : ajouter la règle Source `/*` → Destination `/index.html`, Action **Rewrite** (indispensable pour les routes du front, voir §1).

URL de production : **https://dark-dungeon-fantasy-boss-battle.onrender.com**

### 4.2 Déploiements suivants
- Push sur `main` → déploiement en **production** automatique (*Auto-Deploy* activé).
- **Pull Request Previews** (*Settings → PR Previews*) : chaque PR obtient sa propre URL de preview, à tester avant de fusionner (ça fait partie de la DoD).
- Les variables `VITE_…` sont intégrées **au moment du build** : après les avoir modifiées, relancer un déploiement (*Manual Deploy → Clear build cache & deploy*).
- Les Edge Functions ne sont **pas** déployées par Render : après une modification de `supabase/functions/`, lancer `npx supabase functions deploy` (§2.1).

## 5. Développement local

```bash
cp .env.example .env.local   # renseigner l'URL et la clé publishable Supabase
npm run dev                  # front sur http://localhost:5173
```

| Commande | Quand l'utiliser |
|---|---|
| `npm run dev` | Front et Phaser. Les appels aux Edge Functions partent vers le projet Supabase en ligne |
| `npx supabase functions deploy <nom>` | Tester une fonction modifiée sans Docker : la déployer puis rejouer le scénario avec `npm run dev` |
| `npx supabase start` puis `npx supabase functions serve` | Exécuter les fonctions en local (**Docker requis**) |
| `npm test` | Moteur de combat en mode watch |
| `npm run build` | Vérifier que le build passe **avant chaque PR** |

## 6. Checklist de mise en production

- [ ] `npm run build` passe en local
- [ ] `npx vitest run` passe
- [ ] Les 2 variables `VITE_…` sont présentes sur Render
- [ ] La règle de réécriture `/*` → `/index.html` est active (rafraîchir `/menu` ne donne pas de 404)
- [ ] Les Edge Functions sont déployées avec la même version de `shared/` que le front
- [ ] La preview de la PR est testée : connexion, solo, multi sur 2 navigateurs
- [ ] Aucune clé secrète dans le code (`git grep -n "sb_secret"` ne renvoie rien)
- [ ] `docs/CREDITS.md` est à jour si des assets ont été ajoutés
- [ ] Le dashboard Supabase a été ouvert récemment (projet non mis en pause)

## 7. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| 404 en rafraîchissant une page du jeu | Règle de réécriture absente | Render → le Static Site → **Redirects/Rewrites** : `/*` → `/index.html` (Rewrite). Un fichier `_redirects` ne sert à rien sur Render. |
| Le front ne voit pas une variable modifiée sur Render | Les `VITE_…` sont figées au build | **Manual Deploy → Clear build cache & deploy** |
| Une Edge Function renvoie 500 « supabaseUrl is required » | Code qui lit un autre nom de variable | Utiliser `Deno.env.get('SUPABASE_URL')` et `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` |
| `Module not found` au déploiement d'une fonction | Import sans extension, ou `.js` vers un `.ts` sans `sloppy-imports` | Vérifier `supabase/functions/deno.json` ; imports `.ts` dans `supabase/functions/` |
| Erreur CORS dans la console en appelant une fonction | Requête `OPTIONS` non gérée | Répondre au preflight avec `corsHeaders` ([doc 05 §4](05-API.md#4-code-commun)) |
| 401 sur toutes les fonctions | Pas de session anonyme au moment de l'appel | Appeler `signInAnonymously` avant, passer par `supabase.functions.invoke` |
| `import.meta.env.VITE_…` vaut `undefined` | Variable sans préfixe `VITE_` ou serveur non relancé | Vérifier le préfixe, relancer `npm run dev` |
| « Anonymous sign-ins are disabled » | Option non activée | Supabase → Authentication → activer les connexions anonymes |
| Aucun événement Realtime reçu | Table absente de la publication, RLS qui bloque, ou abonnement fait avant d'être participant | Vérifier la publication et la policy `select` ; s'abonner après le `join` |
| Realtime OK à la maison, KO à l'école | WebSockets filtrés par le réseau | Plan B polling ([doc 04 §10](04-MULTIJOUEUR.md#10-plan-b--polling)) ou partage de connexion 4G |
| Sprites flous | Lissage actif | `pixelArt: true` dans la config Phaser ; `image-rendering: pixelated` en CSS |
| Le jeu Phaser apparaît en double en dev | React StrictMode monte le composant 2 fois | `return () => game.destroy(true)` dans le `useLayoutEffect` |
| `new row violates row-level security policy` | Écriture client dans une table réservée à l'API | Passer par une Edge Function, ou vérifier `id = auth.uid()` |
| Projet Supabase « Paused » | 7 jours d'inactivité (offre gratuite) | Dashboard → **Restore project** (quelques minutes) |
| Logs d'une Edge Function | — | Supabase → **Edge Functions** → la fonction → **Logs** |
| Logs du build du front | — | Render → le Static Site → **Events** / **Logs** |
