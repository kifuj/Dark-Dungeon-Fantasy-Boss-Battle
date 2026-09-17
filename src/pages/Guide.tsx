import { Link } from 'react-router-dom';
import { ELEMENT_LABELS } from '../../shared/data/elements.js';
import { COMMON_EVOLUTION_LEVEL, EVOLVED_IDS, evolvesFrom, SPECIES, STARTER_EVOLUTION_LEVEL } from '../../shared/data/monsters.js';
import { RARITIES, RARITY_ORDER, speciesPower } from '../../shared/data/rarities.js';
import { REWARDS } from '../../shared/data/rewards.js';
import { SKILLS } from '../../shared/data/skills.js';
import { ATK_UP_MULT, DEF_UP_MULT } from '../../shared/engine/battle.js';
import { CRIT_CHANCE } from '../../shared/engine/damage.js';
import { DRAFT_OFFER_SIZE, ONLINE_LEVEL, ONLINE_TEAM_SIZE, TURN_DURATION_MS } from '../../shared/engine/online.js';
import { KILLS_PER_LEVEL } from '../../shared/engine/level.js';
import { MAX_TEAM_SIZE, RECRUIT_EVERY, REWARD_CHOICES } from '../../shared/engine/rewards.js';
import {
  BOSS_LEVEL_BONUS,
  BOSS_WAVE_EVERY,
  EARLY_LEVELS_PER_10_WAVES,
  FIRST_BOSS_LEVEL_BONUS,
  LATE_LEVELS_PER_10_WAVES,
  LATE_WAVE,
  STARTER_IDS,
  STARTER_LEVEL,
  TEAM_LEVEL_GAP,
  WAVE_HEAL,
  WAVE_WITH_TWO_ENEMIES,
} from '../../shared/engine/run.js';
import type { SkillDef } from '../../shared/types.js';

/**
 * Guide du jeu : les tableaux sont générés depuis `shared/data`, ils suivent donc
 * automatiquement les réglages du moteur, bestiaire et raretés compris.
 */

const isStarter = (id: string) => (STARTER_IDS as readonly string[]).includes(id);

const appearance = (id: string, rarity: keyof typeof RARITIES) => {
  if (isStarter(id)) return 'Starter';
  if (EVOLVED_IDS.has(id)) {
    const from = SPECIES[evolvesFrom(id)!];
    return `Évolution de ${from.name} (N.${from.evolution!.level})`;
  }
  if (rarity === 'boss') return `Boss (vagues ${BOSS_WAVE_EVERY}, ${BOSS_WAVE_EVERY * 2}…)`;
  return `Dès la vague ${RARITIES[rarity].firstWave}`;
};

const EFFECT_LABELS: Record<NonNullable<SkillDef['effect']>, string> = {
  heal30: 'Soigne 30 % des PV max',
  drain50: 'Rend 50 % des dégâts infligés',
  defUp: `DEF ×${DEF_UP_MULT.toLocaleString('fr-FR')} (cumulable)`,
  atkUp: `ATK ×${ATK_UP_MULT.toLocaleString('fr-FR')} (cumulable)`,
};

const skillEffect = (skill: SkillDef) =>
  [skill.priority ? 'Agit en premier' : null, skill.effect ? EFFECT_LABELS[skill.effect] : null].filter(Boolean).join(' · ') || '—';

const percent = (value: number) => `${Math.round(value * 100)} %`;

