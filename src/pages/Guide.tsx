import { Link } from 'react-router-dom';
import { ELEMENT_LABELS } from '../../shared/data/elements.js';
import { SPECIES } from '../../shared/data/monsters.js';
import { REWARDS } from '../../shared/data/rewards.js';
import { SKILLS } from '../../shared/data/skills.js';
import { DEF_UP_MULT } from '../../shared/engine/battle.js';
import { CRIT_CHANCE } from '../../shared/engine/damage.js';
import { DRAFT_OFFER_SIZE, ONLINE_LEVEL, ONLINE_TEAM_SIZE, TURN_DURATION_MS } from '../../shared/engine/online.js';
import { MAX_TEAM_SIZE, REWARD_CHOICES } from '../../shared/engine/rewards.js';
import { STARTER_LEVEL, WAVE_HEAL, WAVE_WITH_TWO_ENEMIES } from '../../shared/engine/run.js';
import type { SkillDef, SpeciesDef } from '../../shared/types.js';

/**
 * Guide du jeu : les tableaux sont générés depuis `shared/data`, ils suivent donc
 * automatiquement les réglages du moteur. Les boss ne sont pas listés : ils n'apparaissent pas en jeu.
 */

const RARITY_LABELS: Record<SpeciesDef['rarity'], string> = { starter: 'Starter', common: 'Commun', rare: 'Rare', boss: 'Boss' };
const RARITY_ORDER: SpeciesDef['rarity'][] = ['starter', 'common', 'rare'];

const EFFECT_LABELS: Record<NonNullable<SkillDef['effect']>, string> = {
  heal30: 'Soigne 30 % des PV max',
  drain50: 'Rend 50 % des dégâts infligés',
  defUp: `DEF ×${DEF_UP_MULT.toLocaleString('fr-FR')} (cumulable)`,
};

const skillEffect = (skill: SkillDef) =>
  [skill.priority ? 'Agit en premier' : null, skill.effect ? EFFECT_LABELS[skill.effect] : null].filter(Boolean).join(' · ') || '—';

const percent = (value: number) => `${Math.round(value * 100)} %`;

const monsters = Object.values(SPECIES)
  .filter((s) => s.rarity !== 'boss')
  .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));

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
            <li>Un monstre mis KO avant d'agir perd son action. Il est remplacé par le premier monstre en vie.</li>
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
          <p>Stats de base. Chaque niveau au-dessus du 1 ajoute 8 % à toutes les stats.</p>
          <Table
            head={['Monstre', 'Élément', 'Rang', 'PV', 'ATK', 'DEF', 'VIT', 'Attaques']}
            rows={monsters.map((m) => [
              m.name,
              ELEMENT_LABELS[m.element],
              RARITY_LABELS[m.rarity],
              m.base.hp,
              m.base.atk,
              m.base.def,
              m.base.spd,
              m.skills.map((id) => SKILLS[id].name).join(', '),
            ])}
          />

          <h2>Solo : les vagues</h2>
          <ul>
            <li>Vous commencez avec un starter niveau {STARTER_LEVEL}.</li>
            <li>Vague N : un ennemi niveau N, tiré parmi les monstres communs et rares.</li>
            <li>À partir de la vague {WAVE_WITH_TWO_ENEMIES} : deux ennemis.</li>
            <li>
              Après une victoire : PV et PP sont conservés, l'équipe récupère {percent(WAVE_HEAL)} de ses PV max (les KO restent KO).
            </li>
            <li>Vous choisissez ensuite 1 récompense parmi {REWARD_CHOICES}. Équipe de {MAX_TEAM_SIZE} monstres maximum.</li>
            <li>La partie s'arrête quand toute l'équipe est KO.</li>
          </ul>
          <Table head={['Récompense', 'Effet']} rows={Object.values(REWARDS).map((r) => [`${r.icon} ${r.name}`, r.description])} />

          <h2>Multijoueur</h2>
          <ul>
            <li>Chaque joueur choisit {ONLINE_TEAM_SIZE} monstres parmi {DRAFT_OFFER_SIZE} ; le premier choisi entre en combat.</li>
            <li>Tous les monstres sont niveau {ONLINE_LEVEL}.</li>
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
