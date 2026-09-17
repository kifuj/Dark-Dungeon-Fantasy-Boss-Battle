# Crédits

Dark Dungeon Fantasy Boss battle est un projet étudiant non commercial. Merci aux artistes qui partagent leur travail.

> **Règle** : chaque asset présent dans `public/assets/` a une ligne ici, ajoutée dans la même PR. Recopier la licence **exacte** indiquée sur la page de l'auteur. Voir [08-CONVENTIONS §4](08-CONVENTIONS.md#4-assets-et-licences).

## Graphismes

| Asset / pack | Auteur | Lien | Licence | Utilisé pour | Dans le repo ? |
|---|---|---|---|---|---|
| Sprites des 20 monstres (`public/assets/sprites/monsters/`) | Équipe groupe 3 | `tools/art/monsters.mjs` | CC0 (création de l'équipe) | Tous les monstres du bestiaire | Oui |
| Icônes d'élément (`public/assets/ui/elements.png`) | Équipe groupe 3 | `tools/art/icons.mjs` | CC0 (création de l'équipe) | Encadrés de combat, cartes de starter | Oui |
| Décor de combat (`public/assets/backgrounds/dungeon.png`) | Équipe groupe 3 | `tools/art/background.mjs` | CC0 (création de l'équipe) | Fond de la scène de combat | Oui |

> **Choix du sprint 2** : plutôt que de redistribuer un pack itch.io dans un dépôt public (risque de licence,
> voir [08-CONVENTIONS §4](08-CONVENTIONS.md#4-assets-et-licences)), les images sont **dessinées par notre propre code**
> et régénérables avec `npm run assets`. Les PNG sont commités pour que le site Render n'ait rien à générer au build.

## Polices

Aucune police n'est téléchargée : le jeu utilise les polices déjà installées sur l'appareil (Georgia pour les titres, une police à chasse fixe pour les chiffres), et Phaser dessine les textes de combat avec la police `monospace` du navigateur.

## Sons et musiques

Le jeu n'a pas encore de son : l'US-25 (musique et effets sonores) est restée dans la réserve du Product Backlog.

## Bibliothèques

| Bibliothèque | Licence |
|---|---|
| Phaser | MIT |
| React | MIT |
| React Router | MIT |
| @supabase/supabase-js | MIT |
| Vite | MIT |
| Vitest | MIT |

## Inspiration

- *PokeRogue* et la série *Pokémon* (Game Freak / Nintendo / The Pokémon Company) pour le principe de combat. Aucun asset de ces jeux n'est utilisé.
