# 07 — Installation et déploiement

## 0. Prérequis

| Outil | Version | Vérifier |
|---|---|---|
| Node.js | 22 ou 24 (LTS) | `node -v` |
| npm | fourni avec Node | `npm -v` |
| Git | récent | `git --version` |
| Comptes | GitHub, [Vercel](https://vercel.com) (connexion avec GitHub), [Supabase](https://supabase.com) | — |

## 1. Créer le projet (une seule fois, par une personne)

```bash
cd rogue-arena                       # dossier qui contient déjà README.md et docs/
npm create vite@latest . -- --template react-ts
# si Vite signale que le dossier n'est pas vide → choisir "Ignore files and continue"

npm install
npm install phaser @supabase/supabase-js react-router-dom
npm install -D vitest @vercel/node vercel
```

Créer les dossiers :

```bash
mkdir -p api/_lib api/rooms api/match shared/data shared/engine shared/tests \
         src/game/scenes src/lib src/pages src/components \
         public/assets/sprites public/assets/ui public/assets/fonts public/assets/audio \
         supabase/migrations
```

### `package.json` (scripts)

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:full": "vercel dev",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint ."
  }
}
```

### TypeScript : inclure `shared/`

Dans `tsconfig.app.json`, ajouter `shared` à `include` :

```json
{ "include": ["src", "shared"] }
```

Créer `api/tsconfig.json` (typage des fonctions) :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["./**/*.ts", "../shared/**/*.ts"]
}
```

> Si `types: ["node"]` provoque une erreur, installer `npm i -D @types/node`.

### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

> Cette réécriture renvoie toutes les routes du front (`/match/123`…) vers `index.html`, sans toucher à `/api/*`. Sans elle, un rafraîchissement sur `/match/123` donne une 404.

### `.env.example` (à commiter)

```bash
# --- Client (exposées au navigateur, préfixe VITE_) ---
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# --- Serveur uniquement (Vercel Functions) ---
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxx
```

### `.gitignore` (vérifier la présence de)

```
node_modules
dist
.env
.env.local
.env*.local
.vercel
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

1. **New project** : nom `rogue-arena`, région **Europe West (Paris)**, noter le mot de passe de la BDD.
2. **SQL Editor → New query** : coller `supabase/migrations/001_init.sql` ([doc 03](03-BASE-DE-DONNEES.md#2-migration-sql)) puis **Run**.
3. **Authentication → Sign In / Providers** : activer **Allow anonymous sign-ins**.
4. **Database → Publications** : vérifier que `rooms` et `matches` sont dans `supabase_realtime`.
5. **Project Settings → API Keys** : copier l'URL du projet, la clé publishable et la clé secret.

Test rapide de connexion anonyme (dans l'app ou la console du navigateur) :

```ts
const { data, error } = await supabase.auth.signInAnonymously();
console.log(data.user?.id, error);
```

## 3. GitHub

```bash
git init
git add .
git commit -m "chore: initialisation du projet"
git branch -M main
git remote add origin https://github.com/<organisation-ou-pseudo>/rogue-arena.git
git push -u origin main
```

- Repo **public** (exigé par le TP) → relire [08-CONVENTIONS §4](08-CONVENTIONS.md#4-assets-et-licences) avant de commiter des assets.
- *Settings → Collaborators* : ajouter les membres de l'équipe.
- *Settings → Branches* : protéger `main` (PR obligatoire, 1 relecture).

## 4. Vercel

### 4.1 Premier déploiement
1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → choisir `rogue-arena`.
2. Framework Preset : **Vite** (détecté automatiquement). Build : `npm run build`. Output : `dist`.
3. **Environment Variables** : ajouter les **4 variables** de `.env.example` pour *Production*, *Preview* **et** *Development*.
4. **Deploy**.
5. *Project Settings → Functions → Function Region* : **Paris (cdg1)**, pour être proche de Supabase.

### 4.2 Déploiements suivants
- Push sur `main` → déploiement en **production** automatique.
- Chaque PR → une **URL de preview** unique, à tester avant de fusionner (ça fait partie de la DoD).

## 5. Développement local

```bash
npx vercel login
npx vercel link                  # lier le dossier au projet Vercel
npx vercel env pull .env.local   # récupère les variables "Development"
npx vercel dev                   # front (Vite) + /api sur http://localhost:3000
```

| Commande | Quand l'utiliser |
|---|---|
| `npx vercel dev` | Tout ce qui touche à `/api` (multijoueur) |
| `npm run dev` | Travail sur le front ou Phaser uniquement, plus rapide (les appels `/api` échouent) |
| `npm test` | Moteur de combat en mode watch |
| `npm run build` | Vérifier que le build passe **avant chaque PR** |

## 6. Checklist de mise en production

- [ ] `npm run build` passe en local
- [ ] `npx vitest run` passe
- [ ] Les 4 variables d'environnement sont présentes sur Vercel
- [ ] La preview de la PR est testée : connexion, solo, multi sur 2 navigateurs
- [ ] Aucune clé secrète dans le code (`git grep -n "sb_secret"` ne renvoie rien)
- [ ] `docs/CREDITS.md` est à jour si des assets ont été ajoutés
- [ ] Le dashboard Supabase a été ouvert récemment (projet non mis en pause)

## 7. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| 404 en rafraîchissant une page du jeu | Réécriture SPA absente | Ajouter `rewrites` dans `vercel.json` |
| `/api/...` renvoie 500 « supabaseUrl is required » | Variables serveur absentes | Les ajouter sur Vercel puis **redéployer** (les variables ne s'appliquent qu'aux nouveaux déploiements) |
| `ERR_MODULE_NOT_FOUND` dans les logs d'une Function | Import relatif sans extension | Écrire `from './turns.js'` dans `api/` et `shared/` |
| `import.meta.env.VITE_…` vaut `undefined` | Variable sans préfixe `VITE_` ou serveur non relancé | Vérifier le préfixe, relancer `vercel dev` |
| « Anonymous sign-ins are disabled » | Option non activée | Supabase → Authentication → activer les connexions anonymes |
| Aucun événement Realtime reçu | Table absente de la publication, RLS qui bloque, ou abonnement fait avant d'être participant | Vérifier la publication et la policy `select` ; s'abonner après le `join` |
| Realtime OK à la maison, KO à l'école | WebSockets filtrés par le réseau | Plan B polling ([doc 04 §10](04-MULTIJOUEUR.md#10-plan-b--polling)) ou partage de connexion 4G |
| Sprites flous | Lissage actif | `pixelArt: true` dans la config Phaser ; `image-rendering: pixelated` en CSS |
| Le jeu Phaser apparaît en double en dev | React StrictMode monte le composant 2 fois | `return () => game.destroy(true)` dans le `useLayoutEffect` |
| `new row violates row-level security policy` | Écriture client dans une table réservée à l'API | Passer par `/api`, ou vérifier `id = auth.uid()` |
| Projet Supabase « Paused » | 7 jours d'inactivité (offre gratuite) | Dashboard → **Restore project** (quelques minutes) |
| Logs d'une Function | — | Vercel → projet → **Logs** (filtrer par `/api/match/action`) |
