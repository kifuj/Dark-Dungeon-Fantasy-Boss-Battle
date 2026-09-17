import { Link } from 'react-router-dom';
import { ELEMENT_LABELS } from '../../shared/data/elements.js';
import { SPECIES } from '../../shared/data/monsters.js';
import { RARITIES, RARITY_ORDER, speciesPower } from '../../shared/data/rarities.js';
import { REWARDS } from '../../shared/data/rewards.js';
import { SKILLS } from '../../shared/data/skills.js';
import { DEF_UP_MULT } from '../../shared/engine/battle.js';
import { CRIT_CHANCE } from '../../shared/engine/damage.js';
import { DRAFT_OFFER_SIZE, ONLINE_LEVEL, ONLINE_TEAM_SIZE, TURN_DURATION_MS } from '../../shared/engine/online.js';
import { MAX_TEAM_SIZE, REWARD_CHOICES } from '../../shared/engine/rewards.js';
import { BOSS_LEVEL_BONUS, BOSS_WAVE_EVERY, STARTER_IDS, STARTER_LEVEL, WAVE_HEAL, WAVE_WITH_TWO_ENEMIES } from '../../shared/engine/run.js';
import type { SkillDef } from '../../shared/types.js';

/**
 * Guide du jeu : les tableaux sont générés depuis `shared/data`, ils suivent donc
 * automatiquement les réglages du moteur, bestiaire et raretés compris.
 */

const isStarter = (id: string) => (STARTER_IDS as readonly string[]).includes(id);

const appearance = (id: string, rarity: keyof typeof RARITIES) => {
  if (isStarter(id)) return 'Starter';
  if (rarity === 'boss') return `Boss (vagues ${BOSS_WAVE_EVERY}, ${BOSS_WAVE_EVERY * 2}…)`;
  return `Dès la vague ${RARITIES[rarity].firstWave}`;
};

const EFFECT_LABELS: Record<NonNullable<SkillDef['effect']>, string> = {
  heal30: 'Soigne 30 % des PV max',
  drain50: 'Rend 50 % des dégâts infligés',
  defUp: `DEF ×${DEF_UP_MULT.toLocaleString('fr-FR')} (cumulable)`,
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
            <li>Chaque attaque a des <strong>PP</strong> (utilisations). À 0, elle n'est plus utilisable.</li>
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
            <li>Vague N : un ennemi niveau N. Sa rareté est tirée parmi les raretés déjà débloquées.</li>
            <li>À partir de la vague {WAVE_WITH_TWO_ENEMIES} : deux ennemis.</li>
            <li>
              Toutes les {BOSS_WAVE_EVERY} vagues : un <strong>boss</strong> seul, niveau N + {BOSS_LEVEL_BONUS}. Le butin de boss
              contient toujours la Relique.
            </li>
            <li>Le monstre sur le terrain à la fin d'une vague commence la suivante ; l'ordre de l'équipe ne change pas.</li>
            <li>Vous pouvez abandonner la run à tout moment pendant un combat.</li>
            <li>
              Après une victoire : PV et PP sont conservés, l'équipe récupère {percent(WAVE_HEAL)} de ses PV max (les KO restent KO).
            </li>
            <li>Vous choisissez ensuite 1 récompense parmi {REWARD_CHOICES}. Équipe de {MAX_TEAM_SIZE} monstres maximum.</li>
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

          <h2>Multijoueur</h2>
          <ul>
            <li>Chaque joueur choisit {ONLINE_TEAM_SIZE} monstres parmi {DRAFT_OFFER_SIZE} ; le premier choisi entre en combat.</li>
            <li>Tous les monstres sont niveau {ONLINE_LEVEL}. Les boss ne sont pas proposés.</li>
            <li>Quand un monstre tombe KO, son joueur choisit le remplaçant ; l'adversaire attend ce choix.</li>
            <li>{TURN_DURATION_MS / 1000} s par tour : sans réponse, une action est jouée automatiquement.</li>
            <li>Le premier joueur dont toute l'équipe est KO (ou qui abandonne) perd.</li>
          </ul>
        </div>
        <Link to="/menu" className="button back-button">
          <span>Retour au menu</span>
          <span className="button-arrow" aria-hidden="true">↩</span>
        </Link>
      </section>
    </main>
  );
}
