# 08 — Conventions d'équipe

## 1. Git

### Branches
- `main` : toujours déployable (production Render). **Aucun push direct.**
- Une branche par user story : `feat/US-19-tour-en-ligne`, `fix/US-07-barre-pv`, `docs/sprint-2`.
- Branches courtes : **fusionnées dans le sprint** où elles ont été ouvertes.

### Commits (Conventional Commits)

```
<type>(<portée>): <description à l'impératif>

feat(engine): ajoute la priorité des compétences
fix(api): renvoie 409 quand le tour est déjà résolu
docs(sprint-2): compte rendu du daily de 10h
chore(deps): installe vitest
```

Types : `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`.
Portées : `engine`, `game`, `ui`, `api`, `db`, `assets`, `sprint-N`.

### Pull Requests
- Titre : `US-19 — Jouer un tour en ligne`.
- Description : lien vers l'US, captures ou GIF si c'est visuel, **URL de preview Render**, étapes pour tester.
- **1 relecture minimum** par une autre personne avant de fusionner.
- On préfère « Squash and merge » pour garder un historique lisible.

### Qui touche à quoi (pour limiter les conflits)

| Dossier | Pôle principal |
|---|---|
| `shared/` | Moteur |
| `src/game/`, `public/assets/` | Jeu |
| `supabase/` (dont `supabase/functions/`) | Backend |
| `src/pages/`, `src/components/` | UI |
| `docs/agile/` | Scrum Master (tout le monde contribue) |

> `shared/types.ts` est utilisé par tout le monde : toute modification se fait dans une **PR dédiée et courte**, annoncée au daily.

## 2. Code

- **TypeScript strict**, pas de `any` non justifié.
- ESLint (fourni par le template Vite) + Prettier (valeurs par défaut, `singleQuote: true`).
- Nommage : `camelCase` pour les variables et fonctions, `PascalCase` pour les composants, scènes et types, `SCREAMING_CASE` pour les constantes, identifiants de données en `snake_case` (`quick_strike`).
- Code et identifiants en **anglais**, textes affichés au joueur en **français**.
- `shared/` : **aucun** import de React, Phaser, Supabase ou `Math.random`.
- `shared/` : imports relatifs **avec extension `.js`**. `supabase/functions/` (Deno) : imports relatifs **avec extension `.ts`**, paquets npm avec le préfixe `npm:`.
- Aucun secret dans le code. Les variables d'environnement sont documentées dans `.env.example`.

## 3. Organisation des assets

```
public/assets/
├─ sprites/monsters/<species_id>.png      # une spritesheet par espèce
├─ sprites/fx/                            # effets d'attaque
├─ ui/                                    # cadres, boutons, icônes d'éléments
├─ backgrounds/
├─ fonts/
└─ audio/{music,sfx}/
```

- Noms de fichiers en `snake_case`, identiques à l'`id` de l'espèce (`flying_eye.png`).
- Taille de cadre fixée au sprint 1 (recommandé : **64 × 64**), documentée dans `PreloadScene.ts`.
- Chaque asset ajouté → **une ligne dans [CREDITS.md](CREDITS.md)** dans la même PR.

## 4. Assets et licences

Le repo étant **public**, commiter un asset revient à le **redistribuer**. Même pour un projet non commercial :

| Licence | Commit dans le repo public ? | Obligation |
|---|---|---|
| **CC0** (0x72, Kenney, LuizMelo…) | ✅ Oui | Aucune (créditer reste une bonne pratique) |
| **CC-BY / OGA-BY** | ✅ Oui | Créditer l'auteur + lien vers la licence |
| **CC-BY-SA** | ✅ Oui | Créditer + partager les modifications sous la même licence |
| Licence itch.io « usage libre, **redistribution interdite** » (souvent le cas des packs payants, ou gratuits sans licence CC) | ⚠️ **Non** | Ne pas commiter : ajouter le dossier au `.gitignore` et le partager dans l'équipe par un autre moyen |
| Pas de licence indiquée | ❌ Non | Considérer l'asset comme non réutilisable |

> **Toujours ouvrir la page itch.io ou le fichier `LICENSE` du pack** et recopier la licence exacte dans `CREDITS.md`.

## 5. Documentation

- Tout ce qui est fait est écrit en Markdown (exigence du TP).
- `docs/agile/SPRINT-N.md` est mis à jour **pendant** le sprint (dailies toutes les heures), pas à la fin.
- Captures d'écran dans `docs/agile/captures/`, nommées `sprint-N-<quoi>.png`.
- Toute décision technique importante → une ligne dans le tableau ci-dessous.

### Journal des décisions

| Date | Décision | Raison | Qui |
|---|---|---|---|
| 15/09 | Temps réel via Supabase Realtime plutôt que des WebSockets maison | Ni l'hébergement du front ni les fonctions serveur ne gardent de connexion ouverte ; offre gratuite suffisante | Équipe |
| 15/09 | Moteur de combat partagé et déterministe (`shared/`) | Même code en solo et en multi, testable, empêche la triche | Équipe |
| 15/09 | Hébergement du front migré de Vercel vers **Render** (Static Site) : https://dark-dungeon-fantasy-boss-battle.onrender.com | Choix de l'équipe ; le projet tourne sur Render | Équipe |
| 15/09 | Serveur autoritaire en **Supabase Edge Functions** au lieu des Vercel Functions | Un Static Site Render n'exécute pas de code serveur ; un Web Service Render gratuit se met en veille ; les Edge Functions sont gratuites et déjà dans la stack | Équipe |
| | | | |