const monsters = Object.values(SPECIES).sort(
  (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) || speciesPower(a.base) - speciesPower(b.base),
);

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="md-table">
      <table>
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Guide() {
  return (
    <main className="page credits-page">
      <section className="panel credits-panel" aria-label="Guide du jeu">
        <p className="eyebrow">Tout ce qu'il faut savoir avant d'entrer</p>
        <h1>Guide</h1>
        <div className="markdown">
          <h2>Un tour de combat</h2>
          <ul>
            <li>Les deux joueurs choisissent une action, puis le tour se joue.</li>
            <li>
              Ordre : <strong>abandon</strong>, puis <strong>changement de monstre</strong>, puis les attaques
              prioritaires (<em>Frappe rapide</em>), puis la <strong>vitesse (VIT)</strong> la plus haute. Égalité : pile ou face.
            </li>
            <li>
              Un monstre mis KO avant d'agir perd son action. Son joueur <strong>choisit</strong> ensuite le monstre qui le remplace,
              avant le tour suivant.
            </li>
            <li>
              Chaque monstre a 3 attaques et la <strong>Frappe</strong>. Chaque attaque a des <strong>PP</strong> (utilisations) : à 0,
              elle n'est plus utilisable. La Frappe a des PP illimités.
            </li>
            <li>Les boosts d'ATK et de DEF durent jusqu'à la fin du combat.</li>
          </ul>

          <h2>Dégâts</h2>
          <p>
            <code>Puissance × ATK / DEF × (niveau + 10) / 60</code>, multiplié par :
          </p>
          <ul>
            <li>l'efficacité de l'élément (×2 ou ×0,5) ;</li>
            <li>×1,25 si l'attaque a le même élément que le monstre (hors Neutre) ;</li>
            <li>un aléa entre ×0,9 et ×1 ;</li>
            <li>×1,5 sur un coup critique (1 chance sur {Math.round(1 / CRIT_CHANCE)}).</li>
          </ul>

          <h2>Éléments</h2>
          <ul>
            <li>{ELEMENT_LABELS.feu} bat {ELEMENT_LABELS.nature}, {ELEMENT_LABELS.nature} bat {ELEMENT_LABELS.eau}, {ELEMENT_LABELS.eau} bat {ELEMENT_LABELS.feu}.</li>
            <li>{ELEMENT_LABELS.lumiere} et {ELEMENT_LABELS.ombre} se battent mutuellement (×2 dans les deux sens).</li>
            <li>Attaque forte : ×2. Attaque faible : ×0,5. {ELEMENT_LABELS.neutre} : toujours ×1.</li>
          </ul>

          <h2>Attaques</h2>
          <Table
            head={['Attaque', 'Élément', 'Puissance', 'PP', 'Effet']}
            rows={Object.values(SKILLS).map((s) => [s.name, ELEMENT_LABELS[s.element], s.power || '—', s.pp ?? '∞', skillEffect(s)])}
          />

          <h2>Monstres</h2>
          <p>
            Stats de base. Chaque niveau au-dessus du 1 ajoute 8 % à toutes les stats. La <strong>puissance</strong> est la somme
            des 4 stats : elle donne la rareté du monstre.
          </p>
          <Table
            head={['Monstre', 'Élément', 'Rareté', 'Puissance', 'Solo', 'PV', 'ATK', 'DEF', 'VIT', 'Attaques']}
            rows={monsters.map((m) => [
              m.name,
              ELEMENT_LABELS[m.element],
              RARITIES[m.rarity].label,
              speciesPower(m.base),
              appearance(m.id, m.rarity),
              m.base.hp,
              m.base.atk,
              m.base.def,
              m.base.spd,
              m.skills.map((id) => SKILLS[id].name).join(', '),
            ])}
          />

          <h2>Raretés</h2>
          <p>Plus un monstre est rare, plus il apparaît tard et meilleur est le butin quand on le bat.</p>
          <Table
            head={['Rareté', 'Puissance', 'Apparition', 'Chance relative', 'Butin débloqué']}
            rows={RARITY_ORDER.map((id) => [
              RARITIES[id].label,
              `${RARITIES[id].minPower} et plus`,
              id === 'boss' ? `Toutes les ${BOSS_WAVE_EVERY} vagues` : `Dès la vague ${RARITIES[id].firstWave}`,
              id === 'boss' ? '—' : RARITIES[id].weight,
              Object.values(REWARDS)
                .filter((r) => r.minLoot === RARITIES[id].loot)
                .map((r) => r.name)
                .join(', ') || '—',
            ])}
          />

          <h2>Solo : les vagues</h2>
          <ul>
            <li>Vous commencez avec un starter niveau {STARTER_LEVEL}.</li>
            <li>
              Vague 1 : un ennemi commun qui n'a ni avantage ni résistance face aux starters. Sa rareté est ensuite tirée parmi les
              raretés déjà débloquées.
            </li>
            <li>
              Les ennemis gagnent {EARLY_LEVELS_PER_10_WAVES / 10} niveau par vague jusqu'à la vague {LATE_WAVE}, puis{' '}
              {LATE_LEVELS_PER_10_WAVES / 10} : la fin de run se durcit. Ils ne restent jamais plus de {TEAM_LEVEL_GAP} niveaux sous
              le niveau moyen de votre équipe.
            </li>
            <li>À partir de la vague {WAVE_WITH_TWO_ENEMIES} : deux ennemis.</li>
            <li>
              Toutes les {BOSS_WAVE_EVERY} vagues : un <strong>boss</strong> seul, {BOSS_LEVEL_BONUS} niveau au-dessus des ennemis
              de la vague (le premier, {-FIRST_BOSS_LEVEL_BONUS} niveau en dessous). Le butin de boss contient toujours la Relique.
            </li>
            <li>Le monstre sur le terrain à la fin d'une vague commence la suivante ; l'ordre de l'équipe ne change pas.</li>
            <li>Vous pouvez abandonner la run à tout moment pendant un combat.</li>
            <li>
              Un monstre gagne 1 niveau tous les {KILLS_PER_LEVEL[0]} puis {KILLS_PER_LEVEL[1]} ennemis mis KO (en alternance, en solo
              seulement).
            </li>
            <li>
              Évolutions : les starters évoluent au niveau {STARTER_EVOLUTION_LEVEL}, les monstres communs au niveau{' '}
              {COMMON_EVOLUTION_LEVEL}. Les ennemis communs de haut niveau arrivent déjà évolués.
            </li>
            <li>
              Après une victoire : PV et PP sont conservés, l'équipe récupère {percent(WAVE_HEAL)} de ses PV max (les KO restent KO).
            </li>
            <li>
              Vous choisissez ensuite 1 récompense parmi {REWARD_CHOICES}. Équipe de {MAX_TEAM_SIZE} monstres maximum. Le recrutement
              est proposé au moins une vague sur {RECRUIT_EVERY}, et la recrue arrive au niveau moyen de votre équipe.
            </li>
            <li>Le parchemin montre la compétence apprise ; vous choisissez celle à oublier (jamais la Frappe).</li>
            <li>La partie s'arrête quand toute l'équipe est KO.</li>
          </ul>
          <Table
            head={['Récompense', 'Effet', 'Après un monstre']}
            rows={Object.values(REWARDS).map((r) => [
              `${r.icon} ${r.name}`,
              r.description,
              r.minLoot === 0 ? 'Tous' : `${RARITIES[RARITY_ORDER[r.minLoot]].label} ou plus`,
            ])}
          />

          <h2>Contrôles au clavier</h2>
          <ul>
            <li>Flèches (ou Tab) pour se déplacer, Entrée ou Espace pour valider, Échap pour revenir.</li>
            <li>Touches 1 à 6 : la carte ou la compétence numérotée. V : valider le starter ou l'équipe. C : changer de monstre.</li>
            <li>M : couper ou remettre la musique. R : revanche en fin de duel.</li>
          </ul>

          <h2>Multijoueur</h2>
          <ul>
            <li>Chaque joueur choisit {ONLINE_TEAM_SIZE} monstres parmi {DRAFT_OFFER_SIZE} ; le premier choisi entre en combat.</li>
            <li>Tous les monstres sont niveau {ONLINE_LEVEL}. Les boss et les évolutions ne sont pas proposés, et on ne gagne pas de niveau.</li>
            <li>Quand un monstre tombe KO, son joueur choisit le remplaçant ; l'adversaire attend ce choix.</li>
            <li>{TURN_DURATION_MS / 1000} s par tour : sans réponse, une action est jouée automatiquement.</li>
            <li>Le premier joueur dont toute l'équipe est KO (ou qui abandonne) perd.</li>
            <li>En fin de duel, « Revanche » relance un match dans le même salon, sans nouveau code.</li>
          </ul>
        </div>
        <Link to="/menu" className="button back-button" data-shortcut="back">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
